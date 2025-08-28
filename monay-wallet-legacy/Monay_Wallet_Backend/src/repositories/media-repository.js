import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3-transform';
import sharp from 'sharp';
import HttpStatus from 'http-status';
import config from '../config';
import models from '../models';
import s3Bucket from '../services/s3-bucket';
import loggers from '../services/logger';
import accountRepository from './account-repository';
const QRCode = require('qrcode')

const { MediaTemp, User } = models;
const { Op, literal } = models.Sequelize;


const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  Bucket: config.aws.bucketName,
  signatureVersion: 'v4',
  region: config.aws.region //'ap-south-1'
});

// Transform image Ref : https://stackoverflow.com/a/40237279
const storageAWS = multerS3({
  s3: s3,
  // add bucketname here
  bucket: function (req, file, cb) {
    const bucketPath = config.aws.bucketName
    cb(null, bucketPath);
  },
  //public-read: available publically, authenticated-read: need to create signed up url
  acl: function (req, file, cb) {
    const acl = (req.params.mediaFor === 'user-kyc') ? 'authenticated-read' : 'public-read'
    cb(null, acl);
  },
  //attachment need to add for files
  contentDisposition: function (req, file, cb) {
    const contentDisposition = (req.params.mediaFor === 'user-kyc') ? 'attachment' : ''
    cb(null, contentDisposition);
  },
  // AES server side encryption here
  serverSideEncryption: function (req, file, cb) {
    const serverSideEncryption = 'AES256'
    cb(null, serverSideEncryption);
  },
  // we get submitted file name 
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
  //we get extraa key here (body,query string,params etc) for doing other task
  key: function (req, file, cb) {
    const { mediaType, mediaFor } = req.params;
    let dir = ''
    if (mediaType === 'pdf') {
      const datetimestamp = Date.now();
      const filename = file.originalname.replace(/[^A-Z0-9.]/gi, '-');
      const fileArray = filename.split('.');
      const ext = fileArray.pop();
      const newFileName = `${fileArray.join('-')}-${datetimestamp}.${ext}`
      file.newFileName = newFileName
      if (mediaType === 'pdf') {
        dir = `${mediaFor}/`
      }
    }
    cb(null, `${dir}${file.newFileName || ''}`);
  },
  // we create thumbanil if media type image
  shouldTransform: function (req, file, cb) {
    cb(null, /^image/i.test(file.mimetype))
  },
  transforms: [{
    id: 'original',
    key: function (req, file, cb) {
      const { mediaFor } = req.params;
      const dir = mediaFor;
      cb(null, `${dir}/${file.newFileName}`);
    },
    transform: function (req, file, cb) {
      cb(null, sharp().jpeg({ progressive: true, force: false, quality: 80 }).png({ progressive: true, force: false, quality: 80 }))
    }
  }, {
    id: 'thumbnail',
    key: function (req, file, cb) {
      const { mediaFor } = req.params;

      const dir = `${mediaFor}/thumb`;

      cb(null, `${dir}/${file.newFileName}`);
    },
    transform: function (req, file, cb) {
      cb(null, sharp().resize({ width: 255 }).jpeg({ progressive: true, force: false, quality: 80 })
        .png({ progressive: true, force: false, quality: 80 }))
    }
  }]
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
    await sharp(req.file.path)
      .resize(150)
      .jpeg({ progressive: true, force: false })
      .png({ progressive: true, force: false })
      .toFile(`${thumbDir}/${image}`)
    return true
  } catch (error) {
    next(error);
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
      const result = await MediaTemp.findAll(
        { where }
      );

      const pendingMediaIds = [];
      const unlinkMediaPromises = result.map((media) => {
        pendingMediaIds.push(media.id);
        return this.unlinkMedia(media);
      });

      unlinkMediaPromises.push(
        MediaTemp.destroy({
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
      if (config.app.mediaStorage === 's3' && params.mediaType === 'image') {
        let originalFileObj = file.transforms.findIndex(data => data.id === 'original')
        if (originalFileObj >= 0) {
          file.key = file.transforms[originalFileObj].key
        }
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
        result = await MediaTemp.create(mediaData);
      } else {
        result = await MediaTemp.create(mediaData);
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

      const result = await MediaTemp.bulkCreate(mediaDataArray);

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
      const result = await MediaTemp.findAll({ where });
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
      let mediaData = await MediaTemp.findOne({ where });
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
      const result = await MediaTemp.update(
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
    const params = {
      Bucket: config.aws.bucketName,
      Key: path,
      Expires: 60
    };
    try {
      const url = await new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (err, url) => {
          err ? reject(err) : resolve(url);
        });
      });
      return url;
    } catch (err) {
      if (err) {
        console.log(err)
      }
    }
  },
  async generateQrCodeOnS3(userId) {
    try {
      let userInfo = await User.findOne({ where: { id: userId } });
      if (userInfo && !userInfo.qrCode) {
        let uniqueCode = await accountRepository.getUniqueId();
        QRCode.toDataURL(JSON.stringify({ userId: uniqueCode }), function (err, base64) {
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
          s3.upload(params, async function (err, data) {
            if (err) {
              console.log('ERROR MSG: ', err);
            } else {
              return await userInfo.update({ uniqueCode: uniqueCode, qrCode: bucketPath });
            }
          });
        });
      }
    } catch (error) {
      throw Error(error);
    }
  },
};
