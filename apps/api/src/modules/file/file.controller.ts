import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { FileAccessUrlResponseDto } from './dto/file-access-url-response.dto';
import { UploadFilesResponseDto } from './dto/upload-files-response.dto';
import { FileService } from './file.service';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 20, { storage: memoryStorage() }))
  async uploadFiles(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @UploadedFiles() files?: UploadedBinaryFile[],
  ): Promise<UploadFilesResponseDto> {
    return this.fileService.uploadFiles(tenantId, userId, files ?? []);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file' })
  async deleteFile(@CurrentTenant() tenantId: string, @Param('id') fileId: string): Promise<void> {
    return this.fileService.deleteFile(tenantId, fileId);
  }

  @Get('access-url')
  @ApiOperation({ summary: 'Generate temporary access URL' })
  getAccessUrl(
    @Query('url') url: string,
    @Query('expiresInSeconds') expiresInSeconds?: number,
  ): FileAccessUrlResponseDto {
    return this.fileService.getAccessUrl(url, expiresInSeconds ?? 300);
  }
}
