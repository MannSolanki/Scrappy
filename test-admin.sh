#!/bin/bash

echo "=== Testing Admin Dashboard Setup ==="
echo ""

# Test 1: Backend connectivity
echo "1. Testing backend connectivity..."
response=$(curl -s http://localhost:5000/)
if [ "$response" = "Scrappy backend is running" ]; then
    echo "   ✓ Backend is running"
else
    echo "   ✗ Backend not responding correctly"
    exit 1
fi

# Test 2: Admin login
echo "2. Testing admin login..."
login_response=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
-H "Content-Type: application/json" \
-d '{"email":"admin@test.com","password":"admin123"}')

token=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$token" ]; then
    echo "   ✓ Admin login successful, token received"
else
    echo "   ✗ Admin login failed"
    echo "   Response: $login_response"
    exit 1
fi

# Test 3: Admin users endpoint
echo "3. Testing admin users endpoint..."
users_response=$(curl -s -X GET "http://localhost:5000/api/admin/users" \
-H "Authorization: Bearer $token" \
-H "Content-Type: application/json")

user_count=$(echo "$users_response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$user_count" -gt 0 ]; then
    echo "   ✓ Admin users endpoint working (found $user_count users)"
else
    echo "   ✗ Admin users endpoint failed"
    echo "   Response: $users_response"
fi

# Test 4: Admin scrap requests endpoint
echo "4. Testing admin scrap requests endpoint..."
requests_response=$(curl -s -X GET "http://localhost:5000/api/admin/scrap-requests" \
-H "Authorization: Bearer $token" \
-H "Content-Type: application/json")

request_count=$(echo "$requests_response" | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$request_count" -gt 0 ]; then
    echo "   ✓ Admin scrap requests endpoint working (found $request_count requests)"
else
    echo "   ✗ Admin scrap requests endpoint failed"
    echo "   Response: $requests_response"
fi

# Test 5: Check frontend env
echo "5. Checking frontend environment..."
if [ -f ".env.local" ]; then
    echo "   ✓ .env.local file exists"
    if grep -q "VITE_API_BASE_URL=http://localhost:5000" .env.local; then
        echo "   ✓ .env.local has correct API URL"
    else
        echo "   ✗ .env.local API URL mismatch"
    fi
else
    echo "   ✗ .env.local file missing"
fi

echo ""
echo "=== All tests completed ==="
echo "Frontend should be running at: http://localhost:5174"
echo "Try logging in with admin@test.com / admin123"
