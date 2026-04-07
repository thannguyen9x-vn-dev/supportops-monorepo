import { ApiProperty } from '@nestjs/swagger';

export class AskResponseDto {
  @ApiProperty()
  reply!: string;

  @ApiProperty()
  model!: string;
}
