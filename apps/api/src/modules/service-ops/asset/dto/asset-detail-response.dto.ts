import { ApiProperty } from '@nestjs/swagger';
import { PageMeta } from '../../../../common/dto/page-meta.dto';
import { RequestResponseDto } from '../../request/dto/request-response.dto';

export class AssetDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  requestCount!: number;

  @ApiProperty()
  openRequestCount!: number;

  @ApiProperty()
  lastSeenAt!: string;

  @ApiProperty({ type: [RequestResponseDto] })
  requests!: RequestResponseDto[];

  @ApiProperty()
  meta!: PageMeta;
}
