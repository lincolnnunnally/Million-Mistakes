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