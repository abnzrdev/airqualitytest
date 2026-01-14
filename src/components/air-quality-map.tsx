import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Ensure Leaflet marker icons load correctly when bundled
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export type SensorReading = {
  pm1: number | null;
  pm25: number | null;
  pm10: number | null;
  co2: number | null;
  voc: number | null;
  temp: number | null;
  hum: number | null;
  ch2o: number | null;
  co: number | null;
  o3: number | null;
  no2: number | null;
  recorded_at: string;
};

export type DeviceMarker = {
  id: number;
  device_id: string;
  site: string | null;
  lat: number;
  lng: number;
  is_active: boolean;
  reading: SensorReading | null;
};

type Props = {
  deviceFilter?: string[];
  apiPath?: string;
};

const defaultCenter: LatLngExpression = [43.2567, 76.9286];

const FitToMarkers = ({ markers }: { markers: DeviceMarker[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) {
      map.setView(defaultCenter, 11);
      return;
    }

    const bounds = L.latLngBounds(markers.map(({ lat, lng }) => [lat, lng] as [number, number]));
    map.fitBounds(bounds.pad(0.2));
  }, [markers, map]);

  return null;
};

const buildQuery = (deviceFilter?: string[]): string => {
  const params = new URLSearchParams();
  if (deviceFilter && deviceFilter.length > 0) {
    params.set('deviceIds', deviceFilter.join(','));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const AirQualityMap = ({ deviceFilter, apiPath = '/api/sensors/latest' }: Props) => {
  const [markers, setMarkers] = useState<DeviceMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadMarkers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiPath}${buildQuery(deviceFilter)}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        const payload = await response.json();
        setMarkers(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Map data load failed');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadMarkers();
    return () => controller.abort();
  }, [apiPath, deviceFilter]);

  const visibleMarkers = useMemo(() => {
    if (!deviceFilter || deviceFilter.length === 0) return markers;
    const setFilter = new Set(deviceFilter);
    return markers.filter((marker) => setFilter.has(marker.device_id));
  }, [deviceFilter, markers]);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm text-gray-700 text-sm">
          Сенсор деректері жүктелуде...
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 z-20 rounded bg-red-600 text-white px-4 py-2 shadow">
          {error}
        </div>
      )}
      <MapContainer center={defaultCenter} zoom={11} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitToMarkers markers={visibleMarkers} />
        {visibleMarkers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng] as LatLngExpression}>
            <Popup>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-gray-800">{marker.device_id}</div>
                {marker.site && <div className="text-gray-600">Орналасу: {marker.site}</div>}
                {marker.reading ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="font-semibold text-gray-700">PM1: {marker.reading.pm1 ?? '--'}</span>
                    <span className="font-semibold text-gray-700">PM2.5: {marker.reading.pm25 ?? '--'}</span>
                    <span className="font-semibold text-gray-700">PM10: {marker.reading.pm10 ?? '--'}</span>
                    <span className="font-semibold text-gray-700">CO₂: {marker.reading.co2 ?? '--'} ppm</span>
                    <span className="font-semibold text-gray-700">VOC: {marker.reading.voc ?? '--'} ppb</span>
                    <span className="font-semibold text-gray-700">Темп: {marker.reading.temp ?? '--'} °C</span>
                    <span className="font-semibold text-gray-700">Ылғалд: {marker.reading.hum ?? '--'} %</span>
                    <span className="font-semibold text-gray-700">CH2O: {marker.reading.ch2o ?? '--'} ppb</span>
                    <span className="font-semibold text-gray-700">CO: {marker.reading.co ?? '--'} ppm</span>
                    <span className="font-semibold text-gray-700">O3: {marker.reading.o3 ?? '--'} ppb</span>
                    <span className="font-semibold text-gray-700">NO2: {marker.reading.no2 ?? '--'} ppb</span>
                    <span className="text-gray-600">Уақыт: {marker.reading.recorded_at}</span>
                  </div>
                ) : (
                  <div className="text-gray-600">Пайдалануға қолжетімді оқу жоқ.</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AirQualityMap;
