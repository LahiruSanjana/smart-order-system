import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationPicker({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export default function DeliveryMap({ value, onChange }) {
  const position = value ? [value.lat, value.lng] : [6.9271, 79.8612];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={position}
        zoom={value ? 14 : 11}
        scrollWheelZoom
        className="h-72 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker onChange={onChange} />
        {value && (
          <CircleMarker
            center={position}
            radius={10}
            pathOptions={{
              color: "#157a6e",
              fillColor: "#55b78c",
              fillOpacity: 0.9,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
