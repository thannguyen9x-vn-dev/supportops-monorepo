import { ApiProperty } from '@nestjs/swagger';

export class SlaPolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  serviceTypeCode!: string;

  @ApiProperty()
  responseMinutes!: number;

  @ApiProperty()
  resolutionMinutes!: number;

  @ApiProperty()
  escalationAfterMinutes!: number;
}
