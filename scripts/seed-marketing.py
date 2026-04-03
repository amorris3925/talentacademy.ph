#!/usr/bin/env python3
"""Seed the 'AI Marketing & Content' track with 5 modules and 12 lessons via Supabase REST API."""

import json
import urllib.request

SUPABASE_URL = "https://szdpzjlhbkytonuhlwif.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZHB6amxoYmt5dG9udWhsd2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI5ODgwNCwiZXhwIjoyMDg0ODc0ODA0fQ.K-vQBAvsZU7T3MVYCzG1SIL_IlWNO2rvzTN_WyFNYVM"

TRACK_ID = "2e2143b4-26cd-43e2-9046-44d7e18b2c5f"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# ---------------------------------------------------------------------------
# Modules (5 weeks)
# ---------------------------------------------------------------------------
MODULES = [
    {
        "track_id": TRACK_ID,
        "title": "Copywriting Fundamentals",
        "slug": "copywriting-fundamentals",
        "description": "Learn the foundations of marketing copy and how AI supercharges every step — from headlines to CTAs.",
        "week_number": 1,
        "sort_order": 1,
    },
    {
        "track_id": TRACK_ID,
        "title": "Social Media & Content Strategy",
        "slug": "social-media-strategy",
        "description": "Master platform-specific content strategy and use AI to plan, create, and visualize marketing content at scale.",
        "week_number": 2,
        "sort_order": 2,
    },
    {
        "track_id": TRACK_ID,
        "title": "Email Marketing & SEO",
        "slug": "email-and-seo",
        "description": "Build high-converting email sequences and optimize content for search engines — all with AI assistance.",
        "week_number": 3,
        "sort_order": 3,
    },
    {
        "track_id": TRACK_ID,
        "title": "Brand Voice & Analytics",
        "slug": "brand-analytics",
        "description": "Define your brand voice, train AI to write in it, and learn to read marketing data that drives real decisions.",
        "week_number": 4,
        "sort_order": 4,
    },
    {
        "track_id": TRACK_ID,
        "title": "Campaign Planning & Execution",
        "slug": "campaign-planning",
        "description": "Plan, launch, and optimize full marketing campaigns using AI at every stage — from brief to performance review.",
        "week_number": 5,
        "sort_order": 5,
    },
]

