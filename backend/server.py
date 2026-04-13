"""10 Million Mistakes - Backend Server"""
import os
import json
import random
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional
from contextlib import asynccontextmanager

import jwt
import bcrypt
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from ai_service import generate_challenge, get_fallback_challenge
from seed_data import (
    QUIZ_QUESTIONS, MANTRAS, STAGE_DESCRIPTIONS, DOMAINS,
    LEVELS, ENCOURAGEMENTS
)

# Config
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = 'ten_million_mistakes'
JWT_SECRET = os.environ.get('JWT_SECRET', 'tmm-secret-key-change-in-production-2024')
JWT_ALGORITHM = 'HS256'

# DB client
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed data
    await seed_initial_data()
    yield
    client.close()

app = FastAPI(title="10 Million Mistakes API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== HELPERS ==============

def serialize_doc(doc):
    """Convert MongoDB doc to JSON-safe dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == '_id':
            result['id'] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_doc(item) if isinstance(item, dict) else str(item) if isinstance(item, ObjectId) else item.isoformat() if isinstance(item, datetime) else item for item in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result


def create_token(user_id: str, role: str = "user"):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["user_id"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return serialize_doc(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_admin_user(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def calculate_level(total_mistakes: int):
    """Determine user level based on total mistakes."""
    current_level = LEVELS[0]
    for level in LEVELS:
        if total_mistakes >= level['min_mistakes']:
            current_level = level
    next_level = None
    for level in LEVELS:
        if level['min_mistakes'] > total_mistakes:
            next_level = level
            break
    return current_level, next_level


def calculate_streak(reflections: list):
    """Calculate consecutive days streak."""
    if not reflections:
        return 0
    dates = sorted(set([r.get('date', r.get('created_at', datetime.now()).strftime('%Y-%m-%d') if isinstance(r.get('created_at'), datetime) else str(r.get('created_at', ''))[:10]) for r in reflections]), reverse=True)
    if not dates:
        return 0
    today = datetime.now().strftime('%Y-%m-%d')
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    if dates[0] != today and dates[0] != yesterday:
        return 0
    streak = 1
    for i in range(1, len(dates)):
        try:
            d1 = datetime.strptime(dates[i-1], '%Y-%m-%d')
            d2 = datetime.strptime(dates[i], '%Y-%m-%d')
            if (d1 - d2).days == 1:
                streak += 1
            else:
                break
        except:
            break
    return streak


async def seed_initial_data():
    """Seed mantras and create default admin if not exists."""
    # Seed mantras
    count = await db.mantras.count_documents({})
    if count == 0:
        for m in MANTRAS:
            m['created_at'] = datetime.now()
            m['active'] = True
        await db.mantras.insert_many(MANTRAS)
        print(f"Seeded {len(MANTRAS)} mantras")

    # Create default admin
    admin = await db.users.find_one({"email": "admin@10mmistakes.com"})
    if not admin:
        hashed = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        await db.users.insert_one({
            "email": "admin@10mmistakes.com",
            "password": hashed.decode('utf-8'),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now()
        })
        print("Created default admin: admin@10mmistakes.com / admin123")


# ============== PYDANTIC MODELS ==============

class RegisterInput(BaseModel):
    email: str
    password: str
    name: str

class LoginInput(BaseModel):
    email: str
    password: str

class OnboardingInput(BaseModel):
    quiz_answers: list  # list of {question_id, selected_option_index}
    domains: list  # list of domain ids

class ReflectionInput(BaseModel):
    challenge_id: str
    obstacle: str  # Q1: What obstacle showed up?
    response: str  # Q2: did you run, push through, or try and fail?
    story: str  # Q3: what actually happened?
    lesson: str  # Q4: what did you learn?

class MantraInput(BaseModel):
    text: str
    category: str = "general"


# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/register")
async def register(data: RegisterInput):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt())
    user = {
        "email": data.email.lower(),
        "password": hashed.decode('utf-8'),
        "name": data.name,
        "role": "user",
        "stage": None,
        "domains": [],
        "onboarded": False,
        "total_mistakes": 0,
        "saved_mantras": [],
        "created_at": datetime.now()
    }
    result = await db.users.insert_one(user)
    token = create_token(str(result.inserted_id))
    user['_id'] = result.inserted_id
    safe_user = serialize_doc(user)
    safe_user.pop('password', None)
    return {"token": token, "user": safe_user}


@app.post("/api/auth/login")
async def login(data: LoginInput):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not bcrypt.checkpw(data.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(str(user['_id']), user.get('role', 'user'))
    safe_user = serialize_doc(user)
    safe_user.pop('password', None)
    return {"token": token, "user": safe_user}


@app.get("/api/auth/me")
async def get_me(user=Depends(get_current_user)):
    user.pop('password', None)
    return {"user": user}


# ============== ONBOARDING ENDPOINTS ==============

@app.get("/api/onboarding/quiz")
async def get_quiz():
    return {"questions": QUIZ_QUESTIONS, "stages": STAGE_DESCRIPTIONS, "domains": DOMAINS}


@app.post("/api/onboarding/complete")
async def complete_onboarding(data: OnboardingInput, user=Depends(get_current_user)):
    # Calculate stage from quiz answers
    stage_scores = {1: 0, 2: 0, 3: 0, 4: 0}
    for answer in data.quiz_answers:
        q_id = answer.get('question_id')
        opt_idx = answer.get('selected_option_index')
        question = next((q for q in QUIZ_QUESTIONS if q['id'] == q_id), None)
        if question and 0 <= opt_idx < len(question['options']):
            option = question['options'][opt_idx]
            stage_scores[option['stage']] += option['weight']

    # Determine dominant stage
    stage = max(stage_scores, key=stage_scores.get)
    stage_info = STAGE_DESCRIPTIONS.get(stage, {})

    # Convert stage_scores keys to strings for MongoDB
    stage_scores_str = {str(k): v for k, v in stage_scores.items()}

    # Update user
    await db.users.update_one(
        {"_id": ObjectId(user['id'])},
        {"$set": {
            "stage": stage,
            "domains": data.domains,
            "onboarded": True,
            "stage_scores": stage_scores_str,
            "onboarded_at": datetime.now()
        }}
    )

    return {
        "stage": stage,
        "stage_info": stage_info,
        "domains": data.domains,
        "message": f"Welcome to Stage {stage}: {stage_info.get('name', '')}!"
    }


# ============== CHALLENGE ENDPOINTS ==============

@app.get("/api/challenge/today")
async def get_todays_challenge(user=Depends(get_current_user)):
    today = datetime.now().strftime('%Y-%m-%d')
    user_id = user['id']

    # Check if user has completed onboarding
    if not user.get('onboarded', False):
        raise HTTPException(status_code=400, detail="Please complete onboarding first")

    # Check if today's challenge already exists
    existing = await db.challenges.find_one({"user_id": user_id, "date": today})
    if existing:
        return {"challenge": serialize_doc(existing), "is_new": False}

    # Generate new challenge
    stage = user.get('stage', 2)
    domains = user.get('domains', ['money_career'])
    
    # Ensure domains is not empty
    if not domains:
        domains = ['money_career']
    
    domain_map = {d['id']: d['name'] for d in DOMAINS}
    domain = domain_map.get(random.choice(domains), 'Money/Career')

    # Get recent reflections for context
    recent = await db.reflections.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(3).to_list(3)

    challenge_data = await generate_challenge(stage, domain, recent)

    # Save to DB
    challenge_doc = {
        **challenge_data,
        "user_id": user_id,
        "date": today,
        "completed": False,
        "created_at": datetime.now()
    }
    result = await db.challenges.insert_one(challenge_doc)
    challenge_doc['_id'] = result.inserted_id

    return {"challenge": serialize_doc(challenge_doc), "is_new": True}


@app.post("/api/challenge/swap")
async def swap_challenge(user=Depends(get_current_user)):
    """Get a different challenge for today."""
    today = datetime.now().strftime('%Y-%m-%d')
    user_id = user['id']

    # Check if user has completed onboarding
    if not user.get('onboarded', False):
        raise HTTPException(status_code=400, detail="Please complete onboarding first")

    # Delete today's existing challenge
    await db.challenges.delete_many({"user_id": user_id, "date": today})

    # Generate new one with a different domain
    stage = user.get('stage', 2)
    domains = user.get('domains', ['money_career'])
    
    # Ensure domains is not empty
    if not domains:
        domains = ['money_career']
    
    domain_map = {d['id']: d['name'] for d in DOMAINS}
    domain = domain_map.get(random.choice(domains), 'Money/Career')

    challenge_data = await generate_challenge(stage, domain)
    challenge_doc = {
        **challenge_data,
        "user_id": user_id,
        "date": today,
        "completed": False,
        "created_at": datetime.now()
    }
    result = await db.challenges.insert_one(challenge_doc)
    challenge_doc['_id'] = result.inserted_id

    return {"challenge": serialize_doc(challenge_doc)}


# ============== REFLECTION ENDPOINTS ==============

@app.post("/api/reflections")
async def create_reflection(data: ReflectionInput, user=Depends(get_current_user)):
    user_id = user['id']
    today = datetime.now().strftime('%Y-%m-%d')

    reflection = {
        "user_id": user_id,
        "challenge_id": data.challenge_id,
        "obstacle": data.obstacle,
        "response": data.response,
        "story": data.story,
        "lesson": data.lesson,
        "date": today,
        "created_at": datetime.now()
    }
    result = await db.reflections.insert_one(reflection)

    # Mark challenge as completed
    await db.challenges.update_one(
        {"_id": ObjectId(data.challenge_id)},
        {"$set": {"completed": True, "completed_at": datetime.now()}}
    )

    # Increment user's mistake count
    update_result = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$inc": {"total_mistakes": 1}},
        return_document=True
    )
    new_total = update_result.get('total_mistakes', 1) if update_result else 1
    current_level, next_level = calculate_level(new_total)

    # Get encouragement
    encouragement = random.choice(ENCOURAGEMENTS)

    return {
        "reflection": serialize_doc({**reflection, "_id": result.inserted_id}),
        "total_mistakes": new_total,
        "current_level": current_level,
        "next_level": next_level,
        "encouragement": encouragement
    }


@app.get("/api/reflections")
async def get_reflections(user=Depends(get_current_user), limit: int = 20, skip: int = 0):
    user_id = user['id']
    cursor = db.reflections.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    reflections = await cursor.to_list(limit)
    total = await db.reflections.count_documents({"user_id": user_id})
    return {
        "reflections": [serialize_doc(r) for r in reflections],
        "total": total
    }


# ============== VAULT ENDPOINTS ==============

@app.get("/api/vault")
async def get_vault(user=Depends(get_current_user), limit: int = 50, skip: int = 0):
    """Victory Vault — all lessons learned."""
    user_id = user['id']
    cursor = db.reflections.find(
        {"user_id": user_id, "lesson": {"$ne": ""}}
    ).sort("created_at", -1).skip(skip).limit(limit)
    reflections = await cursor.to_list(limit)
    total = await db.reflections.count_documents({"user_id": user_id, "lesson": {"$ne": ""}})

    vault_entries = []
    for r in reflections:
        entry = serialize_doc(r)
        # Get the challenge title for context
        if r.get('challenge_id'):
            try:
                challenge = await db.challenges.find_one({"_id": ObjectId(r['challenge_id'])})
                if challenge:
                    entry['challenge_title'] = challenge.get('title', 'Unknown Challenge')
            except:
                pass
        vault_entries.append(entry)

    return {"vault": vault_entries, "total": total}


# ============== PROGRESS ENDPOINTS ==============

@app.get("/api/progress")
async def get_progress(user=Depends(get_current_user)):
    user_id = user['id']
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    total_mistakes = user_doc.get('total_mistakes', 0) if user_doc else 0
    current_level, next_level = calculate_level(total_mistakes)

    # Get reflections for streak calc
    reflections = await db.reflections.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(365)
    streak = calculate_streak(reflections)

    # Get domain breakdown
    domain_counts = {}
    for r in reflections:
        if r.get('challenge_id'):
            try:
                challenge = await db.challenges.find_one({"_id": ObjectId(r['challenge_id'])})
                if challenge:
                    d = challenge.get('domain', 'General')
                    domain_counts[d] = domain_counts.get(d, 0) + 1
            except:
                pass

    # Get dates with reflections for calendar
    active_dates = list(set([r.get('date', '') for r in reflections]))

    return {
        "total_mistakes": total_mistakes,
        "current_level": current_level,
        "next_level": next_level,
        "streak": streak,
        "domain_breakdown": domain_counts,
        "active_dates": active_dates,
        "total_reflections": len(reflections),
        "levels": LEVELS
    }


# ============== MANTRAS ENDPOINTS ==============

@app.get("/api/mantras")
async def get_mantras(user=Depends(get_current_user)):
    mantras = await db.mantras.find({"active": True}).to_list(100)
    saved_ids = user.get('saved_mantras', [])
    result = []
    for m in mantras:
        doc = serialize_doc(m)
        doc['saved'] = doc.get('id', '') in saved_ids
        result.append(doc)
    random.shuffle(result)
    return {"mantras": result[:10]}  # Return 10 random mantras


@app.post("/api/mantras/{mantra_id}/save")
async def toggle_save_mantra(mantra_id: str, user=Depends(get_current_user)):
    saved = user.get('saved_mantras', [])
    if mantra_id in saved:
        saved.remove(mantra_id)
        action = 'unsaved'
    else:
        saved.append(mantra_id)
        action = 'saved'
    await db.users.update_one(
        {"_id": ObjectId(user['id'])},
        {"$set": {"saved_mantras": saved}}
    )
    return {"action": action, "saved_mantras": saved}


@app.get("/api/mantras/saved")
async def get_saved_mantras(user=Depends(get_current_user)):
    saved_ids = user.get('saved_mantras', [])
    if not saved_ids:
        return {"mantras": []}
    mantras = []
    for mid in saved_ids:
        try:
            m = await db.mantras.find_one({"_id": ObjectId(mid)})
            if m:
                doc = serialize_doc(m)
                doc['saved'] = True
                mantras.append(doc)
        except:
            pass
    return {"mantras": mantras}


# ============== ADMIN ENDPOINTS ==============

@app.get("/api/admin/stats")
async def admin_stats(user=Depends(get_admin_user)):
    total_users = await db.users.count_documents({"role": "user"})
    total_reflections = await db.reflections.count_documents({})
    total_challenges = await db.challenges.count_documents({})
    total_mantras = await db.mantras.count_documents({})

    # Users by stage
    stage_counts = {}
    for stage in [1, 2, 3, 4]:
        count = await db.users.count_documents({"stage": stage, "role": "user"})
        stage_counts[str(stage)] = count
    unassigned = await db.users.count_documents({"stage": None, "role": "user"})
    stage_counts["unassigned"] = unassigned

    # Recent activity
    today = datetime.now().strftime('%Y-%m-%d')
    todays_reflections = await db.reflections.count_documents({"date": today})

    return {
        "total_users": total_users,
        "total_reflections": total_reflections,
        "total_challenges": total_challenges,
        "total_mantras": total_mantras,
        "users_by_stage": stage_counts,
        "todays_reflections": todays_reflections
    }


@app.get("/api/admin/users")
async def admin_users(user=Depends(get_admin_user), skip: int = 0, limit: int = 50):
    cursor = db.users.find({"role": "user"}).sort("created_at", -1).skip(skip).limit(limit)
    users = await cursor.to_list(limit)
    total = await db.users.count_documents({"role": "user"})
    return {
        "users": [serialize_doc(u) for u in users],
        "total": total
    }


@app.get("/api/admin/users/{user_id}")
async def admin_user_detail(user_id: str, user=Depends(get_admin_user)):
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    reflections = await db.reflections.find({"user_id": user_id}).sort("created_at", -1).to_list(50)
    challenges = await db.challenges.find({"user_id": user_id}).sort("created_at", -1).to_list(50)
    return {
        "user": serialize_doc(target),
        "reflections": [serialize_doc(r) for r in reflections],
        "challenges": [serialize_doc(c) for c in challenges]
    }


@app.get("/api/admin/mantras")
async def admin_get_mantras(user=Depends(get_admin_user)):
    mantras = await db.mantras.find().sort("created_at", -1).to_list(200)
    return {"mantras": [serialize_doc(m) for m in mantras]}


@app.post("/api/admin/mantras")
async def admin_create_mantra(data: MantraInput, user=Depends(get_admin_user)):
    mantra = {
        "text": data.text,
        "category": data.category,
        "active": True,
        "created_at": datetime.now()
    }
    result = await db.mantras.insert_one(mantra)
    mantra['_id'] = result.inserted_id
    return {"mantra": serialize_doc(mantra)}


@app.put("/api/admin/mantras/{mantra_id}")
async def admin_update_mantra(mantra_id: str, data: MantraInput, user=Depends(get_admin_user)):
    await db.mantras.update_one(
        {"_id": ObjectId(mantra_id)},
        {"$set": {"text": data.text, "category": data.category}}
    )
    updated = await db.mantras.find_one({"_id": ObjectId(mantra_id)})
    return {"mantra": serialize_doc(updated)}


@app.delete("/api/admin/mantras/{mantra_id}")
async def admin_delete_mantra(mantra_id: str, user=Depends(get_admin_user)):
    await db.mantras.delete_one({"_id": ObjectId(mantra_id)})
    return {"deleted": True}


@app.get("/api/admin/reflections")
async def admin_get_reflections(user=Depends(get_admin_user), skip: int = 0, limit: int = 50):
    cursor = db.reflections.find().sort("created_at", -1).skip(skip).limit(limit)
    reflections = await cursor.to_list(limit)
    total = await db.reflections.count_documents({})
    return {
        "reflections": [serialize_doc(r) for r in reflections],
        "total": total
    }


# ============== HEALTH ==============

@app.get("/api/health")
async def health():
    return {"status": "healthy", "app": "10 Million Mistakes", "version": "1.0.0"}
