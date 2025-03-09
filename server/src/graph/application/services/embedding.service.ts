import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGraphRepository } from '../../domain/repositories/graph.repository.interface';
import { Graph } from '../../domain/models/graph.entity';
import { GraphEmbedDto } from '../dtos/graph.dto';
import { GraphTheme } from '../../domain/models/graph-settings.value-object';

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject('IGraphRepository')
    private readonly graphRepository: IGraphRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate an embed code for a graph
   */
  async generateEmbedCode(graphEmbedDto: GraphEmbedDto): Promise<string> {
    const { 
      graphId, 
      title, 
      width = '100%', 
      height = '500px', 
      theme,
      allowInteraction = true,
      showControls = true,
      autoFit = true,
    } = graphEmbedDto;
    
    // Ensure graph exists and is public
    const graph = await this.graphRepository.findById(graphId);
    if (!graph) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }
    
    if (!graph.isPublic) {
      throw new NotFoundException(`Graph with ID ${graphId} is not public and cannot be embedded`);
    }
    
    // Base URL for the embed
    const baseUrl = this.configService.get<string>('APP_URL') || 'https://notion-graph-view.app';
    
    // Build the embed URL with query parameters
    const embedUrl = new URL(`${baseUrl}/embed/${graphId}`);
    
    // Add optional parameters
    if (theme) {
      embedUrl.searchParams.append('theme', theme);
    }
    
    if (!allowInteraction) {
      embedUrl.searchParams.append('interactive', 'false');
    }
    
    if (!showControls) {
      embedUrl.searchParams.append('controls', 'false');
    }
    
    if (!autoFit) {
      embedUrl.searchParams.append('autofit', 'false');
    }
    
    // Generate iframe code
    const iframeTitle = title || `Graph: ${graph.name}`;
    const iframeCode = `<iframe src="${embedUrl.toString()}" width="${width}" height="${height}" title="${iframeTitle}" frameborder="0" allowfullscreen></iframe>`;
    
    return iframeCode;
  }

  /**
   * Get embed information for a graph
   */
  async getEmbedInfo(graphId: string): Promise<any> {
    // Ensure graph exists and is public
    const graph = await this.graphRepository.findById(graphId);
    if (!graph) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }
    
    if (!graph.isPublic) {
      throw new NotFoundException(`Graph with ID ${graphId} is not public and cannot be embedded`);
    }
    
    // Return basic info about the graph
    const { id, name, description, nodeCount, edgeCount, settings } = graph;
    
    return {
      id,
      name,
      description,
      nodeCount,
      edgeCount,
      defaultSettings: {
        theme: settings.visualSettings.theme,
      },
      availableThemes: Object.values(GraphTheme),
    };
  }

  /**
   * Generate a screenshot of a graph for social sharing
   * Note: This is a placeholder. In a real implementation, you would use
   * a headless browser like Puppeteer to render and capture the graph.
   */
  async generateScreenshot(graphId: string): Promise<string> {
    // Ensure graph exists and is public
    const graph = await this.graphRepository.findById(graphId);
    if (!graph) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }
    
    if (!graph.isPublic) {
      throw new NotFoundException(`Graph with ID ${graphId} is not public and cannot be embedded`);
    }
    
    // This is a placeholder - in a real implementation, you would:
    // 1. Use Puppeteer or a similar tool to render the graph
    // 2. Take a screenshot
    // 3. Save it or return the image data
    
    return `https://example.com/screenshots/${graphId}.png`;
  }
} 