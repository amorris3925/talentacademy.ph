'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, Image as ImageIcon, Video, Clock, FileText } from 'lucide-react';
import { Tabs } from '@/components/ui';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
  </div>
);

const TextGenerator = dynamic(
  () => import('./TextGenerator').then((m) => m.TextGenerator),
  { ssr: false, loading: LoadingSpinner }
);
const ImageGenerator = dynamic(
  () => import('./ImageGenerator').then((m) => m.ImageGenerator),
  { ssr: false, loading: LoadingSpinner }
);
const VideoGenerator = dynamic(
  () => import('./VideoGenerator').then((m) => m.VideoGenerator),
  { ssr: false, loading: LoadingSpinner }
);
const GenerationHistory = dynamic(
  () => import('./GenerationHistory').then((m) => m.GenerationHistory),
  { ssr: false, loading: LoadingSpinner }
);
const ArtifactsTab = dynamic(
  () => import('./ArtifactsTab').then((m) => m.ArtifactsTab),
  { ssr: false, loading: LoadingSpinner }
);

const tabs = [
  { key: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'image', label: 'Image', icon: <ImageIcon className="h-4 w-4" /> },
  { key: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { key: 'artifacts', label: 'Artifacts', icon: <FileText className="h-4 w-4" /> },
  { key: 'history', label: 'My Creations', icon: <Clock className="h-4 w-4" /> },
];

export function GenerationStudio() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-6">
        {activeTab === 'chat' && <TextGenerator />}
        {activeTab === 'image' && <ImageGenerator />}
        {activeTab === 'video' && <VideoGenerator />}
        {activeTab === 'artifacts' && <ArtifactsTab />}
        {activeTab === 'history' && <GenerationHistory />}
      </div>
    </div>
  );
}
