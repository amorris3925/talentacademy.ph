#!/bin/bash
# Seed all 7 lessons in the AI Fundamentals track via Henry admin API
# Usage: bash scripts/seed-lessons.sh

API="https://henry.business/api/academy/admin/lessons"
KEY="hAWGvP-z3Cf2LuwcD5JP4EZVplR7xbMNWpnMpqualEc"
AUTH="Authorization: Bearer $KEY"
CT="Content-Type: application/json"

update_lesson() {
  local SLUG="$1"
  local DATA="$2"
  echo "Updating $SLUG..."
  curl -s -X PATCH "$API/$SLUG" -H "$AUTH" -H "$CT" -d "$DATA" | python3 -c "import json,sys; d=json.load(sys.stdin); print('  ->', d.get('message', d.get('title', 'ok')))" 2>/dev/null || echo "  -> sent"
}

# ─── Lesson 1: What is AI? ───────────────────────────────────────────────────
update_lesson "what-is-ai" "$(cat <<'ENDJSON'
{
  "content_blocks": [
    {
      "type": "markdown",
      "content": "<h2>What is Artificial Intelligence?</h2><p>AI is software that can learn from examples and make decisions — like a super-powered assistant that gets better the more you use it.</p><p>Think of it this way: a calculator does math faster than you. AI does <em>thinking tasks</em> faster than you — writing, analyzing, creating, and organizing.</p>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "AI is not a replacement for humans. It's a tool that amplifies what you can already do — like glasses amplify your vision.",
      "metadata": {"type": "tip"}
    },
    {
      "type": "markdown",
      "content": "<h3>What Can AI Actually Do?</h3><table><thead><tr><th>Task</th><th>Without AI</th><th>With AI</th></tr></thead><tbody><tr><td>Write an email</td><td>15 minutes</td><td>2 minutes</td></tr><tr><td>Summarize a report</td><td>30 minutes</td><td>30 seconds</td></tr><tr><td>Create a social post</td><td>20 minutes</td><td>1 minute</td></tr><tr><td>Analyze feedback</td><td>Hours</td><td>Minutes</td></tr></tbody></table>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>AI is Your Co-Worker, Not Your Boss</h3><p>The best way to think about AI:</p><ul><li><strong>You</strong> decide what needs to be done</li><li><strong>AI</strong> helps you do it faster and better</li><li><strong>You</strong> review and approve the output</li></ul><p>AI doesn't have opinions, feelings, or goals. It responds to what you ask. The quality of what you get depends on how well you communicate with it.</p>",
      "metadata": {}
    },
    {
      "type": "quiz",
      "content": "Which best describes AI?",
      "metadata": {
        "options": ["A replacement for human workers", "A tool that amplifies your capabilities", "A sentient being that thinks for itself", "Something only programmers can use"],
        "correct_index": 1,
        "explanation": "AI is a tool that amplifies what you can already do. Just like glasses help you see better, AI helps you think, write, and create faster. You're still in control — AI just makes you more productive."
      }
    },
    {
      "type": "prompts",
      "content": "",
      "metadata": {
        "prompts": [
          {"text": "Explain what AI is like I'm 5 years old", "label": "Explain like I'm 5"},
          {"text": "Give me 5 real-world examples of AI I use every day", "label": "Real-world examples"},
          {"text": "What can AI do better than humans? What can humans do better?", "label": "AI vs Human"}
        ]
      }
    }
  ],
  "ai_context": "First lesson. Student is brand new to AI. Be encouraging, use simple language, and reinforce that AI is a tool not a replacement."
}
ENDJSON
)"

