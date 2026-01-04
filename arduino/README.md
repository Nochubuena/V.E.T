# ESP32 Collar Code

This folder contains the ESP32 code for the V.E.T collar system.

## Hardware Requirements

- **ESP32 Dev Module** (or compatible ESP32 board)
- DS18B20 Temperature Sensor (Dallas OneWire)
- Pulse/Heart Rate Sensor (analog)
- Wiring:
  - Temperature sensor: GPIO 4
  - Pulse sensor: GPIO 33 (ADC1_CH5 - analog input)
  - Pull-up resistor: 4.7kΩ for DS18B20 (typically between DATA and VCC)

## ESP32 Board Setup in Arduino IDE

Before uploading, you need to install the ESP32 board package:

1. **Install ESP32 Board Package:**
   - File → Preferences
   - In "Additional Board Manager URLs", add:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Click OK
   - Tools → Board → Boards Manager
   - Search "ESP32"
   - Install "esp32 by Espressif Systems"
   - Wait for installation to complete

2. **Select ESP32 Board:**
   - Tools → Board → ESP32 Arduino → **ESP32 Dev Module**
   - (Or your specific ESP32 board variant)

## Required Libraries

Install these libraries via Arduino IDE Library Manager:

1. **OneWire** by Paul Stoffregen
   - Tools → Manage Libraries → Search "OneWire"
   - Install "OneWire" by Paul Stoffregen

2. **DallasTemperature** by Miles Burton
   - Tools → Manage Libraries → Search "DallasTemperature"
   - Install "DallasTemperature" by Miles Burton

## Setup Instructions

1. **Install ESP32 Board Package** (see above - one-time setup)
2. **Install Required Libraries** (see above)
3. **Connect ESP32 to computer via USB**
4. **Open the code:**
   - File → Open → Navigate to `arduino/collar/collar.ino`
5. **Select ESP32 board:**
   - Tools → Board → ESP32 Arduino → **ESP32 Dev Module**
6. **Select the port:**
   - Tools → Port → Select the COM port where your ESP32 is connected
   - (May need to install USB-to-Serial drivers if port doesn't appear)
7. **Upload settings (optional adjustments):**
   - Tools → Upload Speed → 115200 (or 921600 for faster uploads)
   - Tools → CPU Frequency → 240MHz (default)
   - Tools → Flash Frequency → 80MHz (default)
   - Tools → Flash Size → 4MB (default)
   - Tools → Partition Scheme → Default (default)
8. **Upload the code:**
   - Hold BOOT button on ESP32 (if needed for first upload)
   - Click the Upload button (→) or press Ctrl+U
   - Release BOOT button after upload starts
9. **Open Serial Monitor:**
   - Tools → Serial Monitor
   - Set baud rate to **115200**
   - Set line ending to "Newline" (optional)
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

## Pin Configuration (ESP32)

- **GPIO 4**: OneWire bus for DS18B20 temperature sensor
- **GPIO 33**: Analog input (ADC1_CH5) for pulse/heart rate sensor
  - Note: GPIO 33 is on ADC1, which works during WiFi operation
  - ADC resolution: 12-bit (0-4095), but analogRead returns 0-4095

## Configuration

- **Serial Baud Rate**: 115200 (must match bridge service configuration)
- **Update Interval**: 1000ms (1 second)
- **BPM Threshold**: 1800 (adjust if needed for your sensor)
- **BPM Time Delta**: 300ms minimum between beats

## ESP32-Specific Notes

- **ADC Resolution**: ESP32 ADC is 12-bit (0-4095), so pulse sensor values may be different from Arduino Uno (10-bit: 0-1023)
- **GPIO 33**: Part of ADC1, works with WiFi enabled
- **Serial Communication**: ESP32 uses USB-to-Serial chip, baud rate 115200 is standard
- **Power**: ESP32 can be powered via USB or external 5V/VIN

## Troubleshooting

### ESP32 board not found in Arduino IDE
- Install ESP32 board package (see "ESP32 Board Setup" above)
- Restart Arduino IDE after installing board package
- Check "Additional Board Manager URLs" in Preferences

### Upload fails / ESP32 not in bootloader mode
- Hold BOOT button on ESP32 while clicking Upload
- Release BOOT button after upload starts
- Try pressing RESET button before upload
- Some ESP32 boards auto-enter bootloader mode

### No temperature reading
- Check DS18B20 wiring (VCC, GND, DATA to GPIO 4)
- Verify sensor is powered (3.3V or 5V, check sensor datasheet)
- Add 4.7kΩ pull-up resistor between DATA and VCC
- Check serial monitor for error messages or -127.00°C (indicates no sensor found)

### No pulse/BPM reading
- Verify pulse sensor is connected to GPIO 33
- Check if Signal value exceeds Threshold (1800)
- ESP32 ADC range is 0-4095 (not 0-1023 like Arduino), adjust Threshold if needed
- Ensure sensor is making good contact
- Check if sensor is powered correctly

### Serial output not working
- Verify baud rate is 115200 in Serial Monitor
- Check USB cable connection (data cable, not just power)
- Install USB-to-Serial drivers (CP2102, CH340, or FTDI depending on ESP32 board)
- Ensure no other program is using the serial port (close other serial monitors)
- Try pressing RESET button on ESP32

### Port doesn't appear
- Install USB-to-Serial drivers for your ESP32 board:
  - CP2102: Silicon Labs drivers
  - CH340: CH340 drivers
  - FTDI: FTDI drivers
- Check Device Manager (Windows) to see if port appears with error
- Try different USB cable (must support data, not just power)
- Try different USB port

## Next Steps

After uploading this code:
1. Verify Serial Monitor shows correct data format
2. Set up the bridge service (see `bridge-service/README.md`)
3. Configure bridge service `.env` file with correct SERIAL_PORT (e.g., COM3, COM4, /dev/ttyUSB0)
4. Start bridge service to connect ESP32 to backend API

For more details, see `ARDUINO_CODE_INTEGRATION.md` in the project root.

## Additional Resources

- [ESP32 Arduino Core Documentation](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [ESP32 Pin Reference](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)
- [DS18B20 Temperature Sensor Guide](https://randomnerdtutorials.com/esp32-ds18b20-temperature-sensor-web-server/)
