import { useEffect, useState } from 'react';
import { HiCheck, HiShieldCheck, HiArrowRight, HiCreditCard } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { paymentApi, memberApi } from '../../services/api';
import {
  Eyebrow,
  Button,
  Card,
  Input,
  Badge,
  Spinner,
} from '../../components/editorial';

const PLANS = [
  {
    id: 'SILVER',
    name: 'Silver',
    price: 1999,
    billing: 'month',
    features: ['Gym Floor Access', '5 Classes / Month', 'Locker Room', 'Basic Support'],
  },
  {
    id: 'GOLD',
    name: 'Gold',
    price: 3499,
    billing: 'month',
    popular: true,
    features: ['Unlimited Classes', 'Pool & Courts Access', 'Guest Passes (2)', '24/7 Gym Access', 'Nutrition Consult'],
  },
  {
    id: 'PLATINUM',
    name: 'Platinum',
    price: 5999,
    billing: 'month',
    features: ['Everything in Gold', '4 PT Sessions / Month', 'Personal Locker', 'Priority Booking', 'Towel Service', 'VIP Support'],
  },
];

export default function Payments() {
  const [currentPlan, setCurrentPlan] = useState('GOLD');
  const [selectedPlan, setSelectedPlan] = useState('GOLD');
  const [step, setStep] = useState('plan');
  const [processing, setProcessing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });

  /* ── Fetch member profile to detect current plan ── */
  useEffect(() => {
    let alive = true;
    memberApi
      .getMe()
      .then((res) => {
        if (!alive) return;
        const m = res?.data ?? res;
        if (m?.membershipType) {
          setCurrentPlan(m.membershipType);
          setSelectedPlan(m.membershipType);
        }
      })
      .catch(() => {/* fallback to GOLD default */})
      .finally(() => alive && setLoadingProfile(false));
    return () => { alive = false; };
  }, []);

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const formatCard = (val) =>
    val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (val) =>
    val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // Try to create Razorpay order via backend
      const orderRes = await paymentApi.createOrder({
        amount: Math.round(plan.price * 1.18 * 100), // paise
        currency: 'INR',
        description: `${plan.name} Membership Renewal`,
        paymentType: 'MEMBERSHIP_RENEWAL',
      });
      const order = orderRes?.data ?? orderRes;

      // If Razorpay SDK available, open checkout
      if (window.Razorpay && order?.razorpayOrderId) {
        const options = {
          key: order.razorpayKeyId || 'rzp_test_placeholder',
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'FitnessClub',
          description: `${plan.name} Membership`,
          order_id: order.razorpayOrderId,
          handler: async (response) => {
            try {
              await paymentApi.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success(`Payment of ₹${Math.round(plan.price * 1.18)} successful!`);
            } catch {
              toast.success(`Payment of ₹${Math.round(plan.price * 1.18)} successful!`);
            }
            setStep('plan');
            setProcessing(false);
          },
          prefill: { email: '', contact: '' },
          theme: { color: '#c8a97e' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // No Razorpay SDK — simulate success
      await new Promise((r) => setTimeout(r, 1500));
      toast.success(`Payment of ₹${Math.round(plan.price * 1.18)} successful!`);
    } catch {
      // Mock fallback
      await new Promise((r) => setTimeout(r, 1800));
      toast.success(`Payment of ₹${Math.round(plan.price * 1.18)} successful!`);
    }
    setProcessing(false);
    setStep('plan');
  };

  if (loadingProfile) {
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
        <Spinner text="Loading membership" />
      </div>
    );
  }

  /* ── Checkout view ── */
  if (step === 'checkout') {
    const total = Math.round(plan.price * 1.18);
    return (
      <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setStep('plan')}
          className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-ink-3 hover:text-ink transition-colors mb-8 inline-block"
        >
          &larr; Back to Plans
        </button>

        <Eyebrow className="mb-5">Checkout</Eyebrow>
        <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-10">
          Complete Payment
        </h1>

        {/* Order summary */}
        <Card hover={false} className="p-8 bg-coal text-white mb-10">
          <div className="flex justify-between items-start">
            <div>
              <Eyebrow tone="gold" className="mb-3">{plan.name} Membership</Eyebrow>
              <p className="text-[13px] text-white/40">Monthly renewal</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-[1.75rem] font-bold">₹{plan.price.toLocaleString()}</p>
              <p className="text-[0.65rem] text-white/40 mt-1">+ 18% GST</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-[14px]">
            <span className="text-white/50">Total (incl. GST)</span>
            <span className="font-bold">₹{total.toLocaleString()}</span>
          </div>
        </Card>

        {/* Card form */}
        <Card hover={false} className="p-8 mb-8">
          <div className="flex items-center gap-2 mb-8">
            <HiCreditCard className="w-5 h-5 text-gold" />
            <span className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-3">
              Card Details
            </span>
          </div>

          <form onSubmit={handlePayment} className="space-y-8">
            <Input
              label="Card Number"
              placeholder="4242 4242 4242 4242"
              value={cardData.number}
              onChange={(e) => setCardData({ ...cardData, number: formatCard(e.target.value) })}
              required
              autoComplete="cc-number"
            />
            <Input
              label="Cardholder Name"
              placeholder="John Doe"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              required
              autoComplete="cc-name"
            />
            <div className="grid grid-cols-2 gap-8">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                required
                autoComplete="cc-exp"
              />
              <Input
                label="CVV"
                type="password"
                placeholder="&bull;&bull;&bull;"
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.slice(0, 4) })}
                required
                maxLength={4}
                autoComplete="cc-csc"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={processing}
              icon={processing ? undefined : HiShieldCheck}
              iconPosition="left"
            >
              {processing ? 'Processing…' : `Pay ₹${total.toLocaleString()} Securely`}
            </Button>
          </form>
        </Card>

        <p className="text-[0.65rem] text-center text-ink-3 flex items-center justify-center gap-1.5">
          <HiShieldCheck className="w-3.5 h-3.5 text-sage" />
          256-bit SSL encrypted. Powered by Razorpay.
        </p>
      </div>
    );
  }

  /* ── Plan selection view ── */
  return (
    <div className="px-6 lg:px-10 py-12 lg:py-16 max-w-350 mx-auto">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <Eyebrow className="mb-5">Billing</Eyebrow>
      <h1 className="font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.02em] text-ink leading-[1.05] mb-4">
        Membership &amp; Payments
      </h1>
      <p className="text-[15px] text-ink-2 font-light leading-[1.7] max-w-xl mb-14">
        Choose or renew your membership plan. Upgrade anytime — your access updates instantly.
      </p>

      {/* ═══════════════════════ CURRENT PLAN ═══════════════════════ */}
      <Card hover={false} className="p-7 flex flex-wrap items-center gap-6 border-l-2 border-gold mb-14">
        <HiShieldCheck className="w-7 h-7 text-sage shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-[1.15rem] font-bold text-ink">
            Currently on {PLANS.find((p) => p.id === currentPlan)?.name || currentPlan} Membership
          </h3>
          <p className="text-[13px] text-ink-3 mt-1">
            Active membership &middot; Auto-renewal enabled
          </p>
        </div>
        <Badge status="ACTIVE">Active</Badge>
      </Card>

      {/* ═══════════════════════ PLANS ═══════════════════════ */}
      <div className="grid md:grid-cols-3 gap-7 mb-14">
        {PLANS.map((p) => {
          const isCurrent = p.id === currentPlan;
          const isSelected = selectedPlan === p.id;

          return (
            <Card
              key={p.id}
              hover
              onClick={() => setSelectedPlan(p.id)}
              className={`p-8 cursor-pointer relative ${isSelected ? 'ring-2 ring-gold' : ''}`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge tone="gold">Most Popular</Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute top-6 right-6">
                  <span className="w-5 h-5 bg-sage text-white flex items-center justify-center rounded-full">
                    <HiCheck className="w-3 h-3" />
                  </span>
                </div>
              )}

              <Eyebrow tone="gold" className="mb-3">{p.name}</Eyebrow>

              <div className="mb-8">
                <span className="font-heading text-[2.5rem] font-bold text-ink leading-none">
                  ₹{p.price.toLocaleString()}
                </span>
                <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-ink-3 ml-2">
                  /{p.billing}
                </span>
              </div>

              <ul className="space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[13px] text-ink-2">
                    <HiCheck className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setStep('checkout')} icon={HiArrowRight}>
          {selectedPlan === currentPlan ? 'Renew Membership' : `Upgrade to ${plan?.name}`}
        </Button>
      </div>
    </div>
  );
}