# ─── Lesson 2: The AI Landscape ──────────────────────────────────────────────
update_lesson "ai-landscape" "$(cat <<'ENDJSON'
{
  "content_blocks": [
    {
      "type": "markdown",
      "content": "<h2>Meet the AI Tools</h2><p>There are many AI tools available today, each with different strengths. Think of them like different apps on your phone — each one is best at certain things.</p>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>Text AI — Your Writing Partners</h3><p>These tools help you write, analyze, and communicate:</p><ul><li><strong>ChatGPT</strong> (by OpenAI) — The most popular. Great for general tasks, brainstorming, and quick answers.</li><li><strong>Claude</strong> (by Anthropic) — Excellent at analysis, nuanced writing, and following complex instructions.</li><li><strong>Gemini</strong> (by Google) — Integrated with Google services. Great for research and working with Google Docs.</li></ul>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "You don't need to pick just one! Most professionals use 2-3 AI tools depending on the task. It's like having different apps for different needs.",
      "metadata": {"type": "info"}
    },
    {
      "type": "markdown",
      "content": "<h3>Visual AI — Your Creative Studio</h3><p>These tools generate images, videos, and visual content:</p><ul><li><strong>MiniMax</strong> — Built into this platform! Create images and videos right here.</li><li><strong>Midjourney</strong> — Known for stunning artistic and photorealistic images.</li><li><strong>DALL-E</strong> (by OpenAI) — Easy to use, great for quick visual concepts.</li></ul>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>When to Use What</h3><table><thead><tr><th>I need to...</th><th>Best tool</th></tr></thead><tbody><tr><td>Write a professional email</td><td>ChatGPT or Claude</td></tr><tr><td>Analyze a long document</td><td>Claude</td></tr><tr><td>Research with Google data</td><td>Gemini</td></tr><tr><td>Create marketing images</td><td>MiniMax or Midjourney</td></tr><tr><td>Generate a video clip</td><td>MiniMax</td></tr></tbody></table>",
      "metadata": {}
    },
    {
      "type": "quiz",
      "content": "You need to analyze a 50-page contract and summarize the key points. Which AI tool category would be most helpful?",
      "metadata": {
        "options": ["A visual AI like Midjourney", "A text AI like Claude or ChatGPT", "A music generation tool", "You shouldn't use AI for this"],
        "correct_index": 1,
        "explanation": "Text AI tools like Claude and ChatGPT excel at reading, analyzing, and summarizing long documents. Claude is especially strong at handling long documents with nuance. Visual AI tools create images — they can't read contracts!"
      }
    },
    {
      "type": "prompts",
      "content": "",
      "metadata": {
        "prompts": [
          {"text": "Compare ChatGPT vs Claude — what is each one best at?", "label": "ChatGPT vs Claude"},
          {"text": "What AI tools would help me in my daily work?", "label": "Tools for my work"},
          {"text": "How do I decide which AI tool to use for a task?", "label": "Choosing the right tool"}
        ]
      }
    }
  ],
  "ai_context": "Lesson about AI tools landscape. Help students understand which tools to use for which tasks. Keep it practical and relatable."
}
ENDJSON
)"

# ─── Lesson 3: Setup Your Workspace ──────────────────────────────────────────
update_lesson "setup-workspace" "$(cat <<'ENDJSON'
{
  "content_blocks": [
    {
      "type": "markdown",
      "content": "<h2>Setting Up Your AI Workspace</h2><p>Before you can start using AI effectively, you need to set up your tools. This lesson walks you through creating your first AI output using the tools built into this platform.</p>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "This platform has a built-in AI Studio where you can generate images, videos, audio, and music — all powered by AI. Let's try it out!",
      "metadata": {"type": "tip"}
    },
    {
      "type": "markdown",
      "content": "<h3>Step 1: Navigate to AI Studio</h3><p>Click <strong>AI Studio</strong> in the left sidebar. This is your creative workspace where you can generate content using AI.</p><h3>Step 2: Try Generating an Image</h3><p>In the AI Studio:</p><ol><li>Select the <strong>Image</strong> tab</li><li>Type a prompt like: <em>\"A futuristic office where humans and AI work together\"</em></li><li>Click <strong>Generate</strong></li><li>Wait a few seconds for your image to appear!</li></ol>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>Step 3: Understanding Prompts</h3><p>The text you type to tell AI what to create is called a <strong>prompt</strong>. Better prompts = better results.</p><p>Compare these two prompts:</p><ul><li><strong>Bad:</strong> <em>\"picture of office\"</em></li><li><strong>Good:</strong> <em>\"A modern, bright office with large windows, people collaborating at standing desks, warm lighting, professional photography style\"</em></li></ul><p>The more specific you are, the better AI understands what you want.</p>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "Don't worry about writing perfect prompts yet — we'll cover prompting in depth in the next module. For now, just experiment!",
      "metadata": {"type": "info"}
    },
    {
      "type": "quiz",
      "content": "Which prompt would produce a better AI-generated image?",
      "metadata": {
        "options": ["\"cat\"", "\"A fluffy orange cat sleeping in a sunbeam on a wooden floor, soft focus, warm colors\"", "\"make good image\"", "\"cat picture please\""],
        "correct_index": 1,
        "explanation": "Specific, descriptive prompts give AI much more to work with. Including details about subject, setting, style, colors, and mood helps AI generate exactly what you envision. 'cat' alone could produce anything!"
      }
    },
    {
      "type": "prompts",
      "content": "",
      "metadata": {
        "prompts": [
          {"text": "Help me write a prompt to generate a professional headshot", "label": "Write a prompt for me"},
          {"text": "What makes a good AI prompt vs a bad one?", "label": "Good vs bad prompts"},
          {"text": "What other things can I create in AI Studio?", "label": "What can I create?"}
        ]
      }
    }
  ],
  "ai_context": "Hands-on setup lesson. Encourage experimentation. Student should feel comfortable navigating the AI Studio after this lesson."
}
ENDJSON
)"

