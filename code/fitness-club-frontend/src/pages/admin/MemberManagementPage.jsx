import { useEffect, useMemo, useState } from 'react';
import { HiDotsVertical, HiDownload, HiSearch, HiUser } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { memberApi } from '../../services/api';
import { Badge, Button, Card, Eyebrow, EmptyState, Input, Spinner } from '../../components/editorial';

const FALLBACK_MEMBERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2024-01-15', sessions: 47 },
  { id: 2, name: 'Aisha Patel', email: 'aisha@email.com', plan: 'Silver', status: 'ACTIVE', joinDate: '2023-06-20', sessions: 128 },
  { id: 3, name: 'Dev Kumar', email: 'dev@email.com', plan: 'Platinum', status: 'ACTIVE', joinDate: '2024-03-10', sessions: 31 },
  { id: 4, name: 'Priya Mehta', email: 'priya@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2023-11-05', sessions: 89 },
  { id: 5, name: 'Arjun Lal', email: 'arjun@email.com', plan: 'Silver', status: 'SUSPENDED', joinDate: '2023-08-22', sessions: 62 },
  { id: 6, name: 'Sneha Gupta', email: 'sneha@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2024-02-14', sessions: 55 },
  { id: 7, name: 'Vikram Bose', email: 'vikram@email.com', plan: 'Platinum', status: 'ACTIVE', joinDate: '2023-04-30', sessions: 203 },
  { id: 8, name: 'Kavya Reddy', email: 'kavya@email.com', plan: 'Silver', status: 'EXPIRED', joinDate: '2023-12-01', sessions: 14 },
  { id: 9, name: 'Rohan Tiwari', email: 'rohan@email.com', plan: 'Gold', status: 'ACTIVE', joinDate: '2024-07-18', sessions: 22 },
  { id: 10, name: 'Meera Joshi', email: 'meera@email.com', plan: 'Silver', status: 'ACTIVE', joinDate: '2024-08-10', sessions: 9 },
];

/* Normalize MemberResponse DTO from backend */
function normalizeMember(m) {
  // Map membershipType enum to display label
  const planMap = { GOLD: 'Gold', SILVER: 'Silver', PLATINUM: 'Platinum' };
  return {
    id: m.id,
    name: m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.name || 'Member',
    email: m.email || '',
    plan: planMap[m.membershipType] || m.membershipType || m.plan || 'Gold',
    status: m.status || 'ACTIVE',
    joinDate: m.startDate || m.joinDate || '',
    sessions: m.sessions || 0,
    memberId: m.memberId,
  };
}

function getInitials(name) {
  return String(name || 'User').split(' ').map((word) => word[0]).join('').toUpperCase();
}

