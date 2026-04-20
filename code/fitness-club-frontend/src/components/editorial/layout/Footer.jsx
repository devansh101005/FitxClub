/**
 * Editorial Footer — warm off-white, 4 columns, glass divider strip.
 * Extracted verbatim from LandingPage.jsx so every public page shares it.
 */
import { FiInstagram, FiTwitter, FiYoutube, FiFacebook } from 'react-icons/fi';

const DEFAULT_COLUMNS = [
  {
    title: 'Resources',
    links: ['Gift Cards', 'Find a Location', 'Membership', 'Journal'],
  },
  {
    title: 'Help',
    links: ['Get Help', 'Contact Us', 'FAQs', 'Returns'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'News', 'Investors'],
  },
];

export default function Footer({ columns = DEFAULT_COLUMNS, className = '' }) {
  return (
    <footer className={`bg-[#FAFAF9] relative ${className}`}>
      {/* Glass divider strip — subtle, 16px tall with 4px blur */}
      <div className="relative">
        <div className="h-px bg-linear-to-r from-transparent via-black/[0.06] to-transparent" />
        <div className="absolute -top-2 inset-x-0 h-4 bg-linear-to-b from-transparent to-white/60 backdrop-blur-[4px] pointer-events-none" />
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-20 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-[#1A1A1A] mb-6">
                {col.title}
              </h4>
              <ul className="space-y-0">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[0.875rem] text-[#6B6B6B] leading-[2.2] hover:text-[#1A1A1A] transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect column with socials */}
          <div>
            <h4 className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-[#1A1A1A] mb-6">
              Connect
            </h4>
            <div className="flex items-center gap-5">
              {[
                { Icon: FiInstagram, label: 'Instagram' },
                { Icon: FiTwitter, label: 'Twitter' },
                { Icon: FiYoutube, label: 'YouTube' },
                { Icon: FiFacebook, label: 'Facebook' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/[0.08]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.75rem] text-[#9A9A9A]">
            &copy; {new Date().getFullYear()} FitnessClub. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2 text-[0.75rem] text-[#9A9A9A]">
            <a href="#" className="hover:text-[#1A1A1A] transition-colors duration-300">Privacy Policy</a>
            <span className="text-[#D4D4D4]">&middot;</span>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors duration-300">Terms of Use</a>
            <span className="text-[#D4D4D4]">&middot;</span>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors duration-300">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
