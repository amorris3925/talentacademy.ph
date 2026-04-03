interface Prompt {
  label: string;
  text: string;
}

const WORK_TYPE_PROMPTS: Record<string, Prompt[]> = {
  marketing: [
    { label: 'AI for my campaigns', text: 'How can I use AI to improve my marketing campaigns?' },
    { label: 'Content ideas', text: 'Help me brainstorm content ideas using AI for marketing' },
    { label: 'Audience analysis', text: 'How can AI help me understand my target audience better?' },
  ],
  seo: [
    { label: 'AI for SEO', text: 'What AI tools are most helpful for SEO work?' },
    { label: 'Keyword research', text: 'How can I use AI for keyword research and analysis?' },
    { label: 'Content optimization', text: 'How can AI help me optimize content for search engines?' },
  ],
  'content writing': [
    { label: 'AI writing tools', text: 'What are the best AI tools for content writing?' },
    { label: 'Improve my writing', text: 'How can AI help me write better and faster?' },
    { label: 'Editing with AI', text: 'How can I use AI to edit and refine my content?' },
  ],
  design: [
    { label: 'AI for design', text: 'What AI tools can help with my design workflow?' },
    { label: 'Generate visuals', text: 'How can I use AI to create images and graphics for my projects?' },
    { label: 'Design inspiration', text: 'How can AI help me find design inspiration and references?' },
  ],
  development: [
    { label: 'AI coding tools', text: 'What AI tools can help me write better code?' },
    { label: 'Debug with AI', text: 'How can I use AI to debug and troubleshoot code?' },
    { label: 'Automate tasks', text: 'What development tasks can AI automate for me?' },
  ],
  'product management': [
    { label: 'AI for product', text: 'How can AI help with product management decisions?' },
    { label: 'User research', text: 'How can I use AI to analyze user feedback and research?' },
    { label: 'Roadmap planning', text: 'How can AI assist with product roadmap planning?' },
  ],
  sales: [
    { label: 'AI for sales', text: 'How can AI help me improve my sales process?' },
    { label: 'Lead generation', text: 'What AI tools can help with lead generation?' },
    { label: 'Sales outreach', text: 'How can AI help me personalize sales outreach?' },
  ],
  hr: [
    { label: 'AI for HR', text: 'How can AI help with HR and recruitment tasks?' },
    { label: 'Resume screening', text: 'How can I use AI to improve the hiring process?' },
    { label: 'Employee engagement', text: 'How can AI help with employee engagement and training?' },
  ],
  finance: [
    { label: 'AI for finance', text: 'What AI tools are useful for financial analysis?' },
    { label: 'Data analysis', text: 'How can AI help me analyze financial data?' },
    { label: 'Report generation', text: 'How can I use AI to automate financial reporting?' },
  ],
  education: [
    { label: 'AI for teaching', text: 'How can AI help me as an educator?' },
    { label: 'Create materials', text: 'How can I use AI to create learning materials?' },
    { label: 'Student engagement', text: 'How can AI help improve student engagement?' },
  ],
};

export function getPersonalizedPrompts(
  basePrompts: Prompt[],
  workType: string | null | undefined,
  specialization: string | null | undefined,
  lessonTitle?: string,
): Prompt[] {
  if (!workType) return basePrompts;

  const key = workType.toLowerCase();
  const personalizedPrompts = WORK_TYPE_PROMPTS[key];

  if (!personalizedPrompts) return basePrompts;

  // Mix: keep 1 base prompt if available, add 2 personalized ones
  const result: Prompt[] = [];

  if (basePrompts.length > 0) {
    result.push(basePrompts[0]);
  }

  // Add up to 2 personalized prompts
  result.push(...personalizedPrompts.slice(0, 2));

  // If specialization is set, customize the last prompt
  if (specialization && result.length > 0) {
    const last = result[result.length - 1];
    result[result.length - 1] = {
      label: last.label,
      text: last.text.replace(/\?$/, ` specifically for ${specialization}?`),
    };
  }

  return result;
}

export function getPersonalizedGhostPrompts(
  workType: string | null | undefined,
  specialization: string | null | undefined,
  lessonTitle?: string,
): string[] {
  const context = specialization || workType;

  if (context && lessonTitle) {
    return [
      `How does "${lessonTitle}" apply to ${context}?`,
      `Give me a ${context}-focused practice exercise`,
      'What should I focus on in this lesson?',
    ];
  }

  if (context) {
    return [
      `How can I apply this to my work in ${context}?`,
      'Give me a practical example I can try',
      'Quiz me on what I just learned',
    ];
  }

  return [
    'Explain this concept simply',
    'Give me a real-world example',
    'Quiz me on what I just learned',
  ];
}
