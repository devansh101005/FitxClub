import { useState } from 'react';
import {
  HiQrcode,
  HiCheckCircle,
  HiXCircle,
  HiSearch,
} from 'react-icons/hi';
import { accessApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  SectionHeader,
  Button,
  Card,
  Input,
  Select,
  Badge,
} from '../../components/editorial';

const AREA_OPTIONS = [
  'Main Gym Floor', 'Aquatic Center', 'Yoga Studio',
  'Spin Studio', 'Basketball Court', 'Squash Courts', 'Steam & Sauna',
];

const MOCK_MEMBERS = {
  'MEM-10042': { name: 'Rahul Sharma', plan: 'Gold', status: 'ACTIVE', expiry: '2025-12-31' },
  'MEM-10078': { name: 'Aisha Patel', plan: 'Silver', status: 'ACTIVE', expiry: '2025-11-30' },
  'MEM-10156': { name: 'Dev Kumar', plan: 'Platinum', status: 'ACTIVE', expiry: '2026-01-31' },
  'MEM-10201': { name: 'Priya Mehta', plan: 'Gold', status: 'ACTIVE', expiry: '2025-12-15' },
};

const INITIAL_LOG = [
  { id: 1, member: 'Rahul Sharma', memberId: 'MEM-10042', time: '09:42 AM', area: 'Main Gym Floor', status: 'SUCCESS' },
  { id: 2, member: 'Aisha Patel', memberId: 'MEM-10078', time: '09:31 AM', area: 'Yoga Studio', status: 'SUCCESS' },
  { id: 3, member: 'Dev Kumar', memberId: 'MEM-10156', time: '09:18 AM', area: 'Aquatic Center', status: 'SUCCESS' },
  { id: 4, member: 'Unknown', memberId: 'MEM-99999', time: '08:59 AM', area: 'Main Gym Floor', status: 'FAILED' },
  { id: 5, member: 'Priya Mehta', memberId: 'MEM-10201', time: '08:55 AM', area: 'Main Gym Floor', status: 'SUCCESS' },
  { id: 6, member: 'Arjun Lal', memberId: 'MEM-10063', time: '08:47 AM', area: 'Basketball Court', status: 'SUCCESS' },
];

