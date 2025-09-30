import fs from 'fs';
import path from 'path';
import { S3Client, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import Jimp from 'jimp';
import HttpStatus from 'http-status';
import QRCode from 'qrcode';
import config from '../config/index.js';
import models from '../models/index.js';
import s3Bucket from '../services/s3-bucket.js';
import loggers from '../services/logger.js';
import accountRepository from './account-repository.js';

// Jimp helper functions to replace Sharp
const jimpTransforms = {
  // Optimize image with Jimp
  optimizeImage: async (inputPath, outputPath, quality = 80) => {
    try {
      const image = await Jimp.read(inputPath);
      await image
        .quality(quality)
        .write(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Jimp optimize error:', error);
      throw error;
    }
  },
  
  // Create thumbnail with Jimp
  createThumbnail: async (inputPath, outputPath, width = 255, height = 255, quality = 80) => {
    try {
      const image = await Jimp.read(inputPath);
      await image
        .resize(width, height)
        .quality(quality)
        .write(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Jimp thumbnail error:', error);
      throw error;
    }
  },

  // Process image with custom transformations
  processImage: async (inputPath, outputPath, options = {}) => {
    try {
      const { 
        width = null, 
        height = null, 
        quality = 80,
        format = null 
      } = options;
      
      let image = await Jimp.read(inputPath);
      
      if (width || height) {
        image = image.resize(width || Jimp.AUTO, height || Jimp.AUTO);
      }
      
      image = image.quality(quality);
      
      // Convert format if specified
      if (format === 'jpeg' || format === 'jpg') {
        image = image.background(0xFFFFFFFF); // White background for JPEG
      }
      
      await image.write(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Jimp process error:', error);
      throw error;
    }
  }
};
// Imports moved to top of file

const { Op, literal } = models.Sequelize;


const s3Client = new S3Client({
  region: config.aws.region, //'ap-south-1'
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  }
});

// multer-s3 v3 configuration
const storageAWS = multerS3({
  s3: s3Client,
  bucket: config.aws.bucketName,
  acl: function (req, file, cb) {
    const acl = (req.params.mediaFor === 'user-kyc') ? 'authenticated-read' : 'public-read'
    cb(null, acl);
  },
  contentDisposition: function (req, file, cb) {
    const contentDisposition = (req.params.mediaFor === 'user-kyc') ? 'attachment' : undefined
    cb(null, contentDisposition);
  },
  serverSideEncryption: 'AES256',
  metadata: function (req, file, cb) {
    const datetimestamp = Date.now();
    const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
    const fileArray = filename.split('.');
    const ext = fileArray.pop();
    const newFileName = `${fileArray.join('-')}-${datetimestamp}.${ext}`
    file.newFileName = newFileName
    cb(null, {
      fieldName: file.fieldname
    });
  },
  key: function (req, file, cb) {
    const { mediaType, mediaFor } = req.params;
    const datetimestamp = Date.now();
    const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
    const fileArray = filename.split('.');
    const ext = fileArray.pop();
    const newFileName = `${fileArray.join('-')}-${datetimestamp}.${ext}`
    file.newFileName = newFileName
    
    let dir = mediaFor;
    // For images, we'll handle thumbnails separately after upload
    if (mediaType === 'pdf') {
      dir = `${mediaFor}/`
    } else if (mediaType === 'image') {
      dir = `${mediaFor}/`
    }
    
    cb(null, `${dir}${newFileName}`);
  }
});

// using below function for local file system diskStorage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { mediaType, mediaFor } = req.params;
    const fileDir = path.join(__dirname, `../../public/uploads/${mediaType}/${mediaFor}/thumb`);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true }, (err) => {
        throw Error(err);
      });
    }

    file.thumbDir = fileDir

    cb(null, `public/uploads/${mediaType}/${mediaFor}/`);
  },
  filename: (req, file, cb) => {
    const datetimestamp = Date.now();
    const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
    const fileArray = filename.split('.');
    const ext = fileArray.pop();
    cb(null, `${fileArray.join('-')}-${datetimestamp}.${ext}`);
  },
});

