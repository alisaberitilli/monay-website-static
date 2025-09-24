import HttpStatus from 'http-status';
import utility from '../services/utility.js';
import repositories from '../repositories';
import models from '../models/index.js';
const { transactionRepository } = repositories;
const { UserBankAccount, Transaction } = models;

export default {
    /**
    * Check bank exists
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
    async checkBankExists(req, res, next) {
        try {
            const { body: { bankId }, user: { id } } = req
            if (bankId) {
                let bankInfo = await UserBankAccount.findOne({ where: { id: bankId, userId: id } });
                if (bankInfo) {
                    req.body.cnpToken = bankInfo.cnpToken;
                    req.body.bankName = bankInfo.bankName;
                    req.body.routingNumber = bankInfo.routingNumber;
                    req.body.last4Digit = bankInfo.last4Digit;
                    next();
                } else {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        success: false,
                        data: [],
                        message: utility.getMessage(req, false, 'NOT_FOUND_BANK')
                    });
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    data: [],
                    message: utility.getMessage(req, false, 'NOT_FOUND_BANK')
                });
            }
        } catch (error) {
            next(error);
        }
    },

    /**
    * Check wallet balance
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
    async checkWalletBalance(req, res, next) {
        try { 
            const walletInfo = await transactionRepository.getWalletBalance(req.user.id);
            const childAmount = await transactionRepository.getAllChildAmount(req.user.id);
            const remainAmount =  parseFloat(walletInfo.totalWalletAmount) - parseFloat(childAmount)
            if (remainAmount >= req.body.amount) {
                next();
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    data: [],
                    message: utility.getMessage(req, false, 'INSUFFICIENT_BALANCE')
                });
            }
        } catch (error) {
            next(error);
        }
    },

    /**
    * Check transaction exist by query params
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
   */
    async checkTransactionExists(req, res, next) {
        try {
            let { transactionId } = req.params
            const result = await Transaction.findOne({ where: { id: transactionId, paymentStatus: 'pending' } });
            if (result) {
                req.transaction = result;
                next();
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    data: [],
                    message: utility.getMessage(req, false, 'TRANSACTION_NOT_FOUND')
                });
            }
        } catch (error) {
            next(error);
        }
    },
};
