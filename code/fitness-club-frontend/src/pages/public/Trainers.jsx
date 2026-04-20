import { useEffect, useMemo, useState } from 'react';
import { HiSearch, HiStar, HiArrowRight, HiCheck } from 'react-icons/hi';
import { trainerApi } from '../../services/api';
import {
  PageHero,
  SectionHeader,
  Eyebrow,
  Button,
  Spinner,
  EmptyState,
  Badge,
} from '../../components/editorial';

/* ── Editorial portrait imagery ── */
const TRAINER_IMAGES = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=900&q=80',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&q=80',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=900&q=80',
  'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=900&q=80',
  'https://images.unsplash.com/photo-1609899537878-88d5ba429bdf?w=900&q=80',
];

/* ── Fallback data matches backend shape (TrainerProfileResponse) ── */
const FALLBACK_TRAINERS = [
  {
    id: 1, name: 'Rahul Sharma', specialization: 'Strength & Conditioning',
    bio: 'ACE-certified strength coach with 5+ years in competitive powerlifting. Specialises in progressive overload programming and athletic performance.',
    certifications: 'ACE Certified · CrossFit Level 1 · NSCA-CPT',
    hourlyRate: 1500, rating: 4.9, sessions: 842, available: true,
    tags: ['HIIT', 'Strength', 'Boxing'],
  },
  {
    id: 2, name: 'Sarah Chen', specialization: 'Yoga & Pilates',
    bio: 'RYT-500 yoga therapist with a decade of experience guiding practitioners from recovery to advanced asana. STOTT Pilates certified.',
    certifications: 'RYT 500 · Yoga Alliance E-RYT · Pre/Postnatal',
    hourlyRate: 1200, rating: 4.8, sessions: 1204, available: true,
    tags: ['Yoga', 'Pilates', 'Meditation'],
  },
  {
    id: 3, name: 'Prateek Malhotra', specialization: 'CrossFit & Cardio',
    bio: 'Former national-level cyclist turned CrossFit coach. Known for high-energy metabolic conditioning and endurance programming.',
    certifications: 'CrossFit Level 2 · Spinning Certified · RRCA Run Coach',
    hourlyRate: 1000, rating: 4.7, sessions: 967, available: true,
    tags: ['CrossFit', 'Spinning', 'Functional Training'],
  },
];

const FEATURED = [
  { label: 'Certified Coaches', value: '48' },
  { label: 'Combined Years', value: '320+' },
  { label: 'Sessions Delivered', value: '18K' },
  { label: 'Avg. Rating', value: '4.8' },
];

