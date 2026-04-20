import { useEffect, useState } from 'react';
import { HiStar, HiCheck, HiClock, HiArrowRight, HiCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { trainerApi, ptApi } from '../../services/api';
import {
  Eyebrow,
  Button,
  Card,
  Input,
  Badge,
} from '../../components/editorial';

/* No fallback — always use real API data */

/* ── Step indicator ── */
function Step({ n, label }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="w-8 h-8 flex items-center justify-center text-[0.7rem] font-bold bg-ink text-white">
        {n}
      </span>
      <span className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3">
        {label}
      </span>
    </div>
  );
}

export default function BookPT() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [goal, setGoal] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    let alive = true;
    trainerApi
      .getAll()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setTrainers(
            data.map((t) => {
              // Convert availability slots to display-friendly strings
              const slots = (t.availability || []).map((a) => {
                const day = (a.dayOfWeek || '').slice(0, 3);
                const dayCapital = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
                const time = a.startTime ? String(a.startTime).slice(0, 5) : '';
                return `${dayCapital} ${time}`;
              });
              return {
                id: t.id,
                name: t.name || 'Trainer',
                specialty: t.specialization || t.specialty || '',
                rating: t.rating || 4.8,
                sessions: t.sessions || 0,
                available: slots.length > 0,
                slots,
                hourlyRate: Number(t.hourlyRate || 2000),
              };
            }),
          );
        } else {
          setTrainers([]);
        }
      })
      .catch(() => alive && setTrainers([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const trainer = trainers.find((t) => t.id === selectedTrainer);

  const handleBook = async () => {
    if (!trainer || !selectedSlot) return;
    setBooking(true);
    try {
      // Parse slot string like "Mon 10:00" into date and time for BookPTSessionRequest
      const parts = selectedSlot.split(' ');
      const timeStr = parts[1] || '10:00';
      const [h, m] = timeStr.split(':').map(Number);
      const endH = h + 1;

      // Find the next occurrence of this day
      const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const targetDay = dayMap[parts[0]] ?? 1;
      const today = new Date();
      const daysAhead = ((targetDay - today.getDay()) + 7) % 7 || 7;
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + daysAhead);

      // Use local timezone to prevent UTC-shifting the date back one day
      const y = sessionDate.getFullYear();
      const monthStr = String(sessionDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(sessionDate.getDate()).padStart(2, '0');
      const sessionDateStr = `${y}-${monthStr}-${dayStr}`;

      await ptApi.book({
        trainerId: trainer.id,
        sessionDate: sessionDateStr,
        startTime: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
        endTime: `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
        notes: goal || null,
      });
      toast.success(`PT session booked with ${trainer.name}`);
    } catch (err) {
      console.error('Failed to book PT', err);
      toast.error('Failed to book PT session.');
      setBooking(false);
      return;
    }
    setBooking(false);
    setSelectedTrainer(null);
    setSelectedSlot(null);
    setGoal('');
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Personal Training</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Book a PT Session
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Choose a certified personal trainer, pick a time slot, and define your session goal.
      </p>

      {/* ═══════════════════════ STEP 1: TRAINER ═══════════════════════ */}
      <Step n="1" label="Choose a Trainer" />

      {loading ? (
        <div className="mb-16">
          <p className="text-ink-3 text-[13px]">Loading trainers…</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {trainers.map((t) => {
            const initials = (t.name || 'FC')
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            const isAvail = t.available !== false;
            const active = selectedTrainer === t.id;

            return (
              <Card
                key={t.id}
                hover={isAvail}
                onClick={
                  isAvail
                    ? () => {
                        setSelectedTrainer(t.id);
                        setSelectedSlot(null);
                      }
                    : undefined
                }
                className={`p-7 text-center ${!isAvail ? 'opacity-50' : 'cursor-pointer'} ${
                  active ? 'ring-2 ring-gold' : ''
                }`}
              >
                <div className="w-16 h-16 bg-coal text-gold font-heading text-[1.25rem] font-bold flex items-center justify-center mx-auto mb-4">
                  {initials}
                </div>
                <h3 className="font-heading text-[1.15rem] font-bold tracking-[-0.01em] text-ink">
                  {t.name}
                </h3>
                <p className="text-[12px] text-ink-3 mt-1 mb-3">
                  {t.specialty || t.specialization}
                </p>

                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <HiStar className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[13px] font-semibold text-ink">{t.rating}</span>
                  <span className="text-[12px] text-ink-3 ml-1">{t.sessions} sessions</span>
                </div>

                {isAvail ? (
                  <Badge status="ACTIVE">Available</Badge>
                ) : (
                  <Badge status="CANCELLED">Fully Booked</Badge>
                )}

                {active && (
                  <div className="mt-4 flex justify-center">
                    <span className="w-6 h-6 bg-gold text-white flex items-center justify-center">
                      <HiCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════ STEP 2: SLOT ═══════════════════════ */}
      {trainer?.available !== false && trainer?.slots?.length > 0 && (
        <>
          <Step n="2" label="Choose a Time Slot" />
          <div className="flex flex-wrap gap-3 mb-16">
            {(trainer.slots || []).map((slot) => {
              const active = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(active ? null : slot)}
                  className={`flex items-center gap-2 px-5 py-3 text-[0.8rem] font-semibold tracking-[0.08em] border transition-all duration-300 ${
                    active
                      ? 'bg-ink text-white border-ink'
                      : 'bg-transparent text-ink-2 border-ink/15 hover:border-ink hover:text-ink'
                  }`}
                >
                  <HiCalendar className="w-4 h-4" />
                  {slot}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════════════════════ STEP 3: GOAL ═══════════════════════ */}
      {selectedSlot && (
        <>
          <Step n="3" label="Session Goal (optional)" />
          <div className="max-w-lg mb-16">
            <Input
              label="What would you like to focus on?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Build upper body strength, improve flexibility…"
            />
          </div>

          {/* ═══════════════════════ SUMMARY ═══════════════════════ */}
          <Card hover={false} className="p-10 border-t-2 border-gold">
            <Eyebrow tone="gold" className="mb-4">Session Summary</Eyebrow>
            <h3 className="font-heading text-[1.5rem] font-bold tracking-[-0.01em] text-ink mb-8">
              Confirm your session.
            </h3>

            <div className="grid sm:grid-cols-3 gap-8 mb-10">
              <div>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-2">
                  Trainer
                </p>
                <p className="text-[15px] font-medium text-ink">{trainer?.name}</p>
              </div>
              <div>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-2">
                  Time Slot
                </p>
                <p className="text-[15px] font-medium text-ink flex items-center gap-2">
                  <HiClock className="w-4 h-4 text-gold" />
                  {selectedSlot}
                </p>
              </div>
              <div>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-2">
                  Duration
                </p>
                <p className="text-[15px] font-medium text-ink">60 minutes</p>
              </div>
            </div>

            {goal && (
              <div className="mb-10 pb-8 border-b border-ink/10">
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-2">
                  Focus
                </p>
                <p className="text-[15px] text-ink">{goal}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              {trainer?.hourlyRate && (
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">
                    Session Fee
                  </p>
                  <p className="font-heading text-[1.75rem] font-bold text-ink leading-none mt-1">
                    ₹{trainer.hourlyRate.toLocaleString()}
                  </p>
                </div>
              )}
              <Button
                variant="primary"
                onClick={handleBook}
                disabled={booking}
                icon={HiArrowRight}
              >
                {booking ? 'Booking…' : 'Confirm PT Session'}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
