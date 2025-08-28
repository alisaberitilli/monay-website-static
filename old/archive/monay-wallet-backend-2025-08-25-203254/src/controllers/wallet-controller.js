import HttpStatus from 'http-status';
import repositories from '../repositories';

const { transactionRepository } = repositories;

export default {
  /**
  * Get user wallet detail
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async getMyWallet(req, res, next) {
    try {
      let data = {
        creditWalletAmount: 0,
        debitWalletAmount: 0,
        totalWalletAmount: 0
      };
      const walletAmmount = await transactionRepository.getWalletBalance(req.user.id);
      if (walletAmmount) {
        data.creditWalletAmount = walletAmmount.creditWalletAmount.toFixed(2);
        data.debitWalletAmount = walletAmmount.debitWalletAmount.toFixed(2);
        data.totalWalletAmount = walletAmmount.totalWalletAmount.toFixed(2);
        data.secondaryUserLimit = walletAmmount.secondaryUserLimit.toFixed(2);
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: data,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
}