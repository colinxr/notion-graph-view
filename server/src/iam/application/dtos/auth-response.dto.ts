import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ example: 'jwt_token_here' })
  token: string;

  @ApiProperty({ example: '2024-03-07T12:00:00Z' })
  expiresAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty()
  token: AuthTokenResponseDto;

  @ApiProperty({ example: true })
  hasNotionAccess: boolean;
} 