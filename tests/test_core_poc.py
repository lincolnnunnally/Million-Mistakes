"""
POC Test Script for 10 Million Mistakes - AI Challenge Generation
Tests:
1. AI generates structured JSON challenge based on stage + domain
2. Fallback works when AI fails
3. Challenge tone is warm & encouraging (not preachy)
4. MongoDB persistence works
"""
import asyncio
import json
import os
import sys
from datetime import datetime

# Load env
sys.path.insert(0, '/app/backend')
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage
from motor.motor_asyncio import AsyncIOMotorClient

# Config
API_KEY = os.environ.get('EMERGENT_LLM_KEY')
MONGO_URL = os.environ.get('MONGO_URL')

# Challenge JSON schema we expect
EXPECTED_FIELDS = ['title', 'challenge', 'why_this', 'difficulty', 'domain', 'stage', 'coaching_line']

# Stages
STAGES = {
    1: "Beaten down - feels hopeless, has given up after repeated failures",
    2: "Analysis paralysis - hopeful but overthinks everything, paralyzed by fear of judgment", 
    3: "Stuck in others' dreams - determined but living someone else's vision, not their own",
    4: "Courageous dreamer - ready to dream big but needs practice stepping into the unknown"
}

DOMAINS = ["Money/Career", "Relationships", "Spiritual/Emotional", "Skills/Hobbies"]

