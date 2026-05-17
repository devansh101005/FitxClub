import { useEffect, useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { facilityApi } from '../../services/api';
import {
  PageHero,
  SectionHeader,
  Eyebrow,
  Button,
  Spinner,
  EmptyState,
  Badge,
} from '../../components/editorial';

/* ── Editorial imagery for each facility type (fallback when API has no image field) ── */
const TYPE_IMAGERY = {
  GYM: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80',
  POOL: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&q=80',
  STUDIO: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&q=80',
  COURT: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
  WELLNESS: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=1200&q=80',
  OUTDOOR: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
};

/* ── Fallback data matches backend shape (FacilityResponse) ── */
const FALLBACK_FACILITIES = [
  {
    id: 1, name: 'Main Gym Floor', type: 'GYM', maxCapacity: 60, currentOccupancy: 34,
    description: 'State-of-the-art equipment including free weights, machines, and a functional training area.',
    open: true, openingHours: '05:00 – 23:00',
    features: ['Free Weights', 'Cable Machines', 'Cardio Zone', 'Functional Area'],
  },
  {
    id: 2, name: 'Aquatic Center', type: 'POOL', maxCapacity: 30, currentOccupancy: 12,
    description: '25-metre heated indoor pool with dedicated lanes for laps, water aerobics, and leisure swimming.',
    open: true, openingHours: '06:00 – 21:00',
    features: ['Lap Lanes', 'Heated Pool', 'Water Aerobics', 'Jacuzzi'],
  },
  {
    id: 3, name: 'Yoga Studio', type: 'STUDIO', maxCapacity: 20, currentOccupancy: 6,
    description: 'Serene, temperature-controlled studio with premium mats, props, and ambient lighting.',
    open: true, openingHours: '07:00 – 20:00',
    features: ['Premium Mats', 'Props Library', 'Sound System', 'Ambient Lighting'],
  },
  {
    id: 4, name: 'Basketball Court', type: 'COURT', maxCapacity: 20, currentOccupancy: 20,
    description: 'NBA-regulation basketball court with hardwood flooring and professional lighting.',
    open: true, openingHours: '08:00 – 22:00',
    features: ['Full Court', 'Hardwood Floor', 'Scoreboard', 'Ball Rental'],
  },
  {
    id: 5, name: 'Squash Courts', type: 'COURT', maxCapacity: 8, currentOccupancy: 2,
    description: 'Four professional squash courts with glass back walls and automated booking.',
    open: true, openingHours: '06:00 – 22:00',
    features: ['4 Courts', 'Glass Walls', 'Racket Rental', 'Ball Rental'],
  },
  {
    id: 6, name: 'Spin Studio', type: 'STUDIO', maxCapacity: 25, currentOccupancy: 0,
    description: 'High-energy indoor cycling studio with 25 premium bikes and immersive audio/visual experience.',
    open: false, openingHours: 'Closed Today',
    features: ['25 Premium Bikes', 'Clip-In Pedals', 'Leaderboard', 'Surround Sound'],
  },
  {
    id: 7, name: 'Steam & Sauna', type: 'WELLNESS', maxCapacity: 12, currentOccupancy: 5,
    description: 'Finnish dry sauna and steam room for post-workout recovery and restoration.',
    open: true, openingHours: '07:00 – 21:00',
    features: ['Dry Sauna', 'Steam Room', 'Ice Bath', 'Towel Service'],
  },
  {
    id: 8, name: 'Rooftop Track', type: 'OUTDOOR', maxCapacity: 40, currentOccupancy: 15,
    description: '400-metre rooftop track with synthetic surface and panoramic city views.',
    open: true, openingHours: '06:00 – 20:00',
    features: ['400m Track', 'Synthetic Surface', 'City Views', 'Night Lighting'],
  },
];

const STATS = [
  { value: '12+', label: 'Facilities' },
  { value: '24/7', label: 'Access' },
  { value: '400m', label: 'Rooftop Track' },
  { value: '98%', label: 'Uptime' },
];

/* ═══════════════════════ OCCUPANCY METER ═══════════════════════ */
function OccupancyMeter({ current, max }) {
  const safeMax = max || 1;
  const pct = Math.min(100, Math.round((current / safeMax) * 100));
  const tone =
    pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-gold' : 'bg-sage';
  const toneText =
    pct >= 90 ? 'text-red-600' : pct >= 60 ? 'text-[#8B7339]' : 'text-[#5F7358]';

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3">
          Live Occupancy
        </span>
        <span className={`text-[0.7rem] font-semibold tracking-widest uppercase ${toneText}`}>
          {current}/{max} &middot; {pct}%
        </span>
      </div>
      <div className="h-1 bg-ink/[0.06] overflow-hidden">
        <div className={`h-full transition-all duration-500 ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ═══════════════════════ FACILITY CARD ═══════════════════════ */
function FacilityCard({ facility }) {
  const image = TYPE_IMAGERY[facility.type] || TYPE_IMAGERY.DEFAULT;
  const open = facility.open !== false;
  const capacity = facility.maxCapacity ?? facility.capacity ?? 0;
  const current = facility.currentOccupancy ?? facility.current ?? 0;

  return (
    <article
      className={`group bg-white rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        !open ? 'opacity-70' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-coal">
        <img
          src={image}
          alt={facility.name}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85] group-hover:scale-[1.03] transition-transform duration-700"
        />
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
          <Eyebrow tone="white">{facility.type}</Eyebrow>
          {open ? (
            <Badge status="ACTIVE">Open</Badge>
          ) : (
            <Badge status="CANCELLED">Closed</Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-7">
        <h3 className="font-heading text-[1.5rem] font-bold tracking-[-0.01em] text-ink leading-[1.15] mb-2">
          {facility.name}
        </h3>
        <p className="text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-ink-3 mb-5">
          {facility.openingHours || 'Hours vary'}
        </p>
        <p className="text-[14px] text-ink-2 font-light leading-[1.7] mb-6">
          {facility.description}
        </p>

        {/* Features */}
        {Array.isArray(facility.features) && facility.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {facility.features.slice(0, 4).map((f) => (
              <span
                key={f}
                className="text-[0.7rem] font-medium tracking-[0.04em] text-ink-2 border border-ink/10 px-2.5 py-1"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Occupancy */}
        {open && <OccupancyMeter current={current} max={capacity} />}

        {/* CTA */}
        <div className="mt-7 pt-6 border-t border-ink/8">
          <Button
            variant="link"
            to={open ? '/login' : '#'}
            icon={HiArrowRight}
          >
            {open ? 'Book a Slot' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    facilityApi
      .getAll()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        setFacilities(Array.isArray(data) && data.length > 0 ? data : FALLBACK_FACILITIES);
      })
      .catch((err) => {
        if (!alive) return;
        console.warn('Facility API unavailable — using fallback data.', err);
        setFacilities(FALLBACK_FACILITIES);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <PageHero
        eyebrow="World Class"
        title="Our Facilities"
        description="Every space designed with intention — from our 60-station gym floor to the rooftop track. Live occupancy, so you always know what to expect."
        image="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=80"
        height="md"
      />

      {/* ═══════════════════════ LIVE STRIP ═══════════════════════ */}
      <section className="bg-coal py-14 border-t border-white/4">
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
            </span>
            <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-gold">
              Live Occupancy Tracking
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <span className="font-heading text-[clamp(2rem,3.5vw,3.25rem)] font-bold text-gold leading-none block">
                  {s.value}
                </span>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-white/35 mt-3">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ GRID ═══════════════════════ */}
      <section className="bg-cream py-24 lg:py-32">
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <SectionHeader
            eyebrow="Explore"
            title={<>Spaces built for<br />every pursuit.</>}
            description="Browse live capacity across every corner of the club. Tap any facility to book a session when signed in."
            className="mb-16"
          />

          {loading && <Spinner text="Loading facilities" />}

          {!loading && facilities.length === 0 && (
            <EmptyState
              eyebrow="Nothing Here"
              title="No facilities listed."
              description="Our facility roster is being updated. Please check back shortly."
            />
          )}

          {!loading && facilities.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {facilities.map((f) => (
                <FacilityCard key={f.id} facility={f} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ CTA BANNER ═══════════════════════ */}
      <section className="relative py-24 lg:py-32 bg-coal overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-coal/80 via-transparent to-coal/40" />
        <div className="relative text-center max-w-2xl mx-auto px-6">
          <Eyebrow tone="gold" className="mb-6">Membership</Eyebrow>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-white leading-[1.1] mb-5">
            Access all of this.<br />Every day.
          </h2>
          <p className="text-[15px] text-white/50 font-light leading-[1.7] mb-10 max-w-md mx-auto">
            One membership. Every facility. Whenever you need it.
          </p>
          <Button variant="primaryLight" to="/signup" icon={HiArrowRight}>
            Become a Member
          </Button>
        </div>
      </section>
    </>
  );
}
