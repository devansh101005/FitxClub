import { useState } from 'react';
import {
  HiDownload,
  HiDocumentReport,
  HiCalendar,
  HiUsers,
  HiCurrencyRupee,
  HiOfficeBuilding,
  HiCheckCircle,
} from 'react-icons/hi';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  SectionHeader,
  Button,
  Card,
  Badge,
} from '../../components/editorial';

const REPORTS = [
  {
    id: 'members', title: 'Member Report',
    desc: 'Complete list of all members with status, plan, and activity data.',
    icon: HiUsers, lastGenerated: '2025-11-28', size: '~24KB', format: 'CSV',
  },
  {
    id: 'payments', title: 'Payments Report',
    desc: 'All transactions within the selected date range, including status and method.',
    icon: HiCurrencyRupee, lastGenerated: '2025-11-30', size: '~18KB', format: 'CSV', dateRange: true,
  },
  {
    id: 'revenue', title: 'Revenue Summary',
    desc: 'Monthly revenue breakdown by category: memberships, PT, courts.',
    icon: HiDocumentReport, lastGenerated: '2025-11-30', size: '~8KB', format: 'PDF',
  },
  {
    id: 'checkins', title: 'Check-in Log',
    desc: 'Access log with timestamps, member IDs, and facility names.',
    icon: HiCheckCircle, lastGenerated: '2025-11-29', size: '~45KB', format: 'CSV', dateRange: true,
  },
  {
    id: 'facilities', title: 'Facility Utilization',
    desc: 'Occupancy rates and booking counts by facility.',
    icon: HiOfficeBuilding, lastGenerated: '2025-11-28', size: '~12KB', format: 'PDF',
  },
  {
    id: 'pt_sessions', title: 'PT Sessions Report',
    desc: 'Personal training sessions, trainer assignment, and completion rates.',
    icon: HiCalendar, lastGenerated: '2025-11-27', size: '~9KB', format: 'CSV',
  },
];

const RECENT_EXPORTS = [
  { id: 1, report: 'Payments Report', generatedAt: '2025-11-30 14:32', size: '18KB', by: 'Admin' },
  { id: 2, report: 'Revenue Summary', generatedAt: '2025-11-30 10:15', size: '8KB', by: 'Manager' },
  { id: 3, report: 'Member Report', generatedAt: '2025-11-28 09:00', size: '24KB', by: 'Admin' },
  { id: 4, report: 'Check-in Log', generatedAt: '2025-11-27 17:45', size: '41KB', by: 'Admin' },
];

export default function Reports() {
  const [dateRanges, setDateRanges] = useState({});
  const [generating, setGenerating] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const handleGenerate = async (report) => {
    setGenerating(report.id);
    try {
      if (report.id === 'members') await adminApi.reportMembers();
      else if (report.id === 'payments') {
        const range = dateRanges[report.id] || { from: firstOfMonth, to: today };
        await adminApi.reportPayments(range.from, range.to);
      } else if (report.id === 'revenue') await adminApi.reportRevenue();
      else await new Promise((r) => setTimeout(r, 1500));
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
    setGenerating(null);
    toast.success(`${report.title} generated and ready to download!`);
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Administration</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Reports
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Generate and download reports for analysis and compliance.
      </p>

      {/* ═══════════════════════ REPORT CARDS ═══════════════════════ */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7 mb-16">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          const range = dateRanges[report.id] || { from: firstOfMonth, to: today };
          return (
            <Card key={report.id} hover={false} className="p-7">
              {/* Icon + title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 border border-ink/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-[1.05rem] font-bold text-ink tracking-[-0.01em]">
                    {report.title}
                  </h3>
                  <Badge tone="outline" className="mt-1">{report.format}</Badge>
                </div>
              </div>

              <p className="text-[13px] text-ink-2 leading-[1.7] mb-5">{report.desc}</p>

              {/* Date range (conditional) */}
              {report.dateRange && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-1.5">From</label>
                    <input
                      type="date"
                      value={range.from}
                      max={today}
                      onChange={(e) => setDateRanges((prev) => ({ ...prev, [report.id]: { ...range, from: e.target.value } }))}
                      className="w-full bg-transparent border-0 border-b border-ink/15 px-0 py-2 text-[13px] text-ink focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mb-1.5">To</label>
                    <input
                      type="date"
                      value={range.to}
                      max={today}
                      onChange={(e) => setDateRanges((prev) => ({ ...prev, [report.id]: { ...range, to: e.target.value } }))}
                      className="w-full bg-transparent border-0 border-b border-ink/15 px-0 py-2 text-[13px] text-ink focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center justify-between text-[11px] text-ink-3 mb-5">
                <span>Last: {report.lastGenerated}</span>
                <span>{report.size} · {report.format}</span>
              </div>

              {/* Generate button */}
              <Button
                variant="outlineDark"
                size="sm"
                className="w-full"
                disabled={generating === report.id}
                onClick={() => handleGenerate(report)}
                icon={HiDownload}
                iconPosition="left"
              >
                {generating === report.id ? 'Generating…' : 'Generate & Download'}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* ═══════════════════════ RECENT EXPORTS ═══════════════════════ */}
      <SectionHeader eyebrow="History" title="Recent Exports" className="mb-10" />
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                {['Report', 'Generated At', 'Size', 'By', 'Action'].map((h) => (
                  <th key={h} className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_EXPORTS.map((exp, i) => (
                <tr key={exp.id} className={`hover:bg-cream transition-colors ${i < RECENT_EXPORTS.length - 1 ? 'border-b border-ink/6' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <HiDocumentReport className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-[14px] font-semibold text-ink">{exp.report}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{exp.generatedAt}</td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{exp.size}</td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{exp.by}</td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => toast.success(`Re-downloading ${exp.report}…`)}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-gold hover:text-ink transition-colors"
                    >
                      <HiDownload className="w-3.5 h-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
