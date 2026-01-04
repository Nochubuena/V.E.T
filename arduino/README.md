# Arduino Collar Code

This folder contains the Arduino code for the V.E.T collar system.

## Hardware Requirements

- Arduino board (ESP32 recommended for pin 33 support, or Arduino-compatible board)
- DS18B20 Temperature Sensor (Dallas OneWire)
- Pulse/Heart Rate Sensor (analog)
- Wiring:
  - Temperature sensor: Pin 4
  - Pulse sensor: Pin 33 (analog)

## Required Libraries

Before uploading, install these libraries via Arduino IDE Library Manager:

1. **OneWire** by Paul Stoffregen
   - Tools → Manage Libraries → Search "OneWire"
   - Install "OneWire" by Paul Stoffregen

2. **DallasTemperature** by Miles Burton
   - Tools → Manage Libraries → Search "DallasTemperature"
   - Install "DallasTemperature" by Miles Burton

## Setup Instructions

1. **Open Arduino IDE**
2. **Install Required Libraries** (see above)
3. **Open the code:**
   - File → Open → Navigate to `arduino/collar/collar.ino`
4. **Select your board:**
   - Tools → Board → Select your Arduino board (e.g., "ESP32 Dev Module")
5. **Select the port:**
   - Tools → Port → Select the COM port where your Arduino is connected
6. **Upload the code:**
   - Click the Upload button (→) or press Ctrl+U
7. **Open Serial Monitor:**
   - Tools → Serial Monitor
   - Set baud rate to **115200**
   - You should see output like:
     ```
     Temperature:38.5C 101.3F
     Waveform:1850 BPM:72 
     ```

## Output Format

The code sends data via Serial at 115200 baud in this format:
```
Temperature:38.5C 101.3F
Waveform:1850 BPM:72 
```

This format is parsed by the bridge service (`bridge-service/src/dataParser.ts`).

## Pin Configuration

- **Pin 4**: OneWire bus for DS18B20 temperature sensor
- **Pin 33**: Analog input for pulse/heart rate sensor

## Configuration

- **Serial Baud Rate**: 115200 (must match bridge service configuration)
- **Update Interval**: 1000ms (1 second)
- **BPM Threshold**: 1800 (adjust if needed for your sensor)
- **BPM Time Delta**: 300ms minimum between beats

## Troubleshooting

### No temperature reading
- Check DS18B20 wiring (VCC, GND, DATA to pin 4)
- Verify sensor is powered (may need 4.7kΩ pull-up resistor)
- Check serial monitor for error messages

### No pulse/BPM reading
- Verify pulse sensor is connected to pin 33
- Check if Signal value exceeds Threshold (1800)
- Adjust Threshold value if needed
- Ensure sensor is making good contact

### Serial output not working
- Verify baud rate is 115200 in Serial Monitor
- Check USB cable connection
- Ensure no other program is using the serial port

## Next Steps

After uploading this code:
1. Verify Serial Monitor shows correct data format
2. Set up the bridge service (see `bridge-service/README.md`)
3. Configure bridge service `.env` file with correct SERIAL_PORT
4. Start bridge service to connect Arduino to backend API

For more details, see `ARDUINO_CODE_INTEGRATION.md` in the project root.

