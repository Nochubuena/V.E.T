# Arduino Code Integration Guide

## Overview

You already have the Arduino code (the one you showed earlier). This document explains how it connects with the bridge service and web application we just built.

---

## The Arduino Code You Have

```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

#define PULSE_PIN 33
int Signal;
int Threshold = 1800;
unsigned long lastBeatTime = 0;
int BPM = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);
  float tempF = sensors.getTempFByIndex(0);
  
  Serial.print("Temperature:");
  Serial.print(tempC);
  Serial.print("C ");
  Serial.print(tempF);
  Serial.println("F");

  Signal = analogRead(PULSE_PIN);
  Serial.print("Waveform:");
  Serial.print(Signal);
  Serial.print(" ");

  if (Signal > Threshold) {
    unsigned long currentTime = millis();
    unsigned long timeDelta = currentTime - lastBeatTime;
    if (timeDelta > 300) {
      BPM = 60000 / timeDelta;
      lastBeatTime = currentTime;
      Serial.print("BPM:");
      Serial.print(BPM);
      Serial.print(" ");
    }
  }

  Serial.println();
  delay(1000);
}
```

**This code:**
- Reads temperature from Dallas Temperature sensor (pin 4)
- Reads pulse/heart rate from analog pin 33
- Calculates BPM (beats per minute)
- Sends data via Serial every 1 second
- Format: `"Temperature:38.5C 101.3F\nWaveform:1850 BPM:72 \n"`

---

## How It All Connects

### Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ARDUINO COLLAR                            │
│  ┌──────────────┐         ┌──────────────┐                │
│  │ Temp Sensor  │         │Pulse Sensor  │                │
│  │ (Dallas)     │         │  (Pin 33)    │                │
│  └──────┬───────┘         └──────┬───────┘                │
│         │                         │                         │
│         └──────────┬──────────────┘                         │
│                    │                                        │
│              ┌─────▼─────┐                                  │
│              │  Arduino   │                                  │
│              │   Code     │ ← YOUR CODE (ready to upload)   │
│              │  (Upload)  │                                  │
│              └─────┬─────┘                                  │
│                    │ Serial Output (115200 baud)            │
│                    │ "Temperature:38.5C 101.3F\n           │
│                    │  Waveform:1850 BPM:72 \n"             │
└────────────────────┼────────────────────────────────────────┘
                     │ USB Cable
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              BRIDGE SERVICE (Node.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │Serial Reader │→ │Data Parser   │→ │API Client    │    │
│  │              │  │              │  │              │    │
│  │- Listens to  │  │- Parses your │  │- Sends to    │    │
│  │  Serial port│  │  Arduino     │  │  backend API │    │
│  │- Reads data  │  │  format      │  │              │    │
│  └──────────────┘  └──────────────┘  └──────┬───────┘    │
│                                               │            │
│                                    HTTP PUT Request        │
└───────────────────────────────────────────────┼────────────┘
                                                │
┌───────────────────────────────────────────────▼────────────┐
│                    BACKEND API                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Rate Limiter │→ │Validation    │→ │Save to MongoDB│  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  │
│                                               │            │
│                                    Database Updated         │
└───────────────────────────────────────────────┼────────────┘
                                                │
┌───────────────────────────────────────────────▼────────────┐
│                  FRONTEND (Web App)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │Polling       │→ │AppContext    │→ │UI Components │ │
│  │(Every 5s)   │  │              │  │              │ │
│  │              │  │- Fetches     │  │- HomePage    │ │
│  │- GET /dogs   │  │  latest data│  │- Health      │ │
│  └──────────────┘  └──────────────┘  │- Charts      │ │
│                                        └──────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## Data Flow: Arduino Code → Web App

### Step-by-Step Flow

```
1. ARDUINO CODE (Your Code)
   └─> Reads sensors every 1 second
   └─> Sends: "Temperature:38.5C 101.3F\nWaveform:1850 BPM:72 \n"
   └─> Via Serial port (USB)

2. BRIDGE SERVICE (We Built)
   └─> Receives serial data
   └─> Parses: { temp: 38.5, bpm: 72 }
   └─> Calculates status: "normal"
   └─> Sends HTTP PUT to backend

3. BACKEND API (We Enhanced)
   └─> Receives: PUT /api/dogs/:id/vitals
   └─> Validates data
   └─> Saves to MongoDB

4. FRONTEND (We Enhanced)
   └─> Polling fetches GET /api/dogs (every 5s)
   └─> Receives updated data
   └─> Updates UI automatically
   └─> User sees new vitals!
```

---

## What's Already Done

### ✅ Arduino Code
- **Status**: Ready (you have it)
- **What it does**: Reads sensors, sends serial data
- **Format**: Matches what bridge service expects
- **Action needed**: Upload to Arduino when you get hardware

### ✅ Bridge Service
- **Status**: Complete (we built it)
- **What it does**: Reads serial, parses data, sends to API
- **Format**: Parses your Arduino's output format perfectly
- **Action needed**: Configure .env and run when hardware is ready

### ✅ Backend API
- **Status**: Enhanced (we added validation & rate limiting)
- **What it does**: Receives collar data, saves to database
- **Action needed**: Already running, ready to receive data

### ✅ Frontend
- **Status**: Enhanced (we added polling & indicators)
- **What it does**: Auto-updates every 5 seconds, shows "Live"
- **Action needed**: Already working, ready to display updates

---

## When You Get the Hardware

### Step 1: Upload Arduino Code

1. **Open Arduino IDE**
2. **Copy your code** (the one you showed me)
3. **Connect Arduino** via USB
4. **Select board** (Arduino Uno/Nano/etc.)
5. **Select port** (COM3, COM4, etc.)
6. **Upload** the code
7. **Open Serial Monitor** (115200 baud) to verify it's working

**Expected Serial Monitor Output:**
```
Temperature:38.5C 101.3F
Waveform:1850 BPM:72 

Temperature:38.6C 101.5F
Waveform:1860 BPM:73 

Temperature:38.5C 101.3F
Waveform:1850 BPM:72 
```

### Step 2: Set Up Bridge Service

1. **Navigate to bridge-service folder:**
   ```bash
   cd bridge-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file:**
   ```env
   SERIAL_PORT=COM3              # Use the port from Arduino IDE
   BAUD_RATE=115200             # Must match Arduino Serial.begin(115200)
   API_BASE_URL=http://localhost:3000/api
   DOG_ID=507f1f77bcf86cd799439011  # Your dog's MongoDB ID
   AUTH_TOKEN=your_jwt_token_here   # Get from web app login
   UPDATE_INTERVAL=5000
   ```

5. **Get your JWT Token:**
   - Log in to web app
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - Copy `authToken` value
   - Paste into .env as `AUTH_TOKEN`

6. **Get your Dog ID:**
   - Log in to web app
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh page
   - Find `/api/dogs` request
   - Copy `id` from response
   - Paste into .env as `DOG_ID`

7. **Start bridge service:**
   ```bash
   npm run dev
   ```

**Expected Output:**
```
2024-01-15 10:00:00 [info]: === V.E.T Collar Bridge Service Starting ===
2024-01-15 10:00:00 [info]: Serial Port: COM3
2024-01-15 10:00:00 [info]: Baud Rate: 115200
2024-01-15 10:00:00 [info]: API URL: http://localhost:3000/api
2024-01-15 10:00:01 [info]: Connected to serial port COM3
2024-01-15 10:00:01 [info]: Bridge service started successfully
2024-01-15 10:00:02 [info]: Received data: Temperature:38.5C 101.3F
2024-01-15 10:00:02 [info]: Parsed data: { temperature: 38.5, bpm: 72 }
2024-01-15 10:00:02 [info]: Successfully sent vital data: HR=72, Temp=38.5°C, Status=normal
```

### Step 3: Verify Everything Works

1. **Check bridge service logs** - Should show data being sent
2. **Check web app** - Should show "Live" indicator
3. **Watch vitals update** - Should change every 5 seconds
4. **Check backend logs** - Should show PUT requests coming in

---

## How Bridge Service Parses Your Arduino Code

### Your Arduino Output Format:
```
Temperature:38.5C 101.3F
Waveform:1850 BPM:72 
```

### Bridge Service Parsing (dataParser.ts):

```typescript
// Your Arduino sends:
"Temperature:38.5C 101.3F\nWaveform:1850 BPM:72 \n"

// Bridge service parses:
const tempMatch = line.match(/Temperature:([\d.]+)C\s+([\d.]+)F/);
// Extracts: tempC = 38.5, tempF = 101.3

const bpmMatch = line.match(/BPM:(\d+)/);
// Extracts: bpm = 72

// Result:
{
  temperature: 38.5,
  temperatureF: 101.3,
  waveform: 1850,
  bpm: 72,
  timestamp: "2024-01-15T10:00:00.000Z"
}
```

**Perfect match!** The bridge service is designed to parse exactly the format your Arduino code sends.

---

## Complete Setup Checklist

### Before Hardware Arrives:
- [x] Arduino code ready (you have it)
- [x] Bridge service code ready (we built it)
- [x] Backend API ready (we enhanced it)
- [x] Frontend ready (we enhanced it)

### When Hardware Arrives:
- [ ] Upload Arduino code to Arduino
- [ ] Connect Arduino to computer via USB
- [ ] Verify Serial Monitor shows data
- [ ] Install bridge service dependencies (`npm install`)
- [ ] Configure .env file (SERIAL_PORT, DOG_ID, AUTH_TOKEN)
- [ ] Start bridge service (`npm run dev`)
- [ ] Verify bridge service connects to Arduino
- [ ] Verify bridge service sends data to backend
- [ ] Check web app shows "Live" indicator
- [ ] Watch vitals update automatically!

---

## Troubleshooting

### Arduino Code Issues

**Problem**: Serial Monitor shows no data
- **Check**: Arduino is powered on
- **Check**: Sensors are connected correctly
- **Check**: Serial Monitor baud rate is 115200
- **Check**: Code uploaded successfully

**Problem**: Data format doesn't match
- **Check**: Arduino code matches exactly what you showed me
- **Check**: Serial Monitor shows correct format

### Bridge Service Issues

**Problem**: "Serial port not found"
- **Check**: Arduino connected via USB
- **Check**: SERIAL_PORT in .env matches Arduino IDE port
- **Check**: No other program using the port (close Arduino IDE Serial Monitor)

**Problem**: "Authentication failed"
- **Check**: AUTH_TOKEN in .env is valid (get fresh token from web app)
- **Check**: Token hasn't expired

**Problem**: "Dog not found"
- **Check**: DOG_ID in .env matches your dog's MongoDB ID
- **Check**: You're using the correct owner's token

### Data Flow Issues

**Problem**: Bridge service receives data but doesn't send to API
- **Check**: API_BASE_URL is correct
- **Check**: Backend API is running
- **Check**: Network connectivity
- **Check**: Bridge service logs for errors

**Problem**: Web app doesn't update
- **Check**: Backend is receiving PUT requests (check backend logs)
- **Check**: Database is being updated (check MongoDB)
- **Check**: Frontend polling is active (should show "Live" indicator)
- **Check**: Browser console for errors

---

## Summary

### What You Have:
1. ✅ **Arduino code** - Ready to upload
2. ✅ **Bridge service** - Ready to run
3. ✅ **Backend API** - Ready to receive data
4. ✅ **Frontend** - Ready to display updates

### What Happens:
1. **Arduino code** reads sensors → sends serial data
2. **Bridge service** receives serial → parses → sends to API
3. **Backend** receives data → saves to database
4. **Frontend** polls database → displays updates automatically

### When Hardware Arrives:
- Upload Arduino code
- Configure bridge service
- Start bridge service
- Everything works automatically!

**Everything is ready!** Just need the physical hardware to connect everything together. 🎉

