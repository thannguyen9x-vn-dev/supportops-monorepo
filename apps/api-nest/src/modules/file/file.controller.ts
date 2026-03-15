import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileAccessUrlResponseDto } from './dto/file-access-url-response.dto';
import { FileService } from './file.service';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('access-url')
  @ApiOperation({ summary: 'Generate temporary access URL' })
  getAccessUrl(
    @Query('url') url: string,
    @Query('expiresInSeconds') expiresInSeconds?: number,
  ): FileAccessUrlResponseDto {
    return this.fileService.getAccessUrl(url, expiresInSeconds ?? 300);
  }
}
