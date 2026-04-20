import { useEffect, useState } from 'react';
import { HiCheck, HiClock, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { facilityApi, reservationApi } from '../../services/api';
import {
  Eyebrow,
  Button,
  Card,
  Input,
  Spinner,
} from '../../components/editorial';

/* No fallback — always use real API data */

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

/* ── Step indicator ── */
function Step({ n, label, active }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span
        className={`w-8 h-8 flex items-center justify-center text-[0.7rem] font-bold border transition-colors ${
          active ? 'bg-ink text-white border-ink' : 'bg-transparent text-ink-3 border-ink/15'
        }`}
      >
        {n}
      </span>
      <span className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3">
        {label}
      </span>
    </div>
  );
}
function getLocalDateStr() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BookCourt() {
  const today = getLocalDateStr();
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [date, setDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ── Fetch facilities from backend ── */
  useEffect(() => {
    let alive = true;
    facilityApi
      .getAll()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length > 0) {
          // Filter to court-type facilities only and normalize
          const courts = data
            .filter((f) => {
              const t = (f.facilityType || f.type || '').toUpperCase();
              return t.includes('COURT') || t.includes('BADMINTON') || t.includes('SQUASH') || t.includes('BASKETBALL') || t.includes('TENNIS');
            })
            .map((f) => ({
              id: f.id,
              name: f.name,
              type: f.facilityType || f.type || 'Court',
              desc: `Capacity: ${f.maxCapacity || 0} | ${f.open !== false ? 'Open' : 'Closed'}`,
              hourlyRate: f.hourlyRate || 200,
              maxCapacity: f.maxCapacity,
              open: f.open !== false,
            }));
          setFacilities(courts.length > 0 ? courts : []);
        } else {
          setFacilities([]);
        }
      })
      .catch(() => alive && setFacilities([]))
      .finally(() => alive && setLoadingFacilities(false));
    return () => { alive = false; };
  }, []);

  const facility = facilities.find((f) => f.id === selectedFacility);

  const handleBook = async () => {
    if (!selectedFacility || !selectedSlot) return;
    setLoading(true);
    try {
      const [startH, startM] = selectedSlot.split(':').map(Number);
      const endH = startH + 1;
      await reservationApi.bookCourt({
        facilityId: selectedFacility,
        date: date,
        startTime: selectedSlot + ':00',
        endTime: `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00`,
      });
      toast.success(`Court booked: ${facility.name} on ${date} at ${selectedSlot}`);
    } catch (err) {
      console.error('Failed to book court', err);
      toast.error('Failed to book court.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setSelectedSlot(null);
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Courts</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Book a Court
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Pick a facility, choose your date and time, and confirm. One hour per slot.
      </p>

      {/* ═══════════════════════ STEP 1: FACILITY ═══════════════════════ */}
      <Step n="1" label="Select Facility" active />

      {loadingFacilities ? (
        <div className="mb-16"><Spinner text="Loading facilities" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {facilities.map((f) => {
            const active = selectedFacility === f.id;
            return (
              <Card
                key={f.id}
                hover
                onClick={() => {
                  setSelectedFacility(f.id);
                  setSelectedSlot(null);
                }}
                className={`p-7 cursor-pointer ${active ? 'ring-2 ring-gold' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-[1.25rem] font-bold tracking-[-0.01em] text-ink leading-tight">
                      {f.name}
                    </h3>
                    <p className="text-[13px] text-ink-3 mt-1">{f.desc}</p>
                  </div>
                  {active && (
                    <span className="w-6 h-6 bg-gold text-white flex items-center justify-center shrink-0">
                      <HiCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="font-heading text-[1.35rem] font-bold text-gold">
                  ₹{f.hourlyRate}
                  <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-ink-3 ml-2">
                    /hour
                  </span>
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {selectedFacility && (
        <>
          {/* ═══════════════════════ STEP 2: DATE ═══════════════════════ */}
          <Step n="2" label="Select Date" active />
          <div className="mb-16 max-w-xs">
            <Input
              label="Date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedSlot(null);
              }}
            />
          </div>

          {/* ═══════════════════════ STEP 3: TIME ═══════════════════════ */}
          <Step n="3" label="Select Time Slot" active />
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 mb-6">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(isSelected ? null : slot)}
                  className={`py-3 text-[0.8rem] font-semibold tracking-[0.08em] border transition-all duration-300 ${
                    isSelected
                      ? 'bg-ink text-white border-ink'
                      : 'bg-transparent text-ink-2 border-ink/15 hover:border-ink hover:text-ink'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          <div className="flex gap-6 text-[0.65rem] font-semibold tracking-widest uppercase text-ink-3 mb-16">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-ink inline-block" /> Selected
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border border-ink/15 inline-block" /> Available
            </span>
          </div>

          {/* ═══════════════════════ SUMMARY ═══════════════════════ */}
          {selectedSlot && (
            <Card hover={false} className="p-10 border-t-2 border-gold">
              <Eyebrow tone="gold" className="mb-4">Booking Summary</Eyebrow>
              <h3 className="font-heading text-[1.5rem] font-bold tracking-[-0.01em] text-ink mb-8">
                Confirm your reservation.
              </h3>

              <div className="grid sm:grid-cols-3 gap-8 mb-10">
                <div>
                  <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-2">
                    Facility
                  </p>
                  <p className="text-[15px] font-medium text-ink">{facility?.name}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-2">
                    Date
                  </p>
                  <p className="text-[15px] font-medium text-ink">{date}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-2">
                    Time
                  </p>
                  <p className="text-[15px] font-medium text-ink flex items-center gap-2">
                    <HiClock className="w-4 h-4 text-gold" />
                    {selectedSlot} (1 hr)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ink/10 pt-8">
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">
                    Total
                  </p>
                  <p className="font-heading text-[1.75rem] font-bold text-ink leading-none mt-1">
                    ₹{facility?.hourlyRate?.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleBook}
                  disabled={loading}
                  icon={HiArrowRight}
                >
                  {loading ? 'Booking…' : 'Confirm Booking'}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
