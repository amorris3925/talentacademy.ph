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

/**
 * Generate personalized prompt chips for lessons.
 *
 * Strategy: specialization is the primary identity (e.g. "SEO"),
 * work_type is the fallback (e.g. "Marketing"). All prompts are
 * rewritten to reference the user's field directly.
 */
export function getPersonalizedPrompts(
  basePrompts: Prompt[],
  workType: string | null | undefined,
  specialization: string | null | undefined,
  lessonTitle?: string,
): Prompt[] {
  const field = specialization || workType;

  if (!field) {
    return basePrompts.length > 0 ? basePrompts : [
      { label: 'Explain this', text: 'Can you explain this concept simply?' },
      { label: 'Real-world example', text: 'Give me a real-world example' },
      { label: 'Practice exercise', text: 'Give me a practice exercise for this topic' },
    ];
  }

  // Build prompts that are ALL specific to the user's field
  const result: Prompt[] = [];

  // First: lesson-contextualized prompt using their specialization
  if (lessonTitle) {
    result.push({
      label: `${field} application`,
      text: `How can I apply "${lessonTitle}" specifically to my work in ${field}?`,
    });
  } else {
    result.push({
      label: `Apply to ${field}`,
      text: `How can I apply this lesson to my work in ${field}?`,
    });
  }

  // Second: try to find a matching set from WORK_TYPE_PROMPTS
  // Prefer specialization key, then work_type key
  const specKey = specialization?.toLowerCase();
  const workKey = workType?.toLowerCase();
  const matchedPrompts = (specKey && WORK_TYPE_PROMPTS[specKey]) || (workKey && WORK_TYPE_PROMPTS[workKey]);

  if (matchedPrompts) {
    // Pick the most relevant one (not the first — that's usually generic "AI for X")
    result.push(matchedPrompts[1] || matchedPrompts[0]);
  } else {
    // No match — generate a dynamic one
    result.push({
      label: `AI tools for ${field}`,
      text: `What AI tools are most useful for someone working in ${field}?`,
    });
  }

  // Third: a practice-oriented prompt specific to them
  result.push({
    label: `${field} exercise`,
    text: `Give me a hands-on practice exercise related to ${field} using what I learned in this lesson`,
  });

  return result;
}

/**
 * Ghost prompts shown in the chat sidebar when no messages yet.
 * Always personalized to the user's specialization/work type.
 */
export function getPersonalizedGhostPrompts(
  workType: string | null | undefined,
  specialization: string | null | undefined,
  lessonTitle?: string,
): string[] {
  const field = specialization || workType;

  if (field && lessonTitle) {
    return [
      `How does "${lessonTitle}" apply to ${field}?`,
      `Give me a ${field}-focused practice exercise for this lesson`,
      `What's the most important takeaway here for someone in ${field}?`,
    ];
  }

  if (field) {
    return [
      `How can I apply this to my work in ${field}?`,
      `Give me a ${field}-specific example`,
      'Quiz me on what I just learned',
    ];
  }

  return [
    'Explain this concept simply',
    'Give me a real-world example',
    'Quiz me on what I just learned',
  ];
}
