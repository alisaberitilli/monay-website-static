import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';
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
   * Issue a new card linked to a wallet
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async issueCard(req, res, next) {
    try {
      const {
        cardType,
        cardHolderName,
        spendingLimit,
        linkedWallet,
        walletId
      } = req.body;

      // Validate required fields
      if (!cardHolderName || !linkedWallet) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Card holder name and linked wallet are required'
        });
      }

      // Generate card details
      const cardNumber = `****-****-****-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3);

      // Create card data
      const cardData = {
        cardType: cardType || 'virtual',
        cardName: cardType === 'physical' ? 'Physical Debit Card' : 'Virtual Debit Card',
        cardIcon: cardType === 'physical' ? 'card-physical' : 'card-virtual',
        cardNumber: cardNumber,
        nameOnCard: cardHolderName,
        month: expiryDate.getMonth() + 1,
        year: expiryDate.getFullYear(),
        last4Digit: cardNumber.substr(cardNumber.length - 4),
        userId: req.user.id,
        linkedWallet: linkedWallet,
        walletId: walletId || linkedWallet,
        spendingLimit: parseFloat(spendingLimit) || 10000,
        balance: 0,
        status: 'active',
        isDefault: false
      };

      // Save to database
      const result = await cardRepository.create(cardData);

      if (result) {
        res.status(HttpStatus.CREATED).json({
          success: true,
          data: {
            id: result.id,
            cardNumber: cardNumber,
            cardHolder: cardHolderName,
            expiryDate: `${expiryDate.getMonth() + 1}/${expiryDate.getFullYear() % 100}`,
            status: 'active',
            type: cardType || 'virtual',
            balance: 0,
            spendingLimit: parseFloat(spendingLimit) || 10000,
            linkedWallet: linkedWallet
          },
          message: `${cardType === 'physical' ? 'Physical' : 'Virtual'} card issued successfully and linked to wallet: ${linkedWallet}`
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to issue card'
        });
      }
    } catch (error) {
      console.error('Card issuance error:', error);
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

  /**
   * Issue a new card (virtual or physical) with Stripe integration
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async issueCard(req, res, next) {
    try {
      const { cardType, walletId, shippingAddress, spendingLimits } = req.body;
      const userId = req.user.id;

      // For now, return a mock response until Stripe issuing is fully integrated
      const mockCard = {
        id: `card_${Date.now()}`,
        userId,
        walletId,
        type: cardType || 'virtual',
        last4: '4242',
        brand: 'Visa',
        status: 'active',
        createdAt: new Date()
      };

      res.status(HttpStatus.OK).json({
        success: true,
        data: mockCard,
        message: 'Card issued successfully'
      });
    } catch (error) {
      next(error);
    }
  },
};
