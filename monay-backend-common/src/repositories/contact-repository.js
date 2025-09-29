import pkg from 'sequelize';
const { Op } = pkg;
import models from '../models/index.js';
const { Sequelize } = models.sequelize;
export default {
  /**
   * Find all existing users list registered in monay DB
   * @param {Object} whereObj 
   */
  async checkContactsInSystem(req) {
    try {
      const { body: { contacts } } = req
      let whereObj = {
        phoneNumber: { [Op.in]: contacts.map(d => d.phoneNumber) },
        role: { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer', 'merchant', 'enterprise_admin', 'enterprise_developer'] },
        status: 'active'
      }
      return await User.findAll({
        where: whereObj,
        attributes: [
          [
            Sequelize.literal(`(SELECT (CASE WHEN count(id)>0 THEN true ELSE false END) FROM user_blocks WHERE user_blocks.block_user_id=User.id AND user_blocks.user_id=${req.user.id})`),
            "isBlocked"
          ],
          'id',
          'uniqueCode',
          'profilePicture',
          'profilePictureUrl',
          'qrCodeUrl',
          'firstName',
          'lastName',
          'mobile'

        ]
      });
    } catch (error) {
      throw Error(error);
    }
  },
};
