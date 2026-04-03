'use client';

import { Rocket } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { formatXp } from '@/lib/utils';
import { Card, Badge, ProgressBar } from '@/components/ui';

export default function IncubatorPage() {
  const learner = useAuthStore((s) => s.learner);

  const xpNeeded = 5000;
  const currentXp = learner?.xp_total ?? 0;
  const progress = Math.min((currentXp / xpNeeded) * 100, 100);

  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
        <Rocket className="h-8 w-8 text-indigo-600" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900">App Incubator</h1>
      <p className="mb-2 text-lg font-medium text-indigo-600">Coming Soon</p>
      <p className="mb-6 text-gray-600">
        The App Incubator is for top performers who have reached <strong>Expert level</strong>{' '}
        (5,000 XP). Build production-ready web apps, get assigned project briefs, and earn
        profit-sharing on revenue. This feature is currently under development.
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