/* ═══════════════════════ TRAINER CARD ═══════════════════════ */
function TrainerCard({ trainer, image }) {
  const initials = (trainer.name || 'FC')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const certList =
    typeof trainer.certifications === 'string'
      ? trainer.certifications.split(/[·,|]/).map((c) => c.trim()).filter(Boolean)
      : Array.isArray(trainer.certifications)
      ? trainer.certifications
      : [];

  const tags = Array.isArray(trainer.tags)
    ? trainer.tags
    : trainer.specialization
    ? [trainer.specialization]
    : [];

  const available = trainer.available !== false;

  return (
    <article className="group bg-white rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* Portrait */}
      <div className="relative h-72 overflow-hidden bg-coal">
        {image ? (
          <img
            src={image}
            alt={trainer.name}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.9] group-hover:scale-[1.03] transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-coal">
            <span className="font-heading text-[4rem] text-gold">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-coal/80 via-transparent to-transparent" />

        {/* Status pill */}
        <div className="absolute top-5 right-5">
          {available ? <Badge status="ACTIVE">Available</Badge> : <Badge status="CANCELLED">Fully Booked</Badge>}
        </div>

        {/* Rating bottom-left */}
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <div>
            <Eyebrow tone="gold" className="mb-2">{trainer.specialization || 'Trainer'}</Eyebrow>
            <h3 className="font-heading text-[1.65rem] font-bold text-white tracking-[-0.01em] leading-[1.1]">
              {trainer.name}
            </h3>
          </div>
          {trainer.rating && (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/20">
              <HiStar className="w-3.5 h-3.5 text-gold" />
              <span className="text-[0.8rem] font-semibold text-white">{trainer.rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-7">
        <p className="text-[14px] text-ink-2 font-light leading-[1.7] mb-6">
          {trainer.bio}
        </p>

        {/* Certifications */}
        {certList.length > 0 && (
          <div className="space-y-2 mb-6">
            {certList.slice(0, 3).map((cert) => (
              <div key={cert} className="flex items-center gap-3 text-[13px] text-ink-2">
                <HiCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                {cert}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-ink/8">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[0.7rem] font-medium tracking-[0.04em] text-ink-2 border border-ink/10 px-2.5 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rate + CTA */}
        <div className="flex items-center justify-between">
          {trainer.hourlyRate ? (
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">
                From
              </p>
              <p className="font-heading text-[1.5rem] font-bold text-ink leading-none mt-1">
                ₹{trainer.hourlyRate.toLocaleString()}
                <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-ink-3 ml-2">
                  /hour
                </span>
              </p>
            </div>
          ) : (
            <div />
          )}
          <Button
            variant="link"
            to={available ? '/login' : '#'}
            icon={HiArrowRight}
          >
            {available ? 'Book PT' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    trainerApi
      .getAll()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        setTrainers(Array.isArray(data) && data.length > 0 ? data : FALLBACK_TRAINERS);
      })
      .catch((err) => {
        if (!alive) return;
        console.warn('Trainer API unavailable — using fallback data.', err);
        setTrainers(FALLBACK_TRAINERS);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return trainers;
    const q = search.toLowerCase();
    return trainers.filter((t) =>
      [t.name, t.specialization, t.bio, ...(t.tags || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [trainers, search]);

  return (
    <>
      <PageHero
        eyebrow="Expert Team"
        title="Our Trainers"
        description="Certified coaches, champion athletes, and wellness specialists — every member of our team brings years of experience and a personal approach."
        image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80"
        height="md"
      />

      {/* ═══════════════════════ FEATURED STRIP ═══════════════════════ */}
      <section className="bg-coal py-14 border-t border-white/4">
        <div className="max-w-350 mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {FEATURED.map((s) => (
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
            eyebrow="The Roster"
            title={<>World-class<br />instruction.</>}
            description="Find the coach whose approach resonates with you. Every trainer takes new clients and works within your schedule."
            className="mb-12"
          />

          {/* Search */}
          <div className="mb-14 max-w-md">
            <div className="relative">
              <HiSearch className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialty, or focus..."
                className="w-full bg-transparent border-0 border-b border-ink/15 pl-8 pr-0 py-3 text-[15px] text-ink placeholder-ink-3 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          {loading && <Spinner text="Loading trainers" />}

          {!loading && filtered.length === 0 && (
            <EmptyState
              eyebrow="No Matches"
              title={search ? `Nothing for "${search}"` : 'No trainers listed.'}
              description="Try a different search term, or clear your filters to see the full roster."
              action={
                search ? (
                  <Button variant="outlineDark" onClick={() => setSearch('')}>
                    Clear Search
                  </Button>
                ) : null
              }
            />
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((trainer, i) => (
                <TrainerCard
                  key={trainer.id || trainer.staffId || i}
                  trainer={trainer}
                  image={TRAINER_IMAGES[i % TRAINER_IMAGES.length]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ CTA BANNER ═══════════════════════ */}
      <section className="relative py-24 lg:py-32 bg-coal overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-coal/80 via-transparent to-coal/40" />
        <div className="relative text-center max-w-2xl mx-auto px-6">
          <Eyebrow tone="gold" className="mb-6">Personal Training</Eyebrow>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-white leading-[1.1] mb-5">
            One coach.<br />Your transformation.
          </h2>
          <p className="text-[15px] text-white/50 font-light leading-[1.7] mb-10 max-w-md mx-auto">
            1-on-1 sessions designed around your goals. Join today and your first consultation is on us.
          </p>
          <Button variant="primaryLight" to="/login" icon={HiArrowRight}>
            Book a Session
          </Button>
        </div>
      </section>
    </>
  );
}
