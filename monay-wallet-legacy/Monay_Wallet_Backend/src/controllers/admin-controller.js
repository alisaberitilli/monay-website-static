import HttpStatus from 'http-status';
import repositories from '../repositories';
import transactionRepository from '../repositories/transaction-repository';
import utility from '../services/utility';
import models from '../models';
const { PaymentRequest, Transaction } = models;
const { userRepository, paymentRequestRepository } = repositories;

export default {
  /**
   * Get admin dashboard detail count
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getDashboardDetail(req, res, next) {
    try {

      let data = {
        total_users: 0,
        total_last_week_users: 0,
        total_current_week_users: 0,
        total_merchant: 0,
        total_last_week_merchant: 0,
        total_current_week_merchant: 0,
        total_transaction: 0,
        faild_transaction: 0,
        success_transaction: 0,
        total_transaction_count: 0,
        total_transaction_lastweek_count: 0,
        total_transaction_currentweek_count: 0,
        faild_transaction_lastweek_count: 0,
        faild_transaction_currentweek_count: 0,
        faild_transaction_count: 0,
        success_transaction_lastweek_count: 0,
        success_transaction_currentweek_count: 0,
        success_transaction_count: 0,
        payment_request: 0,
        payment_lastweek_request: 0,
        payment_currentweek_request: 0,
        withdrawal_request: 0,
        withdrawal_lastweek_request: 0,
        withdrawal_currentweek_request: 0,
        withdrawal_pending_request: 0,
        withdrawal_pending_lastweek_request: 0,
        withdrawal_pending_currentweek_request: 0
      };

      const transactionInfo = await transactionRepository.getTransactionTotal();
      const transactionCount = await transactionRepository.getTransactionCount();
      const totalUsers = await userRepository.getUserCount({ userType: 'user' });
      const totalMerchants = await userRepository.getUserCount({ userType: 'merchant' });
      const paymentRequest = await PaymentRequest.count();
      const paymentRequestCount = await paymentRequestRepository.getPaymentRequestCount();
      const withdrawalRequest = await Transaction.count({ where: { actionType: 'withdrawal' } });
      const withdrawalPendingRequest = await Transaction.count({ where: { actionType: 'withdrawal', paymentStatus: 'pending' } });
      const withdrawalRequestCount = await transactionRepository.getWithdrawRequestCount();
      const withdrawalPendingRequestCount = await transactionRepository.getWithdrawPendingRequestCount();

      data.payment_request = paymentRequest;
      data.withdrawal_request = withdrawalRequest;
      data.withdrawal_pending_request = withdrawalPendingRequest;

      if (totalUsers) {
        data.total_users = totalUsers.totalUsers;
        data.total_last_week_users = totalUsers.totalLastWeekUsers;
        data.total_current_week_users = totalUsers.totalCurrentWeekUsers;
      }
      if (withdrawalRequestCount) {
        data.withdrawal_lastweek_request = withdrawalRequestCount.lastWeekWithdrawCount;
        data.withdrawal_currentweek_request = withdrawalRequestCount.currentWeekWithdrawCount;
      }
      if (withdrawalPendingRequestCount) {
        data.withdrawal_pending_lastweek_request = withdrawalPendingRequestCount.lastWeekWithdrawPendingCount;
        data.withdrawal_pending_currentweek_request = withdrawalPendingRequestCount.currentWeekWithdrawPendingCount;
      }
      if (paymentRequestCount) {
        data.payment_lastweek_request = paymentRequestCount.lastWeekPaymentCount;
        data.payment_currentweek_request = paymentRequestCount.currentWeekPaymentCount;
      }
      if (totalMerchants) {
        data.total_merchant = totalMerchants.totalUsers;
        data.total_last_week_merchant = totalMerchants.totalLastWeekUsers;
        data.total_current_week_merchant = totalMerchants.totalCurrentWeekUsers;
      }

      if (transactionInfo) {
        data.total_transaction = transactionInfo.totalTransactionAmount;
        data.faild_transaction = transactionInfo.failedTransactionAmount;
        data.success_transaction = transactionInfo.successTransactionAmount;
      }
      if (transactionCount) {
        data.total_transaction_count = transactionCount.totalTransactionCount;
        data.total_transaction_lastweek_count = transactionCount.totalTransactionLastWeekCount;
        data.total_transaction_currentweek_count = transactionCount.totalTransactionCurrentWeekCount;

        data.faild_transaction_count = transactionCount.failedTransactionCount;
        data.faild_transaction_lastweek_count = transactionCount.failedTransactionLastWeekCount;
        data.faild_transaction_currentweek_count = transactionCount.failedTransactionCurrentWeekCount;

        data.success_transaction_count = transactionCount.successTransactionCount;
        data.success_transaction_lastweek_count = transactionCount.successTransactionLastWeekCount;
        data.success_transaction_currentweek_count = transactionCount.successTransactionCurrentWeekCount;
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get transaction status graph
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getDashboardGraph(req, res, next) {
    try {
      let data = [];
      data.push(await transactionRepository.getDashboardGraphData(req, 'success'));
      // data.push(await transactionRepository.getDashboardGraphData(req, 'pending'));
      data.push(await transactionRepository.getDashboardGraphData(req, 'failed'));
      res.status(HttpStatus.OK).json({
        success: true,
        data: data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get transaction type graph
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getDashboardLineGraph(req, res, next) {
    try {
      let data = [];
      data.push(await transactionRepository.getDashboardLineGraph(req, 'transfer'));
      data.push(await transactionRepository.getDashboardLineGraph(req, 'deposit'));
      data.push(await transactionRepository.getDashboardLineGraph(req, 'withdrawal'));
      res.status(HttpStatus.OK).json({
        success: true,
        data: data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL')
      });
    } catch (error) {
      next(error);
    }
  }
};
