import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';
import models from "../models/index.js";

const { UserCard } = models;

const { cardRepository } = repositories;

export default {
  /**
   * Check card id exist
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
  */
  async checkCardIdExists(req, res, next) {
    try {
      let { cardId } = req.params
      let { id: userId } = req.user
      if (cardId) {
        const result = await cardRepository.findOne({ id: cardId, userId, status: 'active' });
        if (result) {
          req.card = result
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'NOT_FOUND_CARD')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'NOT_FOUND_CARD')
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check optional card id exist and card details save
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
  */
  async checkOptionalCardIdExists(req, res, next) {
    try {
      const { body: { cardId }, user: { id } } = req;
      if (cardId) {
        // Exist card check
        const result = await cardRepository.findOne({ id: cardId, userId: id, status: 'active' });
        if (result) {
          await cardRepository.userCardIsDefaultUpdate(req);
          await result.update({ isDefault: true });
          await UserCard.update({isDefault:true},{where:{id: cardId}})
          req.card = result
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'NOT_FOUND_CARD')
          });
        }
      } else {
        // Card details save
        req.body.isDefault = true;
        const result = await cardRepository.saveCardRequest(req);
        if (result) {
          if (result.status == 'invalid') {
            let apiResponse = JSON.parse(result.apiResponse);
            let message = utility.getMessage(req, false, 'TRY_AGAIN');
            if (apiResponse && typeof apiResponse === "object") {
              message = apiResponse.message;
            }
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: message
            });
          } else {
            // Card created next
            req.body.cardId = result?.id;
            next();
          }
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'CARD_EXIST')
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check auto toPup card id exist
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
  */
  async checkAutoTopUpCardIdExists(req, res, next) {
    try {
      const { user: { id } } = req;
        const result = await cardRepository.findOne({ isDefault: true, userId: id, status: 'active' });
        if (result) {
          req.card = result
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'AUTO_TOPUP_DETAILS_SET')
          });
        }
    } catch (error) {
      next(error);
    }
  },
};
