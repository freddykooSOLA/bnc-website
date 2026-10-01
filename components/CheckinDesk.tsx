'use client';

import { useEffect, useRef, useState } from 'react';
import { SECTION_COPY } from '@/lib/section-copy';

interface Registration {
  ref: string;
  eventTitle: string;
  name: string;
  phone: string;
  team: string;
  createdAt: string;
  checkedInAt: string | null;
}

function extractCode(raw: string) {
  const text = raw.trim();
  try {
    const url = new URL(text);
    const code = url.searchParams.get('code');
    if (code) return code.toUpperCase();
  } catch {
    // 鏡頭有時只讀到編號本身。
  }
  const match = text.toUpperCase().match(/BNC-E-[A-Z2-9]{8}/);
  return match ? match[0] : text.toUpperCase();
}

export default function CheckinDesk({ initialCode }: { initialCode: string }) {
  const copy = SECTION_COPY['zh-hk'];
  const [query, setQuery] = useState(initialCode);
  const [rows, setRows] = useState<Registration[]>([]);
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  async function load(nextQuery = query) {
    setMessage('');
    const response = await fetch(`/api/admin/registrations?q=${encodeURIComponent(nextQuery)}`);
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || copy.noRegistrations);
      setRows([]);
      return;
    }
    setRows(data.registrations || []);
    if ((data.registrations || []).length === 0) setMessage(copy.noRegistrations);
  }

  useEffect(() => {
    load(initialCode);
    return () => stopRef.current?.();
    // 只在打開頁面時載入一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function mark(ref: string) {
    const response = await fetch('/api/admin/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || copy.noRegistrations);
      return;
    }
    setQuery(ref);
    await load(ref);
  }

  async function startScan() {
    setMessage('');
    const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setMessage(copy.scanUnsupported);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    await video.play();
    setScanning(true);
    const detector = new Detector({ formats: ['qr_code'] });
    let stopped = false;
    stopRef.current = () => {
      stopped = true;
      stream.getTracks().forEach((track) => track.stop());
      setScanning(false);
    };
    const tick = async () => {
      if (stopped) return;
      try {
        const found = await detector.detect(video);
        const raw = found[0]?.rawValue;
        if (raw) {
          const code = extractCode(raw);
          stopRef.current?.();
          setQuery(code);
          await load(code);
          return;
        }
      } catch {
        // 單幀失敗就再試。
      }
      requestAnimationFrame(() => {
        void tick();
      });
    };
    void tick();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="font-heading text-2xl font-bold text-primary">{copy.checkinTitle}</h1>
      <p className="text-sm text-gray-600">{copy.checkinHint}</p>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="input-field" placeholder="BNC-E-…" />
        <button type="submit" className="btn-secondary">{copy.lookup}</button>
      </form>
      <button type="button" className="btn-primary" onClick={() => void startScan()}>
        {copy.scan}
      </button>
      <video ref={videoRef} className={`w-full max-w-sm rounded-xl bg-black ${scanning ? '' : 'hidden'}`} muted playsInline />
      {message && <p className="text-sm text-amber-800">{message}</p>}
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.ref} className="card">
            <p className="font-mono text-sm text-orange">{row.ref}</p>
            <p className="font-semibold text-primary">{row.name} · {row.team}</p>
            <p className="text-sm text-gray-600">{row.eventTitle}</p>
            <p className="text-sm text-gray-500">{row.phone}</p>
            <p className="text-sm mt-2">{row.checkedInAt ? `${copy.checkedIn} ${row.checkedInAt}` : copy.notChecked}</p>
            {!row.checkedInAt && (
              <button type="button" className="btn-primary mt-3" onClick={() => void mark(row.ref)}>
                {copy.markIn}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
