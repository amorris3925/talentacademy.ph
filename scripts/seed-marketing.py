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
                    "type": "quiz",
                    "content": "You want AI to help you identify the target audience for a new Filipino streetwear brand. Which prompt would produce the most useful customer personas?",
                    "metadata": {
                        "options": [
                            "Tell me about streetwear customers.",
                            "Create 3 detailed customer personas for a Filipino streetwear brand targeting ages 18-28 in Metro Manila. For each persona, include their daily routine, social media habits, fashion pain points, and what would make them choose a local brand over international ones like H&M or Uniqlo.",
                            "Who buys clothes in the Philippines? List demographics.",
                            "Write a marketing plan for a clothing brand."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B is the strongest prompt because it specifies the exact product (Filipino streetwear), narrows the audience (ages 18-28, Metro Manila), and asks for actionable details like daily routines, social media habits, and competitive comparison. Vague prompts like 'tell me about customers' produce generic, unusable output. Great prompts give AI the context it needs to deliver specific, relevant results."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You need to rewrite this feature as a benefit: 'Our app uses end-to-end encryption.' Which prompt would give you the best benefit-focused copy?",
                    "metadata": {
                        "options": [
                            "Rewrite this feature for my landing page: 'Our app uses end-to-end encryption.' Turn it into a customer benefit that a non-technical Filipino online seller would care about. Focus on how it protects their money and customer data. Keep it under 20 words.",
                            "Make this sound better: end-to-end encryption.",
                            "Explain end-to-end encryption in a paragraph.",
                            "Write 10 features of a secure messaging app."
                        ],
                        "correct_index": 0,
                        "explanation": "Option A works best because it tells AI exactly who the reader is (non-technical Filipino online seller), what outcome to focus on (protecting money and customer data), and gives a constraint (under 20 words). It transforms a technical feature into a relatable benefit. The other prompts either lack audience context or ask for the wrong output entirely."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A sari-sari store owner wants to start selling online using a new e-commerce app. What is the strongest 'benefit' statement to use in a Facebook ad targeting this audience?",
                    "metadata": {
                        "options": [
                            "Our app features inventory management, payment processing, and delivery integration.",
                            "Start selling to customers beyond your street — earn more without leaving your store.",
                            "We are a technology company founded in 2024 with a team of 50 engineers.",
                            "Download our app. It has many features for small businesses."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B speaks directly to the store owner's desire (earn more) and frames the product in terms of their life (selling beyond your street, without leaving your store). It answers the 'so what?' question. Option A is pure features. Option C is about the company, not the customer. Option D is vague and gives no reason to act. Benefits always connect your product to a specific improvement in the customer's life."
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
                    "type": "quiz",
                    "content": "You need a Facebook ad headline for a Filipino online English tutoring service targeting OFW parents who want their kids to improve in school. Which prompt follows the copy prompt formula (audience + goal + tone + constraints) best?",
                    "metadata": {
                        "options": [
                            "Write a headline for an English tutoring service.",
                            "Write a Facebook ad headline for OFW parents aged 30-45 who want their children in the Philippines to excel in English at school. Goal: get them to book a free trial lesson. Tone: warm and reassuring, like a trusted teacher. Max 12 words, mention 'free trial'.",
                            "Write something catchy about tutoring. Make it go viral.",
                            "Create a professional advertisement for educational services targeting the global Filipino diaspora market segment."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B nails all four elements: Audience (OFW parents 30-45 wanting kids to excel), Goal (book a free trial), Tone (warm, reassuring), and Constraints (max 12 words, include 'free trial'). Option A lacks all four elements. Option C is vague and 'go viral' is not a copywriting instruction. Option D uses corporate jargon that would produce stiff, impersonal copy. The more specific your prompt, the more usable the output."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You asked AI to write a product description for a local coffee brand and got this: 'Experience the exquisite amalgamation of premium Benguet arabica beans, meticulously curated through our proprietary roasting methodology.' What should you do next?",
                    "metadata": {
                        "options": [
                            "Use it as-is — it sounds premium and sophisticated",
                            "Prompt AI: 'Rewrite this in plain conversational Taglish that a 25-year-old coffee lover scrolling Instagram would actually stop and read. Keep the Benguet origin as a selling point but make it sound like a friend recommending their favorite coffee. Max 2 sentences.'",
                            "Delete it and write everything from scratch without AI",
                            "Add more technical details about the roasting process"
                        ],
                        "correct_index": 1,
                        "explanation": "The original output is overwritten jargon that no real customer talks like. Option B fixes it by giving AI a clear rewrite instruction: specific audience (25-year-old on Instagram), tone (friend recommending), format (Taglish, 2 sentences), and what to keep (Benguet origin). AI often defaults to formal language — your job is to redirect it toward how your audience actually communicates. Always iterate on AI output rather than accepting the first draft."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're writing a CTA button for a landing page selling an online baking course to Filipino home bakers. Which CTA would likely get the highest click-through rate?",
                    "metadata": {
                        "options": [
                            "Submit",
                            "Click Here",
                            "Start Baking Like a Pro — Enroll Now",
                            "Learn More About Our Terms and Conditions"
                        ],
                        "correct_index": 2,
                        "explanation": "Option C combines a benefit ('Baking Like a Pro') with a clear action ('Enroll Now'), creating both desire and direction. 'Submit' is generic and clinical. 'Click Here' tells them what to do but not why. Option D is irrelevant to the conversion goal. Effective CTAs always answer two questions: 'What will I get?' and 'What do I do?' Great marketers use AI to generate multiple CTA variations and pick the one that best combines benefit with action."
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
                    "type": "quiz",
                    "content": "You want AI to write a Facebook ad for a weight-loss meal plan delivery service using the PAS framework. Which prompt would produce the best result?",
                    "metadata": {
                        "options": [
                            "Write a Facebook ad for a meal plan service. Use PAS.",
                            "Write an ad about healthy food delivery in Manila. Make it persuasive and long.",
                            "Using the PAS framework, write a Facebook ad for a calorie-counted meal delivery service targeting busy Manila professionals aged 25-35 who want to lose weight but have no time to cook. Problem: gaining weight from daily fast food and Grab Food orders. Agitate: clothes getting tighter, low energy at work, dreading stepping on the scale. Solve: chef-prepared healthy meals delivered to your office for under P200/meal. Tone: empathetic, not preachy. Max 4 sentences.",
                            "List the benefits of healthy eating for office workers."
                        ],
                        "correct_index": 2,
                        "explanation": "Option C explicitly maps each PAS stage to specific, emotionally resonant details the audience would recognize (Grab Food orders, clothes getting tighter, dreading the scale). It also specifies tone, length, and a concrete price point. Option A mentions PAS but gives AI nothing to work with. Option B ignores the framework entirely. Option D asks for a list, not an ad. The best framework prompts fill in each stage with audience-specific details."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're writing copy for a new project management app targeting Filipino startup founders. Which prompt correctly applies the Before-After-Bridge framework?",
                    "metadata": {
                        "options": [
                            "Using the Before-After-Bridge framework, write an Instagram ad for a project management app targeting Filipino startup founders running teams of 5-15 people. Before: missing deadlines, tasks falling through cracks, team miscommunication on Viber and email. After: every task tracked, deadlines met, team aligned in one dashboard. Bridge: our app replaces your chaotic Viber groups with organized project boards. Tone: confident and direct.",
                            "Write a Before-After-Bridge ad for a tech product. Make it professional.",
                            "Describe the features of a project management tool using bullet points.",
                            "Write an AIDA ad for a project management app for startups."
                        ],
                        "correct_index": 0,
                        "explanation": "Option A correctly maps each stage: Before (specific pain points the audience recognizes — Viber chaos, missed deadlines), After (concrete improvements — deadlines met, team aligned), and Bridge (the product connecting the two). It also includes audience specifics, platform, and tone. Option B is too vague. Option C asks for features, not a framework ad. Option D uses the wrong framework entirely. The key to framework prompts is filling each stage with details your audience would nod along to."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A client sells premium handmade leather bags online and wants to target young professionals in Makati who currently buy mass-produced bags from fast fashion brands. The audience doesn't yet know they have a 'problem' with their current bags. Which framework is the best fit?",
                    "metadata": {
                        "options": [
                            "PAS — because you need to agitate their pain about fast fashion",
                            "Before-After-Bridge — because the transformation story is the strongest angle",
                            "AIDA — because you first need to grab attention and build interest in a product category they haven't considered yet",
                            "No framework is needed — just post product photos"
                        ],
                        "correct_index": 2,
                        "explanation": "AIDA is the best fit because this audience doesn't yet realize they have a problem — they're happy with their current bags. You need to start from scratch: grab Attention (a striking visual or bold statement about craftsmanship), build Interest (why handmade leather matters), create Desire (how it elevates their professional image), then prompt Action (shop now). PAS requires an existing pain point the audience already feels. Before-After-Bridge works best with clear transformation stories. AIDA is designed for new audiences who need the complete journey from awareness to action."
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
                    "type": "quiz",
                    "content": "You want AI to adapt a product launch announcement for TikTok. Which prompt would produce the most platform-appropriate content?",
                    "metadata": {
                        "options": [
                            "Write a TikTok post about our new product launch.",
                            "Write a professional product announcement suitable for all social media platforms. Include formal language and a detailed product specification sheet.",
                            "Write a 15-second TikTok video script for a Filipino skincare brand launching a new sunscreen. Hook in the first 2 seconds: start with a relatable problem ('POV: you're melting in Manila heat'). Use trending casual tone, Taglish OK. End with a CTA to check the link in bio. Include a suggestion for trending audio style.",
                            "Create a TikTok video. Make it fun and viral. Our product is sunscreen."
                        ],
                        "correct_index": 2,
                        "explanation": "Option C nails TikTok's requirements: specific video length, a hook in the first 2 seconds (critical for TikTok's algorithm), a relatable POV format that's trending, casual Taglish tone matching Filipino TikTok culture, and a platform-specific CTA (link in bio). Option A is too vague. Option B would produce LinkedIn-style content. Option D is vague — 'fun and viral' gives AI no actionable direction. Platform-specific prompts must reflect how content actually works on each platform."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You manage social media for a Filipino accounting firm that wants to attract small business clients. You have a core message: 'We handle your taxes so you can focus on growing your business.' Which prompt best adapts this for LinkedIn?",
                    "metadata": {
                        "options": [
                            "Post this on LinkedIn: 'We handle your taxes so you can focus on growing your business.' Add some emojis.",
                            "Write a LinkedIn post for a Philippine accounting firm targeting SME owners. Transform this core message into a thought leadership post: 'We handle your taxes so you can focus on growing your business.' Include a relevant BIR compliance insight or tax-saving tip that demonstrates expertise. Professional tone, no emojis. End with a soft CTA to connect or book a consultation. 150-200 words.",
                            "Write a funny TikTok script about doing taxes. Make it go viral on LinkedIn.",
                            "Create a LinkedIn article about the history of taxation in the Philippines. 2000 words."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B correctly adapts for LinkedIn's culture: thought leadership that demonstrates expertise, professional tone, a specific value-add (tax tip), and a soft CTA appropriate for B2B networking. It transforms the core message rather than just copy-pasting it. Option A just dumps the message with no adaptation. Option C mixes platform cultures inappropriately. Option D is too long and educational for a social post. LinkedIn rewards expertise and professional value — your prompt should reflect that."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A new Filipino restaurant in BGC wants maximum local awareness in their first month. Their budget is limited to P15,000 for paid promotion. Which platform combination would you recommend?",
                    "metadata": {
                        "options": [
                            "LinkedIn and YouTube — professional audience and long-form content build credibility",
                            "Facebook for community groups and local targeting, plus TikTok for organic viral reach with food content",
                            "Twitter/X only — food goes viral through text-based tweets",
                            "Instagram only — focus exclusively on aesthetic food photography"
                        ],
                        "correct_index": 1,
                        "explanation": "Facebook is essential for local restaurants in the Philippines — its hyper-local ad targeting, community groups (BGC food groups have hundreds of thousands of members), and Marketplace reach are unmatched. TikTok complements it perfectly because food content performs exceptionally well organically, potentially giving viral reach without ad spend. LinkedIn is wrong for a restaurant. Instagram alone misses the community-building power of Facebook. With a small budget, you need platforms where organic reach is still strong (TikTok) plus precise paid targeting (Facebook)."
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
                    "type": "quiz",
                    "content": "You want AI to generate a content calendar for your Filipino online pet shop. Which prompt would produce the most usable, ready-to-execute calendar?",
                    "metadata": {
                        "options": [
                            "Give me content ideas for a pet shop.",
                            "Create a 4-week Facebook content calendar for a Filipino online pet shop targeting pet owners aged 22-35 in Metro Manila. Post 5 times per week. Rotate between these pillars: pet care tips (educational), cute customer pet photos (engagement), product highlights (promotional), behind-the-scenes of our warehouse (authenticity), and pet memes/humor (entertainment). Format as a table with columns: Day, Pillar, Post Type (text/image/video/carousel), Caption Hook, and CTA. Keep promotional posts under 20% of total.",
                            "Write 30 social media posts about pets.",
                            "Plan my entire social media strategy for 2026."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B gives AI everything needed to produce a calendar you can actually use: specific business and audience, posting frequency, defined content pillars with the 80/20 rule built in, a table format for easy reference, and specific columns that map to execution. Option A would produce random ideas with no structure. Option C gives no strategy or organization. Option D is far too broad for a single prompt. The best calendar prompts define pillars, frequency, format, and the balance between value and promotion."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're building content pillars for a Filipino digital marketing agency's social media. Which prompt would help you create the most effective pillar strategy?",
                    "metadata": {
                        "options": [
                            "What should a marketing agency post on social media?",
                            "I run a digital marketing agency in Makati targeting Filipino SME owners who are skeptical about hiring agencies. Suggest 5 content pillars that build trust and demonstrate expertise. For each pillar, give me: the pillar name, why it builds trust with skeptical prospects, 3 example post ideas, and recommended post frequency per week. Our goal is to generate inbound leads, not just followers.",
                            "Give me 100 post ideas for a marketing agency.",
                            "Write viral content for a marketing company."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B stands out because it ties the content pillars to a specific business goal (building trust with skeptical prospects to generate leads). It asks AI to justify each pillar strategically, not just list topics. The prompt also gives context about the audience's mindset (skeptical about agencies), which helps AI suggest pillars like case studies and transparent pricing breakdowns rather than generic marketing tips. Great content strategies start with understanding why you're posting, not just what."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Your content calendar shows you're posting every day, but engagement has been dropping for 3 weeks straight. Your posts are a mix of product promotions and sale announcements. What is the most likely problem?",
                    "metadata": {
                        "options": [
                            "You're not posting frequently enough — increase to 3 times per day",
                            "Your content lacks variety — too many promotional posts fatigue your audience, and you need to add value-driven content pillars like educational tips, entertainment, and engagement posts",
                            "Social media algorithms are broken — there's nothing you can do",
                            "You should delete all previous posts and start fresh"
                        ],
                        "correct_index": 1,
                        "explanation": "Dropping engagement despite consistent posting is a classic sign of content fatigue from over-promotion. When every post is a sale or product push, followers tune out or unfollow. The 80/20 rule exists for this reason: 80% of content should deliver value (educate, entertain, inspire) and only 20% should sell. Adding content pillars like customer stories, industry tips, behind-the-scenes, and interactive posts re-engages your audience and rebuilds algorithmic favor."
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
                    "type": "quiz",
                    "content": "You need an AI-generated image for a Facebook ad promoting a new Filipino milk tea shop. Which image generation prompt would produce the most effective ad visual?",
                    "metadata": {
                        "options": [
                            "A milk tea.",
                            "A professional product photo of brown sugar milk tea in a clear plastic cup with tapioca pearls, held by a young Filipino woman's hand against a pastel pink background, bright studio lighting, shallow depth of field, Instagram-worthy food photography style, clean and appetizing composition with space on the left for text overlay.",
                            "An extremely detailed hyper-realistic 8K rendering of a beverage container with spherical tapioca inclusions, volumetric lighting, ray-traced reflections.",
                            "A cartoon drawing of a cup of tea with a smiley face."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B follows the marketing visual formula: clear subject (brown sugar milk tea), specific style (product photography), mood (bright, appetizing), composition details (held by hand, pastel background), and a crucial marketing consideration — space for text overlay. Option A is too vague to produce anything usable. Option C uses technical 3D rendering jargon that won't produce a natural product photo. Option D doesn't match the premium positioning of a real business. For marketing visuals, specify style, mood, and composition — and always leave room for ad copy."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're creating visuals for an Instagram carousel about '5 Tips for Working from Home.' Which prompt approach would produce the best set of images?",
                    "metadata": {
                        "options": [
                            "Generate 5 random images about working from home.",
                            "Create a cohesive set of 5 images for an Instagram carousel. Each image should have the same visual style: flat illustration with a warm color palette of coral, cream, and sage green. Image 1: organized desk setup with laptop and plants. Image 2: person stretching at desk. Image 3: healthy lunch on a clean desk. Image 4: person on video call with headphones. Image 5: sunset view from a home office window. Consistent minimalist style, square format, clean negative space for text.",
                            "Make pretty pictures for social media about remote work.",
                            "Photograph a real person working in their house."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B ensures visual consistency across the carousel by specifying a unified style (flat illustration), color palette (coral, cream, sage green), and format (square with negative space for text). Each image has a distinct subject matching a specific tip. Carousels need visual cohesion to look professional — random styles across slides look amateur. Option A would produce inconsistent results. Option C is too vague. Option D requests photography that AI image generators handle differently than illustrations."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Your AI-generated ad image for a luxury Filipino resort looks great, but the client says it 'doesn't feel premium enough.' What should you adjust in your image prompt?",
                    "metadata": {
                        "options": [
                            "Add the words 'expensive' and 'luxury' five times in the prompt",
                            "Adjust the mood and lighting descriptors: change from general terms to specific premium cues like 'golden hour warm lighting, deep shadows, rich warm tones, cinematic composition, editorial travel photography style, shallow depth of field with bokeh'",
                            "Make the image bigger — larger resolution equals more premium",
                            "Add a visible price tag showing the room rate in the image"
                        ],
                        "correct_index": 1,
                        "explanation": "Premium feel in visual content comes from specific lighting, color, and style cues — not from repeating the word 'luxury.' Golden hour lighting, cinematic composition, deep shadows, and editorial photography style are visual signals that connote high-end quality. These are the same techniques real luxury brand photographers use. Resolution doesn't affect perceived quality in the way composition and lighting do. Learning to use mood and style descriptors is the key skill in AI image generation for marketing."
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
                    "type": "quiz",
                    "content": "You want AI to write email subject lines for a flash sale on a Filipino fashion e-commerce site. Which prompt would produce the most testable, high-quality subject lines?",
                    "metadata": {
                        "options": [
                            "Write email subject lines for a sale.",
                            "Write 10 email subject lines for a 48-hour flash sale on a Filipino online fashion store targeting women aged 20-30. Mix these approaches: 3 curiosity-based (make them want to open to find out more), 3 urgency-based (time pressure), 2 benefit-based (what they save), 2 personal/conversational (like a friend texting). Keep each under 45 characters. Avoid spam trigger words like 'FREE' in all caps. Include emojis on only 3 of them.",
                            "Write the best subject line ever for an email. Make sure everyone opens it.",
                            "Create professional email headers for a retail communication regarding a limited-time promotional event."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B is powerful because it requests multiple approaches (curiosity, urgency, benefit, personal) for A/B testing, sets character limits for mobile preview, avoids spam triggers, and controls emoji usage. It gives AI a framework to produce varied, testable options. Option A produces generic results. Option C is impossible — no single subject line works for everyone. Option D uses corporate language that would produce stiff, low-open-rate subject lines. Great email marketers generate many variations and let data pick the winner."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You need to write a cart abandonment email for a Filipino electronics store. A customer left a smartphone in their cart 2 hours ago. Which prompt would produce the most effective recovery email?",
                    "metadata": {
                        "options": [
                            "Write an email about a product someone left in their cart.",
                            "Write a cart abandonment email for a Filipino electronics store. The customer left a smartphone (Samsung Galaxy A55, P18,990) in their cart 2 hours ago. Subject line: create curiosity about what they left behind. Body: remind them what they're missing, include 1 social proof element (e.g., 'X people are viewing this right now'), add a sense of gentle urgency (low stock), and end with a single clear CTA button: 'Complete My Order'. Tone: helpful, not pushy. Under 100 words. Mention free delivery within Metro Manila.",
                            "Send a reminder about items in the shopping cart. Be professional.",
                            "Write an aggressive sales email demanding the customer buy the product immediately."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B includes every element of an effective cart abandonment email: specific product details (so the customer remembers exactly what they wanted), social proof (others are viewing it), gentle urgency (low stock, not fake countdown timers), a single clear CTA, and a sweetener (free delivery). The tone instruction — helpful, not pushy — is critical because aggressive recovery emails backfire. Option A lacks specifics. Option C is too generic. Option D would alienate the customer. Cart abandonment emails should feel like a helpful reminder, not a sales ambush."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're building a 3-email welcome sequence for new subscribers to a Filipino cooking blog. What should the primary goal of Email 1 be?",
                    "metadata": {
                        "options": [
                            "Immediately sell your most expensive product — they just signed up, so they're ready to buy",
                            "Deliver the promised freebie (if any), introduce your brand personality, and set expectations for what emails they'll receive and how often",
                            "Send a plain text email with just the word 'Welcome' and nothing else",
                            "Share your entire life story and business history in a 2000-word email"
                        ],
                        "correct_index": 1,
                        "explanation": "Email 1 in a welcome sequence builds the foundation of the relationship. Deliver on your promise (the freebie that got them to subscribe), show your brand personality so they know what to expect, and set email frequency expectations. This builds trust and reduces unsubscribes. Selling immediately in Email 1 feels like a bait-and-switch. A bare 'Welcome' wastes the highest-engagement email you'll ever send (welcome emails have 50-60% open rates). A novel-length email will never be read. Earn trust first, sell later."
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
                    "type": "quiz",
                    "content": "You want AI to help with keyword research for a Filipino wedding planning business. Which prompt would produce the most actionable keyword strategy?",
                    "metadata": {
                        "options": [
                            "Give me SEO keywords for a wedding planner.",
                            "I run a wedding planning business in Tagaytay, Philippines, targeting couples aged 25-35 with budgets of P300K-P1M. Generate 20 keyword ideas grouped by search intent: informational (couples researching), commercial (comparing options), and transactional (ready to book). For each keyword, estimate competition level (low/medium/high) and suggest which 5 I should target first as a new website with low domain authority. Include long-tail keywords specific to Tagaytay weddings.",
                            "What are the top 100 wedding keywords globally?",
                            "Help me rank #1 on Google for 'wedding planner'."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B produces a targeted, actionable keyword strategy because it specifies location (Tagaytay), audience demographics, budget range, and asks for intent-based grouping. Crucially, it asks AI to prioritize for a new website with low domain authority — meaning it will suggest winnable long-tail keywords rather than impossible-to-rank broad terms. Option A is too vague. Option C ignores local market specifics. Option D targets an impossibly competitive keyword. Smart SEO starts with keywords you can actually win."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You wrote a blog post titled 'Best Cafes in Makati for Remote Work' and want AI to write the meta description. Which prompt would produce the most effective SEO meta description?",
                    "metadata": {
                        "options": [
                            "Write a meta description for my blog post about cafes.",
                            "Write an SEO meta description for my blog post 'Best Cafes in Makati for Remote Work 2026.' Target keyword: 'cafes in Makati for remote work.' Include: the keyword naturally in the first half, a specific value hook (e.g., number of cafes reviewed, Wi-Fi speed tested), and a reason to click over competing results. Must be under 155 characters. End with a soft CTA.",
                            "Describe my blog post in one paragraph. Include all the cafe names and addresses.",
                            "Write a 500-word summary of my article about Makati cafes."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B follows meta description best practices: keyword placement in the first half (so Google bolds it in results), a specific value hook that differentiates from competitors, character limit compliance (Google truncates after ~155 characters), and a CTA to drive the click. Option A is too vague. Option C tries to cram too much information into a meta description. Option D is far too long — meta descriptions are 1-2 sentences. A great meta description is a mini-ad for your page in search results."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A Filipino food blogger wants to rank for 'best adobo recipe.' Their site is brand new with no backlinks. What is the smartest SEO strategy?",
                    "metadata": {
                        "options": [
                            "Write one 500-word post targeting 'best adobo recipe' and wait for it to rank",
                            "Target long-tail variations first like 'chicken adobo recipe for beginners' and 'adobo recipe with coconut milk Visayan style,' build authority with multiple related posts, then target the broader keyword later",
                            "Buy 1000 backlinks from a cheap provider to boost domain authority overnight",
                            "Copy the top-ranking article and change a few words to avoid detection"
                        ],
                        "correct_index": 1,
                        "explanation": "New sites cannot compete for broad, high-competition keywords like 'best adobo recipe' — established food blogs with years of authority dominate those results. The smart strategy is to target specific long-tail keywords with lower competition, build a cluster of related content that establishes topical authority, and gradually work toward broader terms. Buying backlinks violates Google's guidelines and risks penalties. Copying content is plagiarism and will be detected. SEO is a long game — start where you can win and build from there."
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
                    "type": "quiz",
                    "content": "You want AI to write a Facebook post announcing a new product, but every draft sounds generic and corporate. Which prompt would best train AI to write in your brand's specific voice?",
                    "metadata": {
                        "options": [
                            "Write a Facebook post about our new product. Make it sound like our brand.",
                            "You are writing as BrightSip, a Filipino juice brand. Our voice is: casual, enthusiastic, playful, peer-like. We sound like your energetic best friend who just discovered something amazing. We use short punchy sentences. Light Taglish on social media is encouraged. We say: 'Game-changer!', 'Your taste buds will thank you', 'Sip the good stuff.' We never say: 'We are pleased to announce', 'Dear valued customers', 'Leverage our synergies.' Here are 2 examples of our past posts: [paste examples]. Now write a Facebook post announcing our new calamansi-ginger juice. Include an emoji or two.",
                            "Write in a fun voice. Be creative and unique.",
                            "Announce our new juice product using marketing best practices and industry-standard communication protocols."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B is a complete brand voice prompt: it names the brand, defines all four voice dimensions, provides a persona metaphor ('energetic best friend'), gives specific vocabulary guidance ('we say / we never say'), includes real examples for AI to pattern-match, and specifies the task. This produces consistently on-brand output. Option A assumes AI knows your brand. Option C is vague — 'fun' means different things to different brands. Option D would produce the exact corporate tone you're trying to avoid."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're creating a brand voice guide for a new Filipino fintech app targeting Gen Z college students. Which voice dimension combination best fits this audience?",
                    "metadata": {
                        "options": [
                            "Formal, calm, serious, expert — because financial products need to sound authoritative and trustworthy",
                            "Casual, enthusiastic, playful, peer-like — because Gen Z college students respond to relatable, approachable communication that doesn't talk down to them",
                            "Formal, enthusiastic, playful, expert — mixing opposite dimensions shows range",
                            "No defined voice — let each team member write however they want for authenticity"
                        ],
                        "correct_index": 1,
                        "explanation": "Gen Z college students are most responsive to brands that feel like peers, not parents or professors. Casual and playful doesn't mean unprofessional — it means approachable. Think of how GCash and Maya communicate versus traditional banks. They simplified financial language and made it feel accessible. Option A would feel like a bank lecture. Option C creates a contradictory, confusing voice. Option D leads to inconsistent brand perception. Your voice should match how your audience actually communicates with each other."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A luxury Filipino jewelry brand has a brand voice defined as: formal, calm, serious, expert. Their social media manager writes this Instagram caption: 'OMG besties!! Our NEW collection just dropped and it's SO fire!! Grab yours before they're GONE!! Link in bio!!' What feedback should you give?",
                    "metadata": {
                        "options": [
                            "The caption is perfect — it's energetic and will drive engagement",
                            "The caption completely violates the brand voice. Rewrite it to match the formal, calm, serious, expert dimensions — something like: 'Introducing the Heritage Collection. Each piece is handcrafted by Filipino artisans using ethically sourced gold. Discover the collection through the link in our bio.'",
                            "Add more exclamation marks to make it even more exciting",
                            "The brand voice guide is wrong — all Instagram captions should be casual and hype-driven"
                        ],
                        "correct_index": 1,
                        "explanation": "Brand voice consistency is non-negotiable — especially for luxury brands where perception of quality directly ties to communication style. 'OMG besties' and 'SO fire' completely undermine the premium positioning. The rewrite maintains Instagram's format (short, visual-first, link in bio CTA) while preserving the formal, calm, expert voice. Luxury brands like Tiffany and Cartier prove you can be engaging on social media without abandoning elegance. The platform changes the format, not the voice."
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
                    "type": "quiz",
                    "content": "You want AI to analyze your campaign data and give actionable recommendations. Which prompt would produce the most useful analysis?",
                    "metadata": {
                        "options": [
                            "My ads aren't working. Fix them.",
                            "Here are my Facebook ad results from the last 14 days for my Filipino online clothing store:\n- Ad Set A (women 18-24): Spend P5,000 | Impressions 45,000 | Clicks 900 | Add to Cart 120 | Purchases 18 | Revenue P27,000\n- Ad Set B (women 25-34): Spend P5,000 | Impressions 30,000 | Clicks 450 | Add to Cart 85 | Purchases 22 | Revenue P44,000\nCalculate CTR, conversion rate, CPC, CPA, and ROAS for each ad set. Tell me which is performing better overall (not just by one metric). Should I shift budget? What specific changes should I test next?",
                            "Analyze marketing data for me. Give me insights.",
                            "Tell me what ROAS means and how to calculate it."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B gives AI structured data to work with, asks for specific calculations across multiple metrics, and requests comparative analysis with actionable next steps. This produces insights like 'Ad Set B has lower CTR but higher ROAS — the audience is smaller but more valuable. Shift 60% of budget to B and test new creatives for A.' Option A gives AI nothing to analyze. Option C provides no data. Option D asks for a definition, not analysis. The quality of AI marketing analysis is entirely dependent on the quality and specificity of the data you provide."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're looking at two Facebook ad campaigns for a Filipino travel agency. Campaign A: 5% CTR, P8 CPC, P400 CPA, 2:1 ROAS. Campaign B: 1.5% CTR, P22 CPC, P180 CPA, 5:1 ROAS. Which campaign is performing better?",
                    "metadata": {
                        "options": [
                            "Campaign A — it has a much higher CTR and lower CPC, so the ads are clearly working better",
                            "Campaign B — despite lower CTR and higher CPC, it has a much lower CPA and higher ROAS, meaning it's more profitable per customer acquired",
                            "They're performing equally — one metric being better cancels out the other",
                            "Neither is good — both should be paused immediately"
                        ],
                        "correct_index": 1,
                        "explanation": "This is a crucial lesson in metric hierarchy. CTR and CPC measure ad engagement, but CPA and ROAS measure business outcomes. Campaign B converts fewer clickers but those clickers are far more likely to buy and spend more — P180 CPA vs. P400, and 5:1 ROAS vs. 2:1. Campaign A gets cheap clicks that don't convert. In marketing, profitability metrics (ROAS, CPA) always matter more than engagement metrics (CTR, CPC). A high CTR with poor ROAS just means you're paying for window shoppers."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Your client asks you to analyze their marketing performance. Which prompt would help AI give the most structured, decision-ready analysis?",
                    "metadata": {
                        "options": [
                            "Look at my numbers and tell me what to do.",
                            "I manage Facebook ads for a Filipino SaaS company selling HR software at P2,500/month per user. Here's our last 30 days: Spend P50,000 | Impressions 200,000 | Clicks 3,000 | Landing Page Views 2,400 | Free Trial Sign-ups 90 | Paid Conversions 12 | Revenue P30,000/month recurring. Calculate all funnel metrics. Identify the weakest stage in the funnel (impressions → clicks → landing page → trial → paid). For the weakest stage, suggest 3 specific tests I should run. Our target CPA is P3,000.",
                            "Are my ads good or bad?",
                            "Give me a report template I can use for any campaign."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B provides the complete funnel data AI needs to identify exactly where the problem is. It includes the business model context (SaaS, P2,500/month), which helps AI evaluate whether CPA and ROAS make sense. It specifies the full funnel stages so AI can calculate drop-off at each point. And it asks for specific, testable recommendations — not just observations. Option A gives no data. Option C is a yes/no question that produces shallow analysis. Option D asks for a template instead of actual analysis. The more structured your data input, the more actionable AI's output."
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
                    "type": "quiz",
                    "content": "You want AI to create a complete campaign plan for launching a new Filipino meal kit delivery service in Cebu. Which prompt would produce the most comprehensive, actionable plan?",
                    "metadata": {
                        "options": [
                            "Make a marketing plan for a food delivery service.",
                            "Create a 6-week launch campaign plan for a Filipino meal kit delivery service expanding to Cebu City. Budget: P150,000. Goal: 1,000 subscribers in the first 6 weeks. Target audience: dual-income couples aged 28-40 in Cebu IT Park and Ayala area who want to cook at home but hate grocery shopping. Include: (1) A weekly phase breakdown (teaser, launch, growth, sustain), (2) Channel strategy with budget allocation per channel, (3) Key messaging for each phase, (4) 3 measurable KPIs per phase, (5) Contingency plan if we're behind target by Week 3. Format as a structured brief I can share with my team.",
                            "How do I launch a food business in Cebu?",
                            "Write a campaign. Use Facebook, Instagram, and TikTok. Budget P150K."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B answers all 7 campaign brief questions and goes further — it requests phased execution, specific KPIs, budget allocation, and even a contingency plan. The audience description is specific enough for AI to craft targeted messaging (dual-income couples, Cebu IT Park, hate grocery shopping). It also requests a team-shareable format. Option A is too vague to produce anything usable. Option C asks about general business launch, not a marketing campaign. Option D lists channels but lacks strategy, audience, or goals."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You're planning a campaign brief and need to set a realistic budget allocation for a P100,000 digital campaign launching a new Filipino beauty product. Which allocation follows digital marketing best practices?",
                    "metadata": {
                        "options": [
                            "P100,000 on influencer partnerships — influencers are the only thing that matters in beauty marketing",
                            "P55,000 on paid ads (Facebook/Instagram/TikTok), P20,000 on content creation (visuals, video, copy), P15,000 on micro-influencer partnerships, P5,000 on email marketing tools, P5,000 on testing and contingency",
                            "P90,000 on a single TV commercial and P10,000 on everything else",
                            "Split equally: P20,000 on each of 5 channels regardless of their effectiveness for your audience"
                        ],
                        "correct_index": 1,
                        "explanation": "Option B follows the recommended allocation: 50-60% on paid ads (your primary distribution engine), 15-20% on content creation, 10-15% on influencers, and reserves for tools and contingency. It ensures most budget goes toward measurable, scalable channels while maintaining content quality. Spending everything on influencers is high-risk with no guaranteed reach. TV is wrong for a digital-first P100K campaign. Equal splitting ignores that different channels have different ROI potentials for different products and audiences."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Your campaign brief says the objective is to 'increase brand awareness.' A senior marketer reviews it and says the objective needs to be more specific. Which revision is best?",
                    "metadata": {
                        "options": [
                            "Increase brand awareness a lot in the Philippines",
                            "Generate 500 email sign-ups and achieve 200,000 impressions across Facebook and Instagram among women aged 22-30 in Metro Manila within 4 weeks, with a target CPM of P80 or less",
                            "Make the brand famous and go viral on social media",
                            "Get as many followers as possible on all platforms"
                        ],
                        "correct_index": 1,
                        "explanation": "Option B is a SMART objective: Specific (email sign-ups and impressions), Measurable (500 sign-ups, 200K impressions, P80 CPM), Achievable (realistic numbers), Relevant (targets the right audience), and Time-bound (4 weeks). Vague objectives like 'increase awareness' or 'go viral' are impossible to measure — you can never know if you succeeded. 'As many followers as possible' has no target and no strategy. Every campaign objective should have a number, a timeframe, and a clear definition of success."
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
                    "type": "quiz",
                    "content": "Your campaign launched 24 hours ago and early results show a CTR of 0.8% (below the 1% benchmark). Your manager wants you to immediately change all the ad creatives. What should you do?",
                    "metadata": {
                        "options": [
                            "Immediately swap all creatives — the data clearly shows the ads are failing",
                            "Wait at least 48-72 hours before making changes. Facebook's algorithm needs 2-3 days to optimize delivery, and 24 hours of data is not statistically significant. Document the current performance and set a review checkpoint at 72 hours.",
                            "Pause the entire campaign and start over from scratch",
                            "Triple the budget to force better results"
                        ],
                        "correct_index": 1,
                        "explanation": "Making changes in the first 24-48 hours is one of the most common campaign mistakes. Ad platforms need time to exit the 'learning phase' — during this period, delivery is intentionally unoptimized as the algorithm figures out who to show your ads to. Early data is noisy and unreliable. Changing creatives restarts the learning phase, wasting the data already collected. The disciplined move is to wait 48-72 hours, then make data-driven decisions with statistically meaningful results."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to help you generate A/B test variations for your underperforming Facebook ad headline. Which prompt would produce the most strategically useful test options?",
                    "metadata": {
                        "options": [
                            "Write a better headline for my ad.",
                            "My current Facebook ad headline for a Filipino online accounting course is: 'Learn Accounting Online.' CTR is 0.9% (below our 2% target). Generate 4 alternative headlines testing these specific angles: (1) urgency — limited-time offer, (2) curiosity — open a knowledge gap, (3) benefit — focus on career/salary outcome, (4) social proof — emphasize number of graduates. Keep each under 40 characters. Explain which angle you'd test first and why.",
                            "Write 50 headline options so I can pick the best one.",
                            "Make my headline go viral. Use emotional triggers and power words."
                        ],
                        "correct_index": 1,
                        "explanation": "Option B is a structured A/B test prompt: it provides the current baseline (the headline and its CTR), defines the performance gap (0.9% vs. 2% target), and requests exactly 4 variations each testing a different psychological angle. This produces meaningful tests where you can learn which angle resonates with your audience. Option A gives no baseline. Option C produces too many options without strategic purpose — you can only test a few at a time. Option D is vague. Effective A/B testing changes one variable at a time with a clear hypothesis."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Your 4-week campaign is at the end of Week 2. Results so far: Week 1 ROAS was 4.2:1 (above target), but Week 2 ROAS dropped to 2.1:1. Total spend is on budget. What is the most likely explanation and correct response?",
                    "metadata": {
                        "options": [
                            "The campaign is failing — shut it down immediately and save the remaining budget",
                            "This is likely ad fatigue or audience saturation. The same people have seen your ads multiple times and stopped responding. Test new creatives while keeping the winning audience targeting, and consider expanding the audience slightly to reach fresh users.",
                            "Double the budget to compensate for the lower ROAS — more money will fix it",
                            "The platform's algorithm is broken — switch to a different ad platform entirely"
                        ],
                        "correct_index": 1,
                        "explanation": "A decline from Week 1 to Week 2 with the same targeting strongly suggests ad fatigue — your audience has seen the same creatives too many times and the novelty has worn off. This is completely normal in digital advertising. The fix is to refresh creatives while keeping the audience targeting that proved effective in Week 1. Expanding the audience slightly also helps reach people who haven't seen your ads yet. Shutting down wastes a campaign that was profitable in Week 1. Doubling budget on fatigued creatives accelerates the problem. This is why having multiple creative variations ready at launch is essential."
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
