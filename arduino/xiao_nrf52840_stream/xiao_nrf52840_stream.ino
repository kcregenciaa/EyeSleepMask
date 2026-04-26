#include <Wire.h>
#include <MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>
#include <math.h>

// =====================
// MPU6050
// =====================
MPU6050 mpu;

// =====================
// MIC
// =====================
const int micPin = A1;

const int windowSize = 20;
int samples[20];
int sampleIndex = 0;
bool windowFull = false;

// =====================
// MIC CALIBRATION
// =====================
float micBaseline = 0;
float baselineRMS = 0;

// =====================
// TIMING
// =====================
unsigned long lastMicCheck = 0;
const unsigned long micInterval = 50;

// =====================
// LED
// =====================
#define LED_PIN 6
#define NUM_LEDS 12
Adafruit_NeoPixel strip(NUM_LEDS * 2, LED_PIN, NEO_GRB + NEO_KHZ800);

// =====================
// MOTION
// =====================
float smoothMotion = 0;
float motionAlpha = 0.15;

// =====================
// STATE
// =====================
bool alertActive = false;
int flashBrightness = 20;
float baselineMotion = 0;
String baselinePosition = "";

// =====================
// ALERT TIMING
// =====================
unsigned long lastAlertCheck = 0;

// =====================
// SETUP
// =====================
void setup()
{
  Serial.begin(115200);
  delay(2000);

  Wire.begin();
  mpu.initialize();

  strip.begin();
  strip.setBrightness(0);
  strip.show();

  Serial.println("SYSTEM STARTING...");

  // ======================
  // MIC CALIBRATION
  // ======================
  Serial.println("Calibrating mic... keep quiet");

  long sum = 0;
  for (int i = 0; i < 100; i++)
  {
    sum += analogRead(micPin);
    delay(10);
  }
  micBaseline = sum / 100.0;

  long energy = 0;
  for (int i = 0; i < windowSize; i++)
  {
    int val = analogRead(micPin);
    int diff = val - (int)micBaseline;
    energy += diff * diff;
    delay(5);
  }
  baselineRMS = sqrt((float)energy / windowSize);

  Serial.print("Mic DC baseline: ");
  Serial.println(micBaseline);
  Serial.print("Mic RMS noise floor: ");
  Serial.println(baselineRMS);

  Serial.println("SYSTEM READY");
}

// =====================
// MOTION READ
// =====================
float readMotion()
{
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  float ax_g = ax / 16384.0;
  float ay_g = ay / 16384.0;
  float az_g = az / 16384.0;

  float mag = sqrt(ax_g * ax_g + ay_g * ay_g + az_g * az_g);
  return abs(mag - 1.0) * 100.0;
}

// =====================
// SLEEPING POSITION
// =====================
String getSleepPosition()
{
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  float ax_g = ax / 16384.0;
  float ay_g = ay / 16384.0;
  float az_g = az / 16384.0;

  if (az_g > 0.8)
    return "FACE UP (supine)";
  if (az_g < -0.8)
    return "FACE DOWN (prone)";
  if (ax_g > 0.8)
    return "LEFT SIDE";
  if (ax_g < -0.8)
    return "RIGHT SIDE";
  if (ay_g > 0.8)
    return "HEAD DOWN";
  if (ay_g < -0.8)
    return "HEAD UP";

  return "TRANSITIONING";
}

