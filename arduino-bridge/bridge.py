"""
PowerShell quick start (copy/paste):

cd C:\\xampp\\htdocs\\EyeSleepMask\\EyeSleepMask\\arduino-bridge
$env:ARDUINO_PORT="COM9"
$env:ARDUINO_BAUD="115200"
$env:INGEST_URL="http://localhost:8000/api/arduino-ingest.php"
$env:MOTION_URL="http://localhost:8000/api/motion-data.php"
python .\\bridge.py
"""

Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'bridge.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

import json
import os
import sys
import time
from datetime import datetime, timezone

import requests
import serial
from serial import SerialException

PORT_NAME = os.environ.get('ARDUINO_PORT', 'COM4')
BAUD_RATE = int(os.environ.get('ARDUINO_BAUD', '115200'))
INGEST_URL = os.environ.get('INGEST_URL', 'http://localhost:8000/api/arduino-ingest.php')
MOTION_URL = os.environ.get('MOTION_URL', 'http://localhost:8000/api/motion-data.php')
DEVICE_NAME = os.environ.get('ARDUINO_DEVICE', 'seeed-xiao-nrf52840')
READ_TIMEOUT = float(os.environ.get('ARDUINO_TIMEOUT', '1'))


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def coerce_int(value, fallback=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return fallback


def clamp(value, low=0, high=100):
    return max(low, min(high, value))


def coerce_percent(value, fallback=0):
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return fallback

    # Scale only normalized fractions (0.0..1.0) into percentage.
    if 0 <= numeric and numeric <= 1.0:
        numeric = numeric * 100

    return clamp(int(round(numeric)))


def parse_payload(line: str):
    text = line.strip()
    if not text:
        return None

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        print(f'[bridge] ignored non-JSON line: {text}')
        return None

    if isinstance(data, dict):
        return {
            'device': str(data.get('device') or DEVICE_NAME),
            'snoreLevel': coerce_percent(data.get('snoreLevel')),
            'movement': coerce_percent(data.get('movement')),
            'battery': coerce_percent(data.get('battery')),
            'timestamp': str(data.get('timestamp') or now_iso()),
        }

    if isinstance(data, (int, float, str)):
        value = coerce_percent(data)
        return {
            'device': DEVICE_NAME,
            'snoreLevel': value,
            'movement': value,
            'battery': 0,
            'timestamp': now_iso(),
        }

    print(f'[bridge] ignored unsupported payload: {text}')
    return None


def post_payload(payload: dict) -> None:
    response = requests.post(INGEST_URL, json=payload, timeout=4)
    response.raise_for_status()

    requests.post(
        MOTION_URL,
        json={'motion': payload['movement'], 'time': payload['timestamp']},
        timeout=4,
    )

    print(
        '[bridge] sent '
        f"device={payload['device']} "
        f"snore={payload['snoreLevel']} "
        f"movement={payload['movement']} "
        f"battery={payload['battery']}"
    )


def open_serial_port():
    return serial.Serial(PORT_NAME, BAUD_RATE, timeout=READ_TIMEOUT)


def main() -> int:
    print(f'[bridge] listening on {PORT_NAME} @ {BAUD_RATE}')
    print(f'[bridge] posting to {INGEST_URL}')
    print(f'[bridge] movement history to {MOTION_URL}')
    print('[bridge] expected line JSON: {"snoreLevel":42,"movement":18,"battery":97}')

    try:
        with open_serial_port() as ser:
            while True:
                try:
                    raw = ser.readline()
                except SerialException as exc:
                    print(f'[bridge] serial read error: {exc}')
                    time.sleep(1)
                    continue

                if not raw:
                    continue

                try:
                    line = raw.decode('utf-8', errors='ignore')
                except Exception as exc:
                    print(f'[bridge] decode error: {exc}')
                    continue

                payload = parse_payload(line)
                if payload is None:
                    continue

                try:
                    post_payload(payload)
                except requests.RequestException as exc:
                    print(f'[bridge] POST failed: {exc}')

    except SerialException as exc:
        print(f'[bridge] serial port error: {exc}')
        return 1
    except KeyboardInterrupt:
        print('\n[bridge] stopped')
        return 0

    return 0


if __name__ == '__main__':
    sys.exit(main())