function getInitials(name) {
  return String(name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase();
}

export default function QRScanner() {
  const [scanMode, setScanMode] = useState('camera');
  const [manualId, setManualId] = useState('');
  const [selectedArea, setSelectedArea] = useState('Main Gym Floor');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [log, setLog] = useState(INITIAL_LOG);

  const processEntry = async (memberId) => {
    setScanning(true);
    setScanResult(null);

    try {
      await accessApi.scan({ memberId, area: selectedArea });
    } catch {
      // mock
    }

    await new Promise((r) => setTimeout(r, 1200));
    setScanning(false);

    const member = MOCK_MEMBERS[memberId];
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (!member) {
      setScanResult({ status: 'FAILED', message: 'Member ID not found', memberId });
      setLog((prev) => [{ id: Date.now(), member: 'Unknown', memberId, time: now, area: selectedArea, status: 'FAILED' }, ...prev]);
      toast.error('Member not found');
      return;
    }

    const expired = new Date(member.expiry) < new Date();
    if (expired) {
      setScanResult({ status: 'EXPIRED', message: 'Membership expired', ...member, memberId });
      toast.error('Membership expired!');
      return;
    }

    setScanResult({ status: 'SUCCESS', ...member, memberId });
    setLog((prev) => [{ id: Date.now(), member: member.name, memberId, time: now, area: selectedArea, status: 'SUCCESS' }, ...prev.slice(0, 19)]);
    toast.success(`Access granted: ${member.name}`);
    setManualId('');
  };

  const simulateScan = () => {
    const ids = Object.keys(MOCK_MEMBERS);
    processEntry(ids[Math.floor(Math.random() * ids.length)]);
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Access Control</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        QR Scanner
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Scan member QR codes to grant facility access.
      </p>

      {/* ═══════════════════════ MAIN GRID ═══════════════════════ */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-14 lg:gap-20">
        {/* ── LEFT: Scanner ── */}
        <div className="space-y-8">
          {/* Area selection */}
          <Select
            label="Access Area"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {AREA_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>

          {/* Mode tabs */}
          <div className="border-b border-ink/10">
            <div className="flex gap-8">
              {['camera', 'manual'].map((m) => {
                const active = scanMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setScanMode(m); setScanResult(null); }}
                    className={`relative pb-4 transition-colors ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}
                  >
                    <span className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase">
                      {m === 'camera' ? 'Camera Scan' : 'Manual Entry'}
                    </span>
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${active ? 'w-full' : 'w-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera view */}
          {scanMode === 'camera' && (
            <Card hover={false} className="overflow-hidden p-0">
              <div className="relative bg-coal aspect-video flex items-center justify-center">
                <div className="w-48 h-48 relative">
                  {/* Corner marks */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold" />
                  {scanning && (
                    <div className="absolute inset-x-0 h-0.5 bg-gold animate-bounce" style={{ top: '50%' }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HiQrcode className="w-16 h-16 text-white/10" />
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-coal to-transparent p-6 text-center">
                  <p className="text-[12px] text-white/40 mb-4">
                    {scanning ? 'Scanning…' : "Point camera at member's QR code"}
                  </p>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={simulateScan}
                    disabled={scanning}
                    icon={HiQrcode}
                    iconPosition="left"
                  >
                    {scanning ? 'Processing…' : 'Simulate Scan'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Manual entry */}
          {scanMode === 'manual' && (
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  label="Member ID"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && manualId.trim() && processEntry(manualId.trim())}
                  placeholder="e.g. MEM-10042"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => manualId.trim() && processEntry(manualId.trim())}
                disabled={scanning || !manualId.trim()}
                icon={HiSearch}
                iconPosition="left"
              >
                Check
              </Button>
            </div>
          )}

          {/* Scan result */}
          {scanResult && (
            <Card
              hover={false}
              className={`p-6 border-l-2 ${
                scanResult.status === 'SUCCESS' ? 'border-sage' : 'border-red-500'
              }`}
            >
              <div className="flex items-center gap-4">
                {scanResult.status === 'SUCCESS' ? (
                  <HiCheckCircle className="w-10 h-10 text-sage shrink-0" />
                ) : (
                  <HiXCircle className="w-10 h-10 text-red-500 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-heading text-[1.25rem] font-bold text-ink">
                    {scanResult.status === 'SUCCESS'
                      ? 'Access Granted'
                      : scanResult.status === 'EXPIRED'
                        ? 'Membership Expired'
                        : 'Access Denied'}
                  </h3>
                  {scanResult.status === 'SUCCESS' ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-[13px]">
                      <span className="text-ink-3">Member: <span className="text-ink font-semibold">{scanResult.name}</span></span>
                      <span className="text-ink-3">Plan: <span className="text-gold font-semibold">{scanResult.plan}</span></span>
                      <span className="text-ink-3">ID: <span className="font-mono text-gold">{scanResult.memberId}</span></span>
                      <span className="text-ink-3">Area: <span className="text-ink">{selectedArea}</span></span>
                    </div>
                  ) : (
                    <p className="text-[13px] text-ink-3 mt-1">
                      {scanResult.message} · ID: {scanResult.memberId}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ── RIGHT: Scan Log ── */}
        <aside>
          <SectionHeader
            eyebrow="Live"
            title="Scan Log"
            className="mb-10"
          />

          <div className="space-y-px bg-ink/10 border border-ink/10 max-h-150 overflow-y-auto">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="bg-white px-5 py-4 flex items-center gap-3"
              >
                {entry.status === 'SUCCESS' ? (
                  <HiCheckCircle className="w-5 h-5 text-sage shrink-0" />
                ) : (
                  <HiXCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{entry.member}</p>
                  <p className="text-[11px] text-ink-3">{entry.time} · {entry.area}</p>
                </div>
                <span className="text-[11px] font-mono text-ink-3 shrink-0">{entry.memberId}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
