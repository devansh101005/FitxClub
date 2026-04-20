import { useAuth } from '../../context/AuthContext';
import {
  HiUsers,
  HiQrcode,
  HiUserAdd,
  HiCheckCircle,
  HiClock,
  HiArrowRight,
} from 'react-icons/hi';
import {
  Eyebrow,
  SectionHeader,
  Button,
  Card,
  Badge,
} from '../../components/editorial';

const RECENT_CHECKINS = [
  { id: 1, name: 'Rahul Sharma', time: '09:42 AM', area: 'Class - Power HIIT', method: 'QR Scan' },
  { id: 2, name: 'Aisha Patel', time: '09:31 AM', area: 'Yoga Studio', method: 'QR Scan' },
  { id: 3, name: 'Dev Kumar', time: '09:18 AM', area: 'Aquatic Center', method: 'QR Scan' },
  { id: 4, name: 'Priya Mehta', time: '08:55 AM', area: 'Main Gym Floor', method: 'QR Scan' },
  { id: 5, name: 'Arjun Lal', time: '08:47 AM', area: 'Gym Floor', method: 'Manual' },
  { id: 6, name: 'Sneha Gupta', time: '08:30 AM', area: 'Class - Cycling', method: 'QR Scan' },
  { id: 7, name: 'Vikram Bose', time: '08:12 AM', area: 'Basketball Court', method: 'QR Scan' },
];

const PENDING_MEMBERS = [
  { id: 1, name: 'Rohit Verma', email: 'rohit@gmail.com', plan: 'Gold', registeredAt: '09:15 AM' },
  { id: 2, name: 'Kavya Reddy', email: 'kavya@gmail.com', plan: 'Silver', registeredAt: '08:50 AM' },
];

const STATS = [
  { value: '47', label: 'Check-ins Today' },
  { value: '312', label: 'Active Members' },
  { value: '02', label: 'New Registrations' },
  { value: '08:00', label: 'Peak Time' },
];

function getInitials(name) {
  return String(name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const firstName =
    (user?.email || 'receptionist').split('@')[0].replace(/[._-]/g, ' ').trim() || 'Receptionist';

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ WELCOME ═══════════════════════ */}
      <section className="mb-16">
        <Eyebrow className="mb-6">Reception Desk</Eyebrow>
        <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-6 capitalize">
          Good Morning,<br />
          {firstName}.
        </h1>
        <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-10">
          <span className="text-ink font-semibold">47 members</span> checked in today and{' '}
          <span className="text-ink font-semibold">2 pending</span> registrations.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" to="/receptionist/scanner" icon={HiQrcode} iconPosition="left">
            Scan QR Code
          </Button>
          <Button variant="outlineDark" to="/receptionist/register" icon={HiUserAdd} iconPosition="left">
            Register Member
          </Button>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {STATS.map((s) => (
          <div key={s.label}>
            <span className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-bold text-gold leading-none block">
              {s.value}
            </span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* ═══════════════════════ MAIN GRID ═══════════════════════ */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-14 lg:gap-20">
        {/* ── LEFT: Recent Check-ins ── */}
        <div>
          <SectionHeader
            eyebrow="Live"
            title="Recent Check-ins"
            action={
              <Button variant="link" to="/receptionist/scanner" icon={HiArrowRight}>
                Scanner
              </Button>
            }
            className="mb-10"
          />

          <Card hover={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink/10">
                    {['Member', 'Time', 'Area', 'Method'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_CHECKINS.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-cream transition-colors ${
                        i < RECENT_CHECKINS.length - 1 ? 'border-b border-ink/6' : ''
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-coal text-gold font-heading text-[0.65rem] font-bold flex items-center justify-center shrink-0">
                            {getInitials(c.name)}
                          </div>
                          <span className="text-[14px] font-semibold text-ink">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[14px] text-ink-2">{c.time}</td>
                      <td className="px-6 py-5 text-[14px] text-ink-2">{c.area}</td>
                      <td className="px-6 py-5">
                        <Badge status={c.method === 'QR Scan' ? 'CONFIRMED' : 'PENDING'}>
                          {c.method}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Pending + Quick Actions ── */}
        <aside>
          <SectionHeader
            eyebrow="Pending"
            title="Registrations"
            action={
              <Button variant="link" to="/receptionist/register" icon={HiArrowRight}>
                Register
              </Button>
            }
            className="mb-10"
          />

          <div className="space-y-5 mb-14">
            {PENDING_MEMBERS.map((m) => (
              <Card key={m.id} hover={false} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 bg-coal text-gold font-heading text-[0.85rem] font-bold flex items-center justify-center shrink-0">
                    {getInitials(m.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-[1rem] font-bold text-ink leading-tight">
                      {m.name}
                    </h4>
                    <p className="text-[12px] text-ink-3 mt-0.5">{m.email}</p>
                  </div>
                  <Badge status="PENDING" />
                </div>
                <div className="flex items-center justify-between text-[13px] text-ink-2 mb-5">
                  <span>
                    Plan: <span className="text-gold font-semibold">{m.plan}</span>
                  </span>
                  <span>{m.registeredAt}</span>
                </div>
                <Button variant="primary" size="sm" className="w-full" icon={HiCheckCircle} iconPosition="left">
                  Activate Membership
                </Button>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Eyebrow tone="muted" className="mb-5">Quick Actions</Eyebrow>
          <div className="space-y-px bg-ink/10 border border-ink/10">
            {[
              { to: '/receptionist/scanner', label: 'Scan QR Code', icon: HiQrcode },
              { to: '/receptionist/register', label: 'Register New Member', icon: HiUserAdd },
            ].map((a) => (
              <a
                key={a.to}
                href={a.to}
                className="bg-white px-6 py-4 flex items-center gap-4 hover:bg-cream transition-colors group"
              >
                <div className="w-10 h-10 border border-ink/10 flex items-center justify-center shrink-0">
                  <a.icon className="w-5 h-5 text-gold" />
                </div>
                <span className="text-[14px] font-semibold text-ink flex-1">{a.label}</span>
                <HiArrowRight className="w-4 h-4 text-ink-3 group-hover:text-ink transition-colors" />
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