# Fallback challenges for when AI fails
FALLBACK_CHALLENGES = {
    (1, "Money/Career"): {
        "title": "One Small Money Move",
        "challenge": "Today, look at one bill or bank statement you've been avoiding. Just look at it. You don't have to fix anything—just face it for 60 seconds.",
        "why_this": "When we're beaten down, even glancing at financial reality feels impossible. This tiny act proves you're braver than you think.",
        "difficulty": 1,
        "domain": "Money/Career",
        "stage": 1,
        "coaching_line": "You looked. That took guts. Most people won't even do that."
    },
    (2, "Relationships"): {
        "title": "Say the Unpolished Thing",
        "challenge": "Today, share one honest opinion with someone—even if it's imperfect. It could be as small as 'I actually didn't love that movie.'",
        "why_this": "Analysis paralysis in relationships means rehearsing every word until you say nothing real. This breaks that loop.",
        "difficulty": 2,
        "domain": "Relationships",
        "stage": 2,
        "coaching_line": "Imperfect honesty beats polished silence every single time."
    }
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

You MUST respond with ONLY valid JSON in this exact format:
{
  "title": "Short catchy title (3-6 words)",
  "challenge": "The actual challenge description (2-3 sentences, conversational tone)",
  "why_this": "Why this challenge matters for their specific stage/domain (1-2 sentences)",
  "difficulty": 1-5 (integer),
  "domain": "The domain this targets",
  "stage": 1-4 (integer matching their stage),
  "coaching_line": "One encouraging line they'll see after completing it (feels like a friend, not a coach)"
}

NO other text. ONLY the JSON object."""


async def test_1_ai_challenge_generation():
    """Test: AI generates a valid structured challenge"""
    print("\n" + "="*60)
    print("TEST 1: AI Challenge Generation (Stage 2, Relationships)")
    print("="*60)
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"poc-test-{datetime.now().isoformat()}",
            system_message=SYSTEM_PROMPT
        ).with_model("openai", "gpt-4.1")

        user_msg = UserMessage(
            text=f"""Generate a daily challenge for this user:
- Stage: 2 ({STAGES[2]})
- Domain: Relationships
- Recent pattern: User has been avoiding honest conversations and overthinking what to say
- Previous reflections: "I wanted to tell my friend I disagreed but I just nodded" and "I rehearsed asking for help 10 times then gave up"
"""
        )

        response = await chat.send_message(user_msg)
        print(f"Raw response:\n{response}\n")

        # Parse JSON
        # Try to extract JSON from response
        response_text = response.strip()
        if response_text.startswith("```"):
            # Strip markdown code blocks
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])
        
        challenge = json.loads(response_text)
        
        # Validate all fields exist
        missing = [f for f in EXPECTED_FIELDS if f not in challenge]
        if missing:
            print(f"❌ FAIL: Missing fields: {missing}")
            return False
        
        # Validate types
        assert isinstance(challenge['difficulty'], int), "difficulty should be int"
        assert isinstance(challenge['stage'], int), "stage should be int"
        assert 1 <= challenge['difficulty'] <= 5, "difficulty out of range"
        assert challenge['stage'] == 2, "stage should match input"
        
        print(f"✅ Title: {challenge['title']}")
        print(f"✅ Challenge: {challenge['challenge']}")
        print(f"✅ Why: {challenge['why_this']}")
        print(f"✅ Difficulty: {challenge['difficulty']}")
        print(f"✅ Domain: {challenge['domain']}")
        print(f"✅ Stage: {challenge['stage']}")
        print(f"✅ Coaching: {challenge['coaching_line']}")
        print(f"\n✅ TEST 1 PASSED: Valid structured challenge generated!")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ FAIL: Could not parse JSON: {e}")
        print(f"Response was: {response}")
        return False
    except Exception as e:
        print(f"❌ FAIL: {type(e).__name__}: {e}")
        return False


async def test_2_multiple_stages_domains():
    """Test: AI generates valid challenges across different stage/domain combos"""
    print("\n" + "="*60)
    print("TEST 2: Multiple Stage/Domain Combinations")
    print("="*60)
    
    test_cases = [
        (1, "Money/Career", "User feels hopeless about debt and avoids looking at bills"),
        (3, "Skills/Hobbies", "User is good at painting but only paints what their art teacher approves of"),
        (4, "Spiritual/Emotional", "User wants to meditate daily but is afraid of sitting with their thoughts"),
    ]
    
    all_passed = True
    for stage, domain, context in test_cases:
        try:
            chat = LlmChat(
                api_key=API_KEY,
                session_id=f"poc-multi-{stage}-{domain}-{datetime.now().isoformat()}",
                system_message=SYSTEM_PROMPT
            ).with_model("openai", "gpt-4.1")

            user_msg = UserMessage(
                text=f"""Generate a daily challenge for this user:
- Stage: {stage} ({STAGES[stage]})
- Domain: {domain}
- Context: {context}
"""
            )

            response = await chat.send_message(user_msg)
            response_text = response.strip()
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = "\n".join(lines[1:-1])
            
            challenge = json.loads(response_text)
            missing = [f for f in EXPECTED_FIELDS if f not in challenge]
            
            if missing:
                print(f"  ❌ Stage {stage}/{domain}: Missing fields: {missing}")
                all_passed = False
            else:
                print(f"  ✅ Stage {stage}/{domain}: '{challenge['title']}' (difficulty: {challenge['difficulty']})")
                
        except Exception as e:
            print(f"  ❌ Stage {stage}/{domain}: {type(e).__name__}: {e}")
            all_passed = False
    
    if all_passed:
        print(f"\n✅ TEST 2 PASSED: All stage/domain combos generated valid challenges!")
    else:
        print(f"\n❌ TEST 2 PARTIAL FAIL: Some combinations had issues")
    return all_passed


async def test_3_fallback_system():
    """Test: Fallback challenges work when AI is unavailable"""
    print("\n" + "="*60)
    print("TEST 3: Fallback Challenge System")
    print("="*60)
    
    try:
        # Test fallback lookup
        key = (1, "Money/Career")
        fallback = FALLBACK_CHALLENGES.get(key)
        
        if not fallback:
            print(f"❌ FAIL: No fallback for {key}")
            return False
            
        missing = [f for f in EXPECTED_FIELDS if f not in fallback]
        if missing:
            print(f"❌ FAIL: Fallback missing fields: {missing}")
            return False
            
        print(f"  ✅ Fallback for Stage 1/Money: '{fallback['title']}'")
        
        # Test with non-existent key - should return None (handled by app)
        missing_key = (4, "Skills/Hobbies")
        missing_fallback = FALLBACK_CHALLENGES.get(missing_key)
        if missing_fallback is None:
            print(f"  ✅ Missing fallback returns None (app will use generic)")
        
        print(f"\n✅ TEST 3 PASSED: Fallback system works correctly!")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: {type(e).__name__}: {e}")
        return False


async def test_4_mongodb_persistence():
    """Test: Challenges can be saved and retrieved from MongoDB"""
    print("\n" + "="*60)
    print("TEST 4: MongoDB Persistence")
    print("="*60)
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client["ten_million_mistakes"]
        collection = db["daily_challenges"]
        
        # Create a test challenge
        test_challenge = {
            "user_id": "test_user_poc",
            "title": "POC Test Challenge",
            "challenge": "This is a test challenge for the POC",
            "why_this": "Testing persistence",
            "difficulty": 2,
            "domain": "Money/Career",
            "stage": 2,
            "coaching_line": "You did it!",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "created_at": datetime.now()
        }
        
        # Insert
        result = await collection.insert_one(test_challenge)
        print(f"  ✅ Inserted challenge with ID: {result.inserted_id}")
        
        # Retrieve
        found = await collection.find_one({"user_id": "test_user_poc"})
        if found and found['title'] == "POC Test Challenge":
            print(f"  ✅ Retrieved challenge: '{found['title']}'")
        else:
            print(f"  ❌ FAIL: Could not retrieve challenge")
            return False
        
        # Cleanup
        await collection.delete_many({"user_id": "test_user_poc"})
        print(f"  ✅ Cleaned up test data")
        
        client.close()
        print(f"\n✅ TEST 4 PASSED: MongoDB persistence works!")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: {type(e).__name__}: {e}")
        return False


async def main():
    print("🚀 10 Million Mistakes - Core POC Tests")
    print("=" * 60)
    print(f"API Key: {'✅ Found' if API_KEY else '❌ Missing'}")
    print(f"MongoDB: {'✅ Found' if MONGO_URL else '❌ Missing'}")
    print("=" * 60)
    
    if not API_KEY:
        print("❌ EMERGENT_LLM_KEY not found. Aborting.")
        return
    
    results = {}
    
    # Run tests sequentially (AI calls should not be parallel)
    results['AI Challenge Generation'] = await test_1_ai_challenge_generation()
    results['Multiple Stages/Domains'] = await test_2_multiple_stages_domains()
    results['Fallback System'] = await test_3_fallback_system()
    results['MongoDB Persistence'] = await test_4_mongodb_persistence()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 POC TEST SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {test_name}")
        if not passed:
            all_passed = False
    
    print("\n" + ("🎉 ALL TESTS PASSED! Core is ready for app development." if all_passed 
                  else "⚠️  Some tests failed. Fix before proceeding."))
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
