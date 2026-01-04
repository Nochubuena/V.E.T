# V.E.T Collar Bridge Service

Bridge service that connects ESP32 collar hardware to the V.E.T backend API.

## Overview

This service runs on a computer/Raspberry Pi that has physical access to the ESP32 collar via USB/Serial connection. It:
- Reads serial data from the ESP32
- Parses temperature and heart rate data
- Sends HTTP requests to the backend API
- Handles errors and reconnections automatically

## Prerequisites

- Node.js 18+ installed
- ESP32 collar connected via USB
- Backend API running and accessible
- Valid JWT token from owner login

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration:
```env
SERIAL_PORT=COM3                    # Your serial port (COM3 on Windows, /dev/ttyUSB0 on Linux)
BAUD_RATE=115200                    # Must match ESP32 Serial.begin(115200)
API_BASE_URL=http://localhost:3000/api
DOG_ID=507f1f77bcf86cd799439011      # MongoDB ObjectId of your dog
AUTH_TOKEN=your_jwt_token_here        # Get this from owner login
UPDATE_INTERVAL=5000                 # Send updates every 5 seconds
```

## Getting Your JWT Token

1. Log in to the web application as the dog owner
2. Open browser developer tools (F12)
3. Go to Application/Storage → Local Storage
4. Copy the `authToken` value
5. Paste it into `.env` as `AUTH_TOKEN`

## Getting Your Dog ID

1. Log in to the web application
2. Open browser developer tools (F12)
3. Go to Network tab
4. Refresh the page
5. Find the `/api/dogs` request
6. Copy the `id` field from the response
7. Paste it into `.env` as `DOG_ID`

## Finding Your Serial Port

### Windows:
1. Open Device Manager
2. Look under "Ports (COM & LPT)"
3. Find your ESP32 (usually shows as "USB-SERIAL CH340" or "CP210x" or similar)
4. Note the COM port number (e.g., COM3)

### Linux/Mac:
1. Run: `ls /dev/tty*`
2. Look for `/dev/ttyUSB0`, `/dev/ttyACM0`, or similar
3. Use that as `SERIAL_PORT`

## Running

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

## How It Works

1. **Serial Connection**: Connects to ESP32 via USB/Serial
2. **Data Reading**: Reads serial output every second (ESP32 sends data continuously)
3. **Data Parsing**: Parses strings like "Temperature:38.5C 101.3F\nWaveform:1850 BPM:72"
4. **Data Validation**: Validates temperature and BPM ranges
5. **API Request**: Sends HTTP PUT request to `/api/dogs/:dogId/vitals`
6. **Error Handling**: Retries on failure, reconnects if serial port disconnects

## Logs

Logs are saved to `logs/` directory:
- `error.log` - Error level logs only
- `combined.log` - All logs
- Console output - Formatted logs for development

## Troubleshooting

### "Serial port not found"
- Check ESP32 is connected via USB
- Verify USB-to-Serial drivers are installed
- Verify `SERIAL_PORT` in `.env` matches your port
- Make sure no other program is using the serial port

### "Authentication failed"
- Check `AUTH_TOKEN` in `.env` is valid
- Token may have expired - get a new one from web app login

### "Dog not found"
- Check `DOG_ID` in `.env` matches your dog's MongoDB ID
- Verify you're using the correct owner's token

### "Network error"
- Check `API_BASE_URL` is correct
- Verify backend API is running and accessible
- Check firewall/network settings

### Data not updating
- Check serial port connection
- Verify ESP32 code is sending data in correct format (see `arduino/collar/collar.ino`)
- Check logs for parsing errors

## Configuration Options

See `.env.example` for all available configuration options:
- `SERIAL_PORT` - Serial port path
- `BAUD_RATE` - Serial communication speed
- `API_BASE_URL` - Backend API URL
- `DOG_ID` - Which dog this collar belongs to
- `AUTH_TOKEN` - Owner's JWT token
- `UPDATE_INTERVAL` - How often to send updates (milliseconds)
- `MAX_RETRIES` - Number of retry attempts for failed API calls
- `RETRY_DELAY` - Delay between retries (milliseconds)
- `SERIAL_RECONNECT_DELAY` - Delay before reconnecting serial port
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## Running as a Service (Optional)

### Windows (using NSSM):
1. Download NSSM: https://nssm.cc/download
2. Install service:
```bash
nssm install VETCollarBridge "C:\Program Files\nodejs\node.exe" "C:\path\to\bridge-service\dist\index.js"
nssm set VETCollarBridge AppDirectory "C:\path\to\bridge-service"
nssm start VETCollarBridge
```

### Linux (using systemd):
Create `/etc/systemd/system/vet-collar-bridge.service`:
```ini
[Unit]
Description=V.E.T Collar Bridge Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/bridge-service
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable vet-collar-bridge
sudo systemctl start vet-collar-bridge
```

## Support

For issues or questions, check the main V.E.T project documentation.


