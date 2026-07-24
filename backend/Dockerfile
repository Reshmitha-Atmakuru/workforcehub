# Multi-stage build for WorkforceHub Spring Boot Backend & Frontend
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

# Copy Maven wrapper or pom.xml and source code
COPY pom.xml .
COPY src ./src

# Install maven if needed or assume mvn available. Since container has openjdk, let's install maven or use maven wrapper if present.
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Build jar
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080 3000
ENTRYPOINT ["java", "-jar", "app.jar"]
