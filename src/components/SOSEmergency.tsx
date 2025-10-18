/**
 * SOS Emergency Service Locator Component
 * Shows nearby service centers with offline support
 */

import { useState, useEffect } from 'react';
import { sosManager, ServiceCenter } from '@/lib/offline-sos';
import { offlineDetector } from '@/lib/offline-detector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Phone, Navigation, Clock, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SOSEmergency() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearestCenters, setNearestCenters] = useState<ServiceCenter[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initialize SOS manager
    sosManager.init();

    // Subscribe to offline status
    const unsubscribe = offlineDetector.subscribe((status) => {
      setIsOffline(status === 'offline');
    });

    return () => unsubscribe();
  }, []);

  const findNearby = async (emergencyOnly: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // Get user location
      const location = await sosManager.getUserLocation();
      setUserLocation({ lat: location.latitude, lon: location.longitude });

      // Find nearest centers
      const centers = emergencyOnly
        ? await sosManager.findEmergencyServices(5)
        : await sosManager.findNearestCenters(10);

      setNearestCenters(centers);

      if (centers.length === 0) {
        setError('No service centers found nearby. Try expanding search radius.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    sosManager.callServiceCenter(phone);
  };

  const handleDirections = (center: ServiceCenter) => {
    const url = sosManager.getDirectionsUrl(center);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            SOS Emergency
          </h2>
          <p className="text-muted-foreground mt-1">
            Find nearby service centers and mechanics
          </p>
        </div>
        {isOffline && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            🔌 Offline Mode
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => findNearby(false)}
          disabled={loading}
          size="lg"
          className="flex-1"
        >
          <MapPin className="mr-2 h-5 w-5" />
          {loading ? 'Finding...' : 'Find Nearby Centers'}
        </Button>
        <Button
          onClick={() => findNearby(true)}
          disabled={loading}
          size="lg"
          variant="destructive"
          className="flex-1"
        >
          <AlertCircle className="mr-2 h-5 w-5" />
          {loading ? 'Searching...' : 'Emergency 24/7 Only'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Offline Info */}
      {isOffline && nearestCenters.length === 0 && !loading && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertTitle>Offline Mode Active</AlertTitle>
          <AlertDescription>
            Using GPS and pre-loaded service center data. Click "Find Nearby Centers" to locate help.
            Phone calls and directions will work offline if you have the Maps app installed.
          </AlertDescription>
        </Alert>
      )}

      {/* User Location */}
      {userLocation && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Navigation className="h-4 w-4" />
              <span>
                Your location: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Centers List */}
      {nearestCenters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Found {nearestCenters.length} Service Center{nearestCenters.length > 1 ? 's' : ''}
          </h3>

          {nearestCenters.map((center) => (
            <Card key={center.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {center.name}
                      {center.isEmergency && (
                        <Badge variant="destructive" className="text-xs">
                          24/7 Emergency
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{center.address}, {center.city}, {center.state}</span>
                      </div>
                      {center.distance && (
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <Navigation className="h-4 w-4" />
                          <span>{center.distance.toFixed(1)} km away</span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  {center.rating && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-4 w-4 fill-yellow-600" />
                      <span className="font-semibold">{center.rating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Services */}
                <div>
                  <p className="text-sm font-medium mb-2">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {center.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Hours */}
                {center.hours && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{center.hours}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleCall(center.phone)}
                    variant="default"
                    className="flex-1"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                  <Button
                    onClick={() => handleDirections(center)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                </div>

                {/* Phone Number */}
                <div className="text-center">
                  <a
                    href={`tel:${center.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {center.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && nearestCenters.length === 0 && !error && userLocation && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No service centers found. Try clicking "Find Nearby Centers" again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {nearestCenters.length === 0 && !loading && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">How to Use SOS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>✅ Works completely offline using GPS</p>
            <p>📍 Shows distance to nearest service centers</p>
            <p>📞 Call directly from the app (no internet needed)</p>
            <p>🗺️ Get directions using your Maps app</p>
            <p>🚨 Filter by 24/7 emergency services</p>
            <p className="pt-2 text-xs text-orange-600">
              💡 Grant location permissions when prompted for accurate results
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
