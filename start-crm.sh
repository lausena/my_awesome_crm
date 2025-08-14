#!/bin/bash

# My Awesome CRM Startup Script
echo "🚀 Starting My Awesome CRM..."

# Check if Docker and Docker Compose are available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed."
    echo "Please install Docker first."
    exit 1
fi

# Check for Docker Compose (V2 or V1)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Error: Docker Compose is not available."
    echo "Please install Docker Compose."
    exit 1
fi

echo "✅ Using $DOCKER_COMPOSE_CMD"

# Check if node and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js first."
    exit 1
fi

# Start backend services
echo "🐳 Starting backend services..."
$DOCKER_COMPOSE_CMD up -d

# Wait for services to be ready
echo "⏳ Waiting for backend services to start..."
sleep 10

# Check if backend is responding
echo "🔍 Checking backend health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "⚠️  Backend may still be starting up..."
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start frontend
echo "🌐 Starting frontend..."
cd frontend && npm start &
FRONTEND_PID=$!

# Show status
echo ""
echo "🎉 My Awesome CRM is starting up!"
echo ""
echo "📊 Services:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   Docs:     http://localhost:8000/docs"
echo ""
echo "🔐 Demo Credentials:"
echo "   Username: demo"
echo "   Password: demo123"
echo ""
echo "📝 Logs:"
echo "   Backend:  $DOCKER_COMPOSE_CMD logs -f"
echo "   Frontend: Will open in browser shortly..."
echo ""
echo "⏹️  To stop: Ctrl+C, then run '$DOCKER_COMPOSE_CMD down'"
echo ""

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down..."
    kill $FRONTEND_PID 2>/dev/null
    $DOCKER_COMPOSE_CMD down
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for frontend process
wait $FRONTEND_PID