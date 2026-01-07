// ESP32 Collar Code for V.E.T System - Hybrid WiFi/USB Serial
// Hardware: ESP32 Dev Module
// Sensors: DS18B20 Temperature (Pin 4), Pulse Sensor (Pin 33)
// Connection: WiFi (primary) or USB Serial (fallback)

#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ========== CONFIGURATION ==========
// WiFi Credentials (change these to your WiFi)
const char* ssid = "YOUR_WIFI_NAME";           // Change this
const char* password = "YOUR_WIFI_PASSWORD";   // Change this

// Backend API Configuration
const char* apiBaseURL = "http://localhost:3000/api";  // Change to your backend URL
const char* dogId = "YOUR_DOG_ID";                    // Change to your dog's MongoDB ID
const char* authToken = "YOUR_AUTH_TOKEN";             // Change to your JWT token

// Update interval (milliseconds)
const unsigned long UPDATE_INTERVAL = 5000;  // Send data every 5 seconds

// ========== HARDWARE PINS ==========
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

#define PULSE_PIN 33  // ESP32 GPIO33 (ADC1_CH5)

// ========== GLOBAL VARIABLES ==========
int Signal;
int Threshold = 1800;
unsigned long lastBeatTime = 0;
int BPM = 0;

// WiFi and connection status
bool wifiConnected = false;
unsigned long lastWiFiAttempt = 0;
const unsigned long WIFI_RETRY_INTERVAL = 30000;  // Retry WiFi every 30 seconds
unsigned long lastApiUpdate = 0;

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== V.E.T Collar System Starting ===");
  Serial.println("Hybrid Mode: WiFi (primary) + USB Serial (fallback)");
  
  // Initialize sensors
  sensors.begin();
  Serial.println("Sensors initialized");
  
  // Try to connect to WiFi
  connectToWiFi();
}

// ========== MAIN LOOP ==========
void loop() {
  // Read sensors
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);
  float tempF = sensors.getTempFByIndex(0);

  // Read pulse sensor
  Signal = analogRead(PULSE_PIN);

  // Calculate BPM
  if (Signal > Threshold) {
    unsigned long currentTime = millis();
    unsigned long timeDelta = currentTime - lastBeatTime;

    if (timeDelta > 300) {
      BPM = 60000 / timeDelta;
      lastBeatTime = currentTime;
    }
  }

  // Always output to Serial (for debugging and fallback)
  Serial.print("Temperature:");
  Serial.print(tempC);
  Serial.print("C ");
  Serial.print(tempF);
  Serial.println("F");

  Serial.print("Waveform:");
  Serial.print(Signal);
  Serial.print(" ");

  if (BPM > 0) {
    Serial.print("BPM:");
    Serial.print(BPM);
    Serial.print(" ");
  }
  Serial.println();

  // Try WiFi connection if not connected
  if (!wifiConnected) {
    unsigned long now = millis();
    if (now - lastWiFiAttempt > WIFI_RETRY_INTERVAL) {
      Serial.println("WiFi not connected, attempting reconnection...");
      connectToWiFi();
      lastWiFiAttempt = now;
    }
  }

  // Send data via WiFi if connected
  if (wifiConnected && WiFi.status() == WL_CONNECTED) {
    unsigned long now = millis();
    if (now - lastApiUpdate > UPDATE_INTERVAL && BPM > 0) {
      sendDataToAPI(tempC, BPM);
      lastApiUpdate = now;
    }
  } else {
    // WiFi disconnected, fallback to Serial only
    wifiConnected = false;
  }

  delay(1000);
}

// ========== WIFI CONNECTION ==========
void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println();
    Serial.println("WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.println("Mode: WiFi (sending data to API)");
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("WiFi Connection Failed!");
    Serial.println("Mode: USB Serial only (fallback)");
    Serial.println("Data will be sent via Serial port for bridge service");
  }
}

// ========== SEND DATA TO API ==========
void sendDataToAPI(float temperature, int heartRate) {
  if (strcmp(apiBaseURL, "http://localhost:3000/api") == 0 || 
      strcmp(dogId, "YOUR_DOG_ID") == 0 || 
      strcmp(authToken, "YOUR_AUTH_TOKEN") == 0) {
    // Configuration not set, skip API call
    return;
  }

  HTTPClient http;
  
  // Construct API URL
  String url = String(apiBaseURL) + "/dogs/" + String(dogId) + "/vitals";
  
  Serial.print("Sending data to API: ");
  Serial.println(url);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(authToken));

  // Create JSON payload
  String jsonPayload = "{";
  jsonPayload += "\"heartRate\":" + String(heartRate) + ",";
  jsonPayload += "\"temperature\":" + String(temperature) + ",";
  jsonPayload += "\"time\":\"" + getCurrentTime() + "\"";
  jsonPayload += "}";

  // Send POST request
  int httpResponseCode = http.PUT(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("API Response Code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == 200) {
      Serial.println("Data sent successfully via WiFi!");
    } else {
      Serial.print("API Error: ");
      Serial.println(httpResponseCode);
    }
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(httpResponseCode));
    Serial.println("Falling back to Serial mode");
  }

  http.end();
}

// ========== GET CURRENT TIME (ISO FORMAT) ==========
String getCurrentTime() {
  // Get current time (simplified - you can add NTP for accurate time)
  unsigned long now = millis();
  unsigned long seconds = now / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours = minutes / 60;
  
  // Format as ISO 8601 (simplified)
  String timeStr = "2024-01-01T";
  if (hours < 10) timeStr += "0";
  timeStr += String(hours) + ":";
  if ((minutes % 60) < 10) timeStr += "0";
  timeStr += String(minutes % 60) + ":";
  if ((seconds % 60) < 10) timeStr += "0";
  timeStr += String(seconds % 60) + "Z";
  
  return timeStr;
}