# ─── Lesson 4: Zero-Shot Prompting ───────────────────────────────────────────
update_lesson "zero-shot" "$(cat <<'ENDJSON'
{
  "content_blocks": [
    {
      "type": "markdown",
      "content": "<h2>Zero-Shot Prompting</h2><p><strong>Zero-shot prompting</strong> means giving AI a clear instruction without any examples. It's the simplest and most common way to use AI.</p><p>Think of it like asking a coworker to do something: <em>\"Write me a summary of this meeting.\"</em> You don't show them an example summary first — you just ask.</p>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>The Anatomy of a Good Zero-Shot Prompt</h3><p>Every effective prompt has these parts:</p><ol><li><strong>Role</strong> — Who should the AI act as?</li><li><strong>Task</strong> — What exactly do you want?</li><li><strong>Context</strong> — What background info does AI need?</li><li><strong>Format</strong> — How should the output look?</li></ol>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>Examples</h3><p><strong>Weak prompt:</strong></p><blockquote>Write about marketing.</blockquote><p><strong>Strong prompt:</strong></p><blockquote>You are a marketing strategist. Write 3 Instagram caption ideas for a coffee shop launching a new cold brew. Keep each under 150 characters. Use a friendly, casual tone.</blockquote><p>See the difference? The strong prompt has a role (marketing strategist), task (write captions), context (coffee shop, cold brew), and format (3 ideas, under 150 chars, casual tone).</p>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "Pro tip: If AI gives you a generic answer, your prompt was probably too vague. Add more specifics about the context, audience, or format you want.",
      "metadata": {"type": "tip"}
    },
    {
      "type": "quiz",
      "content": "Which is the strongest zero-shot prompt?",
      "metadata": {
        "options": [
          "Write an email",
          "You are an HR manager. Write a professional email to a candidate informing them they got the job. Include start date (April 15), salary ($50,000), and next steps. Keep it warm but professional.",
          "Write a good email about a job",
          "Email for job offer, make it nice"
        ],
        "correct_index": 1,
        "explanation": "The strong prompt includes a role (HR manager), specific task (job offer email), concrete details (start date, salary), and tone guidance (warm but professional). This gives AI everything it needs to produce exactly what you want on the first try."
      }
    },
    {
      "type": "prompts",
      "content": "",
      "metadata": {
        "prompts": [
          {"text": "Help me turn a vague prompt into a strong one", "label": "Improve my prompt"},
          {"text": "Give me 3 zero-shot prompt templates I can use daily", "label": "Prompt templates"},
          {"text": "What are common mistakes people make with prompts?", "label": "Common mistakes"}
        ]
      }
    }
  ],
  "ai_context": "Prompting fundamentals lesson. Help students understand the structure of effective prompts. Give practical, work-relevant examples."
}
ENDJSON
)"

