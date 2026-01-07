# How the Collar Connects to the Website - Complete Guide

## 🎯 Overview: The Complete Data Flow

The collar (Arduino/ESP32) connects to your website through a **4-layer architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: COLLAR (Arduino/ESP32) - On the Dog                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Reads temperature sensor (DS18B20)                   │  │
│  │  • Reads pulse sensor (analog pin)                      │  │
│  │  • Calculates BPM from pulse waveform                  │  │
│  │  • Sends data via Serial/USB                            │  │
│  │                                                          │  │
│  │  Output Format:                                         │  │
│  │  "Temperature:38.5C 101.3F"                            │  │
│  │  "Waveform:1850 BPM:72"                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ USB/Serial Cable
                          │ (Physical Connection)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: BRIDGE SERVICE - On Home Computer                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Reads serial data from Arduino                       │  │
│  │  • Parses temperature and BPM                           │  │
│  │  • Validates data                                        │  │
│  │  • Sends HTTP requests to backend API                   │  │
│  │                                                          │  │
│  │  Code: bridge-service/src/index.ts                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests (Internet)
                          │ PUT /api/dogs/:id/vitals
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: BACKEND API - Cloud Server                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Receives HTTP requests from bridge service            │  │
│  │  • Validates authentication (JWT token)                 │  │
│  │  • Validates data (temperature, heartRate)               │  │
│  │  • Saves to MongoDB database                             │  │
│  │                                                          │  │
│  │  Code: backend/src/routes/dogs.ts                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ Database Write
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: MONGODB DATABASE - Cloud Storage                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Stores:                                                 │  │
│  │  {                                                       │  │
│  │    _id: "507f1f77bcf86cd799439011",                     │  │
│  │    name: "Max",                                          │  │
│  │    heartRate: 72,                                        │  │
│  │    temperature: 38.5,                                    │  │
│  │    vitalRecords: [                                       │  │
│  │      { heartRate: 72, temperature: 38.5, time: "..." }  │  │
│  │    ]                                                     │  │
│  │  }                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP GET Request
                          │ (Every 1 minute)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5: WEBSITE (Frontend) - Owner's Browser                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Fetches data from backend API                        │  │
│  │  • GET /api/dogs                                         │  │
│  │  • Displays current heartRate and temperature            │  │
│  │  • Shows historical charts                              │  │
│  │                                                          │  │
│  │  Code: src/context/AppContext.tsx                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Step-by-Step: How Data Flows

### Step 1: Collar Reads Sensors (Arduino Code)

**Location**: `arduino/collar/collar.ino`

**What Happens**:
```cpp
void loop() {
  // Read temperature from DS18B20 sensor
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);
  float tempF = sensors.getTempFByIndex(0);
  
  // Read pulse sensor
  Signal = analogRead(PULSE_PIN);
  
  // Calculate BPM when pulse detected
  if (Signal > Threshold) {
    BPM = 60000 / timeDelta;
  }
  
  // Send data via Serial
  Serial.print("Temperature:");
  Serial.print(tempC);
  Serial.print("C ");
  Serial.print(tempF);
  Serial.println("F");
  
  Serial.print("Waveform:");
  Serial.print(Signal);
  Serial.print(" ");
  Serial.print("BPM:");
  Serial.print(BPM);
  Serial.println();
  
  delay(1000); // Send every 1 second
}
```

**Output Example**:
```
Temperature:38.5C 101.3F
Waveform:1850 BPM:72 
```

**Key Points**:
- Arduino runs continuously (every 1 second)
- Data sent via USB Serial connection
- No internet connection needed on Arduino
- Physical connection to computer required

---

### Step 2: Bridge Service Reads Serial Data

**Location**: `bridge-service/src/serialReader.ts`

**What Happens**:

1. **Connect to Serial Port**:
```typescript
const port = new SerialPort({
  path: 'COM3',        // From .env file (Windows: COM3, Linux: /dev/ttyUSB0)
  baudRate: 115200,   // Must match Arduino Serial.begin(115200)
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
});
```

2. **Listen for Data**:
```typescript
parser.on('data', (data: string) => {
  // Receives: "Temperature:38.5C 101.3F\nWaveform:1850 BPM:72 \n"
  onDataCallback(data.toString());
});
```

