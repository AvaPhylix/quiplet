import Link from "next/link";
import { MessageCircleHeart, Sparkles, Heart, Tv, Search, CalendarHeart } from "lucide-react";

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#E2E8F0]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircleHeart className="w-7 h-7 text-[#6B8F71]" />
            <span className="text-xl font-bold tracking-tight">Quiplet</span>
          </div>
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 bg-[#6B8F71]/10 text-[#6B8F71] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <Sparkles className="w-4 h-4" />
          Capture memories that matter
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          The funny things kids say<br />
          <span className="text-[#6B8F71]">deserve to be remembered</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto mb-10 leading-relaxed">
          Quiplet is a beautiful digital scrapbook that helps parents capture, search, and
          relive the hilarious and heartwarming quotes their children say every day.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-[#6B8F71] text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-[#5A7D60] transition-all hover:shadow-lg hover:shadow-[#6B8F71]/20"
          >
            Start Your Scrapbook — Free
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto text-[#64748B] px-8 py-3.5 rounded-xl text-base font-medium border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors"
          >
            See How It Works
          </Link>
        </div>

        {/* Example quote */}
        <div className="mt-16 max-w-md mx-auto bg-white rounded-2xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.06)] rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
          <p className="font-[family-name:var(--font-playfair)] text-2xl italic text-[#334155] leading-relaxed mb-4">
            &ldquo;Daddy, if you eat too many cookies, will your tummy turn into a cookie?&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C4B5E0] flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Emma</p>
              <p className="text-xs text-[#64748B]">Age 4 years, 2 months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything you need to treasure every word
          </h2>
          <p className="text-[#64748B] text-center mb-14 max-w-xl mx-auto">
            From quick capture to full-screen slideshow, Quiplet makes remembering effortless.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MessageCircleHeart className="w-8 h-8 text-[#6B8F71]" />}
              title="Quick Capture"
              desc="Tap the floating button, type the quote, pick the child, and save. It takes seconds before the moment fades."
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-[#D4A0A0]" />}
              title="Favorites & Tags"
              desc="Heart your best quotes for a Hall of Fame collection. Add tags to organize by theme — bath time, dinnertime, car rides."
            />
            <FeatureCard
              icon={<Search className="w-8 h-8 text-[#C8956C]" />}
              title="Smart Search"
              desc="Find any quote instantly. Filter by child, date range, tags, or just search for keywords you remember."
            />
            <FeatureCard
              icon={<Tv className="w-8 h-8 text-[#6B8F71]" />}
              title="TV Display Mode"
              desc="Cast your favorites to the big screen. A gorgeous, auto-advancing slideshow perfect for family gatherings."
            />
            <FeatureCard
              icon={<CalendarHeart className="w-8 h-8 text-[#D4A0A0]" />}
              title="On This Day"
              desc="Get delightful reminders of what your kids said on this day in previous years. Pure nostalgia."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-[#C8956C]" />}
              title="Beautiful Design"
              desc="Every detail is crafted to feel premium. Elegant typography, warm colors, and smooth animations throughout."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start capturing today
          </h2>
          <p className="text-[#64748B] mb-8 text-lg">
            They grow up fast. The quotes disappear even faster. Give every funny, sweet, and
            ridiculous thing your kid says a permanent home.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#6B8F71] text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-[#5A7D60] transition-all hover:shadow-lg hover:shadow-[#6B8F71]/20"
          >
            Create Your Free Account
          </Link>
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