// =====================
// LED CONTROL
// =====================
void setLED(uint8_t r, uint8_t g, uint8_t b)
{
  for (int i = 0; i < NUM_LEDS * 2; i++)
  {
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.show();
}

// =====================
// FLASH
// =====================
void flashTwice(int brightnessPercent)
{
  int brightnessValue = map(brightnessPercent, 0, 100, 0, 255);
  strip.setBrightness(brightnessValue);

  Serial.print("[FLASH] Level: ");
  Serial.print(brightnessPercent);
  Serial.println("%");

  for (int i = 0; i < 2; i++)
  {
    setLED(255, 255, 255);
    Serial.println("[FLASH] ON");
    delay(200);
    setLED(0, 0, 0);
    Serial.println("[FLASH] OFF");
    delay(200);
  }

  Serial.println("[SYSTEM] PAUSING 5 SECONDS...");
  delay(5000);
}

// =====================
// LOOP
// =====================
void loop()
{

  // ======================
  // FAST MIC SAMPLING (50ms)
  // ======================
  if (millis() - lastMicCheck >= micInterval)
  {
    lastMicCheck = millis();

    int val = analogRead(micPin);
    samples[sampleIndex] = val;
    sampleIndex = (sampleIndex + 1) % windowSize;
    if (sampleIndex == 0)
      windowFull = true;
  }

  // ======================
  // 1 SECOND ALERT CYCLE
  // ======================
  if (millis() - lastAlertCheck >= 1000)
  {
    lastAlertCheck = millis();

    int count = windowFull ? windowSize : sampleIndex;
    if (count == 0)
      return;

    // Compute mean
    long sum = 0;
    for (int i = 0; i < count; i++)
      sum += samples[i];
    int avg = sum / count;

    // Compute RMS
    long energy = 0;
    for (int i = 0; i < count; i++)
    {
      int diff = samples[i] - avg;
      energy += diff * diff;
    }
    float rms = sqrt((float)energy / count);

    // Scale to level
    float normalized = rms - baselineRMS;
    if (normalized < 0)
      normalized = 0;

    float snoreLevel = (normalized / 50.0f) * 100.0f; // <-- TUNE THIS
    if (snoreLevel > 100.0f)
      snoreLevel = 100.0f;

    Serial.print("[MIC] RMS: ");
    Serial.print(rms);
    Serial.print("  Level: ");
    Serial.println(snoreLevel);

    // ======================
    // MOTION UPDATE
    // ======================
    float motion = readMotion();
    smoothMotion = motionAlpha * motion + (1 - motionAlpha) * smoothMotion;

    // ======================
    // GYRO READ
    // ======================
    int16_t gx, gy, gz;
    mpu.getRotation(&gx, &gy, &gz);
    Serial.print("[GYRO] X: ");
    Serial.print(gx);
    Serial.print("  Y: ");
    Serial.print(gy);
    Serial.print("  Z: ");
    Serial.println(gz);

    Serial.print("[MOTION] Smooth: ");
    Serial.println(smoothMotion);

    // ======================
    // SLEEPING POSITION
    // ======================
    String currentPosition = getSleepPosition();
    Serial.print("[POSITION] ");
    Serial.println(currentPosition);

    // ======================
    // SEND JSON TO PYTHON BRIDGE
    // ======================
    String jsonPayload = "{\"snoreLevel\":" + String(snoreLevel, 1) +
                         ",\"motion\":" + String(smoothMotion, 1) +
                         ",\"position\":\"" + currentPosition + "\"" +
                         ",\"alertActive\":" + String(alertActive ? "true" : "false") +
                         "}";
    Serial.println(jsonPayload);

    // ======================
    // TRIGGER
    // ======================
    if (!alertActive && snoreLevel > 9)
    { // <-- TUNE THIS
      alertActive = true;
      baselineMotion = smoothMotion;
      baselinePosition = currentPosition;
      flashBrightness = 20;
      flashTwice(flashBrightness);
    }

    // ======================
    // ALERT MODE
    // ======================
    if (alertActive)
    {
      bool positionChanged = (currentPosition != baselinePosition) &&
                             (currentPosition != "TRANSITIONING");

      if (positionChanged)
      {
        alertActive = false;
        smoothMotion = 0;
        flashBrightness = 20;
        baselinePosition = "";
        setLED(0, 0, 0);
        strip.setBrightness(0);
        Serial.print("[SYSTEM] POSITION CHANGED TO: ");
        Serial.println(currentPosition);
        Serial.println("[SYSTEM] USER MOVED - RESET");
      }
      else
      {
        flashBrightness += 20;
        if (flashBrightness > 100)
          flashBrightness = 100;
        flashTwice(flashBrightness);
      }
    }

    // ======================
    // IDLE
    // ======================
    if (!alertActive && snoreLevel <= 9)
    {
      setLED(0, 0, 0);
      strip.setBrightness(0);
    }
  }
}