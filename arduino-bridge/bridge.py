"""
RUN THIS IN POWERSHELL:

cd C:\\xampp\\htdocs\\EyeSleepMask\\EyeSleepMask\\arduino-bridge

$env:ARDUINO_PORT="COM14"
$env:ARDUINO_BAUD="115200"
$env:LIVE_SERVER_URL="http://localhost:8080/EyeSleepMask/EyeSleepMask"

python .\\bridge.py
"""

import json
import os
import sys
import time
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import requests
import serial
from serial import SerialException

# =====================
# CONFIG
# =====================
PORT_NAME = os.environ.get('ARDUINO_PORT', 'COM14')
BAUD_RATE = int(os.environ.get('ARDUINO_BAUD', '115200'))

LIVE_SERVER_URL = os.environ.get(
    'LIVE_SERVER_URL',
    'http://localhost:8080/EyeSleepMask/EyeSleepMask'
).rstrip('/')

INGEST_URL = f"{LIVE_SERVER_URL}/api/arduino-ingest.php"
MOTION_URL = f"{LIVE_SERVER_URL}/api/motion-data.php"

DEVICE_NAME = os.environ.get('ARDUINO_DEVICE', 'seeed-xiao-nrf52840')
READ_TIMEOUT = 1

DATA_FILE = Path(__file__).resolve().parent.parent / 'data' / 'arduino-latest.json'
LED_COMMAND_FILE = Path(__file__).resolve().parent.parent / 'data' / 'led-command.json'
_last_led_command_fingerprint = None
_last_led_sent = None
_last_led_mode_sent = None
_last_blink_speed_sent = None
_last_wake_alert_sent = None

# =====================
# SNORE DETECTOR (FIXED)
# =====================
class SnoreDetector:
    def __init__(self):
        self.window = deque(maxlen=30)

    def update(self, mic, motion):
        self.window.append(mic)

        if len(self.window) < 10:
            return 0

        arr = np.array(self.window)

        # 🔥 FEATURES
        energy = np.mean(arr)
        variability = np.std(arr)

        # detect pulse changes (snore pattern)
        diff = np.abs(np.diff(arr))
        burstiness = np.mean(diff)

        # low movement = more likely snore
        motion_factor = max(0, 50 - motion)

        # 🔥 FINAL SCORE
        score = (
            energy * 0.3 +
            variability * 0.3 +
            burstiness * 0.3 +
            motion_factor * 0.1
        )

        return max(0, min(100, score))


snore_engine = SnoreDetector()

# =====================
# HELPERS
# =====================
def now_iso():
    return datetime.now(timezone.utc).isoformat()


def clamp(value, low=0, high=100):
    return max(low, min(high, value))


def scale_to_percent(value):
    try:
        v = float(value)
    except:
        return 0

    if 0 <= v <= 1:
        v *= 100

    return round(clamp(v), 2)


def first_present(data: dict, keys, fallback=0):
    for key in keys:
        if key in data and data.get(key) is not None:
            return data.get(key)
    return fallback


