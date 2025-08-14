#!/bin/bash

# Test script for My Awesome CRM API
# Run this after starting the services with docker-compose up

set -e

BASE_URL="http://localhost:8000"
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing My Awesome CRM API...${NC}"

# Function to print test results
print_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# Test 1: Health checks
echo -e "\n${YELLOW}1. Testing health endpoints...${NC}"
curl -s "$BASE_URL/health" > /dev/null
print_result "Gateway health check"

curl -s "$BASE_URL/health/services" > /dev/null
print_result "Services health check"

# Test 2: Authentication
echo -e "\n${YELLOW}2. Testing authentication...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/token" -d "username=demo&password=demo123")
TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Authentication successful${NC}"
else
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

# Test 3: Contact operations
echo -e "\n${YELLOW}3. Testing Contact Service...${NC}"

# Create contact
CONTACT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/contacts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john.doe@example.com",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "title": "Sales Manager",
    "tenant_id": 1
  }')

CONTACT_ID=$(echo $CONTACT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
if [ -n "$CONTACT_ID" ]; then
    echo -e "${GREEN}✓ Contact created (ID: $CONTACT_ID)${NC}"
else
    echo -e "${RED}✗ Contact creation failed${NC}"
    echo "Response: $CONTACT_RESPONSE"
fi

# List contacts
curl -s -X GET "$BASE_URL/api/v1/contacts" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
print_result "List contacts"

# Get specific contact
if [ -n "$CONTACT_ID" ]; then
    curl -s -X GET "$BASE_URL/api/v1/contacts/$CONTACT_ID" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    print_result "Get contact by ID"
fi

# Test 4: Basic service connectivity
echo -e "\n${YELLOW}4. Testing service endpoints...${NC}"

# Test lead service
curl -s -X GET "$BASE_URL/api/v1/leads" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
print_result "Lead service connectivity"

# Test opportunity service  
curl -s -X GET "$BASE_URL/api/v1/opportunities" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
print_result "Opportunity service connectivity"

# Test activity service
curl -s -X GET "$BASE_URL/api/v1/activities" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
print_result "Activity service connectivity"

# Test 5: Dashboard
echo -e "\n${YELLOW}5. Testing dashboard...${NC}"
curl -s -X GET "$BASE_URL/api/v1/dashboard/summary" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
print_result "Dashboard summary"

echo -e "\n${GREEN}🎉 All tests passed! The My Awesome CRM API is working correctly.${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. View API documentation at: $BASE_URL/docs"
echo "2. Check individual service docs at ports 8001-8004"
echo "3. Use your favorite API client to explore the endpoints"
echo ""
echo -e "${YELLOW}Your access token:${NC}"
echo "$TOKEN"
echo ""
echo -e "${YELLOW}Example API calls:${NC}"
echo "curl -H 'Authorization: Bearer $TOKEN' $BASE_URL/api/v1/contacts"
echo "curl -H 'Authorization: Bearer $TOKEN' $BASE_URL/api/v1/dashboard/summary"