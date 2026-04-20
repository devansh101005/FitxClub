import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiCalendar,
  HiCurrencyRupee,
  HiOfficeBuilding,
  HiUsers,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import {
  Eyebrow,
  SectionHeader,
  Button,
  Card,
  Badge,
} from '../../components/editorial';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

const KPI_CARDS = [
  { value: '312', label: 'Active Members', sub: '+23 this month', icon: HiUsers },
  { value: '₹1.89L', label: 'Monthly Revenue', sub: '+12.4% vs last month', icon: HiCurrencyRupee },
  { value: '24', label: 'Live Classes', sub: 'scheduled this week', icon: HiCalendar },
  { value: '7/8', label: 'Facilities Open', sub: 'one space under maintenance', icon: HiOfficeBuilding },
];

const REVENUE_DATA = [
  { month: 'Jun', revenue: 124000, members: 228 },
  { month: 'Jul', revenue: 138000, members: 245 },
  { month: 'Aug', revenue: 152000, members: 259 },
  { month: 'Sep', revenue: 145000, members: 271 },
  { month: 'Oct', revenue: 168000, members: 289 },
  { month: 'Nov', revenue: 189000, members: 312 },
];

const CHECKIN_DATA = [
  { day: 'Mon', count: 87 },
  { day: 'Tue', count: 73 },
  { day: 'Wed', count: 91 },
  { day: 'Thu', count: 68 },
  { day: 'Fri', count: 96 },
  { day: 'Sat', count: 112 },
  { day: 'Sun', count: 64 },
];

const FACILITY_STATUS = [
  { name: 'Main Gym', status: 'ACTIVE', note: 'Peak traffic expected at 7 PM' },
  { name: 'Yoga Studio', status: 'ACTIVE', note: 'Morning slots nearly full' },
  { name: 'Swimming Pool', status: 'ACTIVE', note: 'Open until 9 PM' },
  { name: 'Spin Studio', status: 'PENDING', note: 'Maintenance inspection in progress' },
];

const RECENT_ACTIVITY = [
  { id: 1, action: 'New member registered', user: 'Rohit Verma', time: '2 minutes ago', tone: 'gold' },
  { id: 2, action: 'Morning Yoga created', user: 'Alex Morgan', time: '15 minutes ago', tone: 'ink' },
  { id: 3, action: 'Membership renewed', user: 'Priya Mehta', time: '31 minutes ago', tone: 'gold' },
  { id: 4, action: 'PT session booked', user: 'Dev Kumar', time: '45 minutes ago', tone: 'ink' },
];

const INSIGHT_STRIP = [
  { title: 'Revenue Momentum', text: 'Membership renewals are outpacing new signups this week, which is improving retention quality.' },
  { title: 'Peak Footfall', text: 'Saturday remains the highest occupancy window, especially across gym floor and badminton courts.' },
  { title: 'Operations Watch', text: 'Spin Studio status should be resolved before tomorrow’s evening programming block.' },
];

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(255,255,255,0.98)',
    border: '1px solid rgba(26,26,26,0.08)',
    borderRadius: '8px',
    color: '#1A1A1A',
    fontSize: 12,
    boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
  },
  cursor: { stroke: 'rgba(26,26,26,0.08)', strokeWidth: 1 },
};

