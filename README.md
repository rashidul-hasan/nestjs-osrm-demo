# 🚀 NestJS + OSRM Delivery Routing Demo

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="OpenStreetMap" />
  <img src="https://img.shields.io/badge/OSRM-0099cc?style=for-the-badge&logoColor=white" alt="OSRM" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  A full-stack <strong>NestJS microservice demo</strong> integrating <strong>OSRM</strong> (Open Source Routing Machine)
  and <strong>Nominatim</strong> geocoding for a delivery app backend — with real-time vehicle simulation over WebSocket.
</p>

<p align="center">
  <strong>Route finding · Distance in km · ETA per vehicle type · Delivery fee calculator · Live map simulation</strong>
</p>

---

## 📖 What Is This?

This project demonstrates how to integrate **OSRM** with a **NestJS microservices** architecture to power the backend of an order delivery application. It covers the core geospatial operations you need to calculate delivery fees and ETAs:

- 🗺️ **Optimal routing** between pickup and dropoff coordinates (driving, cycling, walking profiles)
- 📏 **Distance** in metres and kilometres from real road network data
- ⏱️ **ETA calculation** adjusted per vehicle type (motorbike, car, scooter, bicycle, truck)
- 💰 **Delivery fee estimation** — base fee + per-km rate + per-minute rate + surge multiplier
- ⚖️ **Multi-vehicle comparison** — compare all vehicle options for a single route in one call
- 📍 **Geocoding & reverse geocoding** via Nominatim / OpenStreetMap
- 🛵 **Real-time delivery simulation** — watch a vehicle move along the actual road geometry on a live map

---

## 🎯 Who Is This For?

This demo is a practical starting point for developers building:

| Use Case | How This Helps |
|---|---|
| 🍕 **Food delivery apps** (like Foodpanda, Uber Eats) | Route API + fee calculation per vehicle |
| 📦 **Courier & parcel services** | Distance matrix, multi-stop routing |
| 🛒 **E-commerce last-mile delivery** | ETA estimation, vehicle type selection |
| 🚖 **Ride-hailing backends** | Nearest road snapping, real-time tracking simulation |
| 🏗️ **Logistics & fleet management** | Table API for N×N distance/duration matrix |
| 📚 **Learning NestJS microservices** | TCP transport, MessagePattern, ClientProxy |
| 📚 **Learning OSRM with Node.js** | Route, Nearest, Table API integration |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│   Browser (WebSocket + HTTP)    │    REST Client / Postman  │
└────────────────┬────────────────┴───────────────┬───────────┘
                 │ HTTP / WebSocket (Socket.IO)    │ HTTP REST
                 ▼                                 ▼
┌────────────────────────────────────────────────────────────┐
│                   API Gateway  :3000                        │
│  • REST controllers  (routing, delivery)                    │
│  • WebSocket gateway (Socket.IO namespace /delivery)        │
│  • Delivery simulation engine (interpolates route points)   │
│  • Serves simulator UI (public/index.html)                  │
└──────────────────────────┬─────────────────────────────────┘
                            │ NestJS TCP Microservice :3001
                            ▼
┌────────────────────────────────────────────────────────────┐
│               Routing Microservice :3001                    │
│  • OsrmService    — /route, /nearest, /table HTTP calls     │
│  • NominatimService — geocode, reverse-geocode              │
│  • RoutingService — clean RouteResult transformer           │
│  • DeliveryService — fee calc, surge pricing, comparisons   │
└──────────────────────────┬─────────────────────────────────┘
                            │ HTTP
           ┌────────────────┴────────────────┐
           ▼                                 ▼