3. **Accumulate Complete Readings**:
```typescript
// Buffer accumulates data until we have both Temperature and Waveform
dataBuffer += data;

if (dataBuffer.includes('Temperature:') && dataBuffer.includes('Waveform:')) {
  // We have a complete reading - parse it
  const parsedData = parseSerialData(dataBuffer);
  // ... send to API
}
```

**Configuration** (`.env` file):
```env
SERIAL_PORT=COM3              # Windows: COM3, COM4, etc.
                             # Linux: /dev/ttyUSB0, /dev/ttyACM0
BAUD_RATE=115200             # Must match Arduino
```

**Key Points**:
- Bridge service runs on computer at home
- Connects to Arduino via USB/Serial
- Reads data continuously (every second)
- Parses raw strings into structured data

---

### Step 3: Bridge Service Parses Data

**Location**: `bridge-service/src/dataParser.ts`

**What Happens**:

1. **Parse Temperature**:
```typescript
function parseTemperature(line: string) {
  // Input: "Temperature:38.5C 101.3F"
  const match = line.match(/Temperature:([\d.]+)C\s+([\d.]+)F/);
  // Returns: { tempC: 38.5, tempF: 101.3 }
}
```

2. **Parse Heart Rate**:
```typescript
function parseWaveformAndBPM(line: string) {
  // Input: "Waveform:1850 BPM:72"
  const waveformMatch = line.match(/Waveform:(\d+)/);
  const bpmMatch = line.match(/BPM:(\d+)/);
  // Returns: { waveform: 1850, bpm: 72 }
}
```

3. **Validate Data**:
```typescript
function validateParsedData(data: ParsedData): boolean {
  // Temperature must be 20-50°C (reasonable for dogs)
  if (data.temperature < 20 || data.temperature > 50) {
    return false;
  }
  
  // BPM must be 0-300 (reasonable for dogs)
  if (data.bpm !== null && (data.bpm < 0 || data.bpm > 300)) {
    return false;
  }
  
  return true;
}
```

**Result**:
```typescript
{
  temperature: 38.5,      // Celsius
  temperatureF: 101.3,    // Fahrenheit
  waveform: 1850,        // Raw sensor value
  bpm: 72,               // Beats per minute
  timestamp: "2024-01-15T10:00:00Z"
}
```

---

### Step 4: Bridge Service Sends to Backend API

**Location**: `bridge-service/src/apiClient.ts`

**What Happens**:

1. **Prepare HTTP Request**:
```typescript
const payload = {
  heartRate: data.bpm || 0,
  temperature: data.temperature,
  status: calculateVitalStatus(data.temperature, data.bpm),
  time: data.timestamp
};
```

2. **Send HTTP PUT Request**:
```typescript
await axios.put(
  `https://your-api.com/api/dogs/${dogId}/vitals`,
  payload,
  {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  }
);
```

**Configuration** (`.env` file):
```env
API_BASE_URL=http://localhost:3000/api    # Your backend URL
DOG_ID=507f1f77bcf86cd799439011          # MongoDB ObjectId
AUTH_TOKEN=eyJhbGciOiJIUzI1NiIs...       # JWT token from login
UPDATE_INTERVAL=5000                      # Send every 5 seconds
```

**Key Points**:
- Sends HTTP requests to your backend
- Uses JWT token for authentication
- Rate limiting: Only sends if enough time has passed
- Retry logic: Retries on failure (up to 3 times)

---

### Step 5: Backend Receives and Saves Data

**Location**: `backend/src/routes/dogs.ts`

**What Happens**:

1. **Receive HTTP Request**:
```typescript
router.put('/:id/vitals', authenticate, collarLimiter, async (req, res) => {
  const { heartRate, temperature, status, time } = req.body;
  
  // Validate data
  if (heartRate < 0 || heartRate > 300) {
    return res.status(400).json({ error: 'Invalid heartRate' });
  }
  
  if (temperature < 20 || temperature > 50) {
    return res.status(400).json({ error: 'Invalid temperature' });
  }
});
```

2. **Update Database**:
```typescript
const dog = await Dog.findOne({ _id: id, ownerId: req.userId });

// Update current vitals
dog.heartRate = heartRate;
dog.temperature = temperature;

// Add to historical records
dog.vitalRecords.push({
  heartRate,
  temperature,
  status: status || 'normal',
  time: time || new Date().toISOString()
});

// Keep only last 1000 records
if (dog.vitalRecords.length > 1000) {
  dog.vitalRecords = dog.vitalRecords.slice(-1000);
}

