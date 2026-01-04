// ESP32 Collar Code for V.E.T System
// Hardware: ESP32 Dev Module
// Sensors: DS18B20 Temperature (Pin 4), Pulse Sensor (Pin 33)

#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

#define PULSE_PIN 33  // ESP32 GPIO33 (ADC1_CH5)

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

