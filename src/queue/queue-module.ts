import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue-service';
import { QueueWorker } from './queue-worker';
import { AppQueueEventsListener } from './queue-events';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'appQueue',
    }),
    FileUploadModule,
  ],
  providers: [QueueService, QueueWorker, AppQueueEventsListener],
  exports: [QueueService],
})
export class QueueModule {}