# ---------------------------------------------------------------------------
# Lessons (12 total, keyed by module slug)
# ---------------------------------------------------------------------------
LESSONS = {
    "copywriting-fundamentals": [
        # Lesson 1
        {
            "title": "The Marketing Mindset",
            "slug": "marketing-mindset",
            "description": "Understand what marketing really is — and how AI helps you think like a marketer from day one.",
            "xp_reward": 10,
            "passing_score": 70,
            "time_limit_minutes": 15,
            "sort_order": 1,
            "ai_context": "First marketing lesson. Student may be new to marketing entirely. Focus on shifting from feature-thinking to benefit-thinking. Encourage them to use the chatbot to brainstorm customer personas and value propositions. Use Philippine market examples when possible.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["What would a customer actually care about?", "Help me think about this from the buyer's perspective."],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>What Is Marketing, Really?</h2><p>Marketing is not about shouting about your product. It's about <strong>understanding what people want</strong> and showing them how you can deliver it.</p><p>The best marketers don't start with their product — they start with the <em>customer's problem</em>. Every successful Filipino brand you know — Jollibee, Grab, GCash — got big because they understood a real need first.</p><h3>Features vs. Benefits</h3><p>This is the single most important distinction in marketing:</p><table><thead><tr><th>Feature (What It Is)</th><th>Benefit (Why They Care)</th></tr></thead><tbody><tr><td>256GB storage</td><td>Never worry about running out of space for photos</td></tr><tr><td>Free delivery</td><td>Save time and money — it comes to your door</td></tr><tr><td>24/7 customer support</td><td>Get help anytime, even at 2 AM when it matters most</td></tr><tr><td>AI-powered recommendations</td><td>Find exactly what you want without endless scrolling</td></tr></tbody></table><p>Features describe the product. Benefits describe the customer's life <em>after</em> using the product. Great marketing always leads with benefits.</p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Every time you write marketing copy, ask yourself: 'So what?' If the customer can read your message and ask 'so what?', you're writing features, not benefits.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Target Audience Thinking</h3><p>You can't market to everyone. The most effective marketing speaks to a <strong>specific person</strong> with a specific problem.</p><p>A <strong>customer persona</strong> is a detailed profile of your ideal buyer:</p><ul><li><strong>Demographics</strong> — Age, location, income, job title</li><li><strong>Pain points</strong> — What frustrates them? What keeps them up at night?</li><li><strong>Goals</strong> — What are they trying to achieve?</li><li><strong>Behavior</strong> — Where do they spend time online? What do they read?</li></ul><p>Example: Instead of targeting 'business owners', target 'Maria, 32, who runs a small online clothing shop on Shopee and struggles to write product descriptions that convert.'</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>How AI Supercharges Marketing Thinking</h3><p>AI is your brainstorming partner. It can:</p><ul><li>Generate customer personas in seconds based on your product description</li><li>Rewrite features as benefits instantly</li><li>Test different marketing angles before you spend a single peso</li><li>Think through objections your customers might have</li></ul><p>Instead of staring at a blank page, you start with a draft. Instead of guessing what resonates, you test with AI first.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "You're marketing a new milk tea shop in Makati that uses high-quality Taiwanese tea leaves. Your target audience is young professionals aged 22-30 who work in BGC. Which marketing angle would resonate most?",
                    "metadata": {
                        "options": [
                            "We use premium Taiwanese tea leaves imported directly from Alishan mountain",
                            "Upgrade your 3 PM slump — premium milk tea delivered to your BGC office in 15 minutes",
                            "Our tea shop has been in business since 2024 and has 3 branches",
                            "We offer 47 different flavors of milk tea and topping combinations"
                        ],
                        "correct_index": 1,
                        "explanation": "Option B leads with a benefit the audience cares about — solving the afternoon energy crash, with the convenience of fast delivery to their work area. Option A leads with a feature (tea origin). Option C is about the brand, not the customer. Option D is features/variety without explaining why it matters. Great marketing connects your offering to a specific moment in the customer's life."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I'm selling [describe your product]. Help me brainstorm 5 customer personas who would buy it. Include their pain points and what motivates them.", "label": "Build customer personas with AI"},
                            {"text": "Here are 5 features of my product: [list them]. Rewrite each one as a customer benefit that answers 'so what?'", "label": "Turn features into benefits"},
                            {"text": "I want to market to young Filipino professionals. What are their biggest frustrations and desires right now? Help me find an angle.", "label": "Find a marketing angle"}
                        ]
                    }
                }
            ],
        },
        # Lesson 2
        {
            "title": "AI-Powered Copywriting",
            "slug": "ai-copywriting",
            "description": "Learn the prompt structure that produces great marketing copy — headlines, body text, and calls to action.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 20,
            "sort_order": 2,
            "ai_context": "Copywriting lesson focused on using AI to write marketing copy. Teach the audience+goal+tone+constraints prompt structure. Give before/after examples. The student should leave this lesson able to prompt AI for any type of marketing copy.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Can you help me write a headline for my product?", "How do I make this copy more persuasive?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>The Art of AI Copywriting</h2><p>Great copy is the engine of all marketing. It's the words on your ad, your landing page, your email subject line — every piece of text that persuades someone to take action.</p><p>AI doesn't replace copywriters. It gives you a <strong>starting point</strong> that's 80% there in 10 seconds, instead of staring at a blank page for an hour.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Copy Prompt Formula</h3><p>Every great copy prompt has four elements:</p><ol><li><strong>Audience</strong> — Who is reading this?</li><li><strong>Goal</strong> — What action do you want them to take?</li><li><strong>Tone</strong> — How should it sound?</li><li><strong>Constraints</strong> — Length, format, specific words to include/avoid</li></ol><p><strong>Example prompt:</strong></p><blockquote>Write a Facebook ad headline for Filipino freelancers (audience) that gets them to sign up for a free AI workshop (goal). Make it exciting but not salesy (tone). Max 10 words, include the word 'free' (constraints).</blockquote><p>This formula works for any type of copy: ads, emails, social posts, website pages, product descriptions.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Before & After: AI-Prompted Copy</h3><p><strong>Weak prompt:</strong> <em>\"Write an ad for my bakery\"</em></p><p><strong>Weak output:</strong> <em>\"Welcome to our bakery. We sell bread and cakes. Visit us today!\"</em></p><hr/><p><strong>Strong prompt:</strong> <em>\"Write a Facebook ad for a home bakery in Quezon City targeting moms aged 28-40 who want custom birthday cakes. Goal: get them to message us on Facebook. Tone: warm, friendly, like talking to a friend. Include price starting at P850. Max 3 sentences.\"</em></p><p><strong>Strong output:</strong> <em>\"Your kid's birthday deserves a cake as special as they are. Custom designs starting at P850 — just message us your theme and we'll make it happen. DM us now and get a free cupcake sample!\"</em></p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Always generate 3-5 variations of any copy, then pick the best one. AI gives you options — that's its superpower. Ask: 'Give me 5 different versions, ranging from playful to professional.'",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Types of Copy You Can Generate</h3><table><thead><tr><th>Copy Type</th><th>What to Specify in Prompt</th></tr></thead><tbody><tr><td>Headlines</td><td>Length (word count), emotional hook, keyword</td></tr><tr><td>Body copy</td><td>Audience pain point, benefit focus, CTA</td></tr><tr><td>CTAs (Call to Action)</td><td>Desired action, urgency level, button format</td></tr><tr><td>Social captions</td><td>Platform, hashtag count, emoji usage</td></tr><tr><td>Product descriptions</td><td>Key features to highlight, SEO keywords</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A client sends you this AI-generated Facebook ad copy: 'Our software uses cutting-edge machine learning algorithms and neural network architecture to optimize your workflow processes.' What's the best AI-prompted improvement?",
                    "metadata": {
                        "options": [
                            "Ask AI to add more technical details about the algorithms",
                            "Ask AI to rewrite it focusing on what the customer saves (time, money, stress) instead of how the tech works",
                            "Ask AI to make it longer so it explains the technology better",
                            "The copy is fine — technical details build credibility"
                        ],
                        "correct_index": 1,
                        "explanation": "The original copy is feature-heavy jargon that means nothing to most customers. The best fix is to rewrite focusing on benefits — what the customer actually gains. A prompt like 'Rewrite this ad focusing on time saved and stress reduced, in plain language a busy business owner would understand' would produce far better results."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I need to write a Facebook ad for [my product/service]. My audience is [describe them]. Help me write 5 headline variations — mix of playful, professional, and urgent tones.", "label": "Generate ad headlines with AI"},
                            {"text": "Here's my current copy: [paste it]. Rewrite it using the audience+goal+tone+constraints formula. Make it more benefit-focused.", "label": "Improve existing copy"},
                            {"text": "Write 3 different CTAs (calls to action) for a landing page selling an online course to Filipino professionals. Test different urgency levels.", "label": "Write CTAs with AI"}
                        ]
                    }
                }
            ],
        },
        # Lesson 3
        {
            "title": "Persuasion Frameworks",
            "slug": "persuasion-frameworks",
            "description": "Master AIDA, PAS, and Before-After-Bridge — and use AI to apply them instantly to any marketing challenge.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 20,
            "sort_order": 3,
            "ai_context": "Persuasion frameworks lesson. Teach AIDA, PAS, and Before-After-Bridge. Show how to prompt AI using each framework. Student should be able to choose the right framework for a given scenario and prompt AI to execute it.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Which framework should I use for this situation?", "Help me apply the PAS framework to my product."],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Persuasion Frameworks</h2><p>Frameworks are <strong>proven structures</strong> for organizing persuasive copy. Instead of guessing how to arrange your message, you follow a pattern that's been working for decades.</p><p>The magic: you can tell AI exactly which framework to use, and it will structure your copy accordingly.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>1. AIDA — Attention, Interest, Desire, Action</h3><p>The classic. Works for ads, landing pages, and sales emails.</p><ul><li><strong>Attention</strong> — Grab them with a bold statement or question</li><li><strong>Interest</strong> — Share a relevant fact or story that makes them lean in</li><li><strong>Desire</strong> — Paint a picture of the outcome they want</li><li><strong>Action</strong> — Tell them exactly what to do next</li></ul><p><strong>AI prompt example:</strong></p><blockquote>Using the AIDA framework, write a landing page for an AI skills course targeting Filipino college students. Attention: shocking stat about AI and jobs. Interest: what skills employers want. Desire: earning potential. Action: enroll now with early bird discount.</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>2. PAS — Problem, Agitate, Solve</h3><p>Best for when your audience has a clear pain point. Works brilliantly for ads and email subject lines.</p><ul><li><strong>Problem</strong> — Name the pain point directly</li><li><strong>Agitate</strong> — Make them feel the urgency of solving it</li><li><strong>Solve</strong> — Present your product as the answer</li></ul><p><strong>AI prompt example:</strong></p><blockquote>Using the PAS framework, write a Facebook ad for a meal prep delivery service in Manila. Problem: no time to cook healthy meals. Agitate: stress of ordering fast food every day, health impact, money wasted. Solve: healthy meals delivered daily for less than a Grab Food order.</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>3. Before-After-Bridge</h3><p>Paints a transformation story. Great for testimonials, case studies, and social proof content.</p><ul><li><strong>Before</strong> — Describe the painful current situation</li><li><strong>After</strong> — Describe the ideal outcome</li><li><strong>Bridge</strong> — Your product/service is the bridge between them</li></ul><p><strong>AI prompt example:</strong></p><blockquote>Using the Before-After-Bridge framework, write an Instagram carousel caption for a virtual assistant agency. Before: business owner drowning in admin tasks. After: focused on growth, 20 extra hours per week. Bridge: our VA team handles everything else.</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Quick decision guide: Use AIDA for new audiences who need the full journey. Use PAS when the audience already knows they have a problem. Use Before-After-Bridge when you have a strong transformation story to tell.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "quiz",
                    "content": "A client runs a co-working space in Cebu. They want to target remote workers who are tired of working from home and feeling isolated. Which persuasion framework would be most effective, and why?",
                    "metadata": {
                        "options": [
                            "AIDA — because remote workers need to be educated about co-working spaces",
                            "PAS — because the audience already feels the pain of isolation and needs the problem agitated before the solution",
                            "Before-After-Bridge — because co-working spaces are a new concept that needs explanation",
                            "None — just list the amenities and pricing"
                        ],
                        "correct_index": 1,
                        "explanation": "PAS is the strongest choice here because the audience already experiences the problem (isolation, distraction at home). You don't need to educate them — you need to agitate the pain they already feel ('Another day talking to no one... another video call from your bedroom...') then present the co-working space as relief. AIDA would work but is more suited for audiences who don't yet know they have the problem."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I'm marketing [my product/service] to [audience]. Apply the AIDA framework and write a complete landing page section. Walk me through each step.", "label": "Apply AIDA with AI"},
                            {"text": "My customer's biggest pain point is [describe it]. Use the PAS framework to write a Facebook ad that agitates this pain and presents my solution.", "label": "Write a PAS ad with AI"},
                            {"text": "Help me choose between AIDA, PAS, and Before-After-Bridge for this scenario: [describe your marketing situation]. Explain why.", "label": "Choose the right framework"}
                        ]
                    }
                }
            ],
        },
    ],

    "social-media-strategy": [
        # Lesson 4
        {
            "title": "Platform Strategy",
            "slug": "social-media-platforms",
            "description": "Understand each platform's strengths and learn to adapt your message — with AI doing the heavy lifting.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 20,
            "sort_order": 1,
            "ai_context": "Social media platforms lesson with Philippine market focus. Facebook is dominant, TikTok is growing fast, LinkedIn is for B2B. Help students understand that each platform has different audience expectations and content formats. Encourage using AI to adapt one piece of content across platforms.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Which platform is best for my business?", "Help me adapt this post for different platforms."],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Platform Strategy: Right Message, Right Place</h2><p>Posting the same content everywhere is one of the biggest mistakes in social media marketing. Each platform has its own <strong>culture, audience, and content format</strong>.</p><p>In the Philippines, the social media landscape looks like this:</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Philippine Social Media Landscape</h3><table><thead><tr><th>Platform</th><th>Primary Audience</th><th>Best Content</th><th>Marketing Strength</th></tr></thead><tbody><tr><td><strong>Facebook</strong></td><td>Broadest reach — almost everyone 18-65</td><td>Long-form posts, videos, groups, marketplace</td><td>Community building, local business, e-commerce</td></tr><tr><td><strong>TikTok</strong></td><td>Gen Z and young millennials (16-30)</td><td>Short-form video, trends, entertainment-first</td><td>Brand awareness, viral reach, younger audiences</td></tr><tr><td><strong>Instagram</strong></td><td>Millennials, lifestyle-focused (22-35)</td><td>Reels, Stories, polished visuals</td><td>Visual brands, influencer marketing, aspirational products</td></tr><tr><td><strong>LinkedIn</strong></td><td>Professionals, B2B decision-makers</td><td>Thought leadership, case studies, industry insights</td><td>B2B leads, recruitment, professional services</td></tr><tr><td><strong>YouTube</strong></td><td>All ages, second most-used platform</td><td>Long-form video, tutorials, vlogs</td><td>SEO, evergreen content, deep engagement</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The Philippines is the social media capital of the world — Filipinos spend an average of 3+ hours per day on social platforms. This is a massive opportunity if you know how to use each platform strategically.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>One Message, Multiple Platforms</h3><p>Here's how AI helps: you write your core message once, then ask AI to adapt it for each platform.</p><p><strong>Core message:</strong> <em>\"We just launched same-day delivery in Metro Manila.\"</em></p><p><strong>Facebook:</strong> Long-form post with details, customer testimonials, and a link to order.</p><p><strong>TikTok:</strong> 15-second video script showing the speed of delivery with trending audio.</p><p><strong>Instagram:</strong> Carousel with branded visuals and a Reels script.</p><p><strong>LinkedIn:</strong> Post about the logistics innovation and what it means for the e-commerce industry.</p><p>AI can generate all four versions in under 2 minutes. Without AI, this takes an hour or more.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Platform-Specific Prompt Tips</h3><ul><li><strong>Facebook:</strong> Tell AI to write conversationally, include a question to drive comments, use emojis sparingly</li><li><strong>TikTok:</strong> Ask for a hook in the first 2 seconds, trending format, casual tone</li><li><strong>Instagram:</strong> Request hashtag suggestions, carousel slide breakdowns, CTA for saves</li><li><strong>LinkedIn:</strong> Ask for professional tone, industry insights, data-driven claims</li></ul>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A B2B SaaS company in Makati wants to generate leads from HR managers at Philippine corporations. Their product is an AI-powered recruitment tool. Which platform strategy makes the most sense?",
                    "metadata": {
                        "options": [
                            "Focus on TikTok to reach the widest audience with viral recruitment memes",
                            "Go all-in on Instagram with aesthetic product screenshots",
                            "Lead with LinkedIn for thought leadership and direct outreach, supported by Facebook for broader awareness",
                            "Only use YouTube tutorials since HR managers prefer video content"
                        ],
                        "correct_index": 2,
                        "explanation": "For B2B targeting HR managers, LinkedIn is the primary platform — that's where professionals make business decisions and consume industry content. Facebook provides secondary reach since Philippine professionals are highly active there. TikTok and Instagram are poor fits for B2B SaaS targeting corporate decision-makers. The key insight is that platform choice should match where your specific audience makes purchasing decisions."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I have this core marketing message: [paste it]. Adapt it for Facebook, TikTok, Instagram, and LinkedIn. Match each platform's tone and format.", "label": "Adapt content across platforms with AI"},
                            {"text": "My business is [describe it] and my target audience is [describe them]. Which 2 social media platforms should I prioritize and why? Give me a content strategy for each.", "label": "Get a platform recommendation"},
                            {"text": "Write a week's worth of Facebook posts for a [type of business] in the Philippines. Mix educational, promotional, and engagement content.", "label": "Generate a week of posts"}
                        ]
                    }
                }
            ],
        },
        # Lesson 5
        {
            "title": "Content Calendars with AI",
            "slug": "content-calendars",
            "description": "Build a full month of content in 20 minutes using AI — content pillars, posting cadence, and theme days.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 20,
            "sort_order": 2,
            "ai_context": "Content calendar lesson. Teach students that consistency beats virality. Show how AI can generate a full month of content ideas organized by pillar. Encourage them to use the chatbot to build their own calendar right now.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Help me plan next month's content.", "What content pillars should I use?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Content Calendars: Consistency Beats Virality</h2><p>The number one reason social media marketing fails? <strong>Inconsistency.</strong> Posting 5 times one week and disappearing for a month is worse than posting 3 times every week without fail.</p><p>A content calendar solves this. It's a plan that tells you <strong>what to post, when to post, and why</strong> — before you ever sit down to create.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Content Pillars</h3><p>Content pillars are 3-5 <strong>themes</strong> that your content rotates between. They ensure variety while staying on-brand.</p><p><strong>Example for a fitness coaching business:</strong></p><ol><li><strong>Educational</strong> — Workout tips, nutrition facts, myth-busting</li><li><strong>Inspirational</strong> — Client transformations, motivational quotes</li><li><strong>Behind-the-scenes</strong> — Day in the life, gym setup, meal prep</li><li><strong>Promotional</strong> — Program launches, discounts, testimonials</li><li><strong>Engagement</strong> — Polls, Q&As, challenges</li></ol><p>Rule of thumb: <strong>80% value, 20% promotion.</strong> If every post is a sales pitch, people unfollow.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Building a Calendar with AI</h3><p>Here's the exact prompt workflow to build a month of content in 20 minutes:</p><p><strong>Step 1 — Define pillars:</strong></p><blockquote>I run a [business type] targeting [audience]. Suggest 5 content pillars with examples of each.</blockquote><p><strong>Step 2 — Generate the calendar:</strong></p><blockquote>Create a 4-week content calendar for Facebook. Post 5 times per week. Rotate between these pillars: [list them]. Include post type (text, image, video, carousel), a brief description, and a hook for each post. Format as a table.</blockquote><p><strong>Step 3 — Write the actual posts:</strong></p><blockquote>Now write the full copy for Week 1's posts. Include captions, hashtags, and a CTA for each.</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Pro tip: Ask AI to include Philippine holidays and events in your calendar. A post about your Independence Day sale or a Christmas-themed giveaway will always outperform generic content.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Posting Cadence by Platform</h3><table><thead><tr><th>Platform</th><th>Minimum Posts/Week</th><th>Ideal Posts/Week</th><th>Best Times (PH)</th></tr></thead><tbody><tr><td>Facebook</td><td>3</td><td>5-7</td><td>12 PM, 6-8 PM</td></tr><tr><td>TikTok</td><td>3</td><td>7-14</td><td>7-9 AM, 12 PM, 7-9 PM</td></tr><tr><td>Instagram</td><td>3</td><td>5-7 (mix Reels + Stories)</td><td>11 AM-1 PM, 7-9 PM</td></tr><tr><td>LinkedIn</td><td>2</td><td>3-5</td><td>8-10 AM weekdays</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "You're reviewing a client's content calendar. In the past month they posted: 15 promotional posts (sales, discounts, product features), 3 educational posts, and 2 engagement posts. What should you change?",
                    "metadata": {
                        "options": [
                            "Add more promotional posts — the product needs more visibility",
                            "Rebalance to 80% value (educational, inspirational, engagement) and 20% promotional content",
                            "Stop posting educational content and focus only on sales",
                            "Reduce posting frequency to once a week to improve quality"
                        ],
                        "correct_index": 1,
                        "explanation": "The calendar is 75% promotional, which will fatigue the audience and reduce engagement over time. The 80/20 rule is a proven content marketing principle: 80% of your content should deliver value (educate, entertain, inspire) and only 20% should directly promote. People follow accounts that help them, not accounts that only sell to them. Rebalancing will improve engagement, reach, and ultimately conversions."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I run a [type of business] targeting [audience] in the Philippines. Create 5 content pillars for my social media with examples of each. Then build a 4-week Facebook content calendar using those pillars.", "label": "Build a full content calendar with AI"},
                            {"text": "Here's my content calendar for next week: [paste it]. Review it and tell me what's missing — am I too promotional? Do I have enough variety? Suggest improvements.", "label": "Review my content calendar"},
                            {"text": "Generate 10 engaging Facebook post ideas for a [business type] that would work well during the Philippine holiday season (November-December).", "label": "Holiday content ideas"}
                        ]
                    }
                }
            ],
        },
        # Lesson 6
        {
            "title": "Creating Marketing Visuals with AI",
            "slug": "visual-content-ai",
            "description": "Use AI image generation to create social media graphics, ad creatives, and brand visuals — no design skills required.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 3,
            "ai_context": "Visual content creation lesson. Teach students how to write prompts specifically for marketing visuals — ads, social graphics, product shots. This lesson includes image generation blocks. Help students think about visual branding and what makes marketing images effective.",
            "ai_tools_enabled": ["chat", "image_gen"],
            "ghost_prompts": ["Help me describe a visual for my ad.", "What makes a good marketing image prompt?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Marketing Visuals with AI</h2><p>Visual content gets <strong>94% more views</strong> than text-only posts. But hiring a designer for every social media graphic is expensive and slow.</p><p>AI image generation changes the game. You can create professional-quality marketing visuals by describing what you want — no Photoshop, no design degree, no waiting days for deliverables.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Marketing Visual Prompt Formula</h3><p>When generating images for marketing, your prompt should include:</p><ol><li><strong>Subject</strong> — What's the main focus of the image?</li><li><strong>Style</strong> — Photography, illustration, flat design, 3D render?</li><li><strong>Mood/Lighting</strong> — Bright and energetic? Dark and premium? Warm and cozy?</li><li><strong>Composition</strong> — Close-up, wide shot, overhead, centered?</li><li><strong>Brand elements</strong> — Color palette, atmosphere, setting</li></ol><p><strong>Example for a coffee shop ad:</strong></p><blockquote>A professional product photo of iced coffee in a clear glass on a wooden table, tropical plants in the background, warm golden hour sunlight, shallow depth of field, lifestyle photography style, bright and inviting mood</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "For marketing visuals, style and mood matter more than subject detail. 'Professional product photography, bright studio lighting, minimalist background' transforms even a simple prompt into a polished result.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": "A flat-lay product photography of a milk tea drink with boba pearls in a branded cup, surrounded by tropical fruits and flowers, bright natural lighting, overhead shot, clean white marble surface, social media ad style, vibrant colors"
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>Visual Content Types for Marketing</h3><table><thead><tr><th>Content Type</th><th>Best For</th><th>Prompt Tips</th></tr></thead><tbody><tr><td>Product photos</td><td>E-commerce, ads</td><td>Specify lighting, background, angle. Add 'product photography' to prompt.</td></tr><tr><td>Lifestyle images</td><td>Social media, brand building</td><td>Show people using/enjoying the product. Specify setting and demographic.</td></tr><tr><td>Quote graphics</td><td>Engagement posts</td><td>Describe background style. Add text overlay in your design tool after.</td></tr><tr><td>Ad creatives</td><td>Paid advertising</td><td>Keep composition simple. Leave space for text overlay. Specify aspect ratio.</td></tr><tr><td>Behind-the-scenes</td><td>Authenticity content</td><td>Use 'candid', 'natural', 'documentary style' in your prompt.</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": "A young Filipino entrepreneur working on a laptop in a modern co-working space, natural daylight from large windows, plants and wood accents, candid lifestyle photography, warm and inspiring atmosphere, shallow depth of field"
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're creating a Facebook ad for a premium skincare brand targeting Filipino women aged 25-35. Which AI-generated visual approach would perform best?",
                    "metadata": {
                        "options": [
                            "A busy collage showing all 15 products in the line with text listing every ingredient",
                            "A clean, well-lit product shot of the hero product with soft natural lighting and a simple, elegant background",
                            "A cartoon illustration of a woman washing her face",
                            "A stock-photo style image of a generic model with white background"
                        ],
                        "correct_index": 1,
                        "explanation": "Premium brands convert with clean, focused visuals that communicate quality. A single hero product with professional lighting and an elegant setting signals 'premium' instantly. Collages feel cluttered and cheap. Cartoons don't match premium positioning. Generic stock photos lack brand personality. In paid ads, simple and focused visuals almost always outperform busy ones — the viewer only has 1-2 seconds to process your image."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me write an AI image prompt for a Facebook ad for my [product/service]. I want it to look professional and match my brand's [describe style/colors].", "label": "Create an ad visual prompt with AI"},
                            {"text": "I need 5 different visual concepts for an Instagram carousel about [topic]. Describe each image I should generate, with detailed prompts.", "label": "Plan a visual carousel"},
                            {"text": "What visual style works best for marketing to young Filipino professionals? Help me create a consistent visual brand I can use across all my social media.", "label": "Define a visual brand style"}
                        ]
                    }
                }
            ],
        },
    ],

    "email-and-seo": [
        # Lesson 7
        {
            "title": "Email Marketing with AI",
            "slug": "email-marketing",
            "description": "Master email anatomy — subject lines, body copy, CTAs — and use AI to write emails that get opened and clicked.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 1,
            "ai_context": "Email marketing lesson. Teach the components of effective emails. Show how AI writes each part — subject lines, preview text, body, CTAs. Cover segmentation basics and A/B testing subject lines. Practical, hands-on focus.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Help me write an email subject line.", "How do I improve my email open rates?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Email Marketing with AI</h2><p>Email marketing has the highest ROI of any marketing channel — averaging <strong>P36 return for every P1 spent</strong>. Yet most marketing emails go unread because they're boring, irrelevant, or poorly written.</p><p>AI fixes this by helping you write better emails, faster — and test what works.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Anatomy of a High-Converting Email</h3><p>Every marketing email has 5 components:</p><ol><li><strong>Subject line</strong> — The gatekeeper. If this fails, nothing else matters. Keep it under 50 characters, create curiosity or urgency.</li><li><strong>Preview text</strong> — The line visible in the inbox after the subject. Supports the subject line — don't waste it.</li><li><strong>Opening line</strong> — Must hook the reader in 1-2 sentences. Personalization wins.</li><li><strong>Body copy</strong> — One main message. Short paragraphs. Benefit-focused.</li><li><strong>CTA (Call to Action)</strong> — One clear action. Button or bolded link. Tell them exactly what to do.</li></ol>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>AI-Powered Email Workflow</h3><p><strong>Step 1 — Generate subject lines:</strong></p><blockquote>Write 10 email subject lines for a sale announcement. Our audience is Filipino online shoppers aged 20-35. Mix curiosity, urgency, and benefit angles. Keep each under 50 characters.</blockquote><p><strong>Step 2 — A/B test with AI:</strong></p><blockquote>I'm choosing between these subject lines: [A] and [B]. Which would likely get a higher open rate for our audience and why?</blockquote><p><strong>Step 3 — Write the email body:</strong></p><blockquote>Write the full email for subject line [winner]. Keep it under 150 words. One main CTA: 'Shop the Sale'. Tone: excited but not spammy. Include a P500 discount code.</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The #1 mistake in email marketing: burying the CTA. Your reader should see what you want them to do within the first scroll — without hunting for it.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Segmentation: The Secret Weapon</h3><p>Segmentation means sending different emails to different groups based on their behavior or characteristics.</p><table><thead><tr><th>Segment</th><th>Email Strategy</th></tr></thead><tbody><tr><td>New subscribers (0-7 days)</td><td>Welcome series — introduce your brand, deliver a freebie</td></tr><tr><td>Active buyers</td><td>Exclusive offers, loyalty rewards, early access</td></tr><tr><td>Inactive (60+ days no open)</td><td>Re-engagement campaign — 'We miss you' + special offer</td></tr><tr><td>Cart abandoners</td><td>Reminder email within 1-4 hours with social proof</td></tr></tbody></table><p>AI can write different email versions for each segment in minutes.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "Your e-commerce email campaign shows: 45% open rate but only 1.2% click-through rate. What should you change?",
                    "metadata": {
                        "options": [
                            "Rewrite the subject line — the open rate is too low",
                            "The email body and CTA need improvement — people are opening but not clicking, so the content inside isn't compelling enough",
                            "Send the email more frequently to increase total clicks",
                            "Add more products to the email so there's something for everyone"
                        ],
                        "correct_index": 1,
                        "explanation": "A 45% open rate is excellent — the subject line is doing its job. The problem is inside the email: a 1.2% CTR means people open, read, but don't click. This points to weak body copy, unclear CTA, or a mismatch between the subject line promise and the email content. Focus on making the CTA more prominent, the body more benefit-focused, and ensure the email delivers on the subject line's promise."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Write 10 email subject lines for [describe your campaign]. Mix curiosity, urgency, and benefit approaches. Then tell me which 2 you'd A/B test and why.", "label": "Generate subject lines with AI"},
                            {"text": "Write a complete 3-email welcome sequence for new subscribers to my [type of business]. Include subject lines, preview text, and full email copy for each.", "label": "Build a welcome email series"},
                            {"text": "Here are my email metrics: [paste them]. Analyze what's working and what's not. Suggest specific copy changes to improve my weakest metric.", "label": "Analyze my email performance"}
                        ]
                    }
                }
            ],
        },
        # Lesson 8
        {
            "title": "SEO Fundamentals with AI",
            "slug": "seo-basics",
            "description": "Understand how search engines work and use AI for keyword research, content optimization, and meta descriptions.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 2,
            "ai_context": "SEO fundamentals lesson. Explain search intent, keywords, on-page optimization, and meta descriptions. Show how AI helps with keyword research and content optimization. Keep it practical — student should be able to optimize a page after this lesson.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["How do I find the right keywords?", "Help me write a meta description."],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>SEO Fundamentals with AI</h2><p><strong>SEO (Search Engine Optimization)</strong> is the art of making your content show up when people search on Google. Unlike paid ads, SEO brings <strong>free, ongoing traffic</strong> — but it takes strategy.</p><p>The good news: AI makes SEO dramatically easier. What used to require expensive tools and specialist knowledge, you can now do with smart prompting.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>How Search Engines Think</h3><p>Google's job is simple: show the <strong>best answer</strong> to every search query. To rank well, your content needs to:</p><ol><li><strong>Match search intent</strong> — Are searchers looking to learn, buy, compare, or navigate?</li><li><strong>Use the right keywords</strong> — The words people actually type into Google</li><li><strong>Provide genuine value</strong> — Depth, accuracy, and usefulness matter</li><li><strong>Be well-structured</strong> — Headers, paragraphs, images, fast loading</li></ol><h3>Search Intent Types</h3><table><thead><tr><th>Intent</th><th>Example Search</th><th>What They Want</th></tr></thead><tbody><tr><td>Informational</td><td>\"how to start a business in Philippines\"</td><td>Knowledge, guide, tutorial</td></tr><tr><td>Commercial</td><td>\"best laptop for freelancers 2026\"</td><td>Comparison, reviews, options</td></tr><tr><td>Transactional</td><td>\"buy iPhone 16 Lazada\"</td><td>Ready to purchase</td></tr><tr><td>Navigational</td><td>\"GCash login\"</td><td>Find a specific page</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>AI-Powered Keyword Research</h3><p>Instead of paying for expensive keyword tools, use AI as your research assistant:</p><blockquote>I run a [business type] in the Philippines. What are 20 keywords my target audience would search on Google? Group them by search intent (informational, commercial, transactional). Include estimated competition level (low/medium/high).</blockquote><p>Then go deeper:</p><blockquote>For the keyword '[chosen keyword]', give me: 5 related long-tail keywords, the likely search intent, and an outline for a blog post that would rank well.</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>On-Page SEO Checklist</h3><p>These are the elements you can optimize on every page:</p><ul><li><strong>Title tag</strong> — Include primary keyword, under 60 characters</li><li><strong>Meta description</strong> — Compelling summary, under 155 characters, include keyword</li><li><strong>H1 heading</strong> — One per page, includes keyword naturally</li><li><strong>Subheadings (H2, H3)</strong> — Organize content, include related keywords</li><li><strong>First 100 words</strong> — Include your primary keyword early</li><li><strong>Internal links</strong> — Link to other relevant pages on your site</li><li><strong>Image alt text</strong> — Describe images, include keywords where natural</li></ul>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "SEO is a long game. A well-optimized page can take 3-6 months to rank — but once it does, it brings traffic for years without paying for ads. Think of it as an investment, not a quick win.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "quiz",
                    "content": "You run a baking supplies store in Manila and want to create a blog post targeting 'how to make ube cake'. The page currently has: a great recipe, but the title is 'Our Blog Post #47', there's no meta description, and the word 'ube cake' doesn't appear until paragraph 5. Which optimization would have the most impact?",
                    "metadata": {
                        "options": [
                            "Add more photos of the finished cake",
                            "Make the blog post longer by adding 2000 more words",
                            "Fix the title to include 'ube cake', write a meta description with the keyword, and mention 'ube cake' in the first paragraph",
                            "Add 50 internal links to other blog posts"
                        ],
                        "correct_index": 2,
                        "explanation": "The page has great content but terrible on-page SEO signals. Google can't rank you for 'ube cake' if the keyword isn't in your title, meta description, or early content. Fixing these three elements — title tag, meta description, and keyword placement — is the highest-impact change. It tells Google exactly what your page is about. More words or links won't help if the fundamental signals are missing."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I run a [type of business] in [location]. Generate 20 keyword ideas my target audience would search for. Group them by search intent and suggest which ones to target first based on competition.", "label": "Do keyword research with AI"},
                            {"text": "Here's my blog post: [paste it or describe it]. Write an SEO-optimized title tag (under 60 chars), meta description (under 155 chars), and suggest where to naturally place my target keyword '[keyword]'.", "label": "Optimize a page for SEO"},
                            {"text": "Write an SEO-optimized blog post outline for the keyword '[your keyword]'. Include H1, H2s, H3s, and a brief description of what each section should cover. Target 1500 words.", "label": "Create an SEO blog outline"}
                        ]
                    }
                }
            ],
        },
    ],

    "brand-analytics": [
        # Lesson 9
        {
            "title": "Building Brand Voice with AI",
            "slug": "brand-voice",
            "description": "Define your brand's unique voice and train AI to write in it consistently across every channel.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 1,
            "ai_context": "Brand voice lesson. Help students understand what brand voice is and how to codify it so AI can replicate it. Teach them to create a brand voice guide using AI. Use Philippine brand examples where possible.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Help me define my brand voice.", "How do I make sure AI writes consistently in my brand's tone?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Building Brand Voice with AI</h2><p>Brand voice is <strong>how your brand sounds</strong> when it communicates. It's the personality behind every post, email, and ad. Think of it this way: if your brand were a person, how would they talk?</p><p>Consider these Philippine brands:</p><ul><li><strong>Jollibee</strong> — Warm, family-oriented, joyful, Pinoy pride</li><li><strong>Angkas</strong> — Witty, relatable, casual Filipino humor, Gen Z energy</li><li><strong>BDO</strong> — Professional, trustworthy, reassuring, straightforward</li></ul><p>Each brand sounds completely different because they've defined their voice — and they stick to it everywhere.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Brand Voice Framework</h3><p>Define your voice using these 4 dimensions:</p><table><thead><tr><th>Dimension</th><th>Example Spectrum</th></tr></thead><tbody><tr><td><strong>Formality</strong></td><td>Casual ←→ Formal</td></tr><tr><td><strong>Energy</strong></td><td>Calm ←→ Enthusiastic</td></tr><tr><td><strong>Humor</strong></td><td>Serious ←→ Playful</td></tr><tr><td><strong>Authority</strong></td><td>Peer-like ←→ Expert</td></tr></tbody></table><p>Then add specifics:</p><ul><li><strong>We say:</strong> 'Hey! Ready to level up?' (casual, energetic)</li><li><strong>We don't say:</strong> 'Dear valued customer, we are pleased to...' (too corporate)</li><li><strong>Vocabulary:</strong> We use 'level up', 'crush it', 'game-changer' — not 'synergy', 'optimize', 'leverage'</li><li><strong>Tagalog mixing:</strong> Light Taglish is OK for social, pure English for website</li></ul>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Training AI to Write in Your Voice</h3><p>Here's the most powerful technique: create a <strong>brand voice prompt</strong> you include at the start of every AI interaction.</p><blockquote>You are writing as [Brand Name]. Our voice is: [casual/formal], [calm/enthusiastic], [serious/playful], [peer-like/expert]. We always sound like [describe the persona — e.g., 'a supportive friend who happens to be really good at their job']. We use short sentences. We mix in light Taglish on social media. We never use corporate jargon. Here are 3 examples of our voice: [paste examples]. Now write [the task].</blockquote><p>Save this as a template. Use it every time you ask AI to write for your brand. The result? Consistent voice across every channel, even when different team members are prompting.</p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Your brand voice guide doesn't need to be a 50-page document. A one-page summary with 4 voice dimensions, 5 'we say/we don't say' examples, and 3 sample paragraphs is enough to keep your content consistent — and to train AI.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "quiz",
                    "content": "A hip bubble tea brand aimed at college students defined their voice as: casual, enthusiastic, playful, peer-like. A customer posts a complaint on Facebook about a wrong order. Which response matches their brand voice while handling the issue professionally?",
                    "metadata": {
                        "options": [
                            "'Dear valued patron, we sincerely apologize for this unfortunate inconvenience. Please be advised that we have escalated your concern to our quality assurance department for immediate resolution.'",
                            "'Ay, that's on us! Super sorry about the mix-up. DM us your order details and we'll make it right ASAP — plus a freebie for the hassle. We got you!'",
                            "'We are aware of your concern. A representative will contact you within 3-5 business days.'",
                            "'Sorry for the issue.' (no further response)"
                        ],
                        "correct_index": 1,
                        "explanation": "Option B maintains the casual, enthusiastic, playful, peer-like voice even while handling a complaint. It acknowledges the mistake, uses their brand's natural language ('Ay', 'super sorry', 'We got you!'), and offers a concrete solution. Option A is corporate-speak that would feel jarring from a bubble tea brand. The key is that brand voice doesn't disappear during problems — it adapts while staying authentic."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me define my brand voice. My brand is [describe it], targeting [audience]. Walk me through the 4 dimensions (formality, energy, humor, authority) and help me create 'we say / we don't say' examples.", "label": "Define your brand voice with AI"},
                            {"text": "Here are 3 examples of content I've written that I think represent my brand well: [paste them]. Analyze my brand voice — what patterns do you see? Create a brand voice guide I can use to prompt AI consistently.", "label": "Extract your voice from examples"},
                            {"text": "Using this brand voice guide: [paste your guide], write a Facebook post announcing [your news]. Then write the same announcement for LinkedIn. Show how voice adapts across platforms.", "label": "Write in your brand voice across platforms"}
                        ]
                    }
                }
            ],
        },
        # Lesson 10
        {
            "title": "Reading Marketing Data",
            "slug": "analytics-interpretation",
            "description": "Learn to read marketing metrics — CTR, conversion rates, ROAS — and use AI to turn data into actionable decisions.",
            "xp_reward": 25,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 2,
            "ai_context": "Marketing analytics lesson. Teach key metrics and how to interpret them. Focus on practical decision-making from data, not just definitions. Show how AI can analyze marketing dashboards and suggest actions. Use realistic Philippine market examples.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Help me understand what these metrics mean.", "What should I do based on this data?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Reading Marketing Data</h2><p>Data without action is just numbers on a screen. The skill that separates good marketers from great ones is <strong>reading data and making decisions</strong> — not just reporting metrics.</p><p>AI is your analytics translator. Feed it your data, and it tells you what's working, what's broken, and what to do next.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Metrics That Actually Matter</h3><table><thead><tr><th>Metric</th><th>What It Tells You</th><th>Good Benchmark</th></tr></thead><tbody><tr><td><strong>CTR (Click-Through Rate)</strong></td><td>Are people clicking your ad/link?</td><td>Facebook ads: 1-3%. Email: 2-5%.</td></tr><tr><td><strong>Conversion Rate</strong></td><td>Of those who clicked, how many bought/signed up?</td><td>E-commerce: 1-3%. Landing pages: 5-15%.</td></tr><tr><td><strong>CPC (Cost Per Click)</strong></td><td>How much each click costs you</td><td>Varies by industry. PH average: P5-P25.</td></tr><tr><td><strong>CPA (Cost Per Acquisition)</strong></td><td>How much it costs to get one customer</td><td>Must be less than customer lifetime value</td></tr><tr><td><strong>ROAS (Return on Ad Spend)</strong></td><td>Revenue generated per peso spent on ads</td><td>3:1 or higher is generally profitable</td></tr><tr><td><strong>Engagement Rate</strong></td><td>How actively people interact with your content</td><td>Facebook: 1-5%. Instagram: 1-3%.</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Marketing Funnel: Where Problems Hide</h3><p>Marketing is a funnel. Understanding which <strong>stage</strong> is broken tells you what to fix:</p><ol><li><strong>Impressions are low?</strong> → Targeting or budget problem. Expand audience or increase spend.</li><li><strong>CTR is low?</strong> → Your ad creative or copy isn't compelling. Test new headlines, images, or hooks.</li><li><strong>Conversion rate is low?</strong> → Your landing page isn't convincing. Fix the offer, social proof, or CTA.</li><li><strong>ROAS is low?</strong> → Either cost is too high or revenue per customer is too low. Optimize both.</li></ol>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The biggest analytics mistake: changing everything at once. When data shows a problem, change ONE thing, measure the impact, then decide next steps. This is how you learn what actually works.",
                    "metadata": {"type": "warning"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Using AI to Analyze Marketing Data</h3><p>Here's a powerful workflow:</p><blockquote>Here are my Facebook ad results from the last 30 days:<br/>- Spend: P15,000<br/>- Impressions: 120,000<br/>- Clicks: 2,400<br/>- Conversions: 36<br/>- Revenue: P54,000<br/><br/>Calculate my CTR, conversion rate, CPC, CPA, and ROAS. Tell me which metric is weakest and what specific changes I should test to improve it.</blockquote><p>AI will not only calculate everything but <strong>explain what the numbers mean</strong> and <strong>recommend specific actions</strong>.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "You're running Facebook ads for an online store. Here's your data: Spend: P10,000 | Clicks: 1,500 | Add to Cart: 200 | Purchases: 12 | Revenue: P18,000. Your CPC is P6.67 (good), CTR is 2.5% (good), but only 6% of add-to-carts convert to purchases (industry average is 15-25%). What action should you take?",
                    "metadata": {
                        "options": [
                            "Increase ad spend since CTR is good — more traffic will fix the problem",
                            "Change the ad creative — clearly the ads aren't working",
                            "Fix the checkout experience — people want to buy but something is stopping them between add-to-cart and purchase",
                            "Lower your prices across the board"
                        ],
                        "correct_index": 2,
                        "explanation": "The data tells a clear story: ads are working well (good CPC and CTR), and people are interested in the product (200 add-to-carts). But the drop-off between add-to-cart (200) and purchase (12) is severe — only 6% conversion vs. 15-25% industry average. This points to a checkout problem: unexpected shipping costs, complicated checkout flow, lack of payment options (no GCash/Maya?), or missing trust signals. More ad spend would just send more people to a broken checkout. Fix the conversion bottleneck first."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Here are my marketing metrics for last month: [paste your data]. Calculate my key metrics (CTR, conversion rate, CPC, CPA, ROAS) and tell me which part of the funnel is weakest. Suggest 3 specific changes to test.", "label": "Analyze your marketing data with AI"},
                            {"text": "I'm spending P[amount] per month on Facebook ads and getting P[amount] in revenue. Is this profitable? What's my ROAS and what should I do to improve it? Walk me through the math.", "label": "Calculate your ad profitability"},
                            {"text": "Explain these metrics to me like I'm new to marketing: [paste metrics]. What does each number mean, is it good or bad, and what should I do about it?", "label": "Explain my metrics in plain language"}
                        ]
                    }
                }
            ],
        },
    ],

    "campaign-planning": [
        # Lesson 11
        {
            "title": "Full Campaign Planning",
            "slug": "campaign-strategy",
            "description": "Plan a complete marketing campaign — from brief to execution timeline — using AI at every stage.",
            "xp_reward": 25,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 1,
            "ai_context": "Campaign planning capstone lesson. Bring together everything from the track: copywriting, platforms, visuals, email, SEO, brand voice, analytics. Show how AI helps plan a full campaign from brief to launch. Use a realistic product launch scenario.",
            "ai_tools_enabled": ["chat"],
            "ghost_prompts": ["Help me create a campaign brief.", "What channels should my campaign use?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Full Campaign Planning</h2><p>Everything you've learned so far — copywriting, platform strategy, visuals, email, SEO, brand voice, analytics — comes together in a <strong>marketing campaign</strong>.</p><p>A campaign is a coordinated series of marketing activities with a specific goal, timeline, and budget. It's not random posting — it's strategic execution.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Campaign Planning Framework</h3><p>Every campaign starts with a brief that answers 7 questions:</p><ol><li><strong>Objective</strong> — What measurable outcome do we want? (e.g., 500 sign-ups, P100K revenue, 10K followers)</li><li><strong>Audience</strong> — Who exactly are we targeting? (persona from Week 1)</li><li><strong>Message</strong> — What's our core value proposition? (copywriting from Week 1)</li><li><strong>Channels</strong> — Where will we reach them? (platform strategy from Week 2)</li><li><strong>Timeline</strong> — When does it start and end? Key milestones?</li><li><strong>Budget</strong> — How much are we spending and where?</li><li><strong>Success metrics</strong> — How will we measure results? (analytics from Week 4)</li></ol>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Example: Product Launch Campaign</h3><p>Let's walk through a real campaign:</p><p><strong>Scenario:</strong> A Filipino skincare startup is launching a new sunscreen. Budget: P50,000. Timeline: 4 weeks.</p><table><thead><tr><th>Week</th><th>Phase</th><th>Activities</th></tr></thead><tbody><tr><td>Week 1</td><td><strong>Teaser</strong></td><td>Mystery posts on social media, email teaser to subscribers, influencer seeding</td></tr><tr><td>Week 2</td><td><strong>Launch</strong></td><td>Product reveal, launch-day sale, Facebook/Instagram ads, email blast, press release</td></tr><tr><td>Week 3</td><td><strong>Social Proof</strong></td><td>Customer reviews, influencer content, UGC campaign, retargeting ads</td></tr><tr><td>Week 4</td><td><strong>Sustain</strong></td><td>Blog/SEO content, email nurture series, expand successful ad creatives</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The fastest way to plan a campaign: give AI your brief (all 7 questions answered) and ask it to generate a complete campaign plan. Then refine each section. You'll have a professional campaign plan in 30 minutes instead of 3 days.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Budget Allocation Rule of Thumb</h3><p>For a digital-first campaign in the Philippine market:</p><ul><li><strong>50-60%</strong> — Paid ads (Facebook, Instagram, TikTok)</li><li><strong>15-20%</strong> — Content creation (visuals, video, copy)</li><li><strong>10-15%</strong> — Influencer partnerships</li><li><strong>5-10%</strong> — Email marketing tools and other software</li><li><strong>5%</strong> — Testing and contingency</li></ul><p>With AI handling content creation, you can shift more budget toward distribution (ads) where it directly drives results.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A Philippine food delivery app is launching in a new city (Davao). They have P200,000 budget and 6 weeks. Their goal is 5,000 app downloads. Which campaign approach would have the highest impact?",
                    "metadata": {
                        "options": [
                            "Spend the entire budget on Facebook ads targeting Davao — maximize reach",
                            "A phased campaign: Week 1-2 teaser/awareness on social + local influencers, Week 3-4 launch with ads + first-order promo code, Week 5-6 retargeting + referral program to sustain growth",
                            "Create a beautifully designed website and wait for organic traffic",
                            "Partner with one big national celebrity for a single Instagram post"
                        ],
                        "correct_index": 1,
                        "explanation": "A phased approach wins because it builds awareness before asking for action, uses multiple touchpoints (social, influencers, ads, promotions), and has a sustain phase to maintain momentum. Spending everything on ads ignores the awareness-building needed for a new market. A website alone won't drive 5,000 downloads without promotion. A single celebrity post is high-risk and one-dimensional — local Davao influencers would likely outperform a national celebrity for local downloads."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I'm launching [product/service] in [location]. My budget is [amount] and my goal is [specific objective] within [timeframe]. Create a complete phased campaign plan with weekly breakdown, channel strategy, and budget allocation.", "label": "Generate a full campaign plan with AI"},
                            {"text": "Here's my campaign brief: [paste brief]. Review it and identify any gaps. What am I missing? What questions should I be asking before launching?", "label": "Review my campaign brief"},
                            {"text": "I need to create all the marketing assets for a [type of campaign]. List every piece of content I need (ads, emails, social posts, landing page copy) and write the first draft of each.", "label": "Generate all campaign assets"}
                        ]
                    }
                }
            ],
        },
        # Lesson 12
        {
            "title": "Campaign Execution & Optimization",
            "slug": "campaign-execution",
            "description": "Launch, monitor, and optimize campaigns in real-time — using AI for A/B testing, pivot decisions, and performance analysis.",
            "xp_reward": 30,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 2,
            "ai_context": "Final lesson — campaign execution and optimization. This is the capstone of the entire track. Teach launching, monitoring, and real-time optimization. Include image generation for campaign visuals. Focus on data-driven decision making and using AI for rapid iteration.",
            "ai_tools_enabled": ["chat", "image_gen"],
            "ghost_prompts": ["My campaign is underperforming. Help me figure out why.", "Should I change my ad creative or my targeting?"],
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": "<h2>Campaign Execution & Optimization</h2><p>Planning is important, but <strong>execution is everything</strong>. The best campaign plan in the world fails if you can't launch it smoothly, monitor what's happening, and make smart adjustments in real-time.</p><p>This lesson brings together everything you've learned into the real-world skill of running live campaigns.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Launch Checklist</h3><p>Before pressing 'go' on any campaign, verify:</p><ul><li><strong>Tracking</strong> — Are your analytics/pixels set up? Can you measure every step of the funnel?</li><li><strong>Landing pages</strong> — Do all links work? Is the page mobile-friendly? Does the CTA stand out?</li><li><strong>Ad creatives</strong> — Do you have at least 3 variations for A/B testing?</li><li><strong>Email sequences</strong> — Are automated emails queued and tested?</li><li><strong>Budget caps</strong> — Are daily/total budget limits set to prevent overspend?</li><li><strong>Team alignment</strong> — Does everyone know their role and timeline?</li></ul>",
                    "metadata": {}
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": "A professional digital marketing campaign dashboard on a laptop screen, showing charts and metrics, modern office setting, warm lighting, clean and organized workspace with marketing materials, overhead angle, business photography style"
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>A/B Testing: The Optimization Engine</h3><p>A/B testing means running two versions of something to see which performs better. It's how smart marketers eliminate guesswork.</p><p><strong>What to A/B test (in order of impact):</strong></p><ol><li><strong>Ad creative/image</strong> — Visual differences have the biggest impact on CTR</li><li><strong>Headline/copy</strong> — Different value propositions or emotional angles</li><li><strong>Audience targeting</strong> — Different demographics, interests, or behaviors</li><li><strong>CTA</strong> — 'Buy Now' vs. 'Shop the Sale' vs. 'Get Yours'</li><li><strong>Landing page</strong> — Different layouts, social proof placement, form length</li></ol><p><strong>The golden rule:</strong> Test ONE variable at a time. If you change the image AND the copy simultaneously, you won't know which change made the difference.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>When to Pivot: Decision Framework</h3><p>Use this framework when campaign data comes in:</p><table><thead><tr><th>Situation</th><th>Action</th></tr></thead><tbody><tr><td>CTR low, everything else untested</td><td>Test new ad creatives — your message isn't stopping the scroll</td></tr><tr><td>CTR good, conversion rate low</td><td>Fix landing page — people are interested but not convinced</td></tr><tr><td>One ad set outperforming others 2x+</td><td>Shift budget to the winner, pause underperformers</td></tr><tr><td>CPA is above your target after 3-5 days</td><td>Narrow audience or improve funnel before scaling</td></tr><tr><td>Everything is above benchmark</td><td>Scale gradually — increase budget 20-30% every 3 days</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Never panic-change a campaign in the first 48 hours. Facebook and other platforms need 2-3 days to optimize delivery. Making changes too early restarts the learning phase and wastes money.",
                    "metadata": {"type": "warning"}
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": "A split-screen comparison of two different social media ad designs side by side, labeled A and B, modern flat design style, clean marketing aesthetic, bright professional colors, digital marketing concept"
                    }
                },
                {
                    "type": "quiz",
                    "content": "Your campaign has been running for 5 days. Results: Ad Set A has CTR 3.2%, CPA P180. Ad Set B has CTR 1.1%, CPA P420. Ad Set C has CTR 2.8%, CPA P195. Your target CPA is P200. What's the best optimization decision?",
                    "metadata": {
                        "options": [
                            "Pause everything and start over with completely new creatives",
                            "Pause Ad Set B, shift its budget equally between Ad Sets A and C (which are both near or below target CPA), and monitor for another 3 days",
                            "Increase budget on all three ad sets to get more data",
                            "Lower the target CPA to P100 to force better performance"
                        ],
                        "correct_index": 1,
                        "explanation": "Ad Set B is clearly underperforming (CPA more than double your target), while A and C are both near or below the P200 target. The smart move is to cut the loser, redistribute its budget to the winners, and monitor. Starting over would waste the learning data from A and C. Scaling all three wastes money on B. Lowering the CPA target doesn't change reality — it just means you'll be disappointed when B still underperforms. This is the core optimization skill: double down on what works, cut what doesn't."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "My campaign has been running for [X days]. Here are the results: [paste your metrics for each ad set]. Analyze the performance, tell me what to keep, what to pause, and what to test next.", "label": "Optimize your live campaign with AI"},
                            {"text": "I need to A/B test my Facebook ad. My current headline is: [paste it]. Generate 4 alternative headlines testing different angles (urgency, curiosity, benefit, social proof) so I can run a proper test.", "label": "Generate A/B test variations"},
                            {"text": "My campaign is underperforming — [describe what's happening]. Walk me through a diagnostic: where in the funnel is the problem? What's the most likely cause? What should I change first?", "label": "Diagnose a struggling campaign"}
                        ]
                    }
                }
            ],
        },
    ],
}


