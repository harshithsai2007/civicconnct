import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
const icon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
}

const LocationMarker = ({ position, setPosition, onLocationSelect, initialPos }: any) => {
  const map = useMap();

  useEffect(() => {
    if (!initialPos) {
      map.locate().on("locationfound", function (e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.flyTo(e.latlng, map.getZoom());
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }).on("locationerror", function () {
        console.log("Geolocation failed or denied. Defaulting to Vizag center.");
      });
    }
  }, [map]);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

export const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialPos }) => {
  const [position, setPosition] = useState<[number, number] | null>(initialPos || null);

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-white/10 relative group">
      <div className="absolute top-4 right-4 z-[1000] opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-red-500 uppercase tracking-widest">
          Click map to pin location
        </div>
      </div>
      <MapContainer center={initialPos || [17.6868, 83.2185]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} initialPos={initialPos} />
      </MapContainer>
    </div>
  );
};

interface HeatMapProps {
  issues: any[];
}

export const HeatMap: React.FC<HeatMapProps> = ({ issues }) => {
  return (
    <div className="h-[500px] w-full rounded-[2rem] overflow-hidden border border-white/5">
      <MapContainer center={[17.6868, 83.2185]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: ${issue.status === 'resolved' ? '#10b981' : issue.status === 'in_progress' ? '#eab308' : '#ef4444'}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(239, 68, 68,0.4);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          />
        ))}
      </MapContainer>
    </div>
  );
};
