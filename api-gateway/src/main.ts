import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Serve the simulator HTML page from the /public directory.
  // STATIC_DIR env is set explicitly in docker-compose → /app/public
  // Locally (npm run start:dev from api-gateway/): defaults to ../public (project root)
  const staticDir =
    process.env.STATIC_DIR || join(process.cwd(), "..", "public");
  app.useStaticAssets(staticDir, { prefix: "/" });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════════╗
║          🚀 API Gateway is running!                   ║
║                                                       ║
║  HTTP API:    http://localhost:${port}                    ║
║  WebSocket:   ws://localhost:${port}/delivery            ║
║  Simulator:   http://localhost:${port}/index.html        ║
╚══════════════════════════════════════════════════════╝
  `);
}
bootstrap();
