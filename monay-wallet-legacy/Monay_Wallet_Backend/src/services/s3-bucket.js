import fs from 'fs';
import AWS from 'aws-sdk';
import config from '../config';
// AWS.config.update({ region: 'ap-south-1' });

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  Bucket: config.aws.bucketName
});
export default {
  checkS3MediaExist(path) {
    try {
      const params = {
        Bucket: config.aws.bucketName,
        Key: path,
      };

      let result;
      return new Promise((resolve, reject) => {
        s3.headObject(params, (err, resp, body) => {
          if (err) {
            reject(false);
          } else {
            resolve(params.Key);
          }
        });
      });
    } catch (error) {
      throw error;
    }
  },

  async unlinkMediaFromS3(data) {
    try {
      const params = {
        Bucket: config.aws.bucketName,
        Delete: {
          Objects: data.objects,
        },
      };
      return new Promise((resolve, reject) => {
        s3.deleteObjects(params, (err, resp, body) => {
          if (err) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      throw error;
    }
  },

  async unlinkVideoFromS3(data) {
    try {
      const params = {
        Bucket: config.aws.videoSourceBucketName,
        Delete: {
          Objects: data.objects,
        },
      };
      return new Promise((resolve, reject) => {
        s3.deleteObjects(params, (err, resp, body) => {
          if (err) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
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


      const params = {
        Bucket: config.aws.bucketName,
        Key: bucketPath,
        Body: fs.createReadStream(requestData.imagePath),
        ACL: 'public-read'
      };
      // Upload new image, careful not to upload it in a path that will trigger the function again!
      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({ basePath: bucketPath });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  },
};
