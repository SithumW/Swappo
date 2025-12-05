// Location utilities for calculating distances and managing user location

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters}m away`;
  } else if (distanceKm < 10) {
    return `${distanceKm}km away`;
  } else {
    return `${Math.round(distanceKm)}km away`;
  }
}

// Get user's current location
export function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Store user location in localStorage
export function storeUserLocation(location: UserLocation): void {
  localStorage.setItem('user_location', JSON.stringify(location));
}

// Get stored user location
export function getStoredUserLocation(): UserLocation | null {
  try {
    const stored = localStorage.getItem('user_location');
    if (stored) {
      const location = JSON.parse(stored);
      // Check if location is less than 1 hour old
      if (location.timestamp && Date.now() - location.timestamp < 3600000) {
        return location;
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing stored location:', error);
    return null;
  }
}

// Clear stored user location
export function clearUserLocation(): void {
  localStorage.removeItem('user_location');
}

// Check if user has granted location permission
export function hasLocationPermission(): boolean {
  const stored = getStoredUserLocation();
  return stored !== null;
}
