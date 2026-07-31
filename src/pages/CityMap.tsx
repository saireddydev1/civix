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

  const getGridPosition = (lat: number, lng: number) => {
    const minLat = 17.32;
    const maxLat = 17.45;
    const minLng = 78.35;
    const maxLng = 78.55;

    const latVal = lat || 17.3850;
    const lngVal = lng || 78.4867;

    const left = ((lngVal - minLng) / (maxLng - minLng)) * 100;
    const top = ((maxLat - latVal) / (maxLat - minLat)) * 100;

    return {
      left: `${Math.max(5, Math.min(95, left))}%`,
      top: `${Math.max(5, Math.min(95, top))}%`
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">{t('mapTitle')}</h1>
          <p className="text-slate-400 mt-1">{t('mapSubtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'all' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
          >
            <Layers className="w-4 h-4" />
            {t('feedFilterAll')}
          </button>
          {Object.keys(CATEGORY_COLORS).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === cat ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              {t(`mapLegend${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-2 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative">
        {useMockMap ? (
          <div
            className="relative w-full h-[550px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800"
            style={{
              backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)',
              backgroundSize: '25px 25px'
            }}
          >
            {/* Radar scanning animation */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-[pulse_3s_infinite]" />

            {/* Simulated Road Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="200" x2="100%" y2="400" stroke="#10b981" strokeWidth="4" />
              <text x="150" y="240" fill="#10b981" className="text-[10px] font-bold tracking-wider">KUKATPALLY MAIN HIGHWAY</text>

              <path d="M 100 500 Q 400 100 800 450" fill="none" stroke="#06b6d4" strokeWidth="3" />
              <text x="420" y="200" fill="#06b6d4" className="text-[10px] font-bold tracking-wider">OUTER RING ROAD</text>

              <line x1="300" y1="0" x2="300" y2="100%" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
              <text x="310" y="100" fill="#94a3b8" className="text-[9px] font-semibold">MADHAPUR BYPASS</text>

              <line x1="0" y1="350" x2="100%" y2="350" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="340" fill="#94a3b8" className="text-[9px] font-semibold">BANJARA HILLS ROAD NO. 1</text>
            </svg>

            {/* Map Header Indicator */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-extrabold uppercase tracking-widest text-[9px]">
                {isGroqKey ? 'AI Smart Sandbox Map Active' : 'Offline Sandbox Map Active'}
              </span>
            </div>

            {/* Info Badge */}
            <div className="absolute bottom-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-[10px] text-slate-400 max-w-xs">
              <p className="font-bold text-slate-200 mb-1">💡 Sandbox Mode</p>
              {isGroqKey
                ? 'Your Groq key is successfully powering AI triage services. We are running the sandbox visualization map.'
                : 'Displaying real Firestore complaints projected onto the Hyderabad Smart Grid.'}
            </div>

            {/* Issue Pins */}
            {filteredIssues.map((issue) => {
              const pos = getGridPosition(issue.location?.lat, issue.location?.lng);
              const color = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS['other'];

              return (
                <div
                  key={issue.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                  style={{ left: pos.left, top: pos.top }}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <span className="absolute inline-flex h-6 w-6 rounded-full opacity-40 animate-ping" style={{ backgroundColor: color }} />
                  <div className="relative w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125" style={{ backgroundColor: color }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-800 text-[10px] text-white px-2 py-1 rounded font-bold whitespace-nowrap shadow-xl z-20">
                    {issue.title}
                  </div>
                </div>
              );
            })}

            {/* InfoWindow popup emulation */}
            {selectedIssue && (() => {
              const pos = getGridPosition(selectedIssue.location?.lat, selectedIssue.location?.lng);
              return (
                <div
                  className="absolute z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl w-64 -translate-x-1/2 mt-3"
                  style={{
                    left: pos.left,
                    top: `calc(${pos.top} + 12px)`,
                  }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900" />

                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${selectedIssue.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                      selectedIssue.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                        'bg-slate-805 text-slate-300'
                      }`}>
                      {selectedIssue.status}
                    </span>
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="text-slate-400 hover:text-white font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <h4 className="font-extrabold text-sm text-white mb-1 line-clamp-1">{selectedIssue.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">{selectedIssue.description}</p>

                  <div className="text-[9px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{selectedIssue.location?.address}</span>
                  </div>
                </div>
              );
            })()}
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
          <div className="flex-1 flex items-center justify-center bg-slate-950">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t(`mapLegend${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}</div>
              <div className="text-lg font-black text-white">
                {issues.filter(i => i.category === cat).length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
