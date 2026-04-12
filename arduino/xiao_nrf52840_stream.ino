void setup() {
  Serial.begin(115200);
  while (!Serial) {
    delay(10);
  }
  randomSeed(analogRead(A0));
}

void loop() {
  int snoreLevel = random(5, 85);    // Replace with your sensor reading
  int movement = random(0, 100);     // Replace with your sensor reading
  int battery = random(70, 100);     // Replace with your battery read

  Serial.print("{\"device\":\"seeed-xiao-nrf52840\",\"snoreLevel\":");
  Serial.print(snoreLevel);
  Serial.print(",\"movement\":");
  Serial.print(movement);
  Serial.print(",\"battery\":");
  Serial.print(battery);
  Serial.println("}");

  delay(1000);
}
