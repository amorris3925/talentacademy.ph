'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { academyApi } from '@/lib/api';

const workTypeOptions = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'seo', label: 'SEO' },
  { value: 'content writing', label: 'Content Writing' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'product management', label: 'Product Management' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'HR / Recruitment' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const learner = useAuthStore((s) => s.learner);

  const [workType, setWorkType] = useState(learner?.work_type || '');
  const [specialization, setSpecialization] = useState(learner?.specialization || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already completed
  if (learner?.work_type) {
    router.replace('/dashboard');
    return null;
  }

  async function handleSubmit() {
    if (!workType) return;
    setIsSaving(true);
    setError('');

    try {
      await academyApi.patch('/settings', {
        work_type: workType,
        specialization: specialization || null,
      });
      await refreshProfile();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-12 px-4">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
          <Sparkles className="h-7 w-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Personalize Your Experience</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tell us about your work so we can tailor AI tool suggestions and lesson prompts to your needs.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="onboard-workType" className="block text-sm font-medium text-gray-700 mb-1.5">
              What type of work do you do? *
            </label>
            <select
              id="onboard-workType"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select your field</option>
              {workTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="onboard-specialization" className="block text-sm font-medium text-gray-700 mb-1.5">
              What&apos;s your specialization? (optional)
            </label>
            <input
              id="onboard-specialization"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Technical SEO, UI Design, Data Analysis"
            />
            <p className="mt-1 text-xs text-gray-400">
              This helps us tailor AI tool suggestions to your specific needs
            </p>
          </div>

          {workType && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-medium text-indigo-800">Great choice!</p>
              </div>
              <p className="text-xs text-indigo-600">
                We&apos;ll customize your lesson prompts and AI suggestions for {workType}{specialization ? ` (${specialization})` : ''}.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!workType || isSaving}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Save & Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
