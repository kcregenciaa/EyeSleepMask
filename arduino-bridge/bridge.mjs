import axios from 'axios';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const portName = process.env.ARDUINO_PORT || 'COM4';
const baudRate = Number(process.env.ARDUINO_BAUD || 115200);
const ingestUrl = process.env.INGEST_URL || 'http://localhost:8000/api/arduino-ingest.php';

const port = new SerialPort({ path: portName, baudRate });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

console.log(`[bridge] Listening on ${portName} @ ${baudRate}`);
console.log(`[bridge] Posting to ${ingestUrl}`);
console.log('[bridge] Expected line JSON: {"snoreLevel":42,"movement":18,"battery":97}');

parser.on('data', async (line) => {
  const trimmed = String(line).trim();
  if (!trimmed) {
    return;
  }

  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    console.log(`[bridge] Ignored non-JSON line: ${trimmed}`);
    return;
  }

  const payload = {
    device: data.device || 'seeed-xiao-nrf52840',
    snoreLevel: Number.isFinite(Number(data.snoreLevel)) ? Number(data.snoreLevel) : 0,
    movement: Number.isFinite(Number(data.movement)) ? Number(data.movement) : 0,
    battery: Number.isFinite(Number(data.battery)) ? Number(data.battery) : 0,
    timestamp: data.timestamp || new Date().toISOString()
  };

  try {
    const res = await axios.post(ingestUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 4000
    });
    console.log(`[bridge] sent snore=${payload.snoreLevel} movement=${payload.movement} battery=${payload.battery} status=${res.status}`);
  } catch (err) {
    console.error(`[bridge] POST failed: ${err.message}`);
  }
});

port.on('error', (err) => {
  console.error(`[bridge] serial error: ${err.message}`);
});
