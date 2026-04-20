import {
  HiHome, HiUser, HiCalendar, HiClipboardList, HiCreditCard, HiClock,
  HiUserGroup, HiAcademicCap, HiViewGrid, HiQrcode, HiUserAdd,
  HiChartBar, HiDocumentReport, HiOfficeBuilding, HiCog, HiCollection,
} from 'react-icons/hi';

export const sidebarMenus = {
  MEMBER: [
    { label: 'Dashboard', path: '/member', icon: HiHome },
    { label: 'My Profile', path: '/member/profile', icon: HiUser },
    { label: 'Book a Class', path: '/member/book-class', icon: HiCalendar },
    { label: 'Book a Court', path: '/member/book-court', icon: HiViewGrid },
    { label: 'My Reservations', path: '/member/reservations', icon: HiClipboardList },
    { label: 'Book PT Session', path: '/member/book-pt', icon: HiAcademicCap },
    { label: 'My PT Sessions', path: '/member/pt-sessions', icon: HiClock },
    { label: 'Payments', path: '/member/payments', icon: HiCreditCard },
    { label: 'Payment History', path: '/member/payment-history', icon: HiDocumentReport },
  ],
  TRAINER: [
    { label: 'Dashboard', path: '/trainer', icon: HiHome },
    { label: 'My Profile', path: '/trainer/profile', icon: HiUser },
    { label: 'Availability', path: '/trainer/availability', icon: HiClock },
    { label: 'My Schedule', path: '/trainer/schedule', icon: HiCalendar },
    { label: 'PT Requests', path: '/trainer/pt-requests', icon: HiClipboardList },
    { label: 'PT Sessions', path: '/trainer/pt-sessions', icon: HiAcademicCap },
  ],
  RECEPTIONIST: [
    { label: 'Dashboard', path: '/receptionist', icon: HiHome },
    { label: 'Register Member', path: '/receptionist/register', icon: HiUserAdd },
    { label: 'QR Scanner', path: '/receptionist/scanner', icon: HiQrcode },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin', icon: HiHome },
    { label: 'Members', path: '/admin/members', icon: HiUserGroup },
    { label: 'Create Class', path: '/admin/create-class', icon: HiCalendar },
    { label: 'Facilities', path: '/admin/facilities', icon: HiOfficeBuilding },
    { label: 'Revenue', path: '/admin/revenue', icon: HiChartBar },
    { label: 'Member Analytics', path: '/admin/member-analytics', icon: HiUserGroup },
    { label: 'Facility Analytics', path: '/admin/facility-analytics', icon: HiViewGrid },
    { label: 'Peak Hours', path: '/admin/peak-hours', icon: HiClock },
    { label: 'Reports', path: '/admin/reports', icon: HiDocumentReport },
  ],
  MANAGER: [
    { label: 'Dashboard', path: '/admin', icon: HiHome },
    { label: 'Members', path: '/admin/members', icon: HiUserGroup },
    { label: 'Create Class', path: '/admin/create-class', icon: HiCalendar },
    { label: 'Facilities', path: '/admin/facilities', icon: HiOfficeBuilding },
    { label: 'Revenue', path: '/admin/revenue', icon: HiChartBar },
    { label: 'Member Analytics', path: '/admin/member-analytics', icon: HiUserGroup },
    { label: 'Facility Analytics', path: '/admin/facility-analytics', icon: HiViewGrid },
    { label: 'Peak Hours', path: '/admin/peak-hours', icon: HiClock },
    { label: 'Reports', path: '/admin/reports', icon: HiDocumentReport },
  ],
};