export default function MemberManagementPage() {
  const [members, setMembers] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    let alive = true;
    memberApi
      .listAll()
      .then((res) => {
        if (!alive) return;
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data.map(normalizeMember));
        } else {
          setMembers(FALLBACK_MEMBERS);
        }
      })
      .catch(() => alive && setMembers(FALLBACK_MEMBERS))
      .finally(() => alive && setLoadingPage(false));
    return () => { alive = false; };
  }, []);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState([]);
  const [menuId, setMenuId] = useState(null);

  const filtered = useMemo(() => members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) || member.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'ALL' || member.plan === planFilter;
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  }), [members, search, planFilter, statusFilter]);

  const stats = {
    total: members.length,
    active: members.filter((item) => item.status === 'ACTIVE').length,
    suspended: members.filter((item) => item.status === 'SUSPENDED').length,
    expired: members.filter((item) => item.status === 'EXPIRED').length,
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((item) => item.id));
  };

  const updateStatus = (id, status) => {
    setMembers((prev) => prev.map((member) => (member.id === id ? { ...member, status } : member)));
    setMenuId(null);
    toast.success(`Member ${status === 'ACTIVE' ? 'activated' : status === 'SUSPENDED' ? 'suspended' : 'removed'}.`);
  };

  const handleBulkAction = (status) => {
    if (!selected.length) return;
    setMembers((prev) => prev.map((member) => (selected.includes(member.id) ? { ...member, status } : member)));
    toast.success(`${selected.length} members updated.`);
    setSelected([]);
  };

  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      <Eyebrow className="mb-5">Admin Office</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Member Management.
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-10">
        Search, filter, and act on member accounts without losing the calm visual rhythm of the new editorial system.
      </p>

      <div className="flex flex-wrap gap-4 items-center justify-between mb-16">
        <Button variant="outlineDark" icon={HiDownload} onClick={() => toast.success('Member export started.')}>
          Export
        </Button>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-10 border-y border-ink/10 py-12 mb-16">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Suspended', value: stats.suspended },
          { label: 'Expired', value: stats.expired },
        ].map((stat) => (
          <div key={stat.label}>
            <span className="font-heading text-[clamp(2rem,3vw,3rem)] font-bold text-gold leading-none block">{stat.value}</span>
            <p className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3 mt-4">{stat.label}</p>
          </div>
        ))}
      </section>

      <Card hover={false} className="p-8 mb-10">
        <div className="relative max-w-xl mb-8">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gold">
            <HiSearch className="w-5 h-5" />
          </div>
          <Input
            label="Search Members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="pl-8"
          />
        </div>

        <div className="border-b border-ink/10 mb-8">
          <div className="flex gap-8 flex-wrap">
            {['ALL', 'ACTIVE', 'SUSPENDED', 'EXPIRED'].map((tab) => {
              const active = statusFilter === tab;
              const count = tab === 'ALL' ? members.length : members.filter((item) => item.status === tab).length;
              return (
                <button key={tab} type="button" onClick={() => setStatusFilter(tab)} className={`relative pb-4 transition-colors ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}>
                  <span className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase">{tab} ({count})</span>
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 ${active ? 'w-full' : 'w-0'}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {['ALL', 'Gold', 'Silver', 'Platinum'].map((plan) => {
            const active = planFilter === plan;
            return (
              <button
                key={plan}
                type="button"
                onClick={() => setPlanFilter(plan)}
                className={`px-5 py-3 text-[0.75rem] font-semibold tracking-[0.12em] uppercase border transition-colors ${
                  active ? 'bg-coal text-gold border-coal' : 'bg-white text-ink border-ink/10'
                }`}
              >
                {plan}
              </button>
            );
          })}
        </div>
      </Card>

      {selected.length ? (
        <Card hover={false} className="p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Badge tone="gold">{selected.length} Selected</Badge>
            <Button variant="outlineDark" size="sm" onClick={() => handleBulkAction('ACTIVE')}>Activate</Button>
            <Button variant="outlineDark" size="sm" onClick={() => handleBulkAction('SUSPENDED')}>Suspend</Button>
            <Button variant="link" onClick={() => setSelected([])}>Clear</Button>
          </div>
        </Card>
      ) : null}

      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="px-6 py-5 text-left">
                  <input type="checkbox" checked={filtered.length > 0 && selected.length === filtered.length} onChange={toggleAll} />
                </th>
                {['Member', 'Plan', 'Status', 'Join Date', 'Sessions', 'Actions'].map((header) => (
                  <th key={header} className="text-left px-6 py-5 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-ink-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, index) => (
                <tr key={member.id} className={`hover:bg-cream transition-colors ${index < filtered.length - 1 ? 'border-b border-ink/6' : ''}`}>
                  <td className="px-6 py-5">
                    <input type="checkbox" checked={selected.includes(member.id)} onChange={() => toggleSelect(member.id)} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-coal text-gold font-heading text-[0.8rem] font-bold flex items-center justify-center shrink-0">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="font-heading text-[1rem] font-bold text-ink tracking-[-0.01em]">{member.name}</p>
                        <p className="text-[13px] text-ink-3">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><Badge tone={member.plan === 'Gold' ? 'gold' : member.plan === 'Platinum' ? 'ink' : 'outline'}>{member.plan}</Badge></td>
                  <td className="px-6 py-5"><Badge status={member.status} /></td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{member.joinDate}</td>
                  <td className="px-6 py-5 text-[14px] text-ink-2">{member.sessions}</td>
                  <td className="px-6 py-5">
                    <div className="relative">
                      <button type="button" onClick={() => setMenuId(menuId === member.id ? null : member.id)} className="text-ink-3 hover:text-ink transition-colors">
                        <HiDotsVertical className="w-5 h-5" />
                      </button>
                      {menuId === member.id ? (
                        <div className="absolute right-0 top-8 bg-white border border-ink/10 z-10 min-w-40">
                          <button type="button" onClick={() => updateStatus(member.id, member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')} className="block w-full text-left px-4 py-3 text-[13px] text-ink hover:bg-cream">
                            {member.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button type="button" onClick={() => updateStatus(member.id, 'EXPIRED')} className="block w-full text-left px-4 py-3 text-[13px] text-ink hover:bg-cream">
                            Remove
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {!filtered.length ? (
        <div className="mt-10">
          <EmptyState
            icon={HiUser}
            eyebrow="No Results"
            title="Nothing found."
            description="Try a different search or reset the active filters."
          />
        </div>
      ) : null}
    </div>
  );
}
