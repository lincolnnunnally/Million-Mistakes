"""Pattern Discovery Service - Analyzes reflections for recurring themes and generates insights."""
import json
import os
from datetime import datetime, timedelta
from collections import Counter
from emergentintegrations.llm.chat import LlmChat, UserMessage

API_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Common obstacle themes for rules-based tagging
OBSTACLE_THEMES = {
    "fear_of_judgment": ["judge", "judg", "think of me", "look stupid", "embarrass", "opinion", "what people", "what they", "laugh at", "mock"],
    "perfectionism": ["perfect", "not good enough", "not ready", "mess up", "mistake", "wrong", "fail", "failure"],
    "avoidance": ["avoid", "put off", "procrastinat", "later", "tomorrow", "skip", "ignore", "ran from", "didn't do"],
    "fear_of_rejection": ["reject", "say no", "turn down", "denied", "not accepted", "unwanted"],
    "self_doubt": ["can't do", "not capable", "doubt", "unsure", "don't know", "imposter", "fraud", "not smart"],
    "people_pleasing": ["please", "disappoint", "let down", "said yes", "couldn't say no", "their expectation"],
    "comfort_zone": ["comfort", "safe", "routine", "same old", "stuck", "familiar", "easy way"],
    "overthinking": ["overthink", "overanalyz", "too much thinking", "spiral", "ruminate", "replay", "couldn't stop thinking"],
    "paradox_of_choice": ["too many options", "can't decide", "which one", "so many choices", "all the options", "can't commit", "what if I pick wrong", "other options", "different path", "which path", "indecisive", "too many paths"]
}

THEME_LABELS = {
    "fear_of_judgment": "Fear of Judgment",
    "perfectionism": "Perfectionism",
    "avoidance": "Avoidance",
    "fear_of_rejection": "Fear of Rejection",
    "self_doubt": "Self-Doubt",
    "people_pleasing": "People-Pleasing",
    "comfort_zone": "Comfort Zone Clinging",
    "overthinking": "Overthinking",
    "paradox_of_choice": "Paradox of Choice"
}


def tag_obstacle_themes(text: str) -> list:
    """Tag a reflection's obstacle text with matching themes."""
    text_lower = text.lower()
    matched = []
    for theme, keywords in OBSTACLE_THEMES.items():
        for kw in keywords:
            if kw in text_lower:
                matched.append(theme)
                break
    return matched


def generate_rules_based_insights(reflections: list, challenges: list) -> dict:
    """Generate weekly/monthly insights from reflections using rules-based analysis."""
    if not reflections:
        return {
            "has_data": False,
            "message": "Keep logging reflections to unlock pattern insights! You need at least 3 entries."
        }

    # Tag all reflections
    all_themes = []
    domain_counts = {}
    response_counts = Counter()
    weekly_counts = {}

    challenge_map = {c.get('_id') if hasattr(c.get('_id'), '__str__') else c.get('id', ''): c for c in challenges}

    for r in reflections:
        # Theme tagging
        themes = tag_obstacle_themes(r.get('obstacle', '') + ' ' + r.get('story', ''))
        all_themes.extend(themes)

        # Response tracking
        response_counts[r.get('response', 'unknown')] += 1

        # Domain tracking
        cid = r.get('challenge_id', '')
        challenge = challenge_map.get(cid)
        if challenge:
            domain = challenge.get('domain', 'General')
            domain_counts[domain] = domain_counts.get(domain, 0) + 1

        # Weekly tracking
        date_str = r.get('date', '')
        if date_str:
            try:
                d = datetime.strptime(date_str, '%Y-%m-%d')
                week_key = d.strftime('%Y-W%U')
                weekly_counts[week_key] = weekly_counts.get(week_key, 0) + 1
            except:
                pass

    # Top patterns
    theme_counter = Counter(all_themes)
    top_patterns = []
    for theme, count in theme_counter.most_common(5):
        top_patterns.append({
            "theme": theme,
            "label": THEME_LABELS.get(theme, theme),
            "count": count,
            "percentage": round((count / len(reflections)) * 100) if reflections else 0
        })

    # Growth indicators
    pushed_through = response_counts.get('pushed_through', 0)
    tried_failed = response_counts.get('tried_and_failed', 0)
    ran = response_counts.get('ran', 0)
    total_responses = pushed_through + tried_failed + ran
    courage_rate = round(((pushed_through + tried_failed) / total_responses) * 100) if total_responses > 0 else 0

    # Trend: are they improving? Compare first half vs second half
    half = len(reflections) // 2
    if half > 0:
        first_half_courage = sum(1 for r in reflections[half:] if r.get('response') in ['pushed_through', 'tried_and_failed'])
        second_half_courage = sum(1 for r in reflections[:half] if r.get('response') in ['pushed_through', 'tried_and_failed'])
        trend = "improving" if second_half_courage >= first_half_courage else "steady"
    else:
        trend = "just_starting"

    return {
        "has_data": True,
        "total_reflections": len(reflections),
        "top_patterns": top_patterns,
        "response_breakdown": {
            "pushed_through": pushed_through,
            "tried_and_failed": tried_failed,
            "ran": ran,
            "courage_rate": courage_rate
        },
        "domain_breakdown": domain_counts,
        "weekly_activity": weekly_counts,
        "trend": trend,
        "pattern_breaker_suggestion": generate_pattern_breaker(top_patterns, reflections) if top_patterns else None
    }


