import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { firstValueFrom, timeout } from 'rxjs';
import { VehicleType } from '../common/interfaces/vehicle.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/delivery',
})
export class DeliveryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(DeliveryGateway.name);
  private activeSimulations = new Map<string, NodeJS.Timeout>();

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('ROUTING_SERVICE') private readonly routingClient: ClientProxy,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { message: 'Connected to Delivery Gateway', clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.stopSimulation(client.id);
  }

  @SubscribeMessage('simulate_delivery')
  async handleSimulateDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      origin: { lat: number; lon: number };
      destination: { lat: number; lon: number };
      vehicleType: VehicleType;
      speedFactor?: number; // 1 = realtime, 10 = 10x faster
    },
  ) {
    const { origin, destination, vehicleType, speedFactor = 20 } = payload;

    this.logger.log(`Starting delivery simulation for client ${client.id}`);

    // Stop any existing simulation for this client
    this.stopSimulation(client.id);

    try {
      // Get delivery estimate from routing service
      client.emit('simulation_status', {
        status: 'calculating_route',
        message: 'Calculating best route...',
      });

      const estimate = await firstValueFrom(
        this.routingClient
          .send('calculate_delivery', { origin, destination, vehicleType })
          .pipe(timeout(15000)),
      );

      client.emit('simulation_started', {
        estimate,
        message: `Route calculated! Starting ${vehicleType} delivery simulation...`,
        totalPoints: estimate.route.geometry.coordinates.length,
      });

      // Simulate movement along the route
      const coordinates: [number, number][] = estimate.route.geometry.coordinates;
      let currentIndex = 0;
      const totalPoints = coordinates.length;
      // Interval based on duration and number of points, adjusted by speedFactor
      const totalDurationMs = estimate.adjustedDurationSeconds * 1000;
      const intervalMs = Math.max(200, (totalDurationMs / totalPoints) / speedFactor);

      const simulationInterval = setInterval(() => {
        if (currentIndex >= totalPoints) {
          clearInterval(simulationInterval);
          this.activeSimulations.delete(client.id);
          client.emit('delivery_completed', {
            message: 'Delivery completed!',
            finalLocation: {
              lon: coordinates[totalPoints - 1][0],
              lat: coordinates[totalPoints - 1][1],
            },
            estimate,
          });
          return;
        }

        const [lon, lat] = coordinates[currentIndex];
        const progressPercent = Math.round((currentIndex / totalPoints) * 100);
        const remainingPoints = totalPoints - currentIndex;
        const remainingSeconds = Math.round(
          (remainingPoints / totalPoints) * estimate.adjustedDurationSeconds,
        );

        client.emit('delivery_location_update', {
          currentLocation: { lat, lon },
          progress: progressPercent,
          remainingSeconds,
          remainingMinutes: Math.ceil(remainingSeconds / 60),
          pointIndex: currentIndex,
          totalPoints,
          vehicleType,
        });

        currentIndex++;
      }, intervalMs);

      this.activeSimulations.set(client.id, simulationInterval);
    } catch (err) {
      this.logger.error(`Simulation error for ${client.id}:`, err.message);
      client.emit('simulation_error', {
        message: 'Failed to start simulation: ' + err.message,
      });
    }
  }

  @SubscribeMessage('stop_simulation')
  handleStopSimulation(@ConnectedSocket() client: Socket) {
    this.stopSimulation(client.id);
    client.emit('simulation_status', { status: 'stopped', message: 'Simulation stopped' });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  private stopSimulation(clientId: string) {
    const existing = this.activeSimulations.get(clientId);
    if (existing) {
      clearInterval(existing);
      this.activeSimulations.delete(clientId);
    }
  }
}
