#!/usr/bin/env python3
"""Seed the AI Graphic Design & Visual track with 5 modules and 12 lessons via Supabase REST API."""

import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://szdpzjlhbkytonuhlwif.supabase.co"
SERVICE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZHB6amxoYmt5dG9udWhsd2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI5ODgwNCwiZXhwIjoyMDg0ODc0ODA0fQ."
    "K-vQBAvsZU7T3MVYCzG1SIL_IlWNO2rvzTN_WyFNYVM"
)

TRACK_ID = "9d91cf54-e603-4804-bf67-0f6eb2ffdc6b"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def api(method, table, params="", body=None, extra_headers=None):
    """Make a Supabase REST API call and return parsed JSON (or None)."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if params:
        url += f"?{params}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in HEADERS.items():
        req.add_header(k, v)
    if extra_headers:
        for k, v in extra_headers.items():
            req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        print(f"  HTTP {e.code}: {body_text}")
        raise


def delete_existing():
    """Remove existing lessons and modules for this track so the script is re-runnable."""
    print("Cleaning existing data for this track...")

    # Get module IDs for this track
    modules = api("GET", "academy_modules", f"track_id=eq.{TRACK_ID}&select=id")
    if modules:
        mod_ids = [m["id"] for m in modules]
        id_list = ",".join(f'"{mid}"' for mid in mod_ids)
        # Delete lessons linked to these modules
        api("DELETE", "academy_lessons", f"module_id=in.({id_list})")
        print(f"  Deleted lessons for {len(mod_ids)} modules")
        # Delete the modules
        api("DELETE", "academy_modules", f"track_id=eq.{TRACK_ID}")
        print(f"  Deleted {len(mod_ids)} modules")
    else:
        print("  No existing modules found — fresh seed")


def create_modules():
    """Create 5 modules and return a dict mapping slug -> id."""
    print("\nCreating modules...")
    modules_data = [
        {"track_id": TRACK_ID, "title": "Design Foundations", "slug": "design-foundations",
         "description": "Learn the visual principles that separate amateur designs from professional ones — and how to apply them with AI tools.",
         "week_number": 1, "sort_order": 1},
        {"track_id": TRACK_ID, "title": "Color & Typography", "slug": "color-and-typography",
         "description": "Master the two most powerful design tools: color and type. Learn to direct AI with precision using color theory and typographic principles.",
         "week_number": 2, "sort_order": 2},
        {"track_id": TRACK_ID, "title": "AI Image Mastery", "slug": "ai-image-mastery",
         "description": "Become fluent in AI image generation. Learn prompt anatomy, advanced techniques, and how to maintain visual consistency across outputs.",
         "week_number": 3, "sort_order": 3},
        {"track_id": TRACK_ID, "title": "Brand & Campaign Design", "slug": "brand-and-campaign",
         "description": "Apply your skills to real-world brand identity and multi-asset campaign design, including AI video creation.",
         "week_number": 4, "sort_order": 4},
        {"track_id": TRACK_ID, "title": "Video & Portfolio", "slug": "video-and-portfolio",
         "description": "Sharpen your critical eye, learn the art of design critique, and create a portfolio-worthy capstone project.",
         "week_number": 5, "sort_order": 5},
    ]

    slug_to_id = {}
    for m in modules_data:
        result = api("POST", "academy_modules", "", m,
                      extra_headers={"Prefer": "return=representation"})
        row = result[0] if isinstance(result, list) else result
        slug_to_id[row["slug"]] = row["id"]
        print(f"  + {row['slug']} -> {row['id']}")

    return slug_to_id


# ---------------------------------------------------------------------------
# Lesson definitions
# ---------------------------------------------------------------------------

def build_lessons(mod):
    """Return a list of (lesson_row, patch_data) tuples.
    mod is a dict mapping module slug -> uuid.
    """
    lessons = []

    # -----------------------------------------------------------------------
    # LESSON 1 — Visual Hierarchy & Composition
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["design-foundations"],
            "title": "Visual Hierarchy & Composition",
            "slug": "visual-hierarchy",
            "description": "Learn how designers guide the viewer's eye using size, color, contrast, alignment, and whitespace — and how to instruct AI to apply these principles.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 20,
            "sort_order": 1,
            "ai_tools_enabled": ["chat"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Visual Hierarchy: Controlling Where People Look</h2>"
                        "<p>Every time someone sees a design — a poster, a website, an ad — their eye follows a path. "
                        "That path isn't random. <strong>Great designers engineer it.</strong></p>"
                        "<p>Visual hierarchy is the arrangement of elements so that viewers naturally absorb information "
                        "in the order <em>you</em> choose. Without hierarchy, a design is just noise.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>The 5 Tools of Visual Hierarchy</h3>"
                        "<table><thead><tr><th>Tool</th><th>How It Works</th><th>AI Prompt Keyword</th></tr></thead>"
                        "<tbody>"
                        "<tr><td><strong>Size</strong></td><td>Bigger elements get seen first. A large headline dominates a small paragraph.</td>"
                        "<td><em>\"large, dominant headline\"</em></td></tr>"
                        "<tr><td><strong>Color</strong></td><td>Bright or saturated colors attract the eye before muted tones.</td>"
                        "<td><em>\"vibrant accent color on muted background\"</em></td></tr>"
                        "<tr><td><strong>Contrast</strong></td><td>High contrast (dark on light) pops. Low contrast recedes.</td>"
                        "<td><em>\"high-contrast, bold text on clean background\"</em></td></tr>"
                        "<tr><td><strong>Alignment</strong></td><td>Breaking alignment creates a focal point. Consistent alignment creates calm.</td>"
                        "<td><em>\"centered, symmetrical layout\"</em></td></tr>"
                        "<tr><td><strong>Whitespace</strong></td><td>Empty space around an element makes it feel important and luxurious.</td>"
                        "<td><em>\"generous whitespace, minimalist layout\"</em></td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "The most common beginner mistake? Making everything the same size and weight. "
                        "If everything screams for attention, nothing gets it. Pick ONE element to dominate."
                    ),
                    "metadata": {"type": "warning"},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Reading Patterns: Z-Pattern vs F-Pattern</h3>"
                        "<p>Eye-tracking research shows two dominant reading patterns:</p>"
                        "<ul>"
                        "<li><strong>Z-Pattern</strong> — Used for designs with minimal text (posters, landing pages). "
                        "The eye moves: top-left → top-right → diagonal to bottom-left → bottom-right. "
                        "Place your logo top-left, CTA bottom-right.</li>"
                        "<li><strong>F-Pattern</strong> — Used for text-heavy content (articles, emails). "
                        "The eye scans the top, then skims down the left side. "
                        "Put your most important info in the first two lines and the left column.</li>"
                        "</ul>"
                        "<p>When prompting AI, you can say <em>\"layout following a Z-pattern with the call to action at bottom-right\"</em> "
                        "to direct the composition.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "quiz",
                    "content": (
                        "You're designing a promotional poster for a music festival. You want the band name to be the first "
                        "thing people see, followed by the date, then the venue. Which combination of hierarchy tools creates "
                        "the strongest visual flow?"
                    ),
                    "metadata": {
                        "options": [
                            "Make the band name, date, and venue all the same size in different colors",
                            "Use a large, high-contrast band name at top, medium date in an accent color, small venue with generous whitespace below",
                            "Center everything in the same font at the same weight and vary only the color slightly",
                            "Put the venue in the largest font since it's the most practical information",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Combining size (large → medium → small), contrast (high for the headline), and color (accent on the date) "
                            "creates a clear three-level hierarchy. Making everything the same size destroys hierarchy — the viewer's eye "
                            "has no roadmap. Practical info like the venue is secondary; the band name is the emotional hook."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which AI image prompt best applies visual hierarchy principles to create a tech conference poster?",
                    "metadata": {
                        "options": [
                            "\"A tech conference poster with text and images, colorful, modern design, 4K resolution\"",
                            "\"Tech conference poster with a dominant large bold headline at top in white on dark background, medium-sized date and speaker names in an accent teal color below, small venue details at the bottom with generous whitespace, high-contrast minimal layout\"",
                            "\"A poster for a tech conference, make the text big and bold, use lots of neon colors, add circuit board patterns everywhere, futuristic font\"",
                            "\"Minimalist poster, all text the same size in a centered column, monochrome gray palette, no images, simple and clean\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt creates a clear three-level visual hierarchy: a dominant headline (size + contrast), "
                            "secondary info in an accent color (color), and tertiary details at the bottom. It also specifies whitespace "
                            "for breathing room. The first prompt is too vague. The third adds visual clutter everywhere. "
                            "The fourth makes everything the same size, destroying hierarchy entirely."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "You need to generate an AI image of a restaurant menu board. Which prompt would best ensure the daily special stands out as the primary focal point?",
                    "metadata": {
                        "options": [
                            "\"Restaurant chalkboard menu with the daily special written in large bold white chalk lettering at top-center with extra space around it, regular menu items in smaller thin chalk text below, warm spotlight illuminating the special, rustic dark background\"",
                            "\"A restaurant menu board with all items listed neatly in the same font and size, organized alphabetically for easy reading\"",
                            "\"Chalkboard menu, colorful, every item in a different fun font to make it interesting and eye-catching\"",
                            "\"Restaurant menu design, professional, HD quality, beautiful food photography surrounding the text\"",
                        ],
                        "correct_index": 0,
                        "explanation": (
                            "The first prompt uses three hierarchy tools: size (large bold for the special vs. smaller for other items), "
                            "whitespace (extra space around the special), and contrast (spotlight on the key element). "
                            "Same-size listings create no focal point. Different fonts for every item create chaos, not hierarchy. "
                            "Surrounding text with photos competes for attention rather than directing it."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "According to eye-tracking research, where should you place the call-to-action on a landing page that uses the Z-pattern layout?",
                    "metadata": {
                        "options": [
                            "Top-left corner, where the eye starts scanning",
                            "Dead center of the page for maximum visibility",
                            "Bottom-right area, where the Z-pattern naturally ends",
                            "Along the left margin, following the F-pattern reading path",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "In a Z-pattern layout, the eye moves from top-left to top-right, then diagonally down to bottom-left, "
                            "and finally to bottom-right. The CTA belongs at the end of this journey — bottom-right — because that is "
                            "where the viewer's eye naturally arrives after absorbing the headline and supporting content. "
                            "Placing it at the start wastes the buildup; center placement ignores natural reading flow."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Analyze the visual hierarchy of a typical Instagram ad — what do you see first, second, third, and why?", "label": "Analyze an ad layout"},
                            {"text": "What's the difference between Z-pattern and F-pattern layouts, and when should I use each?", "label": "Z vs F pattern"},
                            {"text": "Give me an AI image prompt that uses all 5 hierarchy tools (size, color, contrast, alignment, whitespace) for a tech event poster", "label": "Write a hierarchy-focused prompt"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on visual hierarchy. The student is learning design fundamentals. "
                "Help them understand how to guide the viewer's eye using size, color, contrast, alignment, and whitespace. "
                "When they ask for prompt help, always tie it back to hierarchy principles. "
                "Encourage them to be specific about which element should dominate and which should recede."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 2 — The CRAP Design Principles
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["design-foundations"],
            "title": "The CRAP Design Principles",
            "slug": "design-principles",
            "description": "Master the four pillars of clean design: Contrast, Repetition, Alignment, and Proximity — the universal checklist that makes any visual look professional.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 20,
            "sort_order": 2,
            "ai_tools_enabled": ["chat"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>The CRAP Principles: Your Design Quality Checklist</h2>"
                        "<p>The acronym is unforgettable for a reason. <strong>CRAP</strong> stands for four principles that, "
                        "when applied together, make virtually any design look more professional:</p>"
                        "<ul>"
                        "<li><strong>C</strong>ontrast</li>"
                        "<li><strong>R</strong>epetition</li>"
                        "<li><strong>A</strong>lignment</li>"
                        "<li><strong>P</strong>roximity</li>"
                        "</ul>"
                        "<p>These aren't creative suggestions — they're the structural bones of good design. Violate them and your "
                        "design feels \"off\" even if the viewer can't explain why.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Contrast — Make Differences Obvious</h3>"
                        "<p>If two elements are different, make them <em>very</em> different. Timid contrast looks like a mistake.</p>"
                        "<ul>"
                        "<li><strong>Good:</strong> Bold 48px headline over 14px light body text</li>"
                        "<li><strong>Bad:</strong> 18px medium headline over 16px regular body text — barely different, looks accidental</li>"
                        "</ul>"
                        "<h3>Repetition — Create Visual Consistency</h3>"
                        "<p>Repeat colors, fonts, shapes, and spacing throughout a design. Repetition creates a sense of unity and professionalism.</p>"
                        "<ul>"
                        "<li><strong>Good:</strong> Every section heading uses the same blue, same font, same size</li>"
                        "<li><strong>Bad:</strong> Each heading is a different color and size — feels chaotic</li>"
                        "</ul>"
                        "<h3>Alignment — Nothing Placed Arbitrarily</h3>"
                        "<p>Every element should have a visual connection to something else on the page. "
                        "Choose left, center, or right alignment and <em>commit</em> — mixing alignments without purpose creates disorder.</p>"
                        "<h3>Proximity — Group Related Items</h3>"
                        "<p>Items that belong together should be close together. Items that don't, shouldn't. "
                        "Space is information — it tells the viewer what belongs with what.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "When AI generates a design that looks \"off,\" run through the CRAP checklist. "
                        "You can ask the AI chatbot: \"Analyze this design using the CRAP principles — what's weak?\" "
                        "This gives you a specific vocabulary for requesting fixes."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Using CRAP in AI Prompts</h3>"
                        "<p>You can embed these principles directly into your AI image prompts:</p>"
                        "<blockquote>"
                        "\"Create a business card design with strong contrast between the name and contact details, "
                        "consistent repetition of a single accent color, left-aligned text layout, and clear proximity "
                        "grouping — name and title together, contact info grouped separately.\""
                        "</blockquote>"
                        "<p>AI tools respond well to structural design language because it maps to concrete visual attributes.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "quiz",
                    "content": (
                        "A flyer has the event title in blue, the date in green, the location in orange, and the description in purple. "
                        "All text is roughly the same size. The date is closer to the location than to the title. "
                        "Which CRAP principle is MOST violated?"
                    ),
                    "metadata": {
                        "options": [
                            "Contrast — the colors are too different",
                            "Repetition — there's no consistent color scheme unifying the design",
                            "Alignment — the text isn't aligned properly",
                            "Proximity — the date should be closer to the title",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Using four different colors with no repetition creates visual chaos. Repetition means choosing "
                            "a limited palette and reusing it consistently. While proximity is also problematic (the date should logically "
                            "group with the title, not the location), the most glaring issue is the rainbow of unrelated colors — "
                            "no visual thread ties the design together."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which AI prompt best applies all four CRAP principles to generate a professional event invitation?",
                    "metadata": {
                        "options": [
                            "\"Design a beautiful invitation for a gala dinner, make it look fancy and elegant, high quality\"",
                            "\"Event invitation with bold black title contrasting against a cream background, consistent gold accent color repeated on borders and divider lines, all text left-aligned to a single edge, event name and date grouped together with venue and RSVP details grouped separately below with clear spacing\"",
                            "\"Gala invitation with the title in red, details in blue, RSVP in green, centered text mixed with right-aligned text, all information evenly spread across the entire card\"",
                            "\"A party invite, use a pretty template, add some decorations and fancy fonts everywhere\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt explicitly applies all four CRAP principles: Contrast (bold black on cream), "
                            "Repetition (gold accent used consistently), Alignment (single left-aligned edge), and "
                            "Proximity (related information grouped together with spacing between groups). The first is too vague. "
                            "The third violates repetition (three colors) and alignment (mixed alignment). The fourth has no structural direction."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would produce a business card that best demonstrates the Proximity principle?",
                    "metadata": {
                        "options": [
                            "\"Business card with name, phone, email, title, company, and address all centered in one block with equal spacing between every line\"",
                            "\"Business card with the person's name and job title grouped closely together in the upper area, and phone number, email, and address grouped together in the lower area, with clear visual separation between the two groups\"",
                            "\"Business card with information scattered artistically across the entire card surface for a creative, dynamic layout\"",
                            "\"Minimalist business card with only a name in the center and nothing else for maximum clean design\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Proximity means grouping related items together and separating unrelated ones. The second prompt "
                            "groups identity info (name + title) separately from contact info (phone + email + address), "
                            "with clear separation between groups. Equal spacing between every line treats all info as equally related. "
                            "Scattered placement actively violates proximity. A single name with nothing else avoids the principle entirely."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "A client shows you a newsletter design where the headings are 16px medium weight and the body text is 14px regular weight. What CRAP principle is being violated, and why?",
                    "metadata": {
                        "options": [
                            "Proximity — the headings are too close to the body text",
                            "Alignment — the headings and body text should use different alignment",
                            "Contrast — the difference between headings and body text is too subtle and looks accidental rather than intentional",
                            "Repetition — the headings and body text should use the same size",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "A 16px medium heading over 14px regular body text is barely distinguishable — the contrast is so weak "
                            "it looks like a mistake rather than a deliberate design choice. The Contrast principle says that if two elements "
                            "are different, make them VERY different. A 28px+ bold heading over 14px regular body would create "
                            "unmistakable contrast that guides the reader's eye through the content hierarchy."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I have a flyer design. Walk me through evaluating it with the CRAP checklist — ask me questions about each principle.", "label": "CRAP design audit"},
                            {"text": "Give me an AI image prompt for a restaurant menu that applies all four CRAP principles", "label": "CRAP-based prompt"},
                            {"text": "What's the most commonly violated CRAP principle in amateur designs, and how do I fix it?", "label": "Most common CRAP mistake"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on the CRAP design principles (Contrast, Repetition, Alignment, Proximity). "
                "Help students diagnose which principle is being violated in any design they describe. "
                "When they ask for AI prompt help, embed CRAP language into the prompt. "
                "Encourage them to use CRAP as a verbal checklist: 'Is the contrast strong enough? Is there repetition? Is everything aligned? Are related items grouped?'"
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 3 — Color Theory for AI Design
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["color-and-typography"],
            "title": "Color Theory for AI Design",
            "slug": "color-theory",
            "description": "Understand the color wheel, harmony types, and emotional associations — then put theory into practice by generating AI images with specific palettes.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 1,
            "ai_tools_enabled": ["chat", "image_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Color Theory: The Designer's Most Powerful Tool</h2>"
                        "<p>Color is the first thing people notice and the last thing they forget. "
                        "Before they read a single word, color has already communicated your brand's personality, "
                        "set the emotional tone, and influenced whether someone trusts you.</p>"
                        "<p>This lesson teaches you the <em>language</em> of color so you can direct AI with precision.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>The Color Wheel & Harmony Types</h3>"
                        "<p>All color relationships stem from the color wheel. Here are the four essential harmonies:</p>"
                        "<table><thead><tr><th>Harmony</th><th>Definition</th><th>Mood</th><th>Example</th></tr></thead>"
                        "<tbody>"
                        "<tr><td><strong>Complementary</strong></td><td>Colors opposite each other (blue + orange)</td>"
                        "<td>High energy, dramatic</td><td>Sports brands, sale banners</td></tr>"
                        "<tr><td><strong>Analogous</strong></td><td>Colors next to each other (blue + blue-green + green)</td>"
                        "<td>Harmonious, calm</td><td>Nature brands, wellness apps</td></tr>"
                        "<tr><td><strong>Triadic</strong></td><td>Three colors equally spaced (red + yellow + blue)</td>"
                        "<td>Vibrant, playful</td><td>Children's brands, creative agencies</td></tr>"
                        "<tr><td><strong>Monochromatic</strong></td><td>One hue in different shades (light blue to dark navy)</td>"
                        "<td>Sophisticated, clean</td><td>Luxury brands, corporate design</td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Color Psychology at a Glance</h3>"
                        "<ul>"
                        "<li><strong>Red:</strong> Urgency, passion, appetite (food brands, sales)</li>"
                        "<li><strong>Blue:</strong> Trust, stability, professionalism (finance, tech, healthcare)</li>"
                        "<li><strong>Green:</strong> Growth, nature, health (organic brands, sustainability)</li>"
                        "<li><strong>Yellow:</strong> Optimism, warmth, attention (caution signs, friendly brands)</li>"
                        "<li><strong>Purple:</strong> Creativity, luxury, mystery (beauty, premium products)</li>"
                        "<li><strong>Orange:</strong> Energy, enthusiasm, affordability (CTAs, budget-friendly brands)</li>"
                        "<li><strong>Black:</strong> Elegance, power, sophistication (luxury, fashion, tech)</li>"
                        "</ul>"
                        "<h3>Directing Color in AI Prompts</h3>"
                        "<p>Be explicit with AI. Instead of saying \"colorful,\" specify exactly what you mean:</p>"
                        "<blockquote>"
                        "\"A product shot using a complementary palette of deep navy blue and warm amber orange, "
                        "with the product as the focal point against a matte navy background\""
                        "</blockquote>"
                        "<p>You can also reference color codes: <em>\"using colors #1E3A5F and #F4A460\"</em> — "
                        "though AI interprets hex codes loosely, named colors plus descriptors work better.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "The 60-30-10 rule: Use your dominant color for 60% of the design, secondary for 30%, "
                        "and accent for 10%. This creates balance. You can include this ratio directly in AI prompts."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Try generating: A minimalist product advertisement using an analogous color palette of teal, "
                            "cyan, and seafoam green. Clean background, single product centered, soft lighting, "
                            "sophisticated and calm mood."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "A new meditation app wants its marketing visuals to communicate calm, trust, and natural wellness. "
                        "Which color combination would be most effective?"
                    ),
                    "metadata": {
                        "options": [
                            "Red and bright yellow — high energy grabs attention",
                            "Analogous palette of soft sage green, muted teal, and light blue — calm and natural",
                            "Complementary red and green — maximum contrast for readability",
                            "Neon pink and electric blue — modern and eye-catching",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "An analogous palette of greens and blues directly maps to the emotions the app needs: "
                            "calm (blue), natural wellness (green), and trust (teal). High-energy combos like red/yellow "
                            "or neon colors communicate the opposite of meditation. Complementary red/green reads as "
                            "Christmas rather than wellness."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which AI prompt best uses color theory to generate a poster for a children's art workshop?",
                    "metadata": {
                        "options": [
                            "\"A poster for a children's art workshop, colorful and fun, make it look exciting, high resolution\"",
                            "\"Children's art workshop poster using a triadic color palette of primary red, bright yellow, and cobalt blue, playful and vibrant mood, bold shapes, white background with 60% white space, 30% primary colors, 10% accent yellow highlights\"",
                            "\"Art workshop poster using a monochromatic dark navy palette, sophisticated and minimal, elegant serif typography, muted tones throughout\"",
                            "\"Poster with every color of the rainbow used equally across the entire design, gradients everywhere, maximum saturation on all elements\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt applies color theory precisely: a triadic palette (red/yellow/blue) communicates playfulness "
                            "and energy — perfect for children. It also applies the 60-30-10 rule for balance. The first prompt is too vague. "
                            "A monochromatic navy palette communicates sophistication, not childlike joy. Rainbow with maximum saturation "
                            "everywhere creates visual chaos with no hierarchy or intentional color relationship."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "A premium law firm wants AI-generated visuals for their website. Which prompt demonstrates the best understanding of color psychology?",
                    "metadata": {
                        "options": [
                            "\"Law firm website hero image with a bright orange and lime green color scheme, energetic and playful, fun geometric patterns\"",
                            "\"Legal website banner in deep navy blue and charcoal with subtle warm gold accents, monochromatic blue tones for the background, clean and authoritative mood, matte finish, understated elegance\"",
                            "\"Law firm visuals using pastel pink and lavender, soft and gentle, dreamy watercolor style, whimsical and approachable\"",
                            "\"Professional website image, red and black color scheme, aggressive bold styling, high contrast neon accents\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Deep navy blue communicates trust, stability, and professionalism — exactly what a law firm needs. "
                            "The gold accent adds a touch of premium authority. Monochromatic blue tones create sophistication. "
                            "Orange and lime green feel casual and budget-friendly. Pastels feel whimsical, not authoritative. "
                            "Red and black with neon reads as aggressive rather than trustworthy."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "What does the 60-30-10 color rule mean, and how does it improve a design?",
                    "metadata": {
                        "options": [
                            "Use 60 colors for variety, 30 gradients for depth, and 10 patterns for texture",
                            "Spend 60% of your time on color selection, 30% on layout, and 10% on typography",
                            "Use your dominant color for 60% of the design, secondary color for 30%, and accent color for 10% to create visual balance",
                            "Set color saturation to 60%, brightness to 30%, and contrast to 10% for a muted look",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "The 60-30-10 rule creates visual balance by giving each color a clear role: the dominant color (60%) "
                            "sets the overall tone, the secondary color (30%) supports and adds interest, and the accent color (10%) "
                            "draws attention to key elements like CTAs or highlights. This ratio prevents the chaos of equal color distribution "
                            "and gives the design a natural sense of order."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I'm designing visuals for a luxury chocolate brand. Suggest a color palette and explain why each color works.", "label": "Build me a color palette"},
                            {"text": "Critique this color choice: I'm using red and orange for a financial services company. Is that effective?", "label": "Critique my color choice"},
                            {"text": "Write me an AI image prompt that uses the 60-30-10 color rule for a fitness brand poster", "label": "60-30-10 prompt"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on color theory for AI design. Help students choose colors intentionally, not randomly. "
                "When they describe a brand or project, suggest specific color harmonies and explain the emotional reasoning. "
                "If they ask for AI prompt help, always include explicit color direction (named colors, harmony type, mood). "
                "Reference the 60-30-10 rule when discussing palette balance."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 4 — Typography That Communicates
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["color-and-typography"],
            "title": "Typography That Communicates",
            "slug": "typography-fundamentals",
            "description": "Learn serif vs sans-serif, font pairing rules, and typographic hierarchy — then generate AI designs that use type as a primary visual element.",
            "xp_reward": 15,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 2,
            "ai_tools_enabled": ["chat", "image_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Typography: Words as Visual Design</h2>"
                        "<p>Typography is not just about choosing a pretty font. It's about <strong>making words visually communicate</strong> "
                        "before they're even read. The font you choose says something about your brand before a single word registers.</p>"
                        "<p>A law firm using Comic Sans communicates something very different from one using Garamond — "
                        "even if the words are identical.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Serif vs Sans-Serif: The Fundamental Split</h3>"
                        "<table><thead><tr><th>Type</th><th>Characteristics</th><th>Communicates</th><th>Best For</th></tr></thead>"
                        "<tbody>"
                        "<tr><td><strong>Serif</strong> (Times, Garamond, Playfair)</td>"
                        "<td>Small decorative strokes (\"feet\") at letter ends</td>"
                        "<td>Tradition, authority, elegance, trustworthiness</td>"
                        "<td>Law firms, newspapers, luxury brands, book publishing</td></tr>"
                        "<tr><td><strong>Sans-Serif</strong> (Helvetica, Inter, Futura)</td>"
                        "<td>Clean, no decorative strokes</td>"
                        "<td>Modern, clean, approachable, tech-forward</td>"
                        "<td>Tech companies, startups, apps, modern brands</td></tr>"
                        "<tr><td><strong>Display/Script</strong> (Lobster, Playbill, Brush Script)</td>"
                        "<td>Decorative, expressive</td>"
                        "<td>Personality, creativity, uniqueness</td>"
                        "<td>Logos, headlines only — never body text</td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Font Pairing: The Rules</h3>"
                        "<p>Using two fonts well is a core design skill. Here are the reliable pairing strategies:</p>"
                        "<ol>"
                        "<li><strong>Serif headline + Sans-serif body</strong> — Classic, professional, easy to read. "
                        "Example: Playfair Display + Inter.</li>"
                        "<li><strong>Sans-serif headline + Sans-serif body</strong> — Modern, clean. Use different weights "
                        "(bold headline, light body) to create contrast. Example: Montserrat Bold + Open Sans Light.</li>"
                        "<li><strong>Display headline + Clean body</strong> — Creative but grounded. Use a decorative font for the headline "
                        "and a highly readable font for everything else. Example: Abril Fatface + Lato.</li>"
                        "</ol>"
                        "<p><strong>The golden rule:</strong> Never use more than 2–3 fonts in a single design. "
                        "Contrast comes from weight and size, not from adding more fonts.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "When prompting AI, describe the typographic feel rather than naming specific fonts: "
                        "\"elegant serif headline with clean sans-serif body text\" or \"bold, modern, geometric typography.\" "
                        "AI understands style descriptors better than font names."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Try generating: A typographic poster for a jazz music festival. Large, elegant serif headline, "
                            "smaller sans-serif date and venue details below. Deep midnight blue background with gold text. "
                            "Sophisticated, vintage-modern feel."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "A children's educational app needs font choices for their marketing materials. "
                        "Which pairing would be most appropriate?"
                    ),
                    "metadata": {
                        "options": [
                            "A thin, delicate serif for everything — it looks refined and elegant",
                            "A bold, rounded sans-serif for headlines with a clean, highly readable sans-serif for body text",
                            "Script/cursive fonts throughout — they feel friendly and handwritten",
                            "A condensed, narrow typeface — it saves space so you can include more information",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Children's brands need to communicate friendliness and approachability — bold, rounded sans-serifs do this perfectly "
                            "(think of the Toys R Us or Nickelodeon aesthetic). Thin serifs feel too formal for kids. Script fonts are hard to read "
                            "at small sizes and for developing readers. Condensed typefaces prioritize density over friendliness."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which AI prompt would generate the most appropriate typographic poster for a high-end perfume brand?",
                    "metadata": {
                        "options": [
                            "\"Perfume advertisement poster with bold chunky rounded sans-serif text, bright primary colors, playful and casual feel, comic-book style layout\"",
                            "\"Luxury perfume poster featuring an elegant thin serif headline in gold on a matte black background, clean sans-serif body text in a lighter weight below, generous whitespace, sophisticated and minimal, editorial fashion photography style\"",
                            "\"Perfume brand poster using five different decorative script fonts for each line of text, ornate borders, busy floral patterns filling every space\"",
                            "\"Ad for perfume, use a standard Arial font for everything, white background, basic centered layout, no styling\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Luxury perfume demands elegance and sophistication. A thin serif headline in gold on black creates premium contrast, "
                            "while the clean sans-serif body text ensures readability — a classic serif-headline + sans-serif-body pairing. "
                            "Generous whitespace signals confidence and luxury. Chunky rounded fonts feel juvenile. Five decorative fonts violate "
                            "the 2-3 font maximum rule. Plain Arial with no styling communicates nothing about the brand."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt would best generate a typographic design for a modern fitness app's marketing banner?",
                    "metadata": {
                        "options": [
                            "\"Fitness app banner with ornate calligraphy script text, delicate thin letterforms, vintage Victorian styling, sepia tones\"",
                            "\"Fitness banner with bold geometric sans-serif headline in heavy weight, lighter sans-serif subtitle in a thinner weight for contrast, dark background with vibrant accent color, dynamic and energetic feel, modern and clean\"",
                            "\"Workout app ad using Times New Roman for all text, standard formatting, no special styling or color, plain white background\"",
                            "\"Fitness marketing banner with text in ten different trendy fonts, each word a different style, rainbow gradient on every letter\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "A fitness app needs to feel modern, energetic, and bold. A geometric sans-serif in heavy weight communicates "
                            "strength and modernity. Using different weights (heavy headline, thin subtitle) creates typographic hierarchy "
                            "without adding extra fonts — contrast through weight, not font count. Calligraphy feels traditional, not athletic. "
                            "Times New Roman is generic. Ten fonts creates visual chaos."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Why should you never use more than 2-3 fonts in a single design?",
                    "metadata": {
                        "options": [
                            "Because AI image generators can only render 2-3 fonts at a time",
                            "Because fonts are expensive and using fewer saves money on licensing",
                            "Because too many fonts destroy visual unity — contrast should come from varying weight and size within a limited set, not from adding more typefaces",
                            "Because web browsers can only load 2-3 font files per page",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "Every additional font introduces a new visual voice into the design. With too many voices, there is no consistency "
                            "or unity — the design feels chaotic and unprofessional. Professional designers create contrast through weight (bold vs. light), "
                            "size (large headline vs. small body), and style (serif headline vs. sans-serif body) within a limited font set. "
                            "This creates variety WITH cohesion."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I'm designing a wedding invitation. Suggest a font pairing and explain what mood it creates.", "label": "Suggest a font pairing"},
                            {"text": "What typographic styles should I describe in AI prompts for a tech startup brand?", "label": "Typography for tech brands"},
                            {"text": "Critique this choice: I want to use a script font for the body text of a mobile app. Is that a good idea?", "label": "Critique my font choice"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on typography fundamentals. Help students choose fonts that match their brand's personality. "
                "When they describe a project, suggest specific typographic styles and explain the reasoning. "
                "Emphasize readability, hierarchy through weight/size, and the 2-3 font maximum rule. "
                "For AI prompts, guide them to use descriptive typographic language rather than specific font names."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 5 — AI Image Generation Fundamentals
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["ai-image-mastery"],
            "title": "AI Image Generation Fundamentals",
            "slug": "image-gen-fundamentals",
            "description": "Understand how AI image generation works, learn prompt anatomy, and practice creating professional images with structured prompts.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 1,
            "ai_tools_enabled": ["chat", "image_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>How AI Image Generation Actually Works</h2>"
                        "<p>AI image generators don't \"search the internet\" for images. They've learned patterns from millions of images "
                        "during training, and they <strong>create entirely new images</strong> by combining those learned patterns based on your prompt.</p>"
                        "<p>Think of it like a chef who's tasted thousands of dishes — when you describe what you want, "
                        "they create something new using their knowledge, not by copying a specific recipe.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Prompt Anatomy: The 6-Part Formula</h3>"
                        "<p>Professional AI prompts aren't random descriptions. They follow a structure:</p>"
                        "<ol>"
                        "<li><strong>Subject</strong> — What is the main focus? <em>(\"a ceramic coffee cup\")</em></li>"
                        "<li><strong>Style</strong> — What visual style? <em>(\"product photography\", \"watercolor illustration\", \"3D render\")</em></li>"
                        "<li><strong>Lighting</strong> — How is it lit? <em>(\"soft natural light\", \"dramatic side lighting\", \"golden hour\")</em></li>"
                        "<li><strong>Composition</strong> — How is it framed? <em>(\"close-up\", \"bird's eye view\", \"rule of thirds\")</em></li>"
                        "<li><strong>Mood/Atmosphere</strong> — What feeling? <em>(\"cozy and warm\", \"sleek and futuristic\", \"serene\")</em></li>"
                        "<li><strong>Technical Details</strong> — Camera/quality cues <em>(\"shallow depth of field\", \"8K\", \"shot on Hasselblad\")</em></li>"
                        "</ol>"
                        "<p><strong>Example combining all six:</strong></p>"
                        "<blockquote>"
                        "\"A ceramic coffee cup on a wooden table, product photography style, soft natural window light from the left, "
                        "close-up shot with shallow depth of field, cozy morning atmosphere, warm color grading, shot on Canon EOS R5\""
                        "</blockquote>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "You don't need all six parts every time. Start with Subject + Style + Mood as your baseline, "
                        "then add lighting, composition, and technical details to refine. More specific = more control."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Common Style Keywords That Transform Results</h3>"
                        "<table><thead><tr><th>Style</th><th>Prompt Keywords</th><th>Good For</th></tr></thead>"
                        "<tbody>"
                        "<tr><td>Photo-realistic</td><td>\"professional photography\", \"photorealistic\", \"DSLR\"</td><td>Product shots, headshots</td></tr>"
                        "<tr><td>Flat/Minimal</td><td>\"flat design\", \"minimalist illustration\", \"vector art\"</td><td>Icons, infographics, UI</td></tr>"
                        "<tr><td>Cinematic</td><td>\"cinematic\", \"film grain\", \"anamorphic\", \"movie still\"</td><td>Hero images, dramatic visuals</td></tr>"
                        "<tr><td>Watercolor</td><td>\"watercolor painting\", \"soft washes\", \"paper texture\"</td><td>Artistic, organic feels</td></tr>"
                        "<tr><td>3D Render</td><td>\"3D render\", \"octane render\", \"isometric\"</td><td>Tech, product vis, playful</td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Try generating using the 6-part formula: A modern laptop on a clean white desk, "
                            "product photography style, soft diffused overhead lighting, straight-on eye-level shot, "
                            "sleek and professional atmosphere, shallow depth of field with soft background blur."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "A client needs a hero image for their organic skincare website. They want it to feel natural, "
                        "trustworthy, and premium. Which prompt approach produces the most professional result?"
                    ),
                    "metadata": {
                        "options": [
                            "\"skincare products, beautiful, high quality\"",
                            "\"Organic skincare bottles arranged on a marble surface with fresh botanicals, product photography, soft natural light from a large window, overhead flat-lay composition, clean and luxurious mood, shallow depth of field\"",
                            "\"3D render of neon-colored skincare bottles floating in space, cyberpunk style, dramatic lighting\"",
                            "\"Photo of skincare, make it look expensive, 4K\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The winning prompt uses all six elements: clear subject (skincare bottles with botanicals), style (product photography), "
                            "lighting (soft natural window light), composition (overhead flat-lay), mood (clean and luxurious), and technical detail (shallow DOF). "
                            "Vague prompts produce generic results. The cyberpunk style contradicts the organic/natural brand identity entirely."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt uses the 6-part formula (subject, style, lighting, composition, mood, technical) most completely for a bakery's Instagram post?",
                    "metadata": {
                        "options": [
                            "\"Photo of a croissant, delicious looking, professional, Instagram-worthy\"",
                            "\"A freshly baked golden croissant on a rustic linen cloth, editorial food photography style, warm directional morning light from a side window, close-up shot at a slight angle with shallow depth of field, cozy artisanal atmosphere, warm color grading with soft film grain\"",
                            "\"Croissant, bakery, tasty, beautiful, 8K ultra HD, best quality, masterpiece\"",
                            "\"A bread product on a surface, some kind of lighting, a certain mood, photographic style\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt covers all six parts: subject (golden croissant on linen), style (editorial food photography), "
                            "lighting (warm directional morning light from side window), composition (close-up at slight angle, shallow DOF), "
                            "mood (cozy artisanal), and technical (warm color grading, film grain). The first prompt only names the subject. "
                            "The third stacks quality keywords but lacks composition, lighting, or mood. The fourth is absurdly vague."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "You want to generate a professional headshot for a corporate website. Which prompt would produce the most usable result?",
                    "metadata": {
                        "options": [
                            "\"Professional corporate headshot of a confident business person, portrait photography, soft Rembrandt lighting with gentle fill light, head-and-shoulders framing centered in frame, approachable and trustworthy mood, shallow depth of field with neutral blurred office background\"",
                            "\"A person in a suit, make it look corporate and professional, sharp image\"",
                            "\"Business headshot, 3D cartoon render style, bright neon background, wide-angle lens distortion, dramatic shadows\"",
                            "\"Portrait of an employee, watercolor painting style, abstract background, artistic and creative interpretation\"",
                        ],
                        "correct_index": 0,
                        "explanation": (
                            "A corporate headshot needs to look trustworthy and professional. The first prompt specifies portrait photography style, "
                            "appropriate Rembrandt lighting (a classic portrait technique), proper framing (head-and-shoulders), mood (approachable, trustworthy), "
                            "and technical detail (shallow DOF, neutral background). The second is too vague. A 3D cartoon render is inappropriate "
                            "for corporate use. Watercolor style contradicts the professional context entirely."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "What is the most important difference between a vague prompt and a professional prompt?",
                    "metadata": {
                        "options": [
                            "Professional prompts are longer — more words always produce better results",
                            "Professional prompts include quality keywords like '8K' and 'ultra HD' while vague prompts do not",
                            "Professional prompts give specific, concrete direction for subject, style, lighting, composition, and mood — giving the AI a clear blueprint rather than leaving decisions to chance",
                            "Professional prompts use technical camera jargon that only photographers understand",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "The key difference is specificity and intentionality. Professional prompts describe exactly what the image should "
                            "look like across multiple dimensions (subject, style, lighting, composition, mood), leaving less to the AI's random "
                            "interpretation. Length alone does not help if the words are vague. Quality keywords like '8K' affect resolution, "
                            "not composition or mood. You do not need to be a photographer — you just need to describe what you see in your mind clearly."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me build a prompt using the 6-part formula for a restaurant menu hero image", "label": "Build a prompt with me"},
                            {"text": "I generated an image but it looks generic. Here's my prompt — how can I make it more specific?", "label": "Improve my prompt"},
                            {"text": "What style keywords should I use for a tech startup's website visuals?", "label": "Style keywords for tech"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on AI image generation fundamentals. Help students write structured, professional prompts. "
                "Always break their prompt ideas into the 6-part formula: subject, style, lighting, composition, mood, technical details. "
                "When they share a vague prompt, help them add specificity. Compare weak vs strong prompt approaches. "
                "Encourage experimentation with the generation block."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 6 — Advanced Image Prompting
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["ai-image-mastery"],
            "title": "Advanced Image Prompting",
            "slug": "advanced-image-prompting",
            "description": "Level up with negative space, style references, photographic techniques, and iterative refinement strategies.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 2,
            "ai_tools_enabled": ["chat", "image_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Advanced Prompting: Beyond the Basics</h2>"
                        "<p>You know the 6-part formula. Now let's explore the techniques that separate competent prompts from "
                        "exceptional ones — the tricks professional AI artists use to get predictable, high-quality results.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Technique 1: Negative Space & Minimalism</h3>"
                        "<p>Negative space (the empty area around your subject) is one of the most powerful design tools — "
                        "and one of the hardest things to get AI to produce. AI tends to fill every pixel.</p>"
                        "<p><strong>Keywords that create space:</strong> \"minimalist,\" \"ample negative space,\" "
                        "\"isolated subject on clean background,\" \"lots of breathing room,\" \"simple, uncluttered.\"</p>"
                        "<h3>Technique 2: Photographic References</h3>"
                        "<p>Borrow from real photography to get cinematic results:</p>"
                        "<ul>"
                        "<li><strong>Depth of Field:</strong> \"shallow depth of field, f/1.4, bokeh background\" — blurs the background, focuses the subject</li>"
                        "<li><strong>Golden Hour:</strong> \"golden hour lighting, warm amber tones, long shadows\" — the magic-hour look</li>"
                        "<li><strong>High Key:</strong> \"high-key lighting, bright, airy, minimal shadows\" — clean, optimistic feel</li>"
                        "<li><strong>Low Key:</strong> \"low-key lighting, dramatic shadows, dark background\" — moody, dramatic, premium</li>"
                        "<li><strong>Tilt-Shift:</strong> \"tilt-shift effect, miniature look\" — makes real scenes look like tiny models</li>"
                        "</ul>"
                        "<h3>Technique 3: Style Anchoring</h3>"
                        "<p>Reference well-known visual styles to anchor the AI's output:</p>"
                        "<ul>"
                        "<li>\"in the style of a Wes Anderson film\" — symmetrical, pastel, quirky</li>"
                        "<li>\"National Geographic photography\" — natural, vivid, documentary</li>"
                        "<li>\"Apple product photography\" — clean, minimal, premium white-on-white</li>"
                        "<li>\"editorial fashion photography\" — high-contrast, dramatic poses, studio lighting</li>"
                        "</ul>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "Iterative refinement is the real skill. Generate, analyze what's wrong, adjust your prompt, "
                        "and regenerate. Professional AI designers rarely nail it on the first try — they iterate 3-5 times. "
                        "Use the AI chatbot to analyze what to change."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Technique 4: Iterative Refinement Workflow</h3>"
                        "<ol>"
                        "<li><strong>Generate v1</strong> — Start with your best prompt</li>"
                        "<li><strong>Analyze</strong> — What works? What doesn't? Be specific (too dark? wrong composition? cluttered?)</li>"
                        "<li><strong>Adjust</strong> — Modify specific parts of the prompt. Don't rewrite everything — tweak surgically</li>"
                        "<li><strong>Generate v2</strong> — Compare with v1</li>"
                        "<li><strong>Repeat</strong> — Until you're satisfied</li>"
                        "</ol>"
                        "<p><strong>Common fixes:</strong></p>"
                        "<ul>"
                        "<li>Too busy? → Add \"minimalist, clean, uncluttered, negative space\"</li>"
                        "<li>Too dark? → Add \"bright, well-lit, high-key lighting\"</li>"
                        "<li>Wrong mood? → Replace mood keywords entirely</li>"
                        "<li>Wrong angle? → Specify \"bird's eye view\" or \"eye-level\" or \"low angle shot\"</li>"
                        "</ul>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Try generating: A single red rose lying on a white marble surface, shot from directly above, "
                            "minimalist composition with ample negative space, soft diffused natural light, shallow depth of field, "
                            "elegant and serene mood, high-key photography."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "You generated an AI image of a product on a table, but the background is too busy and distracting. "
                        "The subject gets lost. Which prompt modification would most effectively fix this?"
                    ),
                    "metadata": {
                        "options": [
                            "Add \"4K, ultra HD, high resolution\" to increase quality",
                            "Add \"isolated subject on clean background, shallow depth of field, ample negative space, bokeh\"",
                            "Remove all technical keywords and just describe the product",
                            "Add \"zoom in\" to make the product bigger",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "A busy background is a composition and focus problem. \"Clean background\" removes clutter, "
                            "\"shallow depth of field\" and \"bokeh\" blur whatever background remains, and \"negative space\" "
                            "tells AI to leave empty room around the subject. Resolution keywords like 4K don't affect composition — "
                            "they affect pixel quality. Zooming in doesn't fix a busy background, it just crops it."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt best uses advanced techniques to create a dramatic, premium product shot for a luxury watch brand?",
                    "metadata": {
                        "options": [
                            "\"A luxury watch, dramatic lighting, expensive looking, premium quality, best image\"",
                            "\"Luxury watch on a dark slate surface, low-key lighting with a single warm spotlight from above casting dramatic shadows, shallow depth of field at f/1.4 with soft bokeh, ample negative space on the right side for text placement, moody and premium atmosphere, shot on Hasselblad medium format\"",
                            "\"Watch product photo, tilt-shift miniature effect, bright neon studio lighting, wide-angle lens, cluttered tabletop with many accessories, high-key cheerful mood\"",
                            "\"A watch in the style of a Wes Anderson film, symmetrical pastel composition, quirky and playful, whimsical props arranged around it\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt layers multiple advanced techniques: low-key lighting for drama, shallow DOF with specific "
                            "f-stop for premium focus, intentional negative space for practical text placement, and a medium format camera "
                            "reference for quality. The first is vague. Tilt-shift makes things look like toys — the opposite of premium. "
                            "Wes Anderson style is playful and quirky, which undermines luxury authority."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Your first AI generation of a minimalist brand image came out cluttered with too many elements. Which iterative refinement approach is most effective?",
                    "metadata": {
                        "options": [
                            "Delete the entire prompt and start over with completely different keywords",
                            "Add more descriptive words to your existing prompt to give the AI more information",
                            "Keep the core subject and style but surgically add 'minimalist, clean composition, ample negative space, isolated subject, uncluttered' while removing any keywords that suggest complexity",
                            "Generate the same prompt 20 more times — eventually the AI will produce a clean version by chance",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "Iterative refinement means making targeted adjustments, not starting from scratch. The third approach "
                            "diagnoses the specific problem (clutter) and surgically adds keywords that counteract it (minimalist, negative space, "
                            "uncluttered) while removing conflicting keywords. Rewriting everything loses what already worked. "
                            "Adding more words often adds more visual elements, making clutter worse. Blind regeneration is inefficient "
                            "and does not address the root cause."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt best demonstrates the 'style anchoring' technique to achieve a specific photographic look?",
                    "metadata": {
                        "options": [
                            "\"A coffee shop interior, make it look like a photo, realistic, HD\"",
                            "\"Coffee shop interior in the style of a Wes Anderson film — perfectly symmetrical composition, soft pastel color palette, centered framing, whimsical and meticulously organized, warm vintage color grading, shot on 35mm film with subtle grain\"",
                            "\"Coffee shop, artistic style, some kind of filter, moody or something, whatever looks good\"",
                            "\"Coffee shop photo with every Instagram filter applied simultaneously, HDR to the maximum, oversaturated colors, heavy vignette\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Style anchoring means referencing a well-known visual style and then reinforcing it with specific descriptors. "
                            "The second prompt anchors to 'Wes Anderson' and then specifies exactly what that means: symmetry, pastels, "
                            "centered framing, 35mm film grain. This gives the AI a clear creative direction. Vague terms like 'artistic style' "
                            "and 'whatever looks good' give no anchor at all. Stacking every filter creates an overprocessed mess."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I generated an image but it doesn't look right. Help me figure out what to change in my prompt — I'll describe what I see.", "label": "Help me iterate on my image"},
                            {"text": "What photographic techniques should I reference in prompts for food photography?", "label": "Food photography techniques"},
                            {"text": "Give me a prompt that uses negative space effectively for a minimalist brand ad", "label": "Negative space prompt"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Advanced image prompting lesson. Help students refine their prompts iteratively. "
                "When they describe an image that isn't working, diagnose the specific issue (composition, lighting, mood, clutter) "
                "and suggest targeted prompt modifications — not complete rewrites. "
                "Encourage the generate-analyze-adjust-regenerate workflow. "
                "Reference photographic techniques by name (depth of field, golden hour, high/low key)."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 7 — Style Consistency Across a Set
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["ai-image-mastery"],
            "title": "Style Consistency Across a Set",
            "slug": "style-and-consistency",
            "description": "Learn to maintain visual consistency across multiple AI-generated images for brands and campaigns using style anchoring techniques.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 3,
            "ai_tools_enabled": ["chat", "image_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Style Consistency: The Professional's Challenge</h2>"
                        "<p>Generating one great image is a skill. Generating <em>ten images that look like they belong together</em> "
                        "is the skill that separates amateurs from professionals.</p>"
                        "<p>Brands need consistency. A social media feed, a set of product images, a campaign — they all require "
                        "a unified visual language. AI's natural tendency is to vary, so you need techniques to constrain it.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>The Style Anchor System</h3>"
                        "<p>Create a \"style anchor\" — a block of consistent descriptors that you copy into every prompt for a set:</p>"
                        "<blockquote>"
                        "<strong>Style anchor for Brand X campaign:</strong><br/>"
                        "\"Minimalist flat illustration style, limited palette of dusty rose #D4A5A5 and charcoal #36454F, "
                        "clean geometric shapes, consistent 2px line weight, white background, modern and sophisticated\""
                        "</blockquote>"
                        "<p>Then each individual prompt just changes the subject:</p>"
                        "<ul>"
                        "<li>\"A coffee cup, [style anchor]\"</li>"
                        "<li>\"A laptop, [style anchor]\"</li>"
                        "<li>\"A potted plant, [style anchor]\"</li>"
                        "</ul>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>What to Lock In Your Style Anchor</h3>"
                        "<table><thead><tr><th>Element</th><th>Why It Matters</th><th>Example</th></tr></thead>"
                        "<tbody>"
                        "<tr><td><strong>Color Palette</strong></td><td>Colors are the strongest visual thread</td>"
                        "<td>\"muted earth tones: terracotta, sage, cream\"</td></tr>"
                        "<tr><td><strong>Art Style</strong></td><td>Mixing styles destroys cohesion</td>"
                        "<td>\"watercolor illustration\" or \"3D render\"</td></tr>"
                        "<tr><td><strong>Lighting</strong></td><td>Inconsistent lighting = different \"worlds\"</td>"
                        "<td>\"soft natural light from the left\"</td></tr>"
                        "<tr><td><strong>Mood/Tone</strong></td><td>Emotional consistency builds brand recognition</td>"
                        "<td>\"warm, inviting, cozy atmosphere\"</td></tr>"
                        "<tr><td><strong>Technical Style</strong></td><td>Camera/render consistency</td>"
                        "<td>\"shot on film, slight grain, warm color grading\"</td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "Pro tip: Write your style anchor BEFORE generating any images. Treat it like a creative brief. "
                        "If you start generating without one, you'll spend hours trying to match your third image to your first."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Try generating: A cozy bookshop interior, warm watercolor illustration style, "
                            "limited palette of warm amber, soft brown, and cream, gentle natural light from a window, "
                            "charming and nostalgic mood, soft paper texture. "
                            "(Then try generating a coffee shop with the SAME style anchor to see consistency!)"
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "You're generating 6 social media images for a boutique hotel's Instagram feed. "
                        "Images 1-4 look cohesive: soft, muted tones, natural lighting, editorial photography style. "
                        "Image 5 uses vibrant, saturated colors and dramatic studio lighting. "
                        "What breaks the consistency and why?"
                    ),
                    "metadata": {
                        "options": [
                            "The subject matter is probably different — consistency means showing the same thing",
                            "Image 5 breaks the color palette (vibrant vs muted) and lighting style (dramatic studio vs natural), creating a visual mismatch",
                            "Nothing is wrong — variety keeps the feed interesting",
                            "The problem is that 4 images are too similar — image 5 adds needed contrast",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Consistency is about visual language, not subject matter. You can show different rooms, views, and moments "
                            "while maintaining the same color temperature, lighting style, and editing approach. Image 5 breaks two pillars "
                            "of the style anchor — color palette and lighting — which makes it look like it belongs to a different brand entirely. "
                            "Variety in subject matter is great; variety in style language is jarring."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "You are generating a set of 4 product images for an organic tea brand's website. Which approach best ensures visual consistency?",
                    "metadata": {
                        "options": [
                            "Write a completely unique prompt for each product, changing the style and mood each time to keep things interesting",
                            "Create a style anchor — 'soft watercolor illustration, muted earth tones of sage green and warm cream, gentle natural light, hand-painted paper texture, calm and organic mood' — then swap only the subject for each product while keeping the anchor identical",
                            "Generate each image separately and then adjust the colors in a photo editor afterward to try to match them",
                            "Use the exact same prompt for all four images and hope the AI generates different subjects",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "A style anchor locks in the visual elements that create cohesion (art style, color palette, lighting, mood, texture) "
                            "while allowing the subject to change. This is exactly how professional designers maintain brand consistency across "
                            "multiple assets. Unique styles per image destroys cohesion. Post-editing colors is a band-aid that cannot fix "
                            "differences in art style or lighting. The same prompt produces the same subject, not variety."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which style anchor prompt would produce the most consistent set of social media illustrations for a playful tech startup?",
                    "metadata": {
                        "options": [
                            "\"Flat vector illustration, limited palette of coral #FF6B6B and deep purple #4A0E78 with white accents, clean geometric shapes, consistent thin line weight, soft rounded corners, white background, modern and playful\"",
                            "\"Colorful illustration, modern, techy, fun, vibrant, cool design, digital art\"",
                            "\"Sometimes use flat design, sometimes 3D render, sometimes watercolor — mix it up for each post to keep the feed dynamic and unpredictable\"",
                            "\"Use whatever style the AI defaults to, then apply the same Instagram filter to all images for consistency\"",
                        ],
                        "correct_index": 0,
                        "explanation": (
                            "The first prompt is an excellent style anchor because it locks in every key element: art style (flat vector), "
                            "specific colors (coral and deep purple with hex codes), shape language (geometric, rounded corners), line treatment "
                            "(consistent thin weight), background (white), and mood (modern and playful). The second is too vague to produce "
                            "consistency. Mixing styles is the opposite of consistency. Instagram filters cannot unify different art styles."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "You generated three images using the same style anchor, but image #3 looks slightly different in color temperature. What is the most likely cause and fix?",
                    "metadata": {
                        "options": [
                            "The AI randomly varies output — just keep regenerating until it matches",
                            "You need to switch to a different AI tool that produces more consistent results",
                            "Your style anchor may lack specific color temperature direction — add explicit terms like 'warm color grading' or 'cool blue undertones' and regenerate image #3 with the strengthened anchor",
                            "Color temperature differences are invisible to most people, so it does not matter",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "When one image in a set drifts, it usually means the style anchor is not specific enough in that dimension. "
                            "If your anchor does not explicitly describe color temperature (warm vs. cool), the AI fills that gap with random "
                            "variation. The fix is to strengthen the anchor with explicit color temperature keywords and regenerate the outlier. "
                            "Blind regeneration is wasteful. Color temperature differences are very noticeable to viewers and undermine brand cohesion."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me write a style anchor for a set of icons for a health and wellness brand", "label": "Build a style anchor"},
                            {"text": "I generated 3 images for a campaign but they don't look consistent. What should I lock down in my prompts?", "label": "Fix my inconsistent set"},
                            {"text": "Give me a style anchor template I can fill in for any brand project", "label": "Style anchor template"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on style consistency across multiple AI-generated images. Help students create style anchors — "
                "reusable blocks of descriptors that lock in color, style, lighting, mood, and technical approach. "
                "When students describe inconsistency in their images, diagnose which elements vary and help them lock those down. "
                "Emphasize creating the style anchor BEFORE generating."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 8 — Building Brand Identity with AI
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["brand-and-campaign"],
            "title": "Building Brand Identity with AI",
            "slug": "brand-identity-basics",
            "description": "Use AI to explore logo concepts, brand color systems, and mood boards — the building blocks of a professional brand identity.",
            "xp_reward": 25,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 1,
            "ai_tools_enabled": ["chat", "image_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Brand Identity: More Than a Logo</h2>"
                        "<p>A brand identity is the complete visual system that makes a company recognizable: "
                        "logo, colors, typography, photography style, graphic elements, tone of voice, and the overall feeling.</p>"
                        "<p>Think of how you can recognize Apple, Nike, or Coca-Cola from a tiny fragment of any of their materials — "
                        "that's the power of consistent brand identity. AI can now help you <strong>explore and prototype</strong> "
                        "brand identities in hours instead of weeks.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>The Brand Identity Toolkit</h3>"
                        "<ol>"
                        "<li><strong>Mood Board</strong> — A visual collage that captures the brand's feeling before any design begins. "
                        "Use AI to generate concept images that capture the vibe: \"a mood board for a premium organic skincare brand, "
                        "earthy textures, soft natural light, muted greens and creams.\"</li>"
                        "<li><strong>Logo Concept</strong> — AI can't create final logos (they need vector precision), but it can "
                        "explore directions: \"minimalist logo concept for a sustainable coffee brand, leaf integrated with coffee cup shape, "
                        "single color, clean lines.\"</li>"
                        "<li><strong>Color System</strong> — Primary color, secondary color, accent color, neutral background. "
                        "Every asset you generate should pull from this system.</li>"
                        "<li><strong>Photography/Illustration Style</strong> — Will your brand use bright editorial photography? "
                        "Moody and dark? Playful illustrations? This becomes your style anchor.</li>"
                        "</ol>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "AI-generated logos are exploration tools, not final deliverables. Use them to discover directions "
                        "and present mood/concept to clients. Final logos should be recreated as vectors by a designer "
                        "or vectorized in tools like Adobe Illustrator."
                    ),
                    "metadata": {"type": "warning"},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>The Brand Identity Prompt Framework</h3>"
                        "<p>When generating brand visuals with AI, include these in every prompt:</p>"
                        "<blockquote>"
                        "<strong>Brand:</strong> [name and description]<br/>"
                        "<strong>Values:</strong> [3-4 brand values]<br/>"
                        "<strong>Audience:</strong> [who they serve]<br/>"
                        "<strong>Feeling:</strong> [the emotion you want to evoke]<br/>"
                        "<strong>Visual Direction:</strong> [style, colors, mood]"
                        "</blockquote>"
                        "<p>Example:</p>"
                        "<blockquote>"
                        "\"Brand identity mood board for 'Terra Roast,' a sustainable specialty coffee brand. "
                        "Values: craftsmanship, sustainability, community. Audience: environmentally conscious millennials. "
                        "Feeling: warm, artisanal, authentic. Visual direction: earthy tones (terracotta, forest green, cream), "
                        "natural textures, hand-crafted feel, warm natural lighting.\""
                        "</blockquote>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Try generating: Brand identity concept for a modern pet wellness company called 'PawVita'. "
                            "Friendly, premium, trustworthy. Soft sage green and warm beige color palette. "
                            "Clean, modern aesthetic with playful rounded elements. Show a brand mood board "
                            "with product packaging, color swatches, and lifestyle imagery. Minimal, professional."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "A new fintech startup targeting young professionals asks you to develop their brand identity. "
                        "They want to feel trustworthy yet modern and approachable. Which visual direction best communicates these values?"
                    ),
                    "metadata": {
                        "options": [
                            "Bright neon colors, graffiti-style graphics, and hand-drawn typography — young and edgy",
                            "Deep navy and gold, serif typography, stock photos of handshakes — traditional finance",
                            "Clean blues and teals with a vibrant accent color, modern sans-serif type, friendly illustration style, generous whitespace",
                            "All black with red accents, aggressive angular shapes, condensed bold type — bold and disruptive",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "Blues and teals communicate trust and stability (essential for finance). The modern sans-serif and friendly illustrations "
                            "add approachability and youth. Whitespace signals confidence and clarity. Neon and graffiti feel too casual for financial trust. "
                            "Traditional navy/gold/serif feels like their parents' bank. All-black with red is aggressive, not approachable."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which AI prompt would best generate a brand mood board for a sustainable outdoor adventure company?",
                    "metadata": {
                        "options": [
                            "\"Mood board for an outdoor brand, nature vibes, adventurous, cool colors, make it look professional\"",
                            "\"Brand mood board for 'TrailForge,' a sustainable outdoor adventure company. Values: rugged authenticity, environmental stewardship, community. Audience: active millennials who care about the planet. Earthy palette of forest green, stone gray, and burnt sienna with cream. Natural textures like weathered wood and raw canvas. Documentary photography style with golden hour lighting. Adventurous yet grounded mood.\"",
                            "\"An outdoor brand logo in neon green with extreme sports imagery, urban street style, graffiti elements, dark moody city backgrounds\"",
                            "\"Nature photos collage, green color, trees and mountains, generic stock photography style, basic layout\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt uses the Brand Identity Prompt Framework: brand name and description, clear values, "
                            "defined audience, specific emotional direction, and detailed visual direction including colors, textures, "
                            "photography style, and lighting. The first is too vague to produce anything specific. Urban/street style "
                            "contradicts outdoor adventure. Generic stock photography produces forgettable, unbranded results."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt best explores a logo concept for a modern plant-based restaurant called 'Verdant'?",
                    "metadata": {
                        "options": [
                            "\"Logo for a restaurant, green color, simple, modern\"",
                            "\"Minimalist logo concept for 'Verdant,' a modern plant-based restaurant. A single leaf shape subtly integrated into the letter V, clean geometric lines, single-color design in deep emerald green, flat vector style, ample whitespace around the mark, sophisticated and organic, suitable for signage and app icon\"",
                            "\"Photorealistic 3D render of a restaurant logo with reflections, metallic textures, complex gradients, floating in space with lens flare effects\"",
                            "\"Draw me the final logo file for Verdant restaurant, ready to print on business cards and signage, vector format with exact Pantone colors\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt explores a specific logo direction: it describes the concept (leaf + V integration), "
                            "style (minimalist, geometric, flat vector), color (deep emerald), and context (signage, app icon). "
                            "This generates a useful concept for exploration. The first is too vague. Photorealistic 3D logos are impractical "
                            "for real branding. The fourth treats AI as a final production tool — AI logos are concept explorations, "
                            "not final deliverables."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Why are AI-generated logos considered exploration tools rather than final deliverables?",
                    "metadata": {
                        "options": [
                            "Because AI logos are always ugly and need to be completely redesigned by a human",
                            "Because AI cannot generate images that include letters or shapes",
                            "Because AI generates raster images that lack the vector precision, scalability, and exact color control needed for professional logo usage across all sizes and media",
                            "Because using AI for any part of the logo design process is considered unethical in the design industry",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "Professional logos must work as tiny app icons and huge billboards — this requires vector format (infinitely scalable) "
                            "with exact color specifications (Pantone). AI generates raster/pixel images that lose quality when scaled and cannot "
                            "guarantee precise color matching. AI is excellent for exploring directions, shapes, and concepts quickly, "
                            "but final logos should be recreated as vectors in tools like Adobe Illustrator."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I'm building a brand for a Filipino artisan bakery. Help me define the visual identity — suggest colors, typography style, and photography direction.", "label": "Build a brand identity"},
                            {"text": "Generate a mood board prompt for a luxury travel brand that feels exclusive but not pretentious", "label": "Luxury mood board"},
                            {"text": "How do I translate brand values (like 'sustainable' or 'innovative') into visual design choices?", "label": "Values to visuals"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on brand identity design with AI. Help students translate brand values and audience into specific visual choices "
                "(colors, type, imagery style). Always ask about the brand's values, audience, and feeling before suggesting visuals. "
                "Remind them that AI logos are concept explorations, not final deliverables. "
                "Guide them to create complete brand systems, not just individual images."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 9 — Multi-Asset Campaign Design
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["brand-and-campaign"],
            "title": "Multi-Asset Campaign Design",
            "slug": "campaign-design",
            "description": "Create cohesive visual campaigns with hero images, social variants, and supporting graphics that work across platforms.",
            "xp_reward": 25,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 2,
            "ai_tools_enabled": ["chat", "image_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Campaign Design: One Message, Many Formats</h2>"
                        "<p>A marketing campaign isn't one image — it's a system of visual assets that work together "
                        "across platforms, formats, and contexts while maintaining a single, recognizable identity.</p>"
                        "<p>Think about a Nike campaign: the same visual concept appears on billboards, Instagram stories, "
                        "website banners, and email headers — each adapted to its platform but unmistakably part of the same campaign.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>The Campaign Asset Hierarchy</h3>"
                        "<ol>"
                        "<li><strong>Hero Image</strong> — The flagship visual. Maximum impact, full concept. "
                        "Used on landing pages, large banners, and as the campaign's \"face.\"</li>"
                        "<li><strong>Social Media Variants</strong> — Adapted for platform formats: "
                        "square (Instagram feed), vertical (Stories/Reels), horizontal (Twitter/LinkedIn). "
                        "Same visual language, different crop and emphasis.</li>"
                        "<li><strong>Supporting Graphics</strong> — Icons, patterns, background textures that "
                        "extend the campaign's visual system into UI, email, and print.</li>"
                        "<li><strong>Motion/Video</strong> — Animated versions for attention-grabbing placements.</li>"
                        "</ol>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Adapting for Different Platforms</h3>"
                        "<table><thead><tr><th>Platform</th><th>Format</th><th>Design Consideration</th></tr></thead>"
                        "<tbody>"
                        "<tr><td>Instagram Feed</td><td>1:1 (square)</td><td>Must work at thumbnail size. Bold text, high contrast.</td></tr>"
                        "<tr><td>Instagram Stories</td><td>9:16 (vertical)</td><td>Keep key info in middle 60% (top/bottom are covered by UI).</td></tr>"
                        "<tr><td>Facebook/LinkedIn</td><td>1.91:1 (landscape)</td><td>Wider, good for scenes. Text on left, image on right.</td></tr>"
                        "<tr><td>Twitter</td><td>16:9</td><td>Horizontal. Gets cropped in timeline — important content centered.</td></tr>"
                        "<tr><td>Website Hero</td><td>Full-width</td><td>Needs space for overlaid text. Keep subject off-center.</td></tr>"
                        "</tbody></table>"
                        "<p>When prompting AI for different formats, explicitly describe the aspect ratio and layout needs:</p>"
                        "<blockquote>"
                        "\"Instagram story format (9:16 vertical), subject centered in the middle third, "
                        "clean space at top and bottom for text overlay, brand colors prominent\""
                        "</blockquote>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "Campaign consistency hack: Write your style anchor ONCE, then append format-specific instructions for each asset. "
                        "The anchor ensures brand consistency while format instructions handle platform adaptation."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Try generating a campaign hero image: A vibrant summer promotion for a tropical juice brand, "
                            "fresh fruits splashing into juice, bright and energetic color palette of orange, yellow, and teal, "
                            "product photography with dynamic splash effects, joyful and refreshing mood, "
                            "landscape format with clean space on the left for text overlay."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "You've created a landscape hero image for a product launch campaign. Now you need to adapt it "
                        "for Instagram Stories (9:16 vertical). What's the most effective adaptation strategy?"
                    ),
                    "metadata": {
                        "options": [
                            "Just crop the hero image to 9:16 — it will work fine",
                            "Regenerate with the same style anchor but specify vertical composition: subject centered in middle third, key info between 20-80% of frame height, and appropriate format framing",
                            "Use a completely different visual style to stand out on mobile",
                            "Stretch the landscape image vertically to fit the format",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Simply cropping a landscape image to vertical usually cuts off critical content. Instead, regenerate with the same "
                            "style anchor (maintaining campaign consistency) but with composition rules suited to vertical: subject centered, "
                            "key content in the middle third (top/bottom get hidden by Stories UI). A different visual style breaks campaign cohesion. "
                            "Stretching distorts everything."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt best generates a hero campaign image for a summer juice brand that leaves room for text overlay?",
                    "metadata": {
                        "options": [
                            "\"Summer juice brand photo, bright and colorful, fruits everywhere filling the entire frame edge to edge, text written in the center\"",
                            "\"Hero campaign image for a tropical juice brand, fresh mangoes and citrus splashing into golden juice, product photography with dynamic splash effects, bright warm lighting, vibrant palette of orange, yellow, and teal, landscape format with clean negative space on the left third for headline text overlay, joyful and refreshing summer mood\"",
                            "\"Juice ad, put the product in the middle with the brand name in big text across the image, standard white background\"",
                            "\"A generic stock photo of juice on a table, simple composition, no special styling or color direction\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt creates a campaign-ready hero image: it specifies the subject with dynamic action (splashing fruit), "
                            "brand-appropriate colors, format (landscape), and crucially reserves clean space for text overlay — a requirement "
                            "for hero images that will have headlines overlaid. Filling the entire frame leaves nowhere for text. "
                            "AI-generated text is unreliable. Stock-style images lack the brand-specific visual identity a campaign needs."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "You need to create both an Instagram feed post (1:1 square) and a LinkedIn banner (1.91:1 landscape) for the same product launch. Which approach maintains campaign consistency?",
                    "metadata": {
                        "options": [
                            "Use a completely different visual concept for each platform since different audiences use each one",
                            "Write one style anchor that locks in colors, lighting, mood, and art style, then write separate composition instructions for each format — '1:1 square, product centered, bold text area at top' for Instagram and '1.91:1 landscape, product on right, text space on left' for LinkedIn",
                            "Create the Instagram post first, then screenshot it and stretch it to fit the LinkedIn banner dimensions",
                            "Only post on one platform to avoid the consistency challenge entirely",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The style anchor approach separates what stays consistent (colors, lighting, mood, art style) from what adapts "
                            "(composition, framing, text placement). Each platform gets a composition suited to its format while maintaining "
                            "the visual thread that makes both assets feel like one campaign. Different concepts break brand recognition. "
                            "Stretching distorts the image. Avoiding platforms limits your campaign's reach."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "When designing for Instagram Stories (9:16 vertical), why should key content be placed in the middle 60% of the frame?",
                    "metadata": {
                        "options": [
                            "Because the human eye naturally looks at the exact center of any image",
                            "Because the top and bottom of Stories are covered by the platform's UI elements (username at top, reply bar at bottom), so content there gets hidden",
                            "Because vertical images always look better with content in the middle for aesthetic reasons",
                            "Because AI generators cannot place content near the edges of vertical images",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Instagram Stories overlay the account name and profile picture at the top and the reply/message bar at the bottom. "
                            "Any important content placed in these zones gets partially or fully hidden. Designing with a 'safe zone' in the "
                            "middle 60% ensures your key message, product, and CTA are always visible. This is a practical platform constraint, "
                            "not an aesthetic preference — and it applies to every platform with UI overlays."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me plan a 5-asset campaign for a product launch — what formats do I need and how should each one be different?", "label": "Plan a campaign asset set"},
                            {"text": "I have a hero image style. Write me prompts for the Instagram Story and Facebook banner versions using the same visual language.", "label": "Adapt to different platforms"},
                            {"text": "What are the biggest mistakes in multi-platform campaign design?", "label": "Campaign design mistakes"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on multi-asset campaign design. Help students plan and create cohesive campaigns across platforms. "
                "Always emphasize style anchors for consistency and format-specific adaptations for each platform. "
                "When they describe a campaign need, help them think about all the assets they'll need, not just one image. "
                "Guide them on aspect ratio, safe zones, and platform-specific design rules."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 10 — AI Video Creation
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["brand-and-campaign"],
            "title": "AI Video Creation",
            "slug": "video-creation",
            "description": "Learn video prompting fundamentals, cinematic techniques, and how to create motion content that supports your visual campaigns.",
            "xp_reward": 25,
            "passing_score": 70,
            "time_limit_minutes": 30,
            "sort_order": 3,
            "ai_tools_enabled": ["chat", "video_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>AI Video: Bringing Your Designs to Life</h2>"
                        "<p>Video is the most engaging content format on every platform. "
                        "AI video generation lets you create motion content that would traditionally require a camera crew, "
                        "a studio, and a budget — from a single text prompt.</p>"
                        "<p>AI video generation is newer and more constrained than image generation, "
                        "but understanding how to direct it is an increasingly valuable skill.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Video Prompt Anatomy</h3>"
                        "<p>Video prompts build on image prompts but add motion and time:</p>"
                        "<table><thead><tr><th>Element</th><th>Image Prompt</th><th>Video Prompt Addition</th></tr></thead>"
                        "<tbody>"
                        "<tr><td>Subject</td><td>\"a coffee cup on a table\"</td><td>\"steam rising from a coffee cup\"</td></tr>"
                        "<tr><td>Camera</td><td>\"close-up shot\"</td><td>\"slow dolly-in close-up shot\"</td></tr>"
                        "<tr><td>Lighting</td><td>\"golden hour\"</td><td>\"golden hour with shifting light rays\"</td></tr>"
                        "<tr><td>Mood</td><td>\"serene\"</td><td>\"serene with gentle ambient movement\"</td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Cinematic Techniques for AI Video</h3>"
                        "<ul>"
                        "<li><strong>Dolly/Tracking Shot:</strong> \"smooth dolly-in\" or \"slow tracking shot from left to right\" — "
                        "creates depth and draws the viewer in</li>"
                        "<li><strong>Slow Motion:</strong> \"slow-motion, 120fps feel\" — adds drama and elegance to movement</li>"
                        "<li><strong>Timelapse:</strong> \"timelapse of clouds moving\" or \"time-lapse of a flower blooming\" — "
                        "compresses time, creates wonder</li>"
                        "<li><strong>Parallax/Depth:</strong> \"foreground elements slightly out of focus, background slowly moving\" — "
                        "creates a 3D-like depth effect</li>"
                        "<li><strong>Static + Motion:</strong> \"static camera, only the subject moves\" — "
                        "focuses attention, elegant and controlled</li>"
                        "</ul>"
                        "<h3>Best Practices for AI Video</h3>"
                        "<ol>"
                        "<li><strong>Keep it simple:</strong> One subject, one action, one mood. Complex scenes confuse AI.</li>"
                        "<li><strong>Describe motion explicitly:</strong> Don't just describe a scene — describe what <em>moves</em> and <em>how</em>.</li>"
                        "<li><strong>Specify camera movement:</strong> \"static,\" \"slow pan,\" \"orbit\" — without guidance, camera can be erratic.</li>"
                        "<li><strong>Match your brand:</strong> Use your style anchor's colors and mood in video prompts too.</li>"
                        "</ol>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "AI video works best for short loops and atmospheric clips (3-10 seconds). "
                        "Think social media intros, background animations, product reveals, and mood clips — "
                        "not full narratives or complex multi-scene videos."
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "video",
                        "prompt_hint": (
                            "Try generating: Slow dolly-in shot of a luxury watch on a dark velvet surface, "
                            "soft warm spotlight from above, gentle light reflections dancing on the watch face, "
                            "shallow depth of field, elegant and premium mood, slow cinematic movement."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "A wellness brand wants a 5-second video loop for their Instagram profile. "
                        "The brand is about calm, natural living. Which video style best serves this goal?"
                    ),
                    "metadata": {
                        "options": [
                            "Fast-paced montage with quick cuts between multiple scenes — energetic and attention-grabbing",
                            "A slow, smooth dolly shot of a plant in morning light with gentle steam from a tea cup, soft ambient movement, muted natural tones",
                            "Bold animated text with glitch effects and neon colors — modern and scroll-stopping",
                            "A drone shot rapidly flying over a city skyline — impressive and dynamic",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The brand's values (calm, natural) require slow movement, natural subjects, and muted tones. "
                            "A gentle dolly shot with ambient movement perfectly communicates serenity. Fast cuts, glitch effects, "
                            "and drone shots all communicate energy and dynamism — the opposite of calm wellness. "
                            "Video style must match brand personality just like color and typography do."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which video prompt best creates a premium product reveal for a luxury perfume brand?",
                    "metadata": {
                        "options": [
                            "\"Video of a perfume bottle, spinning around, cool effects, luxury feeling, high quality\"",
                            "\"Slow cinematic dolly-in shot of a crystal perfume bottle emerging from soft shadow into warm golden spotlight, gentle light refractions dancing across the glass surface, shallow depth of field, dark velvet background, elegant and mysterious mood, slow-motion movement, premium commercial feel\"",
                            "\"Fast-paced montage of perfume being sprayed from multiple angles, quick cuts every half second, strobe lighting effects, EDM music video style, neon colors\"",
                            "\"Static photo of a perfume bottle with a Ken Burns zoom effect applied in post-production, basic slide-show style, no actual motion in the scene\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt applies multiple cinematic techniques for luxury: slow dolly-in (draws the viewer in), "
                            "emergence from shadow (dramatic reveal), light refractions (visual interest), shallow DOF (premium focus), "
                            "and slow-motion (elegance). The first is too vague. Fast cuts and strobe lighting feel like music videos, "
                            "not luxury. A static photo with Ken Burns effect is not true AI video generation — it lacks genuine motion."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which video prompt best demonstrates the principle of 'one subject, one action, one mood' for AI video?",
                    "metadata": {
                        "options": [
                            "\"A busy street scene with cars driving, people walking, birds flying, a dog running, street vendors selling food, rain starting to fall, and a sunset happening simultaneously\"",
                            "\"A single candle flame flickering gently in a dark room, static camera, warm amber tones, soft shadows moving on the wall behind, serene and meditative mood, slow and hypnotic pace\"",
                            "\"Three different products rotating on three different colored backgrounds with three different lighting setups in the same frame\"",
                            "\"A person cooking in a kitchen while also talking on the phone and a cat jumps on the counter and a pot boils over\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The candle prompt is a perfect example of simplicity: one subject (candle flame), one action (flickering gently), "
                            "one mood (serene and meditative). This gives AI a clear, focused direction that produces coherent video. "
                            "The street scene has at least seven competing actions. Three products in one frame confuses the focal point. "
                            "The kitchen scene has multiple simultaneous actions that AI cannot choreograph reliably."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "A bakery wants a looping video for their social media header showing fresh bread. Which prompt approach works best for a seamless loop?",
                    "metadata": {
                        "options": [
                            "\"Close-up of golden bread loaf with steam gently rising in a continuous wisp, static camera, warm bakery lighting from above, shallow depth of field, cozy and inviting atmosphere, seamless looping ambient movement\"",
                            "\"A baker walking into frame, picking up bread, cutting it, and walking out of frame — full narrative sequence\"",
                            "\"Timelapse of bread being made from start to finish, dough mixing to baked loaf, 30-second compressed process\"",
                            "\"Bread on a table with dramatic camera movements — orbit, pan, dolly, crane shot — all in one clip\"",
                        ],
                        "correct_index": 0,
                        "explanation": (
                            "Seamless loops work best with continuous ambient motion like steam rising — it has no clear start or end point, "
                            "so the loop is invisible. The static camera and single gentle action create a mesmerizing, professional header. "
                            "A narrative sequence has a clear beginning and end that makes the loop obvious. Timelapse implies progression "
                            "that cannot loop smoothly. Multiple camera movements in one clip are too complex for current AI video."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "Help me write a video prompt for a product reveal — a new sneaker emerging from shadow into light", "label": "Product reveal video"},
                            {"text": "What camera movements work best for different brand moods? Give me a reference guide.", "label": "Camera movement guide"},
                            {"text": "I want to make a looping video for a restaurant's social media. What approach works best?", "label": "Social media video loop"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on AI video creation. Help students write effective video prompts by describing motion, camera movement, "
                "and timing — not just static scenes. Emphasize keeping videos simple (one subject, one action) and short (3-10 seconds). "
                "When they describe a video need, suggest specific cinematic techniques (dolly, pan, slow-motion) and help them "
                "match video style to brand personality. Remind them to use their brand style anchor for visual consistency."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 11 — The Art of Design Critique
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["video-and-portfolio"],
            "title": "The Art of Design Critique",
            "slug": "design-critique",
            "description": "Develop your critical eye with a structured framework for evaluating and improving any design — from your own AI generations to professional work.",
            "xp_reward": 20,
            "passing_score": 70,
            "time_limit_minutes": 25,
            "sort_order": 1,
            "ai_tools_enabled": ["chat"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Design Critique: Seeing Like a Designer</h2>"
                        "<p>The ability to look at a design and articulate <em>what works, what doesn't, and how to improve it</em> "
                        "is the single most valuable skill in visual design. It's what separates someone who generates random images "
                        "from someone who creates intentional, effective visuals.</p>"
                        "<p>This skill is especially critical with AI — you need to evaluate every generation and decide: "
                        "\"Is this good enough, or do I need to iterate?\"</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>The 3-Layer Critique Framework</h3>"
                        "<p>Evaluate every design on three levels:</p>"
                        "<ol>"
                        "<li><strong>Technical Quality</strong> — Is it well-executed?<br/>"
                        "<ul>"
                        "<li>Is the resolution and clarity sufficient?</li>"
                        "<li>Are colors consistent and intentional?</li>"
                        "<li>Is the composition balanced?</li>"
                        "<li>Are there any artifacts, distortions, or unintended elements? (Common in AI art)</li>"
                        "</ul></li>"
                        "<li><strong>Design Principles</strong> — Does it follow good design rules?<br/>"
                        "<ul>"
                        "<li>Is there clear visual hierarchy?</li>"
                        "<li>Does it pass the CRAP test? (Contrast, Repetition, Alignment, Proximity)</li>"
                        "<li>Is color used effectively?</li>"
                        "<li>Is typography appropriate and readable?</li>"
                        "</ul></li>"
                        "<li><strong>Strategic Effectiveness</strong> — Does it achieve its goal?<br/>"
                        "<ul>"
                        "<li>Does it communicate the right message/mood?</li>"
                        "<li>Is it appropriate for the target audience?</li>"
                        "<li>Does it match the brand identity?</li>"
                        "<li>Would it work in its intended context (billboard, Instagram, packaging)?</li>"
                        "</ul></li>"
                        "</ol>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "callout",
                    "content": (
                        "When critiquing, always start with what works. Then address what could improve, framing feedback "
                        "as opportunities rather than failures. \"The color palette is strong, and I'd push the hierarchy "
                        "further by making the headline 2x larger\" is more useful than \"the headline is too small.\""
                    ),
                    "metadata": {"type": "tip"},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Common AI Generation Problems to Watch For</h3>"
                        "<table><thead><tr><th>Problem</th><th>What to Look For</th><th>Prompt Fix</th></tr></thead>"
                        "<tbody>"
                        "<tr><td><strong>Text artifacts</strong></td><td>Garbled, misspelled, or impossible text in the image</td>"
                        "<td>Avoid requesting text in AI images; overlay text manually instead</td></tr>"
                        "<tr><td><strong>Anatomical errors</strong></td><td>Extra fingers, distorted hands, asymmetric faces</td>"
                        "<td>Specify \"anatomically correct\" or frame to avoid hands/faces</td></tr>"
                        "<tr><td><strong>Style inconsistency</strong></td><td>Parts of the image look photo-real while others look illustrated</td>"
                        "<td>Strengthen style keywords, add \"consistent style throughout\"</td></tr>"
                        "<tr><td><strong>Overcrowding</strong></td><td>Too many elements, no breathing room</td>"
                        "<td>Add \"minimalist, clean composition, ample negative space\"</td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "quiz",
                    "content": (
                        "You're reviewing a social media ad generated by AI for a premium skincare brand. "
                        "The image has beautiful colors and lighting, but the product is in the bottom corner, "
                        "surrounded by flowers that compete for attention, and there's garbled text at the top. "
                        "What is the most impactful improvement to make first?"
                    ),
                    "metadata": {
                        "options": [
                            "Improve the resolution — higher quality will fix the issues",
                            "Change the flowers to a different type — the species doesn't match the brand",
                            "Restructure the composition to make the product the dominant focal point with clear hierarchy, and remove the AI-generated text",
                            "Add more brand elements like logos and taglines to fill the empty space",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "The most critical problem is strategic: the product (the whole point of the ad) is lost in the corner. "
                            "Fixing composition and hierarchy — making the product the clear focal point — has the highest impact. "
                            "The garbled text is a common AI artifact that should be removed entirely (text should be overlaid manually). "
                            "Resolution is fine. Flower species is a trivial detail. Adding more elements makes the overcrowding worse."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "You generated an AI image for a tech startup's homepage. The image has sharp resolution and a clean layout, but uses warm earthy tones and a rustic handmade aesthetic. The startup wants to feel innovative and cutting-edge. Which layer of the critique framework identifies the problem?",
                    "metadata": {
                        "options": [
                            "Technical Quality — the image resolution and clarity need improvement",
                            "Design Principles — the CRAP principles are being violated",
                            "Strategic Effectiveness — the visual style communicates the wrong brand message for the target audience",
                            "There is no problem — warm and rustic can work for any brand",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "The image passes the Technical Quality check (sharp, clean) and may even follow good Design Principles "
                            "(layout is clean). But it fails Strategic Effectiveness: warm earthy tones and rustic aesthetics communicate "
                            "tradition and craftsmanship, not innovation and cutting-edge technology. The visual style must align with the brand's "
                            "message and audience. This is why the 3-layer framework exists — technically good designs can still fail strategically."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Which prompt revision best addresses the AI artifact problem of garbled, unreadable text appearing in generated images?",
                    "metadata": {
                        "options": [
                            "\"Add the text 'SALE 50% OFF' in clear, readable Arial font at the top of the image, make sure every letter is perfect and spelled correctly\"",
                            "\"Generate the image without any text elements — use clean negative space where text would go, so real typography can be overlaid manually afterward in a design tool\"",
                            "\"Write the text in a larger font size so the AI can render each letter more accurately at higher resolution\"",
                            "\"Include the text multiple times throughout the image so at least one version will be readable\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "AI image generators consistently struggle with accurate text rendering — this is a known technical limitation. "
                            "The professional solution is to generate text-free images with intentional negative space for text placement, "
                            "then overlay precise typography using design tools like Figma or Canva. Asking for 'perfect' text does not solve "
                            "the underlying technical limitation. Larger fonts and repetition still produce garbled results."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "When critiquing a design, why should you always start by identifying what works before addressing what needs improvement?",
                    "metadata": {
                        "options": [
                            "Because it makes the critique take longer, showing you were thorough",
                            "Because identifying strengths helps you understand what to preserve during revisions and frames feedback as building on success rather than listing failures",
                            "Because clients only want to hear positive feedback about their designs",
                            "Because design principles say the first thing you notice is always the strongest element",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Starting with strengths serves two practical purposes: first, it identifies what is already working so you do not "
                            "accidentally lose those qualities during revision. Second, it frames improvement as 'building on what is already strong' "
                            "rather than 'fixing what is broken,' which leads to more focused, constructive iteration. This applies whether you are "
                            "critiquing your own AI generations or giving feedback to a colleague."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I just generated an AI image for a client project. Walk me through the 3-layer critique — I'll describe what I see.", "label": "Critique my AI generation"},
                            {"text": "What are the most common design mistakes you see in AI-generated marketing materials?", "label": "Common AI design mistakes"},
                            {"text": "Help me develop my design eye — give me a design to mentally evaluate using the critique framework", "label": "Practice critique exercise"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Lesson on design critique. Help students evaluate designs using the 3-layer framework: "
                "technical quality, design principles, and strategic effectiveness. "
                "When they describe a design or AI generation, walk through each layer systematically. "
                "Always start with what works, then identify the highest-impact improvement. "
                "Be specific — say 'increase the headline size to 2x the body text' not 'make it bigger.' "
                "Watch for common AI artifacts like text garbling, extra fingers, and style inconsistency."
            ),
        },
    ))

    # -----------------------------------------------------------------------
    # LESSON 12 — Your Portfolio Project (Capstone)
    # -----------------------------------------------------------------------
    lessons.append((
        {
            "module_id": mod["video-and-portfolio"],
            "title": "Your Portfolio Project",
            "slug": "portfolio-project",
            "description": "Capstone project: Choose a client brief, apply everything you've learned, and generate a complete visual campaign using AI.",
            "xp_reward": 30,
            "passing_score": 70,
            "time_limit_minutes": 45,
            "sort_order": 2,
            "ai_tools_enabled": ["chat", "image_gen", "video_gen"],
        },
        {
            "content_blocks": [
                {
                    "type": "markdown",
                    "content": (
                        "<h2>Capstone: Your Visual Campaign</h2>"
                        "<p>It's time to bring everything together. In this final project, you'll choose a client brief "
                        "and create a complete visual campaign — from brand identity to multi-platform assets.</p>"
                        "<p>This is how professional designers work with AI: strategic thinking first, then systematic execution.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Choose Your Client Brief</h3>"
                        "<p>Pick ONE of the following briefs:</p>"
                        "<table><thead><tr><th>Brief</th><th>Description</th><th>Challenge Level</th></tr></thead>"
                        "<tbody>"
                        "<tr><td><strong>A. \"Brew & Bean\"</strong></td>"
                        "<td>A new specialty coffee shop in Manila's business district. Targeting young professionals who care about quality. "
                        "They want a warm, artisanal, slightly modern brand.</td>"
                        "<td>Standard</td></tr>"
                        "<tr><td><strong>B. \"NovaTech\"</strong></td>"
                        "<td>A tech startup launching an AI productivity app. Targeting remote workers globally. "
                        "They want to feel innovative yet trustworthy, not cold or corporate.</td>"
                        "<td>Intermediate</td></tr>"
                        "<tr><td><strong>C. \"Maison Aura\"</strong></td>"
                        "<td>A sustainable luxury fashion brand. Targeting affluent, environmentally conscious consumers. "
                        "They want to feel premium and exclusive while being authentically eco-friendly — not greenwashing.</td>"
                        "<td>Advanced</td></tr>"
                        "</tbody></table>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "markdown",
                    "content": (
                        "<h3>Your Campaign Deliverables</h3>"
                        "<p>For your chosen brief, create the following using AI generation:</p>"
                        "<ol>"
                        "<li><strong>Brand Mood Board</strong> — An image that captures the brand's visual direction, "
                        "color palette, and feeling</li>"
                        "<li><strong>Hero Campaign Image</strong> — The flagship visual for the brand's launch campaign</li>"
                        "<li><strong>Social Media Variant</strong> — The hero concept adapted for Instagram (square format)</li>"
                        "<li><strong>Supporting Visual</strong> — A secondary campaign image that complements the hero "
                        "(different subject, same style anchor)</li>"
                        "</ol>"
                        "<p>Remember to write a <strong>style anchor</strong> before you start generating! "
                        "Lock in your colors, style, lighting, and mood.</p>"
                    ),
                    "metadata": {},
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Start with your mood board! Example for Brew & Bean: "
                            "A brand mood board for a specialty coffee shop, warm artisanal aesthetic, "
                            "color palette of rich espresso brown, warm cream, and terracotta accent, "
                            "natural textures like wood and linen, warm golden lighting, hand-crafted feel, "
                            "sophisticated yet approachable."
                        ),
                    },
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Now create your hero campaign image! Use your style anchor. Example: "
                            "A beautifully crafted latte on a rustic wooden counter, specialty coffee shop, "
                            "warm natural light streaming through large windows, shallow depth of field, "
                            "rich espresso brown and cream tones, artisanal and inviting atmosphere, "
                            "product photography style."
                        ),
                    },
                },
                {
                    "type": "generation",
                    "content": "",
                    "metadata": {
                        "gen_type": "image",
                        "prompt_hint": (
                            "Adapt for Instagram (square format). Same style anchor, adjusted composition: "
                            "Square format (1:1) overhead flat-lay shot of a coffee spread on a wooden table, "
                            "latte art, pastry, coffee beans scattered artfully, same warm natural lighting "
                            "and earthy color palette, inviting and share-worthy, clean space for text overlay."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": (
                        "You've chosen the \"Maison Aura\" brief (sustainable luxury fashion). "
                        "Which strategic decision has the biggest impact on whether the brand is perceived as "
                        "authentically premium rather than greenwashing?"
                    ),
                    "metadata": {
                        "options": [
                            "Using as many shades of green as possible — green = sustainability",
                            "Adding recycling symbols and eco-labels prominently on every asset",
                            "Choosing a visual language of understated luxury (muted earth tones, natural textures, editorial photography) that embeds sustainability into the aesthetics rather than stating it with symbols",
                            "Using stock photos of nature scenes as backgrounds to signal environmental care",
                        ],
                        "correct_index": 2,
                        "explanation": (
                            "Authentic luxury sustainability is communicated through aesthetics, not labels. Muted earth tones, natural textures "
                            "(linen, raw materials), and editorial photography create a premium feel that inherently signals sustainable values. "
                            "Green everywhere is cliche. Eco-labels and recycling symbols feel like fast-fashion greenwashing. "
                            "Stock nature photos are generic. The most powerful branding embeds values into every visual choice "
                            "rather than declaring them with obvious symbols."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "You chose the 'Brew & Bean' brief (specialty coffee shop targeting young professionals). Which prompt best generates a campaign hero image that aligns with the brand?",
                    "metadata": {
                        "options": [
                            "\"Coffee shop photo, warm lighting, make it look inviting, professional quality image\"",
                            "\"Hero campaign image for Brew & Bean specialty coffee — a beautifully crafted latte with intricate art on a handmade ceramic cup, warm natural light streaming through large industrial windows, rustic wooden counter with subtle greenery, earthy palette of espresso brown, warm cream, and terracotta, shallow depth of field, artisanal and inviting atmosphere, editorial food photography style\"",
                            "\"Futuristic coffee shop with neon lights, chrome surfaces, robotic barista, cyberpunk aesthetic, dramatic blue and purple lighting, sci-fi mood\"",
                            "\"Generic coffee cup clipart on a plain background, simple and basic, no special styling\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second prompt translates the Brew & Bean brief into specific visual choices: the artisanal aesthetic (handmade ceramic, "
                            "latte art), the young professional appeal (industrial windows, editorial style), and the warm/modern brand values "
                            "(earthy palette, natural light). It uses the 6-part formula and applies brand identity thinking to every choice. "
                            "The first is too vague. Cyberpunk contradicts the artisanal brand entirely. Clipart is not campaign-quality."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "For the 'NovaTech' brief (AI productivity app for remote workers), which style anchor would best communicate 'innovative yet trustworthy'?",
                    "metadata": {
                        "options": [
                            "\"Dark mode, neon accents, glitch effects, matrix-style code rain, aggressive and edgy, cyberpunk hacker aesthetic\"",
                            "\"Clean modern aesthetic with a palette of soft blue #4A90D9, white, and a vibrant coral #FF6B6B accent, light and airy feel, minimalist flat illustrations with friendly rounded shapes, soft diffused lighting, generous whitespace, confident and approachable mood\"",
                            "\"Traditional corporate style with navy suit stock photos, handshake imagery, serif fonts, gold accents, formal and conservative\"",
                            "\"Random colorful abstract art, no consistent style, experimental and unpredictable, different treatment for each asset\"",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "The second style anchor balances innovation (modern flat illustrations, coral accent) with trustworthiness "
                            "(blue palette, clean whitespace, soft lighting). Friendly rounded shapes make tech feel approachable rather than cold. "
                            "Cyberpunk and glitch effects feel threatening, not trustworthy. Traditional corporate imagery feels dated for an AI startup. "
                            "Random inconsistent styles destroy brand recognition entirely."
                        ),
                    },
                },
                {
                    "type": "quiz",
                    "content": "Before starting your capstone campaign generation, what is the single most important step that will save you the most time and ensure the best results?",
                    "metadata": {
                        "options": [
                            "Start generating images immediately and figure out the style as you go",
                            "Write a detailed style anchor that locks in your color palette, art style, lighting, mood, and technical approach BEFORE generating any images",
                            "Find and copy prompts from other people's AI art that look similar to what you want",
                            "Generate as many random variations as possible and pick the best ones afterward",
                        ],
                        "correct_index": 1,
                        "explanation": (
                            "Writing your style anchor before generating is the single highest-leverage step in any multi-asset project. "
                            "It serves as your creative brief and ensures every image shares the same visual DNA from the start. "
                            "Without an anchor, you will waste hours trying to make image #4 match image #1 after the fact. "
                            "Copying others' prompts produces someone else's vision. Random generation without direction is the least "
                            "efficient approach to professional campaign work."
                        ),
                    },
                },
                {
                    "type": "prompts",
                    "content": "",
                    "metadata": {
                        "prompts": [
                            {"text": "I chose the Brew & Bean brief. Help me write a style anchor before I start generating.", "label": "Brew & Bean style anchor"},
                            {"text": "I chose the NovaTech brief. What visual direction would communicate 'innovative but trustworthy' for a tech app?", "label": "NovaTech visual direction"},
                            {"text": "I chose the Maison Aura brief. How do I make luxury feel sustainable without looking like greenwashing?", "label": "Maison Aura strategy"},
                            {"text": "Critique my campaign images — I'll describe what I generated. Tell me what works and what to improve.", "label": "Critique my campaign"},
                        ],
                    },
                },
            ],
            "ai_context": (
                "Capstone project lesson. The student is creating a full campaign for one of three briefs: "
                "Brew & Bean (coffee shop), NovaTech (tech startup), or Maison Aura (sustainable luxury fashion). "
                "Help them develop a style anchor first, then guide each generation with strategic feedback. "
                "Critique their outputs using the 3-layer framework (technical, design principles, strategic effectiveness). "
                "Push them to iterate — don't accept the first generation. "
                "Celebrate their progress and connect their choices back to the principles they learned throughout the track."
            ),
        },
    ))

    return lessons


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=== Seeding AI Graphic Design & Visual Track ===\n")

    # Step 1 — Clean slate
    delete_existing()

    # Step 2 — Create modules
    mod = create_modules()

    # Step 3 — Create lessons (rows only, no content yet)
    print("\nCreating lessons...")
    lessons = build_lessons(mod)

    for lesson_row, _ in lessons:
        result = api("POST", "academy_lessons", "", lesson_row,
                      extra_headers={"Prefer": "return=representation"})
        row = result[0] if isinstance(result, list) else result
        print(f"  + {row['slug']} (module {lesson_row['module_id'][:8]}...) -> {row['id']}")

    # Step 4 — Patch content_blocks and ai_context onto each lesson
    print("\nPatching lesson content...")
    for lesson_row, patch_data in lessons:
        slug = lesson_row["slug"]
        url_params = f"slug=eq.{slug}"
        payload = {
            "content_blocks": json.dumps(patch_data["content_blocks"]),
            "ai_context": patch_data["ai_context"],
        }
        api("PATCH", "academy_lessons", url_params, payload,
            extra_headers={"Prefer": "return=representation"})
        print(f"  ~ {slug} — {len(patch_data['content_blocks'])} blocks patched")

    print("\n=== Done! 5 modules, 12 lessons seeded. ===")


if __name__ == "__main__":
    main()