# ─── Lesson 5: Few-Shot & Chain-of-Thought ───────────────────────────────────
update_lesson "few-shot-cot" "$(cat <<'ENDJSON'
{
  "content_blocks": [
    {
      "type": "markdown",
      "content": "<h2>Advanced Prompting: Few-Shot & Chain-of-Thought</h2><p>Now that you know zero-shot prompting, let's level up with two powerful techniques that get even better results from AI.</p>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>Few-Shot Prompting</h3><p><strong>Few-shot</strong> means giving AI 2-3 examples of what you want before asking it to produce more. It's like training someone by showing them: <em>\"Here's what good looks like — now make more like this.\"</em></p><p><strong>Example:</strong></p><blockquote>Here are examples of our product descriptions:<br/><br/>Product: Bamboo Water Bottle<br/>Description: Stay hydrated in style. Our eco-friendly bamboo bottle keeps drinks cold for 24 hours.<br/><br/>Product: Canvas Tote Bag<br/>Description: Carry everything beautifully. Our durable canvas tote fits your laptop, lunch, and life.<br/><br/>Now write a description for: Wireless Earbuds</blockquote>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "Few-shot prompting is perfect when you have a specific style, format, or tone you want AI to match. Show it examples, and it will follow the pattern.",
      "metadata": {"type": "tip"}
    },
    {
      "type": "markdown",
      "content": "<h3>Chain-of-Thought Prompting</h3><p><strong>Chain-of-thought</strong> means asking AI to think through a problem step by step before giving the answer. This produces much better results for complex tasks.</p><p><strong>Without chain-of-thought:</strong></p><blockquote>Should I hire a full-time employee or a contractor?</blockquote><p><strong>With chain-of-thought:</strong></p><blockquote>I need to decide between hiring a full-time employee or a contractor. Think through this step by step:<br/>1. Consider cost differences<br/>2. Consider flexibility needs<br/>3. Consider legal implications<br/>4. Consider our 6-month project timeline<br/>Then give me your recommendation with reasoning.</blockquote>",
      "metadata": {}
    },
    {
      "type": "quiz",
      "content": "When is few-shot prompting most useful?",
      "metadata": {
        "options": [
          "When you want AI to think step by step",
          "When you need AI to match a specific style or format you already have",
          "When you want the shortest possible response",
          "When you're asking a simple yes/no question"
        ],
        "correct_index": 1,
        "explanation": "Few-shot prompting shines when you have existing examples of the style, format, or tone you want. By showing AI 2-3 examples, it learns your pattern and produces consistent results that match your brand or preferences."
      }
    },
    {
      "type": "prompts",
      "content": "",
      "metadata": {
        "prompts": [
          {"text": "Show me how to use few-shot prompting for social media captions", "label": "Few-shot example"},
          {"text": "Help me solve a business problem using chain-of-thought", "label": "Chain-of-thought practice"},
          {"text": "When should I use few-shot vs chain-of-thought vs zero-shot?", "label": "Which technique to use?"}
        ]
      }
    }
  ],
  "ai_context": "Advanced prompting lesson. Build on zero-shot knowledge. Help students see when to use each technique with practical business examples."
}
ENDJSON
)"

# ─── Lesson 6: AI-Powered Research ───────────────────────────────────────────
update_lesson "ai-research" "$(cat <<'ENDJSON'
{
  "content_blocks": [
    {
      "type": "markdown",
      "content": "<h2>AI-Powered Research</h2><p>One of AI's biggest superpowers is helping you research and analyze information in minutes instead of hours. Let's learn how to use AI as your research assistant.</p>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>What AI Can Research For You</h3><ul><li><strong>Summarize</strong> — Condense long articles, reports, or documents into key points</li><li><strong>Compare</strong> — Analyze pros/cons of different options side by side</li><li><strong>Explain</strong> — Break down complex topics into simple language</li><li><strong>Extract</strong> — Pull specific data points from messy information</li></ul>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "Important: AI's knowledge has a cutoff date and can sometimes generate plausible-sounding but incorrect information (called 'hallucinations'). Always verify critical facts from AI with a trusted source.",
      "metadata": {"type": "warning"}
    },
    {
      "type": "markdown",
      "content": "<h3>Research Prompt Templates</h3><p><strong>For summarizing:</strong></p><blockquote>Summarize the following text in 5 bullet points, focusing on actionable takeaways: [paste text]</blockquote><p><strong>For comparing:</strong></p><blockquote>Compare [Option A] vs [Option B] for [your use case]. Create a table with: cost, ease of use, key features, and best for.</blockquote><p><strong>For analysis:</strong></p><blockquote>Analyze this customer feedback and identify the top 3 themes, with specific quotes as evidence: [paste feedback]</blockquote>",
      "metadata": {}
    },
    {
      "type": "quiz",
      "content": "Your boss sends you a 30-page industry report and asks for the key takeaways by end of day. What's the best AI approach?",
      "metadata": {
        "options": [
          "Ask AI to write a new report from scratch",
          "Paste sections into AI and ask it to summarize key points and actionable takeaways",
          "Ask AI to guess what's in the report based on the title",
          "AI can't help with this task"
        ],
        "correct_index": 1,
        "explanation": "AI excels at summarizing and extracting key points from existing text. By pasting the actual content and asking for specific outputs (key takeaways, action items), you get accurate, useful summaries in minutes instead of hours."
      }
    },
    {
      "type": "prompts",
      "content": "",
      "metadata": {
        "prompts": [
          {"text": "Help me create a research workflow for analyzing competitor websites", "label": "Research workflow"},
          {"text": "What are the limitations of using AI for research?", "label": "AI research limitations"},
          {"text": "Give me 5 research prompt templates I can save and reuse", "label": "Research templates"}
        ]
      }
    }
  ],
  "ai_context": "Research productivity lesson. Focus on practical research workflows. Emphasize the importance of verifying AI-generated information."
}
ENDJSON
)"

