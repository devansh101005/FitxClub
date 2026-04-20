import { useEffect, useState } from 'react';
import {
  HiCheck,
  HiX,
  HiAcademicCap,
  HiCalendar,
  HiClock,
  HiArrowRight,
} from 'react-icons/hi';
import { trainerApi, ptApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Badge,
  Spinner,
  EmptyState,
} from '../../components/editorial';

/* No fallback — always use real API data */

function getInitials(name) {
  return String(name || 'Member')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function normalizeRequest(item) {
  const date = item?.date || item?.sessionDate || '';
  const startTime = item?.time || item?.startTime || '';
  const endTime = item?.endTime || '';
  return {
    ...item,
    member: item?.member || item?.memberName || 'Member',
    date: typeof date === 'string' ? date : String(date),
    time: typeof startTime === 'string' ? startTime.slice(0, 5) : String(startTime || ''),
    focus: item?.focus || item?.notes || 'Personal Training',
    notes: item?.notes || '',
    status: (() => {
      const s = String(item?.status || 'PENDING').toUpperCase();
      if (s === 'REQUESTED') return 'PENDING';
      if (s === 'CONFIRMED') return 'ACCEPTED';
      if (s === 'CANCELLED') return 'DECLINED';
      return s;
    })(),
    endTime: typeof endTime === 'string' ? endTime.slice(0, 5) : endTime,
  };
}

export default function PTRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('PENDING');

  const fetchRequests = () => {
    setLoading(true);
    trainerApi
      .getPTSessions()
      .then((res) => {
        const data = res?.data ?? res ?? [];
        setRequests(Array.isArray(data) ? data.map(normalizeRequest) : []);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action) => {
    const newStatus = action === 'accept' ? 'CONFIRMED' : 'CANCELLED';
    setProcessing(id + action);
    try {
      await ptApi.updateStatus(id, newStatus);
      toast.success(
        action === 'accept' ? 'PT request accepted!' : 'PT request declined.',
      );
      fetchRequests();
    } catch (err) {
      console.error('Failed to update PT status', err);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered =
    filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const acceptedCount = requests.filter((r) => r.status === 'ACCEPTED').length;
  const declinedCount = requests.filter((r) => r.status === 'DECLINED').length;

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Personal Training</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        PT Requests
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Manage incoming personal training session requests from members.
      </p>

      {loading && <Spinner text="Loading requests" />}

      {!loading && (
        <>
          {/* ═══════════════════════ STATS ═══════════════════════ */}
          <section className="grid grid-cols-3 gap-10 border-y border-ink/10 py-12 mb-16">
            {[
              { value: pendingCount, label: 'Pending' },
              { value: acceptedCount, label: 'Accepted' },
              { value: declinedCount, label: 'Declined' },
            ].map((s) => (
              <div key={s.label}>
                <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">
                  {s.value}
                </span>
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">
                  {s.label}
                </p>
              </div>
            ))}
          </section>

          {/* ═══════════════════════ FILTER TABS ═══════════════════════ */}
          <div className="border-b border-ink/10 mb-12">
            <div className="flex gap-8">
              {['PENDING', 'ACCEPTED', 'DECLINED', 'ALL'].map((f) => {
                const active = filter === f;
                const count =
                  f === 'ALL'
                    ? requests.length
                    : requests.filter((r) => r.status === f).length;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`relative pb-4 transition-colors ${
                      active ? 'text-ink' : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    <span className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase">
                      {f.charAt(0) + f.slice(1).toLowerCase()} ({count})
                    </span>
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${
                        active ? 'w-full' : 'w-0'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════ REQUESTS ═══════════════════════ */}
          {filtered.length === 0 ? (
            <EmptyState
              eyebrow="No Requests"
              title={`No ${filter.toLowerCase()} requests.`}
              description="New PT requests from members will appear here."
            />
          ) : (
            <div className="space-y-5">
              {filtered.map((req) => {
                const initials = getInitials(req.member);
                return (
                  <article
                    key={req.id}
                    className="bg-white border border-ink/10 p-7"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-coal text-gold font-heading text-[0.85rem] font-bold flex items-center justify-center shrink-0">
                        {initials}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">
                            {req.member}
                          </h3>
                          <Badge status={req.status} />
                        </div>

                        {req.memberSince && (
                          <p className="text-[11px] text-ink-3 mb-3">
                            Member since {req.memberSince}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-[13px] text-ink-2 mb-3">
                          <span className="flex items-center gap-1.5">
                            <HiAcademicCap className="w-4 h-4 text-gold shrink-0" />
                            {req.focus}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <HiCalendar className="w-3.5 h-3.5 text-ink-3" />
                            {req.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <HiClock className="w-3.5 h-3.5 text-ink-3" />
                            {req.time}{req.endTime ? ` - ${req.endTime}` : ''}
                          </span>
                        </div>

                        {req.notes && (
                          <p className="text-[12px] text-ink-3 italic leading-relaxed">
                            "{req.notes}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {req.status === 'PENDING' && (
                        <div className="flex gap-3 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!!processing}
                            onClick={() => handleAction(req.id, 'accept')}
                            icon={HiCheck}
                            iconPosition="left"
                          >
                            {processing === req.id + 'accept'
                              ? '…'
                              : 'Accept'}
                          </Button>
                          <Button
                            variant="outlineDark"
                            size="sm"
                            disabled={!!processing}
                            onClick={() => handleAction(req.id, 'decline')}
                            icon={HiX}
                            iconPosition="left"
                          >
                            {processing === req.id + 'decline'
                              ? '…'
                              : 'Decline'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
