import Link from "next/link";
import { MessageCircleHeart, Check, Sparkles, Heart, Star, Zap } from "lucide-react";
import { PricingCTA } from "@/components/pricing/PricingCTA";

const FREE_FEATURES = [
  "Up to 25 quotes saved",
  "Up to 2 children",
  "Basic quote feed & search",
  "Favorites collection",
  "On This Day reminders",
  "Share individual quotes",
];

const PRO_FEATURES = [
  "Unlimited quotes — forever",
  "Unlimited children",
  "Family sharing (up to 6 members)",
  "Export to beautiful PDF books",
  "TV Display Mode",
  "Custom themes & fonts",
  "Priority support",
  "Early access to new features",
];

function CheckItem({ text, muted = false }: { text: string; muted?: boolean }) {
  return (
    <li className={`flex items-start gap-3 ${muted ? "text-[#94A3B8]" : "text-[#334155]"}`}>
      <div
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          muted ? "bg-[#E2E8F0]" : "bg-[#6B8F71]/15"
        }`}
      >
        <Check className={`w-3 h-3 ${muted ? "text-[#94A3B8]" : "text-[#6B8F71]"}`} />
      </div>
      <span className="text-sm leading-relaxed">{text}</span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#E2E8F0]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MessageCircleHeart className="w-7 h-7 text-[#6B8F71]" />
            <span className="text-xl font-bold tracking-tight">Quiplet</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#64748B] hover:text-[#334155] transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-[#6B8F71] text-white px-5 py-2.5 rounded-xl hover:bg-[#5A7D60] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#6B8F71]/10 text-[#6B8F71] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Heart className="w-4 h-4" />
          Simple, honest pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] mb-4">
          Capture every laugh,<br />
          <span className="text-[#6B8F71]">without limits</span>
        </h1>
        <p className="text-lg text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Start free and keep the quotes that matter most. Upgrade when your family is ready for more.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Free Tier */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-[#E2E8F0]/80">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-[#F1F5F9] text-[#64748B] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Free
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-[#64748B] text-sm pb-2">/ forever</span>
              </div>
              <p className="text-[#64748B] text-sm">
                Perfect for getting started and saving your first favourites.
              </p>
            </div>

            <Link
              href="/signup"
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold border-2 border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all mb-8"
            >
              Start for free
            </Link>

            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <CheckItem key={f} text={f} />
              ))}
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="relative bg-[#6B8F71] rounded-3xl p-8 shadow-[0_8px_40px_rgba(107,143,113,0.25)]">
            {/* Most popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-1.5 bg-[#C8956C] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                <Star className="w-3 h-3 fill-white" />
                Most loved by parents
              </div>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5" />
                Pro
              </div>

              {/* Toggle label */}
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-white">$4.99</span>
                  <span className="text-white/70 text-sm pb-2">/ month</span>
                </div>
                <p className="text-white/80 text-sm font-medium">
                  or <span className="text-white font-bold">$39 / year</span>
                  <span className="ml-2 inline-block bg-[#C8956C] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Save 35%
                  </span>
                </p>
              </div>
              <p className="text-white/80 text-sm">
                For families who never want to miss a single funny moment.
              </p>
            </div>

            <PricingCTA />

            <ul className="space-y-3 mt-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-white">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-2">Everything side by side</h2>
          <p className="text-[#64748B] text-center text-sm mb-8">See exactly what you get with each plan.</p>

          <div className="bg-white rounded-2xl border border-[#E2E8F0]/80 overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]/80">
                  <th className="text-left px-6 py-4 text-[#64748B] font-medium w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#334155]">Free</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#6B8F71]">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Quotes saved", free: "25", pro: "Unlimited" },
                  { label: "Children profiles", free: "2", pro: "Unlimited" },
                  { label: "Family sharing", free: "—", pro: "Up to 6 members" },
                  { label: "Quote feed & search", free: "✓", pro: "✓" },
                  { label: "Favorites collection", free: "✓", pro: "✓" },
                  { label: "On This Day reminders", free: "✓", pro: "✓" },
                  { label: "TV Display Mode", free: "—", pro: "✓" },
                  { label: "Export to PDF book", free: "—", pro: "✓" },
                  { label: "Custom themes & fonts", free: "—", pro: "✓" },
                  { label: "Priority support", free: "—", pro: "✓" },
                ].map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-[#E2E8F0]/50 ${i % 2 === 0 ? "bg-[#FAFAF9]/50" : ""}`}
                  >
                    <td className="px-6 py-3.5 text-[#334155] font-medium">{row.label}</td>
                    <td className="px-6 py-3.5 text-center text-[#64748B]">{row.free}</td>
                    <td
                      className={`px-6 py-3.5 text-center font-medium ${
                        row.pro === "—" ? "text-[#94A3B8]" : "text-[#6B8F71]"
                      }`}
                    >
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust section */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-2xl px-8 py-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-[#E2E8F0]/80">
            <p className="font-[family-name:var(--font-playfair)] text-xl italic text-[#334155] mb-3">
              &ldquo;Worth every penny just for the PDF books alone. My kids&rsquo; grandparents cry every time they get one.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4A0A0] flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Sarah M.</p>
                <p className="text-xs text-[#64748B]">Mom of 3 · Pro member</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Yes. You can upgrade to Pro at any time and cancel whenever you want. If you cancel, you'll keep Pro access until the end of your billing period.",
              },
              {
                q: "What happens to my quotes if I downgrade?",
                a: "All your quotes are safe — we never delete them. If you have more than 25, they'll be stored but you won't be able to add new ones until you're back under the limit or on Pro.",
              },
              {
                q: "Is family sharing on the same account?",
                a: "Pro family sharing lets up to 6 people see and add quotes to the same family account. It's perfect for co-parents, grandparents, and caregivers.",
              },
              {
                q: "What does the PDF book look like?",
                a: "Beautiful. Each quote gets its own card with the child's name, age, and date. You can filter by child or date range. Makes an incredible printed gift.",
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-2xl p-6 border border-[#E2E8F0]/80">
                <h3 className="font-semibold text-[#334155] mb-2">{item.q}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0]/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-[#64748B]">
          <div className="flex items-center gap-2">
            <MessageCircleHeart className="w-5 h-5 text-[#6B8F71]" />
            <span className="font-semibold text-[#334155]">Quiplet</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Quiplet. Made with love for parents.</p>
        </div>
      </footer>
    </div>
  );
}


