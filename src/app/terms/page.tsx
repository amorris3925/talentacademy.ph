import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">AI Talent Academy</span>
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms of Service</h1>

        <div className="prose prose-gray max-w-none rounded-xl border border-gray-200 bg-white p-8">
          <p className="text-gray-600">
            These Terms of Service govern your use of AI Talent Academy. By accessing or using our
            platform, you agree to be bound by these terms.
          </p>

          <h2>1. Use of Service</h2>
          <p>
            AI Talent Academy provides an online learning platform for talent development. You must
            be at least 16 years old to create an account and use the service.
          </p>

          <h2>2. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account.
          </p>

          <h2>3. Content</h2>
          <p>
            All course materials, AI-generated content, and platform features are provided for
            educational purposes. You may not redistribute or resell any content from the platform.
          </p>

          <h2>4. AI-Generated Content</h2>
          <p>
            Content generated through AI tools on our platform is provided as-is for learning
            purposes. You retain rights to content you create using our AI tools, subject to our
            acceptable use policies.
          </p>

          <h2>5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or engage
            in disruptive behavior.
          </p>

          <p className="mt-8 text-sm text-gray-400">
            Last updated: April 2026. This is a placeholder document and will be updated with full
            legal terms.
          </p>
        </div>
      </div>
    </div>
  );
}
