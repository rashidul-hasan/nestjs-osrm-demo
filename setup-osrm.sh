#!/bin/bash
set -e

echo "Creating data directory..."
mkdir -p data
cd data

echo "Downloading map data for Monaco..."
curl -O http://download.geofabrik.de/europe/monaco-latest.osm.pbf

echo "Processing map data with OSRM Docker container..."
docker run --platform linux/amd64 -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-extract -p /opt/car.lua /data/monaco-latest.osm.pbf
docker run --platform linux/amd64 -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-partition /data/monaco-latest.osrm
docker run --platform linux/amd64 -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-customize /data/monaco-latest.osrm

echo "OSRM map data processed successfully! You can now run 'docker-compose up -d'"
