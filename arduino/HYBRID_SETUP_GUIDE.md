# Hybrid WiFi/USB Serial Setup Guide

## Overview

The ESP32 collar now supports **hybrid mode**:
- **Primary**: WiFi connection (sends data directly to backend API)
- **Fallback**: USB Serial (works with bridge service if WiFi fails)
- **Debugging**: Always outputs to Serial Monitor

## How It Works

### Mode 1: WiFi Mode (Primary)
```
ESP32 → WiFi → Backend API → Database → Website
```
- ESP32 connects to WiFi
- Sends HTTP requests directly to backend
- No bridge service needed
- Works independently

### Mode 2: USB Serial Mode (Fallback)
```
ESP32 → USB Serial → Bridge Service → Backend API → Database → Website
```
- If WiFi fails, falls back to Serial
- Bridge service reads Serial data
- Same as original setup

### Mode 3: Debug Mode (Always Active)
```
ESP32 → Serial Monitor (for debugging)
```
- Always outputs sensor data to Serial
- Easy to debug and monitor
- Works in both WiFi and Serial modes

## Configuration Steps

### Step 1: Update WiFi Credentials

Open `collar.ino` and change these lines:

```cpp
const char* ssid = "YOUR_WIFI_NAME";           // Change this
const char* password = "YOUR_WIFI_PASSWORD";   // Change this
```

**Example**:
```cpp
const char* ssid = "MyHomeWiFi";
const char* password = "MyPassword123";
```

### Step 2: Update Backend API URL

Change the backend URL:

```cpp
const char* apiBaseURL = "http://localhost:3000/api";  // Change this
```

**For local development**:
```cpp
const char* apiBaseURL = "http://192.168.1.100:3000/api";  // Your computer's IP
```

**For cloud deployment**:
```cpp
const char* apiBaseURL = "https://your-backend.com/api";  // Your backend URL
```

### Step 3: Update Dog ID and Auth Token

```cpp
const char* dogId = "YOUR_DOG_ID";                    // MongoDB ObjectId
const char* authToken = "YOUR_AUTH_TOKEN";             // JWT token
```

**How to get Dog ID**:
1. Login to web app
2. Open browser DevTools → Network tab
3. Find `/api/dogs` request
4. Copy the `id` field from response

**How to get Auth Token**:
1. Login to web app
2. Open browser DevTools → Application → Local Storage
3. Copy `authToken` value

### Step 4: Upload Code

1. Connect ESP32 via USB
2. Select board: **ESP32 Dev Module**
3. Select port: Your COM port
4. Click **Upload**

### Step 5: Monitor Serial Output

Open Serial Monitor (115200 baud) to see:

**WiFi Connected**:
```
=== V.E.T Collar System Starting ===
Hybrid Mode: WiFi (primary) + USB Serial (fallback)
Sensors initialized
Connecting to WiFi: MyHomeWiFi
WiFi Connected!
IP Address: 192.168.1.45
Mode: WiFi (sending data to API)
Temperature:38.5C 101.3F
Waveform:1850 BPM:72
Sending data to API: http://192.168.1.100:3000/api/dogs/507f1f77bcf86cd799439011/vitals
API Response Code: 200
Data sent successfully via WiFi!
```

**WiFi Failed (Fallback)**:
```
=== V.E.T Collar System Starting ===
Hybrid Mode: WiFi (primary) + USB Serial (fallback)
Sensors initialized
Connecting to WiFi: MyHomeWiFi
WiFi Connection Failed!
Mode: USB Serial only (fallback)
Data will be sent via Serial port for bridge service
Temperature:38.5C 101.3F
Waveform:1850 BPM:72
```

## Behavior

### When WiFi is Connected:
- ✅ Sends data directly to backend API via HTTP
- ✅ No bridge service needed
- ✅ Still outputs to Serial for debugging
- ✅ Automatic retry if connection drops

### When WiFi Fails:
- ✅ Falls back to USB Serial mode
- ✅ Bridge service can read Serial data
- ✅ Same as original setup
- ✅ Automatically retries WiFi every 30 seconds

### Always:
- ✅ Outputs sensor data to Serial Monitor
- ✅ Easy to debug and monitor
- ✅ Works in both modes

## Troubleshooting

### WiFi Not Connecting

**Check**:
1. WiFi credentials are correct
2. WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
3. WiFi password is correct
4. ESP32 is within WiFi range

**Solution**: Check Serial Monitor for error messages

### API Not Receiving Data

**Check**:
1. Backend URL is correct (use IP address for local)
2. Dog ID is correct (MongoDB ObjectId)
3. Auth token is valid (not expired)
4. Backend is running and accessible

**Solution**: Check Serial Monitor for HTTP response codes

### Falls Back to Serial Mode

**This is normal!** If WiFi fails, it automatically falls back to Serial mode. The bridge service will still work.

**To fix WiFi**:
1. Check WiFi credentials
2. Check WiFi signal strength
3. ESP32 will auto-retry every 30 seconds

## Advantages of Hybrid Mode

1. **Best of Both Worlds**
   - WiFi for independence
   - Serial for reliability

2. **Automatic Fallback**
   - No manual switching needed
   - Works even if WiFi fails

3. **Easy Debugging**
   - Always outputs to Serial
   - Can see what's happening

4. **Flexible Setup**
   - Use WiFi when available
   - Use Serial when needed

5. **No Breaking Changes**
   - Bridge service still works
   - Existing setup still compatible

## Configuration Examples

### Local Development
```cpp
const char* apiBaseURL = "http://192.168.1.100:3000/api";  // Your computer's local IP
```

### Cloud Deployment
```cpp
const char* apiBaseURL = "https://api.yourdomain.com/api";
```

### Multiple Collars
Each collar needs:
- Same WiFi credentials
- Different Dog ID
- Same backend URL
- Different Auth Token (or same if using same owner)

## Next Steps

1. **Configure WiFi credentials** in code
2. **Update backend URL** (use local IP for testing)
3. **Get Dog ID and Auth Token** from web app
4. **Upload code** to ESP32
5. **Monitor Serial output** to verify connection
6. **Check backend** to see if data is received

The hybrid approach gives you the flexibility to use WiFi when available, but still works with Serial if needed!

