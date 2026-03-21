import { ApiProperty } from '@nestjs/swagger';

export class AssetSummaryResponseDto {
  @ApiProperty({ description: 'Asset identifier from request.assetId' })
  id!: string;

  @ApiProperty()
  requestCount!: number;

  @ApiProperty()
  openRequestCount!: number;

  @ApiProperty()
  lastSeenAt!: string;
}
