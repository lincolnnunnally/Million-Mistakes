"""Seed data for 10 Million Mistakes app."""

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "When you think about trying something new, what's your first reaction?",
        "options": [
            {"text": "What's the point? I'll just fail again.", "stage": 1, "weight": 3},
            {"text": "I need to research everything first before I try.", "stage": 2, "weight": 3},
            {"text": "I'd love to, but I have responsibilities others expect of me.", "stage": 3, "weight": 3},
            {"text": "Exciting but terrifying — I want to but I hesitate.", "stage": 4, "weight": 3}
        ]
    },
    {
        "id": 2,
        "question": "How do you feel about your mistakes from the past year?",
        "options": [
            {"text": "They prove I'm not good enough.", "stage": 1, "weight": 3},
            {"text": "I replay them constantly, analyzing what went wrong.", "stage": 2, "weight": 3},
            {"text": "Most weren't even my choices — I was doing what others wanted.", "stage": 3, "weight": 3},
            {"text": "They stung, but I know they taught me something.", "stage": 4, "weight": 3}
        ]
    },
    {
        "id": 3,
        "question": "When someone asks 'What do you really want in life?' you think:",
        "options": [
            {"text": "I don't even know anymore. I've stopped dreaming.", "stage": 1, "weight": 3},
            {"text": "I have ideas, but I need the perfect plan before I start.", "stage": 2, "weight": 3},
            {"text": "I know what others want me to do, but my own answer feels selfish.", "stage": 3, "weight": 3},
            {"text": "I have a dream, but saying it out loud feels too risky.", "stage": 4, "weight": 3}
        ]
    },
    {
        "id": 4,
        "question": "What's your biggest fear about making a mistake?",
        "options": [
            {"text": "That it confirms I'm broken and can't succeed.", "stage": 1, "weight": 3},
            {"text": "That people will judge me or think I'm stupid.", "stage": 2, "weight": 3},
            {"text": "That I'll disappoint the people counting on me.", "stage": 3, "weight": 3},
            {"text": "That the dream I'm chasing might not work out.", "stage": 4, "weight": 3}
        ]
    },
    {
        "id": 5,
        "question": "Right now, your life feels like:",
        "options": [
            {"text": "I'm stuck in a hole and don't know how to climb out.", "stage": 1, "weight": 3},
            {"text": "I'm on the edge of something but can't take the leap.", "stage": 2, "weight": 3},
            {"text": "I'm moving, but in someone else's direction.", "stage": 3, "weight": 3},
            {"text": "I'm ready to run — I just need to pick a direction and go.", "stage": 4, "weight": 3}
        ]
    },
    {
        "id": 6,
        "question": "If you could change ONE thing about how you handle challenges:",
        "options": [
            {"text": "I'd stop giving up before I even start.", "stage": 1, "weight": 3},
            {"text": "I'd stop overthinking and just act.", "stage": 2, "weight": 3},
            {"text": "I'd start choosing my own challenges instead of others'.", "stage": 3, "weight": 3},
            {"text": "I'd stop waiting for the 'right moment' and just begin.", "stage": 4, "weight": 3}
        ]
    },
    {
        "id": 7,
        "question": "When you see someone else succeed, you usually think:",
        "options": [
            {"text": "Must be nice. That could never be me.", "stage": 1, "weight": 2},
            {"text": "I wonder exactly how they did it — I need that blueprint.", "stage": 2, "weight": 2},
            {"text": "Good for them. I wish I had the freedom to chase what I want.", "stage": 3, "weight": 2},
            {"text": "Inspiring. I'm close to making my own move.", "stage": 4, "weight": 2}
        ]
    },
    {
        "id": 8,
        "question": "The sentence that resonates most with you:",
        "options": [
            {"text": "I've been knocked down so many times, I stopped getting up.", "stage": 1, "weight": 3},
            {"text": "I know what to do, I just can't seem to start.", "stage": 2, "weight": 3},
            {"text": "I'm successful on paper, but it doesn't feel like MY success.", "stage": 3, "weight": 3},
            {"text": "I'm ready to bet on myself — I just need one push.", "stage": 4, "weight": 3}
        ]
    }
]

