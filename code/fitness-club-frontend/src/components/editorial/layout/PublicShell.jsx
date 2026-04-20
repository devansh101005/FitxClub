/**
 * PublicShell — composes UtilityBar + PublicNavbar + optional page label
 * + <Outlet /> or children + Footer.
 *
 * Use this as the top-level wrapper for every public page (Facilities,
 * Trainers, ClassSchedule, Login, NotFound, etc.) so the header chrome
 * stays identical to the landing page.
 *
 * Usage as a react-router layout route:
 *   <Route element={<PublicShell />}>
 *     <Route path="/facilities" element={<Facilities />} />
 *     ...
 *   </Route>
 *
 * Or as an explicit wrapper:
 *   <PublicShell pageLabel="Our Trainers">
 *     <FacilitiesContent />
 *   </PublicShell>
 */
import { Outlet } from 'react-router-dom';
import UtilityBar from './UtilityBar';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';

export default function PublicShell({
  children,
  pageLabel,
  showUtility = true,
  showFooter = true,
  navLinks,
}) {
  return (
    <div className="font-editorial text-[#1A1A1A] bg-[#FAFAF9] min-h-screen flex flex-col">
      {showUtility && <UtilityBar />}
      <PublicNavbar links={navLinks} />

      {/* Page label strip — optional, matches landing page "Premium Training" */}
      {pageLabel && (
        <div className="w-full py-3 px-6 lg:px-10 bg-white border-b border-[#E5E5E5]">
          <span className="text-[0.95rem] font-bold text-[#111] tracking-[-0.01em]">
            {pageLabel}
          </span>
        </div>
      )}

      <main className="flex-1">{children || <Outlet />}</main>

      {showFooter && <Footer />}
    </div>
  );
}
