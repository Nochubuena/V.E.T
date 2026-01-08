# Blynk + V.E.T System Integration Guide

This guide explains how to set up the ESP32 collar to send data to **both** Blynk Cloud and the V.E.T Backend API simultaneously.

## Overview

The integrated collar now supports **dual-platform data transmission**:
- ✅ **V.E.T Backend API**: Stores data in MongoDB, accessible via web app
- ✅ **Blynk Cloud**: Real-time monitoring via Blynk mobile app
- ✅ **USB Serial**: Fallback mode if WiFi fails

## How It Works

```
ESP32 Collar
    ↓
WiFi Connection
    ├──→ V.E.T Backend API → MongoDB → Web App
    └──→ Blynk Cloud → Blynk Mobile App
```

**Data Flow:**
1. ESP32 reads sensors (Temperature, Heart Rate)
2. Data sent to **both** platforms simultaneously:
   - HTTP PUT request to V.E.T API
   - Virtual pin writes to Blynk
3. Users can monitor via:
   - V.E.T Web App (browser)
   - Blynk Mobile App (iOS/Android)

---

## Step 1: Install Required Libraries

### Arduino IDE Libraries:

1. **Blynk Library for ESP32**:
   - Open Arduino IDE
   - Go to `Tools` → `Manage Libraries`
   - Search for: **"Blynk"**
   - Install: **"Blynk by Volodymyr Shymanskyy"** (latest version)

2. **Other Required Libraries** (if not already installed):
   - OneWire
   - DallasTemperature
   - ESP32 Board Support (for ESP32 Dev Module)

### Install ESP32 Board Support:
1. Go to `File` → `Preferences`
2. Add this URL to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to `Tools` → `Board` → `Boards Manager`
4. Search for "ESP32" and install

---

## Step 2: Get Your Blynk Auth Token

