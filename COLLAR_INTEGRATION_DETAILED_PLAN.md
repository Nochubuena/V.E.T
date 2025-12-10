# Detailed Component Explanation: Arduino Collar Integration

This document provides comprehensive explanations for each component needed to integrate the Arduino collar hardware with your V.E.T web application.

---

## Table of Contents
1. [Component 1: Arduino Bridge Service](#component-1-arduino-bridge-service)
2. [Component 2: Backend Enhancements](#component-2-backend-enhancements)
3. [Component 3: Frontend Real-Time Updates](#component-3-frontend-real-time-updates)
4. [Component 4: Collar Device Registration](#component-4-collar-device-registration)
5. [Component 5: Health Status Calculator Enhancement](#component-5-health-status-calculator-enhancement)
6. [Component 6: Error Handling and Logging](#component-6-error-handling-and-logging)
7. [Integration Flow Diagram](#integration-flow-diagram)
8. [Testing Strategy](#testing-strategy)

---

## Component 1: Arduino Bridge Service

### Overview
A standalone Node.js service that acts as a bridge between the Arduino hardware and your backend API. It runs on a computer/server that has physical access to the Arduino via USB/Serial connection.

### Purpose
- Read serial data from Arduino (temperature and heart rate)
- Parse the serial output strings
- Convert data to API-compatible format
- Send HTTP requests to your backend
- Handle errors and reconnections

### File Structure
```
bridge-service/
├── package.json              # Node.js project configuration
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables (API URL, Serial Port, etc.)
├── .env.example              # Example environment file
├── .gitignore                # Git ignore rules
├── src/
│   ├── index.ts             # Main entry point - orchestrates everything
│   ├── serialReader.ts      # Handles Arduino serial communication
│   ├── dataParser.ts        # Parses serial strings into structured data
│   ├── apiClient.ts         # Sends data to backend API
│   ├── healthStatus.ts      # Calculates health status (normal/abnormal)
│   └── errorHandler.ts      # Error handling and logging
├── logs/                     # Log files directory (created automatically)
│   └── collar-service.log   # Application logs
└── README.md                 # Setup and usage instructions
```

### Detailed Component Breakdown

#### 1.1. `package.json`
**Purpose**: Defines project dependencies and scripts

**Dependencies Needed**:
```json
{
  "dependencies": {
    "serialport": "^12.0.0",           // Serial port communication
    "axios": "^1.6.0",                 // HTTP requests to API
    "dotenv": "^16.3.1",               // Environment variables
    "winston": "^3.11.0"               // Logging
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/serialport": "^8.0.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0"
  }
}
```

**Scripts**:
- `npm start` - Run the service
- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript

#### 1.2. `.env` Configuration File
**Purpose**: Stores configuration that varies between environments

**Required Variables**:
```env
# Serial Port Configuration
SERIAL_PORT=COM3                    # Windows: COM3, COM4, etc.
                                    # Linux/Mac: /dev/ttyUSB0, /dev/ttyACM0
BAUD_RATE=115200                    # Must match Arduino Serial.begin(115200)

# API Configuration
API_BASE_URL=http://localhost:3000/api
DOG_ID=507f1f77bcf86cd799439011      # MongoDB ObjectId of the dog
AUTH_TOKEN=eyJhbGciOiJIUzI1NiIs...  # JWT token from owner login

# Update Configuration
UPDATE_INTERVAL=5000                 # Send updates every 5 seconds (milliseconds)
BATCH_SIZE=1                         # Send data immediately (no batching)

# Error Handling
MAX_RETRIES=3                        # Retry failed API calls 3 times
RETRY_DELAY=2000                     # Wait 2 seconds between retries
SERIAL_RECONNECT_DELAY=5000          # Wait 5 seconds before reconnecting serial

# Logging
LOG_LEVEL=info                       # debug, info, warn, error
LOG_FILE=./logs/collar-service.log
```

**Security Note**: `.env` file should NEVER be committed to git. Contains sensitive tokens.

#### 1.3. `src/index.ts` - Main Entry Point
**Purpose**: Orchestrates the entire service, initializes all components

**How It Works**:
```typescript
1. Load environment variables from .env
2. Initialize logger
3. Initialize Serial Reader (connect to Arduino)
4. Initialize API Client (configure HTTP client)
5. Set up event listeners:
   - Serial data received → Parse → Send to API
   - Serial error → Handle reconnection
   - API error → Retry logic
6. Start the service loop
7. Handle graceful shutdown (Ctrl+C)
```

**Key Features**:
- **Event-Driven Architecture**: Uses Node.js EventEmitter pattern
- **Error Recovery**: Automatically reconnects if serial port disconnects
- **Graceful Shutdown**: Saves state and closes connections properly
- **Health Monitoring**: Logs service status periodically

**Flow**:
```
Start → Load Config → Connect Serial → Listen for Data
  ↓
Serial Data Received → Parse → Validate → Send to API
  ↓
API Success → Log → Wait for Next Data
API Error → Retry → Log Error → Continue
```

#### 1.4. `src/serialReader.ts` - Serial Communication
**Purpose**: Handles all communication with Arduino via serial port

**How It Works**:

1. **Port Discovery**:
   - Lists available serial ports
   - Finds port matching `SERIAL_PORT` from .env
   - Or auto-detects Arduino port (if not specified)

2. **Connection**:
   ```typescript
   const port = new SerialPort({
     path: 'COM3',              // From .env
     baudRate: 115200,          // Must match Arduino
     dataBits: 8,
     stopBits: 1,
     parity: 'none'
   });
   ```

3. **Data Reception**:
   - Arduino sends data every 1 second
   - Format: `"Temperature:38.5C 101.3F\nWaveform:1850 BPM:72 \n"`
   - Serial port receives this as a stream
   - Accumulates data until complete line received

4. **Event Handling**:
   - `data` event: Receives raw bytes from Arduino
   - `error` event: Handles connection errors
   - `close` event: Handles disconnection

**Parsing Strategy**:
- Arduino sends data in chunks (not always complete lines)
- Buffer accumulates data until `\n` (newline) received
- Then processes complete line

**Error Handling**:
- Port not found → Log error, retry after delay
- Port disconnected → Attempt reconnection
- Invalid data → Log warning, skip that reading

#### 1.5. `src/dataParser.ts` - Data Parsing
**Purpose**: Extracts structured data from Arduino serial strings

**Input Format** (from Arduino):
```
Temperature:38.5C 101.3F
Waveform:1850 BPM:72 
```

**Parsing Process**:

1. **Split by Newlines**: 
   ```
   Line 1: "Temperature:38.5C 101.3F"
   Line 2: "Waveform:1850 BPM:72 "
   ```

2. **Extract Temperature**:
   - Pattern: `Temperature:XX.XC XX.XF`
   - Regex: `/Temperature:([\d.]+)C\s+([\d.]+)F/`
   - Extract: Celsius (38.5) and Fahrenheit (101.3)

3. **Extract Waveform and BPM**:
   - Pattern: `Waveform:XXXX BPM:XX`
   - Regex: `/Waveform:(\d+)\s+BPM:(\d+)/`
   - Extract: Waveform value (1850) and BPM (72)

**Output Format**:
```typescript
{
  temperature: 38.5,        // Celsius (primary)
  temperatureF: 101.3,      // Fahrenheit (for reference)
  waveform: 1850,           // Raw sensor reading
  bpm: 72,                  // Calculated beats per minute
  timestamp: "2024-01-15T10:30:00.000Z"  // When data was received
}
```

**Validation**:
- Temperature range: 30-45°C (reasonable for dogs)
- BPM range: 40-200 (reasonable for dogs)
- Reject invalid data and log warning

**Edge Cases Handled**:
- Missing BPM (only waveform) → Calculate BPM from waveform if possible
- Incomplete data → Wait for next reading
- Malformed strings → Skip and log error

#### 1.6. `src/apiClient.ts` - API Communication
**Purpose**: Sends parsed data to your backend API

**How It Works**:

1. **HTTP Client Setup**:
   ```typescript
   const api = axios.create({
     baseURL: 'http://localhost:3000/api',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${AUTH_TOKEN}`
     },
     timeout: 5000  // 5 second timeout
   });
   ```

2. **Data Formatting**:
   ```typescript
   // Input from parser
   { temperature: 38.5, bpm: 72, ... }
   
   // Format for API
   {
     heartRate: 72,                    // From bpm
     temperature: 38.5,                 // From temperature
     status: "normal",                  // Calculated (see healthStatus.ts)
     time: "2024-01-15T10:30:00.000Z"  // ISO timestamp
   }
   ```

3. **API Endpoint**:
   - `PUT /api/dogs/:dogId/vitals`
   - Example: `PUT /api/dogs/507f1f77bcf86cd799439011/vitals`

4. **Request Flow**:
   ```
   Parse Data → Format Payload → Add Auth Header → Send PUT Request
     ↓
   Success → Log → Return
   Error → Retry Logic → Log Error → Return
   ```

**Retry Logic**:
- Network errors → Retry up to 3 times
- 401 Unauthorized → Log error, don't retry (token issue)
- 404 Not Found → Log error, don't retry (dog ID issue)
- 429 Too Many Requests → Wait longer, then retry
- 500 Server Error → Retry with exponential backoff

**Rate Limiting**:
- Respects `UPDATE_INTERVAL` from .env
- Won't send more than 1 request per interval
- Queues data if sending too fast

#### 1.7. `src/healthStatus.ts` - Status Calculation
**Purpose**: Determines if vital signs are normal or abnormal

**How It Works**:

1. **Import Logic from Frontend**:
   - Uses same logic as `src/utils/healthStatus.ts` in frontend
   - Ensures consistency between collar and display

2. **Status Calculation**:
   ```typescript
   function calculateStatus(heartRate: number, temperature: number): string {
     // Heart rate check
     const hrNormal = heartRate >= 60 && heartRate <= 140;
     
     // Temperature check (dogs: 37.5-39.5°C normal)
     const tempNormal = temperature >= 37.5 && temperature <= 39.5;
     
     if (hrNormal && tempNormal) {
       return "normal";
     } else if (!hrNormal && !tempNormal) {
       return "critical";
     } else {
       return "warning";
     }
   }
   ```

3. **Output**:
   - Returns: `"normal"`, `"warning"`, or `"critical"`
   - This value goes into API request `status` field

**Note**: This matches the status calculation used in your frontend for consistency.

#### 1.8. `src/errorHandler.ts` - Error Management
**Purpose**: Centralized error handling and logging

**Features**:
- **Winston Logger**: Structured logging to file and console
- **Error Categories**: Serial errors, API errors, parsing errors
- **Recovery Actions**: Automatic reconnection, retry logic
- **Alert System**: Can send notifications for critical errors

**Log Levels**:
- `debug`: Detailed information (serial data, API requests)
- `info`: Normal operations (successful updates)
- `warn`: Recoverable errors (retry successful)
- `error`: Critical errors (connection lost, API failures)

**Example Log Output**:
```
2024-01-15 10:30:00 INFO: Connected to serial port COM3
2024-01-15 10:30:01 INFO: Received data: Temperature:38.5C BPM:72
2024-01-15 10:30:01 INFO: Successfully updated vitals for dog 507f...
2024-01-15 10:30:06 WARN: Serial port disconnected, attempting reconnect...
2024-01-15 10:30:11 INFO: Reconnected to serial port COM3
```

---

## Component 2: Backend Enhancements

### Overview
Enhancements to your existing Express.js backend to handle collar data efficiently and securely.

### 2.1. Rate Limiting Middleware

#### Location
`backend/src/middleware/rateLimit.ts` (NEW FILE)

#### Purpose
Prevent abuse from collar devices or malicious clients sending too many requests.

#### How It Works

**Installation**:
```bash
npm install express-rate-limit
```

**Implementation**:
```typescript
import rateLimit from 'express-rate-limit';

// General rate limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Stricter limiter for collar vitals endpoint
export const collarLimiter = rateLimit({
  windowMs: 10 * 1000,        // 10 seconds
  max: 10,                     // 10 requests per 10 seconds
  keyGenerator: (req) => {
    // Limit per dog ID (allows multiple collars for different dogs)
    return req.params.id || req.ip;
  },
  message: 'Too many vital updates, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Usage in Routes**:
```typescript
// In backend/src/routes/dogs.ts
import { collarLimiter } from '../middleware/rateLimit';

router.put('/:id/vitals', 
  authenticate,           // Existing auth middleware
  collarLimiter,          // NEW: Rate limiting
  async (req, res) => {
    // ... existing code
  }
);
```

**Why This Matters**:
- Prevents accidental spam (if bridge service has bug)
- Protects against malicious attacks
- Ensures fair resource usage
- Allows ~1 update per second per dog (reasonable for collar)

#### Configuration Options
- **Window**: Time period for counting requests
- **Max**: Maximum requests allowed in window
- **Key Generator**: How to identify unique clients (by IP, dog ID, etc.)
- **Skip**: Option to skip rate limiting for certain conditions

### 2.2. Enhanced Vitals Endpoint Validation

#### Location
`backend/src/routes/dogs.ts` (MODIFY EXISTING)

#### Purpose
Add validation to ensure incoming vital data is reasonable and safe.

#### Current Code (Line 70-111)
```typescript
router.put('/:id/vitals', authenticate, async (req: AuthRequest, res: Response) => {
  const { heartRate, temperature, status, time } = req.body;
  // ... saves to database
});
```

#### Enhanced Version
```typescript
router.put('/:id/vitals', authenticate, collarLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { heartRate, temperature, status, time } = req.body;

    // VALIDATION: Check required fields
    if (heartRate === undefined || temperature === undefined) {
      return res.status(400).json({ 
        error: 'heartRate and temperature are required' 
      });
    }

    // VALIDATION: Check data ranges (prevent invalid data)
    if (heartRate < 0 || heartRate > 300) {
      return res.status(400).json({ 
        error: 'heartRate must be between 0 and 300' 
      });
    }

    if (temperature < 20 || temperature > 50) {
      return res.status(400).json({ 
        error: 'temperature must be between 20 and 50°C' 
      });
    }

    // VALIDATION: Check status values
    const validStatuses = ['normal', 'warning', 'critical', 'abnormal'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // VALIDATION: Check timestamp format
    if (time && !isValidISOString(time)) {
      return res.status(400).json({ 
        error: 'time must be a valid ISO 8601 timestamp' 
      });
    }

    // Find dog
    const dog = await Dog.findOne({ _id: id, ownerId: req.userId });
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Calculate status if not provided
    const calculatedStatus = status || calculateVitalStatus(heartRate, temperature);

    // Update current vitals
    dog.heartRate = heartRate;
    dog.temperature = temperature;

    // Add to vital records (limit to last 1000 records to prevent DB bloat)
    if (heartRate && temperature && calculatedStatus && time) {
      dog.vitalRecords = dog.vitalRecords || [];
      dog.vitalRecords.push({
        heartRate,
        temperature,
        status: calculatedStatus,
        time: time || new Date().toISOString(),
      });

      // Keep only last 1000 records (prevent unlimited growth)
      if (dog.vitalRecords.length > 1000) {
        dog.vitalRecords = dog.vitalRecords.slice(-1000);
      }
    }

    await dog.save();

    // Return updated dog
    res.json({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
      isDeceased: dog.isDeceased || false,
    });
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

**New Features**:
1. **Range Validation**: Ensures data is within reasonable bounds
2. **Status Validation**: Only accepts valid status values
3. **Timestamp Validation**: Ensures proper ISO format
4. **Record Limiting**: Prevents database from growing infinitely
5. **Auto Status Calculation**: Calculates status if not provided

### 2.3. WebSocket Support (Optional)

#### Location
`backend/src/routes/websocket.ts` (NEW FILE - OPTIONAL)

#### Purpose
Push updates to frontend immediately when collar sends data (alternative to polling).

#### How It Works

**Installation**:
```bash
npm install socket.io
```

**Implementation**:
```typescript
import { Server } from 'socket.io';

export function setupWebSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",  // Configure properly for production
      methods: ["GET", "POST"]
    }
  });

  // When collar updates vitals, broadcast to all connected clients
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// In vitals endpoint, after saving:
// io.emit('vital-update', { dogId, heartRate, temperature });
```

**Integration**:
- Modify `PUT /dogs/:id/vitals` endpoint
- After saving to database, emit WebSocket event
- Frontend receives update instantly

**Pros**:
- Real-time updates (no polling delay)
- Less server load (no constant polling requests)
- Better user experience

**Cons**:
- More complex setup
- Requires WebSocket support on hosting platform
- Additional dependency

**Recommendation**: Start with polling (simpler), add WebSocket later if needed.

### 2.4. Collar Device Authentication (Optional)

#### Location
`backend/src/models/Collar.ts` (NEW FILE - OPTIONAL)

#### Purpose
Allow collars to authenticate without owner JWT token (using API keys).

#### Database Schema
```typescript
{
  _id: ObjectId,
  dogId: ObjectId,           // Which dog this collar belongs to
  serialNumber: String,      // Physical collar serial number
  apiKey: String,            // Unique API key for authentication
  lastSeen: Date,           // Last time collar sent data
  status: String,            // 'active', 'inactive', 'error'
  createdAt: Date,
  updatedAt: Date
}
```

#### New Endpoint
```typescript
// POST /api/collars/register
// Register a new collar for a dog
// Requires: owner authentication

// PUT /api/dogs/:id/vitals (with API key)
// Alternative authentication using collar API key
// Headers: X-Collar-API-Key: <api-key>
```

**When to Use**:
- If you want collars to work independently of owner login
- If you want to track which collar sent which data
- If you want to manage multiple collars per dog

**When NOT to Use**:
- If simple JWT token authentication is sufficient
- If you don't need collar tracking
- To keep system simpler

**Recommendation**: Start without this, add later if needed.

---

## Component 3: Frontend Real-Time Updates

### Overview
Enhancements to your React Native/Web frontend to automatically refresh dog data when collar sends updates.

### 3.1. Polling Mechanism in AppContext

#### Location
`src/context/AppContext.tsx` (MODIFY EXISTING)

#### Current Behavior
- Fetches dogs on login
- Fetches dogs when `fetchDogs()` is called manually
- No automatic updates

#### Enhanced Behavior
- Automatically fetches dogs every 5 seconds when logged in
- Only polls when user is on health-related screens
- Stops polling when user logs out or navigates away

#### Implementation Details

**Add State**:
```typescript
const [isPolling, setIsPolling] = useState(false);
const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
```

**Add Polling Logic**:
```typescript
// Start polling when logged in
useEffect(() => {
  if (!isLoggedIn || !owner) {
    // Stop polling if logged out
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    return;
  }

  // Start polling every 5 seconds
  const interval = setInterval(() => {
    fetchDogs();
  }, 5000);  // 5000ms = 5 seconds

  setPollInterval(interval);
  setIsPolling(true);

  // Cleanup on unmount or when dependencies change
  return () => {
    clearInterval(interval);
    setIsPolling(false);
  };
}, [isLoggedIn, owner]);  // Re-run when login status changes
```

**Add Manual Refresh Function**:
```typescript
const refreshDogs = async (): Promise<void> => {
  await fetchDogs();
};
```

**Export New Values**:
```typescript
return (
  <AppContext.Provider
    value={{
      owner,
      dogs,
      isLoggedIn,
      loading,
      error,
      isPolling,        // NEW: Indicates if polling is active
      setOwner: updateOwner,
      addDog,
      login,
      logout,
      signUpOwner,
      fetchDogs,
      refreshDogs,      // NEW: Manual refresh function
      deleteDog,
      markDogDeceased,
    }}>
    {children}
  </AppContext.Provider>
);
```

**Update Interface**:
```typescript
interface AppContextType {
  // ... existing fields
  isPolling: boolean;           // NEW
  refreshDogs: () => Promise<void>;  // NEW
}
```

#### Considerations

**Performance**:
- 5-second interval = 12 requests per minute per user
- With 10 users = 120 requests/minute (manageable)
- Can adjust interval based on needs

**Battery Impact** (Mobile):
- Polling uses network and battery
- Consider longer intervals (10-15 seconds) for mobile
- Or use WebSocket (more efficient)

**User Experience**:
- Data updates automatically
- No need to manually refresh
- Shows "Live" indicator when polling

### 3.2. Visual Indicators on Screens

#### Location
Multiple screen files (MODIFY EXISTING)

#### 3.2.1. HomePage.tsx - Live Indicator

**What to Add**:
- "Live" badge showing real-time updates are active
- Last updated timestamp
- Connection status

**Implementation**:
```typescript
// Add state
const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

// Update when dogs data changes
useEffect(() => {
  if (dogs.length > 0) {
    setLastUpdateTime(new Date());
  }
}, [dogs]);

// In render, add indicator:
{isPolling && (
  <View style={styles.liveIndicator}>
    <View style={styles.liveDot} />
    <Text style={styles.liveText}>Live</Text>
    {lastUpdateTime && (
      <Text style={styles.lastUpdate}>
        Updated {Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000)}s ago
      </Text>
    )}
  </View>
)}
```

**Styles**:
```typescript
liveIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: '#E8F5E9',
  borderRadius: 16,
  marginBottom: 8,
},
liveDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#4CAF50',
  marginRight: 6,
},
liveText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#2E7D32',
  marginRight: 8,
},
lastUpdate: {
  fontSize: 11,
  color: '#666666',
},
```

#### 3.2.2. DogHealthScreen.tsx - Last Update Time

**What to Add**:
- Display when vitals were last updated
- Show if data is stale (> 1 minute old)

**Implementation**:
```typescript
// Calculate last update time from vitalRecords
const lastVitalRecord = dog?.vitalRecords?.[dog.vitalRecords.length - 1];
const lastUpdateTime = lastVitalRecord 
  ? new Date(lastVitalRecord.time) 
  : null;