┌─────────────────────┐         ┌────────────────────────────┐
│  OSRM Backend :5000  │         │  Nominatim (public API)    │
│  Monaco OSM dataset │         │  nominatim.openstreetmap   │
│  Driving + Cycling  │         │  Search + Reverse geocode  │
└─────────────────────┘         └────────────────────────────┘
```

**Communication pattern:** The API Gateway never talks to OSRM directly. All geospatial logic lives in the Routing Microservice, which the gateway reaches via NestJS TCP `ClientProxy.send()` / `@MessagePattern`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [NestJS](https://nestjs.com) v10 — TypeScript-first Node.js framework |
| **Microservice transport** | NestJS TCP — direct socket between services |
| **Routing engine** | [OSRM](https://project-osrm.org) — C++ routing engine on OpenStreetMap data |
| **Geocoding** | [Nominatim](https://nominatim.org) — OpenStreetMap address search & reverse geocoding |
| **Map data** | [OpenStreetMap](https://openstreetmap.org) via Geofabrik extracts |
| **Real-time** | [Socket.IO](https://socket.io) WebSocket — live vehicle position updates |
| **Map UI** | [Leaflet.js](https://leafletjs.com) — interactive map in browser |
| **HTTP client** | [Axios](https://axios-http.com) — OSRM & Nominatim API calls |
| **Validation** | class-validator + class-transformer — DTO validation |
| **Containerisation** | Docker + Docker Compose — one-command startup |
| **Language** | TypeScript 5 |
| **Runtime** | Node.js 20 (Alpine) |

---

## ✅ Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2
- `curl` (for the OSRM data download script)
- ~500 MB disk space for the Monaco OSM dataset

> **No Node.js required on your host** to run via Docker. For local development outside Docker, Node.js ≥ 18 is needed.

---

## 🚀 Quick Start

### Step 1 — Process OSRM Map Data (run once)

Downloads the Monaco OSM extract (~500 KB) and runs the three-stage OSRM pre-processing pipeline (`osrm-extract` → `osrm-partition` → `osrm-customize`) inside Docker:

```bash
chmod +x setup-osrm.sh
./setup-osrm.sh
```

> The processed `.osrm` files are written to `./data/` and reused on every subsequent `docker compose up`.

### Step 2 — Start All Services

```bash
docker compose up --build
```

| Service | URL | Description |
|---|---|---|
| **API Gateway** | http://localhost:3000 | REST API + WebSocket + Simulator UI |
| **Simulator UI** | http://localhost:3000/index.html | Interactive delivery map |
| **OSRM Backend** | http://localhost:5000 | Raw OSRM API (optional direct access) |

### Step 3 — Open the Delivery Simulator

Visit **http://localhost:3000/index.html** in your browser.

- Click the map to set **pickup** (📦) then **dropoff** (🏁), or use a preset
- Choose a vehicle type (🏍️ 🚗 🛵 🚲 🚚)
- Hit **Start Delivery Simulation** — a marker animates along the real road geometry with live ETA and fee updates

---

## 💻 Local Development (without Docker)

```bash
# Terminal 1 — OSRM backend only via Docker
docker compose up osrm-backend

# Terminal 2 — Routing Microservice
cd routing-service
npm install
npm run start:dev

# Terminal 3 — API Gateway
cd api-gateway
npm install
npm run start:dev
```

Open http://localhost:3000/index.html — the gateway serves the simulator HTML from `../public/`.

---

## 📡 API Reference

### Routing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/routing/route` | Best route between 2 coordinates (driving/cycling/walking) |
| `POST` | `/routing/nearest` | Snap a coordinate to the nearest road |
| `POST` | `/routing/geocode` | Address string → lat/lon (Nominatim) |
| `POST` | `/routing/reverse-geocode` | lat/lon → human-readable address (Nominatim) |
| `POST` | `/routing/table` | Duration + distance matrix for N coordinates |

**Example — Find route:**
```json
POST /routing/route
{
  "origin":      { "lat": 43.7384, "lon": 7.4246 },
  "destination": { "lat": 43.7269, "lon": 7.4147 },
  "profile": "driving"
}
```

**Example response (abridged):**
```json
{
  "success": true,
  "data": {
    "distance_km": 2.34,
    "duration_minutes": 5.2,
    "geometry": { "type": "LineString", "coordinates": [[7.4246, 43.7384], ["..."]] },
    "legs": [{ "steps": [{ "maneuver": "turn", "name": "Avenue de la Costa", "distance": 120 }] }],
    "waypoints": [{ "name": "Avenue de la Costa", "location": [7.4246, 43.7384] }]
  }
}
```

### Delivery Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/delivery/vehicle-types` | All vehicle configs with fee rates |
| `POST` | `/delivery/estimate` | Full estimate — route + ETA + fee for one vehicle |
| `POST` | `/delivery/compare` | Compare all vehicles for a route (sorted cheapest first) |

**Example — Delivery estimate:**
```json
POST /delivery/estimate
{
  "origin":      { "lat": 43.7384, "lon": 7.4246 },
  "destination": { "lat": 43.7269, "lon": 7.4147 },
  "vehicleType": "motorbike",
  "currency": "BDT"
}
```

### WebSocket Events (`ws://localhost:3000/delivery`)

| Direction | Event | Payload |
|---|---|---|
| **→ emit** | `simulate_delivery` | `{ origin, destination, vehicleType, speedFactor }` |
| **→ emit** | `stop_simulation` | — |
| **→ emit** | `ping` | — |
| **← listen** | `connected` | `{ clientId }` |
| **← listen** | `simulation_started` | Full `DeliveryEstimate` object |
| **← listen** | `delivery_location_update` | `{ currentLocation, progress, remainingMinutes }` |
| **← listen** | `delivery_completed` | `{ finalLocation, estimate }` |
| **← listen** | `simulation_error` | `{ message }` |

