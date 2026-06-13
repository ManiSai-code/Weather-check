import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapWeatherOverlay from './MapWeatherOverlay';

// Fix for default Leaflet icon paths failing under Vite compilation paths
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface WeatherMapProps {
  lat: number;
  lon: number;
  cityName: string;
  condition: string;
}

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 7, { animate: true });
  }, [lat, lon, map]);
  return null;
}

export default function WeatherMap({ lat, lon, cityName, condition }: WeatherMapProps) {
  return (
    <div className="w-full h-full min-h-[450px] relative rounded-2xl overflow-hidden shadow-inner border border-slate-900">
      <MapContainer
        center={[lat, lon]}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* CORE MARKER SYSTEM */}
        <Marker key={`${lat}-${lon}-${condition}`} position={[lat, lon]}>
          
          {/* LAYER A: Invisible Permanent Tooltip Context
            This forces React-Leaflet to cleanly render our Canvas/CSS particle engine 
            exactly locked to the map marker coordinates!
          */}
          <Tooltip 
            permanent 
            direction="center" 
            className="!bg-transparent !border-none !shadow-none !p-0 pointer-events-none"
          >
            <MapWeatherOverlay condition={condition} />
          </Tooltip>

          {/* LAYER B: Standard Interactive Details Metadata Popup */}
          <Popup>
            <div className="p-1 text-slate-900 font-sans">
              <h6 className="font-bold text-sm text-slate-900">{cityName}</h6>
              <p className="text-xs text-slate-600 font-medium mt-0.5">Atmosphere: {condition}</p>
            </div>
          </Popup>

        </Marker>

        <RecenterMap lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}