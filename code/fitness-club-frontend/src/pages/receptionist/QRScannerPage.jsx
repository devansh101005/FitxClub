import { useEffect, useState } from 'react';
import { HiCheckCircle, HiQrcode, HiSearch, HiXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { accessApi, facilityApi } from '../../services/api';
import { Badge, Button, Card, Eyebrow, Input, SectionHeader, Select } from '../../components/editorial';

const DEMO_MEMBER_IDS = ['FC-1001', 'FC-1002', 'FC-1003', 'FC-1004', 'FC-1005'];

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isGranted(status) {
  return status === 'GRANTED';
}

export default function QRScannerPage() {
  const [scanMode, setScanMode] = useState('manual');
  const [manualId, setManualId] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [log, setLog] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await facilityApi.getAll();
        const list = res?.data ?? res ?? [];
        setFacilities(list);
        if (list.length && !selectedFacilityId) setSelectedFacilityId(list[0].id);
      } catch {
        toast.error('Could not load facilities.');
      }
    })();
  }, []);

  const facilityName = (id) => facilities.find((f) => f.id === id)?.name ?? 'Unknown';

  const pushLog = (entry) => {
    setLog((prev) => [entry, ...prev].slice(0, 20));
  };

  const processEntry = async (memberId) => {
    if (!selectedFacilityId) {
      toast.error('Select an access area first.');
      return;
    }
    setScanning(true);
    setScanResult(null);

    try {
      const res = await accessApi.scan({
        memberId,
        facilityId: selectedFacilityId,
        direction: 'ENTRY',
      });
      const raw = res?.data ?? res ?? {};
      const granted = isGranted(raw.status);
      const result = {
        memberId,
        status: raw.status ?? 'DENIED',
        message: raw.message ?? (granted ? 'Access granted.' : 'Access denied.'),
        facilityName: raw.facilityName ?? facilityName(selectedFacilityId),
        currentOccupancy: raw.currentOccupancy,
      };
      setScanResult(result);
      pushLog({
        id: Date.now(),
        memberId,
        area: result.facilityName,
        time: formatTime(),
        status: granted ? 'SUCCESS' : 'FAILED',
        statusRaw: result.status,
      });
      if (granted) {
        toast.success(`Access granted — ${result.facilityName}`);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Scan failed';
      setScanResult({ memberId, status: 'ERROR', message });
      pushLog({
        id: Date.now(),
        memberId,
        area: facilityName(selectedFacilityId),
        time: formatTime(),
        status: 'FAILED',
        statusRaw: 'ERROR',
      });
      toast.error(message);
    } finally {
      setScanning(false);
      setManualId('');
    }
  };

  const simulateScan = () => {
    const pick = DEMO_MEMBER_IDS[Math.floor(Math.random() * DEMO_MEMBER_IDS.length)];
    processEntry(pick);
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Reception Desk</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Access Scanner.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Verify entry at the door, switch between camera and manual checks, and keep the scan log readable for the next shift.
      </p>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-14 lg:gap-20">
        <section className="space-y-10">
          <Card hover={false} className="p-8">
            <Select
              label="Access Area"
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.currentOccupancy}/{f.maxCapacity})
                </option>
              ))}
            </Select>
          </Card>

          <div className="border-b border-ink/10 mb-12">
            <div className="flex gap-8">
              {[
                ['manual', 'Manual Entry'],
                ['camera', 'Camera Scan'],
              ].map(([value, label]) => {
                const active = scanMode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setScanMode(value);
                      setScanResult(null);
                    }}
                    className={`relative pb-4 transition-colors ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}
                  >
                    <span className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase">{label}</span>
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${active ? 'w-full' : 'w-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {scanMode === 'camera' ? (
            <Card variant="dark" hover={false} className="p-8">
              <div className="border border-white/10 min-h-[24rem] flex items-center justify-center relative">
                <div className="w-64 h-64 relative">
                  {[
                    'top-0 left-0 border-t border-l',
                    'top-0 right-0 border-t border-r',
                    'bottom-0 left-0 border-b border-l',
                    'bottom-0 right-0 border-b border-r',
                  ].map((cls) => (
                    <span key={cls} className={`absolute w-10 h-10 border-gold ${cls}`} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HiQrcode className="w-24 h-24 text-white/10" />
                  </div>
                  {scanning && (
                    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gold animate-pulse" />
                  )}
                </div>
              </div>
              <p className="text-[13px] text-white/45 mt-6 mb-6">
                {scanning ? 'Processing current scan...' : 'Position the member QR code inside the frame.'}
              </p>
              <Button variant="primaryLight" onClick={simulateScan} disabled={scanning} icon={HiQrcode}>
                {scanning ? 'Processing...' : 'Simulate Scan'}
              </Button>
            </Card>
          ) : (
            <Card hover={false} className="p-8">
              <Input
                label="Member ID"
                value={manualId}
                onChange={(e) => setManualId(e.target.value.toUpperCase())}
                placeholder="FC-1001"
              />
              <p className="text-[13px] text-ink-3 mt-3 mb-6">
                Try {DEMO_MEMBER_IDS.join(', ')}.
              </p>
              <Button
                variant="primary"
                onClick={() => manualId.trim() && processEntry(manualId.trim())}
                disabled={scanning || !manualId.trim()}
                icon={HiSearch}
              >
                {scanning ? 'Processing...' : 'Check Entry'}
              </Button>
            </Card>
          )}

          {scanResult && (
            <Card
              hover={false}
              className={`p-8 border-l-2 ${isGranted(scanResult.status) ? 'border-sage' : 'border-red-500'}`}
            >
              <div className="flex items-start gap-4">
                {isGranted(scanResult.status) ? (
                  <HiCheckCircle className="w-8 h-8 text-sage shrink-0" />
                ) : (
                  <HiXCircle className="w-8 h-8 text-red-500 shrink-0" />
                )}
                <div className="grow">
                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    <h3 className="font-heading text-[1.5rem] font-bold text-ink tracking-[-0.01em]">
                      {isGranted(scanResult.status) ? 'Access Granted' : 'Access Denied'}
                    </h3>
                    <Badge status={isGranted(scanResult.status) ? 'ACTIVE' : 'FAILED'} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-[14px] text-ink-2">
                    <p>Member ID: <span className="text-ink">{scanResult.memberId}</span></p>
                    <p>Area: <span className="text-ink">{scanResult.facilityName}</span></p>
                    {typeof scanResult.currentOccupancy === 'number' && (
                      <p>Occupancy: <span className="text-ink">{scanResult.currentOccupancy}</span></p>
                    )}
                    <p>Status: <span className="text-ink">{scanResult.status}</span></p>
                  </div>
                  {scanResult.message ? (
                    <p className="text-[13px] text-ink-3 mt-4">{scanResult.message}</p>
                  ) : null}
                </div>
              </div>
            </Card>
          )}
        </section>

        <section>
          <SectionHeader
            eyebrow="Door Activity"
            title="Scan Log"
            className="mb-8"
          />
          {log.length === 0 ? (
            <p className="text-[13px] text-ink-3">No scans yet. Try a member ID above.</p>
          ) : (
            <div className="space-y-px bg-ink/10 border border-ink/10">
              {log.map((entry) => (
                <article key={entry.id} className="bg-white flex flex-col sm:flex-row sm:items-center gap-5 px-7 py-6">
                  <div className="w-11 h-11 border border-ink/10 flex items-center justify-center shrink-0">
                    <HiQrcode className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">
                        {entry.memberId}
                      </h3>
                      <Badge status={entry.status} />
                    </div>
                    <p className="text-[13px] text-ink-3 flex items-center gap-3 flex-wrap">
                      <span>{entry.time}</span>
                      <span>{entry.area}</span>
                      <span>{entry.statusRaw}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