1. **Download Blynk App**:
   - iOS: [App Store](https://apps.apple.com/app/blynk-iot/id808755481)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=cc.blynk)

2. **Create Blynk Account**:
   - Open Blynk app
   - Sign up or log in

3. **Create New Project**:
   - Tap `+` to create new project
   - Name: "VET Collar" (or any name)
   - Device: **ESP32 Dev Board**
   - Connection Type: **WiFi**
   - Tap `Create`

4. **Get Auth Token**:
   - After creating project, you'll receive an **Auth Token** via email
   - OR tap the QR code in the app to see the token
   - Copy this token (looks like: `XwcA_woUbavQ_CUt2_YJX66z7XLjtR4T`)

---

## Step 3: Configure the Code

Open `collar.ino` and update these values:

### WiFi Credentials:
```cpp
const char* ssid = "YOUR_WIFI_NAME";        // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password
```

### Blynk Configuration:
```cpp
#define BLYNK_AUTH_TOKEN "XwcA_woUbavQ_CUt2_YJX66z7XLjtR4T"  // Paste your Blynk token here
```

**Optional** (for Blynk Templates):
```cpp
#define BLYNK_TEMPLATE_ID "TMPL64ATz1cMw"    // If using Blynk template
#define BLYNK_TEMPLATE_NAME "VET_Collar"     // Template name
```

### V.E.T API Configuration:
```cpp
const char* apiBaseURL = "https://your-backend.com/api";  // Your V.E.T backend URL
const char* dogId = "507f1f77bcf86cd799439011";           // Your dog's MongoDB ID
const char* authToken = "eyJhbGciOiJIUzI1NiIs...";        // Your JWT token (from Profile page)
```

**How to get V.E.T tokens:**
- Log in to V.E.T web app
- Go to Profile page
- Click "Collar Setup"
- Copy Auth Token and Dog ID

---

## Step 4: Set Up Blynk Dashboard (Mobile App)

### Add Widgets to Your Blynk Project:

1. **Temperature Display (Celsius)**:
   - Tap `+` to add widget
   - Select **Gauge** widget
   - Pin: **V1** (Virtual Pin 1)
   - Label: "Temperature (°C)"
   - Range: 30-45 (typical dog temperature range)
   - Color: Green

2. **Temperature Display (Fahrenheit)**:
   - Add another **Gauge** widget
   - Pin: **V2**
   - Label: "Temperature (°F)"
   - Range: 85-110

3. **Heart Rate Display**:
   - Add **SuperChart** or **Gauge** widget
   - Pin: **V3**
   - Label: "Heart Rate (BPM)"
   - Range: 40-200 (typical dog heart rate)

4. **Status Indicator**:
   - Add **LED** widget
   - Pin: **V4**
   - Label: "Connection Status"
   - Shows green when connected (1), red when disconnected (0)

5. **Waveform Display** (Optional):
   - Add **SuperChart** widget
   - Pin: **V5**
   - Label: "Raw Waveform Signal"
   - Type: Line chart

### Virtual Pin Reference:
- **V1**: Temperature (°C)
- **V2**: Temperature (°F)
- **V3**: Heart Rate (BPM)
- **V4**: Connection Status (1=OK, 0=Error)
- **V5**: Raw Waveform Signal

---

## Step 5: Upload Code to ESP32

1. **Select Board**:
   - `Tools` → `Board` → `ESP32 Dev Module`

2. **Select Port**:
   - `Tools` → `Port` → Select your COM port (e.g., COM3)

3. **Upload**:
   - Click Upload button (→)
   - Wait for "Done uploading" message

4. **Open Serial Monitor**:
   - `Tools` → `Serial Monitor`
   - Set baud rate to **115200**
   - You should see:
     ```
     === V.E.T Collar System Starting ===
     Hybrid Mode: WiFi (primary) + USB Serial (fallback)
     Sensors initialized
     Connecting to WiFi: YourWiFiName
     WiFi Connected!
     IP Address: 192.168.1.45
     Mode: WiFi (sending data to V.E.T API + Blynk)
     Initializing Blynk...
     Blynk Connected!
     Data sent to Blynk successfully!
     Data sent successfully via WiFi!
     ```

---

## Step 6: Monitor Data

### V.E.T Web App:
1. Log in to your V.E.T web app
2. Navigate to your dog's profile
3. View real-time vitals data
4. Data is stored in MongoDB

### Blynk Mobile App:
1. Open Blynk app on your phone
2. Select your "VET Collar" project
3. You should see:
   - Temperature gauges updating
   - Heart rate display
   - Connection status LED (green)
4. Data updates every 5 seconds

---

## Troubleshooting

### Blynk Not Connecting:

**Check:**
1. ✅ WiFi credentials are correct
2. ✅ Blynk auth token is correct (no spaces)
3. ✅ ESP32 is on 2.4GHz WiFi (Blynk requires 2.4GHz)
4. ✅ Internet connection is working

**Solution:**
- Check Serial Monitor for error messages
- Verify Blynk token in the app matches code
- Try disconnecting and reconnecting WiFi

### V.E.T API Not Receiving Data:

**Check:**
1. ✅ Backend URL is correct
2. ✅ Dog ID is correct (MongoDB ObjectId)
3. ✅ JWT token is valid (not expired)
4. ✅ Backend server is running and accessible

**Solution:**
- Check Serial Monitor for HTTP response codes
- Get fresh JWT token from Profile page
- Verify backend API endpoint is accessible

### Both Systems Work, But One Fails:

**If Blynk works but V.E.T doesn't:**
- Check V.E.T API credentials
- Verify backend is accessible from ESP32's network

**If V.E.T works but Blynk doesn't:**
- Check Blynk auth token
- Verify Blynk app is logged in
- Check internet connectivity

### WiFi Connection Issues:

- Ensure ESP32 supports 2.4GHz WiFi (not 5GHz)
- Check WiFi password is correct
- Move ESP32 closer to router
- Check Serial Monitor for connection attempts

---

## Advanced Configuration

### Change Update Interval:

```cpp
const unsigned long UPDATE_INTERVAL = 5000;  // Change to desired milliseconds
// Example: 10000 = 10 seconds
```

### Change Blynk Virtual Pins:

```cpp
#define VIRTUAL_PIN_TEMP V1      // Change V1 to any V0-V255
#define VIRTUAL_PIN_TEMPF V2
#define VIRTUAL_PIN_HEARTRATE V3
// etc.
```

**Important:** If you change pins, update your Blynk dashboard widgets to match!

### Add Blynk Controls (Optional):

You can add buttons/controls to Blynk to control the collar:

```cpp
BLYNK_WRITE(V10) {  // Add button widget on V10
  int value = param.asInt();
  if (value == 1) {
    // Do something when button pressed
    Serial.println("Button pressed!");
  }
}
```

---

## Benefits of Dual Integration

### V.E.T Backend API:
- ✅ **Persistent Storage**: Data saved in MongoDB
- ✅ **Web Access**: View from any browser
- ✅ **Multiple Users**: Share access via web app
- ✅ **Historical Data**: Track trends over time
- ✅ **Backend Processing**: Server-side analysis

### Blynk Cloud:
- ✅ **Mobile App**: Monitor on phone/tablet
- ✅ **Real-time Alerts**: Push notifications
- ✅ **Quick Access**: Faster than opening browser
- ✅ **Visual Dashboards**: Customizable widgets
- ✅ **Offline Viewing**: Cache data in app

### Combined Benefits:
- **Redundancy**: If one fails, other still works
- **Flexibility**: Use whichever platform you prefer
- **Multiple Access Points**: Web + Mobile simultaneously
- **Better Monitoring**: Real-time + Historical data

---

## Virtual Pin Mapping Reference

| Virtual Pin | Data Type | Description | Range/Format |
|------------|-----------|-------------|--------------|
| V1 | Float | Temperature (°C) | 30-45 |
| V2 | Float | Temperature (°F) | 85-110 |
| V3 | Integer | Heart Rate (BPM) | 40-200 |
| V4 | Integer | Connection Status | 0 or 1 |
| V5 | Integer | Raw Waveform | 0-4095 |

**Note:** You can use different virtual pins by changing the `#define` values in the code.

---

## Next Steps

1. ✅ Upload code to ESP32
2. ✅ Set up Blynk dashboard
3. ✅ Test both platforms
4. ✅ Monitor data in real-time
5. ✅ Set up Blynk alerts (optional)
6. ✅ Add more widgets as needed

---

## Support

For issues:
- **Blynk**: Check [Blynk Documentation](https://docs.blynk.io/)
- **V.E.T**: Check Profile page for setup instructions
- **Serial Monitor**: Always check for error messages

**Happy Monitoring! 🐕📊**

