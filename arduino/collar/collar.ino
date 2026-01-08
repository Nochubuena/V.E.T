// ESP32 Collar Code for V.E.T System - Hybrid WiFi/USB Serial + Blynk Integration
// Hardware: ESP32 Dev Module
// Sensors: DS18B20 Temperature (Pin 4), Pulse Sensor (Pin 33)
// Connection: WiFi (primary) or USB Serial (fallback)
// Platforms: V.E.T Backend API + Blynk Cloud (dual integration)

#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <BlynkSimpleEsp32.h>

// ========== CONFIGURATION ==========
// WiFi Credentials (change these to your WiFi)
const char* ssid = "YOUR_WIFI_NAME";           // Change this
const char* password = "YOUR_WIFI_PASSWORD";   // Change this

// Blynk Configuration
#define BLYNK_TEMPLATE_ID "TMPL64ATz1cMw"      // Your Blynk Template ID (optional)
#define BLYNK_TEMPLATE_NAME "VET_Collar"       // Your Blynk Template Name (optional)
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_TOKEN"    // Change to your Blynk auth token

// Backend API Configuration (V.E.T System)
const char* apiBaseURL = "http://localhost:3000/api";  // Change to your backend URL
const char* dogId = "YOUR_DOG_ID";                    // Change to your dog's MongoDB ID
const char* authToken = "YOUR_AUTH_TOKEN";             // Change to your JWT token

// Update interval (milliseconds)
const unsigned long UPDATE_INTERVAL = 5000;  // Send data every 5 seconds

// Blynk Virtual Pins (you can change these if needed)
#define VIRTUAL_PIN_TEMP V1      // Temperature in Celsius
#define VIRTUAL_PIN_TEMPF V2     // Temperature in Fahrenheit
#define VIRTUAL_PIN_HEARTRATE V3 // Heart Rate (BPM)
#define VIRTUAL_PIN_STATUS V4    // Status indicator
#define VIRTUAL_PIN_WAVEFORM V5  // Raw waveform signal

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
bool blynkConnected = false;
unsigned long lastBlynkUpdate = 0;

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
  
  // Initialize Blynk if WiFi is connected
  if (wifiConnected) {
    initializeBlynk();
  }
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
    
    // Run Blynk (must be called regularly)
    Blynk.run();
    blynkConnected = Blynk.connected();
    
    // Send data to V.E.T API
    if (now - lastApiUpdate > UPDATE_INTERVAL && BPM > 0) {
      sendDataToAPI(tempC, BPM);
      lastApiUpdate = now;
    }
    
    // Send data to Blynk
    if (blynkConnected && now - lastBlynkUpdate > UPDATE_INTERVAL) {
      sendDataToBlynk(tempC, tempF, BPM, Signal);
      lastBlynkUpdate = now;
    }
  } else {
    // WiFi disconnected, fallback to Serial only
    wifiConnected = false;
    blynkConnected = false;
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
    Serial.println("Mode: WiFi (sending data to V.E.T API + Blynk)");
    
    // Initialize Blynk after WiFi connection
    initializeBlynk();
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("WiFi Connection Failed!");
    Serial.println("Mode: USB Serial only (fallback)");
    Serial.println("Data will be sent via Serial port for bridge service");
  }
}

// ========== BLYNK INITIALIZATION ==========
void initializeBlynk() {
  // Check if Blynk token is configured
  if (strcmp(BLYNK_AUTH_TOKEN, "YOUR_BLYNK_TOKEN") == 0) {
    Serial.println("Blynk: Auth token not configured, skipping Blynk initialization");
    return;
  }
  
  Serial.print("Initializing Blynk... ");
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, password);
  
  // Wait a bit for Blynk connection
  delay(2000);
  
  if (Blynk.connected()) {
    blynkConnected = true;
    Serial.println("Blynk Connected!");
    Blynk.virtualWrite(VIRTUAL_PIN_STATUS, 1); // Send connection status
  } else {
    blynkConnected = false;
    Serial.println("Blynk Connection Failed (will retry)");
  }
}

// ========== SEND DATA TO BLYNK ==========
void sendDataToBlynk(float tempC, float tempF, int heartRate, int waveform) {
  if (!blynkConnected || !Blynk.connected()) {
    // Try to reconnect if disconnected
    if (wifiConnected && WiFi.status() == WL_CONNECTED) {
      initializeBlynk();
    }
    return;
  }
  
  // Send temperature in Celsius
  Blynk.virtualWrite(VIRTUAL_PIN_TEMP, tempC);
  
  // Send temperature in Fahrenheit
  Blynk.virtualWrite(VIRTUAL_PIN_TEMPF, tempF);
  
  // Send heart rate (BPM)
  if (heartRate > 0) {
    Blynk.virtualWrite(VIRTUAL_PIN_HEARTRATE, heartRate);
  }
  
  // Send raw waveform signal
  Blynk.virtualWrite(VIRTUAL_PIN_WAVEFORM, waveform);
  
  // Update status (1 = OK, 0 = Error)
  Blynk.virtualWrite(VIRTUAL_PIN_STATUS, 1);
  
  Serial.println("Data sent to Blynk successfully!");
}

// ========== BLYNK EVENT HANDLERS ==========
// Optional: Handle button/widget events from Blynk app
BLYNK_WRITE(V0) {
  // Example: If you add a button widget on V0
  int pinValue = param.asInt();
  Serial.print("Blynk Button V0: ");
  Serial.println(pinValue);
}

// Blynk connection status handler
BLYNK_CONNECTED() {
  Serial.println("Blynk: Device connected to server");
  blynkConnected = true;
}

BLYNK_DISCONNECTED() {
  Serial.println("Blynk: Device disconnected from server");
  blynkConnected = false;
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

