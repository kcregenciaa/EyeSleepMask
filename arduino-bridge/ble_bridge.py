import asyncio
import json
import os
from datetime import datetime, timezone

import requests
from bleak import BleakClient, BleakScanner

INGEST_URL = os.environ.get('INGEST_URL', 'http://localhost:8000/api/arduino-ingest.php')
MOTION_URL = os.environ.get('MOTION_URL', 'http://localhost:8000/api/motion-data.php')
BLE_DEVICE_NAME = os.environ.get('BLE_DEVICE_NAME', 'XIAO')
BLE_ADDRESS = os.environ.get('BLE_ADDRESS', '')
BLE_NOTIFY_UUID = os.environ.get('BLE_NOTIFY_UUID', '6E400003-B5A3-F393-E0A9-E50E24DCCA9E')
DEVICE_NAME = os.environ.get('ARDUINO_DEVICE', 'seeed-xiao-nrf52840-ble')


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clamp(value, low=0, high=100):
    return max(low, min(high, value))


def coerce_percent(value, fallback=0):
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return fallback

    if numeric <= 1.5:
        numeric = numeric * 100

    return clamp(int(round(numeric)))


def parse_line(text: str):
    clean = text.strip()
    if not clean:
        return None

    try:
        payload = json.loads(clean)
    except json.JSONDecodeError:
        try:
            scalar = float(clean)
        except ValueError:
            print(f'[ble-bridge] ignored line: {clean}')
            return None

        value = coerce_percent(scalar)
        return {
            'device': DEVICE_NAME,
            'snoreLevel': value,
            'movement': value,
            'battery': 0,
            'timestamp': now_iso(),
        }

    if isinstance(payload, dict):
        return {
            'device': str(payload.get('device') or DEVICE_NAME),
            'snoreLevel': coerce_percent(payload.get('snoreLevel')),
            'movement': coerce_percent(payload.get('movement')),
            'battery': coerce_percent(payload.get('battery')),
            'timestamp': str(payload.get('timestamp') or now_iso()),
        }

    if isinstance(payload, (int, float, str)):
        value = coerce_percent(payload)
        return {
            'device': DEVICE_NAME,
            'snoreLevel': value,
            'movement': value,
            'battery': 0,
            'timestamp': now_iso(),
        }

    return None


def post_payload(payload: dict):
    requests.post(INGEST_URL, json=payload, timeout=4).raise_for_status()
    requests.post(MOTION_URL, json={'motion': payload['movement'], 'time': payload['timestamp']}, timeout=4)
    print(
        '[ble-bridge] sent '
        f"movement={payload['movement']} "
        f"snore={payload['snoreLevel']} "
        f"battery={payload['battery']}"
    )


async def resolve_device_address() -> str:
    if BLE_ADDRESS:
        return BLE_ADDRESS

    print(f'[ble-bridge] scanning for device name containing: {BLE_DEVICE_NAME}')
    devices = await BleakScanner.discover(timeout=8.0)
    for device in devices:
        if device.name and BLE_DEVICE_NAME.lower() in device.name.lower():
            print(f'[ble-bridge] found {device.name} at {device.address}')
            return device.address

    raise RuntimeError('BLE device not found. Set BLE_ADDRESS explicitly.')


async def run():
    address = await resolve_device_address()
    print(f'[ble-bridge] connecting to {address}')
    print(f'[ble-bridge] notify characteristic: {BLE_NOTIFY_UUID}')
    print(f'[ble-bridge] posting to {INGEST_URL}')

    buffer = ''

    def on_notify(_, data: bytearray):
        nonlocal buffer
        chunk = bytes(data).decode('utf-8', errors='ignore')
        buffer += chunk

        while '\n' in buffer:
            line, buffer = buffer.split('\n', 1)
            payload = parse_line(line)
            if payload is None:
                continue
            try:
                post_payload(payload)
            except requests.RequestException as exc:
                print(f'[ble-bridge] POST failed: {exc}')

    async with BleakClient(address) as client:
        await client.start_notify(BLE_NOTIFY_UUID, on_notify)
        print('[ble-bridge] connected and listening (Ctrl+C to stop)')
        while True:
            await asyncio.sleep(1)


if __name__ == '__main__':
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        print('\n[ble-bridge] stopped')
