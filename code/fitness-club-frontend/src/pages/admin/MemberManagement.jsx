import { useState } from 'react';
import {
  HiSearch, HiUser, HiCheck, HiX, HiDotsVertical, HiDownload,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import {
  Eyebrow,
  Button,
  Card,
  Badge,
  EmptyState,
} from '../../components/editorial';

const MEMBERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2024-01-15', lastSeen: '2h ago', sessions: 47 },
  { id: 2, name: 'Aisha Patel', email: 'aisha@email.com', plan: 'Silver', status: 'ACTIVE', joinDate: '2023-06-20', lastSeen: '1d ago', sessions: 128 },
  { id: 3, name: 'Dev Kumar', email: 'dev@email.com', plan: 'Platinum', status: 'ACTIVE', joinDate: '2024-03-10', lastSeen: '3h ago', sessions: 31 },
  { id: 4, name: 'Priya Mehta', email: 'priya@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2023-11-05', lastSeen: 'Today', sessions: 89 },
  { id: 5, name: 'Arjun Lal', email: 'arjun@email.com', plan: 'Silver', status: 'SUSPENDED', joinDate: '2023-08-22', lastSeen: '5d ago', sessions: 62 },
  { id: 6, name: 'Sneha Gupta', email: 'sneha@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2024-02-14', lastSeen: 'Today', sessions: 55 },
  { id: 7, name: 'Vikram Bose', email: 'vikram@email.com', plan: 'Platinum', status: 'ACTIVE', joinDate: '2023-04-30', lastSeen: '2d ago', sessions: 203 },
  { id: 8, name: 'Kavya Reddy', email: 'kavya@email.com', plan: 'Silver', status: 'EXPIRED', joinDate: '2023-12-01', lastSeen: '2w ago', sessions: 14 },
  { id: 9, name: 'Rohan Tiwari', email: 'rohan@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2024-07-18', lastSeen: 'Today', sessions: 22 },
  { id: 10, name: 'Meera Joshi', email: 'meera@email.com', plan: 'Silver', status: 'ACTIVE', joinDate: '2024-08-10', lastSeen: '4h ago', sessions: 9 },
];

