import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { PublicShell, DashboardShell } from './components/editorial';

import LandingPage from './pages/public/LandingPage';
import Login from './pages/public/Login';
import ClassSchedule from './pages/public/ClassSchedule';
import Trainers from './pages/public/Trainers';
import Facilities from './pages/public/Facilities';

import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import BookClass from './pages/member/BookClass';
import BookCourt from './pages/member/BookCourt';
import Reservations from './pages/member/Reservations';
import BookPT from './pages/member/BookPT';
import PTSessions from './pages/member/PTSessions';
import Payments from './pages/member/Payments';
import PaymentHistory from './pages/member/PaymentHistory';

import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerProfile from './pages/trainer/TrainerProfile';
import Availability from './pages/trainer/Availability';
import TrainerSchedule from './pages/trainer/TrainerSchedule';
import PTRequests from './pages/trainer/PTRequests';
import TrainerPTSessions from './pages/trainer/TrainerPTSessions';

import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboardPage';
import RegisterMember from './pages/receptionist/RegisterMemberPage';
import QRScanner from './pages/receptionist/QRScannerPage';

import AdminDashboard from './pages/admin/AdminDashboardPage';
import MemberManagement from './pages/admin/MemberManagementPage';
import CreateClass from './pages/admin/CreateClassPage';
import FacilityManagement from './pages/admin/FacilityManagementPage';
import RevenueAnalytics from './pages/admin/RevenueAnalyticsPage';
import MemberAnalytics from './pages/admin/MemberAnalyticsPage';
import FacilityAnalytics from './pages/admin/FacilityAnalyticsPage';
import PeakHours from './pages/admin/PeakHoursPage';
import Reports from './pages/admin/ReportsPage';

import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Standalone full-screen login (no shell) */}
        <Route path="/login" element={<Login />} />

        {/* Public routes wrapped in the editorial PublicShell */}
        <Route element={<PublicShell />}>
          <Route path="/schedule" element={<ClassSchedule />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/facilities" element={<Facilities />} />
        </Route>

        {/* Member routes — editorial DashboardShell */}
        <Route element={<ProtectedRoute roles={['MEMBER']}><DashboardShell roleLabel="Member" /></ProtectedRoute>}>
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/book-class" element={<BookClass />} />
          <Route path="/member/book-court" element={<BookCourt />} />
          <Route path="/member/reservations" element={<Reservations />} />
          <Route path="/member/book-pt" element={<BookPT />} />
          <Route path="/member/pt-sessions" element={<PTSessions />} />
          <Route path="/member/payments" element={<Payments />} />
          <Route path="/member/payment-history" element={<PaymentHistory />} />
        </Route>

        {/* Trainer routes */}
        <Route element={<ProtectedRoute roles={['TRAINER']}><DashboardShell roleLabel="Trainer" /></ProtectedRoute>}>
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/trainer/profile" element={<TrainerProfile />} />
          <Route path="/trainer/availability" element={<Availability />} />
          <Route path="/trainer/schedule" element={<TrainerSchedule />} />
          <Route path="/trainer/pt-requests" element={<PTRequests />} />
          <Route path="/trainer/pt-sessions" element={<TrainerPTSessions />} />
        </Route>

        {/* Receptionist routes */}
        <Route element={<ProtectedRoute roles={['RECEPTIONIST']}><DashboardShell roleLabel="Receptionist" /></ProtectedRoute>}>
          <Route path="/receptionist" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/register" element={<RegisterMember />} />
          <Route path="/receptionist/scanner" element={<QRScanner />} />
        </Route>

        {/* Admin / Manager routes */}
        <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><DashboardShell roleLabel="Admin" /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<MemberManagement />} />
          <Route path="/admin/create-class" element={<CreateClass />} />
          <Route path="/admin/facilities" element={<FacilityManagement />} />
          <Route path="/admin/revenue" element={<RevenueAnalytics />} />
          <Route path="/admin/member-analytics" element={<MemberAnalytics />} />
          <Route path="/admin/facility-analytics" element={<FacilityAnalytics />} />
          <Route path="/admin/peak-hours" element={<PeakHours />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
