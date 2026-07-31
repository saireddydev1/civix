import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { analyzeIssue } from '../gemini';
import { Camera, MapPin, Send, Loader2, Sparkles, CheckCircle2, Video, Truck, Zap, Droplets, GraduationCap, Building2, HeartPulse, X, Upload, AlertCircle, Trash2, Waves, Sun, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEPARTMENTS, ISSUE_CATEGORIES } from '../constants';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: 17.3850,
  lng: 78.4867 // Hyderabad
};

export default function ReportIssue() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const isGroqKey = mapsKey.startsWith('gsk_');
  const isInvalidFormat = mapsKey && !mapsKey.startsWith('AIza');

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
    if (!window.google) {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, lat, lng, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` }
      }));
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat, lng, address: results[0].formatted_address }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat, lng, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` }
        }));
      }
    });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'photo') {
        setFormData(prev => ({ ...prev, photoUrl: url }));
      } else {
        setFormData(prev => ({ ...prev, videoUrl: url }));
      }
    }
  };

  const handleAnalyze = async () => {
    if (!formData.title || !formData.description) return;
    setAnalyzing(true);
    try {
      const result = await analyzeIssue(formData.title, formData.description);
      setAiAnalysis(result);
      setFormData(prev => ({ 
        ...prev, 
        departmentId: result.departmentId || prev.departmentId,
        category: result.category || prev.category
      }));
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setAnalyzing(false);
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
        aiMetadata: aiAnalysis
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
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{t('reportIssue')}</h1>
        <p className="text-zinc-500 mt-1">Provide details about the civic problem. AI will help route it.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">{t('issueTitle')}</label>
              <input
                required
                type="text"
                placeholder={t('issueTitlePlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">{t('description')}</label>
              <textarea
                required
                rows={4}
                placeholder={t('issueDescriptionPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={analyzing || !formData.title || !formData.description}
                onClick={handleAnalyze}
                className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {t('aiTriage')}
              </button>
              {aiAnalysis && (
                <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-[10px] uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    AI Insights
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-zinc-400 block">Category</span>
                      <span className="text-zinc-900 font-bold capitalize">{aiAnalysis.category}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Priority</span>
                      <span className={`font-bold ${
                        aiAnalysis.priority === 'Critical' ? 'text-red-600' :
                        aiAnalysis.priority === 'High' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>{aiAnalysis.priority}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left ${
                      formData.category === cat.id 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600' 
                      : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'
                    }`}
                  >
                    <span className="text-xs font-medium">{cat.name}</span>
                    {formData.category === cat.id && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">{t('selectDepartment')}</label>
              <div className="grid grid-cols-1 gap-2">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, departmentId: dept.id })}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      formData.departmentId === dept.id 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600' 
                      : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getDeptIcon(dept.id)}
                      <span className="text-sm font-medium">{dept.name}</span>
                    </div>
                    {formData.departmentId === dept.id && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <label className="text-sm font-semibold text-zinc-700">{t('mediaAndLocation')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Photo Upload */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-zinc-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 relative overflow-hidden group cursor-pointer hover:bg-zinc-100 transition-colors"
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('addPhoto')}</span>
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div 
              onClick={() => videoInputRef.current?.click()}
              className="aspect-video bg-zinc-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 relative overflow-hidden cursor-pointer hover:bg-zinc-100 transition-colors group"
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
                  <Video className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('addVideo')}</span>
                </div>
              )}
            </div>

            {/* Location Picker */}
            <div 
              onClick={() => setShowMap(true)}
              className="aspect-video bg-zinc-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 p-4 cursor-pointer hover:bg-zinc-100 transition-colors"
            >
              <MapPin className="w-8 h-8 text-emerald-500 mb-2" />
              <div className="text-center">
                <span className="text-xs font-bold text-zinc-900 block uppercase tracking-widest">{t('setOnMap')}</span>
                <p className="mt-1 text-[10px] text-zinc-500 line-clamp-1">Click to adjust pin</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">{t('location')}</label>
            <div className="relative">
              <input
                required
                type="text"
                placeholder={t('addressPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                value={formData.location.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, address: e.target.value } 
                })}
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-[10px] text-zinc-400 italic">Tip: Use the map picker above for higher accuracy.</p>
          </div>
        </div>

        {/* Map Modal */}
        <AnimatePresence>
          {showMap && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Adjust Location Pin</h3>
                  <button 
                    type="button"
                    onClick={handleLocateMe}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-emerald-600"
                    title="Locate Me"
                  >
                    <MapPin className="w-6 h-6" />
                  </button>
                  <button onClick={() => setShowMap(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                  <div className="p-0">
                    {!mapsKey ? (
                      <div className="h-[300px] flex flex-col items-center justify-center bg-zinc-50 p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                        <h4 className="font-bold text-zinc-900">
                          Maps API Key Required
                        </h4>
                        <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                          Please add VITE_GOOGLE_MAPS_API_KEY to your AI Studio Secrets to enable the interactive map.
                        </p>
                        <a 
                          href="https://console.cloud.google.com/google/maps-apis/credentials" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-4 text-xs text-emerald-600 font-bold underline"
                        >
                          Get a Google Maps API Key
                        </a>
                      </div>
                    ) : isGroqKey ? (
                    <div className="h-[300px] flex flex-col items-center justify-center bg-zinc-50 p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      <h4 className="font-bold text-zinc-900">Wrong Key Type Detected</h4>
                      <div className="text-sm text-zinc-500 mt-2 max-w-xs space-y-2">
                        <p className="text-red-600 font-medium">
                          You are using a Groq AI key (starts with gsk_) for Google Maps.
                        </p>
                        <p>
                          Google Maps requires a key starting with <strong>AIza...</strong> from the Google Cloud Console.
                        </p>
                      </div>
                    </div>
                  ) : (loadError || isInvalidFormat) ? (
                    <div className="h-[300px] flex flex-col items-center justify-center bg-zinc-50 p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      <h4 className="font-bold text-zinc-900">Invalid Maps Key</h4>
                      <div className="text-sm text-zinc-500 mt-2 max-w-xs space-y-2">
                        <p>
                          The provided API key is invalid or has the wrong format.
                        </p>
                      </div>
                    </div>
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
                    <div className="h-[300px] flex items-center justify-center bg-zinc-50">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                  )}
                </div>
                <div className="p-6 bg-zinc-50 flex items-center justify-between">
                  <div className="text-sm text-zinc-600">
                    <span className="font-bold block text-zinc-900">Selected Coordinates</span>
                    {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                  </div>
                  <button 
                    onClick={() => setShowMap(false)}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
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
          className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-200 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {t('submit')}
        </button>
      </form>
    </div>
  );
}
