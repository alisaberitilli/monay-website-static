import models from '../models/index.js';
import { Op } from 'sequelize';
const { UserBlock, User } = models;

export default {
    /**
     * block unblock user
     * @param {Object} req
     */
    async blockAndUnblockUser(data) {
        try {
            let status = '';
            let result = await UserBlock.findOne({
                where: data
            });
            if (result) {
                result = await result.destroy();
                status = 'unblock';
            } else {
                result = await UserBlock.create(data);
                status = 'block';
            }

            return {
                data: result,
                status: status
            };
        } catch (error) {
            throw Error(error);
        }
    },
    /**
   * Get blocked user detail
   * @param {integer} userId
   */
    async findBlockUser(data) {
        try {
            let result = await UserBlock.findOne({
                where: data
            });
            return result;
        } catch (error) {
            throw Error(error);
        }
    },
    /**
     * Get blocked user list
     * @param {Object} req
     */
    async findAll(req) {
        try {
            const userData = req.user;
            const queryData = req.query;
            let orderBy = [['createdAt', 'DESC']];
            let where = { userId: userData.id };

            const list = await UserBlock.findAndCountAll({
                where,
                attributes: [
                    'id',
                    'userId',
                    'blockUserId'
                ],
                include: [{
                    model: User,
                    as: 'blockUser',
                    where: { status: { [Op.ne]: 'deleted' } },
                    attributes: [
                        'id',
                        'firstName',
                        'lastName',
                        'profilePicture',
                        'profilePictureUrl',
                        'email',
                        'mobile',
                        'createdAt'
                    ],
                }],
                order: orderBy,
                limit: parseInt(queryData.limit || 10),
                offset: parseInt(queryData.offset || 0)
            });
            return list;
        } catch (error) {
            throw Error(error);
        }
    },


};
