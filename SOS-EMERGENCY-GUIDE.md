# 🚨 SOS Emergency Feature - Complete Guide

## Overview
**Offline-first emergency service locator** that helps users find nearby mechanics and service centers even without internet connection.

---

## ✨ Features

### 🔌 100% Offline Functionality
- ✅ Works without internet after initial setup
- ✅ Uses GPS for location (no data needed)
- ✅ Pre-loaded service center database
- ✅ Calculates distances locally
- ✅ Opens phone dialer for calls (no internet needed)
- ✅ Launches Maps app for directions (offline maps work)

### 📍 Location Features
- GPS-based location detection
- Haversine formula for accurate distance calculation
- Sort by nearest service centers
- Show distance in kilometers
- Real-time location updates

### 🏢 Service Center Information
- Name and address
- Phone number (click to call)
- Services offered (Brake, Engine, AC, Tire, etc.)
- Operating hours
- 24/7 emergency indicator
- User ratings
- Distance from user

### 🔍 Search & Filter
- Find nearest 5-10 centers
- Filter by 24/7 emergency only
- Search by city/state
- Search by services offered

---

## 🎯 How It Works

### Architecture:
```
User Location (GPS)
      ↓
Geolocation API (Offline)
      ↓
Calculate Distances (Haversine)
      ↓
Sort by Distance
      ↓
Display Results
      ↓
Actions: Call / Directions
```

### Data Storage:
```
IndexedDB (Browser Storage)
├── serviceCenters (Pre-loaded)
│   ├── id, name, address
│   ├── latitude, longitude
│   ├── phone, services
│   └── isEmergency, rating
└── userLocations (Cached)
```

---

## 📊 Pre-loaded Service Centers

### Major Cities Covered:
1. **Bangalore** (Karnataka)
   - Maruti Suzuki Arena - 24/7 Emergency
   - Hyundai Service Center
   
2. **Mumbai** (Maharashtra)
   - Honda Authorized Service - 24/7 Emergency
   - Kia Motors Service
   
3. **Delhi** (Delhi)
   - Tata Motors Service Point - 24/7 Emergency
   
4. **Chennai** (Tamil Nadu)
   - Ford Authorized Workshop - 24/7 Emergency
   
5. **Kolkata** (West Bengal)
   - Mahindra Service Center
   
6. **Hyderabad** (Telangana)
   - Volkswagen Service
   
7. **Ahmedabad** (Gujarat)
   - Renault Service Center - 24/7 Emergency
   
8. **Pune** (Maharashtra)
   - Kia Motors Service
   
9. **Jaipur** (Rajasthan)
   - Nissan Authorized Center - 24/7 Emergency

### Services Available:
- 🛠️ Brake Service & Pad Replacement
- 🔧 Engine Repair & Diagnosis
- 🛢️ Oil Change & Fluid Service
- 🚗 Tire Service & Replacement
- 🔋 Battery Service & Replacement
- ❄️ AC Repair & Recharge
- ⚡ Electrical System Repair
- 🔩 Transmission Service
- 🏍️ Suspension & Steering
- 💧 Coolant & Radiator Service

---

## 🚀 Usage Instructions

### For Users:

#### Step 1: Access SOS
1. Open Fixora app
2. Click **"SOS Emergency"** button
3. Grant location permission when prompted

#### Step 2: Find Service Centers
1. Click **"Find Nearby Centers"** for all centers
2. Or click **"Emergency 24/7 Only"** for urgent help
3. Wait 2-3 seconds for GPS and calculation

#### Step 3: View Results
- See list of nearest centers
- Check distance (in km)
- View services offered
- See operating hours
- Check ratings

#### Step 4: Take Action
**Option A: Call**
- Click "Call Now" button
- Phone dialer opens automatically
- Make call (no internet needed)

**Option B: Directions**
- Click "Get Directions" button
- Maps app opens with route
- Follow navigation (offline maps work)

---

## 🔧 Technical Implementation

### Files Created:

#### 1. **src/lib/offline-sos.ts**
- `OfflineSOSManager` class
- Service center database
- GPS location handling
- Distance calculation (Haversine)
- IndexedDB caching
- Default service centers data

#### 2. **src/components/SOSEmergency.tsx**
- React component for UI
- Location permission handling
- Service center list display
- Call and directions actions
- Offline status indicator
- Error handling

#### 3. **src/lib/offline-detector.ts**
- Network status monitoring
- Offline mode detection
- Connection quality check
- Sync when back online

#### 4. **src/lib/offline-storage.ts**
- IndexedDB wrapper
- Message/conversation storage
- Dataset caching
- Sync management

---

## 💻 Code Examples

### Using SOS Manager:

