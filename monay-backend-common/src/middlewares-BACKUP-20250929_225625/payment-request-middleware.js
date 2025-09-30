import HttpStatus from 'http-status';
import utility from '../services/utility.js';
import repositories from '../repositories/index.js';
import models from '../models/index.js';
import paymentGatewayAPIs from '../services/payment-gateway.js';
import moment from 'moment-timezone';
import pkg from 'sequelize';
const { Op } = pkg;
const { Sequelize } = models.sequelize;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const { paymentRequestRepository, transactionRepository, cardRepository, userRepository, settingRepository } = repositories;
const { UserCard, UserBankAccount, Transaction, PaymentRequest, ChildParent } = models;

  const jsonStringify=(data)=>{
    try{
      return JSON.parse(data)
    }catch(err){
      return {}
    }
  }

export default {
  /**
   * Check request user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkRequestedUser(req, res, next) {
    try {
      if (req?.user?.id != req?.body?.toUserId) {
        if (
          req?.user?.phoneNumberCountryCode ===
          req?.userInfo?.phoneNumberCountryCode
        ) {
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "TRANSACTION_RESTRICTED"),
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "INVALID_ACTION"),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if User is secondary
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkSecondaryUser(req, res, next) {
    try {
      if (req?.user?.userType === "secondary_user" && !req?.body?.parentId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "PARENT_ID_REQUIRED"),
        });
      } else if (req?.user?.userType === "user") {
        next();
      } else {
        const result = await ChildParent.findOne({
          where: {
            parentId: req?.body?.parentId,
            userId: req?.user?.id,
            status: "active",
          },
        });
        if (!result) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(
              req,
              false,
              "ASK_TO_PARENT_FOR_ACTIVATE"
            ),
          });
        } else {
          next();
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check user decline
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserDecline(req, res, next) {
    try {
      const userData = req.user;
      const { toUserId } = req.body;
      let currentDateTime = await userRepository.getCurrentDateTiem(req);
      currentDateTime = moment(currentDateTime)
        .subtract(24, "hours")
        .format(dateFormat);
      currentDateTime = moment.utc(currentDateTime);
      let where = {
        toUserId,
        fromUserId: userData.id,
        status: "declined",
        updatedAt: { [Op.gte]: currentDateTime },
      };
      let request = await paymentRequestRepository.findOneDeclined(where);
      if (request) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "DECLINE_PAYMENT_REQUEST"),
        });
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check payment request exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkPaymentRequest(req, res, next) {
    try {
      let where = {
        id: req.body.requestId,
        toUserId: req.user.id,
        status: "pending",
      };
      let request = await paymentRequestRepository.findOne(where);
      if (request) {
        req.paymentRequest = request;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "INVALID_REQUEST"),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check pay pament request exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkPayPaymentRequest(req, res, next) {
    try {
      let where = {
        id: req.body.requestId,
        fromUserId: req.body.toUserId,
        toUserId: req.user.id,
        status: "pending",
      };
      let request = await paymentRequestRepository.findOne(where);
      if (request) {
        req.paymentRequest = request;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "INVALID_REQUEST"),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check paymnet method
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkPaymentMethod(req, res, next) {
    try {
      let { paymentMethod, cardId, bankId, cardNumber, parentId, amount } =
        req.body;
      let timezone = req.headers["timezone"]
        ? req.headers["timezone"]
        : "Asia/kolkata";
      if (paymentMethod == "card") {
        if (cardId) {
          let cardInfo = await UserCard.findOne({
            where: { id: cardId, userId: req.user.id, status: "active" },
          });
          if (cardInfo) {
            req.body.cardType = cardInfo.cardType;
            req.body.cardName = cardInfo.cardName;
            req.body.cnpToken = cardInfo.cnpToken;
            req.body.last4Digit = cardInfo.last4Digit;
            req.body.nameOnCard = cardInfo.nameOnCard;
            req.body.month = cardInfo.month;
            req.body.year = cardInfo.year;
            var today, someday;
            var exMonth = req.body.month;
            var exYear = req.body.year;
            today = moment().tz(timezone).format(dateFormat);
            today = new Date(today);
            someday = new Date();
            someday.setFullYear(exYear, exMonth, 1);
            if (someday < today) {
              res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                data: [],
                message: utility.getMessage(req, false, "CARD_EXPIRED"),
              });
            } else {
              next();
            }
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "INVALID_CARD"),
            });
          }
        } else {
          var today, someday;
          var exMonth = req.body.month;
          var exYear = req.body.year;
          today = new Date();
          someday = new Date();
          someday.setFullYear(exYear, exMonth, 1);
          if (someday < today) {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "CARD_EXPIRED"),
            });
          } else {
            if (req.body.saveCard && req.body.saveCard == "yes") {
              req.body.cardType = null;
              let result = await cardRepository.saveCardRequest(req);
              if (result) {
                let message = utility.getMessage(req, false, "NEW_CARD_ADDED");
                if (result.status == "invalid") {
                   let apiResponse = JSON.parse(result?.apiResponse) ?? {};
                  if (apiResponse && typeof apiResponse === "object") {
                    message = apiResponse.message;
                  } else {
                    message = utility.getMessage(req, false, "TRY_AGAIN");
                  }
                  res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    data: [],
                    message: message,
                  });
                } else {
                  req.body.cardType = result.cardType;
                  req.body.cardName = result.cardName;
                  req.body.cnpToken = result.cnpToken;
                  req.body.last4Digit = result.last4Digit;
                  req.body.nameOnCard = result.nameOnCard;
                  req.body.month = result.month;
                  req.body.year = result.year;
                  next();
                }
              } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                  success: false,
                  data: [],
                  message: utility.getMessage(req, false, "CARD_EXIST"),
                });
              }
            } else {
              req.body.cardName = utility.getCardType(cardNumber);
              req.body.cardNumber = cardNumber;
              req.body.last4Digit = cardNumber.substr(cardNumber.length - 4);
              req.body.cardId = null;
              let transactionId = await paymentGatewayAPIs.getCardUniqueId();
              req.body.transactionId = transactionId;
              let cardTokenizationRes =
                await paymentGatewayAPIs.cardTokenization(req);
              if (cardTokenizationRes?.data?.statusCode === "200") {
                req.body.cnpToken = cardTokenizationRes?.data?.token;
                next();
              } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                  success: false,
                  data: [],
                  message: utility.getMessage(req, false, "INVALID_CARD"),
                });
              }
            }
          }
        }
      } else if (paymentMethod == "wallet") {
        const refillAmount = 0;
        const walletUser =
          req.user.userType === "secondary_user"
            ? req.body.parentId
            : req.user.id;
        const TotalChildAmount = await transactionRepository.getAllChildAmount(
          walletUser
        );
        const walletInfo = await transactionRepository.getWalletBalance(
          walletUser
        );
        let remainAmount =
          parseFloat(walletInfo.totalWalletAmount) -
          parseFloat(TotalChildAmount);
        if (req.user.userType === "user") {
          if (remainAmount < amount) {
            /***
             * InSufficient balance for parent
             */
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "RESET_OR_REFILL"),
            });
          } else {
            req.body.remainAmount =
              parseFloat(remainAmount) - parseFloat(amount);
            next();
          }
        } else {
          let childInfo = await ChildParent.findOne({
            where: { parentId, userId: req.user.id },
          });

          if (
            childInfo?.remainAmount >= amount &&
            walletInfo.totalWalletAmount >= amount
          ) {
            req.body.remainAmount =
              parseFloat(remainAmount) -
              parseFloat(amount) +
              parseFloat(childInfo?.remainAmount);
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "INSUFFICIENT_BALANCE"),
            });
          }
        }
      } else if (paymentMethod == "account") {
        if (bankId) {
          let bankInfo = await UserBankAccount.findOne({
            where: { id: bankId, userId: req.user.id },
          });
          if (bankInfo) {
            req.body.cnpToken = bankInfo.cnpToken;
            req.body.bankName = bankInfo.bankName;
            req.body.routingNumber = bankInfo.routingNumber;
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "NOT_FOUND_BANK"),
            });
          }
        } else {
          let bankAccountTokenizationRes =
            await paymentGatewayAPIs.bankAccountTokenization(req);
          if (
            bankAccountTokenizationRes &&
            bankAccountTokenizationRes.data.statusCode === "200"
          ) {
            req.body.cnpToken = bankAccountTokenizationRes?.data?.token;
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "NOT_FOUND_BANK"),
            });
          }
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Kyc limit
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkKycLimit(req, res, next) {
    try {
      let settingResult = await settingRepository.findAll(req);
      if (settingResult.non_kyc_user_transaction_limit) {
        settingResult.non_kyc_user_transaction_limit = parseInt(
          settingResult.non_kyc_user_transaction_limit
        );
      }

      if (settingResult.kyc_user_transaction_limit) {
        settingResult.kyc_user_transaction_limit = parseInt(
          settingResult.kyc_user_transaction_limit
        );
      }

      if (settingResult.transaction_limit_days) {
        settingResult.transaction_limit_days = parseInt(
          settingResult.transaction_limit_days
        );
      }

      let startDate = moment(new Date())
        .subtract(settingResult.transaction_limit_days, "days")
        .utc()
        .format(dateFormat);
      let endDate = moment(new Date()).utc().format(dateFormat);
      let amount = req.body.amount;
      let where = {
        actionType: req.body.checkActionType,
        status: { [Op.in]: ["success"] },
        createdAt: { [Op.between]: [startDate, endDate] },
      };

      if (req.body.checkActionType == "transfer") {
        where.fromUserId = req.user.id;
      } else {
        where.transactionUserId = req.user.id;
      }

      let result = await Transaction.findAll({
        where,
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalSum"],
        ],
      });

      let totalTransactionAmount = result[0].dataValues.totalSum
        ? parseFloat(result[0].dataValues.totalSum) + parseFloat(amount)
        : parseFloat(amount);
      if (req.user.isKycVerified) {
        if (
          totalTransactionAmount <=
          parseFloat(settingResult.kyc_user_transaction_limit)
        ) {
          next();
        } else {
          res.status(HttpStatus.OK).json({
            success: false,
            data: {},
            message: utility.getMessage(req, false, "TRANSACTION_LIMIT"),
          });
        }
      } else {
        if (
          totalTransactionAmount <=
          parseFloat(settingResult.non_kyc_user_transaction_limit)
        ) {
          next();
        } else {
          let message = utility.getMessage(req, false, "TRANSACTION_LIMIT");
          let status = "TRANSACTION_LIMIT_EXHAUSTED";
          let success = true;
          if (req.user.kycStatus == "uploaded") {
            message = utility.getMessage(req, false, "KYC_APPROVAL_PENDING");
            status = "";
            success = false;
          }
          res.status(HttpStatus.OK).json({
            success: success,
            status: status,
            data: {},
            message: message,
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check user kyc requst limit
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkKycRequestLimit(req, res, next) {
    try {
      let { amount } = req.body;
      let settingResult = await settingRepository.findAll(req);

      let startDate = moment(new Date())
        .subtract(settingResult.transaction_limit_days, "days")
        .utc()
        .format(dateFormat);
      let endDate = moment(new Date()).utc().format(dateFormat);

      let where = {
        fromUserId: req.user.id,
        toUserId: req.body.toUserId,
        createdAt: { [Op.between]: [startDate, endDate] },
      };

      let result = await PaymentRequest.findAll({
        where,
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalSum"],
        ],
      });
      amount = result[0].dataValues.totalSum
        ? parseFloat(result[0].dataValues.totalSum) + parseFloat(amount)
        : parseFloat(amount);
      if (req.user.isKycVerified) {
        if (
          parseFloat(amount) <=
          parseFloat(settingResult.kyc_user_transaction_limit)
        ) {
          next();
        } else {
          res.status(HttpStatus.OK).json({
            success: false,
            status: "",
            data: {},
            message: utility.getMessage(req, false, "REQUEST_LIMIT"),
          });
        }
      } else {
        if (
          parseFloat(amount) <=
          parseFloat(settingResult.non_kyc_user_transaction_limit)
        ) {
          next();
        } else {
          res.status(HttpStatus.OK).json({
            success: true,
            status: "TRANSACTION_LIMIT_EXHAUSTED",
            data: {},
            message: utility.getMessage(req, false, "REQUEST_LIMIT"),
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },
};
