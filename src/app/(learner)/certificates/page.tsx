'use client';

import { useEffect, useState } from 'react';
import {
  Award,
  Share2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, Spinner, Button, Badge, EmptyState } from '@/components/ui';
import type { Certificate } from '@/types';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await academyApi.get<any>('/learner/certificates');
        if (!cancelled) setCertificates(res.certificates || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load certificates');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleShare = async (cert: Certificate) => {
    const url = cert.share_url ?? `${window.location.origin}/certificates/${cert.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(cert.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Certificates you have earned by completing tracks.
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a track to earn your first certificate."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} hover>
              <div className="flex flex-col items-center gap-4 text-center">
                {/* Certificate icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                  <Award className="h-8 w-8 text-indigo-600" />
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{cert.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Issued {formatDate(cert.issued_at)}
                  </p>
                </div>

                {/* Status */}
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Earned
                </Badge>

                {/* Share */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(cert)}
                  className="w-full"
                >
                  {copiedId === cert.id ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Link Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
