#!/bin/bash
echo "🩺 Vérification de la santé des services de l'application..."

# Test Frontend (Port 8080)
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
    echo "🟢 Frontend (Port 8080) : OK"
else
    echo "🔴 Frontend (Port 8080) : INACCESSIBLE"
fi

# Test Backend API (Port 3000)
if docker exec travel_backend node -e "fetch('http://localhost:3000/hello').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    echo "🟢 Backend API (Port 3000) : OK"
else
    echo "🔴 Backend API (Port 3000) : INACCESSIBLE"
fi

# Test Database PostgreSQL
if docker exec travel_db pg_isready -U user -d travel_db | grep -q "accepting connections"; then
    echo "🟢 Database (PostgreSQL) : OK"
else
    echo "🔴 Database (PostgreSQL) : ERREUR"
fi