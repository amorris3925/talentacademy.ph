#!/usr/bin/env python3
"""Seed the 'AI Operations & Systems' track with 5 modules and 12 lessons via Supabase REST API."""

import json
import urllib.request

SUPABASE_URL = "https://szdpzjlhbkytonuhlwif.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZHB6amxoYmt5dG9udWhsd2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI5ODgwNCwiZXhwIjoyMDg0ODc0ODA0fQ.K-vQBAvsZU7T3MVYCzG1SIL_IlWNO2rvzTN_WyFNYVM"
TRACK_ID = "86bd5436-3ff8-4252-8878-33a7a4c178f0"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def api(method, table, payload=None, query=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}{query}"
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in HEADERS.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req) as resp:
        body = resp.read()
        return json.loads(body) if body else []


def delete_existing():
    """Delete lessons then modules for this track (idempotent re-run)."""
    # Get module IDs for this track
    modules = api("GET", "academy_modules", query=f"?track_id=eq.{TRACK_ID}&select=id")
    if modules:
        mod_ids = ",".join(f'"{m["id"]}"' for m in modules)
        # Delete lessons belonging to those modules
        api("DELETE", "academy_lessons", query=f"?module_id=in.({mod_ids})")
        print(f"  Deleted lessons for {len(modules)} modules")
        # Delete modules
        api("DELETE", "academy_modules", query=f"?track_id=eq.{TRACK_ID}")
        print(f"  Deleted {len(modules)} modules")
    else:
        print("  No existing modules found — clean slate")


def create_module(data):
    result = api("POST", "academy_modules", data)
    return result[0]["id"]


def create_lesson(data):
    result = api("POST", "academy_lessons", data)
    return result[0]["id"]


# ---------------------------------------------------------------------------
# Module definitions
# ---------------------------------------------------------------------------

MODULES = [
    {
        "slug": "ops-foundations",
        "title": "Process Thinking & Mapping",
        "description": "Learn to see the world as interconnected systems. Map processes, identify bottlenecks, and use AI to analyze workflows.",
        "week_number": 1,
        "sort_order": 1,
    },
    {
        "slug": "ops-documentation",
        "title": "SOPs & Knowledge Systems",
        "description": "Build the documentation backbone of any operation. Use AI to write SOPs, create knowledge bases, and prevent information loss.",
        "week_number": 2,
        "sort_order": 2,
    },
    {
        "slug": "ops-project-management",
        "title": "Project Management with AI",
        "description": "Plan, execute, and communicate projects using AI as your project management assistant.",
        "week_number": 3,
        "sort_order": 3,
    },
    {
        "slug": "ops-automation",
        "title": "Automation & Workflows",
        "description": "Identify automation opportunities and design workflow specifications that save hours every week.",
        "week_number": 4,
        "sort_order": 4,
    },
    {
        "slug": "ops-scaling",
        "title": "Scaling & Quality",
        "description": "Build reporting dashboards, QA systems, and scaling playbooks that keep operations running as you grow.",
        "week_number": 5,
        "sort_order": 5,
    },
]

# ---------------------------------------------------------------------------
# Lesson definitions
# ---------------------------------------------------------------------------

