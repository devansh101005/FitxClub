import { useEffect, useState } from 'react';
import { HiArrowRight, HiQrcode, HiUserAdd, HiUsers } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { Badge, Button, Card, Eyebrow, SectionHeader, Spinner } from '../../components/editorial';

const FALLBACK_CHECKINS = [
  { id: 1, name: 'Rahul Sharma', time: '09:42 AM', type: 'Class - Power HIIT', method: 'QR Scan' },
  { id: 2, name: 'Aisha Patel', time: '09:31 AM', type: 'Gym Floor', method: 'QR Scan' },
  { id: 3, name: 'Dev Kumar', time: '09:18 AM', type: 'Pool', method: 'QR Scan' },
  { id: 4, name: 'Priya Mehta', time: '08:55 AM', type: 'Yoga Studio', method: 'QR Scan' },
  { id: 5, name: 'Arjun Lal', time: '08:47 AM', type: 'Gym Floor', method: 'Manual' },
  { id: 6, name: 'Sneha Gupta', time: '08:30 AM', type: 'Class - Cycling', method: 'QR Scan' },
  { id: 7, name: 'Vikram Bose', time: '08:12 AM', type: 'Basketball Court', method: 'QR Scan' },
];

const FALLBACK_PENDING = [
  { id: 1, name: 'Rohit Verma', email: 'rohit@gmail.com', plan: 'Gold', registeredAt: '09:15 AM' },
  { id: 2, name: 'Kavya Reddy', email: 'kavya@gmail.com', plan: 'Silver', registeredAt: '08:50 AM' },
];

const FALLBACK_STATS = [
  { label: 'Check-Ins Today', value: '47' },
  { label: 'Active Members', value: '312' },
  { label: 'New Registrations', value: '2' },
  { label: 'Peak Time', value: '08:00' },
];

function getInitials(name) {
  return String(name || 'User')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function ReceptionistDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Reception Team';
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [checkins] = useState(FALLBACK_CHECKINS);
  const [pending] = useState(FALLBACK_PENDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminApi
      .getDashboard()
      .then((res) => {
        if (!alive) return;
        const d = res?.data ?? res;
        if (d) {
          setStats([
            { label: 'Check-Ins Today', value: String(d.totalCheckInsToday ?? 47) },
            { label: 'Active Members', value: String(d.activeMembers ?? d.totalMembers ?? 312) },
            { label: 'Pending PT', value: String(d.pendingPTRequests ?? 2) },
            { label: 'Expiring Soon', value: String(d.expiringMembershipsIn7Days ?? 0) },
          ]);
        }
      })
      .catch(() => {/* fallback already set */})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const checkInCount = stats[0]?.value || '47';
  const pendingCount = pending.length;

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Reception Desk</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Good Morning, {displayName}.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-10">
        The front desk has already welcomed <span className="text-ink font-semibold">{checkInCount} check-ins</span>
        {' '}today, with <span className="text-ink font-semibold">{pendingCount} memberships</span> still waiting for activation.
      </p>

      <div className="flex flex-wrap gap-4 mb-16">
        <Button variant="primary" to="/receptionist/scanner" icon={HiQrcode}>
          Open Scanner
        </Button>
        <Button variant="outlineDark" to="/receptionist/register" icon={HiUserAdd}>
          Register Member
        </Button>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {stats.map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">
              {stat.value}
            </span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-14 lg:gap-20">
        <section>
          <SectionHeader
            eyebrow="Live Floor"
            title="Recent Check-Ins"
            className="mb-8"
          />
          <Card hover={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink/10">
                    {['Member', 'Time', 'Area', 'Method'].map((header) => (
                      <th
                        key={header}
                        className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-cream transition-colors ${
                        index < checkins.length - 1 ? 'border-b border-ink/6' : ''
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-coal text-gold font-heading text-[0.8rem] font-bold flex items-center justify-center shrink-0">
                            {getInitials(entry.name)}
                          </div>
                          <div>
                            <p className="font-heading text-[1rem] font-bold text-ink tracking-[-0.01em]">
                              {entry.name}
                            </p>
                            <p className="text-[13px] text-ink-3">{entry.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[14px] text-ink-2">{entry.time}</td>
                      <td className="px-6 py-5 text-[14px] text-ink-2">{entry.type}</td>
                      <td className="px-6 py-5">
                        <Badge tone={entry.method === 'QR Scan' ? 'gold' : 'outline'}>
                          {entry.method}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className="space-y-10">
          <div>
            <SectionHeader
              eyebrow="Pending Queue"
              title="Pending Registrations"
              className="mb-8"
            />
            <div className="space-y-px bg-ink/10 border border-ink/10">
              {pending.map((member) => (
                <article key={member.id} className="bg-white px-7 py-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 bg-coal text-gold font-heading text-[0.8rem] font-bold flex items-center justify-center shrink-0">
                      {getInitials(member.name)}
                    </div>
                    <div className="min-w-0 grow">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-heading text-[1.15rem] font-bold text-ink tracking-[-0.01em]">
                          {member.name}
                        </h3>
                        <Badge tone="gold">{member.plan}</Badge>
                      </div>
                      <p className="text-[13px] text-ink-3">{member.email}</p>
                      <p className="text-[13px] text-ink-3 mt-1">Submitted at {member.registeredAt}</p>
                    </div>
                  </div>
                  <Button variant="outlineDark" size="sm" to="/receptionist/register">
                    Activate Membership
                  </Button>
                </article>
              ))}
            </div>
          </div>

          <Card hover={false} className="p-8">
            <Eyebrow className="mb-4">Quick Actions</Eyebrow>
            <div className="space-y-px bg-ink/10 border border-ink/10">
              {[
                { to: '/receptionist/scanner', label: 'Scan next guest', icon: HiQrcode },
                { to: '/receptionist/register', label: 'Start a new registration', icon: HiUserAdd },
                { to: '/admin/members', label: 'Review member records', icon: HiUsers },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="bg-white flex items-center gap-4 px-6 py-5 text-ink hover:bg-cream transition-colors"
                >
                  <action.icon className="w-5 h-5 text-gold shrink-0" />
                  <span className="text-[14px] font-medium grow">{action.label}</span>
                  <HiArrowRight className="w-4 h-4 text-ink-3 shrink-0" />
                </Link>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
