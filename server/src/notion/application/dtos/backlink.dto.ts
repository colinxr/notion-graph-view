export class BacklinkDto {
  id: string;
  sourcePageId: string;
  sourcePageTitle: string;
  targetPageId: string;
  createdAt: Date;
  context?: string;
}

export class CreateBacklinkDto {
  sourcePageId: string;
  sourcePageTitle: string;
  targetPageId: string;
  context?: string;
} 