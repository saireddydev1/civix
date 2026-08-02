/**
 * Utility function to open Google Maps navigation for a given issue location.
 */
export function openGoogleMapsNavigation(location?: { lat?: number; lng?: number; address?: string }) {
  let mapsUrl = '';
  if (location && location.lat && location.lng) {
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
  } else if (location && location.address) {
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
  } else {
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Hyderabad, Telangana, India')}`;
  }
  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Returns a human-readable Hyderabad area address for GPS coordinates.
 */
export function getNearestHyderabadArea(lat?: number, lng?: number): string {
  if (!lat || !lng) return 'Madhapur, Hyderabad';
  
  if (lat > 17.43 && lat < 17.46 && lng > 78.37 && lng < 78.40) return 'Madhapur, Hyderabad';
  if (lat > 17.41 && lat < 17.44 && lng > 78.34 && lng < 78.38) return 'Gachibowli, Hyderabad';
  if (lat > 17.46 && lat < 17.50 && lng > 78.38 && lng < 78.42) return 'Kukatpally, Hyderabad';
  if (lat > 17.40 && lat < 17.43 && lng > 78.43 && lng < 78.46) return 'Banjara Hills, Hyderabad';
  if (lat > 17.42 && lat < 17.45 && lng > 78.40 && lng < 78.43) return 'Jubilee Hills, Hyderabad';
  if (lat > 17.43 && lat < 17.47 && lng > 78.44 && lng < 78.48) return 'Ameerpet, Hyderabad';
  if (lat > 17.43 && lat < 17.47 && lng > 78.48 && lng < 78.52) return 'Secunderabad, Hyderabad';
  if (lat > 17.38 && lat < 17.41 && lng > 78.53 && lng < 78.58) return 'Uppal, Hyderabad';
  if (lat > 17.35 && lat < 17.38 && lng > 78.50 && lng < 78.55) return 'Dilsukhnagar, Hyderabad';
  if (lat > 17.38 && lat < 17.41 && lng > 78.43 && lng < 78.46) return 'Mehdipatnam, Hyderabad';
  if (lat > 17.35 && lat < 17.38 && lng > 78.46 && lng < 78.49) return 'Charminar, Old City, Hyderabad';
  if (lat > 17.40 && lat < 17.43 && lng > 78.36 && lng < 78.38) return 'Khajaguda, Hyderabad';
  if (lat > 17.37 && lat < 17.40 && lng > 78.31 && lng < 78.34) return 'Kokapet, Hyderabad';
  
  return `Hyderabad (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Formats location text to show clean human-readable area addresses
 * instead of raw coordinate strings like "Location (17.4339, 78.3929)".
 */
export function formatLocationText(location?: { lat?: number; lng?: number; address?: string }): string {
  if (!location) return 'Madhapur, Hyderabad';

  if (location.address) {
    const addr = location.address.trim();
    if (
      addr !== 'Hyderabad, Telangana' &&
      addr !== 'Hyderabad, India' &&
      addr !== 'Hyderabad' &&
      addr !== 'Detecting location...' &&
      !addr.startsWith('Location (') &&
      !addr.startsWith('Lat:')
    ) {
      return addr;
    }
  }

  if (typeof location.lat === 'number' && typeof location.lng === 'number') {
    return getNearestHyderabadArea(location.lat, location.lng);
  }

  return location.address || 'Madhapur, Hyderabad';
}
