"""Shared Redis cache utilities."""

import json
import redis.asyncio as redis
from typing import Optional, Any
import os


class CacheManager:
    """Redis cache manager for caching frequently accessed data."""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.redis_client = None
    
    async def connect(self):
        """Connect to Redis."""
        self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
    
    async def disconnect(self):
        """Disconnect from Redis."""
        if self.redis_client:
            await self.redis_client.close()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.redis_client:
            await self.connect()
        
        value = await self.redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Set value in cache with expiration."""
        if not self.redis_client:
            await self.connect()
        
        return await self.redis_client.set(
            key, 
            json.dumps(value, default=str), 
            ex=expire
        )
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.redis_client:
            await self.connect()
        
        return bool(await self.redis_client.delete(key))
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if not self.redis_client:
            await self.connect()
        
        return bool(await self.redis_client.exists(key))