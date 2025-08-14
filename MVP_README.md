# My Awesome CRM - MVP Backend

A simplified microservices-based CRM backend built with Python/FastAPI, PostgreSQL, and Redis. This MVP provides essential CRUD operations for contacts, leads, opportunities, and activities.

## Architecture Overview

The system follows a microservices architecture with:
- **API Gateway** (Port 8000) - Routes requests, handles authentication, rate limiting
- **Contact Service** (Port 8001) - Manages contact data
- **Lead Service** (Port 8002) - Handles lead management and scoring
- **Opportunity Service** (Port 8003) - Sales pipeline and deal management
- **Activity Service** (Port 8004) - Tasks, communications, and activities
- **PostgreSQL** - Separate databases per service
- **Redis** - Caching and session management

## Features Implemented

### Core Features
- ✅ Contact Management (CRUD operations)
- ✅ Lead Management with basic scoring
- ✅ Opportunity Management with pipeline stages
- ✅ Activity Management for tasks and communications
- ✅ Multi-tenant architecture
- ✅ JWT Authentication
- ✅ API Gateway with routing
- ✅ Rate limiting (1000 requests/hour per IP)
- ✅ Redis caching
- ✅ Docker containerization

### API Endpoints

**Authentication:**
- `POST /auth/token` - Get access token

**Contacts:**
- `GET /api/v1/contacts` - List contacts with search/filtering
- `POST /api/v1/contacts` - Create contact
- `GET /api/v1/contacts/{id}` - Get contact
- `PUT /api/v1/contacts/{id}` - Update contact
- `DELETE /api/v1/contacts/{id}` - Delete contact
- `GET /api/v1/contacts/company/{company}` - Get contacts by company
- `GET /api/v1/contacts/recent` - Get recent contacts

**Leads:**
- `GET /api/v1/leads` - List leads with search/filtering
- `POST /api/v1/leads` - Create lead
- `GET /api/v1/leads/{id}` - Get lead
- `PUT /api/v1/leads/{id}` - Update lead
- `DELETE /api/v1/leads/{id}` - Delete lead

**Opportunities:**
- `GET /api/v1/opportunities` - List opportunities
- `POST /api/v1/opportunities` - Create opportunity
- `GET /api/v1/opportunities/{id}` - Get opportunity
- `PUT /api/v1/opportunities/{id}` - Update opportunity
- `DELETE /api/v1/opportunities/{id}` - Delete opportunity

**Activities:**
- `GET /api/v1/activities` - List activities
- `POST /api/v1/activities` - Create activity
- `GET /api/v1/activities/{id}` - Get activity
- `PUT /api/v1/activities/{id}` - Update activity
- `DELETE /api/v1/activities/{id}` - Delete activity

**Health & Monitoring:**
- `GET /health` - Gateway health check
- `GET /health/services` - All services health check
- `GET /api/v1/dashboard/summary` - Dashboard summary

## Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- Git

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd my_awesome_crm
   ```

2. **Start the services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Wait for all services to start (check health):**
   ```bash
   curl http://localhost:8000/health/services
   ```

4. **Get authentication token:**
   ```bash
   curl -X POST "http://localhost:8000/auth/token" \
     -d "username=demo&password=demo123"
   ```

5. **Use the API (replace TOKEN with the access_token from step 4):**
   ```bash
   # Create a contact
   curl -X POST "http://localhost:8000/api/v1/contacts" \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "John",
       "last_name": "Doe",
       "email": "john.doe@example.com",
       "company": "Acme Corp",
       "tenant_id": 1
     }'
   
   # List contacts
   curl -X GET "http://localhost:8000/api/v1/contacts" \
     -H "Authorization: Bearer TOKEN"
   ```

## API Documentation

Once the services are running, you can access:
- API Gateway Docs: http://localhost:8000/docs
- Contact Service Docs: http://localhost:8001/docs
- Lead Service Docs: http://localhost:8002/docs
- Opportunity Service Docs: http://localhost:8003/docs
- Activity Service Docs: http://localhost:8004/docs

## Development Setup

For local development without Docker:

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start PostgreSQL and Redis locally:**
   ```bash
   # PostgreSQL on port 5432
   # Redis on port 6379
   ```

3. **Run individual services:**
   ```bash
   # Terminal 1 - Contact Service
   cd services/contact
   uvicorn main:app --port 8001 --reload
   
   # Terminal 2 - Lead Service  
   cd services/lead
   uvicorn main:app --port 8002 --reload
   
   # Terminal 3 - Opportunity Service
   cd services/opportunity
   uvicorn main:app --port 8003 --reload
   
   # Terminal 4 - Activity Service
   cd services/activity
   uvicorn main:app --port 8004 --reload
   
   # Terminal 5 - API Gateway
   cd services/gateway
   uvicorn main:app --port 8000 --reload
   ```

## Configuration

Environment variables can be set in docker-compose.yml or locally:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string  
- `SECRET_KEY` - JWT secret key
- Service URLs for the gateway

## Data Models

### Contact
- Basic info: first_name, last_name, email, phone, company
- Professional: title, department
- Address: full address fields
- Status: is_active, lead_source, notes
- Multi-tenancy: tenant_id

### Lead  
- Contact info + company details
- Classification: status, source, priority
- Scoring: automated score calculation
- Qualification: BANT criteria
- Tracking: UTM parameters, campaigns

### Opportunity
- Sales info: name, value, probability, stage
- Timing: expected_close_date, actual_close_date  
- Relationships: contact_id, account_company
- Process: owner_id, next_step, competitor

### Activity
- Classification: type, status, priority
- Timing: due_date, start_date, end_date
- Relationships: contact_id, opportunity_id, lead_id
- Communication: location, call_result, outcome

## Security Features

- JWT token-based authentication
- Multi-tenant data isolation
- Rate limiting (1000 requests/hour per IP)
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- CORS configuration

## Performance Features

- Redis caching for frequently accessed data
- Database indexing on key fields
- Async/await for non-blocking operations
- Connection pooling
- Pagination for large result sets

## Testing

```bash
# Run tests (when implemented)
pytest

# Load testing
# Use tools like Apache Bench or Locust to test the API
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:8000/api/v1/contacts
```

## Monitoring & Logging

- Health check endpoints for each service
- Structured logging (ready for implementation)
- Service status monitoring via `/health/services`

## Next Steps for Production

1. **Enhanced Security:**
   - Implement proper user authentication
   - Add role-based access control (RBAC)
   - Set up HTTPS/TLS
   - Add input sanitization

2. **Performance Optimization:**
   - Add database connection pooling
   - Implement query optimization
   - Add more comprehensive caching
   - Set up CDN for static assets

3. **Operational Excellence:**
   - Add comprehensive logging
   - Implement metrics collection
   - Set up alerting and monitoring
   - Add automated backups

4. **Feature Enhancements:**
   - Complete CRUD operations for all services
   - Add advanced search capabilities
   - Implement workflow automation
   - Add email integration
   - Build reporting and analytics

5. **Infrastructure:**
   - Set up Kubernetes deployment
   - Add CI/CD pipeline
   - Implement blue-green deployments
   - Add disaster recovery

## Troubleshooting

**Services won't start:**
- Check Docker is running
- Verify ports 8000-8004, 5432, 6379 are available
- Check docker-compose logs: `docker-compose logs`

**Authentication issues:**
- Verify token format: `Bearer <token>`
- Check token expiration (30 minutes default)
- Ensure SECRET_KEY is consistent across services

**Database connection issues:**
- Wait for PostgreSQL to fully start
- Check connection strings in environment variables
- Verify database initialization script ran

**Performance issues:**
- Check Redis connection
- Monitor database query performance
- Review rate limiting settings

## Support

For questions or issues:
1. Check the API documentation at /docs endpoints
2. Review logs: `docker-compose logs [service-name]`
3. Verify service health: `curl http://localhost:8000/health/services`

This MVP provides a solid foundation for a scalable CRM system and can be extended with additional features as needed.