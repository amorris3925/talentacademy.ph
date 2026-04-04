'use client';

interface ArtifactEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function ArtifactEditor({ content, onChange }: ArtifactEditorProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-2">
        <p className="text-xs font-medium text-gray-500">Markdown Editor</p>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[500px] resize-y p-4 text-sm font-mono text-gray-800 focus:outline-none"
        placeholder="Write your content in Markdown..."
      />
    </div>
  );
}