// we will decide here storage type
const uploadFile = multer({
  storage: config.app.mediaStorage == 'local' ? storage : storageAWS,
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    let fileFormats = [];
    if (req.params.mediaType === 'image') {
      fileFormats = ['.png', '.jpg', '.gif', '.jpeg'];
    } else if (req.params.mediaType === 'video') {
      fileFormats = ['.mp4', '.mov', '.wmv'];
    } else if (req.params.mediaType === 'audio') {
      fileFormats = ['.aac', '.m4a'];
    } else if (req.params.mediaType === 'pdf') {
      fileFormats = ['.pdf'];
    }
    if (!fileFormats.includes(ext.toLowerCase())) {
      return callback(new Error(`Allowed file format ${fileFormats.toString()}.`));
    }
    callback(null, true);
  },
  limits: {
    fileSize: config.app.mediaUploadSizeLimit
  },
});

/**
   * Create thumb image
   */
const createThumb = async (req, next) => {
  const { filename: image, thumbDir } = req.file
  try {
    // Using Jimp for thumbnail generation
    const inputPath = req.file.path;
    const outputPath = `${thumbDir}/${image}`;
    
    await jimpTransforms.createThumbnail(inputPath, outputPath, 150, 150, 80);
    
    req.file.thumbnailPath = outputPath;
    return true
  } catch (error) {
    console.error('Jimp thumbnail error:', error);
    // Continue without thumbnail in case of error
    next();
    return false;
  }
};


