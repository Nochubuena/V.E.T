# Quick Start: Blynk + V.E.T Integration

## ⚡ Quick Setup (3 Steps)

### 1. Install Blynk Library
```
Arduino IDE → Tools → Manage Libraries → Search "Blynk" → Install
```

### 2. Get Your Tokens

**Blynk Token:**
- Download Blynk app (iOS/Android)
- Create new project → Copy auth token

**V.E.T Token:**
- Log in to V.E.T web app
- Go to Profile → Collar Setup → Copy tokens

### 3. Configure Code

Update these 5 values in `collar.ino`:

```cpp
// Line 15-16: WiFi
const char* ssid = "YourWiFi";
const char* password = "YourPassword";

// Line 21: Blynk
#define BLYNK_AUTH_TOKEN "your_blynk_token_here"

// Line 24-26: V.E.T
const char* apiBaseURL = "https://your-backend.com/api";
const char* dogId = "your_dog_id";
const char* authToken = "your_jwt_token";
```

## 📱 Blynk Dashboard Setup

Add these widgets in Blynk app:
- **V1**: Gauge → Temperature (°C) → Range 30-45
- **V2**: Gauge → Temperature (°F) → Range 85-110  
- **V3**: SuperChart → Heart Rate (BPM) → Range 40-200
- **V4**: LED → Connection Status
- **V5**: SuperChart → Waveform (Optional)

## ✅ Upload & Monitor

1. Upload code to ESP32
2. Open Serial Monitor (115200 baud)
3. Check Blynk app → See live data
4. Check V.E.T web app → See stored data

## 🔄 Data Flow

```
ESP32 Sensors
    ↓
WiFi Connection
    ├──→ V.E.T API → Web App
    └──→ Blynk Cloud → Mobile App
```

**Both platforms receive data simultaneously!**

## 📋 Virtual Pin Reference

| Pin | Data | Widget Type |
|-----|------|-------------|
| V1 | Temp (°C) | Gauge |
| V2 | Temp (°F) | Gauge |
| V3 | Heart Rate | SuperChart |
| V4 | Status | LED |
| V5 | Waveform | SuperChart |

## 🆘 Troubleshooting

**Blynk not connecting?**
- Check WiFi (2.4GHz only)
- Verify Blynk token is correct
- Check Serial Monitor for errors

**V.E.T not receiving data?**
- Verify JWT token from Profile page
- Check backend URL is accessible
- Verify Dog ID is correct

**Need help?**
- See full guide: `BLYNK_VET_INTEGRATION_GUIDE.md`
- Check Serial Monitor for detailed logs

---

**That's it! You now have dual-platform monitoring! 🎉**

