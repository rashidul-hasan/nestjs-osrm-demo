# 🚀 NestJS + OSRM Delivery Routing Demo

A microservice demo showing how to use **OSRM** (Open Source Routing Machine) with **NestJS** for a delivery app — featuring route finding, distance/ETA calculation, delivery fee estimation, and real-time vehicle simulation via WebSocket.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│   Browser (WebSocket + HTTP)    │    REST Client / Postman  │
└────────────────┬────────────────┴───────────────┬───────────┘
                 │ HTTP / WebSocket                │ HTTP
                 ▼                                 ▼
┌────────────────────────────────────────────────────────────┐
│                   API Gateway  :3000                        │
│  • REST controllers (routing, delivery)                     │
│  • WebSocket gateway (Socket.IO /delivery)                  │
│  • Delivery simulation engine                               │
└──────────────────────────┬─────────────────────────────────┘
                            │ TCP :3001
                            ▼
┌────────────────────────────────────────────────────────────┐
│               Routing Microservice :3001                    │
│  • OSRM service (route, nearest, table)                     │
│  • Nominatim service (geocode, reverse geocode)             │
│  • Delivery service (fee calc, multi-vehicle compare)       │
└──────────────────────────┬─────────────────────────────────┘
                            │ HTTP
           ┌────────────────┴────────────────┐
           ▼                                 ▼
┌─────────────────────┐         ┌────────────────────────────┐
│  OSRM Backend :5000  │         │  Nominatim (public API)    │
│  (Monaco dataset)   │         │  nominatim.openstreetmap   │
└─────────────────────┘         └────────────────────────────┘
```

## Quick Start

### Step 1 — Process OSRM Map Data

Run once to download and pre-process the Monaco map:

```bash
chmod +x setup-osrm.sh
./setup-osrm.sh
```

### Step 2 — Start Everything

```bash
docker compose up --build
```

Services:
| Service | URL |
|---|---|
| API Gateway (HTTP) | http://localhost:3000 |
| API Gateway (WebSocket) | ws://localhost:3000/delivery |
| OSRM Backend | http://localhost:5000 |

### Step 3 — Open the Simulator

Open `public/index.html` in your browser (or `http://localhost:3000/...` if you serve it).

## Local Development (without Docker)

```bash
# Terminal 1 — Start OSRM
docker compose up osrm-backend

# Terminal 2 — Start Routing Microservice
cd routing-service
npm install
npm run start:dev

# Terminal 3 — Start API Gateway
cd api-gateway
npm install
npm run start:dev
```

## API Endpoints

### Routing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/routing/route` | Get best route between 2 points |
| POST | `/routing/nearest` | Find nearest road to a coordinate |
| POST | `/routing/geocode` | Address → Coordinates (Nominatim) |
| POST | `/routing/reverse-geocode` | Coordinates → Address (Nominatim) |
| POST | `/routing/table` | Distance/duration matrix |

### Delivery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/delivery/vehicle-types` | List vehicles with fee config |
| POST | `/delivery/estimate` | Calculate fee + ETA for one vehicle |
| POST | `/delivery/compare` | Compare all vehicles, sorted by price |

### WebSocket (`ws://localhost:3000/delivery`)

| Event (emit) | Payload | Description |
|---|---|---|
| `simulate_delivery` | `{origin, destination, vehicleType, speedFactor}` | Start simulation |
| `stop_simulation` | — | Stop running simulation |
| `ping` | — | Test connection |

| Event (listen) | Description |
|---|---|
| `connected` | Confirmed connection |
| `simulation_started` | Route calculated, sim beginning |
| `delivery_location_update` | Current position + progress |
| `delivery_completed` | Delivery done |
| `simulation_error` | Error during simulation |

## Vehicle Types & Fee Structure

| Vehicle | Profile | Speed Multiplier | Base | /km | /min |
|---------|---------|-----------------|------|-----|------|
| 🏍️ Motorbike | driving | 0.85× (faster) | 30 | 10 | 1.5 |
| 🚗 Car | driving | 1.0× | 50 | 15 | 2.0 |
| 🛵 Scooter | driving | 0.9× | 35 | 12 | 1.5 |
| 🚲 Bicycle | cycling | 1.0× | 20 | 6 | 1.0 |
| 🚚 Truck | driving | 1.3× (slower) | 150 | 30 | 4.0 |

Fee formula: `Total = (Base + Distance×perKm + Minutes×perMin) × surgeMult`

## OSRM Profiles

OSRM ships with three routing profiles:
- **`driving`** — Car routing (used for car, motorbike, scooter, truck)
- **`cycling`** — Bicycle routing (uses bike lanes, prefers flat roads)
- **`walking`** — Pedestrian routing

For the Monaco dataset, all three profiles are available.

## Key Concepts Demonstrated

1. **NestJS Microservices (TCP transport)** — API Gateway → Routing Service
2. **OSRM Route API** — shortest/fastest path, turn-by-turn steps, geometry
3. **OSRM Table API** — distance/duration matrix between N points
4. **OSRM Nearest API** — snap arbitrary coordinates to the road network
5. **Nominatim Geocoding** — address search and reverse geocoding
6. **WebSocket simulation** — real-time vehicle movement along a route
7. **Delivery fee calculation** — base + per-km + per-minute + surge pricing
8. **Multi-vehicle comparison** — compare all vehicles for the same route