# ---------------------------------------------------------------------------
# API Helpers
# ---------------------------------------------------------------------------

def api_request(method, path, payload=None):
    """Make a request to the Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in HEADERS.items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read()
            return json.loads(body) if body else []
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()}")
        raise


def delete_existing():
    """Delete existing lessons and modules for this track (idempotency)."""
    print("Deleting existing lessons for this track's modules...")
    # First get existing module IDs
    modules = api_request("GET", f"academy_modules?track_id=eq.{TRACK_ID}&select=id")
    if modules:
        module_ids = [m["id"] for m in modules]
        for mid in module_ids:
            api_request("DELETE", f"academy_lessons?module_id=eq.{mid}")
        print(f"  Deleted lessons from {len(module_ids)} modules")

    print("Deleting existing modules for this track...")
    api_request("DELETE", f"academy_modules?track_id=eq.{TRACK_ID}")
    print("  Done\n")


def create_modules():
    """Create all 5 modules and return a slug->id mapping."""
    print("Creating modules...")
    slug_to_id = {}
    for mod in MODULES:
        result = api_request("POST", "academy_modules", mod)
        if result and len(result) > 0:
            row = result[0]
            slug_to_id[row["slug"]] = row["id"]
            print(f"  + {row['slug']} -> {row['id']}")
        else:
            print(f"  FAILED: {mod['slug']}")
    print()
    return slug_to_id


def create_lessons(slug_to_id):
    """Create all 12 lessons linked to correct modules."""
    print("Creating lessons...")
    total = 0
    for module_slug, lessons in LESSONS.items():
        module_id = slug_to_id.get(module_slug)
        if not module_id:
            print(f"  SKIP: No module ID for {module_slug}")
            continue
        for lesson in lessons:
            payload = {
                "module_id": module_id,
                "title": lesson["title"],
                "slug": lesson["slug"],
                "description": lesson["description"],
                "content_blocks": json.dumps(lesson["content_blocks"]),
                "ai_context": lesson.get("ai_context", ""),
                "ai_tools_enabled": lesson.get("ai_tools_enabled", []),
                "exercise_config": json.dumps(lesson.get("exercise_config", {})),
                "xp_reward": lesson.get("xp_reward", 10),
                "passing_score": lesson.get("passing_score", 70),
                "time_limit_minutes": lesson.get("time_limit_minutes", 15),
                "sort_order": lesson.get("sort_order", 1),
                "ghost_prompts": lesson.get("ghost_prompts", []),
            }
            result = api_request("POST", "academy_lessons", payload)
            if result and len(result) > 0:
                row = result[0]
                print(f"  + [{module_slug}] {row['slug']} (xp: {row.get('xp_reward', '?')})")
                total += 1
            else:
                print(f"  FAILED: {lesson['slug']}")
    print(f"\nCreated {total} lessons total.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("Seeding AI Marketing & Content track")
    print("=" * 60 + "\n")

    delete_existing()
    slug_to_id = create_modules()
    create_lessons(slug_to_id)

    print("\n" + "=" * 60)
    print("Done! AI Marketing & Content track is seeded.")
    print("=" * 60)
