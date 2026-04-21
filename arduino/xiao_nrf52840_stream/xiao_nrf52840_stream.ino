#include <Wire.h>
#include <MPU6050.h>
#include <Adafruit_NeoPixel.h>
#include <Arduino.h>

// =====================
// MPU6050
// =====================
MPU6050 mpu;

// =====================
// MIC
// =====================
const int micPin = A0;
const int windowSize = 50;
int samples[50];
int sampleIndex = 0;

// =====================
// LED
// =====================
#define LED_PIN D6
#define NUM_LEDS 12
Adafruit_NeoPixel strip(NUM_LEDS * 2, LED_PIN, NEO_GRB + NEO_KHZ800);

// =====================
// SMOOTHING VARIABLES
// =====================
float smoothMotion = 0;
float smoothMic = 0;

float alpha = 0.15; // smoothing strength

// =====================
// TIMING
// =====================
unsigned long lastUpdate = 0;

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

  Serial.println("SMOOTH SLEEP SYSTEM READY");
}

// =====================
// MIC RMS
// =====================
int readMicRMS()
{
  int val = analogRead(micPin);

  samples[sampleIndex] = val;
  sampleIndex = (sampleIndex + 1) % windowSize;

  long sum = 0;
  for (int i = 0; i < windowSize; i++)
  {
    sum += samples[i];
  }

  int avg = sum / windowSize;

  long energy = 0;
  for (int i = 0; i < windowSize; i++)
  {
    int diff = samples[i] - avg;
    energy += diff * diff;
  }

  return sqrt(energy / windowSize);
}

// =====================
// MOTION
// =====================
float readMotion()
{
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  float ax_g = ax / 16384.0;
  float ay_g = ay / 16384.0;
  float az_g = az / 16384.0;

  float mag = sqrt(ax_g * ax_g + ay_g * ay_g + az_g * az_g);
  return abs(mag - 1.0);
}

// =====================
// LED
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
// LOOP
// =====================
void loop()
{

  if (millis() - lastUpdate >= 1000)
  {
    lastUpdate = millis();

    // ---------------------
    // RAW VALUES
    // ---------------------
    float motionRaw = readMotion();
    int micRaw = readMicRMS();

    // ---------------------
    // SMOOTHING (EMA)
    // ---------------------
    smoothMotion = (alpha * motionRaw) + ((1 - alpha) * smoothMotion);
    smoothMic = (alpha * micRaw) + ((1 - alpha) * smoothMic);

    // normalize mic (0–100 scale)
    float micLevel = constrain(smoothMic, 0, 200);
    micLevel = map(micLevel, 0, 200, 0, 100);

    // ---------------------
    // SERIAL OUTPUT (FOR XAMPP / PHP)
    // ---------------------
    Serial.print("{");
    Serial.print("\"motion\":");
    Serial.print(smoothMotion, 3);
    Serial.print(",\"mic\":");
    Serial.print(micLevel);
    Serial.println("}");

    // ---------------------
    // STATE LOGIC
    // ---------------------
    bool lowMotion = smoothMotion < 0.08;
    bool noise = micLevel > 20;

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
}