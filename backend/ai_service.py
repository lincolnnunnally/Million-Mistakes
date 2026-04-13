"""AI Service for generating personalized daily challenges using OpenAI."""
import json
import os
import asyncio
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

API_KEY = os.environ.get('EMERGENT_LLM_KEY')

STAGES = {
    1: "Beaten down - feels hopeless, has given up after repeated failures",
    2: "Analysis paralysis - hopeful but overthinks everything, paralyzed by fear of judgment",
    3: "Stuck in others' dreams - determined but living someone else's vision, not their own",
    4: "Courageous dreamer - ready to dream big but needs practice stepping into the unknown"
}

SYSTEM_PROMPT = """You are the challenge engine for "10 Million Mistakes" — an app that helps people overcome fear of failure by deliberately making and learning from mistakes.

Your job: Generate ONE personalized daily micro-challenge that targets the user's specific avoidance pattern.

RULES:
- The challenge must be WARM, ENCOURAGING, and slightly scary (growth zone, not danger zone)
- Never be preachy, condescending, or therapist-like
- The challenge should be completable TODAY in under 30 minutes
- It should target the EXACT thing the user usually avoids
- Difficulty should match their stage (1=gentlest, 4=boldest)
- Always frame failure as progress, not shame
- Keep language conversational, like a supportive friend

You MUST respond with ONLY valid JSON in this exact format:
{
  "title": "Short catchy title (3-6 words)",
  "challenge": "The actual challenge description (2-3 sentences, conversational tone)",
  "why_this": "Why this challenge matters for their specific stage/domain (1-2 sentences)",
  "difficulty": 1-5,
  "domain": "The domain this targets",
  "stage": 1-4,
  "coaching_line": "One encouraging line they'll see after completing it (feels like a friend, not a coach)"
}

NO other text. ONLY the JSON object."""

