@echo off
echo 🛠️ BUILDING JAR FILES...

for %%S in (
    "identity-service"
    "notification-service"
    "post-service"
    "profile-service"
    "donation-service"
    "statistics-service"
    "api-gateway"
    "AiSupport"
) do (
    echo 🔧 Building %%S...
    cd %%S
    call mvnw clean package -DskipTests
    cd ..
)

echo 🐳 Building Docker Images...
docker-compose build

echo 🚀 Starting Docker containers...
docker-compose up -d
