import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/v1/*.ts"], // Path to API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