await dog.save();
```

3. **Return Response**:
```typescript
res.json({
  id: dog._id.toString(),
  heartRate: dog.heartRate,
  temperature: dog.temperature,
  vitalRecords: dog.vitalRecords
});
```

**Key Points**:
- Validates authentication (JWT token)
- Validates data ranges
- Updates both current values and historical records
- Rate limiting prevents too many requests

---

### Step 6: Website Fetches Data

**Location**: `src/context/AppContext.tsx`

**What Happens**:

1. **Polling Mechanism** (Every 1 minute):
```typescript
useEffect(() => {
  if (!isLoggedIn || !owner) return;
  
  // Fetch immediately
  fetchDogs();
  
  // Then fetch every 1 minute
  const interval = setInterval(() => {
    fetchDogs();
  }, 60000); // 60000ms = 1 minute
  
  return () => clearInterval(interval);
}, [isLoggedIn, owner]);
```

2. **HTTP GET Request**:
```typescript
const fetchDogs = async () => {
  const response = await api.get('/dogs');
  // Response contains:
  // [
  //   {
  //     id: "507f1f77bcf86cd799439011",
  //     name: "Max",
  //     heartRate: 72,
  //     temperature: 38.5,
  //     vitalRecords: [...]
  //   }
  // ]
  setDogs(response.data);
};
```

3. **Display Data**:
```typescript
// In HomePage.tsx or ProfilePageVitals.tsx
<Text>{dog.heartRate} BPM</Text>
<Text>{dog.temperature}°C</Text>
```

**Key Points**:
- Website fetches data from backend API (not directly from collar)
- Polling every 1 minute to get latest data
- Data comes from MongoDB database
- Owner can check from anywhere (phone, computer, tablet)

---

## 🔌 Physical Connection Setup

### Hardware Requirements

1. **Arduino/ESP32 Board**
   - ESP32 Dev Module (or similar)
   - USB cable for programming and power

2. **Sensors**
   - DS18B20 Temperature Sensor (connected to Pin 4)
   - Pulse Sensor (connected to Pin 33/GPIO33)

3. **Computer**
   - Windows/Mac/Linux computer
   - USB port for Arduino connection
   - Internet connection (WiFi/Ethernet)

### Connection Steps

1. **Connect Arduino to Computer**:
   ```
   Arduino USB Cable → Computer USB Port
   ```

2. **Find Serial Port**:
   - **Windows**: Open Device Manager → Ports (COM & LPT) → Look for "COM3", "COM4", etc.
   - **Linux**: Run `ls /dev/ttyUSB*` or `ls /dev/ttyACM*`
   - **Mac**: Run `ls /dev/tty.usbserial*` or `ls /dev/tty.usbmodem*`

3. **Update Bridge Service `.env`**:
   ```env
   SERIAL_PORT=COM3              # Use the port you found
   BAUD_RATE=115200              # Must match Arduino code
   ```

4. **Start Bridge Service**:
   ```bash
   cd bridge-service
   npm install
   npm start
   ```

---

## 🔄 Complete Data Flow Timeline

### Example: Dog at Home, Owner at Work

```
10:00:00 AM
┌─────────────────────────────────────────────────────────────┐
│ AT HOME:                                                    │
│                                                             │
│ 1. Arduino reads sensors:                                   │
│    - Temperature: 38.5°C                                    │
│    - Pulse: 72 BPM                                          │
│                                                             │
│ 2. Arduino sends via Serial:                                │
│    "Temperature:38.5C 101.3F"                              │
│    "Waveform:1850 BPM:72"                                   │
│                                                             │
│ 3. Bridge Service receives data                             │
│ 4. Bridge Service parses data                               │
│ 5. Bridge Service sends HTTP PUT to backend                │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ Internet
                    │
