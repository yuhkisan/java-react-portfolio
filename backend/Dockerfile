FROM maven:3.9.16-eclipse-temurin-17-noble AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B package

FROM eclipse-temurin:17-jre-noble
WORKDIR /app
COPY --from=build /app/target/portfolio-0.0.1-SNAPSHOT.jar app.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
