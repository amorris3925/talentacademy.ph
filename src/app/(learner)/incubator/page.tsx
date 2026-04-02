'use client';

import { useEffect, useState } from 'react';
import { Rocket, Lock, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { academyApi } from '@/lib/api';
import { formatXp, formatDate } from '@/lib/utils';
import { Card, Spinner, Badge, Button, EmptyState, ProgressBar } from '@/components/ui';

interface IncubatorProject {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'review';
  created_at: string;
}

export default function IncubatorPage() {
  const learner = useAuthStore((s) => s.learner);
  const isEligible = learner && (learner.level === 'expert' || learner.level === 'master');

  const [projects, setProjects] = useState<IncubatorProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEligible) return;
    setLoading(true);
    academyApi
      .get<IncubatorProject[]>('/incubator/projects')
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isEligible]);

  const handleSubmitProposal = async () => {
    if (!proposalTitle.trim() || !proposalDescription.trim()) return;
    setSubmitting(true);
    try {
      await academyApi.post('/incubator/proposals', {
        title: proposalTitle.trim(),
        description: proposalDescription.trim(),
      });
      setProposalTitle('');
      setProposalDescription('');
      setShowApplyForm(false);
      // Refresh projects
      const updated = await academyApi.get<IncubatorProject[]>('/incubator/projects');
      setProjects(updated);
    } catch {
      // Silently handle — Phase 5 placeholder
    } finally {
      setSubmitting(false);
    }
  };

  // Locked state
  if (!isEligible) {
    const xpNeeded = 5000;
    const currentXp = learner?.xp_total ?? 0;
    const progress = Math.min((currentXp / xpNeeded) * 100, 100);

    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Lock className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">App Incubator</h1>
        <p className="mb-6 text-gray-600">
          The App Incubator is for top performers who have reached <strong>Expert level</strong>{' '}
          (5,000 XP). Build production-ready web apps, get assigned project briefs, and earn
          profit-sharing on revenue.
        </p>

        <Card className="mx-auto max-w-md text-left">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Your Progress</span>
                <span className="text-gray-500">
                  {formatXp(currentXp)} / {formatXp(xpNeeded)}
                </span>
              </div>
              <ProgressBar value={progress} color="bg-indigo-600" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Current Level</span>
              <Badge variant="info" className="capitalize">
                {learner?.level ?? 'beginner'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Required Level</span>
              <Badge variant="warning">Expert</Badge>
            </div>
          </div>
        </Card>

        <div className="mt-8 rounded-xl bg-indigo-50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-indigo-900">How to unlock:</h3>
          <ul className="space-y-1 text-sm text-indigo-700">
            <li>1. Complete tracks and earn XP from lessons</li>
            <li>2. Maintain your daily streak for bonus XP</li>
            <li>3. Earn badges for extra XP rewards</li>
            <li>4. Help peers in the community for XP bonuses</li>
          </ul>
        </div>
      </div>
    );
  }

  // Eligible state
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Incubator</h1>
          <p className="text-sm text-gray-500">Build production apps and earn profit-sharing.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Submit Proposal */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Submit a Proposal</h2>
          {showApplyForm ? (
            <div className="space-y-3">
              <input
                type="text"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                placeholder="Project title"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                placeholder="Describe your app idea, target users, and key features..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  onClick={handleSubmitProposal}
                  disabled={!proposalTitle.trim() || !proposalDescription.trim()}
                >
                  Submit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowApplyForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">
                Have an app idea? Submit a proposal for review. If approved, you will get a full
                coding workspace and mentorship.
              </p>
              <Button variant="primary" size="sm" onClick={() => setShowApplyForm(true)}>
                <FileText className="h-4 w-4" />
                Submit Proposal
              </Button>
            </>
          )}
        </Card>

        {/* Available Briefs */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Available Briefs</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" className="text-indigo-600" />
            </div>
          ) : projects.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">
              No project briefs available yet. Check back soon or submit your own proposal.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{project.description}</p>
                  </div>
                  <Badge
                    variant={
                      project.status === 'open'
                        ? 'success'
                        : project.status === 'in_progress'
                          ? 'info'
                          : 'default'
                    }
                    className="capitalize"
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
