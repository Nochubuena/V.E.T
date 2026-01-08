# Auto-Connection Guide

## Overview

The bridge service now supports **automatic serial port detection**, making it easier to connect to your Arduino/ESP32 collar without manually specifying the port.

## How Auto-Connection Works

### 1. Automatic Port Detection

When you set `SERIAL_PORT=auto` (or leave it empty), the bridge service will:

1. **Scan all available serial ports** on your computer
2. **Look for Arduino/ESP32 patterns**:
   - Port names containing "Arduino", "ESP32", "CH340", "CP210", "FTDI"
   - USB Serial devices
   - Common COM ports (Windows) or /dev/ttyUSB* (Linux)
3. **Automatically select** the most likely Arduino/ESP32 port
4. **Connect automatically** without manual configuration

### 2. Auto-Reconnection

The bridge service already includes **automatic reconnection**:

- If the USB cable is unplugged → Automatically reconnects when plugged back in
- If the port becomes unavailable → Retries connection every 5 seconds
- If connection fails → Logs error and retries automatically

## Setup Instructions

### Option 1: Full Auto-Connection (Recommended)

1. **Edit `.env` file**:
   ```env
   SERIAL_PORT=auto              # Auto-detect port
   BAUD_RATE=115200
   API_BASE_URL=http://localhost:3000/api
   DOG_ID=your_dog_id
   AUTH_TOKEN=your_token
   UPDATE_INTERVAL=5000
   ```

2. **Start bridge service**:
   ```bash
   npm start
   ```

3. **The service will**:
   - Automatically find your Arduino/ESP32
   - Connect automatically
   - Start sending data

**Output Example**:
```
[INFO] Scanning 3 available serial ports...
[INFO] Auto-detected Arduino/ESP32 port: COM3 (Silicon Labs)
[INFO] Connecting to serial port: COM3 at 115200 baud
[INFO] Serial port opened: COM3
[INFO] Bridge service started successfully
```

### Option 2: Manual Port (Fallback)

If auto-detection doesn't work, you can still specify the port manually:

```env
SERIAL_PORT=COM3              # Windows
# or
SERIAL_PORT=/dev/ttyUSB0      # Linux
# or
SERIAL_PORT=/dev/tty.usbserial-*  # Mac
```

## How It Works Internally

### Port Detection Algorithm

1. **List all serial ports**:
   ```typescript
   const ports = await SerialPort.list();
   // Returns: [{ path: 'COM3', manufacturer: 'Silicon Labs', ... }, ...]
   ```

2. **Search for Arduino/ESP32 patterns**:
   - Checks port manufacturer name
   - Checks port product ID
   - Looks for keywords: "Arduino", "ESP32", "CH340", "CP210", "FTDI"

3. **Fallback to common ports**:
   - Windows: COM1, COM2, COM3, etc.
   - Linux: /dev/ttyUSB0, /dev/ttyACM0
   - Mac: /dev/tty.usbserial-*, /dev/tty.usbmodem*

4. **Select first match**:
   - If multiple matches, selects the first one
   - Logs all available ports for debugging

### Auto-Reconnection Flow

```
Connection Lost
    ↓
Wait 5 seconds (reconnectDelay)
    ↓
Try to reconnect
    ↓
Success? → Resume sending data
    ↓
Failed? → Wait 5 seconds → Retry
```

## Troubleshooting

### Auto-detection finds wrong port

**Solution**: Manually specify the port in `.env`:
```env
SERIAL_PORT=COM4  # Use the correct port
```

### No port detected

**Check**:
1. Is Arduino/ESP32 connected via USB?
2. Are USB drivers installed? (CH340, CP2102, FTDI)
3. Is the port being used by another program? (Close Arduino IDE Serial Monitor)

**Solution**: List all ports manually:
```bash
# Windows: Device Manager → Ports (COM & LPT)
# Linux: ls /dev/tty*
# Mac: ls /dev/tty.*
```

Then specify the correct port in `.env`.

### Multiple Arduino devices connected

**Solution**: The service will select the first match. To use a specific device:
1. Disconnect other Arduino devices, OR
2. Manually specify the port in `.env`

### Port changes after reboot

**Solution**: Use `SERIAL_PORT=auto` - it will automatically find the new port number.

## Advanced: Port Monitoring

The service can detect when a port is added/removed:

```typescript
// Future enhancement: Monitor port changes
SerialPort.list().then(ports => {
  // Check if Arduino port is still available
  // Auto-reconnect if port changes
});
```

## Benefits of Auto-Connection

1. **No manual configuration** - Just plug and play
2. **Works across different computers** - No need to change port numbers
3. **Handles port changes** - If port number changes, auto-detection finds it
4. **Multiple device support** - Can detect which device is Arduino/ESP32
5. **Easier setup** - New users don't need to find port numbers

## Example: Complete Auto-Setup

```bash
# 1. Connect Arduino/ESP32 via USB
# 2. Edit .env (set SERIAL_PORT=auto)
# 3. Start service
npm start

# Output:
# [INFO] Scanning 2 available serial ports...
# [INFO] Auto-detected Arduino/ESP32 port: COM3
# [INFO] Connecting to serial port: COM3 at 115200 baud
# [INFO] Serial port opened: COM3
# [INFO] Bridge service started successfully
# [INFO] Parsed data: { temperature: 38.5, bpm: 72 }
# [INFO] Successfully sent vital data: HR=72, Temp=38.5°C
```

## Comparison: Manual vs Auto

| Feature | Manual Port | Auto-Detection |
|---------|-------------|----------------|
| Setup Time | 2-5 minutes | 30 seconds |
| Port Finding | Manual (Device Manager) | Automatic |
| Port Changes | Must update .env | Auto-adjusts |
| Multiple Devices | Must specify exact port | Auto-selects Arduino |
| User Friendly | Requires technical knowledge | Plug and play |

## Next Steps

1. **Try auto-detection**: Set `SERIAL_PORT=auto` in `.env`
2. **Monitor logs**: Check if correct port is detected
3. **Fallback if needed**: Specify port manually if auto-detection fails

The auto-connection feature makes the collar system much easier to set up and use, especially for non-technical users!


