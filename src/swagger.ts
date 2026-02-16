import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dubuu API",
      version: "1.0.0",
      description: "Documentación de la API REST. Base URL: `/api/v1`",
    },
    servers: [
      { url: "http://localhost:3002", description: "Desarrollo" },
    ],
  },
  apis: ["./src/routes/v1/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