const minutesSinceUpdate = lastUpdateTime 
  ? Math.floor((Date.now() - lastUpdateTime.getTime()) / 60000)
  : null;

// In render:
{lastUpdateTime && (
  <View style={styles.updateInfo}>
    <Text style={styles.updateLabel}>
      Last updated: {lastUpdateTime.toLocaleTimeString()}
    </Text>
    {minutesSinceUpdate !== null && minutesSinceUpdate > 1 && (
      <Text style={styles.staleWarning}>
        Data is {minutesSinceUpdate} minutes old
      </Text>
    )}
  </View>
)}
```

#### 3.2.3. ProfilePageVitals.tsx - Auto-Refresh Charts

**What to Add**:
- Charts automatically update when new data arrives
- Smooth animation when data changes

**Implementation**:
- Charts already use `dog.vitalRecords` from context
- When context updates (via polling), charts automatically re-render
- Add animation for smooth transitions:

```typescript
import { Animated } from 'react-native';

// Add animated value
const chartOpacity = useRef(new Animated.Value(1)).current;

// Animate when data changes
useEffect(() => {
  Animated.sequence([
    Animated.timing(chartOpacity, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }),
    Animated.timing(chartOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start();
}, [heartRateData, temperatureData]);

// Apply to chart container
<Animated.View style={{ opacity: chartOpacity }}>
  {/* Chart SVG */}
</Animated.View>
```

### 3.3. WebSocket Hook (Alternative to Polling)

#### Location
`src/hooks/useWebSocket.ts` (NEW FILE - OPTIONAL)

#### Purpose
Real-time updates via WebSocket instead of polling (more efficient).

#### Implementation

**Installation**:
```bash
npm install socket.io-client
```

**Hook Code**:
```typescript
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useApp } from '../context/AppContext';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { isLoggedIn, fetchDogs } = useApp();

  useEffect(() => {
    if (!isLoggedIn) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to WebSocket server
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Listen for vital updates
    socket.on('vital-update', (data: { dogId: string }) => {
      // Refresh dogs data when update received
      fetchDogs();
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, fetchDogs]);

  return socketRef.current;
}
```

**Usage in Screens**:
```typescript
// In HomePage.tsx or DogHealthScreen.tsx
import { useWebSocket } from '../hooks/useWebSocket';

const MyScreen = () => {
  useWebSocket();  // Automatically connects and listens
  // ... rest of component
};
```

**Pros vs Polling**:
- **WebSocket**: Instant updates, less server load, more efficient
- **Polling**: Simpler, works everywhere, no WebSocket server needed

**Recommendation**: Start with polling, upgrade to WebSocket if needed.

---

## Component 4: Collar Device Registration

### Overview
System to pair physical collars with dogs in your database.

### 4.1. Registration Screen

#### Location
`src/screens/RegisterCollarScreen.tsx` (NEW FILE)

#### Purpose
Allow owners to register a collar device and associate it with a dog.

#### UI Flow

1. **Select Dog**:
   - Dropdown/list of owner's dogs
   - Shows dog name and photo

2. **Enter Collar Info**:
   - Collar serial number (or scan QR code)
   - Optional: Collar name/description

3. **Generate API Key**:
   - Backend generates unique API key
   - Display key to user
   - Instructions: "Copy this key to your bridge service .env file"

4. **Confirmation**:
   - Shows success message
   - Displays collar status
   - Link to bridge service setup instructions

#### Implementation

**Screen Structure**:
```typescript
const RegisterCollarScreen = ({ navigation }: any) => {
  const { dogs } = useApp();
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Call API to register collar
    // Receive API key
    // Display to user
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {/* Dog Selection */}
        <Picker
          selectedValue={selectedDogId}
          onValueChange={setSelectedDogId}
        >
          {dogs.map(dog => (
            <Picker.Item key={dog.id} label={dog.name} value={dog.id} />
          ))}
        </Picker>

        {/* Serial Number Input */}
        <TextInput
          placeholder="Collar Serial Number"
          value={serialNumber}
          onChangeText={setSerialNumber}
        />

        {/* Register Button */}
        <TouchableOpacity onPress={handleRegister}>
          <Text>Register Collar</Text>
        </TouchableOpacity>

        {/* Display API Key if registered */}
        {apiKey && (
          <View>
            <Text>Your API Key:</Text>
            <Text selectable>{apiKey}</Text>
            <Text>Copy this to your bridge service .env file</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
```

### 4.2. Backend Registration Endpoint

#### Location
`backend/src/routes/collars.ts` (NEW FILE)

#### Endpoints

**POST /api/collars/register**
```typescript
// Register a new collar for a dog
// Requires: Owner authentication
// Body: { dogId, serialNumber, name? }
// Returns: { collarId, apiKey, dogId }
```

**GET /api/collars**
```typescript
// Get all collars for logged-in owner
// Returns: Array of collars with status
```

**GET /api/collars/:id**
```typescript
// Get specific collar details
// Returns: Collar info + last seen time
```

**DELETE /api/collars/:id**
```typescript
// Unregister a collar
// Removes collar from system
```

#### Database Model

**Location**: `backend/src/models/Collar.ts` (NEW FILE)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ICollar extends Document {
  _id: mongoose.Types.ObjectId;
  dogId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  serialNumber: string;
  apiKey: string;           // Unique API key for authentication
  name?: string;             // Optional friendly name
  lastSeen?: Date;          // Last time collar sent data
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

const CollarSchema: Schema = new Schema(
  {
    dogId: {
      type: Schema.Types.ObjectId,
      ref: 'Dog',
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    lastSeen: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'error'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICollar>('Collar', CollarSchema, 'Collars');
```

#### API Key Generation

**Security Considerations**:
- Use cryptographically secure random generator
- Long enough to prevent brute force (32+ characters)
- Store hashed version in database (like passwords)
- Return plain text only once during registration

**Implementation**:
```typescript
import crypto from 'crypto';

function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');  // 64 character hex string
}

// Hash for storage (like password hashing)
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}
```

### 4.3. Alternative: Simple Token-Based Approach

**Simpler Alternative** (if you don't need collar tracking):
- Owner logs in, gets JWT token
- Copy token to bridge service .env
- Bridge service uses JWT token for authentication
- No separate collar registration needed

**When to Use**:
- Single collar per owner
- Don't need to track which collar sent data
- Want simpler setup

**Recommendation**: Start simple (JWT token), add collar registration later if needed.

---

## Component 5: Health Status Calculator Enhancement

### Location
`src/utils/healthStatus.ts` (MODIFY EXISTING)

### Purpose
Ensure the status calculation used by bridge service matches frontend display logic.

### Current Implementation
Your `healthStatus.ts` already calculates status for display. We need to:
1. Export a function that bridge service can use
2. Ensure consistency between frontend and bridge service

### Enhancement

**Add Export Function**:
```typescript
/**
 * Calculate vital status string for API
 * Returns: "normal", "warning", or "critical"
 */
export function calculateVitalStatusForAPI(
  heartRate: number | undefined,
  temperature: number | undefined,
  breedSize: BreedSize = 'unknown'
): string {
  if (heartRate === undefined || temperature === undefined) {
    return 'normal';  // Default if missing data
  }

  const healthStatus = getHealthStatus(heartRate, temperature, breedSize);
  
  // Determine overall status
  const hrAbnormal = healthStatus.heartRate.status !== 'normal';
  const tempAbnormal = healthStatus.temperature.status !== 'normal';
  
  if (hrAbnormal && tempAbnormal) {
    return 'critical';  // Both abnormal = critical
  } else if (hrAbnormal || tempAbnormal) {
    return 'warning';   // One abnormal = warning
  } else {
    return 'normal';    // Both normal = normal
  }
}
```

**Bridge Service Usage**:
```typescript
// In bridge-service/src/healthStatus.ts
// Copy this function or import from shared package
function calculateStatus(heartRate: number, temperature: number): string {
  // Same logic as frontend
  // Ensures consistency
}
```

**Alternative: Shared Package**
- Create `shared/` package with common utilities
- Both frontend and bridge service import from shared package
- Ensures 100% consistency
- More complex setup

**Recommendation**: Copy function to bridge service for now, consider shared package later.

---

## Component 6: Error Handling and Logging

### Overview
Comprehensive error handling across all components.

### 6.1. Bridge Service Error Handling

#### Error Categories

1. **Serial Port Errors**:
   - Port not found
   - Port disconnected
   - Permission denied
   - **Recovery**: Retry connection after delay

2. **Parsing Errors**:
   - Invalid data format
   - Missing fields
   - **Recovery**: Skip reading, wait for next

3. **API Errors**:
   - Network failure
   - Authentication failure
   - Server error
   - **Recovery**: Retry with exponential backoff

4. **Configuration Errors**:
   - Missing .env variables
   - Invalid values
   - **Recovery**: Log error, exit (user must fix)

#### Implementation

**Error Handler**:
```typescript
// src/errorHandler.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

export function handleSerialError(error: Error) {
  logger.error('Serial port error:', error);
  // Attempt reconnection
  // Notify user if persistent
}

export function handleAPIError(error: any) {
  if (error.response) {
    // Server responded with error
    logger.error('API error:', {
      status: error.response.status,
      data: error.response.data,
    });
  } else if (error.request) {
    // Request made but no response
    logger.error('Network error:', error.message);
  } else {
    // Other error
    logger.error('Error:', error.message);
  }
}
```

### 6.2. Backend Error Handling

#### Enhanced Error Responses

**Current**: Generic "Server error"
**Enhanced**: Specific error messages with details

```typescript
// In routes/dogs.ts
catch (error: any) {
  console.error('Update vitals error:', error);
  
  // More specific error handling
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      details: error.message 
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Invalid dog ID format' 
    });
  }
  
  // Generic fallback
  res.status(500).json({ 
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

#### Logging

**Add Structured Logging**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// In routes:
logger.info('Vital update received', {
  dogId: id,
  heartRate,
  temperature,
  timestamp: new Date(),
});
```

### 6.3. Frontend Error Handling

#### Network Error Handling

**In AppContext**:
```typescript
const fetchDogs = async (): Promise<void> => {
  try {
    setLoading(true);
    setError(null);
    const response = await api.get('/dogs');
    setDogs(response.data);
  } catch (error: any) {
    console.error('Error fetching dogs:', error);
    
    // Specific error handling
    if (error.code === 'NETWORK_ERROR') {
      setError('Network error. Please check your connection.');
    } else if (error.response?.status === 401) {
      setError('Session expired. Please log in again.');
      logout();  // Auto-logout on auth error
    } else {
      setError(error.response?.data?.error || 'Failed to fetch dogs');
    }
    
    setDogs([]);
  } finally {
    setLoading(false);
  }
};
```

#### User-Friendly Error Messages

**Error Display Component**:
```typescript
// Show errors in UI
{error && (
  <View style={styles.errorBanner}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={() => setError(null)}>
      <Text>Dismiss</Text>
    </TouchableOpacity>
  </View>
)}
```

#### Retry Logic

**Auto-Retry on Failure**:
```typescript
const fetchDogsWithRetry = async (retries = 3): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await fetchDogs();
      return;  // Success
    } catch (error) {
      if (i === retries - 1) {
        // Last retry failed
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## Integration Flow Diagram

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ARDUINO HARDWARE                         │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Temp Sensor  │         │Pulse Sensor  │                 │
│  │ (Dallas)     │         │  (Analog)    │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
│         │                        │                          │
│         └──────────┬─────────────┘                          │
│                    │                                        │
│              ┌─────▼─────┐                                  │
│              │  Arduino   │                                  │
│              │   Code    │                                  │
│              └─────┬─────┘                                  │
│                    │ Serial Output                          │
│                    │ "Temperature:38.5C BPM:72"            │
└────────────────────┼────────────────────────────────────────┘
                     │ USB/Serial Cable
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BRIDGE SERVICE (Node.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │Serial Reader │→ │Data Parser   │→ │API Client    │    │
│  │              │  │              │  │              │    │
│  │- Connect     │  │- Parse       │  │- Format      │    │
│  │- Listen      │  │- Validate    │  │- Send HTTP   │    │
│  │- Buffer      │  │- Extract     │  │- Retry       │    │
│  └──────────────┘  └──────────────┘  └──────┬───────┘    │
│                                             │            │
│                                    HTTP PUT Request       │
└─────────────────────────────────────────────┼────────────┘
                                              │
┌─────────────────────────────────────────────▼─────────────┐
│                    BACKEND API                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Rate Limiter │→ │Auth Check    │→ │Validation    │  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  │
│                                             │            │
│                                    ┌────────▼────────┐  │
│                                    │  Save to MongoDB│  │
│                                    └────────┬────────┘  │
│                                             │            │
│                                    ┌────────▼────────┐  │
│                                    │  Return Updated │  │
│                                    │     Dog Data    │  │
│                                    └─────────────────┘  │
└──────────────────────────────────────────────────────────┘
                     │
                     │ Database Updated
                     │
┌────────────────────▼──────────────────────────────────────┐
│                  FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │Polling/WS    │→ │AppContext    │→ │UI Components  │ │
│  │              │  │              │  │              │ │
│  │- Every 5s    │  │- Update Dogs │  │- HomePage    │ │
│  │- Or WebSocket│  │- State Mgmt  │  │- Health      │ │
│  └──────────────┘  └──────────────┘  │- Charts      │ │
│                                        └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Timing Diagram

```
Time →
Arduino:  [Read]──1s──[Read]──1s──[Read]──1s──[Read]
           │           │           │           │
Bridge:    [Parse]     [Parse]     [Parse]     [Parse]
           │           │           │           │
           [Send API]  [Send API]  [Send API]  [Send API]
           │           │           │           │
Backend:   [Save DB]   [Save DB]   [Save DB]   [Save DB]
           │           │           │           │
Frontend:  [Poll]──────5s─────────[Poll]──────5s─────────[Poll]
           │                       │                       │
           [Update UI]             [Update UI]             [Update UI]
```

**Key Points**:
- Arduino sends data every 1 second
- Bridge service sends to API every 1-5 seconds (configurable)
- Frontend polls every 5 seconds (or uses WebSocket for instant)
- Data flows: Arduino → Bridge → API → Database → Frontend

---

## Testing Strategy

### 1. Bridge Service Testing

**Unit Tests**:
- Test data parser with sample Arduino output
- Test API client with mock server
- Test error handling

**Integration Tests**:
- Test with real Arduino (or serial port simulator)
- Test API communication with test backend

**Manual Testing**:
- Run bridge service
- Verify serial connection
- Verify API requests in network logs
- Check database updates

### 2. Backend Testing

**API Tests**:
- Test vitals endpoint with valid data
- Test validation (invalid ranges)
- Test rate limiting
- Test authentication

**Database Tests**:
- Verify data saved correctly
- Verify vitalRecords array grows
- Verify record limiting works

### 3. Frontend Testing

**Component Tests**:
- Test polling starts/stops correctly
- Test UI updates when data changes
- Test error handling

**Integration Tests**:
- Test full flow: Login → View Dogs → See Updates
- Test with mock API responses

### 4. End-to-End Testing

**Full System Test**:
1. Start Arduino (or simulator)
2. Start bridge service
3. Start backend
4. Open frontend
5. Login as owner
6. Verify data appears and updates automatically

---

## Summary: What Gets Added/Modified

### New Files Created

1. **Bridge Service** (New Project):
   - `bridge-service/` (entire folder)
   - ~8 files total

2. **Backend**:
   - `backend/src/middleware/rateLimit.ts` (NEW)
   - `backend/src/routes/collars.ts` (NEW - Optional)
   - `backend/src/models/Collar.ts` (NEW - Optional)

3. **Frontend**:
   - `src/hooks/useWebSocket.ts` (NEW - Optional)
   - `src/screens/RegisterCollarScreen.tsx` (NEW - Optional)

### Files Modified

1. **Backend**:
   - `backend/src/routes/dogs.ts` - Add validation, rate limiting
   - `backend/src/server.ts` - Add WebSocket (optional)

2. **Frontend**:
   - `src/context/AppContext.tsx` - Add polling mechanism
   - `src/screens/HomePage.tsx` - Add live indicator
   - `src/screens/DogHealthScreen.tsx` - Add last update time
   - `src/screens/ProfilePageVitals.tsx` - Auto-refresh charts
   - `src/utils/healthStatus.ts` - Export status calculation

### Dependencies Added

**Bridge Service**:
- `serialport` - Serial communication
- `axios` - HTTP requests
- `dotenv` - Environment variables
- `winston` - Logging

**Backend** (if enhancements added):
- `express-rate-limit` - Rate limiting
- `socket.io` - WebSocket (optional)

**Frontend** (if enhancements added):
- `socket.io-client` - WebSocket client (optional)

---

## Next Steps

1. **Review this document** - Understand each component
2. **Decide on features** - Which components to implement?
3. **Prioritize** - Start with essential, add optional later
4. **Implementation** - I'll create the code once you approve

### Recommended Implementation Order

**Phase 1 (Essential)**:
1. Bridge Service (basic version)
2. Backend validation enhancements
3. Frontend polling

**Phase 2 (Enhancements)**:
4. Rate limiting
5. Visual indicators
6. Error handling improvements

**Phase 3 (Optional)**:
7. Collar registration system
8. WebSocket support
9. Advanced error recovery

---

## Questions to Consider

1. **How many collars** will be used simultaneously?
2. **Where will bridge service run**? (Owner's computer, cloud server, Raspberry Pi?)
3. **Do you need collar tracking**? (Which collar sent which data?)
4. **Real-time priority**? (Polling sufficient, or need WebSocket?)
5. **Mobile app**? (Battery considerations for polling)

Let me know which components you'd like to proceed with, and I'll implement them!

