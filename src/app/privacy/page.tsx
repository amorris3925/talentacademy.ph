import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">AI Talent Academy</span>
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none rounded-xl border border-gray-200 bg-white p-8">
          <p className="text-gray-600">
            This Privacy Policy describes how AI Talent Academy collects, uses, and protects your
            personal information.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name, email address, and
            profile details when you create an account. We also collect usage data including lesson
            progress, AI generation history, and platform interactions.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is used to provide and improve our learning platform, personalize your
            experience, track your progress, and communicate updates about the service.
          </p>

          <h2>3. AI and Data Processing</h2>
          <p>
            Prompts and content you submit to AI tools are processed to generate responses. We may
            use anonymized usage patterns to improve our AI features.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information.
            Your data is stored securely and access is restricted to authorized personnel.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time
            through your account settings or by contacting us.
          </p>

          <h2>6. Contact</h2>
          <p>
            For privacy-related inquiries, please contact us through the platform.
          </p>

          <p className="mt-8 text-sm text-gray-400">
            Last updated: April 2026. This is a placeholder document and will be updated with a
            full privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
