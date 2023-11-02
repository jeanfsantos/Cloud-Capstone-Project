import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

import { createLogger } from '@utils/logger';

const logger = createLogger('AttachmentUtils');

export class AttachmentUtils {
  constructor(
    private readonly s3: S3Client = createS3Client(),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
  ) {}

  async getUploadUrl(id: string): Promise<string> {
    logger.info(
      `Creating upload url for id: ${id} on bucket ${this.bucketName} with expiration ${this.urlExpiration}`,
    );

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: id,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: Number(this.urlExpiration),
    });

    logger.info(
      `Upload url for ${id} on bucket ${this.bucketName} with expiration ${this.urlExpiration} is: ${url}`,
    );

    return url;
  }

  getAttachmentUrl(id: string): string {
    logger.info(
      `Get attachment url for id: ${id} on bucket ${this.bucketName}`,
    );

    return `https://${this.bucketName}.s3.amazonaws.com/${id}`;
  }
}

function createS3Client(): S3Client {
  const s3 = captureAWSv3Client(new S3Client());

  return s3;
}