function StatCard({ icon, value, label, sub }) {
  const IconComponent = icon;

  return (
    <Card hover className="p-6 lg:p-7">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="w-12 h-12 border border-[#1A1A1A]/10 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-[#C9A96E]" />
        </div>
        <Badge tone="gold">Live</Badge>
      </div>
      <div>
        <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-[#1A1A1A] leading-none block">
          {value}
        </span>
        <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#9A9A9A] mt-4">
          {label}
        </p>
        <p className="text-[13px] text-[#6B6B6B] mt-3 leading-[1.6]">
          {sub}
        </p>
      </div>
    </Card>
  );
}

export default function AdminDashboardEditorial() {
  const { user } = useAuth();

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-[1500px] mx-auto bg-[#FAFAF9]">
      <section className="relative overflow-hidden bg-[#0A0A0A] mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_45%)]" />
        <div className="relative grid lg:grid-cols-[1.45fr_0.9fr] gap-12 px-8 py-10 lg:px-12 lg:py-14">
          <div>
            <Eyebrow tone="gold" className="mb-6">
              {user?.role || 'Admin'} Command Center
            </Eyebrow>
            <h1 className="font-heading text-[clamp(2.6rem,5vw,5rem)] font-bold tracking-[-0.02em] leading-[1.02] text-white mb-6">
              Operate The Club
              <br />
              With Clarity.
            </h1>
            <p className="text-[15px] text-white/55 font-light leading-[1.8] max-w-2xl mb-10">
              A daily editorial overview of revenue, attendance, scheduling, and facility
              health designed to feel like the premium public experience, not a generic admin panel.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primaryLight" to="/admin/reports" icon={HiArrowRight}>
                Open Reports
              </Button>
              <Button variant="outlineLight" to="/admin/create-class">
                Create Class
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/10 self-start">
            {[
              { value: '08', label: 'PT requests pending' },
              { value: '14', label: 'renewals due this week' },
              { value: '89%', label: 'average class occupancy' },
              { value: '3.8h', label: 'avg member dwell time' },
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.03] px-6 py-7">
                <span className="font-heading text-[2rem] font-bold text-[#C9A96E] leading-none block">
                  {item.value}
                </span>
                <p className="text-[0.65rem] font-semibold tracking-[0.16em] uppercase text-white/45 mt-3">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-20">
        {KPI_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="mb-20">
        <SectionHeader
          eyebrow="Executive Snapshot"
          title={<>Performance<br />At A Glance</>}
          description="Revenue, check-ins, and member growth visualized in the same restrained editorial tone as the landing and login experience."
          action={
            <Button variant="link" to="/admin/revenue" icon={HiArrowRight}>
              Full Analytics
            </Button>
          }
          className="mb-10"
        />

        <div className="grid xl:grid-cols-[1.25fr_0.95fr] gap-6">
          <Card hover={false} className="p-7 lg:p-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <Eyebrow tone="gold" className="mb-3">Revenue Trend</Eyebrow>
                <h3 className="font-heading text-[1.8rem] font-bold tracking-[-0.02em] text-[#1A1A1A]">
                  Monthly Revenue
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#9A9A9A]">
                  Current Run Rate
                </p>
                <p className="font-heading text-[1.4rem] font-bold text-[#1A1A1A] mt-2">
                  ₹1.89L
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="editorialRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C9A96E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(26,26,26,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(26,26,26,0.3)" tick={{ fill: 'rgba(26,26,26,0.55)', fontSize: 11 }} />
                <YAxis stroke="rgba(26,26,26,0.3)" tick={{ fill: 'rgba(26,26,26,0.55)', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#1A1A1A" strokeWidth={2.4} fill="url(#editorialRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card hover={false} className="p-7 lg:p-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <Eyebrow tone="gold" className="mb-3">Footfall</Eyebrow>
                <h3 className="font-heading text-[1.8rem] font-bold tracking-[-0.02em] text-[#1A1A1A]">
                  Weekly Check-Ins
                </h3>
              </div>
              <Link to="/admin/peak-hours" className="text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                Peak Hours
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CHECKIN_DATA} barCategoryGap="28%">
                <CartesianGrid stroke="rgba(26,26,26,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(26,26,26,0.3)" tick={{ fill: 'rgba(26,26,26,0.55)', fontSize: 11 }} />
                <YAxis stroke="rgba(26,26,26,0.3)" tick={{ fill: 'rgba(26,26,26,0.55)', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Check-ins']} />
                <Bar dataKey="count" fill="#C9A96E" radius={[0, 0, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>

      <section className="grid xl:grid-cols-[1.18fr_0.82fr] gap-6 mb-20">
        <Card hover={false} className="p-7 lg:p-8">
          <SectionHeader
            eyebrow="Growth"
            title={<>Member<br />Trajectory</>}
            description="Active membership is still climbing steadily, with the strongest lift from annual-plan conversions."
            action={
              <Button variant="link" to="/admin/member-analytics" icon={HiArrowRight}>
                Member Analytics
              </Button>
            }
            className="mb-8"
          />
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid stroke="rgba(26,26,26,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(26,26,26,0.3)" tick={{ fill: 'rgba(26,26,26,0.55)', fontSize: 11 }} />
              <YAxis stroke="rgba(26,26,26,0.3)" tick={{ fill: 'rgba(26,26,26,0.55)', fontSize: 11 }} domain={[200, 'auto']} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Members']} />
              <Line type="monotone" dataKey="members" stroke="#1A1A1A" strokeWidth={2.6} dot={{ fill: '#C9A96E', r: 4 }} activeDot={{ r: 5, fill: '#1A1A1A' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card hover={false} className="p-7 lg:p-8">
          <Eyebrow tone="gold" className="mb-3">Operations</Eyebrow>
          <h3 className="font-heading text-[1.8rem] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8">
            Facility Status
          </h3>
          <div className="space-y-px bg-[#1A1A1A]/8 border border-[#1A1A1A]/8">
            {FACILITY_STATUS.map((facility) => (
              <div key={facility.name} className="bg-white px-5 py-5 flex items-start justify-between gap-5">
                <div>
                  <h4 className="font-heading text-[1.1rem] font-bold text-[#1A1A1A]">
                    {facility.name}
                  </h4>
                  <p className="text-[13px] text-[#6B6B6B] mt-2 leading-[1.6]">
                    {facility.note}
                  </p>
                </div>
                <Badge status={facility.status} />
              </div>
            ))}
          </div>
          <Button variant="outlineDark" size="sm" to="/admin/facilities" className="mt-8">
            Manage Facilities
          </Button>
        </Card>
      </section>

      <section className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <Card variant="dark" hover={false} className="p-7 lg:p-8">
          <SectionHeader
            eyebrow="Field Notes"
            title={<>What Needs<br />Attention</>}
            description="Short editorial observations for the manager on duty."
            tone="dark"
            size="md"
            className="mb-8"
          />
          <div className="space-y-6">
            {INSIGHT_STRIP.map((item, index) => (
              <div key={item.title} className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0">
                <p className="text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-[#C9A96E] mb-3">
                  0{index + 1}
                </p>
                <h4 className="font-heading text-[1.25rem] font-bold text-white leading-tight mb-3">
                  {item.title}
                </h4>
                <p className="text-[14px] text-white/45 leading-[1.7]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false} className="p-7 lg:p-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <Eyebrow tone="gold" className="mb-3">Timeline</Eyebrow>
              <h3 className="font-heading text-[1.8rem] font-bold tracking-[-0.02em] text-[#1A1A1A]">
                Recent Activity
              </h3>
            </div>
            <Button variant="link" to="/admin/reports" icon={HiArrowRight}>
              View Logs
            </Button>
          </div>
          <div className="space-y-0 border-t border-[#1A1A1A]/10">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="grid md:grid-cols-[1.2fr_0.8fr_0.5fr] gap-4 py-5 border-b border-[#1A1A1A]/10">
                <div>
                  <p className="font-heading text-[1.1rem] font-bold text-[#1A1A1A] leading-tight">
                    {item.action}
                  </p>
                  <p className="text-[13px] text-[#6B6B6B] mt-2">
                    Triggered by {item.user}
                  </p>
                </div>
                <div className="flex items-center md:justify-center">
                  <Badge tone={item.tone}>{item.tone === 'gold' ? 'Priority' : 'Update'}</Badge>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-[#9A9A9A]">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
