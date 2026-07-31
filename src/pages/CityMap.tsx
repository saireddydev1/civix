import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { db, collection, query, onSnapshot } from '../firebase';
import { MapPin, Clock, AlertCircle, Filter, Layers, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../LanguageContext';

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
  minHeight: '500px'
};

const center = {
  lat: 17.3850,
  lng: 78.4867 // Hyderabad
};

const CATEGORY_COLORS: Record<string, string> = {
  'pothole': '#EF4444', // Red
  'garbage': '#F59E0B', // Amber
  'water': '#3B82F6', // Blue
  'electricity': '#10B981', // Emerald
  'other': '#6B7280' // Gray
};

let leafletLoadPromise: Promise<void> | null = null;

const loadLeaflet = (): Promise<void> => {
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve) => {
    if ((window as any).L) {
      resolve();
      return;
    }

    if (!document.getElementById('leaflet-css-link')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-link';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });

  return leafletLoadPromise;
};

const LeafletMapFallback = ({ filteredIssues }: { filteredIssues: any[] }) => {
  useEffect(() => {
    let mapInstance: any = null;
    let isCancelled = false;

    loadLeaflet().then(() => {
      if (isCancelled) return;

      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById('leaflet-map-sandbox');
      if (!container) return;

      if ((container as any)._leaflet_id) return;

      container.innerHTML = '';

      mapInstance = L.map('leaflet-map-sandbox', {
        zoomControl: true,
        attributionControl: false
      }).setView([center.lat, center.lng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapInstance);

      filteredIssues.forEach((issue) => {
        if (issue.location?.lat && issue.location?.lng) {
          const color = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS['other'];

          const markerHtml = `
            <div style="
              width: 24px;
              height: 24px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-map-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const popupHtml = `
            <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
              <span style="
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 8px;
                font-weight: bold;
                text-transform: uppercase;
                background-color: ${color}20;
                color: ${color};
                margin-bottom: 6px;
              ">${issue.category}</span>
              <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #0f172a;">${issue.title}</h4>
              <p style="margin: 0 0 8px; font-size: 11px; color: #475569; line-height: 1.4;">${issue.description}</p>
              <div style="font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 2px;">
                📍 <span>${issue.location?.address || ''}</span>
              </div>
            </div>
          `;

          L.marker([issue.location.lat, issue.location.lng], { icon: customIcon })
            .addTo(mapInstance)
            .bindPopup(popupHtml);
        }
      });
    });

    return () => {
      isCancelled = true;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [filteredIssues]);

  return (
    <div
      id="leaflet-map-sandbox"
      className="w-full h-[550px] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200"
    />
  );
};

export default function CityMap() {
  const { t } = useLanguage();
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const isGroqKey = mapsKey.startsWith('gsk_');
  const isInvalidFormat = mapsKey && !mapsKey.startsWith('AIza');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsKey
  });

  useEffect(() => {
    const q = query(collection(db, 'issues'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssues(data);
    });
    return unsubscribe;
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filter === 'all') return true;
      return issue.category === filter;
    }).filter(issue => issue.location?.lat && issue.location?.lng);
  }, [issues, filter]);

  const getMarkerIcon = (category: string) => {
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['other'];
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 10,
    };
  };

  const useMockMap = !mapsKey || isGroqKey || isInvalidFormat || loadError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">{t('mapTitle')}</h1>
          <p className="text-zinc-500 mt-1">{t('mapSubtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'all' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            <Layers className="w-4 h-4" />
            {t('feedFilterAll')}
          </button>
          {Object.keys(CATEGORY_COLORS).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === cat ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-650 border border-zinc-200 hover:bg-zinc-50'
                }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              {t(`mapLegend${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-zinc-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col relative font-sans">
        {useMockMap ? (
          <div className="relative w-full h-[550px]">
            {/* Real Map Fallback via OpenStreetMap */}
            <LeafletMapFallback filteredIssues={filteredIssues} />

            {/* Map Header Indicator */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md border border-zinc-200 shadow-md px-3.5 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 font-extrabold text-[10px]">
                Loading Telangana govt offices...
              </span>
            </div>
          </div>
        ) : isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            options={{
              styles: [
                {
                  "featureType": "administrative",
                  "elementType": "geometry",
                  "stylers": [{ "visibility": "off" }]
                },
                {
                  "featureType": "poi",
                  "stylers": [{ "visibility": "off" }]
                },
                {
                  "featureType": "road",
                  "elementType": "labels.icon",
                  "stylers": [{ "visibility": "off" }]
                },
                {
                  "featureType": "transit",
                  "stylers": [{ "visibility": "off" }]
                }
              ],
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true
            }}
          >
            {filteredIssues.map((issue) => (
              <Marker
                key={issue.id}
                position={{ lat: issue.location.lat, lng: issue.location.lng }}
                onClick={() => setSelectedIssue(issue)}
                icon={getMarkerIcon(issue.category)}
              />
            ))}

            {selectedIssue && (
              <InfoWindow
                position={{ lat: selectedIssue.location.lat, lng: selectedIssue.location.lng }}
                onCloseClick={() => setSelectedIssue(null)}
              >
                <div className="p-2 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedIssue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      selectedIssue.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-zinc-105 text-zinc-700'
                      }`}>
                      {selectedIssue.status}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {selectedIssue.createdAt ? formatDistanceToNow(selectedIssue.createdAt.toDate()) + ' ago' : 'Just now'}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 mb-1">{selectedIssue.title}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{selectedIssue.description}</p>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{selectedIssue.location?.address}</span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-50">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="bg-white p-4 rounded-2xl border border-zinc-200 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{t(`mapLegend${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}</div>
              <div className="text-lg font-black text-zinc-900">
                {issues.filter(i => i.category === cat).length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