function getInitials(name) {
  return String(name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase();
}

export default function MemberManagement() {
  const [members, setMembers] = useState(MEMBERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [selected, setSelected] = useState(new Set());
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'ALL' || m.plan === planFilter;
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const toggleSelect = (id) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((prev) => prev.size === filtered.length ? new Set() : new Set(filtered.map((m) => m.id)));

  const handleAction = (id, action) => {
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status: action === 'activate' ? 'ACTIVE' : 'SUSPENDED' } : m));
    setOpenMenu(null);
    toast.success(action === 'activate' ? 'Member activated' : 'Member suspended');
  };

  const bulkAction = (action) => {
    if (selected.size === 0) return;
    setMembers((prev) => prev.map((m) => selected.has(m.id) ? { ...m, status: action === 'activate' ? 'ACTIVE' : 'SUSPENDED' } : m));
    setSelected(new Set());
    toast.success(`${selected.size} members ${action}d`);
  };

  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const suspendedCount = members.filter((m) => m.status === 'SUSPENDED').length;
  const expiredCount = members.filter((m) => m.status === 'EXPIRED').length;

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <Eyebrow className="mb-5">Administration</Eyebrow>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05]">
            Member Management
          </h1>
          <p className="text-[15px] text-ink-2 font-light leading-[1.7] mt-4 max-w-lg">
            {members.length} total members · {activeCount} active
          </p>
        </div>
        <Button variant="outlineDark" size="sm" onClick={() => toast.success('Export started…')} icon={HiDownload} iconPosition="left">
          Export
        </Button>
      </div>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { value: members.length, label: 'Total' },
          { value: activeCount, label: 'Active' },
          { value: suspendedCount, label: 'Suspended' },
          { value: expiredCount, label: 'Expired' },
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

      {/* ═══════════════════════ SEARCH + FILTERS ═══════════════════════ */}
      <div className="mb-8">
        <div className="relative max-w-sm mb-8">
          <HiSearch className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-transparent border-0 border-b border-ink/15 pl-8 pr-0 py-3 text-[15px] text-ink placeholder-ink-3 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Status tabs */}
        <div className="border-b border-ink/10 mb-6">
          <div className="flex gap-8">
            {['ALL', 'ACTIVE', 'SUSPENDED', 'EXPIRED'].map((f) => {
              const active = statusFilter === f;
              const count = f === 'ALL' ? members.length : members.filter((m) => m.status === f).length;
              return (
                <button key={f} type="button" onClick={() => setStatusFilter(f)}
                  className={`relative pb-4 transition-colors ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}>
                  <span className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase">
                    {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()} ({count})
                  </span>
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${active ? 'w-full' : 'w-0'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan chips */}
        <div className="flex gap-3">
          {['ALL', 'Gold', 'Silver', 'Platinum'].map((p) => {
            const isActive = planFilter === p;
            return (
              <button key={p} type="button" onClick={() => setPlanFilter(p)}
                className={`px-4 py-2 text-[0.7rem] font-semibold tracking-[0.12em] uppercase border transition-colors ${
                  isActive ? 'bg-coal text-gold border-coal' : 'bg-transparent text-ink-3 border-ink/15 hover:border-ink/30'
                }`}>
                {p === 'ALL' ? 'All Plans' : p}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════ BULK ACTIONS ═══════════════════════ */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 p-4 border border-gold/30 bg-gold/5 mb-6">
          <span className="text-[13px] font-semibold text-ink">{selected.size} selected</span>
          <Button variant="primary" size="sm" onClick={() => bulkAction('activate')} icon={HiCheck} iconPosition="left">Activate</Button>
          <Button variant="outlineDark" size="sm" onClick={() => bulkAction('suspend')} icon={HiX} iconPosition="left">Suspend</Button>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-ink-3 hover:text-ink">
            <HiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════ TABLE ═══════════════════════ */}
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="px-6 py-5 text-left">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll}
                    className="accent-gold" />
                </th>
                {['Member', 'Plan', 'Status', 'Joined', 'Last Seen', 'Sessions', ''].map((h) => (
                  <th key={h || 'action'} className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id}
                  className={`hover:bg-cream transition-colors ${i < filtered.length - 1 ? 'border-b border-ink/6' : ''} ${selected.has(m.id) ? 'bg-gold/5' : ''}`}>
                  <td className="px-6 py-5">
                    <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} className="accent-gold" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-coal text-gold font-heading text-[0.6rem] font-bold flex items-center justify-center shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-ink">{m.name}</p>
                        <p className="text-[12px] text-ink-3">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><Badge tone="gold">{m.plan}</Badge></td>
                  <td className="px-6 py-5"><Badge status={m.status} /></td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{m.joinDate}</td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{m.lastSeen}</td>
                  <td className="px-6 py-5 text-[14px] font-semibold text-ink">{m.sessions}</td>
                  <td className="px-6 py-5">
                    <div className="relative">
                      <button type="button" onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                        className="p-1.5 text-ink-3 hover:text-ink transition-colors">
                        <HiDotsVertical className="w-4 h-4" />
                      </button>
                      {openMenu === m.id && (
                        <div className="absolute right-0 top-8 z-10 w-40 bg-white border border-ink/10 shadow-lg overflow-hidden">
                          {m.status !== 'ACTIVE' && (
                            <button type="button" onClick={() => handleAction(m.id, 'activate')}
                              className="w-full text-left px-4 py-3 text-[13px] text-sage hover:bg-cream transition-colors flex items-center gap-2">
                              <HiCheck className="w-3.5 h-3.5" /> Activate
                            </button>
                          )}
                          {m.status === 'ACTIVE' && (
                            <button type="button" onClick={() => handleAction(m.id, 'suspend')}
                              className="w-full text-left px-4 py-3 text-[13px] text-red-500 hover:bg-cream transition-colors flex items-center gap-2">
                              <HiX className="w-3.5 h-3.5" /> Suspend
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16">
              <EmptyState
                icon={HiUser}
                eyebrow="No Results"
                title="No members match your filters."
                description="Try a different search or filter."
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
