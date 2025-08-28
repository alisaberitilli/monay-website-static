import fs from 'fs';
import { S3Client, HeadObjectCommand, DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import config from '../config';

const s3Client = new S3Client({
  region: config.aws.region || 'ap-south-1',
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  }
});
export default {
  async checkS3MediaExist(path) {
    try {
      const command = new HeadObjectCommand({
        Bucket: config.aws.bucketName,
        Key: path,
      });

      try {
        await s3Client.send(command);
        return path;
      } catch (err) {
        return false;
      }
    } catch (error) {
      throw error;
    }
  },

  async unlinkMediaFromS3(data) {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: config.aws.bucketName,
        Delete: {
          Objects: data.objects,
        },
      });
      
      try {
        await s3Client.send(command);
        return true;
      } catch (err) {
        return false;
      }
    } catch (error) {
      throw error;
    }
  },

  async unlinkVideoFromS3(data) {
    try {
      const command = new DeleteObjectsCommand({
        Bucket: config.aws.videoSourceBucketName,
        Delete: {
          Objects: data.objects,
        },
      });
      
      try {
        await s3Client.send(command);
        return true;
      } catch (err) {
        return false;
      }
    } catch (error) {
      throw error;
    }
  },

  async uploadImageOnS3Bucket(requestData) {
    try {
      let bucketPath = `${requestData.mediaFor}`;
      bucketPath = requestData.isThumbImage
        ? `${bucketPath}/thumb/${requestData.name}`
        : `${bucketPath}/${requestData.name}`;

      const fileStream = fs.createReadStream(requestData.imagePath);
      const command = new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: bucketPath,
        Body: fileStream,
        ACL: 'public-read'
      });
      
      // Upload new image, careful not to upload it in a path that will trigger the function again!
      try {
        await s3Client.send(command);
        return { basePath: bucketPath };
      } catch (err) {
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },
};