LESSONS = {
    # ── Week 1: Process Thinking & Mapping ────────────────────────────────
    "ops-foundations": [
        {
            "slug": "thinking-in-systems",
            "title": "Thinking in Systems",
            "description": "Learn to see every business as a system of inputs, processes, and outputs — and use AI to map them.",
            "xp_reward": 15,
            "passing_score": 70,
            "sort_order": 1,
            "ai_context": "Student is new to operations thinking. Teach them to see businesses as systems. Use Philippine business examples (BPO, sari-sari store, food delivery). When they ask AI for help, generate simple system diagrams in text form.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Every Business Is a System</h2><p>A <strong>system</strong> is anything with inputs, a process, and outputs. Once you learn to see systems, you can't unsee them — and you'll instantly spot why things break.</p><p>Consider a <strong>BPO call center</strong> in Makati:</p><ul><li><strong>Inputs:</strong> Customer calls, agent training, scripts, software</li><li><strong>Process:</strong> Agent answers call, identifies issue, follows resolution steps, logs outcome</li><li><strong>Outputs:</strong> Resolved tickets, customer satisfaction scores, average handle time</li></ul><p>Every business — from a sari-sari store to a tech startup — runs on systems like this. The people who understand the systems are the people who get promoted.</p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Operations isn't about doing tasks faster. It's about designing systems so the right things happen automatically, consistently, and at scale.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Three Layers of Systems Thinking</h3><p><strong>1. Seeing the parts:</strong> What are the inputs, processes, and outputs?</p><p><strong>2. Seeing the connections:</strong> How does one system feed into another? (The output of hiring becomes the input of training.)</p><p><strong>3. Seeing the feedback loops:</strong> What information flows back to improve the system? A restaurant that tracks which dishes get sent back is using a feedback loop. One that doesn't is flying blind.</p><h3>Band-Aids vs System Fixes</h3><p>When something goes wrong, most people fix the symptom. Systems thinkers fix the cause.</p><table><thead><tr><th>Problem</th><th>Band-Aid Fix</th><th>System Fix</th></tr></thead><tbody><tr><td>Customers complain about slow delivery</td><td>Hire more riders</td><td>Map the delivery process, find where orders get stuck, fix the bottleneck</td></tr><tr><td>New employees keep making mistakes</td><td>Scold them / re-explain</td><td>Create an onboarding SOP with checklists</td></tr><tr><td>Monthly reports are always late</td><td>Send reminder emails</td><td>Automate data collection so the report builds itself</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me map the inputs, process, and outputs of my daily work routine as a system", "label": "Map my work as a system"},
                            {"text": "I work at a [describe your workplace]. Help me identify the 3 most important systems that keep the business running", "label": "Find my business systems"},
                            {"text": "Give me 5 examples of feedback loops in a Philippine retail business like a clothing shop in SM", "label": "Feedback loop examples"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>How AI Helps You Think in Systems</h3><p>AI is an incredible systems thinking partner. You can:</p><ul><li>Describe a messy business problem and ask AI to break it into system components</li><li>Ask AI to identify hidden feedback loops you might miss</li><li>Have AI compare band-aid fixes vs system fixes for any problem</li></ul><p>The key skill isn't memorizing frameworks — it's learning to describe your situation clearly so AI can help you analyze it.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A food delivery app notices that 20% of orders arrive cold. The ops manager suggests buying insulated bags for all riders. A systems thinker would say:",
                    "metadata": {
                        "options": [
                            "Great idea — insulated bags solve the problem directly",
                            "We should first map the entire delivery process to find WHERE the delay happens — the cold food might be caused by slow kitchen prep, not slow riders",
                            "We should fire the slow riders and hire faster ones",
                            "Cold food is a customer service issue, not an operations issue"
                        ],
                        "correct_index": 1,
                        "explanation": "A systems thinker doesn't jump to solutions. They map the full process first: order placed > kitchen receives it > kitchen prepares it > rider picks up > rider delivers. The cold food could be caused by a 15-minute kitchen delay, not slow riding. Insulated bags would be a band-aid if the real bottleneck is kitchen prep time."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to apply systems thinking to a recurring workplace problem?",
                    "metadata": {
                        "options": [
                            "\"My team keeps missing deadlines. What should I do?\"",
                            "\"I manage a 10-person customer support team at a Philippine BPO. We miss SLA targets every Monday because weekend ticket backlog overwhelms the morning shift. Map this as a system: identify the inputs, process, outputs, and feedback loops. Then show me where the system is breaking and suggest a system-level fix, not a band-aid.\"",
                            "\"Fix my deadline problem using systems thinking.\"",
                            "\"List 10 systems thinking frameworks I can use at work.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B is the strongest prompt because it provides specific context (team size, industry, the exact problem pattern), asks for a structured systems analysis (inputs, process, outputs, feedback loops), and explicitly requests a system-level fix rather than a band-aid. Vague prompts like A and C give AI nothing to work with, and D asks for theory instead of applied analysis."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A sari-sari store owner notices sales drop every afternoon. She asks AI for help. Which prompt demonstrates the best systems thinking approach?",
                    "metadata": {
                        "options": [
                            "\"My sari-sari store in Quezon City has strong morning sales (P3,000 by noon) but afternoon sales drop to P800. I restock at 6 AM. Map my store as a system — inputs (inventory, foot traffic, product mix), process (how customers buy), and outputs (sales, profit). Identify which input or process changes between morning and afternoon, and suggest system fixes.\"",
                            "\"How do I increase my sari-sari store sales?\"",
                            "\"Give me a marketing plan for a sari-sari store.\"",
                            "\"Why do stores lose money in the afternoon?\""
                        ],
                        "correct_index": 0,
                        "explanation": "Option A frames the problem as a system with measurable data points, specific timing, and asks AI to analyze which component changes between morning and afternoon. This could reveal that popular items sell out by noon (inventory input), foot traffic shifts (customer input), or product mix doesn't match afternoon needs (process). The other options are too generic to produce actionable systems-level insight."
                    }
                },
                {
                    "type": "quiz",
                    "content": "In systems thinking, a feedback loop is information that flows back to improve the system. Which of the following is the best example of a feedback loop in a Philippine BPO operation?",
                    "metadata": {
                        "options": [
                            "The team lead checks attendance every morning",
                            "Customer satisfaction survey results are analyzed weekly and the top 3 complaint categories are used to update agent training materials and scripts for the following week",
                            "Management sends a motivational email to the team every Friday",
                            "The company holds an annual Christmas party to boost morale"
                        ],
                        "correct_index": 1,
                        "explanation": "A feedback loop requires three things: collecting output data, analyzing it, and feeding insights back into the process to improve it. Option B does all three — survey data (output) is analyzed weekly and used to update training and scripts (improving the input). Attendance checks, motivational emails, and parties are activities, not feedback loops, because they don't systematically route output information back to improve the process."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I have a problem at work: [describe it]. Help me figure out whether my current fix is a band-aid or a system fix, and suggest the system-level solution", "label": "Band-aid or system fix?"},
                            {"text": "Act as an operations consultant. I'll describe my team's biggest recurring problem and you help me trace it back to the root system that's broken", "label": "Find the root cause"}
                        ]
                    }
                }
            ]),
        },
        {
            "slug": "process-mapping",
            "title": "Process Mapping with AI",
            "description": "Learn to create detailed process maps and use AI to identify bottlenecks, handoffs, and failure points.",
            "xp_reward": 15,
            "passing_score": 70,
            "sort_order": 2,
            "ai_context": "Student is learning process mapping. Help them create text-based process maps. When asked, generate step-by-step process flows with decision points, handoffs, and timing estimates. Use Philippine business contexts.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Process Mapping: See the Invisible</h2><p>A <strong>process map</strong> is a visual representation of how work actually flows. It's the single most powerful operations tool because you can't fix what you can't see.</p><p>Most problems in business aren't caused by bad people — they're caused by bad processes. Process maps make the invisible visible.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Building Blocks of a Process Map</h3><ul><li><strong>Steps:</strong> Each action someone takes (\"Agent opens ticket system\")</li><li><strong>Decision Points:</strong> Where the process branches (\"Is the customer a VIP? Yes/No\")</li><li><strong>Handoffs:</strong> Where work passes from one person/team to another (these are where things break most often)</li><li><strong>Wait States:</strong> Where nothing happens — the process is stuck waiting for someone or something</li></ul><h3>Example: Customer Complaint Process at a Philippine E-Commerce Company</h3><pre>Customer submits complaint via chat\n    |\n    v\nChatbot attempts auto-resolution\n    |\n    v\n[Resolved?] --Yes--> Send satisfaction survey --> END\n    |\n    No\n    v\nRoute to human agent (HANDOFF - avg 4 min wait)\n    |\n    v\nAgent reviews order history\n    |\n    v\n[Refund needed?] --Yes--> Agent submits refund request\n    |                           |\n    No                          v\n    |                    Manager approves (WAIT - avg 2 hours)\n    v                           |\nAgent resolves directly          v\n    |                    Refund processed\n    v                           |\nSend satisfaction survey  <------+\n    |\n    v\n   END</pre><p>Look at those wait states. The 2-hour manager approval is a bottleneck. If 60% of complaints need refunds, most customers are waiting 2 hours for something that could be automated with an approval threshold.</p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The #1 rule of process mapping: map how things ACTUALLY work, not how they're supposed to work. The gap between the two is where all the problems live.",
                    "metadata": {"type": "warning"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me create a process map for my team's most common workflow. I'll describe what happens step by step and you organize it into a clear process map with decision points and handoffs", "label": "Map my team's workflow"},
                            {"text": "Create a process map for a typical order fulfillment workflow at a small Philippine online business selling on Shopee/Lazada", "label": "E-commerce process map"},
                            {"text": "I have a process map — help me find the bottlenecks and suggest improvements. Here's the process: [describe it]", "label": "Find my bottlenecks"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>How to Get AI to Build Process Maps</h3><p>The prompt structure for getting great process maps from AI:</p><blockquote><strong>Prompt template:</strong><br/>\"Create a detailed process map for [process name] at [type of business]. Include:<br/>- Every step with the person/role responsible<br/>- Decision points with Yes/No branches<br/>- Handoffs between people or teams<br/>- Estimated time for each step<br/>- Mark the top 3 bottlenecks\"</blockquote><p>The more detail you give about your actual process, the more useful the output. Don't describe the ideal — describe reality.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A Philippine BPO company maps their employee onboarding process and discovers: HR sends the offer letter (Day 1), IT sets up the laptop (Day 3-5, depends on stock), Training schedules orientation (Day 5-7), but the new hire can't start training until BOTH the laptop is ready AND orientation is scheduled. Most new hires sit idle for 3 days. Where is the biggest bottleneck?",
                    "metadata": {
                        "options": [
                            "HR sending the offer letter — it should be automated",
                            "IT laptop setup — it's the longest task and blocks everything else downstream",
                            "Training scheduling — they should schedule faster",
                            "The new hire — they should use personal laptops while waiting"
                        ],
                        "correct_index": 1,
                        "explanation": "IT laptop setup (3-5 days depending on stock) is the bottleneck because it's the longest task on the critical path and everything downstream depends on it. The fix isn't to rush IT — it's to redesign the system: pre-stage laptops before start dates, or start orientation on Day 1 while IT preps the laptop in parallel. A process map makes this dependency visible."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to help you build a process map for your team's order fulfillment workflow. Which prompt will produce the most useful output?",
                    "metadata": {
                        "options": [
                            "\"Make me a process map for order fulfillment.\"",
                            "\"We run a small Lazada shop with 3 people. When an order comes in, Maria checks Lazada Seller Center, prints the order, and tells Jun to pick items from the stockroom. Jun packs them and gives the package to Ana, who books J&T Express pickup. Create a detailed process map showing each step, the person responsible, decision points (e.g., item out of stock), handoffs between Maria/Jun/Ana, estimated time per step, and mark the top 3 bottlenecks.\"",
                            "\"What are the steps in order fulfillment?\"",
                            "\"Create a flowchart for e-commerce.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B gives AI the specific context needed: team size, named roles, actual platform (Lazada), current flow, and the courier used. It explicitly asks for decision points, handoffs, timing, and bottleneck identification. This will produce a process map you can actually use, not a generic template. The other options lack the detail needed for AI to map YOUR process versus a textbook example."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to identify hidden bottlenecks in a customer complaint resolution process?",
                    "metadata": {
                        "options": [
                            "\"List common bottlenecks in customer service.\"",
                            "\"Our customer complaint process works like this: complaint received via email > CS agent logs it in a spreadsheet > agent emails the department head for approval on the resolution > department head reviews (usually takes 1-2 days) > agent contacts customer with resolution > agent closes ticket. We get about 30 complaints per day. Map this process, calculate the total cycle time, identify where work is waiting vs being actively processed, and tell me which step is the biggest bottleneck and why.\"",
                            "\"How do I make customer complaints go faster?\"",
                            "\"Analyze my customer service workflow for efficiency.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B describes the actual process step-by-step with specific details (email-based, spreadsheet logging, department head approval taking 1-2 days, 30/day volume). It asks AI to calculate cycle time and distinguish waiting time from processing time — which is exactly how you find bottlenecks. The 1-2 day approval wait is clearly the bottleneck, and this prompt gives AI everything it needs to prove that with data."
                    }
                },
                {
                    "type": "quiz",
                    "content": "When creating a process map, which element is most commonly overlooked but causes the most operational problems?",
                    "metadata": {
                        "options": [
                            "The color coding of different departments",
                            "Handoffs — the points where work passes from one person or team to another, where things get dropped, miscommunicated, or delayed",
                            "The font size used in the diagram",
                            "Whether the map is drawn digitally or on paper"
                        ],
                        "correct_index": 1,
                        "explanation": "Handoffs are where most process failures occur. When work moves from one person to another, information gets lost, items sit in queues, and nobody feels ownership during the transition. A process map that clearly marks every handoff — who passes what to whom, in what format, and what triggers the next person to act — exposes these vulnerability points. Cosmetic details like colors, fonts, or medium are irrelevant to the map's analytical value."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I identified a bottleneck in my process: [describe it]. Help me brainstorm 3 different ways to fix it, from cheapest to most effective", "label": "Fix my bottleneck"},
                            {"text": "Help me create a process map for onboarding a new team member at my company, including all the handoffs between HR, IT, and the hiring manager", "label": "Map employee onboarding"}
                        ]
                    }
                }
            ]),
        },
    ],

    # ── Week 2: SOPs & Knowledge Systems ──────────────────────────────────
    "ops-documentation": [
        {
            "slug": "writing-sops",
            "title": "Writing SOPs with AI",
            "description": "Use AI to generate clear, consistent Standard Operating Procedures that anyone can follow.",
            "xp_reward": 15,
            "passing_score": 70,
            "sort_order": 1,
            "ai_context": "Student is learning to write SOPs. Help them generate structured SOPs with purpose, scope, steps, decision points, and quality checks. When they describe a task, produce a complete SOP. Use Philippine workplace examples.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>SOPs: The Backbone of Reliable Operations</h2><p>A <strong>Standard Operating Procedure (SOP)</strong> is a step-by-step document that ensures a task is done the same way every time, by anyone, without the expert in the room.</p><p>Here's the truth about most businesses: critical knowledge lives in people's heads. When that person is sick, on leave, or quits — the knowledge walks out the door.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>What a Good SOP Looks Like</h3><p>Every SOP needs these sections:</p><ol><li><strong>Purpose:</strong> Why does this process exist? What outcome does it produce?</li><li><strong>Scope:</strong> Who does this apply to? When is it used?</li><li><strong>Prerequisites:</strong> What tools, access, or information do you need before starting?</li><li><strong>Steps:</strong> Numbered, specific actions — not vague instructions</li><li><strong>Decision Points:</strong> \"If X happens, do Y. If Z happens, do W.\"</li><li><strong>Quality Checks:</strong> How do you verify the work was done correctly?</li><li><strong>Escalation:</strong> When should you stop and ask for help?</li></ol><h3>Before vs After: Vague Instructions vs Real SOP</h3><table><thead><tr><th>Vague Instructions</th><th>SOP Version</th></tr></thead><tbody><tr><td>\"Process the refund\"</td><td>\"1. Open the order in Shopify Admin. 2. Click 'Refund' in the top right. 3. Enter the refund amount (full order total minus shipping if item was used). 4. Select 'Refund to original payment method.' 5. Add internal note: 'Refund - [reason code]'. 6. Click 'Refund.' 7. Verify refund appears in transaction history within 5 minutes.\"</td></tr><tr><td>\"Close the store\"</td><td>\"1. At 8:45 PM, announce last call for customers. 2. At 9:00 PM, lock front doors. 3. Run end-of-day POS report — print 2 copies. 4. Count cash drawer. If variance > P500, call shift manager before proceeding. 5. Place cash in safe...\"</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The test of a good SOP: could a competent person who has never done this task complete it correctly on their first try, using only this document?",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me write a complete SOP for my most repetitive daily task. I'll describe what I do and you turn it into a proper SOP with purpose, scope, steps, decision points, and quality checks", "label": "Write an SOP for my task"},
                            {"text": "Create an SOP for closing out a retail store at the end of the day, including cash handling and security procedures, for a Philippine mall-based shop", "label": "Store closing SOP"},
                            {"text": "I have existing instructions that are too vague. Help me turn them into a proper SOP. Here are my current instructions: [paste them]", "label": "Upgrade vague instructions"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>The AI SOP Generator Prompt</h3><p>Here's the prompt structure that produces excellent SOPs from AI every time:</p><blockquote>\"Write a complete SOP for [task name] at [type of business].<br/><br/>Context: [who performs this, how often, what tools they use]<br/><br/>Include these sections:<br/>1. Purpose & expected outcome<br/>2. Scope (who, when)<br/>3. Prerequisites (tools, access, info needed)<br/>4. Step-by-step instructions (numbered, specific, no ambiguity)<br/>5. Decision points with if/then branches<br/>6. Quality checks (how to verify it was done right)<br/>7. Escalation criteria (when to ask for help)<br/><br/>Write it so a brand new employee could follow it on Day 1.\"</blockquote>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A team lead gives two new hires the same task. One follows a written SOP and completes it correctly in 30 minutes. The other gets a verbal explanation and makes 3 errors that take an hour to fix. The team lead says: \"The second person just needs more training.\" What's the systems-level insight?",
                    "metadata": {
                        "options": [
                            "The second person is less capable and should be reassigned",
                            "Verbal explanations work fine — the second person just wasn't paying attention",
                            "The SOP produced consistent results regardless of the individual, proving the system (documentation) matters more than relying on individual memory or verbal instructions",
                            "Both approaches are equally valid — some people learn better by listening"
                        ],
                        "correct_index": 2,
                        "explanation": "This is the core insight of operations: good systems produce consistent results regardless of who runs them. The first person succeeded because of the SOP, not because they were smarter. Blaming the individual ('they need more training') is a band-aid. The system fix is: write SOPs for everything critical so results don't depend on who's working that day."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You need AI to write an SOP for processing customer refunds at your Shopee store. Which prompt will generate the most complete and usable SOP?",
                    "metadata": {
                        "options": [
                            "\"Write an SOP for refunds.\"",
                            "\"Write a complete SOP for processing customer refund requests at our Shopee store. We sell clothing and get about 15 refund requests per week. Our team of 3 CS agents handles them. Include: 1) Purpose and expected outcome, 2) Scope — who uses this and when, 3) Prerequisites — tools and access needed (Shopee Seller Center, GCash for refunds), 4) Step-by-step instructions with exact button clicks and field entries, 5) Decision points: full refund vs partial vs replacement, based on reason and days since delivery, 6) Quality checks to verify the refund was processed correctly, 7) Escalation criteria — when to involve the team lead. Write it so a new hire on Day 1 can follow it without asking questions.\"",
                            "\"How do I handle refunds on Shopee?\"",
                            "\"Create a refund policy document for e-commerce.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B follows the proven SOP prompt structure: it gives specific context (Shopee, clothing, 15/week, 3 agents), requests all 7 essential SOP sections, includes the business-specific details (GCash, Seller Center), and sets a clear quality bar ('new hire on Day 1'). A vague prompt like A gives you a generic template. C asks for advice, not a procedure. D creates a policy, which is different from an SOP — policies state rules while SOPs detail exact steps."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want to turn vague team instructions into a proper SOP using AI. Your current instructions say: 'Close the store at the end of the day and make sure everything is secured.' Which prompt best transforms this into an actionable SOP?",
                    "metadata": {
                        "options": [
                            "\"Make these instructions better: close the store at the end of the day and make sure everything is secured.\"",
                            "\"I manage a retail clothing store in SM North EDSA. Our current closing instructions just say 'close the store and make sure everything is secured.' Turn this into a detailed SOP with numbered steps covering: cash register closing and cash counting procedures (we use a BDO night deposit bag), security checks (fitting rooms, stockroom, display cases), POS end-of-day report generation, alarm system activation, and lock-up sequence. Include decision points like what to do if the cash count is off by more than P500, and quality checks at each stage.\"",
                            "\"Write a store closing checklist.\"",
                            "\"What should I do when closing a retail store?\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B transforms a vague instruction into a detailed SOP request by adding all the missing specifics: the store type and location, exact procedures needed (cash counting, security checks, POS reports), specific tools (BDO deposit bag, alarm system), decision points (cash variance threshold), and quality checks. This gives AI enough context to produce an SOP that a new employee could actually follow step-by-step on their first closing shift."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which of the following is the most critical section to include in an SOP that many teams skip?",
                    "metadata": {
                        "options": [
                            "A cover page with the company logo and version number",
                            "Decision points with if/then branches that tell the reader exactly what to do when the process doesn't follow the happy path",
                            "A list of all the people who approved the SOP",
                            "A glossary defining every technical term used in the document"
                        ],
                        "correct_index": 1,
                        "explanation": "Decision points are where SOPs most commonly fail. A procedure that only covers the happy path leaves employees stranded when something unexpected happens — and that is when they make errors or freeze. Good SOPs include clear if/then branches: 'If the customer requests a refund after 30 days, do X. If the item is damaged, do Y. If you are unsure, escalate to Z.' Cover pages, approval lists, and glossaries have their place but do not prevent operational errors the way decision points do."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me identify the top 5 tasks in my role that should have SOPs but don't. I'll describe my job and you tell me what's risky without documentation", "label": "Find tasks that need SOPs"},
                            {"text": "Create an SOP template I can reuse — just the structure with placeholder text I can fill in for any process", "label": "Reusable SOP template"}
                        ]
                    }
                }
            ]),
        },
        {
            "slug": "knowledge-management",
            "title": "Knowledge Management Systems",
            "description": "Build documentation systems that prevent knowledge loss and scale with your team.",
            "xp_reward": 15,
            "passing_score": 70,
            "sort_order": 2,
            "ai_context": "Student is learning about knowledge management. Help them design documentation structures, wikis, and FAQ systems. Emphasize the 'bus factor' and how AI can organize knowledge. Use practical examples for small-to-medium teams.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Knowledge Management: Don't Let Critical Info Live in One Person's Head</h2><p>In operations, there's a concept called the <strong>bus factor</strong>: how many people on your team could get hit by a bus (or, more realistically, resign) before critical knowledge is lost?</p><p>If the answer is \"one\" — you have a serious problem. And most teams have this problem.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Knowledge Management Stack</h3><p>A good knowledge system has three layers:</p><table><thead><tr><th>Layer</th><th>What It Contains</th><th>Example</th></tr></thead><tbody><tr><td><strong>SOPs</strong></td><td>Step-by-step procedures for recurring tasks</td><td>\"How to process a refund\"</td></tr><tr><td><strong>Wiki / Knowledge Base</strong></td><td>Reference information, policies, context</td><td>\"Our refund policy is 30 days for unused items\"</td></tr><tr><td><strong>FAQ / Troubleshooting</strong></td><td>Solutions to common problems</td><td>\"If the refund button is grayed out, check if the order is older than 90 days\"</td></tr></tbody></table><h3>Organizing Knowledge So People Actually Use It</h3><p>The biggest mistake: creating documentation nobody can find. Structure matters:</p><ul><li><strong>By function:</strong> Sales, Marketing, Operations, HR, Finance</li><li><strong>By workflow:</strong> Onboarding, Daily Operations, Month-End Close</li><li><strong>By audience:</strong> New hires, Team leads, Managers</li></ul><p>The best approach? Organize by <strong>workflow</strong> — people look for docs when they're in the middle of doing something.</p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Documentation that exists but can't be found is the same as documentation that doesn't exist. Discoverability is half the battle.",
                    "metadata": {"type": "warning"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me design a knowledge base structure for my team of [size]. We work in [industry]. Suggest the top-level categories and what goes in each one", "label": "Design my knowledge base"},
                            {"text": "I'm the only person who knows how to do [critical task]. Help me create a knowledge transfer document so someone else can learn it", "label": "Transfer my knowledge"},
                            {"text": "Help me build a FAQ document for my team. I'll list the questions we get asked most often and you organize them with clear answers", "label": "Build a team FAQ"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>Using AI to Build and Maintain Knowledge Systems</h3><p>AI is extraordinary at knowledge management tasks:</p><ul><li><strong>Generating first drafts:</strong> Describe a process verbally and AI structures it into documentation</li><li><strong>Organizing information:</strong> Paste messy notes and AI categorizes and structures them</li><li><strong>Creating FAQs:</strong> Describe common problems and AI generates Q&A pairs</li><li><strong>Updating docs:</strong> Paste an old SOP + what changed, and AI produces the updated version</li></ul><p>The prompt pattern: <em>\"I'm going to describe [X]. Turn it into a structured [SOP / wiki page / FAQ] with clear headings, numbered steps, and decision points.\"</em></p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A 15-person BPO team is growing to 30 people next quarter. Currently, all training is done by the team lead verbally over 2 weeks. Three experienced agents handle escalations but have never documented their decision-making process. Which knowledge management approach prevents the most problems during the growth phase?",
                    "metadata": {
                        "options": [
                            "Hire a dedicated trainer so the team lead can focus on management",
                            "Record video calls of the team lead training new hires",
                            "Have the 3 experienced agents document their escalation decision trees into SOPs, create a structured knowledge base organized by workflow, and build a searchable FAQ from historical tickets",
                            "Create a group chat where new hires can ask questions"
                        ],
                        "correct_index": 2,
                        "explanation": "Hiring a trainer (A) just moves the bottleneck to a different person. Recording videos (B) captures knowledge but in an unsearchable format. A group chat (D) creates noise and requires real-time availability. The system fix (C) captures tacit knowledge from the experts into structured, searchable documentation — SOPs for procedures, a wiki for context, and FAQs for troubleshooting. This scales because 30 people can self-serve instead of waiting for 3 experts."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You need AI to help you extract knowledge from an experienced team member before they leave the company next month. Which prompt will capture the most useful knowledge?",
                    "metadata": {
                        "options": [
                            "\"Help me do a knowledge transfer from a leaving employee.\"",
                            "\"Our senior accounts receivable specialist is leaving in 4 weeks. She is the only person who knows how to handle disputed invoices, manage the month-end reconciliation with our top 5 clients, and troubleshoot errors in our billing system (QuickBooks). Generate a structured interview guide I can use over 4 sessions to extract her knowledge into: 1) Step-by-step SOPs for each recurring task, 2) Decision trees for handling exceptions and edge cases, 3) A troubleshooting FAQ of common problems and her solutions, 4) A contact list of key people at each client she works with and the relationship context.\"",
                            "\"What questions should I ask someone who is leaving?\"",
                            "\"Create a goodbye survey for departing employees.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B is effective because it identifies the specific knowledge at risk (disputed invoices, reconciliation, billing errors), names the exact tool (QuickBooks), sets a timeline (4 sessions over 4 weeks), and requests four structured output formats (SOPs, decision trees, FAQ, contact list). This gives AI enough context to create targeted interview questions that capture both procedural knowledge and tacit expertise. Generic prompts miss the critical details that make knowledge transfer actually work."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to organize a messy collection of team knowledge into a usable knowledge base?",
                    "metadata": {
                        "options": [
                            "\"Organize my team's documents.\"",
                            "\"I have 6 months of team knowledge scattered across: a shared Google Drive with 200+ files (no naming convention), a Viber group chat where people ask and answer process questions, and email threads between our team lead and clients with important decisions. Help me design a knowledge base structure organized by workflow (not department) with these categories: Daily Operations, Client Management, Month-End Procedures, Troubleshooting, and Onboarding. For each category, tell me what to extract from each source and how to format it.\"",
                            "\"What is the best knowledge management tool?\"",
                            "\"Create a folder structure for my Google Drive.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B describes the actual state of the knowledge (scattered across Drive, Viber, email), specifies the volume (200+ files), and asks for a workflow-based structure with named categories. It also asks AI to map each source to each category, which creates an actionable extraction plan. The key insight is organizing by workflow rather than department — people search for knowledge when they are in the middle of doing something, not when browsing by department name."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A team's knowledge base has 50 well-written SOPs, but new hires still constantly ask the same questions and say they 'can't find anything.' What is the most likely root cause?",
                    "metadata": {
                        "options": [
                            "The new hires are lazy and not reading the documentation",
                            "The knowledge base lacks a clear organizational structure and search functionality — documentation that exists but cannot be found is effectively the same as documentation that does not exist",
                            "50 SOPs is too many — the team should reduce to 10",
                            "New hires should not use the knowledge base until they complete training"
                        ],
                        "correct_index": 1,
                        "explanation": "This is a discoverability problem, not a content problem. If 50 SOPs exist but new hires cannot find what they need, the structure is failing. The fix involves clear naming conventions, a logical hierarchy (organized by workflow, not by creation date), a search function, and an index or table of contents. Blaming users for not finding poorly organized content is the same as blaming individuals instead of fixing the system."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me calculate the 'bus factor' for my team. I'll describe who knows what, and you identify our biggest knowledge risks", "label": "Calculate my bus factor"},
                            {"text": "Create a 30-day plan for documenting all critical knowledge on a team of [size] without disrupting daily work", "label": "Documentation rollout plan"}
                        ]
                    }
                }
            ]),
        },
    ],

    # ── Week 3: Project Management with AI ────────────────────────────────
    "ops-project-management": [
        {
            "slug": "project-planning-ai",
            "title": "Project Planning with AI",
            "description": "Use AI to build work breakdown structures, identify dependencies, and create realistic project timelines.",
            "xp_reward": 20,
            "passing_score": 70,
            "sort_order": 1,
            "ai_context": "Student is learning project planning. Help them create WBS, identify dependencies, estimate timelines. Generate project plans in structured text format. Explain critical path in simple terms. Use Philippine business contexts.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Project Planning: Breaking Big Goals into Doable Steps</h2><p>Every failed project has the same story: someone said \"this should take about 2 weeks\" without actually breaking down the work. Good project planning starts with a <strong>Work Breakdown Structure (WBS)</strong> — splitting a big goal into small, estimable pieces.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Work Breakdown Structure (WBS)</h3><p>A WBS takes a project and breaks it into levels:</p><pre>Launch new Shopee store\n  |\n  +-- Product Setup\n  |     +-- Photography (3 days)\n  |     +-- Write descriptions (2 days)\n  |     +-- Set pricing (1 day)\n  |     +-- Upload to Shopee (1 day)\n  |\n  +-- Store Design\n  |     +-- Create logo (2 days)\n  |     +-- Design banner (1 day)\n  |     +-- Configure store layout (1 day)\n  |\n  +-- Operations Setup\n  |     +-- Set up shipping partners (3 days)\n  |     +-- Create packaging SOP (1 day)\n  |     +-- Test order flow (1 day)\n  |\n  +-- Marketing Launch\n        +-- Social media posts (2 days)\n        +-- Influencer outreach (5 days)\n        +-- Launch promo setup (1 day)</pre><h3>Dependencies & Critical Path</h3><p><strong>Dependencies</strong> are tasks that can't start until another task finishes. The <strong>critical path</strong> is the longest chain of dependent tasks — it determines your minimum project duration.</p><p>In our example:</p><ul><li>Photography must finish before product upload</li><li>Logo must finish before banner design</li><li>ALL product, store, and operations setup must finish before marketing launch</li></ul><p>If photography takes 3 extra days, the WHOLE project is delayed 3 days — because it's on the critical path.</p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The critical path is the chain of tasks where ANY delay delays the entire project. Identify it first and protect it aggressively.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me create a Work Breakdown Structure for my project. The project is: [describe it]. Break it into phases, tasks, and estimated durations", "label": "Build my WBS"},
                            {"text": "I have this project plan. Help me identify the dependencies and critical path: [describe your tasks]", "label": "Find my critical path"},
                            {"text": "Create a complete project plan for launching a small online business in the Philippines, including timeline, dependencies, and milestones", "label": "Sample project plan"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>Using AI as Your Project Planning Assistant</h3><p>AI is phenomenal at project planning because it can instantly generate a WBS for almost any type of project. The prompt pattern:</p><blockquote>\"Create a detailed project plan for [project]. Break it into:<br/>1. Major phases<br/>2. Tasks within each phase with estimated durations<br/>3. Dependencies (what must finish before what can start)<br/>4. The critical path<br/>5. Milestones and checkpoints<br/><br/>Context: [team size, budget, constraints, timeline expectations]\"</blockquote><p>Then iterate: \"Add resource allocation\" or \"What risks should I plan for?\" or \"What could I do in parallel to shorten the timeline?\"</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "You're managing a store renovation project. Task A (electrical work, 5 days) and Task B (painting, 3 days) can happen in parallel. Task C (installing fixtures, 2 days) requires BOTH A and B to be complete. Task D (final inspection, 1 day) requires C. What is the critical path and minimum project duration?",
                    "metadata": {
                        "options": [
                            "B > C > D = 6 days",
                            "A > C > D = 8 days",
                            "A + B + C + D = 11 days",
                            "A > B > C > D = 11 days"
                        ],
                        "correct_index": 1,
                        "explanation": "Since A (5 days) and B (3 days) run in parallel, you only wait for the longer one — A. Then C (2 days) starts, then D (1 day). Critical path: A(5) > C(2) > D(1) = 8 days. B finishes on Day 3, so it doesn't affect the total. This is why identifying the critical path matters — you know which tasks to protect and which have slack."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You need AI to create a project plan for opening a second branch of your milk tea shop. Which prompt will produce the most actionable plan?",
                    "metadata": {
                        "options": [
                            "\"Create a project plan for opening a milk tea shop.\"",
                            "\"Create a detailed project plan for opening a second branch of our milk tea shop in a mall in Cebu. We have a P500K budget and want to open in 8 weeks. Our team is: me (owner), 1 operations manager, and we will hire 4 new staff. Break it into: 1) Major phases (location setup, equipment, hiring, training, marketing, soft launch), 2) Tasks within each phase with estimated durations in days, 3) Dependencies — what must finish before what starts, 4) The critical path showing minimum timeline, 5) Milestones at weeks 2, 4, 6, and 8. Flag any tasks that risk pushing us past the 8-week deadline.\"",
                            "\"What do I need to do to open a milk tea shop?\"",
                            "\"Give me a timeline for a new business launch.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B gives AI all the constraints needed for a realistic plan: specific business type and location (milk tea in Cebu mall), budget (P500K), deadline (8 weeks), team size, and the phases to cover. It explicitly asks for dependencies, critical path, and milestones — the three elements that separate a useful project plan from a generic to-do list. It also asks AI to flag deadline risks, which is proactive project management."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to recover a project that is falling behind schedule?",
                    "metadata": {
                        "options": [
                            "\"My project is behind schedule. What should I do?\"",
                            "\"I'm managing a website redesign project that was supposed to take 6 weeks but we are at week 4 with only 40% complete. Remaining tasks: finalize 5 page designs (3 days each), developer coding (10 days), content writing (5 days), QA testing (3 days), and client review (5 days). I have 2 designers, 1 developer, and 1 content writer. Analyze which tasks can run in parallel, identify the new critical path, and give me 3 options to compress the timeline: one with current resources, one if I add a freelance developer, and one showing what scope to cut if we must hit the original 6-week deadline.\"",
                            "\"How do I speed up a delayed project?\"",
                            "\"Rewrite my project timeline to be faster.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B gives AI the exact project state (week 4, 40% done), lists every remaining task with duration, specifies available resources, and asks for three distinct recovery strategies. This forces AI to do real analysis — calculating parallel paths, resource constraints, and trade-offs — rather than giving generic advice. The three options approach (current resources, added resources, reduced scope) mirrors how experienced project managers present recovery plans to stakeholders."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A project manager estimates a task will take 3 days. It actually takes 9 days. This happens repeatedly across projects. What is the most likely explanation?",
                    "metadata": {
                        "options": [
                            "The team members are underperforming and need to work harder",
                            "The project manager is estimating based on effort (active work time) without accounting for dependencies, wait states, review cycles, and the fact that people work on multiple projects simultaneously",
                            "3-day estimates are always too short — the manager should just multiply by 3",
                            "The tasks are poorly defined and should be broken into smaller pieces regardless of duration"
                        ],
                        "correct_index": 1,
                        "explanation": "This is the classic estimation trap. A task that takes 3 days of active work might take 9 calendar days because: the person also works on other things (not 100% allocated), they wait 2 days for a colleague's input, and the review cycle adds a day. Good estimation accounts for all of these. Simply multiplying by 3 (option C) is a band-aid. Breaking tasks smaller (option D) helps but does not fix the root cause of ignoring non-work time in estimates."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me estimate realistic timelines for my project tasks. I tend to underestimate — ask me about each task and help me add appropriate buffers", "label": "Realistic time estimates"},
                            {"text": "I have a project that needs to be done in [X weeks] but my initial plan shows [Y weeks]. Help me find tasks I can parallelize or cut to meet the deadline", "label": "Compress my timeline"}
                        ]
                    }
                }
            ]),
        },
        {
            "slug": "stakeholder-communication",
            "title": "Stakeholder Communication",
            "description": "Use AI to write status reports, escalation emails, and meeting agendas that keep everyone aligned.",
            "xp_reward": 20,
            "passing_score": 70,
            "sort_order": 2,
            "ai_context": "Student is learning stakeholder communication. Help them write status updates, escalation emails, meeting agendas. Use the STAR format. Provide templates. Adapt tone for different audiences (executives vs team vs clients).",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Stakeholder Communication: The Skill That Gets You Promoted</h2><p>Here's an uncomfortable truth: you can be the best operator in the company, but if you can't communicate what you're doing and why it matters, nobody notices. Stakeholder communication is an operations superpower.</p><p>There are three types of operations communication:</p><ol><li><strong>Status Updates:</strong> \"Here's where we are\" (routine)</li><li><strong>Escalations:</strong> \"Something's wrong and I need help\" (urgent)</li><li><strong>Stakeholder Alignment:</strong> \"Here's what we're doing and why\" (strategic)</li></ol>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The STAR Format for Status Updates</h3><p>Use <strong>STAR</strong> for every status update:</p><ul><li><strong>S</strong>ituation — What's the current state?</li><li><strong>T</strong>asks — What was accomplished since last update?</li><li><strong>A</strong>ction — What's happening next?</li><li><strong>R</strong>isks — What could go wrong?</li></ul><p><strong>Example:</strong></p><blockquote><strong>Weekly Status — Shopee Store Launch</strong><br/><br/><strong>Situation:</strong> On track for March 15 launch. 70% complete.<br/><strong>Tasks completed:</strong> Product photography done (48 SKUs), shipping partner signed (J&T Express), store design approved.<br/><strong>Actions this week:</strong> Upload all products, test order flow end-to-end, brief social media team.<br/><strong>Risks:</strong> J&T integration has a known bug with COD orders — testing Monday. If it fails, we fall back to LBC.</blockquote><h3>The Escalation Framework</h3><p>When something goes wrong, the worst thing you can do is hide it. Use this structure:</p><ol><li><strong>What happened</strong> (facts, not feelings)</li><li><strong>What's the impact</strong> (who's affected, how much)</li><li><strong>What I've already tried</strong> (show you didn't just panic)</li><li><strong>What I need from you</strong> (specific ask)</li><li><strong>Recommended next step</strong> (show you've thought it through)</li></ol>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Never escalate a problem without a recommended solution. Even if your solution is wrong, showing that you've thought about it demonstrates ownership.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me write a weekly status update for my project using the STAR format. Here's what happened this week: [describe progress and issues]", "label": "Write my status update"},
                            {"text": "I need to escalate a problem to my manager. Here's what happened: [describe situation]. Help me write a professional escalation email that shows I've thought through solutions", "label": "Write an escalation email"},
                            {"text": "Help me create a meeting agenda for a project kickoff meeting with [number] stakeholders. The project is: [describe it]", "label": "Create a meeting agenda"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>Adapting Communication for Your Audience</h3><table><thead><tr><th>Audience</th><th>They care about</th><th>Tone</th><th>Length</th></tr></thead><tbody><tr><td>C-suite / executives</td><td>Business impact, timeline, budget</td><td>Concise, data-driven</td><td>3-5 bullet points</td></tr><tr><td>Your direct team</td><td>What they need to do, blockers</td><td>Direct, action-oriented</td><td>As detailed as needed</td></tr><tr><td>Clients / external</td><td>Progress, deliverables, confidence</td><td>Professional, reassuring</td><td>Brief with highlights</td></tr></tbody></table><p>AI can instantly rewrite the same update for different audiences. Just say: \"Rewrite this status update for [audience]. They care most about [X].\"</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "Your project is 2 weeks behind schedule because a vendor delivered late. Your CEO asks for a status update. Which response demonstrates the best stakeholder communication?",
                    "metadata": {
                        "options": [
                            "\"The project is delayed because the vendor was late. It's not our fault.\"",
                            "\"Everything's going fine, we should catch up soon.\" (hiding the delay)",
                            "\"We're 2 weeks behind due to a vendor delay on [component]. Impact: launch moves from March 15 to March 29. Mitigation: I've already onboarded a backup vendor and can compress testing from 2 weeks to 1. Recommendation: approve overtime budget of P50K to run parallel workstreams and recover 1 week.\"",
                            "\"There's a delay. I'll send more details when I figure out what to do.\""
                        ],
                        "correct_index": 2,
                        "explanation": "Option C follows the escalation framework perfectly: states the fact (2-week delay), quantifies impact (new date), shows initiative (backup vendor already onboarded), and makes a specific ask (overtime budget) with a clear recommendation. It gives the CEO everything they need to make a decision in one read. Blaming (A), hiding (B), and deferring (D) all erode trust."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You need AI to help you write a professional escalation email about a system outage. Which prompt will produce the most effective communication?",
                    "metadata": {
                        "options": [
                            "\"Write an email about a system outage.\"",
                            "\"Help me write an escalation email to my VP of Operations. Our order management system went down at 2 PM today and has been offline for 3 hours. Impact: 150 orders are stuck and cannot be processed, affecting approximately P800K in revenue. Our customers are posting complaints on social media. What I have done so far: contacted the vendor (ETA for fix is unclear), switched to manual order processing for priority clients, and briefed the CS team with talking points for angry customers. I need the VP to approve emergency budget to bring in the vendor's premium support team. Write this using the escalation framework: what happened, impact, what I have tried, what I need, and my recommendation.\"",
                            "\"Our system is down. Help me tell my boss.\"",
                            "\"Draft a formal notification about technical difficulties.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B provides all five elements of the escalation framework in the prompt itself: the specific event (system down 3 hours), quantified impact (150 orders, P800K, social media complaints), actions already taken (vendor contacted, manual processing, CS briefed), the specific ask (emergency budget), and the audience (VP of Operations). This gives AI everything it needs to produce an email that demonstrates ownership and makes it easy for the VP to approve the ask immediately."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You need to send the same project update to three audiences: your CEO, your direct team, and your client. Which prompt best uses AI to adapt the communication?",
                    "metadata": {
                        "options": [
                            "\"Rewrite my update three times for different people.\"",
                            "\"Here is my project status update: [paste full update with all details]. Now rewrite this for three audiences: 1) CEO — she cares about business impact, timeline, and budget. Keep it to 5 bullet points maximum. Tone: concise, data-driven. 2) My direct team of 6 people — they need to know their action items and blockers. Tone: direct, action-oriented. Include a task list. 3) Our client (the marketing director at Company X) — they care about deliverable progress and confidence we will hit the deadline. Tone: professional, reassuring. Do not mention internal issues like staffing.\"",
                            "\"Make my email shorter for the CEO and longer for my team.\"",
                            "\"Write three versions of a project update.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B starts with the full source material and gives AI clear instructions for each audience: what they care about, the appropriate tone, length constraints, and what to include or exclude. The key insight about the client version — 'do not mention internal issues like staffing' — shows sophisticated stakeholder awareness. Each rewrite will be genuinely different because the prompt specifies different priorities for each reader."
                    }
                },
                {
                    "type": "quiz",
                    "content": "When writing a status update using the STAR format (Situation, Tasks, Action, Risks), which section do most people skip that causes the most problems later?",
                    "metadata": {
                        "options": [
                            "Situation — most people forget to set context",
                            "Tasks — people rarely forget to list what they did",
                            "Action — next steps are usually included",
                            "Risks — most people only share good news and omit potential problems, which means stakeholders are blindsided when issues arise"
                        ],
                        "correct_index": 3,
                        "explanation": "The Risks section is the most commonly skipped because people fear that raising risks makes them look negative or incompetent. In reality, flagging risks early builds trust and gives stakeholders time to help mitigate them. A CEO who learns about a potential vendor delay two weeks early can help solve it. A CEO who learns about it the day it blows up will question why they were not informed sooner. Proactive risk communication is a career-accelerating habit."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Rewrite this update I wrote for my manager so it's suitable for the CEO — make it more concise and impact-focused: [paste your update]", "label": "Adapt for executives"},
                            {"text": "Help me create a stakeholder map for my project. I'll describe who's involved and you help me figure out what each person needs to know, how often, and in what format", "label": "Build a stakeholder map"}
                        ]
                    }
                }
            ]),
        },
        {
            "slug": "risk-management",
            "title": "Risk Management & Contingency Planning",
            "description": "Identify risks before they become problems and use AI to build contingency plans.",
            "xp_reward": 20,
            "passing_score": 70,
            "sort_order": 3,
            "ai_context": "Student is learning risk management. Help them identify risks, assess probability and impact, and create contingency plans. Generate risk matrices and mitigation strategies. Use Philippine business contexts and real-world scenarios.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Risk Management: Planning for What Could Go Wrong</h2><p>Good operators don't just plan for success — they plan for failure. <strong>Risk management</strong> is the discipline of asking \"what could go wrong?\" before it does, and having a plan ready.</p><p>Every risk has two dimensions:</p><ul><li><strong>Probability:</strong> How likely is it to happen? (Low / Medium / High)</li><li><strong>Impact:</strong> If it happens, how bad is it? (Low / Medium / High)</li></ul><p>The combination determines your priority:</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Risk Priority Matrix</h3><table><thead><tr><th></th><th>Low Impact</th><th>Medium Impact</th><th>High Impact</th></tr></thead><tbody><tr><td><strong>High Probability</strong></td><td>Monitor</td><td>Mitigate now</td><td>TOP PRIORITY</td></tr><tr><td><strong>Medium Probability</strong></td><td>Accept</td><td>Plan mitigation</td><td>Mitigate now</td></tr><tr><td><strong>Low Probability</strong></td><td>Accept</td><td>Monitor</td><td>Plan mitigation</td></tr></tbody></table><h3>Example: Risks for a Philippine Food Delivery Business</h3><table><thead><tr><th>Risk</th><th>Probability</th><th>Impact</th><th>Mitigation</th></tr></thead><tbody><tr><td>Typhoon disrupts delivery for 2-3 days</td><td>High (June-Nov)</td><td>High</td><td>Pre-announce suspension policy, offer advance ordering, stock non-perishable menu items</td></tr><tr><td>Key rider quits without notice</td><td>Medium</td><td>Medium</td><td>Cross-train riders on multiple zones, maintain standby list</td></tr><tr><td>Supplier delivers wrong ingredients</td><td>Medium</td><td>Medium</td><td>Quality check upon delivery, maintain backup supplier relationship</td></tr><tr><td>App/POS system goes down</td><td>Low</td><td>High</td><td>Maintain manual order-taking process, backup POS on tablet</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "A contingency plan you never use is still valuable — it means you thought through the scenario and can react in minutes instead of hours when something goes wrong.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me brainstorm risks for my project/business: [describe it]. For each risk, assess probability, impact, and suggest a mitigation strategy", "label": "Brainstorm my risks"},
                            {"text": "Create a contingency plan for this scenario: [describe a specific risk you're worried about]. Include trigger conditions, immediate actions, communication plan, and recovery steps", "label": "Build a contingency plan"},
                            {"text": "I'm running a [type of business] in the Philippines. Help me create a risk matrix that includes weather, staffing, supply chain, and technology risks specific to my context", "label": "Philippine business risk matrix"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>Pre-Mortem: The Most Powerful Risk Tool</h3><p>A <strong>pre-mortem</strong> is a thinking exercise where you imagine the project has already failed, then work backwards to figure out why. It's the opposite of optimism — and it's incredibly useful.</p><p>The prompt: <em>\"Imagine this project failed completely. What are the top 5 most likely reasons it failed?\"</em></p><p>AI is perfect for this because it has no emotional attachment to your plan. It will ruthlessly identify weaknesses you might be blind to.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "You're launching a new BPO account with 50 agents. Your risk register shows: (A) Internet outage — Probability: Low, Impact: High. (B) Agent attrition in first month — Probability: High, Impact: High. (C) Client changes requirements — Probability: Medium, Impact: Medium. (D) Office AC breaks down — Probability: Low, Impact: Low. Which risk has the highest expected impact and should be your top priority?",
                    "metadata": {
                        "options": [
                            "A — Internet outage, because technology failures are catastrophic",
                            "B — Agent attrition, because it's both highly likely AND high impact — the expected impact is the highest",
                            "C — Client requirement changes, because the client is always the biggest variable",
                            "D — AC breakdown, because it affects everyone in the office"
                        ],
                        "correct_index": 1,
                        "explanation": "Expected impact = Probability x Impact. Agent attrition (B) is High x High — the highest combination on the matrix. Internet outage (A) is Low x High — important but less likely. You mitigate B by over-hiring by 15%, having a fast onboarding pipeline, and creating retention incentives for the first 90 days. The risk matrix helps you focus resources where they matter most."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to run a pre-mortem analysis on your upcoming project. Which prompt will surface the most useful risks?",
                    "metadata": {
                        "options": [
                            "\"What could go wrong with my project?\"",
                            "\"I am launching a new food delivery service in Davao in 6 weeks. We have 3 staff, 10 restaurant partners, P200K budget, and will use Lalamove for deliveries. Run a pre-mortem: imagine it is 3 months from now and the business has failed. Give me the 7 most likely reasons it failed, ranked by probability and impact. For each risk, specify: the trigger event, the cascading effects, and a specific mitigation action I can take THIS WEEK to reduce the risk. Be brutally honest — do not sugarcoat.\"",
                            "\"List the risks of starting a food delivery business.\"",
                            "\"Help me make a risk management plan.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B makes the pre-mortem powerful by providing specific project parameters (location, timeline, team size, budget, delivery partner), asking AI to imagine a specific future failure state, and requesting actionable mitigations with a deadline ('this week'). The instruction 'be brutally honest' pushes AI past polite generalities into genuinely useful risk identification. Vague prompts produce vague, generic risk lists that could apply to any business."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to build a contingency plan for a specific operational risk?",
                    "metadata": {
                        "options": [
                            "\"Write a contingency plan for my business.\"",
                            "\"Our BPO team of 30 agents in Manila relies on a single internet provider (PLDT fiber). If the internet goes down during a shift, we cannot process calls and our client charges us P5,000 per hour of downtime. Build a detailed contingency plan covering: 1) Early warning signs to watch for (connection degradation, packet loss), 2) Immediate response within the first 5 minutes (who does what), 3) Backup connectivity options ranked by activation speed (mobile hotspots, backup ISP, reroute to home-based agents), 4) Client communication template to send within 15 minutes of outage, 5) Post-incident review process to prevent recurrence.\"",
                            "\"What should we do if the internet goes down?\"",
                            "\"Create a business continuity plan template.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B specifies the exact risk (internet outage), quantifies the impact (P5,000/hour penalty), and requests a time-sequenced response plan with specific checkpoints (5 minutes, 15 minutes). It asks for multiple backup options ranked by speed, a communication template, and a post-incident process. This produces a contingency plan your team can actually execute under pressure, not a theoretical framework they have to interpret while panicking."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A company identifies 20 risks for a major project. The project manager wants to create detailed contingency plans for all 20. What is the most operationally sound approach?",
                    "metadata": {
                        "options": [
                            "Create equally detailed contingency plans for all 20 risks to be thorough",
                            "Use the risk priority matrix to rank them by probability and impact, then create detailed contingency plans for the top 5 high-priority risks, simple monitoring plans for the next 10, and accept the remaining 5 low-probability, low-impact risks",
                            "Only plan for the single biggest risk — you cannot predict everything",
                            "Skip contingency planning entirely and deal with problems as they arise — planning takes too long"
                        ],
                        "correct_index": 1,
                        "explanation": "Creating detailed plans for all 20 risks is impractical and creates planning paralysis. Planning for only one risk or none leaves you exposed. The risk matrix approach focuses your limited planning time where it matters most: detailed plans for the risks most likely to cause serious damage, light monitoring for medium risks so you see them coming, and conscious acceptance of risks that are unlikely and low-impact. This is how experienced operations managers allocate their risk management effort."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Run a pre-mortem on my project: [describe it]. Imagine it failed. What are the 5 most likely reasons?", "label": "Run a pre-mortem"},
                            {"text": "Help me create a risk register spreadsheet structure for an ongoing project with columns for tracking, ownership, and status updates", "label": "Risk register template"}
                        ]
                    }
                }
            ]),
        },
    ],

    # ── Week 4: Automation & Workflows ────────────────────────────────────
    "ops-automation": [
        {
            "slug": "automation-opportunities",
            "title": "Finding Automation Opportunities",
            "description": "Learn to identify which tasks should be automated and which should stay manual using the automation priority matrix.",
            "xp_reward": 20,
            "passing_score": 70,
            "sort_order": 1,
            "ai_context": "Student is learning to identify automation opportunities. Help them evaluate tasks using frequency, time savings, and implementation effort. Be practical — not everything should be automated. Use Philippine business examples.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Automation: Do Less, Achieve More</h2><p>Automation isn't about replacing people — it's about freeing people from repetitive work so they can focus on work that requires judgment, creativity, and human connection.</p><p>But here's the trap: not everything should be automated. Some tasks are so infrequent or so complex that automating them costs more than just doing them manually. The skill is knowing the difference.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Automation Priority Matrix</h3><p>Score each task on two axes:</p><ul><li><strong>Value of automating</strong> = Frequency x Time per occurrence (how much total time you'd save)</li><li><strong>Effort to automate</strong> = How hard is it to set up? (tools, cost, complexity)</li></ul><table><thead><tr><th></th><th>Low Effort to Automate</th><th>High Effort to Automate</th></tr></thead><tbody><tr><td><strong>High Value</strong></td><td>AUTOMATE FIRST (quick wins)</td><td>Plan and invest</td></tr><tr><td><strong>Low Value</strong></td><td>Automate if easy</td><td>DON'T AUTOMATE (waste of resources)</td></tr></tbody></table><h3>Examples from a Philippine E-Commerce Business</h3><table><thead><tr><th>Task</th><th>Frequency</th><th>Time/occurrence</th><th>Effort</th><th>Priority</th></tr></thead><tbody><tr><td>Send order confirmation emails</td><td>100/day</td><td>2 min each</td><td>Low (Shopee built-in)</td><td>AUTOMATE FIRST</td></tr><tr><td>Generate weekly sales report</td><td>1/week</td><td>3 hours</td><td>Medium (spreadsheet formula)</td><td>Automate — high time savings</td></tr><tr><td>Handle complex customer complaints</td><td>5/day</td><td>20 min each</td><td>Very high (needs judgment)</td><td>DON'T automate — needs human empathy</td></tr><tr><td>Update product prices across platforms</td><td>1/month</td><td>4 hours</td><td>High (API integration)</td><td>Maybe later — low frequency</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Start by automating the boring, repetitive, high-frequency tasks. The goal is to free up human time for work that actually requires a human brain.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me audit my daily tasks for automation opportunities. I'll list everything I do in a typical day and you rate each one on the automation priority matrix", "label": "Audit my tasks"},
                            {"text": "I spend [X hours] per week on [task]. Help me figure out if it's worth automating and what the simplest automation approach would be", "label": "Should I automate this?"},
                            {"text": "I work at a [type of business]. List the top 10 tasks that are commonly automated in this industry and what tools people use", "label": "Industry automation ideas"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>The 5 Signs a Task Should Be Automated</h3><ol><li><strong>You do it more than 3 times per week</strong> and the steps are always the same</li><li><strong>It's rule-based</strong> — \"if X, then Y\" with no judgment required</li><li><strong>Errors happen</strong> because humans get tired or bored doing it</li><li><strong>It involves moving data</strong> between systems (copy-paste between apps)</li><li><strong>It creates a bottleneck</strong> — other people are waiting for you to do it</li></ol><p>If a task checks 3+ of these boxes, it's a strong automation candidate.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A team has four tasks consuming the most time. Which should they automate FIRST?",
                    "metadata": {
                        "options": [
                            "Responding to unique customer complaints (10/day, 15 min each, requires empathy and judgment)",
                            "Copying order data from email into a spreadsheet (50/day, 3 min each, pure copy-paste)",
                            "Quarterly business strategy review (4/year, 8 hours each, requires creative thinking)",
                            "Interviewing job candidates (3/week, 45 min each, requires reading people)"
                        ],
                        "correct_index": 1,
                        "explanation": "Copying order data (B) is the clear winner: highest frequency (50/day), rule-based (no judgment), error-prone (humans mistype), involves moving data between systems, and creates a bottleneck. That's 150 minutes/day = 12.5 hours/week of pure waste. Customer complaints (A) and interviews (D) require human judgment. Strategy reviews (C) are too infrequent to justify automation."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to help you audit your daily tasks for automation opportunities. Which prompt will produce the most useful analysis?",
                    "metadata": {
                        "options": [
                            "\"What tasks should I automate at work?\"",
                            "\"I work as an operations coordinator at a logistics company in Pasig. Here are my daily tasks with time spent: 1) Copy tracking numbers from courier emails into our Google Sheet (45 min/day, 80 entries), 2) Send delivery status updates to clients via email (30 min/day, 20 emails, same template with different tracking info), 3) Handle escalated delivery complaints requiring negotiation with couriers (1 hour/day, 5 cases, each unique), 4) Generate end-of-day delivery summary for the manager (20 min/day, pulling data from 3 sources), 5) Coordinate with warehouse team on delayed shipments (40 min/day, requires judgment). Rate each task on the automation priority matrix: frequency x time saved vs effort to automate. Recommend which to automate first, which to automate later, and which to keep manual.\"",
                            "\"List automation tools for logistics companies.\"",
                            "\"How do I save time at work?\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B provides the exact data AI needs to apply the automation priority matrix: each task with frequency, time spent, volume, and a hint about whether it requires judgment. This lets AI calculate actual time savings (e.g., 45 min/day x 250 workdays = 187 hours/year for task 1) and correctly identify that tasks 1 and 2 are high-value automation candidates (rule-based, high-frequency) while tasks 3 and 5 should stay manual (require human judgment)."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to calculate whether a specific automation is worth building?",
                    "metadata": {
                        "options": [
                            "\"Is it worth automating my reporting task?\"",
                            "\"I spend 3 hours every Friday building a weekly sales report. The process: download CSV from Shopee Seller Center, download CSV from Lazada Seller Center, combine them in Google Sheets, apply formulas to calculate totals/averages/growth, format the report, and email it to my manager. I have been doing this for 6 months and expect to continue for at least 2 more years. A freelance developer quoted P15,000 to build an automated version using Google Apps Script. Calculate: 1) My annual time cost at this task (hours and peso value at P200/hour), 2) Break-even point for the P15,000 automation investment, 3) 2-year ROI, 4) Non-financial benefits like reduced errors and faster delivery.\"",
                            "\"How much time would automation save me?\"",
                            "\"Should I hire a developer to automate my work?\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B provides every data point needed for a real ROI calculation: current time cost (3 hours/week), the detailed manual process, expected duration (2+ years), the automation cost (P15,000), and an hourly rate for comparison (P200/hour). AI can calculate: 3 hours x 52 weeks x P200 = P31,200/year in labor, so the P15,000 investment breaks even in about 6 months and saves P47,400 over 2 years. This kind of concrete analysis is what convinces managers to approve automation investments."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A manager wants to automate their team's handling of customer complaints to save time. The task involves reading the complaint, understanding the customer's emotional state, deciding whether to offer a refund/replacement/apology based on context, and writing a personalized response. Why is this a poor automation candidate?",
                    "metadata": {
                        "options": [
                            "It takes too long per occurrence to be worth automating",
                            "The technology to automate email responses does not exist yet",
                            "The task requires empathy, contextual judgment, and personalized communication — automating it would produce generic responses that damage customer relationships and brand reputation",
                            "Customers would not notice if the response was automated"
                        ],
                        "correct_index": 2,
                        "explanation": "The automation priority matrix has two axes: value of automating and effort to automate. But there is a third, often overlooked dimension: risk of automating poorly. Customer complaint handling requires reading emotional context, making judgment calls (a loyal customer of 3 years gets different treatment than a first-time buyer), and writing responses that feel genuinely human. Automating this replaces human empathy with templates, which can turn frustrated customers into lost customers. The right approach is to automate the data collection around complaints (logging, categorizing, routing) while keeping the human response manual."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me calculate the ROI of automating [task]. I do it [X times] per [period] and it takes [Y minutes] each time. What's my annual time savings?", "label": "Calculate automation ROI"},
                            {"text": "I want to automate [task] but I'm not technical. Suggest the simplest no-code or low-code tools I could use", "label": "No-code automation tools"}
                        ]
                    }
                }
            ]),
        },
        {
            "slug": "workflow-design",
            "title": "Designing Automated Workflows",
            "description": "Learn to design workflow specifications with triggers, conditions, actions, and error handling.",
            "xp_reward": 25,
            "passing_score": 70,
            "sort_order": 2,
            "ai_context": "Student is learning workflow design. Help them think in terms of triggers, conditions, and actions. Generate workflow specifications they could hand to a developer or implement in a no-code tool. Emphasize error handling and edge cases.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Designing Workflows: Triggers, Conditions, Actions</h2><p>Every automated workflow follows the same pattern:</p><ol><li><strong>Trigger:</strong> What starts the workflow? (An event happens)</li><li><strong>Conditions:</strong> Are the right criteria met? (If/then logic)</li><li><strong>Actions:</strong> What should happen? (Do something)</li><li><strong>Error Handling:</strong> What if something goes wrong? (Catch failures)</li></ol><p>You don't need to be a programmer to design workflows. You need to think clearly about what should happen, when, and what could go wrong.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Example: Automated Order Processing Workflow</h3><pre>TRIGGER: New order received on Shopee\n  |\n  v\nCONDITION: Is payment confirmed?\n  |--- No --> Wait 24 hours, then cancel if still unpaid\n  |--- Yes\n  v\nCONDITION: Is item in stock?\n  |--- No --> Send \"out of stock\" email to customer\n  |          --> Alert inventory manager\n  |          --> Auto-refund payment\n  |--- Yes\n  v\nACTION: Generate packing slip\nACTION: Assign to warehouse picker\nACTION: Send \"order confirmed\" notification to customer\n  |\n  v\nTRIGGER: Item marked as packed\n  |\n  v\nACTION: Book courier pickup (J&T Express)\nACTION: Send tracking number to customer\n  |\n  v\nTRIGGER: Courier confirms delivery\n  |\n  v\nACTION: Send review request after 3 days\nACTION: Update sales dashboard\n\nERROR HANDLING:\n- If courier booking fails --> Retry 3 times, then alert ops team\n- If customer email bounces --> Log for manual review\n- If stock count is negative --> Freeze item listing, alert manager</pre>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The difference between a good workflow and a great workflow is error handling. Happy paths are easy to design — it's the edge cases that separate amateurs from pros.",
                    "metadata": {"type": "warning"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me design an automated workflow for [process]. I'll describe what currently happens manually and you convert it into a trigger > condition > action specification with error handling", "label": "Design my workflow"},
                            {"text": "I designed this workflow: [describe it]. Help me find the edge cases and failure points I missed — what happens when things go wrong?", "label": "Find my edge cases"},
                            {"text": "Create a workflow specification for automating employee onboarding — from offer acceptance to first day — including all the handoffs between HR, IT, and the hiring manager", "label": "Onboarding workflow"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>Writing Workflow Specs That Anyone Can Implement</h3><p>Whether you're handing this to a developer, setting it up in Zapier, or configuring it in a project management tool, your workflow spec needs:</p><ol><li><strong>Clear trigger event</strong> — what exactly starts this?</li><li><strong>Every condition branch</strong> — what happens for Yes AND No?</li><li><strong>Specific actions</strong> — not \"notify team\" but \"send Slack message to #operations channel with order ID and customer name\"</li><li><strong>Timing</strong> — should actions happen immediately, after a delay, or on a schedule?</li><li><strong>Error handling</strong> — what happens when each step fails?</li><li><strong>Success criteria</strong> — how do you know the workflow completed correctly?</li></ol>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "You've designed a workflow that automatically sends a payment reminder email when an invoice is 7 days overdue. It works perfectly for months. Then a major client reports getting 47 reminder emails in one day. What most likely happened, and what was missing from the workflow design?",
                    "metadata": {
                        "options": [
                            "The email system was hacked — this is a security issue, not a workflow issue",
                            "The workflow lacked a deduplication check or rate limit — it kept triggering because the invoice stayed in 'overdue' status each time the daily check ran, sending a new email every cycle instead of tracking that a reminder was already sent",
                            "The client's email server was duplicating messages — it's their problem",
                            "47 emails means there were 47 overdue invoices — the workflow worked correctly"
                        ],
                        "correct_index": 1,
                        "explanation": "This is a classic edge case: the trigger ('invoice is 7 days overdue') fires EVERY time the system checks, not just once. The workflow needed either: (a) a flag that marks 'reminder sent' so it only fires once, (b) a rate limit ('max 1 reminder per invoice per 7 days'), or (c) a state change trigger ('invoice BECOMES 7 days overdue') instead of a condition check ('invoice IS overdue'). Great workflows anticipate what happens when triggers fire repeatedly."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to help you design a workflow specification for employee onboarding. Which prompt will produce the most implementable workflow?",
                    "metadata": {
                        "options": [
                            "\"Create an onboarding workflow.\"",
                            "\"Design an automated onboarding workflow for our 20-person Philippine BPO company. When a new hire accepts the offer, the following needs to happen: HR creates their employee record (Day 1), IT provisions laptop and email (Days 1-3), the team lead schedules orientation (Day 2), training starts (Day 4). Specify each step as trigger > condition > action. Include: what triggers each step, what conditions must be met before proceeding (e.g., laptop ready AND orientation scheduled), error handling for each step (e.g., what if IT has no laptops in stock), notification rules (who gets alerted at each stage), and a timeout rule if any step takes longer than expected. Format it so I can hand it to a developer or set it up in Zapier.\"",
                            "\"What steps are in employee onboarding?\"",
                            "\"Automate HR processes for my company.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B specifies the exact business context (20-person BPO), lists every step with timing, asks for the complete workflow structure (triggers, conditions, actions, error handling, notifications, timeouts), identifies a specific dependency risk (laptop AND orientation both required), and specifies the output format (developer-ready or Zapier-ready). This produces a workflow specification you can actually implement, not a generic process description."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to find the edge cases and failure points in a workflow you have already designed?",
                    "metadata": {
                        "options": [
                            "\"Check my workflow for problems.\"",
                            "\"Here is my automated workflow for processing purchase orders: Trigger: PO submitted in Google Forms > Condition: Amount under P50,000? > If yes: auto-approve and notify finance > If no: email department head for approval > Wait for approval > Send PO to supplier > Supplier confirms > Update inventory spreadsheet. Stress-test this workflow: 1) What happens if the department head is on leave and never approves? 2) What if two POs are submitted for the same item simultaneously? 3) What if the supplier email bounces? 4) What if the Google Form has incomplete data? 5) What if the approval email goes to spam? For each failure, suggest a specific fix I can add to the workflow.\"",
                            "\"Is my workflow good enough?\"",
                            "\"List common workflow problems in procurement.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B provides the complete workflow for AI to analyze and asks five specific edge case questions that target real failure points: human unavailability, race conditions, communication failures, data quality, and email deliverability. By asking for a specific fix for each failure, you get actionable improvements like timeout escalation, deduplication checks, delivery confirmation, form validation, and multi-channel notifications. This approach systematically hardens your workflow against real-world failures."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A workflow designer builds a purchase approval workflow: if the amount is over P100,000, it requires VP approval. The workflow works perfectly for 6 months. Then someone submits a PO for P99,999 followed by another PO for P99,999 for the same vendor on the same day, splitting a P199,998 purchase to avoid VP approval. What workflow design principle was violated?",
                    "metadata": {
                        "options": [
                            "The approval threshold was set too high",
                            "The workflow should require VP approval for all purchases regardless of amount",
                            "The workflow lacked an aggregation rule that detects split transactions — checking individual PO amounts without considering patterns like same vendor, same day, or cumulative spend within a period",
                            "This is a personnel issue — the person should be disciplined, not a workflow issue"
                        ],
                        "correct_index": 2,
                        "explanation": "This is a classic workflow gaming pattern. The workflow only checked individual transaction amounts without looking at patterns. A robust workflow would include aggregation rules: flag when multiple POs to the same vendor within 24 hours exceed the threshold, or when cumulative weekly spend with a vendor exceeds a limit. Disciplining the individual (option D) is a band-aid — the system allowed it, so the system needs to be fixed. Great workflow designers think adversarially about how rules can be circumvented."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me write a complete workflow specification document for [process] that I can hand to a developer. Include triggers, conditions, actions, error handling, and edge cases", "label": "Complete workflow spec"},
                            {"text": "I'm using [Zapier/Make/Power Automate]. Help me design a workflow that [describe goal] using the triggers and actions available in that tool", "label": "Tool-specific workflow"}
                        ]
                    }
                }
            ]),
        },
    ],

    # ── Week 5: Scaling & Quality ─────────────────────────────────────────
    "ops-scaling": [
        {
            "slug": "data-organization",
            "title": "Data Organization & Reporting",
            "description": "Build reporting systems with leading indicators and use AI to create dashboards that drive decisions.",
            "xp_reward": 20,
            "passing_score": 70,
            "sort_order": 1,
            "ai_context": "Student is learning data organization and reporting. Help them distinguish leading from lagging indicators, design dashboards, and create reporting templates. Use AI to generate report structures and interpret sample data. Use Philippine business contexts.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Data Organization & Reporting: Measure What Matters</h2><p>Operations without data is guessing. But drowning in data is just as bad as having none. The skill is knowing <strong>which</strong> metrics to track and how to organize them so they drive action.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>Leading vs Lagging Indicators</h3><p>This is one of the most important concepts in operations:</p><ul><li><strong>Lagging indicators</strong> tell you what already happened (revenue, churn rate, customer complaints last month)</li><li><strong>Leading indicators</strong> predict what's going to happen (pipeline value, customer satisfaction score, employee engagement)</li></ul><p>Most people only track lagging indicators — they're looking in the rearview mirror. Great operators track leading indicators so they can see problems before they hit.</p><table><thead><tr><th>Goal</th><th>Lagging Indicator</th><th>Leading Indicator</th></tr></thead><tbody><tr><td>Increase sales</td><td>Monthly revenue</td><td>Number of demos booked this week</td></tr><tr><td>Reduce agent attrition</td><td>Turnover rate</td><td>Employee satisfaction survey scores</td></tr><tr><td>Improve delivery speed</td><td>Average delivery time</td><td>Order processing time (the part you control)</td></tr><tr><td>Grow customer base</td><td>Total customers</td><td>Website visits, trial signups</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "If you can only track 3 metrics, make at least 2 of them leading indicators. Lagging indicators tell you that you've already failed. Leading indicators give you time to course-correct.",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me identify the top 5 metrics I should track for my [role/business]. For each one, tell me if it's leading or lagging, and how often I should check it", "label": "Find my key metrics"},
                            {"text": "Help me design a weekly dashboard for my team. We work in [industry] and our main goals are [list goals]. Suggest the metrics, layout, and data sources", "label": "Design my dashboard"},
                            {"text": "Create a monthly report template for a [type of business] that includes financial metrics, operational metrics, and team metrics, with sections for analysis and action items", "label": "Monthly report template"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>Building a Metrics Hierarchy</h3><p>Don't track 50 metrics. Build a hierarchy:</p><ol><li><strong>North Star Metric</strong> (1) — The single number that defines success for the whole team</li><li><strong>Key Results</strong> (3-5) — The drivers that move the North Star</li><li><strong>Operational Metrics</strong> (5-10) — The daily/weekly numbers your team actually controls</li></ol><p><strong>Example for a BPO Team:</strong></p><pre>North Star: Client NPS Score (Net Promoter Score)\n  |\n  +-- Key Result: First Call Resolution Rate (target: 85%)\n  |     +-- Operational: Agent training completion rate\n  |     +-- Operational: Knowledge base article usage\n  |\n  +-- Key Result: Average Handle Time (target: &lt;6 min)\n  |     +-- Operational: Call routing accuracy\n  |     +-- Operational: System uptime\n  |\n  +-- Key Result: Agent Satisfaction Score (target: 4.2/5)\n        +-- Operational: Schedule adherence\n        +-- Operational: Overtime hours per agent</pre>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A Philippine food delivery startup tracks these metrics: (A) Total orders delivered last month, (B) Average customer rating, (C) Number of new restaurant partnerships signed this week, (D) Revenue per order. Their goal is to grow the business. Which is the most useful leading indicator for growth?",
                    "metadata": {
                        "options": [
                            "A — Total orders delivered, because it shows overall volume",
                            "B — Average customer rating, because happy customers come back",
                            "C — New restaurant partnerships signed this week, because more restaurant options drive more customer orders in the future",
                            "D — Revenue per order, because it shows profitability"
                        ],
                        "correct_index": 2,
                        "explanation": "New restaurant partnerships (C) is the best leading indicator for growth because it predicts future order volume — more restaurants = more choices = more customers ordering. Total orders (A) and revenue (D) are lagging — they tell you what happened. Customer rating (B) is somewhat leading (predicts retention) but doesn't directly predict growth the way supply expansion does. Great operators track the inputs that drive future outcomes."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to help you design a weekly dashboard for your operations team. Which prompt will produce the most actionable dashboard design?",
                    "metadata": {
                        "options": [
                            "\"Design a dashboard for my team.\"",
                            "\"I manage a 12-person customer service team at a Philippine e-commerce company. Our main goals are: reduce average response time to under 2 hours, achieve 90% customer satisfaction, and keep agent attrition below 10% per quarter. Design a weekly dashboard with: 1) A North Star metric and 3-5 key results, 2) For each metric, specify whether it is leading or lagging, 3) The data source for each metric (we use Zendesk for tickets and Google Sheets for tracking), 4) Red/yellow/green thresholds so I can spot problems at a glance, 5) A section for weekly trends showing whether each metric is improving or declining. Make the dashboard scannable in under 60 seconds.\"",
                            "\"What metrics should a customer service team track?\"",
                            "\"Create a KPI report template.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B gives AI the team context (12-person CS team, e-commerce), specific goals with targets (2-hour response time, 90% CSAT, 10% attrition), available tools (Zendesk, Google Sheets), and design requirements (red/yellow/green thresholds, trend lines, 60-second scan time). This produces a dashboard you can actually build and use, not a generic list of KPIs. The leading vs lagging requirement ensures the dashboard predicts problems instead of just reporting them after the fact."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to analyze operational data and extract actionable insights?",
                    "metadata": {
                        "options": [
                            "\"Analyze my data and tell me what to do.\"",
                            "\"Here is our BPO team's data for the last 4 weeks: Week 1 — 450 tickets resolved, 4.2 CSAT, 6.5 min avg handle time, 2 agents absent. Week 2 — 380 tickets, 3.8 CSAT, 8.1 min avg handle time, 5 agents absent. Week 3 — 410 tickets, 3.9 CSAT, 7.4 min avg handle time, 3 agents absent. Week 4 — 425 tickets, 4.0 CSAT, 7.0 min avg handle time, 2 agents absent. Our targets are 450 tickets/week, 4.0 CSAT, and under 7 min handle time. Analyze the trends, identify correlations (e.g., does absenteeism affect handle time?), flag which metrics are improving vs declining, and recommend 3 specific actions for next week prioritized by impact.\"",
                            "\"What do my numbers mean?\"",
                            "\"Help me make a chart from my team's performance data.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B provides structured weekly data with multiple variables, clear targets for comparison, and asks AI to find correlations (the Week 2 spike in absenteeism coincides with lower CSAT and higher handle time — suggesting understaffing degrades service quality). It requests trend analysis, not just a snapshot, and asks for prioritized actions. This turns raw data into a decision-making tool. Without specific numbers and targets, AI can only give generic advice."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A team tracks 35 different metrics in their weekly report. Reviewing the report takes the manager 45 minutes. Most metrics are green every week and never change. What is the core problem with this reporting approach?",
                    "metadata": {
                        "options": [
                            "The manager should learn to read reports faster",
                            "35 metrics is appropriate for thorough monitoring — the manager should schedule more time for review",
                            "Too many metrics dilute attention from the few that matter — the team should build a metrics hierarchy with 1 North Star metric, 3-5 key results, and only surface operational metrics that are off-target or trending in the wrong direction",
                            "The report should be automated so nobody has to read it"
                        ],
                        "correct_index": 2,
                        "explanation": "When everything is highlighted, nothing is highlighted. A report with 35 metrics where most are always green trains the reader to skim past everything — including the 2-3 metrics that actually need attention. A metrics hierarchy focuses attention: the North Star tells you if the whole system is healthy, key results tell you which drivers need work, and operational metrics only surface when they breach thresholds. This turns a 45-minute review into a 5-minute scan that catches the signals that matter."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me build a metrics hierarchy for my team. Our North Star metric is [X]. Help me identify the key results and operational metrics that drive it", "label": "Build my metrics hierarchy"},
                            {"text": "I have this data from last month: [paste or describe your data]. Help me analyze it and identify the 3 most important insights and recommended actions", "label": "Analyze my data"}
                        ]
                    }
                }
            ]),
        },
        {
            "slug": "quality-assurance",
            "title": "Quality Assurance Systems",
            "description": "Build QA frameworks that catch problems before customers do.",
            "xp_reward": 25,
            "passing_score": 70,
            "sort_order": 2,
            "ai_context": "Student is learning QA systems. Help them design checklists, audit processes, and feedback loops. Emphasize building quality INTO the process vs inspecting after. Generate QA templates and audit frameworks. Use practical examples.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Quality Assurance: Build It In, Don't Inspect It In</h2><p>Most teams handle quality like this: do the work, then check for errors at the end. This is like baking a cake and only tasting it after it's frosted — if the batter was wrong, you've wasted everything.</p><p>Great QA systems build quality into each step of the process so errors are caught — or prevented — where they happen.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The QA Toolkit</h3><table><thead><tr><th>Tool</th><th>What It Does</th><th>When to Use</th></tr></thead><tbody><tr><td><strong>Checklists</strong></td><td>Ensures every step is completed</td><td>Repetitive tasks with many steps (packing orders, onboarding)</td></tr><tr><td><strong>Spot Audits</strong></td><td>Random sampling to find systemic issues</td><td>High-volume work (call center calls, data entry)</td></tr><tr><td><strong>Peer Review</strong></td><td>Another person checks the work</td><td>High-stakes outputs (contracts, financial reports)</td></tr><tr><td><strong>Automated Checks</strong></td><td>Software validates rules automatically</td><td>Rule-based validation (form fields, data formats)</td></tr><tr><td><strong>Feedback Loops</strong></td><td>Customer/user reports flow back to improve process</td><td>Ongoing improvement (product quality, service quality)</td></tr></tbody></table><h3>Building Quality INTO the Process</h3><p>Instead of checking quality at the end, embed checks at each critical step:</p><pre>Order Packing Process:\n\nStep 1: Pick items from shelf\n  --> QA: Scan barcode — system confirms correct item\n\nStep 2: Check item condition\n  --> QA: Visual inspection checklist (no damage, correct color/size)\n\nStep 3: Pack into box\n  --> QA: Photo of packed items before sealing (evidence if dispute)\n\nStep 4: Print and attach shipping label\n  --> QA: System verifies address matches order\n\nStep 5: Hand to courier\n  --> QA: Courier scans package — creates chain of custody</pre><p>With embedded QA, a defective item is caught at Step 2, not after the customer receives it and writes a 1-star review.</p>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "Every quality problem is really a process problem. Instead of asking 'who made this mistake?', ask 'what in the process allowed this mistake to happen?'",
                    "metadata": {"type": "tip"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me create a QA checklist for [process/task]. Include checks at each critical step, not just at the end", "label": "Build a QA checklist"},
                            {"text": "We keep having this quality problem: [describe recurring issue]. Help me trace it back to the root cause in the process and design a QA check that prevents it", "label": "Fix a quality problem"},
                            {"text": "Design a spot audit process for my team of [size] doing [type of work]. How many samples should I check, how often, and what should I look for?", "label": "Design a spot audit"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Feedback Loop: Closing the Quality Circle</h3><p>The most powerful QA tool is a <strong>feedback loop</strong> — a system that routes quality problems back to the step where they originate.</p><p><strong>Example:</strong> A BPO client reports that 15% of data entry records have errors in the 'address' field. Instead of just re-training agents:</p><ol><li>Analyze WHERE in the address field errors occur (wrong city? wrong zip code?)</li><li>Discover that agents are manually typing city names instead of selecting from a dropdown</li><li>Fix the process: add a city dropdown to the data entry form</li><li>Result: address errors drop from 15% to 2%</li></ol><p>The feedback loop turned a quality problem into a process improvement.</p>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A Philippine BPO team processing insurance claims has a 12% error rate. Management's response is to add a QA reviewer who checks every claim before submission, catching about 80% of errors. After 3 months, the error rate on claims reaching the client drops to 2.4%, but processing time doubles and the team needs 2 additional QA reviewers. Which QA approach would be more effective long-term?",
                    "metadata": {
                        "options": [
                            "Hire more QA reviewers to check 100% of claims — eventually errors reaching the client will be near zero",
                            "Analyze the 12% of errors to find the top 3 root causes, then fix the process at those points — add validation rules, dropdown menus, or decision trees that prevent the errors from being made in the first place",
                            "Provide more training to agents — if they understand the rules better, they'll make fewer errors",
                            "Implement a penalty system for agents who make errors — this will motivate them to be more careful"
                        ],
                        "correct_index": 1,
                        "explanation": "Adding reviewers (A) is the 'inspect it in' approach — it catches errors but doesn't prevent them, and it's expensive to scale. Training (C) helps but fades over time. Penalties (D) create fear, not quality. The system fix (B) eliminates the root causes: if 40% of errors are wrong claim codes, add a dropdown. If 30% are math errors, add auto-calculation. Building quality INTO the process is cheaper, more scalable, and permanent."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to help you design a QA system for your team's data entry work. Which prompt will produce the most effective quality framework?",
                    "metadata": {
                        "options": [
                            "\"Help me improve my team's quality.\"",
                            "\"My BPO team of 8 agents processes 200 insurance claim forms per day into our client's system. Our current error rate is 8%, mainly in these fields: claim type code (wrong code selected), date of service (format errors), and billed amount (decimal point errors). Design a QA system that builds quality INTO the process rather than inspecting after. For each error type, suggest: 1) A process change that prevents the error from happening (e.g., dropdown vs free text), 2) An inline validation check that catches it immediately, 3) A spot audit sampling plan (how many to check, how often, what to look for). Also design a weekly feedback loop that routes error patterns back to process improvements.\"",
                            "\"What QA checks should a data entry team have?\"",
                            "\"Create a quality scorecard for my agents.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B gives AI the exact quality problem to solve: team size, volume (200/day), current error rate (8%), the three specific error types with their root causes, and the philosophical approach (build quality in, not inspect after). It asks for prevention, detection, and feedback mechanisms for each error type. This produces a complete QA system, not a generic checklist. The weekly feedback loop ensures the system improves over time as new error patterns emerge."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to trace a recurring quality problem to its root cause in the process?",
                    "metadata": {
                        "options": [
                            "\"Why does my team keep making mistakes?\"",
                            "\"We pack and ship 150 orders per day from our warehouse in Taguig. In the last month, 18 customers received the wrong item (12% error rate on size — they ordered Medium but received Large, or ordered Blue but received Black). Walk me through a root cause analysis: at which step in the packing process could size/color errors enter? Consider: how pickers identify items on the shelf, how they match items to orders, how packers verify before sealing, and whether our SKU labeling system could be causing confusion. Then suggest process changes at the root cause — not just adding more checkers at the end.\"",
                            "\"How do I reduce shipping errors?\"",
                            "\"Design a packing checklist for my warehouse.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B provides the specific error pattern (size/color mix-ups), quantifies it (18 out of 150/day), and walks AI through the full packing process to investigate. It asks AI to trace the error to a specific step rather than adding inspection at the end. The likely root cause is SKU labeling — if Medium Blue and Large Black have similar-looking labels or adjacent shelf locations, the fix is to redesign the labeling system or shelf layout, not to add a checker who will eventually miss the same confusing labels."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A company implements a strict QA process where every piece of work is checked by a reviewer before delivery. Six months later, they notice that agents have become less careful because they know a reviewer will catch their mistakes. What is this phenomenon called and how should the QA system be redesigned?",
                    "metadata": {
                        "options": [
                            "This is normal — QA reviewers exist to catch mistakes, so agents can work faster and worry less about accuracy",
                            "This is moral hazard — when people know a safety net exists, they take less care. The fix is to shift QA from 100% review to spot audits with individual accountability, so agents own their quality and reviews verify the system rather than replacing personal responsibility",
                            "The agents are being lazy and should be penalized for every error the reviewer catches",
                            "The company should remove QA entirely so agents have to be more careful"
                        ],
                        "correct_index": 1,
                        "explanation": "This is a classic moral hazard problem in QA design. When agents know every piece of work will be checked, the rational response is to reduce effort on accuracy since someone else will catch errors anyway. The system redesign shifts from 100% inspection (which creates dependency) to spot audits (which maintain accountability). Agents know their work MIGHT be audited but do not know which items, so they must maintain quality on everything. Individual error rates are tracked and used for coaching, not punishment."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me design a feedback loop for quality problems in my team's work. We do [type of work] and our most common errors are: [list them]", "label": "Design a feedback loop"},
                            {"text": "Create a QA audit template for reviewing [type of work] that I can use weekly, with scoring criteria and an action items section", "label": "QA audit template"}
                        ]
                    }
                }
            ]),
        },
        {
            "slug": "scaling-operations",
            "title": "Scaling Operations",
            "description": "Learn what breaks when you grow and use AI to build scaling playbooks, capacity plans, and delegation frameworks.",
            "xp_reward": 30,
            "passing_score": 70,
            "sort_order": 3,
            "ai_context": "Student is learning about scaling operations. Help them anticipate what breaks at different growth stages. Generate scaling playbooks, capacity plans, and delegation frameworks. This is the capstone lesson — connect concepts from all previous weeks. Use Philippine business examples.",
            "ai_tools_enabled": ["chat"],
            "content_blocks": json.dumps([
                {
                    "type": "markdown",
                    "content": "<h2>Scaling Operations: What Breaks When You Grow</h2><p>Everything that works at 5 people breaks at 50. Everything that works at 50 breaks at 500. Scaling isn't just \"doing more\" — it's rebuilding systems at each growth stage.</p><p>This is the capstone of everything you've learned: systems thinking, process mapping, SOPs, project management, automation, and quality. They all come together when you scale.</p>",
                    "metadata": {}
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Three Breaking Points</h3><table><thead><tr><th>Stage</th><th>What Works</th><th>What Breaks</th><th>The Fix</th></tr></thead><tbody><tr><td><strong>1-5 people</strong></td><td>Everyone knows everything. Communication is instant. Decisions are fast.</td><td>Nothing is documented. Knowledge lives in heads. The founder is the bottleneck for every decision.</td><td>Write your first SOPs. Document the top 10 processes. Start delegating decisions with clear criteria.</td></tr><tr><td><strong>5-20 people</strong></td><td>Specialization. Dedicated roles. More capacity.</td><td>Communication breaks. Teams form silos. Information gets lost between handoffs. Quality becomes inconsistent.</td><td>Build a knowledge base. Create cross-team workflows. Implement QA checklists. Hold weekly syncs.</td></tr><tr><td><strong>20-100 people</strong></td><td>Departments. Middle management. Real processes.</td><td>Processes are slow. Too many approvals. Innovation dies. New hires take months to be productive. Culture dilutes.</td><td>Automate workflows. Build self-service tools. Create onboarding playbooks. Decentralize decisions to team leads.</td></tr></tbody></table>",
                    "metadata": {}
                },
                {
                    "type": "callout",
                    "content": "The biggest mistake in scaling: adding people instead of fixing systems. If a broken process is handled by 2 people, adding 2 more people gives you a broken process handled by 4 people.",
                    "metadata": {"type": "warning"}
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "My team/business is currently at [X people] and growing to [Y people]. Help me identify the top 5 things that will break during this growth and what to do about each one", "label": "What will break when we grow?"},
                            {"text": "Help me create a scaling playbook for [function/department]. Include: what to document now, what to automate, what roles to hire, and what systems to build at each stage", "label": "Build a scaling playbook"},
                            {"text": "Create a capacity planning model for my team. We currently handle [X volume] with [Y people]. If volume grows to [Z], help me figure out what we need", "label": "Capacity planning model"}
                        ]
                    }
                },
                {
                    "type": "markdown",
                    "content": "<h3>The Delegation Framework</h3><p>Scaling yourself means learning to delegate effectively. Use this framework:</p><table><thead><tr><th>Level</th><th>You Say</th><th>When to Use</th></tr></thead><tbody><tr><td><strong>Level 1: Do exactly this</strong></td><td>\"Follow this SOP step by step\"</td><td>New hires, critical processes with zero room for error</td></tr><tr><td><strong>Level 2: Research and recommend</strong></td><td>\"Look into this and suggest 3 options\"</td><td>Building someone's judgment, medium-stakes decisions</td></tr><tr><td><strong>Level 3: Decide and inform</strong></td><td>\"Handle this and let me know what you decided\"</td><td>Trusted team members, reversible decisions</td></tr><tr><td><strong>Level 4: Decide and act</strong></td><td>\"Own this completely — I trust your judgment\"</td><td>Senior team members, their area of expertise</td></tr></tbody></table><p>Most managers stay at Level 1 forever, which makes them the bottleneck. The goal is to move people up the levels as they build competence and trust.</p><h3>Your Operations Toolkit (Everything From This Track)</h3><ul><li><strong>Week 1:</strong> Systems thinking + Process mapping = See the system</li><li><strong>Week 2:</strong> SOPs + Knowledge management = Document the system</li><li><strong>Week 3:</strong> Project planning + Communication + Risk = Manage the system</li><li><strong>Week 4:</strong> Automation + Workflow design = Optimize the system</li><li><strong>Week 5:</strong> Data + QA + Scaling = Scale the system</li></ul>",
                    "metadata": {}
                },
                {
                    "type": "quiz",
                    "content": "A Philippine e-commerce company with 15 employees is about to grow to 40 due to a big client contract. The founder currently approves all refunds, handles all supplier negotiations, and personally trains every new hire. Operations are already strained. Which change has the highest leverage for scaling successfully?",
                    "metadata": {
                        "options": [
                            "Hire a personal assistant for the founder to help manage their schedule",
                            "Create a refund approval SOP with clear thresholds (auto-approve under P2,000, team lead approves P2,000-P10,000, founder only for P10,000+), document the supplier negotiation playbook, and build a structured onboarding program that team leads can deliver",
                            "Hire 25 new employees quickly to handle the increased volume",
                            "Invest in better office space with more desks and meeting rooms"
                        ],
                        "correct_index": 1,
                        "explanation": "The founder is the bottleneck for three critical functions. Option B applies everything from this track: SOPs with decision thresholds (Week 2) so refunds don't need founder approval, a documented playbook (Week 2) so others can negotiate with suppliers, and a scalable onboarding system (Week 3) that doesn't depend on one person. This turns the founder from a doer into a system designer — the highest-leverage change possible. Hiring more people (C) without fixing the system just creates more people waiting for the founder's approval."
                    }
                },
                {
                    "type": "quiz",
                    "content": "You want AI to help you build a scaling playbook for your growing operations team. Which prompt will produce the most comprehensive and actionable playbook?",
                    "metadata": {
                        "options": [
                            "\"Help me scale my business.\"",
                            "\"I run operations for a Philippine e-commerce company currently at 12 people, growing to 35 in the next 6 months. I am the bottleneck for: approving purchase orders, resolving customer escalations, and training new hires. Build me a scaling playbook that covers: 1) Which of my tasks to delegate first using the delegation framework (Level 1-4), 2) What SOPs and decision-threshold documents I need to write before I can delegate each task, 3) What automated workflows to build (e.g., auto-approve POs under P10K), 4) A hiring and onboarding timeline that ensures new people are productive within 2 weeks, 5) Metrics I should track to monitor whether quality holds as we scale. Prioritize by what will break first if I do nothing.\"",
                            "\"What breaks when a company grows from 12 to 35 people?\"",
                            "\"Create a growth strategy for my e-commerce company.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B integrates every concept from the entire operations track into one prompt: delegation frameworks (this lesson), SOPs (Week 2), automated workflows (Week 4), onboarding systems (Week 3), and quality metrics (Week 5). It identifies the specific bottlenecks (three tasks the manager owns), sets a clear timeline (6 months), and asks AI to prioritize by risk ('what breaks first'). This produces a playbook that is specific to this exact scaling challenge, not a generic growth framework."
                    }
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best help you use AI to create a delegation plan for yourself as your team grows?",
                    "metadata": {
                        "options": [
                            "\"What tasks should a manager delegate?\"",
                            "\"I am the operations manager at a 20-person company and I currently do these tasks myself: 1) Approve all expense reports (20/week, 5 min each), 2) Handle all vendor negotiations (3/month, 2 hours each), 3) Review and approve all social media posts (10/week, 15 min each), 4) Conduct all job interviews (4/month, 1 hour each), 5) Resolve tier-2 customer complaints (8/week, 30 min each). For each task, recommend: the delegation level (1-4), who I should delegate it to (existing role or new hire), what documentation or training the delegate needs before I hand it off, and what check-in or audit process I should keep to ensure quality. Start with the tasks where my involvement adds the least value.\"",
                            "\"How do I stop being a bottleneck?\"",
                            "\"Teach me about delegation best practices.\""
                        ],
                        "correct_index": 1,
                        "explanation": "Option B lists every task with frequency and time cost, which lets AI calculate where the manager's time is most wasted. Expense report approval (20/week x 5 min = 100 min/week of low-judgment work) is the obvious first delegation candidate — it can be a Level 1 SOP delegation. Vendor negotiations require judgment and might be Level 2 or 3. The prompt asks for the complete delegation package: level, who, prerequisites, and ongoing oversight. This produces a concrete action plan, not theoretical advice."
                    }
                },
                {
                    "type": "quiz",
                    "content": "A company doubles its team from 20 to 40 people over 3 months. Despite adding more people, productivity per person drops by 30% and customer complaints increase. What is the most likely explanation from a scaling operations perspective?",
                    "metadata": {
                        "options": [
                            "The new hires are less talented than the original team",
                            "The company grew too quickly and should have hired more slowly",
                            "The company added people without upgrading its systems — the processes, communication channels, documentation, and decision-making structures that worked for 20 people are now creating bottlenecks, confusion, and inconsistency at 40 people",
                            "Productivity always drops temporarily during growth and will recover on its own"
                        ],
                        "correct_index": 2,
                        "explanation": "This is the fundamental scaling problem: systems that work at one size break at another. With 20 people, the manager could answer every question personally. With 40, they become a bottleneck. With 20, verbal training worked. With 40, inconsistent training creates inconsistent quality. With 20, one Viber group chat was enough. With 40, critical messages get buried. The fix is not to slow down hiring (option B) or blame the new people (option A), but to build scalable systems: documented SOPs, self-service knowledge bases, automated workflows, and distributed decision-making."
                    }
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me create a delegation plan. I currently do [list your tasks]. Help me decide which to delegate, at what level, and what documentation or training the delegate needs", "label": "Create my delegation plan"},
                            {"text": "Help me build a complete operations playbook for my [role/department] that covers all the systems from this track: processes, SOPs, project management, automation, metrics, QA, and scaling", "label": "Build my ops playbook"},
                            {"text": "I'm the operations person at a growing Philippine startup. What should my 90-day plan look like to build scalable systems before we triple in size?", "label": "90-day ops plan"}
                        ]
                    }
                }
            ]),
        },
    ],
}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== Seeding AI Operations & Systems track ===\n")

    # Step 1: Delete existing data for idempotency
    print("[1/3] Cleaning existing data...")
    delete_existing()

    # Step 2: Create modules
    print("\n[2/3] Creating modules...")
    module_ids = {}
    for mod in MODULES:
        mod_data = {**mod, "track_id": TRACK_ID}
        mid = create_module(mod_data)
        module_ids[mod["slug"]] = mid
        print(f"  + {mod['slug']} -> {mid}")

    # Step 3: Create lessons
    print("\n[3/3] Creating lessons...")
    for module_slug, lessons in LESSONS.items():
        mid = module_ids[module_slug]
        for lesson in lessons:
            lesson_data = {**lesson, "module_id": mid}
            lid = create_lesson(lesson_data)
            print(f"  + {lesson['slug']} -> {lid}")

    total_lessons = sum(len(v) for v in LESSONS.values())
    print(f"\nDone! Created {len(MODULES)} modules and {total_lessons} lessons.")