# ─── Lesson 7: Document Creation ─────────────────────────────────────────────
update_lesson "document-creation" "$(cat <<'ENDJSON'
{
  "content_blocks": [
    {
      "type": "markdown",
      "content": "<h2>AI-Powered Document Creation</h2><p>Creating professional documents — emails, reports, proposals, presentations — is one of the most practical daily uses of AI. Let's learn how to go from blank page to finished document in minutes.</p>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>The Document Creation Workflow</h3><ol><li><strong>Brief AI</strong> — Tell it what document you need, who it's for, and the key points</li><li><strong>Generate draft</strong> — Let AI create the first version</li><li><strong>Refine</strong> — Ask AI to adjust tone, length, or focus</li><li><strong>Polish</strong> — Make your final personal edits</li></ol><p>This workflow turns a 2-hour task into a 15-minute task.</p>",
      "metadata": {}
    },
    {
      "type": "markdown",
      "content": "<h3>Example: Writing a Project Proposal</h3><p><strong>Step 1 — Brief:</strong></p><blockquote>You are a project manager. Write a 1-page project proposal for redesigning our company website. Include: project goals, timeline (3 months), budget ($15,000), team needed, and expected outcomes. Tone: professional but persuasive. Audience: CEO who is skeptical about spending on design.</blockquote><p><strong>Step 2 — Refine:</strong></p><blockquote>Good start. Make the ROI section stronger — add specific metrics about how website redesigns typically increase conversions by 20-30%. Also make the budget section show cost breakdown.</blockquote>",
      "metadata": {}
    },
    {
      "type": "callout",
      "content": "The key to great AI documents: never accept the first draft. Always do at least one round of refinement. Tell AI specifically what to improve.",
      "metadata": {"type": "tip"}
    },
    {
      "type": "quiz",
      "content": "What's the most effective way to use AI for document creation?",
      "metadata": {
        "options": [
          "Accept whatever AI generates on the first try",
          "Brief AI with specifics, generate a draft, then refine and polish with follow-up prompts",
          "Write the document yourself then ask AI to check spelling",
          "Ask AI to write it without giving any context about audience or purpose"
        ],
        "correct_index": 1,
        "explanation": "The best results come from a multi-step workflow: give AI a detailed brief, generate a first draft, then iterate with specific feedback. This 'brief → draft → refine → polish' approach produces professional documents much faster than writing from scratch or accepting a generic first draft."
      }
    },
    {
      "type": "prompts",
      "content": "",
      "metadata": {
        "prompts": [
          {"text": "Help me write a professional email to a client about a project delay", "label": "Write a client email"},
          {"text": "Create a template I can reuse for weekly status reports", "label": "Status report template"},
          {"text": "What types of documents should I never fully delegate to AI?", "label": "AI document limits"}
        ]
      }
    }
  ],
  "ai_context": "Document creation lesson. Focus on the iterative workflow: brief, generate, refine, polish. Help students see how to turn AI outputs into professional documents."
}
ENDJSON
)"

echo ""
echo "Done! All 7 lessons updated."