```typescript
import { sosManager } from '@/lib/offline-sos';

// Initialize
await sosManager.init();

// Get user location
const location = await sosManager.getUserLocation();
console.log(location); // { latitude: 12.9716, longitude: 77.5946 }

// Find nearest centers
const nearest = await sosManager.findNearestCenters(5);
console.log(nearest);
// [
//   { name: "Maruti Service", distance: 2.3, ... },
//   { name: "Honda Service", distance: 4.7, ... }
// ]

// Find emergency only
const emergency = await sosManager.findEmergencyServices(3);

// Search by location
const centers = sosManager.searchByLocation('Bangalore', 'Karnataka');

// Get directions URL
const url = sosManager.getDirectionsUrl(center);

// Call service center
sosManager.callServiceCenter('+91-80-2555-1234');
```

### Adding More Service Centers:

```typescript
// In offline-sos.ts, add to getDefaultServiceCenters():
{
  id: 'sc-011',
  name: 'Your Service Center',
  address: 'Street Address',
  city: 'City Name',
  state: 'State',
  phone: '+91-XXX-XXX-XXXX',
  services: ['Brake Service', 'Engine Repair'],
  latitude: 12.9716,  // Get from Google Maps
  longitude: 77.5946,
  isEmergency: true,  // or false
  rating: 4.5,
  hours: '24/7'  // or specific hours
}
```

---

## 🎨 UI/UX Features

### Visual Elements:
- 🚨 Red "Emergency 24/7" badges
- 📍 Distance indicator with navigation icon
- ⭐ Star ratings display
- 🔌 Offline mode indicator
- 🗺️ Location coordinates display
- ⏰ Operating hours with clock icon

### User Experience:
- Large, easy-to-tap buttons
- Color-coded emergency services (red)
- One-tap calling
- One-tap directions
- Loading states
- Error messages
- Permission requests

### Accessibility:
- Clear labels and icons
- High contrast colors
- Touch-friendly button sizes
- Screen reader support
- Keyboard navigation

---

## 📱 Platform Support

### Works On:
- ✅ Desktop browsers (Chrome, Firefox, Edge, Safari)
- ✅ Mobile browsers (Android Chrome, iOS Safari)
- ✅ Electron desktop app
- ✅ Progressive Web App (PWA)
- ✅ Android WebView
- ✅ iOS WebView

### Requirements:
- Geolocation API support (all modern browsers)
- IndexedDB support (all modern browsers)
- Phone dialer capability (mobile devices)
- Maps app installed (for directions)

---

## 🔐 Privacy & Permissions

### Location Permission:
- Required for GPS location
- Shows browser permission prompt
- User can deny (feature won't work)
- Location not shared with servers
- Used only for distance calculation

### Data Storage:
- Service centers cached in IndexedDB
- User location NOT permanently stored
- Cached temporarily for 1 minute
- No tracking or analytics
- All processing done locally

---

## 🚀 Future Enhancements

### Planned Features:
- [ ] User-contributed service centers
- [ ] Reviews and ratings system
- [ ] Photos of service centers
- [ ] Real-time availability status
- [ ] Appointment booking (offline queue)
- [ ] Price estimates for common services
- [ ] Mechanic skill ratings
- [ ] Parts availability info
- [ ] Tow truck services
- [ ] Roadside assistance

### Expansion Plans:
- Add more cities across India
- International service centers
- Specialized services (EV charging, etc.)
- Integration with insurance companies
- Emergency contact numbers (police, ambulance)

---

## 🐛 Troubleshooting

### "Location permission denied"
**Solution**: Grant location permission in browser settings

### "No service centers found"
**Solution**: 
- Check if GPS is enabled
- Wait for better GPS signal
- Try "Find Nearby Centers" again
- Manually search by city

### "Cannot get location"
**Solution**:
- Enable location services in device settings
- Use HTTPS (required for geolocation)
- Check browser permissions
- Try in a different browser

### "Directions not opening"
**Solution**:
- Install Google Maps or other navigation app
- Check default Maps app in settings
- Use phone number to call instead

---

## 📞 Emergency Numbers (India)

Pre-loaded in app:
- 🚓 Police: **100**
- 🚑 Ambulance: **102**
- 🔥 Fire: **101**
- 📞 Emergency: **112** (unified)

---

## 📝 Summary

The SOS Emergency feature provides:
- ✅ **Offline-first** design
- ✅ **GPS-based** location
- ✅ **Pre-loaded** service centers
- ✅ **One-tap** calling
- ✅ **Integrated** directions
- ✅ **No internet** required
- ✅ **Privacy-focused**
- ✅ **Fast** performance

Perfect for emergency situations when internet might not be available!

---

**Built with ❤️ for Fixora - Making vehicle assistance accessible offline**
