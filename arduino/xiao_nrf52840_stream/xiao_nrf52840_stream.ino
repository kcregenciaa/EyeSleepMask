#include <Wire.h>
#include <MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>

// =====================
// MPU6050
// =====================
MPU6050 mpu;

// =====================
// MIC (A1 FIXED)
// =====================
const int micPin = A1;

// =====================
// LED
// =====================
#define LED_PIN D6
#define NUM_LEDS 12
Adafruit_NeoPixel strip(NUM_LEDS * 2, LED_PIN, NEO_GRB + NEO_KHZ800);
int ledBrightnessPercent = 100;
String ledMode = "STATIC";
int wakeBlinkIntervalMs = 500;
bool wakeAlertActive = false;
bool wakeBlinkOn = true;
unsigned long wakeBlinkLastToggle = 0;

// =====================
// FILTER STATE
// =====================
float micFiltered = 0;
float micBaseline = 0;
float micEnvelope = 0;

float motionFiltered = 0;

// stronger stability tuning
float micAlpha = 0.08;
float motionAlpha = 0.12;
float baselineAlpha = 0.0008;
float envelopeAlpha = 0.2;

// =====================
// TIMING
// =====================
unsigned long lastUpdate = 0;

// =====================
// CALIBRATION
// =====================
void calibrateMic()
{
  Serial.println("Calibrating mic... stay quiet");

  long sum = 0;

  for (int i = 0; i < 300; i++)
  {
    sum += analogRead(micPin);
    delay(5);
  }

  micBaseline = sum / 300.0;

  Serial.print("Mic baseline: ");
  Serial.println(micBaseline);
}

// =====================
// MIC READ
// =====================
float readMic()
{
  long sum = 0;

  for (int i = 0; i < 24; i++)
  {
    sum += analogRead(micPin);
    delayMicroseconds(100);
  }

  return sum / 24.0;
}

// =====================
// MOTION READ (STABLE)
// =====================
float readMotion()
{
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  float ax_g = ax / 16384.0;
  float ay_g = ay / 16384.0;
  float az_g = az / 16384.0;

  float mag = sqrt(ax_g * ax_g + ay_g * ay_g + az_g * az_g);

  float diff = abs(mag - 1.0);

  // DEADZONE (VERY IMPORTANT)
  if (diff < 0.02)
    diff = 0;

  return diff * 60.0;
}

// =====================
// LED CONTROL
// =====================
void setLED(uint8_t r, uint8_t g, uint8_t b)
{
  uint8_t scaledR = (uint8_t)((r * ledBrightnessPercent) / 100);
  uint8_t scaledG = (uint8_t)((g * ledBrightnessPercent) / 100);
  uint8_t scaledB = (uint8_t)((b * ledBrightnessPercent) / 100);

  for (int i = 0; i < NUM_LEDS * 2; i++)
  {
    strip.setPixelColor(i, strip.Color(scaledR, scaledG, scaledB));
  }
  strip.show();
}

void readLedCommands()
{
  while (Serial.available() > 0)
  {
    String line = Serial.readStringUntil('\n');
    line.trim();

    if (line.startsWith("LED:"))
    {
      int parsed = line.substring(4).toInt();
      ledBrightnessPercent = constrain(parsed, 0, 100);

      Serial.print("{\"status\":\"led\",\"brightness\":");
      Serial.print(ledBrightnessPercent);
      Serial.println("}");
      continue;
    }

    if (line.startsWith("BLINK:"))
    {
      int parsed = line.substring(6).toInt();
      wakeBlinkIntervalMs = constrain(parsed, 100, 1500);

      Serial.print("{\"status\":\"blink\",\"speed\":");
      Serial.print(wakeBlinkIntervalMs);
      Serial.println("}");
      continue;
    }

    if (line.startsWith("WAKE:"))
    {
      int parsed = line.substring(5).toInt();
      wakeAlertActive = parsed > 0;
      wakeBlinkOn = true;
      wakeBlinkLastToggle = millis();

      Serial.print("{\"status\":\"wake\",\"active\":");
      Serial.print(wakeAlertActive ? 1 : 0);
      Serial.println("}");
      continue;
    }

    if (!line.startsWith("MODE:"))
    {
      continue;
    }

    String mode = line.substring(5);
    mode.trim();
    mode.toUpperCase();
    if (mode != "STATIC" && mode != "AUTO")
    {
      mode = "STATIC";
    }

    ledMode = mode;
    Serial.print("{\"status\":\"mode\",\"value\":\"");
    Serial.print(ledMode);
    Serial.println("\"}");
  }
}

// =====================
// SETUP
// =====================
void setup()
{
  Serial.begin(115200);
  delay(2000);

  Wire.begin();
  Wire.setClock(400000);

  mpu.initialize();

  strip.begin();
  strip.show();

  calibrateMic();

  Serial.println("SLEEP MASK STABLE MODE READY");
}

// =====================
// LOOP
// =====================
void loop()
{
  readLedCommands();

  if (millis() - lastUpdate < 1000)
    return;
  lastUpdate = millis();

  // =====================
  // RAW INPUT
  // =====================
  float micRaw = readMic();
  float motionRaw = readMotion();

  // =====================
  // MIC FILTER
  // =====================
  micFiltered = micAlpha * micRaw + (1 - micAlpha) * micFiltered;

  // =====================
  // STABLE BASELINE (VERY SLOW)
  // =====================
  micBaseline = micBaseline + baselineAlpha * (micFiltered - micBaseline);

  float micSignal = micFiltered - micBaseline;

  if (micSignal < 0)
    micSignal = 0;

  // =====================
  // ENVELOPE (STABLE SLEEP DETECTION CORE)
  // =====================
  micEnvelope = envelopeAlpha * micSignal + (1 - envelopeAlpha) * micEnvelope;

  // HARD NOISE CUT
  if (micEnvelope < 1.5)
    micEnvelope = 0;

  // =====================
  // SNORE SCALING (NO CLIPPING SPIKES)
  // =====================
  float snoreLevel = micEnvelope * 5.0;
  snoreLevel = sqrt(snoreLevel) * 20.0;
  snoreLevel = constrain(snoreLevel, 0, 100);

  // =====================
  // MOTION FILTER
  // =====================
  motionFiltered = motionAlpha * motionRaw + (1 - motionAlpha) * motionFiltered;

  float movementLevel = constrain(motionFiltered, 0, 100);

  // =====================
  // OUTPUT
  // =====================
  Serial.print("{\"snoreLevel\":");
  Serial.print(snoreLevel, 1);
  Serial.print(",\"movement\":");
  Serial.print(movementLevel, 1);
  Serial.println(",\"battery\":90}");

  // =====================
  // STATE LOGIC
  // =====================
  bool lowMotion = movementLevel < 6;
  bool noise = snoreLevel > 12;

  if (wakeAlertActive)
  {
    unsigned long now = millis();
    if (now - wakeBlinkLastToggle >= (unsigned long)wakeBlinkIntervalMs)
    {
      wakeBlinkOn = !wakeBlinkOn;
      wakeBlinkLastToggle = now;
    }

    if (wakeBlinkOn)
    {
      setLED(255, 255, 255);
    }
    else
    {
      setLED(0, 0, 0);
    }

    return;
  }

  if (ledMode == "STATIC")
  {
    setLED(40, 80, 255);
    return;
  }

  if (lowMotion && !noise)
  {
    setLED(255, 255, 0); // deep sleep
  }
  else if (lowMotion || noise)
  {
    setLED(80, 80, 0); // light sleep
  }
  else
  {
    setLED(0, 0, 0); // awake
  }
}