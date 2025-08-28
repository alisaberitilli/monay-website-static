import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility';
const { cardRepository } = repositories;

export default {
  /**
   * Save user card
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async saveCardRequest(req, res, next) {
    try {
      const result = await cardRepository.saveCardRequest(req);
      let message = utility.getMessage(req, false, 'NEW_CARD_ADDED');
      if (result) {
        if (result.status == 'invalid') {
          let apiResponse = JSON.parse(result.apiResponse);
          if (apiResponse && typeof apiResponse === "object") {
            message = apiResponse.message;
          } else {
            message = utility.getMessage(req, false, 'TRY_AGAIN');
          }
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: message
          });
        } else {
          res.status(HttpStatus.OK).json({
            success: true,
            data: result,
            message: message
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'CARD_EXIST')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * get user card detail
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getSpecificCard(req, res, next) {
    res.status(HttpStatus.OK).json({
      success: true,
      data: req.card,
      message: utility.getMessage(req, false, 'CARD_FOUND')
    });
  },
  /**
   * get user card list by user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getUserCards(req, res, next) {
    try {
      const result = await cardRepository.findAll({ userId: req.user.id, status: 'active' });
      let data = [];
      await result.forEach(item => {
        let today, someday;
        let exMonth = item.month;
        let exYear = item.year;
        today = new Date();
        someday = new Date();
        someday.setFullYear(exYear, exMonth, 1);
        item = item.toJSON();
        if (someday < today) {
          item.isExpired = true
        } else {
          item.isExpired = false
        }
        data.push(item);
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: data,
        message: utility.getMessage(req, false, 'USER_CARD_FOUND')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * delete user card by id
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async deleteSpecificCard(req, res, next) {
    try {
      const result = await cardRepository.deleteCard(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'USER_CARD_DELETED')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'USER_CARD_NOT_DELETED')
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