MANTRAS = [
    {"text": "Every expert was once a beginner who refused to quit.", "category": "persistence"},
    {"text": "Your mistakes are not your identity. They are your education.", "category": "identity"},
    {"text": "The only way to fail at this is to stop trying.", "category": "persistence"},
    {"text": "Perfection is a prison. Progress is freedom.", "category": "perfectionism"},
    {"text": "You don't need to be ready. You just need to be willing.", "category": "courage"},
    {"text": "Every mistake you make is one less standing between you and your potential.", "category": "growth"},
    {"text": "The people who win are the people who fail the most and keep going.", "category": "persistence"},
    {"text": "Fear means you're about to do something brave.", "category": "courage"},
    {"text": "You are not behind. You are exactly where your next mistake needs you to be.", "category": "identity"},
    {"text": "Messy action beats perfect planning every single time.", "category": "perfectionism"},
    {"text": "The world doesn't need you to be perfect. It needs you to be real.", "category": "identity"},
    {"text": "Today's mess is tomorrow's masterclass.", "category": "growth"},
    {"text": "You're not failing. You're collecting data on what works.", "category": "growth"},
    {"text": "Courage isn't the absence of fear. It's trying anyway.", "category": "courage"},
    {"text": "Your comfort zone has an expiration date. And it just expired.", "category": "courage"},
    {"text": "Done is better than perfect. Started is better than planned.", "category": "perfectionism"},
    {"text": "Every scar is a story of survival. Every mistake is a step forward.", "category": "persistence"},
    {"text": "You are allowed to be a work in progress and a masterpiece at the same time.", "category": "identity"},
    {"text": "The pain of staying stuck is worse than the pain of getting it wrong.", "category": "courage"},
    {"text": "You've already survived 100% of your worst days. You can survive this too.", "category": "persistence"},
    {"text": "Stop rehearsing your life. Start living it.", "category": "perfectionism"},
    {"text": "The best time to start was yesterday. The second best time is this messy, imperfect moment.", "category": "growth"},
    {"text": "What if the mistake you're avoiding is the lesson you need most?", "category": "growth"},
    {"text": "You are not your worst attempt. You are the courage it took to try.", "category": "identity"},
    {"text": "Progress looks like a mess from the inside. Keep going.", "category": "persistence"},
    {"text": "The goal isn't to never fall. It's to get back up one more time than you fall.", "category": "persistence"},
    {"text": "Burn through your mistakes faster. Each one brings you closer.", "category": "growth"},
    {"text": "You don't need permission to try. You just need the guts to begin.", "category": "courage"},
    {"text": "Failure is not the opposite of success. It's the road that leads to it.", "category": "growth"},
    {"text": "Ten million mistakes to make. Might as well start burning through them now.", "category": "growth"}
]

STAGE_DESCRIPTIONS = {
    1: {
        "name": "Beaten Down",
        "tagline": "You've been knocked down, but you're still here.",
        "description": "You've experienced so many setbacks that hope feels distant. The fear of failing again keeps you from trying. But here's the truth: showing up today took more courage than you realize.",
        "focus": "Rebuilding belief through tiny, safe experiments",
        "icon": "seedling"
    },
    2: {
        "name": "Analysis Paralysis",
        "tagline": "You know what to do. You just can't seem to start.",
        "description": "You're smart, capable, and full of potential. But overthinking has become your comfort zone. You research, plan, and prepare — but the perfect moment never comes. It's time to embrace imperfect action.",
        "focus": "Breaking the overthinking loop with messy action",
        "icon": "brain"
    },
    3: {
        "name": "Stuck in Others' Dreams",
        "tagline": "You're moving — but in someone else's direction.",
        "description": "You have determination and drive, but it's been pointed at goals that aren't truly yours. Family expectations, social pressure, or habit have you building someone else's life. It's time to find your own path.",
        "focus": "Discovering and owning your authentic direction",
        "icon": "compass"
    },
    4: {
        "name": "Courageous Dreamer",
        "tagline": "You're ready to bet on yourself.",
        "description": "You have the vision and the fire. You know what you want and you're almost ready to go for it. The only thing between you and your dream is the willingness to fail publicly and keep going. Let's practice that.",
        "focus": "Taking bold public action and building resilience",
        "icon": "rocket"
    }
}

DOMAINS = [
    {
        "id": "money_career",
        "name": "Money / Career",
        "icon": "briefcase",
        "description": "Your financial life, job, business, or professional growth",
        "color": "#FF6B35"
    },
    {
        "id": "relationships",
        "name": "Relationships",
        "icon": "heart",
        "description": "Friendships, family, romantic connections, and social life",
        "color": "#0F766E"
    },
    {
        "id": "spiritual_emotional",
        "name": "Spiritual / Emotional",
        "icon": "sun",
        "description": "Inner peace, self-awareness, faith, mental health, and emotional growth",
        "color": "#FFD166"
    },
    {
        "id": "skills_hobbies",
        "name": "Skills / Hobbies",
        "icon": "palette",
        "description": "Creative pursuits, learning new skills, personal projects, and passions",
        "color": "#0B7285"
    }
]

LEVELS = [
    {"level": 1, "name": "Mistake Newbie", "min_mistakes": 0, "badge": "spark"},
    {"level": 2, "name": "Brave Beginner", "min_mistakes": 5, "badge": "flame"},
    {"level": 3, "name": "Failure Fighter", "min_mistakes": 15, "badge": "fire"},
    {"level": 4, "name": "Mess Maker", "min_mistakes": 30, "badge": "bonfire"},
    {"level": 5, "name": "Chaos Champion", "min_mistakes": 50, "badge": "lightning"},
    {"level": 6, "name": "Resilience Warrior", "min_mistakes": 75, "badge": "shield"},
    {"level": 7, "name": "Growth Machine", "min_mistakes": 100, "badge": "gear"},
    {"level": 8, "name": "Mistake Master", "min_mistakes": 150, "badge": "crown"},
    {"level": 9, "name": "Fearless Pioneer", "min_mistakes": 250, "badge": "compass"},
    {"level": 10, "name": "10M Legend", "min_mistakes": 500, "badge": "star"}
]

ENCOURAGEMENTS = [
    "You just burned another mistake. Progress = unlocked!",
    "That's one more down, and you're stronger for it.",
    "Another mistake logged, another lesson earned. Keep going!",
    "You showed up today. That alone puts you ahead of 90% of people.",
    "Fear tried to stop you. You didn't let it.",
    "Every entry here is proof you're braver than you feel.",
    "This mess? It's building your masterpiece.",
    "Mistake burned. Wisdom gained. You're on fire.",
    "The fact that you tried? That's everything.",
    "You're not collecting failures. You're collecting fuel."
]
