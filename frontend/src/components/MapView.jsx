import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Helper to fit map bounds to stops (safely parses coordinates)
const RecenterMap = ({ stops }) => {
  const map = useMap();
  useEffect(() => {
    if (stops && stops.length > 0) {
      const validCoords = stops
        .map(s => [parseFloat(s.lat), parseFloat(s.lon)])
        .filter(([lat, lon]) => !isNaN(lat) && !isNaN(lon));

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [stops, map]);
  return null;
};

const createNumberedIcon = (number, isDepot = false) => {
  const backgroundColor = isDepot ? '#ef4444' : '#3b82f6'; // Tailwind red-500 vs blue-500
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div style="
      background-color: ${backgroundColor};
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 13px;
      border: 2px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
    ">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const MapView = ({ stops, optimizedRoute }) => {
  const defaultCenter = [12.9716, 77.5946]; // Bangalore coordinates

  // Generate route polyline coordinates if optimized route is available
  const polylineCoords = React.useMemo(() => {
    if (!optimizedRoute || optimizedRoute.length === 0 || stops.length === 0) {
      return [];
    }
    // Map optimized indices to [lat, lon] coordinates safely
    return optimizedRoute
      .map(index => {
        const stop = stops.find((s, idx) => idx === index);
        if (!stop) return null;
        const lat = parseFloat(stop.lat);
        const lon = parseFloat(stop.lon);
        return (!isNaN(lat) && !isNaN(lon)) ? [lat, lon] : null;
      })
      .filter(coord => coord !== null);
  }, [stops, optimizedRoute]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stops.map((stop, index) => {
          const lat = parseFloat(stop.lat);
          const lon = parseFloat(stop.lon);
          if (isNaN(lat) || isNaN(lon)) return null;

          const isDepot = index === 0;
          
          // Determine sequential number on the map
          let sequenceNumber = index + 1;
          if (optimizedRoute && optimizedRoute.length > 0) {
            const routeIndex = optimizedRoute.indexOf(index);
            if (routeIndex !== -1) {
              sequenceNumber = routeIndex + 1;
            }
          }

          const markerIcon = createNumberedIcon(sequenceNumber, isDepot);

          return (
            <Marker
              key={stop.id || index}
              position={[lat, lon]}
              icon={markerIcon}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {isDepot ? 'Warehouse / Depot' : `Stop #${sequenceNumber}`}
                  </h4>
                  <p className="text-slate-600 text-xs mt-1">{stop.label}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Lat: {lat.toFixed(4)}, Lon: {lon.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {polylineCoords.length > 0 && (
          <Polyline
            positions={polylineCoords}
            color="#10b981" // Tailwind emerald-500
            weight={4}
            opacity={0.85}
            dashArray="1, 8" // subtle line animation/styling
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Dynamic recenter map to fit bounds of all stops */}
        <RecenterMap stops={stops} />
      </MapContainer>
    </div>
  );
};

export default MapView;
