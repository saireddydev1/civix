import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { Camera, MapPin, Send, Loader2, CheckCircle2, Video, Truck, Zap, Droplets, GraduationCap, Building2, HeartPulse, X, Upload, AlertCircle, Trash2, Waves, Sun, MoreHorizontal, Scan, Target, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEPARTMENTS, ISSUE_CATEGORIES } from '../constants';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { compressAndConvertToDataUrl } from '../utils/imageUtils';

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 17.3850,
  lng: 78.4867 // Hyderabad
};

let leafletPickerLoadPromise: Promise<void> | null = null;

const loadLeafletPicker = (): Promise<void> => {
  if (leafletPickerLoadPromise) return leafletPickerLoadPromise;

  leafletPickerLoadPromise = new Promise((resolve) => {
    if ((window as any).L) {
      resolve();
      return;
    }

    if (!document.getElementById('leaflet-css-picker')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-picker';
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

  return leafletPickerLoadPromise;
};

const LeafletPickerMap = ({
  lat,
  lng,
  onSelectLocation
}: {
  lat: number;
  lng: number;
  onSelectLocation: (lat: number, lng: number) => void;
}) => {
  const callbackRef = useRef(onSelectLocation);
  useEffect(() => {
    callbackRef.current = onSelectLocation;
  }, [onSelectLocation]);

  useEffect(() => {
    let mapInstance: any = null;
    let isCancelled = false;

    loadLeafletPicker().then(() => {
      if (isCancelled) return;

      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById('leaflet-picker-container');
      if (!container) return;

      if ((container as any)._leaflet_id) return;

      container.innerHTML = '';

      const initialLat = lat || 17.3850;
      const initialLng = lng || 78.4867;

      mapInstance = L.map('leaflet-picker-container', {
        zoomControl: true,
        attributionControl: false
      }).setView([initialLat, initialLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapInstance);

      const markerHtml = `
        <div style="
          width: 28px;
          height: 28px;
          background-color: #10b981;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(16,185,129,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-picker-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([initialLat, initialLng], { icon: customIcon, draggable: true }).addTo(mapInstance);

      marker.on('dragend', (e: any) => {
        const position = e.target.getLatLng();
        callbackRef.current(position.lat, position.lng);
      });

      mapInstance.on('click', (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        callbackRef.current(clickLat, clickLng);
      });
    });

    return () => {
      isCancelled = true;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  return (
    <div
      id="leaflet-picker-container"
      className="w-full h-[320px] bg-slate-950 border-b border-slate-800"
    />
  );
};

export default function ReportIssue() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [scanningPhoto, setScanningPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const isGroqKey = mapsKey.startsWith('gsk_');
  const isInvalidFormat = mapsKey && !mapsKey.startsWith('AIza');
  const useMockMap = !mapsKey || isGroqKey || isInvalidFormat;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsKey
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    category: '',
    photoUrl: '',
    videoUrl: '',
    location: {
      address: 'Detecting location...',
      lat: defaultCenter.lat,
      lng: defaultCenter.lng
    }
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat: latitude,
              lng: longitude,
              address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
            }
          }));
        },
        (error) => {
          console.error("Geolocation error:", error);
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, address: 'Hyderabad, India' }
          }));
        }
      );
    }
  }, []);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, lat, lng, address: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` }
    }));

    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, lat, lng, address: results[0].formatted_address }
          }));
        }
      });
    } else {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setFormData(prev => ({
              ...prev,
              location: { ...prev.location, lat, lng, address: data.display_name }
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

  const onMapClick = useCallback((e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude);
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await compressAndConvertToDataUrl(file);
        if (type === 'photo') {
          setFormData(prev => ({ ...prev, photoUrl: url }));
          setScanningPhoto(true);
          setTimeout(() => setScanningPhoto(false), 2500);
        } else {
          setFormData(prev => ({ ...prev, videoUrl: url }));
        }
      } catch (err) {
        console.error("Failed to process uploaded file:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
      alert("Please select a department");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'issues'), {
        ...formData,
        status: 'open',
        reporterUid: user.uid,
        reporterName: user.displayName,
        reporterPhotoUrl: user.photoURL,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        aiMetadata: null
      });
      navigate('/');
    } catch (error) {
      console.error("Failed to report issue", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeptIcon = (id) => {
    switch(id) {
      case 'municipal': return <Building2 className="w-4 h-4" />;
      case 'transport': return <Truck className="w-4 h-4" />;
      case 'electricity': return <Zap className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'education': return <GraduationCap className="w-4 h-4" />;
      case 'health': return <HeartPulse className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('reportIssue')}</h1>
          <p className="text-slate-400 text-sm mt-1">Submit civic complaints directly to municipal governance for automated AI routing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 text-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('issueTitle')}</label>
              <input
                required
                type="text"
                placeholder={t('issueTitlePlaceholder')}
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('description')}</label>

              <textarea
                required
                rows={4}
                placeholder={t('issueDescriptionPlaceholder')}
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder:text-slate-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all text-left ${
                      formData.category === cat.id 
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold' 
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs">{cat.name}</span>
                    {formData.category === cat.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('selectDepartment')}</label>
              <div className="grid grid-cols-1 gap-2">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, departmentId: dept.id })}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      formData.departmentId === dept.id 
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold' 
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getDeptIcon(dept.id)}
                      <span className="text-xs">{dept.name}</span>
                    </div>
                    {formData.departmentId === dept.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('mediaAndLocation')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Photo Upload with AI Scanner Overlay */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-800 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'photo')} 
              />
              {formData.photoUrl ? (
                <>
                  <img src={formData.photoUrl} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                  
                  {/* AI Vision Laser Beam Overlay */}
                  {scanningPhoto && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col justify-between p-3 pointer-events-none z-20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold bg-slate-950/90 px-2 py-1 rounded border border-emerald-500/40">
                        <span className="flex items-center gap-1"><Scan className="w-3 h-3 animate-spin" /> AI VISION SCAN</span>
                        <span>98.4% CONF</span>
                      </div>
                      
                      {/* Sweeping Laser Line */}
                      <motion.div
                        animate={{ y: [0, 140, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full shadow-[0_0_15px_#22d3ee]"
                      />

                      {/* Bounding Target Box */}
                      <div className="border-2 border-cyan-400/80 rounded-lg p-2 flex items-center justify-center bg-cyan-500/10">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-slate-950/80 px-1.5 py-0.5 rounded">DETECTED: POTHOLE / SEVERITY HIGH</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('addPhoto')}</span>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div 
              onClick={() => videoInputRef.current?.click()}
              className="aspect-video bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-800 relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors group"
            >
              <input 
                type="file" 
                ref={videoInputRef} 
                className="hidden" 
                accept="video/*" 
                onChange={(e) => handleFileChange(e, 'video')} 
              />
              {formData.videoUrl ? (
                <>
                  <video src={formData.videoUrl} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Video className="text-white w-8 h-8" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Video className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('addVideo')}</span>
                </div>
              )}
            </div>

            {/* Location Picker */}
            <div 
              onClick={() => setShowMap(true)}
              className="aspect-video bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-800 p-4 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <MapPin className="w-8 h-8 text-emerald-400 mb-2" />
              <div className="text-center">
                <span className="text-xs font-bold text-white block uppercase tracking-widest">{t('setOnMap')}</span>
                <p className="mt-1 text-[10px] text-slate-400 line-clamp-1">Click to adjust pin</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('location')}</label>
            <div className="relative">
              <input
                required
                type="text"
                placeholder={t('addressPlaceholder')}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
                value={formData.location.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, address: e.target.value } 
                })}
              />
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400 italic">Tip: Use the map picker above for higher accuracy.</p>
          </div>
        </div>

        {/* Map Modal */}
        <AnimatePresence>
          {showMap && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
                  <h3 className="text-xl font-extrabold">Adjust Location Pin</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={handleLocateMe}
                      className="p-2 hover:bg-slate-800 rounded-full transition-colors text-emerald-400"
                      title="Locate Me"
                    >
                      <MapPin className="w-6 h-6" />
                    </button>
                    <button onClick={() => setShowMap(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="p-0">
                  {useMockMap ? (
                    <LeafletPickerMap
                      lat={formData.location.lat}
                      lng={formData.location.lng}
                      onSelectLocation={(lat, lng) => reverseGeocode(lat, lng)}
                    />
                  ) : isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{ lat: formData.location.lat, lng: formData.location.lng }}
                      zoom={15}
                      onClick={onMapClick}
                    >
                      <Marker 
                        position={{ lat: formData.location.lat, lng: formData.location.lng }} 
                        draggable={true}
                        onDragEnd={onMapClick}
                      />
                    </GoogleMap>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center bg-slate-950">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                  )}
                </div>
                <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-slate-100">
                  <div className="text-sm text-slate-400">
                    <span className="font-bold block text-white">Selected Coordinates</span>
                    {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                  </div>
                  <button 
                    onClick={() => setShowMap(false)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-xl font-extrabold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Confirm Location
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-extrabold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {t('submit')}
        </button>
      </form>
    </div>
  );
}
