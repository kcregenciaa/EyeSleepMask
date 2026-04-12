#include <Wire.h>
#include <SparkFunLSM6DS3.h>
#include <Adafruit_NeoPixel.h>

// ----------------------
// IMU SETUP
// ----------------------
LSM6DS3 imu(I2C_MODE, 0x6B);

// ----------------------
// LED SETUP (ONE PIN for BOTH RINGS)
// ----------------------
#define LED_PIN D1
#define NUM_LEDS 12

Adafruit_NeoPixel strip(NUM_LEDS * 2, LED_PIN, NEO_GRB + NEO_KHZ800);

// ----------------------
// MOVEMENT DETECTION (kept for reference, not used for LED anymore)
// ----------------------
int movementCount = 0;
unsigned long movementWindowStart = 0;
const unsigned long MOVEMENT_WINDOW = 10000;
const float MOVEMENT_THRESHOLD = 1.5;

// ----------------------
// CALM TIMER (kept optional)
// ----------------------
unsigned long calmStartTime = 0;
const unsigned long CALM_DURATION = 30000;
bool alertTriggered = false;

// ----------------------
// MOTION SMOOTHING
// ----------------------
float smoothed = 0;
float alpha = 0.1;
const float GRAVITY_MPS2 = 9.81;
const float MOTION_NOISE_FLOOR = 0.02;
const float MOTION_TO_PERCENT = 140.0;

// ----------------------
// SERIAL TIMER (2 seconds)
// ----------------------
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 2000;

const char* DEVICE_NAME = "seeed-xiao-nrf52840";

// ----------------------
// LOW MOTION DETECTION (for LED)
// ----------------------
unsigned long lowMotionStart = 0;
bool isLowMotion = false;
const float CALM_THRESHOLD = 0.08;
const unsigned long CALM_TIME = 5000;

// ----------------------
void setup() {
  Serial.begin(115200);
  delay(300);

  strip.begin();
  strip.show();

  if (imu.begin() != 0){
    Serial.println("IMU not detected!");
    while(1);
  }

  Serial.println("IMU ready!");

  movementWindowStart = millis();
  calmStartTime = millis();
}

// ----------------------
void loop() {
  // ----------------------
  // READ IMU
  // ----------------------
  float ax = imu.readFloatAccelX();
  float ay = imu.readFloatAccelY();
  float az = imu.readFloatAccelZ();

  // ----------------------
  // MOTION SIGNAL (gravity removed)
  // ----------------------
  float magnitude = sqrt(ax * ax + ay * ay + az * az);

  // LSM6DS3 library outputs can be either in g or m/s^2 depending on config.
  // If we are clearly above 1g scale, normalize from m/s^2 to g.
  float magnitudeG = magnitude;
  if (magnitude > 3.0) {
    magnitudeG = magnitude / GRAVITY_MPS2;
  }

  float motion = abs(magnitudeG - 1.0);

  if (motion < MOTION_NOISE_FLOOR) {
    motion = 0;
  }

  smoothed = alpha * motion + (1 - alpha) * smoothed;

  // ----------------------
  // SERIAL OUTPUT (every 2 seconds)
  // ----------------------
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    int movementPct = (int)round(smoothed * MOTION_TO_PERCENT);
    movementPct = constrain(movementPct, 0, 100);

    Serial.print("{\"device\":\"");
    Serial.print(DEVICE_NAME);
    Serial.print("\",\"snoreLevel\":0,\"movement\":");
    Serial.print(movementPct);
    Serial.println(",\"battery\":100}");

    lastSendTime = millis();
  }

  // ----------------------
  // LOW MOTION DETECTION (for LED behavior)
  // ----------------------
  if (smoothed >= 0 && smoothed <= CALM_THRESHOLD) {
    if (lowMotionStart == 0) {
      lowMotionStart = millis();
    }

    if (millis() - lowMotionStart >= CALM_TIME) {
      isLowMotion = true;
    }
  } else {
    lowMotionStart = 0;
    isLowMotion = false;
  }

  // ----------------------
  // LED BEHAVIOR
  // ----------------------
  if (isLowMotion) {
    static bool on = false;

    uint32_t color = on ? strip.Color(255, 255, 0) : strip.Color(0, 0, 0);
    // YELLOW blink = calm sleep

    for (int i = 0; i < NUM_LEDS * 2; i++) {
      strip.setPixelColor(i, color);
    }

    strip.show();
    on = !on;

    delay(300);
  } 
  else {
    // OFF during movement
    for (int i = 0; i < NUM_LEDS * 2; i++) {
      strip.setPixelColor(i, strip.Color(0, 0, 0));
    }
    strip.show();
  }

  delay(50);
}