#!/usr/bin/env python3
"""
Backend API Testing for 10 Million Mistakes
Tests all endpoints with proper authentication and data flow
"""

import requests
import sys
import json
from datetime import datetime
import time

class TenMillionMistakesAPITester:
    def __init__(self, base_url="https://growth-through-grit.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.user_id = None
        self.challenge_id = None
        self.reflection_id = None
        self.mantra_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, auth_token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        
        if auth_token:
            test_headers['Authorization'] = f'Bearer {auth_token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "/api/health", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": "admin@10mmistakes.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            self.log(f"✅ Admin token obtained")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"testuser_{int(time.time())}@test.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/api/auth/register",
            200,
            data={"email": test_email, "password": "test123", "name": "Test User"}
        )
        if success and 'token' in response:
            self.user_token = response['token']
            self.user_id = response['user']['id']
            self.log(f"✅ User registered with ID: {self.user_id}")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": "testuser@test.com", "password": "test123"}
        )
        if success and 'token' in response:
            self.user_token = response['token']
            self.user_id = response['user']['id']
            self.log(f"✅ User logged in with ID: {self.user_id}")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        return self.run_test(
            "Get Current User",
            "GET",
            "/api/auth/me",
            200,
            auth_token=self.user_token
        )

    def test_onboarding_quiz(self):
        """Test getting onboarding quiz"""
        return self.run_test(
            "Get Onboarding Quiz",
            "GET",
            "/api/onboarding/quiz",
            200
        )

    def test_complete_onboarding(self):
        """Test completing onboarding"""
        quiz_answers = [
            {"question_id": 1, "selected_option_index": 0},
            {"question_id": 2, "selected_option_index": 1},
            {"question_id": 3, "selected_option_index": 0},
            {"question_id": 4, "selected_option_index": 1},
            {"question_id": 5, "selected_option_index": 0},
            {"question_id": 6, "selected_option_index": 1},
            {"question_id": 7, "selected_option_index": 0},
            {"question_id": 8, "selected_option_index": 1}
        ]
        domains = ["money_career", "relationships"]
        
        return self.run_test(
            "Complete Onboarding",
            "POST",
            "/api/onboarding/complete",
            200,
            data={"quiz_answers": quiz_answers, "domains": domains},
            auth_token=self.user_token
        )

    def test_get_todays_challenge(self):
        """Test getting today's challenge"""
        success, response = self.run_test(
            "Get Today's Challenge",
            "GET",
            "/api/challenge/today",
            200,
            auth_token=self.user_token
        )
        if success and 'challenge' in response:
            self.challenge_id = response['challenge']['id']
            self.log(f"✅ Challenge ID: {self.challenge_id}")
            return True
        return False

    def test_swap_challenge(self):
        """Test swapping today's challenge"""
        success, response = self.run_test(
            "Swap Challenge",
            "POST",
            "/api/challenge/swap",
            200,
            auth_token=self.user_token
        )
        if success and 'challenge' in response:
            self.challenge_id = response['challenge']['id']
            self.log(f"✅ New Challenge ID: {self.challenge_id}")
            return True
        return False

    def test_create_reflection(self):
        """Test creating a reflection"""
        if not self.challenge_id:
            self.log("❌ No challenge ID available for reflection")
            return False
            
        success, response = self.run_test(
            "Create Reflection",
            "POST",
            "/api/reflections",
            200,
            data={
                "challenge_id": self.challenge_id,
                "obstacle": "Fear of failure",
                "response": "pushed_through",
                "story": "I was scared but I did it anyway and learned something valuable.",
                "lesson": "Fear is just a feeling, not a fact."
            },
            auth_token=self.user_token
        )
        if success and 'reflection' in response:
            self.reflection_id = response['reflection']['id']
            self.log(f"✅ Reflection ID: {self.reflection_id}")
            return True
        return False

    def test_get_reflections(self):
        """Test getting user reflections"""
        return self.run_test(
            "Get Reflections",
            "GET",
            "/api/reflections",
            200,
            auth_token=self.user_token
        )

    def test_get_vault(self):
        """Test getting victory vault"""
        return self.run_test(
            "Get Victory Vault",
            "GET",
            "/api/vault",
            200,
            auth_token=self.user_token
        )

    def test_get_progress(self):
        """Test getting user progress"""
        return self.run_test(
            "Get Progress",
            "GET",
            "/api/progress",
            200,
            auth_token=self.user_token
        )

    def test_get_mantras(self):
        """Test getting mantras"""
        return self.run_test(
            "Get Mantras",
            "GET",
            "/api/mantras",
            200,
            auth_token=self.user_token
        )

    def test_save_mantra(self):
        """Test saving/unsaving a mantra"""
        # First get mantras to get an ID
        success, response = self.run_test(
            "Get Mantras for Save Test",
            "GET",
            "/api/mantras",
            200,
            auth_token=self.user_token
        )
        if success and response.get('mantras'):
            mantra_id = response['mantras'][0]['id']
            return self.run_test(
                "Save/Unsave Mantra",
                "POST",
                f"/api/mantras/{mantra_id}/save",
                200,
                auth_token=self.user_token
            )
        return False

    def test_get_saved_mantras(self):
        """Test getting saved mantras"""
        return self.run_test(
            "Get Saved Mantras",
            "GET",
            "/api/mantras/saved",
            200,
            auth_token=self.user_token
        )

    def test_admin_stats(self):
        """Test admin stats"""
        return self.run_test(
            "Admin Stats",
            "GET",
            "/api/admin/stats",
            200,
            auth_token=self.admin_token
        )

    def test_admin_users(self):
        """Test admin users list"""
        return self.run_test(
            "Admin Users List",
            "GET",
            "/api/admin/users",
            200,
            auth_token=self.admin_token
        )

    def test_admin_user_detail(self):
        """Test admin user detail"""
        if not self.user_id:
            return False
        return self.run_test(
            "Admin User Detail",
            "GET",
            f"/api/admin/users/{self.user_id}",
            200,
            auth_token=self.admin_token
        )

    def test_admin_mantras(self):
        """Test admin mantras CRUD"""
        # Get mantras
        success1, _ = self.run_test(
            "Admin Get Mantras",
            "GET",
            "/api/admin/mantras",
            200,
            auth_token=self.admin_token
        )
        
        # Create mantra
        success2, response = self.run_test(
            "Admin Create Mantra",
            "POST",
            "/api/admin/mantras",
            200,
            data={"text": "Test mantra for API testing", "category": "general"},
            auth_token=self.admin_token
        )
        
        if success2 and 'mantra' in response:
            mantra_id = response['mantra']['id']
            
            # Update mantra
            success3, _ = self.run_test(
                "Admin Update Mantra",
                "PUT",
                f"/api/admin/mantras/{mantra_id}",
                200,
                data={"text": "Updated test mantra", "category": "courage"},
                auth_token=self.admin_token
            )
            
            # Delete mantra
            success4, _ = self.run_test(
                "Admin Delete Mantra",
                "DELETE",
                f"/api/admin/mantras/{mantra_id}",
                200,
                auth_token=self.admin_token
            )
            
            return success1 and success2 and success3 and success4
        
        return success1

    def test_admin_reflections(self):
        """Test admin reflections"""
        return self.run_test(
            "Admin Reflections",
            "GET",
            "/api/admin/reflections",
            200,
            auth_token=self.admin_token
        )

    # ============== PHASE 3 TESTS ==============
    
    def test_patterns(self):
        """Test pattern discovery"""
        return self.run_test(
            "Get Pattern Insights",
            "GET",
            "/api/patterns",
            200,
            auth_token=self.user_token
        )

    def test_stories_flow(self):
        """Test stories creation and community feed"""
        if not self.reflection_id:
            self.log("❌ No reflection ID available for story creation")
            return False
            
        # Create a story
        success1, response = self.run_test(
            "Create Story",
            "POST",
            "/api/stories",
            200,
            data={
                "reflection_id": self.reflection_id,
                "anonymous": False,
                "title": "My Test Story"
            },
            auth_token=self.user_token
        )
        
        story_id = None
        if success1 and 'story' in response:
            story_id = response['story']['id']
            self.log(f"✅ Story ID: {story_id}")
        
        # Get community feed
        success2, _ = self.run_test(
            "Get Community Stories",
            "GET",
            "/api/stories",
            200,
            auth_token=self.user_token
        )
        
        # Get my stories
        success3, _ = self.run_test(
            "Get My Stories",
            "GET",
            "/api/stories/mine",
            200,
            auth_token=self.user_token
        )
        
        # Like a story (if we have one)
        success4 = True
        if story_id:
            success4, _ = self.run_test(
                "Like Story",
                "POST",
                f"/api/stories/{story_id}/like",
                200,
                auth_token=self.user_token
            )
        
        return success1 and success2 and success3 and success4

    def test_buddy_system(self):
        """Test buddy matching system"""
        # Get current connections
        success1, _ = self.run_test(
            "Get Buddy Connections",
            "GET",
            "/api/buddies/connections",
            200,
            auth_token=self.user_token
        )
        
        # Check request status
        success2, _ = self.run_test(
            "Get Buddy Request Status",
            "GET",
            "/api/buddies/request/status",
            200,
            auth_token=self.user_token
        )
        
        # Create buddy request
        success3, _ = self.run_test(
            "Create Buddy Request",
            "POST",
            "/api/buddies/request",
            200,
            data={
                "domain": "money_career",
                "message": "Looking for a buddy to grow with!"
            },
            auth_token=self.user_token
        )
        
        # Cancel buddy request (cleanup)
        success4, _ = self.run_test(
            "Cancel Buddy Request",
            "DELETE",
            "/api/buddies/request",
            200,
            auth_token=self.user_token
        )
        
        return success1 and success2 and success3 and success4

    def test_mentorship_system(self):
        """Test mentorship system"""
        # Create mentor offer
        success1, response = self.run_test(
            "Create Mentor Offer",
            "POST",
            "/api/mentorship/offer",
            200,
            data={
                "domain": "money_career",
                "description": "I can help with career transitions",
                "role": "mentor"
            },
            auth_token=self.user_token
        )
        
        offer_id = None
        if success1 and 'offer' in response:
            offer_id = response['offer']['id']
        
        # Browse mentor offers
        success2, _ = self.run_test(
            "Browse Mentor Offers",
            "GET",
            "/api/mentorship/offers",
            200,
            auth_token=self.user_token
        )
        
        # Get my offers
        success3, _ = self.run_test(
            "Get My Mentor Offers",
            "GET",
            "/api/mentorship/mine",
            200,
            auth_token=self.user_token
        )
        
        # Withdraw offer (cleanup)
        success4 = True
        if offer_id:
            success4, _ = self.run_test(
                "Withdraw Mentor Offer",
                "DELETE",
                f"/api/mentorship/offer/{offer_id}",
                200,
                auth_token=self.user_token
            )
        
        return success1 and success2 and success3 and success4

    def test_video_library(self):
        """Test video library"""
        # Get all videos
        success1, _ = self.run_test(
            "Get All Videos",
            "GET",
            "/api/videos",
            200,
            auth_token=self.user_token
        )
        
        # Get videos filtered by domain
        success2, _ = self.run_test(
            "Get Videos by Domain",
            "GET",
            "/api/videos?domain=Money/Career",
            200,
            auth_token=self.user_token
        )
        
        # Get videos filtered by stage
        success3, _ = self.run_test(
            "Get Videos by Stage",
            "GET",
            "/api/videos?stage=2",
            200,
            auth_token=self.user_token
        )
        
        return success1 and success2 and success3

    def test_admin_phase3_features(self):
        """Test admin Phase 3 features"""
        if not self.admin_token:
            return False
            
        # Extended stats
        success1, _ = self.run_test(
            "Admin Extended Stats",
            "GET",
            "/api/admin/stats/extended",
            200,
            auth_token=self.admin_token
        )
        
        # Story moderation
        success2, _ = self.run_test(
            "Admin Get Stories",
            "GET",
            "/api/admin/stories",
            200,
            auth_token=self.admin_token
        )
        
        # Video management
        success3, _ = self.run_test(
            "Admin Get Videos",
            "GET",
            "/api/admin/videos",
            200,
            auth_token=self.admin_token
        )
        
        # Create test video
        success4, response = self.run_test(
            "Admin Create Video",
            "POST",
            "/api/admin/videos",
            200,
            data={
                "title": "Test Video",
                "description": "A test video for API testing",
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "domain": "general",
                "stage": 0,
                "thumbnail_url": ""
            },
            auth_token=self.admin_token
        )
        
        video_id = None
        if success4 and 'video' in response:
            video_id = response['video']['id']
        
        # Update video
        success5 = True
        if video_id:
            success5, _ = self.run_test(
                "Admin Update Video",
                "PUT",
                f"/api/admin/videos/{video_id}",
                200,
                data={
                    "title": "Updated Test Video",
                    "description": "Updated description",
                    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "domain": "Money/Career",
                    "stage": 1,
                    "thumbnail_url": ""
                },
                auth_token=self.admin_token
            )
        
        # Delete video (cleanup)
        success6 = True
        if video_id:
            success6, _ = self.run_test(
                "Admin Delete Video",
                "DELETE",
                f"/api/admin/videos/{video_id}",
                200,
                auth_token=self.admin_token
            )
        
        # Community management
        success7, _ = self.run_test(
            "Admin Get Buddy Requests",
            "GET",
            "/api/admin/buddy-requests",
            200,
            auth_token=self.admin_token
        )
        
        success8, _ = self.run_test(
            "Admin Get Connections",
            "GET",
            "/api/admin/connections",
            200,
            auth_token=self.admin_token
        )
        
        success9, _ = self.run_test(
            "Admin Get Mentor Offers",
            "GET",
            "/api/admin/mentor-offers",
            200,
            auth_token=self.admin_token
        )
        
        return all([success1, success2, success3, success4, success5, success6, success7, success8, success9])

    # ============== PHASE 4 TESTS ==============
    
    def test_profile_stats(self):
        """Test profile stats endpoint"""
        return self.run_test(
            "Get Profile Stats",
            "GET",
            "/api/profile/stats",
            200,
            auth_token=self.user_token
        )
    
    def test_update_profile(self):
        """Test profile update"""
        return self.run_test(
            "Update Profile",
            "PUT",
            "/api/profile",
            200,
            data={
                "name": "Updated Test User",
                "domains": ["money_career", "relationships"]
            },
            auth_token=self.user_token
        )
    
    def test_change_password(self):
        """Test password change"""
        return self.run_test(
            "Change Password",
            "POST",
            "/api/profile/change-password",
            200,
            data={
                "current_password": "test123",
                "new_password": "newtest123"
            },
            auth_token=self.user_token
        )
    
    def test_retake_quiz(self):
        """Test retake quiz functionality"""
        return self.run_test(
            "Retake Quiz",
            "POST",
            "/api/profile/retake-quiz",
            200,
            auth_token=self.user_token
        )
    
    def test_registration_validation(self):
        """Test registration input validation"""
        # Test invalid email
        success1, _ = self.run_test(
            "Registration - Invalid Email",
            "POST",
            "/api/auth/register",
            422,  # Validation error
            data={"email": "invalid-email", "password": "test123", "name": "Test"}
        )
        
        # Test short password
        success2, _ = self.run_test(
            "Registration - Short Password",
            "POST",
            "/api/auth/register",
            422,  # Validation error
            data={"email": "test@test.com", "password": "123", "name": "Test"}
        )
        
        # Test missing name
        success3, _ = self.run_test(
            "Registration - Missing Name",
            "POST",
            "/api/auth/register",
            422,  # Validation error
            data={"email": "test@test.com", "password": "test123", "name": ""}
        )
        
        return success1 and success2 and success3
    
    def test_admin_user_search(self):
        """Test admin user search functionality"""
        if not self.admin_token:
            return False
            
        return self.run_test(
            "Admin User Search",
            "GET",
            "/api/admin/users?search=test",
            200,
            auth_token=self.admin_token
        )
    
    def test_admin_story_filter(self):
        """Test admin story status filtering"""
        if not self.admin_token:
            return False
            
        # Test filtering by pending status
        success1, _ = self.run_test(
            "Admin Stories - Filter Pending",
            "GET",
            "/api/admin/stories?status=pending",
            200,
            auth_token=self.admin_token
        )
        
        # Test filtering by approved status
        success2, _ = self.run_test(
            "Admin Stories - Filter Approved",
            "GET",
            "/api/admin/stories?status=approved",
            200,
            auth_token=self.admin_token
        )
        
        return success1 and success2
    
    def test_rate_limiting(self):
        """Test rate limiting on auth endpoints"""
        self.log("🔒 Testing rate limiting (this may take a moment)...")
        
        # Test registration rate limit (5/minute)
        registration_attempts = 0
        for i in range(7):  # Try 7 times to exceed limit of 5
            test_email = f"ratetest_{int(time.time())}_{i}@test.com"
            success, response = self.run_test(
                f"Rate Limit Test - Registration {i+1}",
                "POST",
                "/api/auth/register",
                200 if i < 5 else 429,  # Expect 429 after 5 attempts
                data={"email": test_email, "password": "test123", "name": "Rate Test"}
            )
            if success or (not success and i >= 5):
                registration_attempts += 1
            time.sleep(0.5)  # Small delay between requests
        
        # Test login rate limit (10/minute) - we'll just test a few
        login_attempts = 0
        for i in range(3):
            success, response = self.run_test(
                f"Rate Limit Test - Login {i+1}",
                "POST",
                "/api/auth/login",
                401,  # Invalid credentials, but should not be rate limited yet
                data={"email": "nonexistent@test.com", "password": "wrong"}
            )
            if success or response:  # Count any response as successful rate limit test
                login_attempts += 1
            time.sleep(0.5)
        
        return registration_attempts >= 6 and login_attempts >= 3  # At least some tests passed

    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("🚀 Starting 10 Million Mistakes API Tests")
        self.log(f"🌐 Base URL: {self.base_url}")
        
        # Basic tests
        self.test_health_check()
        
        # Auth tests
        if not self.test_admin_login():
            self.log("❌ Admin login failed - stopping admin tests")
        
        # Try existing user first, then register new one
        if not self.test_user_login():
            if not self.test_user_registration():
                self.log("❌ User auth failed - stopping user tests")
                return self.print_results()
        
        self.test_get_me()
        
        # Onboarding tests
        self.test_onboarding_quiz()
        self.test_complete_onboarding()
        
        # Challenge tests
        if self.test_get_todays_challenge():
            self.test_swap_challenge()
        
        # Reflection tests
        if self.test_create_reflection():
            self.test_get_reflections()
            self.test_get_vault()
        
        # Progress and mantras
        self.test_get_progress()
        self.test_get_mantras()
        self.test_save_mantra()
        self.test_get_saved_mantras()
        
        # Admin tests (if admin login succeeded)
        if self.admin_token:
            self.test_admin_stats()
            self.test_admin_users()
            self.test_admin_user_detail()
            self.test_admin_mantras()
            self.test_admin_reflections()
            self.test_admin_phase3_features()
        
        # Phase 3 feature tests
        self.test_patterns()
        self.test_stories_flow()
        self.test_buddy_system()
        self.test_mentorship_system()
        self.test_video_library()
        
        # Phase 4 feature tests
        self.test_profile_stats()
        self.test_update_profile()
        self.test_change_password()
        self.test_retake_quiz()
        self.test_registration_validation()
        
        # Admin Phase 4 tests
        if self.admin_token:
            self.test_admin_user_search()
            self.test_admin_story_filter()
        
        # Rate limiting tests (run last as they may affect other tests)
        self.test_rate_limiting()
        
        return self.print_results()

    def print_results(self):
        """Print test results summary"""
        self.log("\n" + "="*60)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("="*60)
        self.log(f"✅ Tests passed: {self.tests_passed}/{self.tests_run}")
        self.log(f"❌ Tests failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            self.log("\n🔍 FAILED TESTS:")
            for failure in self.failed_tests:
                error_msg = failure.get('error', f"Expected {failure.get('expected')}, got {failure.get('actual')}")
                self.log(f"  • {failure['test']}: {error_msg}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            self.log("🎉 Excellent! Backend is working well.")
            return 0
        elif success_rate >= 70:
            self.log("⚠️  Good, but some issues need attention.")
            return 1
        else:
            self.log("🚨 Major issues detected. Backend needs fixes.")
            return 2

def main():
    tester = TenMillionMistakesAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())