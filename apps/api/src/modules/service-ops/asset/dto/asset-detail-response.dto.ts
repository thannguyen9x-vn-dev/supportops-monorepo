import { ApiProperty } from '@nestjs/swagger';
import { PageMeta } from '../../../../common/dto/page-meta.dto';
import { RequestResponseDto } from '../../request/dto/request-response.dto';
import { AssetResponseDto } from './asset-response.dto';

export class AssetDetailResponseDto {
  @ApiProperty({ type: () => AssetResponseDto })
  asset!: AssetResponseDto;

  @ApiProperty()
  openRequestCount!: number;

  @ApiProperty({ type: [RequestResponseDto] })
  requests!: RequestResponseDto[];

  @ApiProperty()
  meta!: PageMeta;
}
