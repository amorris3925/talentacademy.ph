import Link from 'next/link'
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Brain,
  Palette,
  Megaphone,
  Settings,
  Trophy,
  Star,
  ChevronRight,
  ArrowRight,
  Zap,
  Users,
  Target,
} from 'lucide-react'

const tracks = [
  {
    icon: Brain,
    title: 'AI Fundamentals',
    description: 'Master prompting, productivity workflows, and the AI mindset.',
    duration: '3 weeks',
    color: 'bg-blue-500',
    required: true,
  },
  {
    icon: Palette,
    title: 'Graphic Design & Visual',
    description: 'Create stunning images, videos, and brand identities with AI.',
    duration: '5 weeks',
    color: 'bg-purple-500',
  },
  {
    icon: Megaphone,
    title: 'Marketing & Content',
    description: 'Write copy, build campaigns, and dominate social media with AI.',
    duration: '5 weeks',
    color: 'bg-orange-500',
  },
  {
    icon: Settings,
    title: 'Operations & Systems',
    description: 'Build automations, internal tools, and scalable processes.',
    duration: '5 weeks',
    color: 'bg-green-500',
  },
]

const steps = [
  { icon: GraduationCap, title: 'Register', description: 'Sign up free — takes 2 minutes' },
  { icon: Brain, title: 'Learn', description: 'Interactive lessons with an AI tutor by your side' },
  { icon: Sparkles, title: 'Build', description: 'Create real projects for your portfolio' },
  { icon: Briefcase, title: 'Get Hired', description: 'Top performers connect with employers' },
]

const faqs = [
  {
    q: 'Is it really free?',
    a: 'Yes. The entire training program is 100% free. We make money by connecting top talent with employers, not by charging learners.',
  },
  {
    q: 'What tools do I need?',
    a: 'Just a computer or phone with internet access. All AI tools are built into the platform — no subscriptions required.',
  },
  {
    q: 'How long does it take?',
    a: 'The Foundation Track takes 3 weeks. Each Specialty Track adds 5 more weeks. You can go at your own pace.',
  },
  {
    q: 'Do I get a certificate?',
    a: 'Yes! You earn shareable micro-certifications at each milestone — perfect for LinkedIn and job applications.',
  },
  {
    q: 'What if I have no AI experience?',
    a: 'That\'s exactly who this is for. We start from zero and build up. All you need is curiosity and a willingness to learn.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">AI Talent Academy</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Start Free Training
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-amber-400" />
              100% Free — No credit card required
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Master AI.
              <br />
              <span className="text-amber-400">Get Hired.</span>
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl">
              Free AI training designed for Filipino virtual assistants. Learn to use AI tools,
              build a portfolio of real projects, and get connected with employers looking for
              AI-skilled talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-base font-bold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-colors"
              >
                Start Free Training
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#tracks"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                View Tracks
                <ChevronRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why AI Talent Academy?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We don&apos;t just teach AI — we build your career.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Learn AI Tools',
                desc: 'Hands-on training with ChatGPT, Claude, Midjourney, and 20+ tools. An AI tutor helps you every step of the way.',
                color: 'text-blue-600 bg-blue-100',
              },
              {
                icon: Target,
                title: 'Build a Portfolio',
                desc: 'Create real projects — images, videos, marketing campaigns, automations. Graduate with proof of your skills.',
                color: 'text-purple-600 bg-purple-100',
              },
              {
                icon: Briefcase,
                title: 'Get Hired',
                desc: 'Top performers are matched with employers and headhunters. Your scores and portfolio speak for themselves.',
                color: 'text-green-600 bg-green-100',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className={`rounded-xl p-3 mb-5 ${item.color}`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Overview */}
      <section id="tracks" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Track
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start with the required Foundation Track, then specialize in your area of interest.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tracks.map((track) => (
              <div
                key={track.title}
                className="relative flex flex-col p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                {track.required && (
                  <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    Required
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl ${track.color} flex items-center justify-center mb-4`}>
                  <track.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{track.title}</h3>
                <p className="text-gray-600 mb-4 flex-1">{track.description}</p>
                <p className="text-sm font-medium text-gray-500">{track.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Four steps to a new career.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Level Up as You Learn
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Earn XP, unlock badges, climb the leaderboard, and track your progress — all while
              building real AI skills.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Star, label: 'Earn XP', desc: 'Every lesson, exercise, and project earns you experience points', color: 'text-amber-500' },
              { icon: Trophy, label: 'Earn Badges', desc: '12+ badges for achievements, streaks, skills, and leadership', color: 'text-indigo-500' },
              { icon: Users, label: 'Compete', desc: 'Weekly and all-time leaderboards by cohort and track', color: 'text-green-500' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                <item.icon className={`h-10 w-10 ${item.color} mb-3`} />
                <h3 className="font-bold text-gray-900 mb-1">{item.label}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Master AI?</h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join thousands of Filipino VAs building their AI skills. It&apos;s free, it&apos;s
            interactive, and it could change your career.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-bold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-colors"
          >
            Start Free Training
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span className="font-semibold text-white">AI Talent Academy</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} AI Talent Academy</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
