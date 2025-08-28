
import mediaRepository from './media-repository';
import models from '../models';
import { Op } from 'sequelize';
import notificationRepository from './notification-repository';
const { UserKyc, MediaTemp } = models;


export default {
  /**
  * Upload user kyc by user
  * @param {Object} req
  */
  async saveUserKyc(req) {
    try {
      const userData = req.user;
      req.body.userId = userData.id;
      let bodyData = req.body;
      bodyData.status = 'uploaded';
      const result = await UserKyc.create(bodyData);
      await userData.update({ kycStatus: 'uploaded', isKycVerified: false });
      const mediaUsedArray = [bodyData?.idProofImage, bodyData?.addressProofImage];
      if (bodyData?.addressProofBackImage) {
        mediaUsedArray.push(bodyData?.addressProofBackImage);
      }
      if (bodyData?.idProofBackImage) {
        mediaUsedArray.push(bodyData?.idProofBackImage);
      }
      //Update media detail
      await mediaRepository.makeUsedMedias(mediaUsedArray);
      // send notification 
      await notificationRepository.KycUploadedNotification(req);
      // unlink media from s3 bucket 
      await this.UnlinkUserKyc(userData.id)
      return result;
    } catch (error) {
      throw Error(error);
    }
  },


  /**
 * Check user kyc by file path
 * @param {Object} req
 */
  async checkUserKyc(req) {
    try {
      const userData = req.user;
      return await UserKyc.findOne({ where: { userId: userData.id, idProofImage: req.query.filePath } });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
 *unlink user kys
 * @param {Object} req
 */
  async UnlinkUserKyc(userId) {
    try {
      let KycData = await UserKyc.findAll({
        where: {
          userId: userId,
          status: { [Op.in]: ['rejected', 'pending'] }
        }
      });
      if (KycData.length) {
        const unlinkMediaPromises = KycData.map(async (kyc) => {
          if (kyc.idProofImage) {
            await mediaRepository.findMediaByBasePathAndUnlink(kyc.idProofImage)
          }
          if (kyc.addressProofImage) {
            await mediaRepository.findMediaByBasePathAndUnlink(kyc.addressProofImage)
          }
          await kyc.update({ status: 'deleted' });

        });
        await Promise.all(unlinkMediaPromises);
      }
    } catch (error) {
      throw Error(error);
    }
  },

};
