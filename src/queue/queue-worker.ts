import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FileUploadService } from '../file-upload/file-upload.service';

@Processor('appQueue', { concurrency: 1 })
export class QueueWorker extends WorkerHost {
  constructor(private readonly fileUploadService: FileUploadService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'fileUpload') {
      await this.fileUploadService.upload(job?.data?.file);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    console.log(
      `Job with id ${job.id} FAILED! Attempt Number ${job.attemptsMade}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job with id ${job.id} COMPLETED!`);
  }
}
