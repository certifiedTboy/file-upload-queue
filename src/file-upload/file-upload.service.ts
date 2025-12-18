import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

@Injectable()
export class FileUploadService {
  private cloudinary = cloudinary;
  constructor(private readonly configService: ConfigService) {
    this.cloudinary.config({
      cloud_name: this.configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    if (!file?.buffer) {
      throw new BadRequestException('File buffer is empty');
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          { folder: 'uploaded_files', resource_type: 'auto' },
          (error, result) =>
            error || !result
              ? reject(new Error(error?.message || 'Cloudinary upload failed'))
              : resolve(result),
        )
        .end(Buffer.from(file.buffer));
    });

    console.log({ secureUrl: result.secure_url, publicId: result.public_id });

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  }
}
