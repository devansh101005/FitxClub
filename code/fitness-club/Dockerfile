# ============================================================================
# Multi-stage Dockerfile for fitness-club backend (Spring Boot 3.2.4 / Java 17)
# Build:  docker build -t fitness-club-backend .
# Run:    docker run -p 8080:8080 --env-file .env fitness-club-backend
# ============================================================================

# ---- Stage 1: build ----
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

# Cache dependencies first
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Compile
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Stage 2: runtime ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Non-root user for safety
RUN useradd --create-home --shell /bin/bash spring
USER spring

COPY --from=build --chown=spring:spring /workspace/target/fitness-club-1.0.0-SNAPSHOT.jar app.jar

ENV JAVA_OPTS="-Duser.timezone=Asia/Kolkata -XX:MaxRAMPercentage=75.0"
ENV SPRING_PROFILES_ACTIVE=prod
ENV APP_DEMO_MODE=true

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
