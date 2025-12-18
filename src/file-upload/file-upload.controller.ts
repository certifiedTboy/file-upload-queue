import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueueService } from 'src/queue/queue-service';

@Controller('files')
export class FileUploadController {
  constructor(private readonly queueService: QueueService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      await this.queueService.addJob('fileUpload', { file }, 10000);

      res.status(202).json({ message: 'File upload job has been queued' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          message: error.message,
        });
      } else {
        res.status(500).json({ message: 'Failed to queue file upload job' });
      }
    }
  }
}
