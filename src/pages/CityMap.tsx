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

  if (!isLoaded) return <div className="flex justify-center py-12">{t('loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{t('mapTitle')}</h1>
          <p className="text-zinc-500 mt-1">{t('mapSubtitle')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'all' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            {t('feedFilterAll')}
          </button>
          {Object.keys(CATEGORY_COLORS).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                filter === cat ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              {t(`mapLegend${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-zinc-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {!mapsKey ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mb-6" />
            <h4 className="text-xl font-bold text-zinc-900">
              Maps API Key Required
            </h4>
            <p className="text-zinc-500 mt-3 max-w-md">
              Please add VITE_GOOGLE_MAPS_API_KEY to your AI Studio Secrets to enable the city-wide issue map.
            </p>
            <a 
              href="https://console.cloud.google.com/google/maps-apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
            >
              Get a Google Maps API Key
            </a>
          </div>
        ) : isGroqKey ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
            <h4 className="text-xl font-bold text-zinc-900">Wrong Key Type Detected</h4>
            <div className="text-zinc-500 mt-3 max-w-md space-y-3">
              <p className="text-red-600 font-medium">
                You are using a Groq AI key (starts with gsk_) for Google Maps.
              </p>
              <p>
                Google Maps requires a key starting with <strong>AIza...</strong> from the Google Cloud Console.
              </p>
            </div>
          </div>
        ) : (loadError || isInvalidFormat) ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
            <h4 className="text-xl font-bold text-zinc-900">Invalid Maps Key</h4>
            <div className="text-zinc-500 mt-3 max-w-md space-y-3">
              <p>
                The provided API key is invalid or has the wrong format.
              </p>
              <p className="text-xs">
                Error: {loadError?.message || "Invalid key format"}
              </p>
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedIssue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      selectedIssue.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-zinc-100 text-zinc-700'
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
          <div key={cat} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <div>
              <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">{t(`mapLegend${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}</div>
              <div className="text-lg font-bold text-zinc-900">
                {issues.filter(i => i.category === cat).length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