export default {

  /**
   * Find all and remove
   */
  async findAllAndRemove() {
    try {
      const where = {
        [Op.and]: literal('TIMESTAMPDIFF(MINUTE, `created_at`, NOW()) > 30'),
        status: 'pending',
      };
      const result = await models.MediaTemp.findAll(
        { where }
      );

      const pendingMediaIds = [];
      const unlinkMediaPromises = result.map((media) => {
        pendingMediaIds.push(media.id);
        return this.unlinkMedia(media);
      });

      unlinkMediaPromises.push(
        models.MediaTemp.destroy({
          where: {
            id: {
              [Op.in]: pendingMediaIds,
            },
          },
        }),
      );

      await Promise.all(unlinkMediaPromises);

      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Unlink media file
   * @param {Object} media
   */
  async unlinkMedia(media) {
    const fileDir = media.basePath;
    const objects = [{ Key: media.basePath }];
    const regexp = RegExp('image(\\\\|/)');
    if (fileDir && fileDir.match(regexp)) {
      const imagePathArray = fileDir.split('/');
      const imageName = imagePathArray.pop();
      imagePathArray.push('thumb');
      imagePathArray.push(imageName);
      const thumbPath = imagePathArray.join('/');
      if (thumbPath) {
        objects.push({ Key: thumbPath });
      }
    }
    const imageObj = { objects };
    if (config.app.mediaStorage == 's3') {
      if (media.mediaFor === 'video-track') {
        s3Bucket.unlinkVideoFromS3(imageObj);
      } else {
        s3Bucket.unlinkMediaFromS3(imageObj);
      }
    } else {
      // For local delete media

      await this.unlinkMediaFromLocal(media);
    }
  },

  /**
   * unlink media file from local
   * @param {Object} media
   */
  async unlinkMediaFromLocal(media) {
    try {
      const fileDir = path.join(__dirname, `../../${media.basePath}`);
      fs.existsSync(fileDir) && (await fs.unlinkSync(fileDir));

      const regexp = RegExp('image(\\\\|/)');
      if (fileDir && fileDir.match(regexp)) {
        const imagePathArray = fileDir.split('/');
        const imageName = imagePathArray.pop();
        imagePathArray.push('thumb');
        imagePathArray.push(imageName);
        const thumbPath = imagePathArray.join('/');
        fs.existsSync(thumbPath) && (await fs.unlinkSync(thumbPath));
      }
    } catch (error) {
      loggers.errorLogger.error('thumb image upload error %s', error.message);
      throw Error(error);
    }
  },

  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async uploadMedia(req, res, next) {
    try {
      const { params } = req;
      const { mediaType, mediaFor } = params;
      params.mediaType = mediaType;
      uploadFile.single('file')(req, res, async (error) => {
        if (error instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          if (error.code == 'LIMIT_FILE_SIZE') {
            error.message = 'File too Big, please select a file less than 15MB.';
          }
          error.status = HttpStatus.BAD_REQUEST
          return next(error);
        }
        if (error) {

          // An unknown error occurred when uploading.
          error.status = HttpStatus.BAD_REQUEST
          return next(error);
        }

        if (config.app.mediaStorage === 'local') {
          //Generate Image thumb
          if (mediaType === 'image') {
            await createThumb(req, next);
          }
        }
        next()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save media file
   * @param {Object} req
   */
  async create({
    params, file, headers, connection,
  }) {
    try {
      let result = '';
      const mediaType = config.app.mediaStorage == 'local' ? params.mediaType : config.aws.bucketPrefix;
      const imageDir = path.join(__dirname, `../../${file.path}`);
      const HTTPs = connection.encrypted == undefined ? 'http' : 'https';
      // multer-s3 v3 no longer uses transforms, key is directly available
      if (config.app.mediaStorage === 's3' && params.mediaType === 'image') {
        // file.key is already set by the key function in multerS3 configuration
      }
      const mediaData = {
        name: file.filename || file.originalname,
        basePath: file.path || file.key,
        imagePath: imageDir,
        baseUrl: `${HTTPs}://${headers.host}/${file.path}`,
        mediaType,
        mediaFor: params.mediaFor,
        isThumbImage: false,
        status: 'pending',
      };

      // Upload image on s3
      if (config.app.mediaStorage == 's3') {
        mediaData.baseUrl = config.aws.s3BucketUrl + file.key;
        result = await models.MediaTemp.create(mediaData);
      } else {
        result = await models.MediaTemp.create(mediaData);
      }
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Save multiple media file
   * @param {Object} req
   */
  async createMultiple(req) {
    const {
      params, files, headers, connection,
    } = req;
    try {
      const HTTPs = connection.encrypted == undefined ? 'http' : 'https';
      const mediaDataArray = files.map(file => ({
        name: file.filename,
        basePath: file.path,
        baseUrl: `${HTTPs}://${headers.host}/${file.path}`,
        mediaType: params.mediaType,
        mediaFor: params.mediaFor,
        status: 'pending',
      }));

      const result = await models.MediaTemp.bulkCreate(mediaDataArray);

      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Find all media file by base_path
   * @param {Array} paths
   */
  async findAllByBasePathIn(paths) {
    try {
      const where = {
        status: 'pending',
        basePath: {
          [Op.in]: paths,
        },
      };
      const result = await models.MediaTemp.findAll({ where });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Find  media file by base_path and unlink 
   * @param {Array} paths
   */
  async findMediaByBasePathAndUnlink(paths) {
    try {
      const where = { basePath: paths };
      let mediaData = await models.MediaTemp.findOne({ where });
      if (mediaData) {
        await this.unlinkMedia(mediaData);
        await mediaData.update({ status: 'deleted' });
      }
      return true;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Change media status
   * @param {Array} paths
   */
  async makeUsedMedias(paths) {
    const transaction = await models.sequelize.transaction();
    try {
      const mediaData = {
        status: 'used',
      };
      const result = await models.MediaTemp.update(
        mediaData,
        {
          where: {
            basePath: {
              [Op.in]: paths,
            },
          },
        },
        {
          transaction,
        },
      );

      await transaction.commit();

      return result;
    } catch (error) {
      await transaction.rollback();
      throw Error(error);
    }
  },
  /**
   * Change media status
   * @param {Array} paths
   */
  async getSingedUrl(path) {
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: path,
    });
    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
      return url;
    } catch (err) {
      if (err) {
        console.log(err)
      }
    }
  },
  async generateQrCodeOnS3(userId) {
    try {
      let userInfo = await models.User.findOne({ where: { id: userId } });
      if (userInfo && !userInfo.qrCode) {
        let uniqueCode = await accountRepository.getUniqueId();
        QRCode.toDataURL(JSON.stringify({ userId: uniqueCode }), async function (err, base64) {
          const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
          const type = base64.split(';')[0].split('/')[1];
          let bucketPath = `qrcode`;
          bucketPath = `${bucketPath}/qrcode_${uniqueCode}.png`;
          const params = {
            Bucket: config.aws.bucketName,
            Key: `${bucketPath}`, // type is not required
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64', // required
            ContentType: `image/${type}` // required. Notice the back ticks
          }
          try {
            const command = new PutObjectCommand(params);
            const data = await s3Client.send(command);
            return await userInfo.update({ uniqueCode: uniqueCode, qrCode: bucketPath });
          } catch (err) {
            console.log('ERROR MSG: ', err);
          }
        });
      }
    } catch (error) {
      throw Error(error);
    }
  },
};
