FROM maven:3.9.16-eclipse-temurin-17-noble AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B verify
RUN cp target/*.jar /app/app.jar

FROM eclipse-temurin:17-jre-noble
WORKDIR /app
COPY --from=build /app/app.jar app.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
