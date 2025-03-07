import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: true })
  isAuthenticated: boolean;

  @ApiProperty({ example: true })
  hasNotionAccess: boolean;

  @ApiProperty({ example: '2024-03-07T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-07T12:00:00Z' })
  updatedAt: Date;
}

export class UserListDto {
  @ApiProperty({ type: [UserDto] })
  users: UserDto[];

  @ApiProperty({ example: 10 })
  total: number;
} 