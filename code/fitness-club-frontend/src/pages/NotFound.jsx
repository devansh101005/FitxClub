import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { Eyebrow, Button } from '../components/editorial';
import logo from '../assets/logo.png';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80';

export default function NotFound() {
  return (
    <div className="font-editorial relative min-h-screen flex items-center justify-center bg-coal overflow-hidden">
      <img
        src={BG_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover brightness-[0.25]"
      />
      <div className="absolute inset-0 bg-linear-to-b from-coal/60 via-transparent to-coal/90" />

      {/* Brand mark top-left */}
      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 z-10">
        <img src={logo} alt="Fitness Club Logo" className="w-8 h-8 object-contain filter brightness-0 invert" />
        <span className="font-extrabold text-[1.2rem] text-white tracking-[-0.02em]">
          FitnessClub
        </span>
      </Link>

      {/* Content */}
      <div className="relative text-center max-w-2xl px-6 animate-fade-in-up">
        <Eyebrow tone="gold" className="mb-8">Page Not Found</Eyebrow>

        <h1 className="font-heading text-[clamp(5rem,14vw,12rem)] font-bold tracking-[-0.03em] text-white leading-[0.9] mb-2">
          404
        </h1>

        <div className="h-px w-16 bg-gold mx-auto my-10" />

        <h2 className="font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-[-0.01em] text-white leading-[1.15] mb-5">
          This path leads nowhere.
        </h2>
        <p className="text-[15px] text-white/50 font-light leading-[1.7] mb-12 max-w-md mx-auto">
          The page you&apos;re looking for may have moved, been renamed, or never existed. Let&apos;s
          get you back on track.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primaryLight" to="/" icon={HiArrowRight}>
            Return Home
          </Button>
          <Button variant="outlineLight" to="/facilities">
            Explore Facilities
          </Button>
        </div>
      </div>
    </div>
  );
}