┌───────────────────▼─────────────────────────────────────────┐
│ IN THE CLOUD:                                               │
│                                                             │
│ 6. Backend API receives request                             │
│ 7. Backend validates data                                   │
│ 8. Backend saves to MongoDB:                                │
│    {                                                        │
│      heartRate: 72,                                         │
│      temperature: 38.5,                                     │
│      vitalRecords: [..., { heartRate: 72, temp: 38.5 }]   │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ (Data stored, waiting)
                    │
┌───────────────────▼─────────────────────────────────────────┐
│ AT WORK (Owner's Location):                                │
│                                                             │
│ 9. Owner opens web app on phone                            │
│ 10. Web app sends GET /api/dogs                            │
│ 11. Backend responds with latest data from MongoDB         │
│ 12. Web app displays:                                      │
│     "Max's Heart Rate: 72 BPM"                            │
│     "Max's Temperature: 38.5°C"                            │
│                                                             │
│ 13. Web app auto-refreshes every 1 minute                  │
│     (Shows updated data automatically)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ How to Set Up the Connection

### Step 1: Prepare Arduino

1. **Upload Code**:
   ```bash
   # Open Arduino IDE
   # Open collar.ino
   # Select Board: ESP32 Dev Module
   # Select Port: COM3 (or your port)
   # Click Upload
   ```

2. **Verify Output**:
   - Open Serial Monitor (115200 baud)
   - You should see:
     ```
     Temperature:38.5C 101.3F
     Waveform:1850 BPM:72
     ```

### Step 2: Set Up Bridge Service

1. **Install Dependencies**:
   ```bash
   cd bridge-service
   npm install
   ```

2. **Create `.env` File**:
   ```env
   SERIAL_PORT=COM3
   BAUD_RATE=115200
   API_BASE_URL=http://localhost:3000/api
   DOG_ID=507f1f77bcf86cd799439011
   AUTH_TOKEN=your_jwt_token_here
   UPDATE_INTERVAL=5000
   ```

3. **Get Auth Token**:
   - Login to your web app
   - Open browser DevTools → Application → Local Storage
   - Copy `authToken` value
   - Paste into `.env` file

4. **Get Dog ID**:
   - Login to web app
   - Open browser DevTools → Network tab
   - Make a request to `/api/dogs`
   - Copy the `id` field from response
   - Paste into `.env` file

5. **Start Bridge Service**:
   ```bash
   npm start
   ```

### Step 3: Verify Connection

1. **Check Bridge Service Logs**:
   ```
   [INFO] Serial port opened: COM3
   [INFO] Parsed data: { temperature: 38.5, bpm: 72 }
   [INFO] Successfully sent vital data: HR=72, Temp=38.5°C
   ```

2. **Check Backend Logs**:
   ```
   PUT /api/dogs/507f1f77bcf86cd799439011/vitals 200
   ```

3. **Check Web App**:
   - Open web app
   - You should see updated heart rate and temperature
   - Data should update every 1 minute

---

## ❓ Common Questions

### Q: Does the collar need internet?
**A**: No. The collar only needs USB/Serial connection to the bridge service computer. The bridge service computer needs internet to send data to the cloud.

### Q: Can I check data from anywhere?
**A**: Yes. As long as your backend is accessible (cloud hosted), you can check the web app from anywhere and see the latest data from the database.

### Q: What if the bridge service goes offline?
**A**: Data stops updating in the database. The web app will show the last known data. The bridge service has reconnection logic to resume updates when it comes back online.

### Q: How often does data update?
**A**: 
- **Collar**: Reads sensors every 1 second
- **Bridge Service**: Sends to backend every 5 seconds (configurable)
- **Website**: Fetches from backend every 1 minute (configurable)

### Q: Can I have multiple dogs with collars?
**A**: Yes. Each collar needs its own bridge service instance with a different `DOG_ID` in the `.env` file.

### Q: What if I unplug the Arduino?
**A**: The bridge service will detect the disconnection and attempt to reconnect. When you plug it back in, it will automatically resume sending data.

---

## 📝 Summary

**The Connection Flow**:
1. **Collar** (Arduino) → Reads sensors → Sends via USB Serial
2. **Bridge Service** → Reads Serial → Parses data → Sends HTTP to backend
3. **Backend API** → Receives HTTP → Validates → Saves to MongoDB
4. **Website** → Fetches from backend → Displays to owner

**Key Points**:
- Collar connects via USB/Serial (physical connection)
- Bridge service connects via Internet (HTTP requests)
- Website connects via Internet (HTTP requests)
- Data flows: Collar → Bridge → Backend → Database → Website
- Owner can check from anywhere, collar stays at home

**No Direct Connection**:
- Website does NOT connect directly to collar
- Website connects to backend API
- Backend API connects to database
- Bridge service connects collar to backend

This architecture ensures reliable data flow from the physical collar to the cloud database, and the website can fetch and display this data to the owner from anywhere in the world.

