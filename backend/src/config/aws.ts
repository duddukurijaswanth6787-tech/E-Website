import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';
import { logger } from '../common/logger';

if (!env.aws.accessKeyId || !env.aws.secretAccessKey) {
  logger.warn('AWS credentials are not properly configured in environment variables');
}

export const s3Client = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
});
