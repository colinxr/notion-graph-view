import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { SWAGGER_CUSTOM_DOCUMENT } from '../swagger-custom';

/**
 * Controller for serving enhanced API documentation
 * This is excluded from the Swagger documentation
 */
@ApiExcludeController()
@Controller('api-documentation')
export class DocsController {
  /**
   * Serves the enhanced Swagger UI
   */
  @Get()
  getEnhancedDocs(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/html');
    res.send(SWAGGER_CUSTOM_DOCUMENT);
  }
} 