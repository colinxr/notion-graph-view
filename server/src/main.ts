import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_CUSTOM_DOCUMENT } from './swagger-custom';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Use cookie parser for Clerk authentication
  app.use(cookieParser());

  // Enable CORS with credentials for Clerk cookies
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Notion Graph View API')
    .setDescription('API Documentation for the Notion Graph View application')
    .setVersion('1.0')
    .addTag('notion-databases', 'Operations related to Notion databases')
    .addTag('notion-pages', 'Operations related to Notion pages and their backlinks')
    .addTag('authentication', 'Authentication and authorization operations')
    .addBearerAuth(
      { 
        type: 'http', 
        scheme: 'bearer', 
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      },
      'JWT-auth'
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Optional: Save the Swagger JSON file for external API documentation tools
  if (process.env.NODE_ENV !== 'production') {
    const outputPath = join(process.cwd(), 'swagger-spec.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2), { encoding: 'utf8' });
    console.log(`Swagger spec saved to ${outputPath}`);
  }
  
  // Set up Swagger UI
  SwaggerModule.setup('api-docs', app, document, {
    explorer: true,
    customSiteTitle: 'Notion Graph View API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    }
  });

  // Get port from environment or use default
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`API documentation is available at: ${await app.getUrl()}/api-docs`);
}

bootstrap(); 