FALLBACK_CHALLENGES = {
    (1, "Money/Career"): {
        "title": "One Small Money Move",
        "challenge": "Today, look at one bill or bank statement you've been avoiding. Just look at it. You don't have to fix anything—just face it for 60 seconds.",
        "why_this": "When we're beaten down, even glancing at financial reality feels impossible. This tiny act proves you're braver than you think.",
        "difficulty": 1, "domain": "Money/Career", "stage": 1,
        "coaching_line": "You looked. That took guts. Most people won't even do that."
    },
    (1, "Relationships"): {
        "title": "Send One Real Text",
        "challenge": "Text someone you haven't talked to in a while. Just say 'Hey, I was thinking about you.' That's it. No essay needed.",
        "why_this": "When you feel beaten down, reaching out feels like begging. It's not. It's brave.",
        "difficulty": 1, "domain": "Relationships", "stage": 1,
        "coaching_line": "You reached out. That's more than most people do in a month."
    },
    (1, "Spiritual/Emotional"): {
        "title": "Sit With It for 60 Seconds",
        "challenge": "Set a timer for 60 seconds. Close your eyes and just breathe. If sadness or frustration shows up, let it. Don't fix it.",
        "why_this": "Feeling hopeless makes us run from our own emotions. Sitting still for one minute is a radical act of self-trust.",
        "difficulty": 1, "domain": "Spiritual/Emotional", "stage": 1,
        "coaching_line": "You sat with yourself. That's the bravest thing you've done today."
    },
    (1, "Skills/Hobbies"): {
        "title": "Draw Something Ugly",
        "challenge": "Grab any pen and paper. Draw something — anything — and make it intentionally bad. Stick figures welcome.",
        "why_this": "When you're beaten down, even creating feels pointless. Making something ugly on purpose proves you still have a spark.",
        "difficulty": 1, "domain": "Skills/Hobbies", "stage": 1,
        "coaching_line": "You created something. It doesn't matter how it looks. You showed up."
    },
    (2, "Money/Career"): {
        "title": "Ask One Dumb Question",
        "challenge": "At work or online, ask one question you've been holding back because it might sound stupid. The dumber you think it is, the better.",
        "why_this": "Analysis paralysis thrives on 'I need to know more first.' Asking a 'dumb' question breaks that loop instantly.",
        "difficulty": 2, "domain": "Money/Career", "stage": 2,
        "coaching_line": "Smart people ask dumb questions. That's literally how they got smart."
    },
    (2, "Relationships"): {
        "title": "Say the Unpolished Thing",
        "challenge": "Today, share one honest opinion with someone—even if it's imperfect. It could be as small as 'I actually didn't love that movie.'",
        "why_this": "Analysis paralysis in relationships means rehearsing every word until you say nothing real.",
        "difficulty": 2, "domain": "Relationships", "stage": 2,
        "coaching_line": "Imperfect honesty beats polished silence every single time."
    },
    (2, "Spiritual/Emotional"): {
        "title": "Write Your Mess",
        "challenge": "Open your notes app and write for 3 minutes about whatever is bothering you. No structure. No editing. Just dump it out.",
        "why_this": "Overthinking turns feelings into puzzles. Writing messy thoughts down takes the power out of the loop.",
        "difficulty": 2, "domain": "Spiritual/Emotional", "stage": 2,
        "coaching_line": "You didn't solve it. You didn't need to. You just stopped carrying it alone."
    },
    (2, "Skills/Hobbies"): {
        "title": "Share Something Unfinished",
        "challenge": "Show someone one thing you've been working on that isn't done yet. A draft, a sketch, a half-baked idea. Let them see the mess.",
        "why_this": "Perfectionists hide their work until it's 'ready.' Sharing unfinished work breaks the paralysis of waiting.",
        "difficulty": 2, "domain": "Skills/Hobbies", "stage": 2,
        "coaching_line": "Unfinished work shared is braver than perfect work hidden forever."
    },
    (3, "Money/Career"): {
        "title": "Name Your Own Dream",
        "challenge": "Write down one career goal that's truly YOURS — not what your family expects, not what looks impressive. Just what excites you.",
        "why_this": "Stage 3 means you have the drive but it's pointed at someone else's target. Naming your own dream is the first step to owning it.",
        "difficulty": 3, "domain": "Money/Career", "stage": 3,
        "coaching_line": "That dream you just wrote? It's been waiting for you to claim it."
    },
    (3, "Relationships"): {
        "title": "Set One Tiny Boundary",
        "challenge": "Today, say 'no' to one small thing you'd normally agree to just to keep the peace. It can be tiny.",
        "why_this": "Living someone else's dream often means saying yes to everyone else. One 'no' reminds you that your needs matter too.",
        "difficulty": 3, "domain": "Relationships", "stage": 3,
        "coaching_line": "Every 'no' to someone else is a 'yes' to yourself. Well done."
    },
    (3, "Spiritual/Emotional"): {
        "title": "Admit What You Really Want",
        "challenge": "Say out loud (yes, out loud) one thing you truly want for yourself that you've been suppressing because it feels selfish.",
        "why_this": "Stage 3 people know they want more but feel guilty wanting it. Speaking it aloud makes it real.",
        "difficulty": 3, "domain": "Spiritual/Emotional", "stage": 3,
        "coaching_line": "Wanting something for yourself isn't selfish. It's human. And you just proved it."
    },
    (3, "Skills/Hobbies"): {
        "title": "Try the Thing You Love",
        "challenge": "Spend 15 minutes on a skill or hobby YOU love — not one someone told you to pursue. Guitar, cooking, coding, whatever lights you up.",
        "why_this": "When you're living someone else's dream, your own passions get buried. 15 minutes is enough to remember what's yours.",
        "difficulty": 3, "domain": "Skills/Hobbies", "stage": 3,
        "coaching_line": "That spark you felt? That's YOUR life calling. Keep feeding it."
    },
    (4, "Money/Career"): {
        "title": "Pitch Your Wild Idea",
        "challenge": "Tell someone about your boldest career/money idea — the one that scares you because it might actually work. Say it out loud to a real person.",
        "why_this": "Stage 4 dreamers have big visions but haven't said them out loud yet. Speaking it makes it real and starts momentum.",
        "difficulty": 4, "domain": "Money/Career", "stage": 4,
        "coaching_line": "You said the scary thing. Now it exists outside your head. That's how dreams become plans."
    },
    (4, "Relationships"): {
        "title": "Be Vulnerable First",
        "challenge": "Tell someone you trust one thing you're afraid of. Not your strengths. Your fear. Let them see the real you.",
        "why_this": "Courageous dreamers are brave in many areas but often hide vulnerability. Leading with honesty deepens every connection.",
        "difficulty": 4, "domain": "Relationships", "stage": 4,
        "coaching_line": "Vulnerability isn't weakness. It's the bravest thing a strong person can do."
    },
    (4, "Spiritual/Emotional"): {
        "title": "Forgive One Failure",
        "challenge": "Think of one past failure you still beat yourself up about. Write it down, then write: 'This taught me ___.' Then let it go.",
        "why_this": "Even courageous dreamers carry old shame. Forgiving a past failure frees up energy for future leaps.",
        "difficulty": 4, "domain": "Spiritual/Emotional", "stage": 4,
        "coaching_line": "You didn't just forgive a failure. You turned it into wisdom. That's powerful."
    },
    (4, "Skills/Hobbies"): {
        "title": "Publish Something Imperfect",
        "challenge": "Post, share, or submit something creative you've made — even if it's not 'ready.' A blog post, a video, a painting. Put it into the world.",
        "why_this": "Stage 4 is about stepping into the unknown. Publishing imperfect work proves you value progress over perfection.",
        "difficulty": 4, "domain": "Skills/Hobbies", "stage": 4,
        "coaching_line": "It's out there now. Imperfect and brave. That's how legends start."
    }
}

