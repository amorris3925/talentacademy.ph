'use client';

import { useState } from 'react';
import { Image as ImageIcon, Video, Mic, Music } from 'lucide-react';
import { Tabs } from '@/components/ui';
import { ImageGenerator } from './ImageGenerator';
import { VideoGenerator } from './VideoGenerator';
import { AudioGenerator } from './AudioGenerator';
import { MusicGenerator } from './MusicGenerator';

const tabs = [
  { key: 'image', label: 'Image', icon: <ImageIcon className="h-4 w-4" /> },
  { key: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { key: 'audio', label: 'Audio', icon: <Mic className="h-4 w-4" /> },
  { key: 'music', label: 'Music', icon: <Music className="h-4 w-4" /> },
];

export function GenerationStudio() {
  const [activeTab, setActiveTab] = useState('image');

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-6">
        {activeTab === 'image' && <ImageGenerator />}
        {activeTab === 'video' && <VideoGenerator />}
        {activeTab === 'audio' && <AudioGenerator />}
        {activeTab === 'music' && <MusicGenerator />}
      </div>
    </div>
  );
}
