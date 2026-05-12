import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { env } from './env';
import { logger } from '../common/logger';

/**
 * Enterprise AWS S3 Client Lifecycle Manager
 */
const validateAwsConfig = () => {
  const { accessKeyId, secretAccessKey, s3BucketName } = env.aws;
  
  if (!accessKeyId || !secretAccessKey || !s3BucketName) {
    if (env.isProduction) {
      throw new Error('CRITICAL: AWS S3 Storage configuration is incomplete. Production deployment blocked.');
    } else {
      logger.error('⚠️ AWS S3 credentials missing. Uploads will fail in the current session.');
    }
    return false;
  }
  return true;
};

const isConfigured = validateAwsConfig();

export const s3Client = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId || 'placeholder',
    secretAccessKey: env.aws.secretAccessKey || 'placeholder',
  },
  maxAttempts: 3, // Enable automatic SDK retries for transient network drops
});

/**
 * Validates bucket accessibility on startup to fail fast
 */
export const validateS3Connection = async () => {
  if (!isConfigured) return;
  
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.aws.s3BucketName }));
    logger.info(`✅ AWS S3 Connectivity Verified: Bucket [${env.aws.s3BucketName}] is reachable.`);
  } catch (err: any) {
    const errorMsg = `❌ AWS S3 Connectivity Failure: ${err.message}`;
    if (env.isProduction) {
      throw new Error(errorMsg);
    }
    logger.error(errorMsg);
  }
};