def generate_pattern_breaker(top_patterns: list, reflections: list) -> dict:
    """Generate a suggestion to break the user's top repeating pattern."""
    if not top_patterns:
        return None

    top = top_patterns[0]
    suggestions = {
        "fear_of_judgment": {
            "title": "Break the Judgment Loop",
            "suggestion": "Your biggest wall is worrying what others think. This week, try one thing where someone WILL see you mess up. The goal isn't to do it perfectly — it's to survive the judgment and realize it doesn't destroy you.",
            "micro_action": "Share one imperfect opinion in a conversation today."
        },
        "perfectionism": {
            "title": "Done Beats Perfect",
            "suggestion": "You keep hitting the perfectionism wall. This week, deliberately do something at 60% quality and ship it. A messy draft, a rough sketch, an imperfect email. Perfection is the enemy of progress.",
            "micro_action": "Submit, post, or share something you consider 'not ready yet.'"
        },
        "avoidance": {
            "title": "Face It for 60 Seconds",
            "suggestion": "You tend to avoid the hard things. This week, pick the ONE thing you've been avoiding longest and face it for just 60 seconds. You don't have to solve it — just look at it.",
            "micro_action": "Open the email, look at the bill, or start the conversation you've been dodging."
        },
        "fear_of_rejection": {
            "title": "Collect a No",
            "suggestion": "Rejection is your biggest fear. This week, deliberately put yourself in a position to hear 'no.' Ask for something you expect to be denied. Each 'no' makes the next one less scary.",
            "micro_action": "Ask for something you'd normally assume the answer is no."
        },
        "self_doubt": {
            "title": "Trust Your Attempt",
            "suggestion": "Self-doubt keeps telling you you're not enough. This week, take one action that says 'I trust myself enough to try.' You don't need to believe you'll succeed — just believe you deserve to attempt.",
            "micro_action": "Do one thing today that your doubt says you can't."
        },
        "people_pleasing": {
            "title": "Practice a Tiny No",
            "suggestion": "You keep saying yes when you mean no. This week, practice one small 'no' or 'not right now.' Disappointing someone for 5 minutes is better than disappointing yourself for 5 years.",
            "micro_action": "Decline one request that you'd normally accept out of guilt."
        },
        "comfort_zone": {
            "title": "One Step Outside",
            "suggestion": "Comfort zones feel safe but they're slowly shrinking your world. This week, do one thing that makes your stomach flutter. New restaurant, new route, new conversation. Small moves, big shifts.",
            "micro_action": "Do one familiar thing in a new way today."
        },
        "overthinking": {
            "title": "Act Before You Think",
            "suggestion": "Your brain loves to analyze everything to death. This week, when you catch yourself planning for more than 2 minutes, just start. Messy action beats perfect planning.",
            "micro_action": "Set a 2-minute timer. When it goes off, act on whatever you were deliberating."
        }
    }

    return suggestions.get(top['theme'], {
        "title": "Break Your Pattern",
        "suggestion": f"You've hit the '{top['label']}' wall {top['count']} times. This week, try approaching it from a completely different angle.",
        "micro_action": "Do the opposite of what you'd normally do when this pattern shows up."
    })


async def generate_ai_weekly_summary(reflections: list, patterns: dict, user_stage: int) -> str:
    """Generate an AI-powered empathetic weekly summary."""
    if not reflections or not API_KEY:
        return None

    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"weekly-summary-{datetime.now().isoformat()}",
            system_message="""You are the insight engine for "10 Million Mistakes" — an app celebrating failure as fuel for growth.
Write a brief, warm, encouraging weekly summary (3-4 sentences) based on the user's reflection data.
Be specific to their patterns. Never be preachy or clinical. Sound like a wise friend.
End with one sentence of encouragement that acknowledges their specific progress."""
        ).with_model("openai", "gpt-4.1")

        top_patterns_text = ", ".join([p['label'] for p in patterns.get('top_patterns', [])[:3]])
        courage_rate = patterns.get('response_breakdown', {}).get('courage_rate', 0)
        total = patterns.get('total_reflections', 0)

        recent_lessons = [r.get('lesson', '') for r in reflections[:5] if r.get('lesson')]

        msg = UserMessage(text=f"""Weekly summary for a Stage {user_stage} user:
- Total reflections this period: {total}
- Top recurring patterns: {top_patterns_text or 'None identified yet'}
- Courage rate (pushed through or tried): {courage_rate}%
- Recent lessons learned: {'; '.join(recent_lessons[:3]) if recent_lessons else 'None yet'}
- Trend: {patterns.get('trend', 'just_starting')}
""")

        response = await chat.send_message(msg)
        return response.strip()
    except Exception as e:
        print(f"AI weekly summary failed: {e}")
        return None
