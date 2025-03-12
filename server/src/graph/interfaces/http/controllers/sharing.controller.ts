import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  Delete,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GraphSharingService } from '../../../application/services/graph-sharing.service';
import { ShareGraphDto, SetPublicVisibilityDto, GraphResponseDto } from '../../../application/dtos/graph.dto';
import { AuthGuard } from '../../../../iam/interfaces/http/guards/auth.guard';

@ApiTags('Graph Sharing')
@ApiBearerAuth()
@Controller('graphs')
@UseGuards(AuthGuard)
export class SharingController {
  constructor(private readonly graphSharingService: GraphSharingService) {}

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a graph with other users' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Graph shared successfully', 
    type: GraphResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Graph not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to share this graph' })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async shareGraph(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string, 
    @Body() shareDto: ShareGraphDto
  ): Promise<GraphResponseDto> {
    try {
      return await this.graphSharingService.shareWithUsers(req.user.id, graphId, shareDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof ForbiddenException) {
        throw error;
      }
      throw error;
    }
  }

  @Delete(':id/share')
  @ApiOperation({ summary: 'Remove sharing for a graph' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Sharing removed successfully', 
    type: GraphResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Graph not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to modify sharing for this graph' })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async removeSharing(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string, 
    @Body() userIds: string[]
  ): Promise<GraphResponseDto> {
    try {
      return await this.graphSharingService.removeSharing(req.user.id, graphId, userIds);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof ForbiddenException) {
        throw error;
      }
      throw error;
    }
  }

  @Post(':id/public')
  @ApiOperation({ summary: 'Set public visibility for a graph' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Public visibility set successfully', 
    type: GraphResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Graph not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to modify this graph' })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async setPublicVisibility(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string, 
    @Body() visibilityDto: SetPublicVisibilityDto
  ): Promise<GraphResponseDto> {
    try {
      return await this.graphSharingService.setPublicVisibility(
        req.user.id, 
        graphId, 
        visibilityDto
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof ForbiddenException) {
        throw error;
      }
      throw error;
    }
  }

  @Get(':id/shared-users')
  @ApiOperation({ summary: 'Get users with whom a graph is shared' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Shared users retrieved successfully', 
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Graph not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to view this graph' })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async getSharedUsers(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string
  ): Promise<any[]> {
    try {
      return await this.graphSharingService.getSharedUsers(req.user.id, graphId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof ForbiddenException) {
        throw error;
      }
      throw error;
    }
  }
} 