GENERIC_FALLBACK = {
    "title": "Do One Brave Thing",
    "challenge": "Today, do one small thing that scares you. It could be anything — speak up, try something new, or admit you don't know something. The size doesn't matter; the trying does.",
    "why_this": "Every brave action, no matter how small, rewires your brain to see mistakes as progress instead of failure.",
    "difficulty": 2, "domain": "General", "stage": 0,
    "coaching_line": "You tried. That's more than most people do today. You're already ahead."
}


async def generate_challenge(stage: int, domain: str, recent_reflections: list = None) -> dict:
    """Generate a personalized daily challenge using AI with fallback."""
    try:
        reflections_context = ""
        if recent_reflections:
            summaries = [f"- {r.get('story', '')}" for r in recent_reflections[:3]]
            reflections_context = f"\nRecent reflections:\n" + "\n".join(summaries)

        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"challenge-{datetime.now().isoformat()}",
            system_message=SYSTEM_PROMPT
        ).with_model("openai", "gpt-4.1")

        user_msg = UserMessage(
            text=f"""Generate a daily challenge for this user:
- Stage: {stage} ({STAGES.get(stage, 'Unknown')})
- Domain: {domain}
- Context: User is working on growth in {domain} area{reflections_context}
"""
        )

        response = await chat.send_message(user_msg)
        response_text = response.strip()
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])

        challenge = json.loads(response_text)
        required = ['title', 'challenge', 'why_this', 'difficulty', 'domain', 'stage', 'coaching_line']
        missing = [f for f in required if f not in challenge]
        if missing:
            raise ValueError(f"Missing fields: {missing}")

        challenge['source'] = 'ai'
        return challenge

    except Exception as e:
        print(f"AI generation failed: {e}. Using fallback.")
        return get_fallback_challenge(stage, domain)


def get_fallback_challenge(stage: int, domain: str) -> dict:
    """Get a fallback challenge from the pre-written library."""
    key = (stage, domain)
    challenge = FALLBACK_CHALLENGES.get(key, GENERIC_FALLBACK.copy())
    result = challenge.copy()
    result['source'] = 'fallback'
    if result.get('stage') == 0:
        result['stage'] = stage
        result['domain'] = domain
    return result
