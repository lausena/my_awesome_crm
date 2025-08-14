"""API Gateway for My Awesome CRM."""

from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from typing import Optional
import time
from collections import defaultdict
import asyncio

from shared.auth import get_current_user, create_access_token

# Service URLs
CONTACT_SERVICE_URL = os.getenv("CONTACT_SERVICE_URL", "http://localhost:8001")
LEAD_SERVICE_URL = os.getenv("LEAD_SERVICE_URL", "http://localhost:8002")
OPPORTUNITY_SERVICE_URL = os.getenv("OPPORTUNITY_SERVICE_URL", "http://localhost:8003")
ACTIVITY_SERVICE_URL = os.getenv("ACTIVITY_SERVICE_URL", "http://localhost:8004")

# Rate limiting storage
rate_limit_storage = defaultdict(list)

# Create FastAPI app
app = FastAPI(
    title="My Awesome CRM API Gateway",
    description="CRM API Gateway with routing, authentication, and rate limiting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rate limiting middleware
class RateLimitMiddleware:
    def __init__(self, calls: int = 100, period: int = 60):
        self.calls = calls
        self.period = period
    
    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean old entries
        rate_limit_storage[client_ip] = [
            timestamp for timestamp in rate_limit_storage[client_ip]
            if current_time - timestamp < self.period
        ]
        
        # Check rate limit
        if len(rate_limit_storage[client_ip]) >= self.calls:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"}
            )
        
        # Add current request
        rate_limit_storage[client_ip].append(current_time)
        
        response = await call_next(request)
        return response


# Add rate limiting middleware
app.middleware("http")(RateLimitMiddleware(calls=1000, period=3600))  # 1000 calls per hour


# HTTP client for service communication
http_client = httpx.AsyncClient(timeout=30.0)


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown."""
    await http_client.aclose()


# Health check endpoints
@app.get("/health")
async def health_check():
    """Gateway health check."""
    return {"status": "healthy", "service": "api-gateway"}


@app.get("/health/services")
async def services_health_check():
    """Check health of all services."""
    services = {
        "contact-service": f"{CONTACT_SERVICE_URL}/health",
        "lead-service": f"{LEAD_SERVICE_URL}/health",
        "opportunity-service": f"{OPPORTUNITY_SERVICE_URL}/health",
        "activity-service": f"{ACTIVITY_SERVICE_URL}/health"
    }
    
    health_status = {}
    
    for service_name, health_url in services.items():
        try:
            response = await http_client.get(health_url, timeout=5.0)
            if response.status_code == 200:
                health_status[service_name] = "healthy"
            else:
                health_status[service_name] = "unhealthy"
        except Exception:
            health_status[service_name] = "unreachable"
    
    overall_status = "healthy" if all(
        status == "healthy" for status in health_status.values()
    ) else "degraded"
    
    return {
        "status": overall_status,
        "services": health_status,
        "timestamp": time.time()
    }


# Authentication endpoints
@app.post("/auth/token")
async def login(username: str, password: str):
    """Simple authentication endpoint (demo purposes)."""
    # In production, validate against user database
    if username == "demo" and password == "demo123":
        token_data = {
            "sub": "1", 
            "username": username,
            "tenant_id": 1
        }
        access_token = create_access_token(data=token_data)
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )


# Proxy helper function
async def proxy_request(
    request: Request,
    service_url: str,
    path: str,
    current_user: Optional[dict] = None
):
    """Proxy request to backend service."""
    # Prepare headers
    headers = dict(request.headers)
    if current_user:
        headers["X-User-ID"] = str(current_user["user_id"])
        headers["X-Tenant-ID"] = str(current_user["payload"].get("tenant_id", 1))
    
    # Remove host header to avoid conflicts
    headers.pop("host", None)
    
    # Prepare URL
    url = f"{service_url}{path}"
    if request.query_params:
        url += f"?{request.query_params}"
    
    try:
        # Prepare request body
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
        
        # Make request to service
        response = await http_client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body,
            timeout=30.0
        )
        
        # Return response
        return JSONResponse(
            content=response.json() if response.content else None,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Service request timeout"
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unavailable"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Contact service routes
@app.api_route("/api/v1/contacts/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def contact_proxy(
    request: Request,
    path: str,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to contact service."""
    return await proxy_request(
        request, CONTACT_SERVICE_URL, f"/contacts/{path}", current_user
    )


@app.api_route("/api/v1/contacts", methods=["GET", "POST"])
async def contact_base_proxy(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to contact service base endpoint."""
    return await proxy_request(
        request, CONTACT_SERVICE_URL, "/contacts", current_user
    )


# Lead service routes
@app.api_route("/api/v1/leads/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def lead_proxy(
    request: Request,
    path: str,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to lead service."""
    return await proxy_request(
        request, LEAD_SERVICE_URL, f"/leads/{path}", current_user
    )


@app.api_route("/api/v1/leads", methods=["GET", "POST"])
async def lead_base_proxy(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to lead service base endpoint."""
    return await proxy_request(
        request, LEAD_SERVICE_URL, "/leads", current_user
    )


# Opportunity service routes
@app.api_route("/api/v1/opportunities/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def opportunity_proxy(
    request: Request,
    path: str,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to opportunity service."""
    return await proxy_request(
        request, OPPORTUNITY_SERVICE_URL, f"/opportunities/{path}", current_user
    )


@app.api_route("/api/v1/opportunities", methods=["GET", "POST"])
async def opportunity_base_proxy(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to opportunity service base endpoint."""
    return await proxy_request(
        request, OPPORTUNITY_SERVICE_URL, "/opportunities", current_user
    )


# Activity service routes
@app.api_route("/api/v1/activities/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def activity_proxy(
    request: Request,
    path: str,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to activity service."""
    return await proxy_request(
        request, ACTIVITY_SERVICE_URL, f"/activities/{path}", current_user
    )


@app.api_route("/api/v1/activities", methods=["GET", "POST"])
async def activity_base_proxy(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy requests to activity service base endpoint."""
    return await proxy_request(
        request, ACTIVITY_SERVICE_URL, "/activities", current_user
    )


# Dashboard and analytics endpoints
@app.get("/api/v1/dashboard/summary")
async def dashboard_summary(current_user: dict = Depends(get_current_user)):
    """Get dashboard summary from all services."""
    tenant_id = current_user["payload"].get("tenant_id", 1)
    
    # Make parallel requests to all services for summary data
    tasks = [
        http_client.get(f"{CONTACT_SERVICE_URL}/contacts/recent?limit=5", 
                       headers={"Authorization": f"Bearer {current_user}"}),
        http_client.get(f"{LEAD_SERVICE_URL}/health"),  # Placeholder for leads summary
        http_client.get(f"{OPPORTUNITY_SERVICE_URL}/health"),  # Placeholder for opportunities summary
        http_client.get(f"{ACTIVITY_SERVICE_URL}/health"),  # Placeholder for activities summary
    ]
    
    try:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            "contacts": {"status": "ok", "recent": []},
            "leads": {"status": "ok", "count": 0},
            "opportunities": {"status": "ok", "count": 0, "total_value": 0},
            "activities": {"status": "ok", "overdue": 0, "due_today": 0},
            "timestamp": time.time()
        }
        
    except Exception as e:
        return {
            "error": "Failed to fetch dashboard data",
            "detail": str(e),
            "timestamp": time.time()
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)