---

## 🚗 Vehicle Types & Fee Structure

| Vehicle | OSRM Profile | Speed Adj. | Base fee | Per km | Per min |
|---------|-------------|------------|----------|--------|---------|
| 🏍️ **Motorbike** | driving | 0.85× faster | 30 | 10 | 1.5 |
| 🚗 **Car** | driving | 1.0× (baseline) | 50 | 15 | 2.0 |
| 🛵 **Scooter** | driving | 0.9× | 35 | 12 | 1.5 |
| 🚲 **Bicycle** | cycling | 1.0× | 20 | 6 | 1.0 |
| 🚚 **Truck** | driving | 1.3× slower | 150 | 30 | 4.0 |

**Fee formula:**
```
total = (baseFee + distanceKm × perKmFee + durationMin × perMinFee) × surgeMult
```
Surge multiplier: `1.2×` for trips over 20 km, `1.1×` for trips under 1 km.

> All fee values are in the requested currency unit (default: `BDT`). Swap `currency` in the request to adapt to any market.

---

## 🗺️ OSRM Profiles

OSRM ships with three built-in routing profiles:

| Profile | Used for | Characteristics |
|---|---|---|
| `driving` | Car, Motorbike, Scooter, Truck | Uses roads, respects turn restrictions, one-ways |
| `cycling` | Bicycle | Prefers bike lanes, avoids motorways |
| `walking` | Pedestrian | Footpaths, pedestrian zones |

All three profiles are pre-processed for the Monaco dataset.

---

## 💡 Key Concepts Demonstrated

1. **NestJS Microservices — TCP transport** — `ClientsModule`, `ClientProxy.send()`, `@MessagePattern` and `@Payload` decorators
2. **OSRM Route API** — fastest-path routing, GeoJSON geometry, turn-by-turn step instructions
3. **OSRM Table API** — full N×N duration and distance matrix for multiple coordinates
4. **OSRM Nearest API** — snapping arbitrary GPS coordinates to the road network
5. **Nominatim geocoding** — free address-to-coordinates and coordinates-to-address lookups
6. **Vehicle-specific ETAs** — applying speed multipliers to OSRM's raw duration estimate
7. **Delivery fee calculation** — composable pricing model (base + distance + time + surge)
8. **Multi-vehicle comparison** — `Promise.allSettled` across all vehicle types in parallel
9. **WebSocket delivery simulation** — interpolating GeoJSON coordinates into a real-time moving marker
10. **NestJS static file serving** — `useStaticAssets` serving the simulator HTML from the gateway

---

## 📁 Project Structure

```
nestjs-osrm-demo/
├── docker-compose.yml          # All services wired together
├── setup-osrm.sh               # One-shot OSRM data download + preprocessing
├── .env / .env.example         # Environment variable templates
├── api-test.http               # 13 ready-to-run requests (VS Code REST Client)
├── public/
│   └── index.html              # Leaflet.js + Socket.IO delivery simulator UI
├── api-gateway/                # NestJS HTTP + WebSocket app (port 3000)
│   └── src/
│       ├── routing/            # /routing/* REST endpoints
│       ├── delivery/           # /delivery/* REST endpoints
│       └── gateways/
│           └── delivery.gateway.ts   # WebSocket simulation engine
└── routing-service/            # NestJS TCP microservice (port 3001)
    └── src/
        ├── osrm/               # OSRM HTTP API wrapper (axios)
        ├── nominatim/          # Nominatim geocoding wrapper
        ├── routing/            # RouteResult transformer + controller
        ├── delivery/           # Fee calc, ETA adj, multi-vehicle compare
        └── config/
            └── vehicle.config.ts     # Fee tables for all 5 vehicle types
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<!-- SEO keywords — used by search engines and GitHub code search -->
<!--
Keywords: nestjs osrm, osrm nodejs, osrm typescript, nestjs microservices example,
nestjs websocket, nestjs tcp microservice, osrm routing api, osrm docker,
nominatim nestjs, nominatim nodejs geocoding, delivery fee calculation api,
geospatial nodejs, routing microservice, last-mile delivery backend,
food delivery backend, courier app backend, real-time delivery tracking,
leaflet nestjs, socket.io nestjs, openstreetmap nodejs, osrm route api example,
nestjs rest api, docker compose nestjs, nestjs monorepo, delivery eta calculation,
ride hailing backend, logistics api, distance matrix nodejs, osrm table api
-->