def read_led_command():
    global _last_led_command_fingerprint

    if not LED_COMMAND_FILE.exists():
        return None

    try:
        stat = LED_COMMAND_FILE.stat()
        fingerprint = f"{int(stat.st_mtime_ns)}:{stat.st_size}"
    except OSError:
        return None

    if fingerprint == _last_led_command_fingerprint:
        return None

    _last_led_command_fingerprint = fingerprint

    try:
        data = json.loads(LED_COMMAND_FILE.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        return None

    if not isinstance(data, dict):
        return None

    brightness = data.get('brightness')
    try:
        brightness_value = int(round(float(brightness)))
    except (TypeError, ValueError):
        brightness_value = None

    mode = str(data.get('mode') or 'static').strip().lower()
    if mode not in ('static', 'auto'):
        mode = 'static'

    blink_speed = data.get('blinkSpeed')
    try:
        blink_speed_value = int(round(float(blink_speed)))
    except (TypeError, ValueError):
        blink_speed_value = None

    wake_alert_active = bool(data.get('wakeAlertActive', False))

    return {
        'brightness': None if brightness_value is None else max(0, min(100, brightness_value)),
        'mode': mode,
        'blinkSpeed': None if blink_speed_value is None else max(100, min(1500, blink_speed_value)),
        'wakeAlertActive': wake_alert_active,
    }


def sync_led_brightness(ser):
    global _last_led_sent, _last_led_mode_sent, _last_blink_speed_sent, _last_wake_alert_sent

    command_data = read_led_command()
    if command_data is None:
        return

    brightness = command_data.get('brightness')
    mode = str(command_data.get('mode') or 'static').upper()
    blink_speed = command_data.get('blinkSpeed')
    wake_alert_active = bool(command_data.get('wakeAlertActive'))

    if brightness is not None and brightness != _last_led_sent:
        command = f"LED:{brightness}\n"

        try:
            ser.write(command.encode('utf-8'))
            _last_led_sent = brightness
            print(f"[bridge] led brightness synced: {brightness}%")
        except SerialException as e:
            print("[bridge] led sync failed:", e)

    if mode != _last_led_mode_sent:
        try:
            ser.write(f"MODE:{mode}\n".encode('utf-8'))
            _last_led_mode_sent = mode
            print(f"[bridge] led mode synced: {mode}")
        except SerialException as e:
            print("[bridge] led mode sync failed:", e)

    if blink_speed is not None and blink_speed != _last_blink_speed_sent:
        try:
            ser.write(f"BLINK:{blink_speed}\n".encode('utf-8'))
            _last_blink_speed_sent = blink_speed
            print(f"[bridge] wake blink speed synced: {blink_speed}ms")
        except SerialException as e:
            print("[bridge] blink speed sync failed:", e)

    if wake_alert_active != _last_wake_alert_sent:
        try:
            ser.write(f"WAKE:{1 if wake_alert_active else 0}\n".encode('utf-8'))
            _last_wake_alert_sent = wake_alert_active
            print(f"[bridge] wake alert synced: {'ON' if wake_alert_active else 'OFF'}")
        except SerialException as e:
            print("[bridge] wake alert sync failed:", e)


# =====================
# PARSE SERIAL DATA
# =====================
def parse_payload(line: str):
    text = line.strip()
    if not text:
        return None

    try:
        data = json.loads(text)
    except:
        return None

    if not isinstance(data, dict):
        return None

    # -------------------------
    # RAW VALUES (IMPORTANT)
    # -------------------------
    snore_raw = float(first_present(data, ['snoreLevel', 'mic', 'micLevel'], 0))
    motion_raw = float(first_present(data, ['motion', 'movement'], 0))
    battery_raw = float(first_present(data, ['battery'], 100))
    position = data.get('position', 'UNKNOWN')
    alert_active = data.get('alertActive', False)

    # -------------------------
    # SNORE DETECTION (already computed on Arduino)
    # -------------------------
    snore_value = snore_raw  # Use value from Arduino directly

    # -------------------------
    # DISPLAY VALUES
    # -------------------------
    movement_display = scale_to_percent(motion_raw)
    battery_display = scale_to_percent(battery_raw)

    return {
        "device": DEVICE_NAME,
        "snoreLevel": round(snore_value, 2),
        "movement": movement_display,
        "battery": battery_display,
        "position": position,
        "alertActive": alert_active,
        "timestamp": now_iso()
    }


# =====================
# SAVE + SEND
# =====================
def post_payload(payload):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    # SAVE LOCAL (for dashboard)
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump({
            "device": payload.get("device", DEVICE_NAME),
            "snoreLevel": payload["snoreLevel"],
            "movement": payload["movement"],
            "battery": payload["battery"],
            "position": payload.get("position", "UNKNOWN"),
            "alertActive": payload.get("alertActive", False),
            "timestamp": payload.get("timestamp", now_iso())
        }, f, indent=2)
        f.write("\n")

    # SEND TO PHP
    try:
        requests.post(INGEST_URL, json=payload, timeout=4)
    except Exception as e:
        print("[bridge] ingest failed:", e)

    try:
        requests.post(
            MOTION_URL,
            json={
                "motion": payload["movement"],
                "position": payload.get("position", "UNKNOWN"),
                "alertActive": payload.get("alertActive", False),
                "time": payload["timestamp"]
            },
            timeout=4,
        )
    except:
        pass

    # DEBUG OUTPUT (clean)
    print(
        f"Snore: {payload['snoreLevel']} | "
        f"Movement: {payload['movement']} | "
        f"Position: {payload.get('position', 'N/A')} | "
        f"Alert: {payload.get('alertActive', False)}"
    )


# =====================
# MAIN LOOP
# =====================
def main():
    print(f"[bridge] listening on {PORT_NAME} @ {BAUD_RATE}")
    print(f"[bridge] posting to {INGEST_URL}")

    try:
        with serial.Serial(PORT_NAME, BAUD_RATE, timeout=READ_TIMEOUT) as ser:
            while True:
                sync_led_brightness(ser)

                line = ser.readline().decode("utf-8", errors="ignore")

                if not line:
                    continue

                payload = parse_payload(line)
                if payload is None:
                    continue

                post_payload(payload)

    except SerialException as e:
        print("[bridge] serial error:", e)
        return 1

    except KeyboardInterrupt:
        print("\n[bridge] stopped")
        return 0


if __name__ == "__main__":
    sys.exit(main())