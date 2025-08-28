import models from "../models";
import { Op } from "sequelize";
import moment from "moment-timezone";
import utility from "../services/utility";
import paymentGateway from "../services/payment-gateway";
import notificationRepository from "./notification-repository";
import Email from "../services/email";
import logger from "../services/logger";
import config from "../config";
const { Sequelize } = models.sequelize;
const { Transaction, User, RolePermission, ChildParent, UserCard, PaymentRequest } = models;
const fromDateTime = " 00:00:00";
const toDateTime = " 23:59:59";
const dateFormat = "YYYY-MM-DD HH:mm:ss";

export default {
  /**
   * Get all Transaction list for admin
   * @param {Object} req
   */
  async findAll(req) {
    try {
      const queryData = req.query;
      const headerValues = req.headers;
      const sortFields = [
        "id",
        "transactionId",
        "fromUserId",
        "toUserId",
        "amount",
        "message",
        "createdAt",
        "updatedAt",
      ];
      let orderBy = [["id", "DESC"]];
      let fromWhere = {};
      let toWhere = {};
      let where = {};
      let toWhereRequired = false;
      let fromWhereRequired = false;

      if (queryData.status) {
        where.status = queryData.status;
      }

      if (queryData.actionType) {
        where.actionType = queryData.actionType;
      }

      if (queryData.paymentStatus) {
        where.paymentStatus = queryData.paymentStatus;
      }

      if (queryData.transactionType) {
        where.transactionType = queryData.transactionType;
      }

      if (queryData.transactionId) {
        where.transactionId = queryData.transactionId;
      }
      if (queryData.minAmount) {
        where.amount = { [Op.gte]: queryData.minAmount };
      }
      if (queryData.maxAmount) {
        where.amount = { [Op.lte]: queryData.maxAmount };
      }
      if (queryData.minAmount && queryData.maxAmount) {
        where.amount = {
          [Op.gte]: queryData.minAmount,
          [Op.lte]: queryData.maxAmount,
        };
      }
      if (queryData.fromDate && queryData.toDate && headerValues.timezone) {
        let fromDate = `${queryData.fromDate}${fromDateTime}`;
        let toDate = `${queryData.toDate}${toDateTime}`;
        fromDate = utility.convertDateFromTimezone(
          fromDate,
          headerValues.timezone,
          dateFormat
        );
        toDate = utility.convertDateFromTimezone(
          toDate,
          headerValues.timezone,
          dateFormat
        );
        fromDate = moment.utc(fromDate);
        toDate = moment.utc(toDate);
        where.createdAt = { [Op.gte]: fromDate, [Op.lte]: toDate };
      }

      if (queryData.fromName) {
        if (queryData.actionType == "withdrawal") {
          fromWhere = Sequelize.where(
            Sequelize.fn(
              "concat",
              Sequelize.col("fromUser.first_name"),
              " ",
              Sequelize.col("fromUser.last_name")
            ),
            {
              [Op.like]: `%${queryData.fromName}%`,
            }
          );
        } else {
          fromWhere = {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn(
                  "concat",
                  Sequelize.col("fromUser.first_name"),
                  " ",
                  Sequelize.col("fromUser.last_name")
                ),
                {
                  [Op.like]: `%${queryData.fromName}%`,
                }
              ),
              Sequelize.where(Sequelize.col("fromUser.email"), {
                [Op.like]: `%${queryData.fromName}%`,
              }),
            ],
          };
        }
        fromWhereRequired = true;
      }
      if (queryData.fromEmail) {
        fromWhere.email = { [Op.like]: `%${queryData.fromEmail}%` };
        fromWhereRequired = true;
      }

      if (queryData.toName) {
        toWhere = {
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn(
                "concat",
                Sequelize.col("toUser.first_name"),
                " ",
                Sequelize.col("toUser.last_name")
              ),
              {
                [Op.like]: `%${queryData.toName}%`,
              }
            ),
            Sequelize.where(Sequelize.col("toUser.email"), {
              [Op.like]: `%${queryData.toName}%`,
            }),
          ],
        };
        toWhereRequired = true;
      }

      if (
        queryData.sortBy &&
        queryData.sortType &&
        sortFields.includes(queryData.sortBy)
      ) {
        if (queryData.sortBy == "fromUserId") {
          orderBy = [
            [
              Sequelize.fn(
                "concat",
                Sequelize.col("fromUser.first_name"),
                " ",
                Sequelize.col("fromUser.last_name")
              ),
              queryData.sortType,
            ],
          ];
        } else if (queryData.sortBy == "toUserId") {
          orderBy = [
            [
              Sequelize.fn(
                "concat",
                Sequelize.col("toUser.first_name"),
                " ",
                Sequelize.col("toUser.last_name")
              ),
              queryData.sortType,
            ],
          ];
        } else {
          orderBy = [[queryData.sortBy, queryData.sortType]];
        }
      }
      if (queryData.dashboardTarnsactionStatus) {
        orderBy = Sequelize.literal(
          "FIELD(payment_status, 'pending', 'completed', 'failed', 'cancelled'), payment_status ASC"
        );
      }
      const result = await Transaction.findAndCountAll({
        where: where,
        include: [
          {
            model: User,
            as: "fromUser",
            where: fromWhere,
            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "profilePicture",
              "profilePictureUrl",
              "mobile",
            ],
            required: fromWhereRequired,
          },
          {
            model: User,
            as: "toUser",
            where: toWhere,
            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "profilePicture",
              "profilePictureUrl",
              "mobile",
            ],
            required: toWhereRequired,
          },
        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0),
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  getExtraAttributes(userId) {
    return [
      [
        Sequelize.literal(
          `(SELECT (CASE WHEN (toUserId=${userId}) THEN 'received' ELSE 'paid' END) FROM transactions WHERE transactions.id = Transaction.id)`
        ),
        "paymentStatus",
      ],
    ];
  },
  /**
   * Get all Transaction for users
   * @param {Object} req
   */
  async UserTransactionList(req) {
    try {
      const {
        user: { id, userType },
      } = req;
      const queryData = req.query;
      const headerValues = req.headers;
      let orderBy = [["id", "DESC"]];
      let nameWhere = {};
      let where = {
        status: { [Op.in]: ["success", "failed"] },
        [Op.or]: [{ toUserId: id }, { fromUserId: id }],
      };
      if (userType === "secondary_user") {
        queryData.secondaryUserId = id;
      }
      if (queryData.secondaryUserId) {
        where = {
          ...where,
          // [Op.and]: [
          //   { parentId: { [Op.ne]: null } },
          //   {
              [Op.or]: [
                { toUserId: queryData.secondaryUserId },
                { fromUserId: queryData.secondaryUserId },
              ]
            // }],
        };
      }
      if (queryData.minAmount) {
        where.amount = { [Op.gte]: queryData.minAmount };
      }
      if (queryData.maxAmount) {
        where.amount = { [Op.lte]: queryData.maxAmount };
      }

      if (queryData.name) {
        nameWhere = Sequelize.where(
          Sequelize.literal(
            `(SELECT (CASE WHEN (to_user_id=${req.user.id} AND from_user_id IS NOT NULL) THEN concat(fromUser.first_name," ",fromUser.last_name) ELSE concat(transactionUser.first_name," ",transactionUser.last_name) END) FROM transactions WHERE transactions.id = Transaction.id)`
          ),
          {
            [Op.like]: `%${queryData.name}%`,
          }
        );
      }

      if (queryData.actionType) {
        if (queryData.actionType == "deposit") {
          where.status = "success";
          where.actionType = {
            [Op.in]: [
              Sequelize.literal(
                `(SELECT (CASE WHEN (to_user_id=${req.user.id} AND from_user_id IS NOT NULL) THEN 'transfer' ELSE 'deposit' END) FROM transactions WHERE transactions.id = Transaction.id)`
              ),
            ],
          };
        } else if (queryData.actionType == "transfer") {
          where.status = "success";
          where.actionType = {
            [Op.in]: [
              Sequelize.literal(
                `(SELECT (CASE WHEN (from_user_id=${req.user.id} AND to_user_id IS NOT NULL) THEN 'transfer' ELSE 'none' END) FROM transactions WHERE transactions.id = Transaction.id)`
              ),
            ],
          };
        } else if (queryData.actionType == "failed") {
          where.status = "failed";
        } else {
          where.status = "success";
          where.actionType = queryData.actionType;
        }
      }

      if (queryData.paymentMethod) {
        where.paymentMethod = {
          [Op.in]: [
            Sequelize.literal(
              `(SELECT (CASE WHEN (from_user_id=${req.user.id} AND to_user_id IS NOT NULL) THEN 'wallet' ELSE payment_method END) FROM transactions WHERE transactions.id = Transaction.id)`
            ),
          ],
        };
      }

      if (queryData.minAmount && queryData.maxAmount) {
        where.amount = {
          [Op.gte]: queryData.minAmount,
          [Op.lte]: queryData.maxAmount,
        };
      }
      if (!queryData.toDate) {
        queryData.toDate = new Date().toJSON().slice(0, 10).replace(/-/g, "-");
      }

      if (queryData.fromDate && queryData.toDate && headerValues.timezone) {
        let fromDate = `${queryData.fromDate}${fromDateTime}`;
        let toDate = `${queryData.toDate}${toDateTime}`;
        fromDate = utility.convertDateFromTimezone(
          fromDate,
          headerValues.timezone,
          dateFormat
        );
        toDate = utility.convertDateFromTimezone(
          toDate,
          headerValues.timezone,
          dateFormat
        );
        fromDate = moment.utc(fromDate);
        toDate = moment.utc(toDate);
        where.createdAt = { [Op.gte]: fromDate, [Op.lte]: toDate };
      }
      const result = await Transaction.findAndCountAll({
        where: where,
        attributes: {
          include: this.getExtraAttributes(req.user.id),
        },
        include: [
          {
            model: User,
            as: "fromUser",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "profilePicture",
              "profilePictureUrl",
              "mobile",
            ],
          },
          {
            model: User,
            as: "toUser",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "profilePicture",
              "profilePictureUrl",
              "mobile",
            ],
          },
          {
            model: User,
            where: nameWhere,
            as: "transactionUser",
            attributes: ["id"],
          },
        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0),
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get user withdrawal
   * @param {Object} req
   */
  async UserWithdrawalList(req) {
    try {
      const queryData = req.query;
      let orderBy = [["id", "DESC"]];
      let where = {
        fromUserId: req.user.id,
        toUserId: null,
        transactionType: "debit",
        actionType: "withdrawal",
      };

      const result = await Transaction.findAndCountAll({
        where: where,
        include: [
          {
            model: User,
            as: "fromUser",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "profilePicture",
              "profilePictureUrl",
            ],
          },
        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0),
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get Transaction Detail
   * @param {Object} req
   */
  async findOne(req) {
    try {
      const paramData = req.params;

      let where = { id: paramData.id };
      const result = await Transaction.findOne({
        where: where,

        include: [
          {
            model: User,
            as: "fromUser",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "profilePicture",
              "profilePictureUrl",
            ],
          },
          {
            model: User,
            as: "toUser",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "profilePicture",
              "profilePictureUrl",
            ],
          },
        ],
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get recent Transaction list for user
   * @param {Object} req
   */
  async recentTransaction(userId) {
    try {
      let orderBy = [["id", "DESC"]];
      let where = { [Op.or]: [{ toUserId: userId }, { fromUserId: userId }, { parentId: userId }] };
      const user = await User.findOne({ where: { id: userId } });
      const queryData = {};

      if (user?.userType === "secondary_user") {
        queryData.secondaryUserId = userId;
      }
      if (queryData?.secondaryUserId) {
        where = {
          ...where,
          [Op.and]: [
            { parentId: { [Op.ne]: null } },
            {
              [Op.or]: [
                { toUserId: queryData.secondaryUserId },
                { fromUserId: queryData.secondaryUserId },
              ]
            }],
        };
      }

      where.id = {
        [Op.notIn]: [
          Sequelize.literal(
            `(SELECT (CASE WHEN (to_user_id=${userId}) THEN id ELSE 0 END) FROM transactions WHERE transactions.id = Transaction.id AND transactions.action_type='transfer' AND transactions.status != 'success')`
          ),
        ],
      };

      const result = await Transaction.findAndCountAll({
        where: where,
        attributes: {
          include: this.getExtraAttributes(userId),
        },
        include: [
          {
            model: User,
            as: "fromUser",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "profilePicture",
              "profilePictureUrl",
              "mobile",
            ],
          },
          {
            model: User,
            as: "toUser",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "profilePicture",
              "profilePictureUrl",
              "mobile",
            ],
          },
        ],
        order: orderBy,
        limit: 3,
        offset: 0,
      });
      return result.rows;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * pay money to user
   * @param {Object} req
   */
  async payMoney(req) {
    try {
      req.body.transactionId = await paymentGateway.getUniqueId();
      let result = await paymentGateway.payMoney(req);
      req.body.transactionType = "debit";
      req.body.actionType = "transfer";
      req.body.fromUserId = req?.user?.id;
      let transactionInfo = await this.updateTransactionAfterAddOrPay(
        req,
        result
      );
      if (transactionInfo.status === "success") {
        if (req.body.paymentMethod == "wallet") {
          // check user refill limit
          const payAmount = req.body.amount
          const toUserId = req.body.toUserId;
          await this.checkRefillAmount(req);
          req.body.amount = payAmount;
          req.body.toUserId = toUserId;
        }
        
        // /**
        //  * Check payment request
        //  */
        // let userPaymentRequest =await PaymentRequest.findOne({ where:{fromUserId:req.body.toUserId,toUserId:req.user.id,amount:req.body.amount }});
        // if(userPaymentRequest){
        //     userPaymentRequest.update({status:'paid'});
        // }
        await notificationRepository.userReceivedPayment(req);
        await notificationRepository.userSentPayment(req);
      }
      return transactionInfo;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Pay payment request money to user
   * @param {Object} req
   */
  async payRequestMoney(req) {
    try {
      req.body.transactionId = await paymentGateway.getUniqueId();
      let result = await paymentGateway.payMoney(req);
      req.body.transactionType = "debit";
      req.body.actionType = "transfer";
      req.body.fromUserId = req.user.id;
      req.body.paymentRequestId = req.body.requestId;
      let transactionInfo = await this.updateTransactionAfterAddOrPay(
        req,
        result
      );
      if (transactionInfo.status === "success") {
        req.paymentRequest.update({ status: "paid" });
        await notificationRepository.userReceivedPayment(req);
        await notificationRepository.userSentPayment(req);
      }
      return transactionInfo;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Add money from user card
   * @param {Object} req
   */
  async addMoneyFromCard(req) {
    try {
      req.body.transactionId = await paymentGateway.getUniqueId();
      let result = await paymentGateway.addMoneyFromCard(req);
      req.body.transactionType = "credit";
      req.body.actionType = "deposit";
      req.body.fromUserId = null;
      req.body.toUserId = req.user.id;
      return this.updateTransactionAfterAddOrPay(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Add money from user bank
   * @param {Object} req
   */
  async addMoneyFromBank(req) {
    try {
      req.body.transactionId = await paymentGateway.getUniqueId();
      let result = await paymentGateway.addMoneyFromBank(req);
      req.body.transactionType = "credit";
      req.body.actionType = "deposit";
      req.body.fromUserId = null;
      req.body.toUserId = req.user.id;
      req.body.paymentMethod = "account";
      return this.updateTransactionAfterAddOrPay(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Transfer money to user bank (withdrawal)
   * @param {Object} req
   */
  async transferMoneyToBank(req) {
    try {
      req.body.transactionId = await paymentGateway.getUniqueId();
      let result = await paymentGateway.transferMoneyToBank(req);
      req.body.transactionType = "debit";
      req.body.actionType = "withdrawal";
      req.body.fromUserId = req.user.id;
      req.body.toUserId = null;
      req.body.paymentMethod = "account";
      req.body.paymentStatus = "pending";
      return this.updateTransactionAfterAddOrPay(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Save transaction detail after figateway api response
   * @param {Object} req
   */
  async updateTransactionAfterAddOrPay(req, result) {
    try {
      const {
        transactionType,
        paymentMethod,
        transactionId,
        fromUserId,
        toUserId,
        actionType,
        parentId,
      } = req.body;
      let transactionUserId = null;
      if (actionType == "deposit" || actionType == "transfer") {
        transactionUserId = toUserId;
      } else {
        transactionUserId = fromUserId;
      }

      let data = {
        fromUserId: fromUserId,
        toUserId: toUserId,
        transactionUserId: transactionUserId,
        transactionId: transactionId,
        amount: req.body.amount,
        message: req.body.message ? req.body.message : null,
        actionType: actionType,
        transactionType: transactionType,
        paymentMethod: paymentMethod,
        cardName: req.body.cardName ? req.body.cardName : null,
        cardType: req.body.cardType ? req.body.cardType : null,
        last4Digit: req.body.last4Digit ? req.body.last4Digit : null,
        cnpToken: req.body.cnpToken ? req.body.cnpToken : null,
        paymentRequestId: req.body.paymentRequestId
          ? req.body.paymentRequestId
          : null,
        bankName: req.body.bankName ? req.body.bankName : null,
        parentId: parentId ?? null,
        apiReponse: JSON.stringify(result?.data),
      };
      if (result && result?.data?.statusCode == "200") {
        data.status = "success";
        data.paymentStatus = req.body.paymentStatus
          ? req.body.paymentStatus
          : "completed";
        if (req.user.userType === "secondary_user") {
          const childWallet = await ChildParent.findOne({
            where: { userId: fromUserId, parentId },
          });
          const remainAmount =
            parseFloat(childWallet.remainAmount) - parseFloat(req.body.amount);
          await childWallet.update({ remainAmount });
        }
      } else {
        data.status = "failed";
        data.paymentStatus = "failed";
      }

      if (parentId && parseInt(parentId) === parseInt(toUserId)) {
        const debitEntry = {
          ...data
        }
        debitEntry.fromUserId = parentId;
        debitEntry.toUserId = fromUserId;
        debitEntry.parentId = null;
        await this.createTransaction(debitEntry, req.user);

      }
      return this.createTransaction(data, req.user);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Create new transaction
   * @param {Object} data
   * @param {Object} userData
   */
  async createTransaction(data, userData) {
    try {
      let result = await Transaction.create(data);
      if (data.paymentStatus == "failed") {
        let transactionDate = utility.changeDateFormat(
          result.createdAt,
          "DD/MM/YYYY hh:mm A"
        );
        const adminData = await User.findAll({
          where: {
            userType: { [Op.in]: ["admin", "subadmin"] },
            status: "active",
          },
        });
        let email = [];
        if (adminData) {
          for (let index = 0; index < adminData.length; index++) {
            if (adminData[index]["userType"] == "subadmin") {
              let rolePermission = await RolePermission.findOne({
                where: {
                  roleId: adminData[index]["roleId"],
                  moduleKey: "transaction",
                },
              });
              if (rolePermission) {
                email.push(adminData[index]["email"]);
              }
            } else {
              email.push(adminData[index]["email"]);
            }
          }
        }
        const emailData = {
          to: email,
          customerId: userData.accountNumber,
          currencyAbbr: config.region.currencySymbol,
          amount: data.amount,
          transactionId: data.transactionId,
          transactionDate: transactionDate,
        };
        Email.failedTransaction(emailData)
          .then((result) => {
            logger.infoLogger.info("Mail sent successfully");
          })
          .catch((error) => {
            logger.emailErrorLogger.error(
              `Mail sent error ${new Date()} ${JSON.stringify(error)}`
            );
          });
      }
      const payUserDetails = await User.findOne({
        where: { id: result?.toUserId },
        attributes: [
          "firstName",
          "lastName",
          "email",
          "mobile",
        ],
      });
      result.dataValues.user = payUserDetails;
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
 *Get user wallet balance
 * @param {Object} req
 */
  async getWalletBalance(userId) {
    try {
      let data = {
        creditWalletAmount: 0,
        debitWalletAmount: 0,
        totalWalletAmount: 0,
      };

      // return await Transaction.create(data);
      const totalCreditAmoount = await Transaction.findOne({
        where: {
          toUserId: userId,
          status: "success",
          paymentStatus: { [Op.in]: ["completed", "pending"] },
        },
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
      });
      const totalDebitAmoount = await Transaction.findOne({
        where: {
          [Op.or]: [{ fromUserId: userId }, { [Op.and]: [{ parentId: userId }, { toUserId: { [Op.ne]: userId } }] }],
          status: "success",
          paymentMethod: { [Op.in]: ["wallet", "account"] },
          paymentStatus: { [Op.in]: ["completed", "pending"] },
        },
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
      });
      if (totalCreditAmoount.get().totalAmount) {
        data.creditWalletAmount = totalCreditAmoount.get().totalAmount;
      }
      if (totalDebitAmoount.get().totalAmount) {
        data.debitWalletAmount = totalDebitAmoount.get().totalAmount;
      }
      data.totalWalletAmount = data.creditWalletAmount - data.debitWalletAmount;
      const secondaryUserLimit = await ChildParent.findOne({ where: { userId, status: { [Op.ne]: 'deleted' } } });
      data.secondaryUserLimit = secondaryUserLimit?.remainAmount ?? 0;

      return data;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   *Get total transaction for admin dashboard
   * @param {Object} req
   */
  async getTransactionTotal() {
    try {
      let data = {
        failedTransactionAmount: 0,
        successTransactionAmount: 0,
        totalTransactionAmount: 0,
      };

      const successTransactionAmount = await Transaction.findOne({
        where: { status: "success" },
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
      });
      const failedTransactionAmount = await Transaction.findOne({
        where: { status: "failed" },
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
      });
      const totalTransactionAmount = await Transaction.findOne({
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
      });
      if (failedTransactionAmount.get().totalAmount) {
        data.failedTransactionAmount =
          failedTransactionAmount.get().totalAmount;
      }
      if (successTransactionAmount.get().totalAmount) {
        data.successTransactionAmount =
          successTransactionAmount.get().totalAmount;
      }
      if (totalTransactionAmount.get().totalAmount) {
        data.totalTransactionAmount = totalTransactionAmount.get().totalAmount;
      }
      return data;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   *Get total transaction for admin dashboard
   * @param {Object} req
   */
  async getTransactionCount() {
    try {
      let where = {};
      let data = {
        failedTransactionCount: 0,
        successTransactionCount: 0,
        totalTransactionCount: 0,
        totalTransactionCurrentWeekCount: 0,
        totalTransactionLastWeekCount: 0,
        failedTransactionCurrentWeekCount: 0,
        failedTransactionLastWeekCount: 0,
        successTransactionCurrentWeekCount: 0,
        successTransactionLastWeekCount: 0,
      };

      data.successTransactionCount = await Transaction.count({
        where: { status: "success" },
      });
      data.failedTransactionCount = await Transaction.count({
        where: { status: "failed" },
      });
      data.totalTransactionCount = await Transaction.count();
      // Current week total users
      const startCurrentWeekDate = moment
        .utc()
        .startOf("week")
        .format(dateFormat);
      const endCurrentWeekDate = moment.utc().endOf("week").format(dateFormat);
      if (startCurrentWeekDate && endCurrentWeekDate) {
        where.createdAt = {
          [Op.between]: [startCurrentWeekDate, endCurrentWeekDate],
        };
        data.totalTransactionCurrentWeekCount = await Transaction.count({
          where,
        });
        data.failedTransactionCurrentWeekCount = await Transaction.count({
          where: {
            status: "failed",
            createdAt: {
              [Op.between]: [startCurrentWeekDate, endCurrentWeekDate],
            },
          },
        });

        data.successTransactionCurrentWeekCount = await Transaction.count({
          where: {
            status: "success",
            createdAt: {
              [Op.between]: [startCurrentWeekDate, endCurrentWeekDate],
            },
          },
        });
      }
      // Last week total users
      let lastWeekStartDate = moment
        .utc()
        .startOf("week")
        .subtract(7, "d")
        .format(dateFormat);
      let lastWeekendDate = moment
        .utc()
        .endOf("week")
        .subtract(7, "d")
        .format(dateFormat);
      if (lastWeekStartDate && lastWeekendDate) {
        where.createdAt = {
          [Op.between]: [lastWeekStartDate, lastWeekendDate],
        };
        data.totalTransactionLastWeekCount = await Transaction.count({
          where,
        });
        data.failedTransactionLastWeekCount = await Transaction.count({
          where: {
            status: "failed",
            createdAt: { [Op.between]: [lastWeekStartDate, lastWeekendDate] },
          },
        });

        data.successTransactionLastWeekCount = await Transaction.count({
          where: {
            status: "success",
            createdAt: { [Op.between]: [lastWeekStartDate, lastWeekendDate] },
          },
        });
      }

      return data;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   *Get total withdraw request for admin dashboard
   * @param {Object} req
   */
  async getWithdrawPendingRequestCount() {
    try {
      let where = { actionType: "withdrawal", paymentStatus: "pending" };
      let data = {
        lastWeekWithdrawPendingCount: 0,
        currentWeekWithdrawPendingCount: 0,
      };
      // Current week total
      const startCurrentWeekDate = moment
        .utc()
        .startOf("week")
        .format(dateFormat);
      const endCurrentWeekDate = moment.utc().endOf("week").format(dateFormat);
      if (startCurrentWeekDate && endCurrentWeekDate) {
        where.createdAt = {
          [Op.between]: [startCurrentWeekDate, endCurrentWeekDate],
        };
        data.currentWeekWithdrawPendingCount = await Transaction.count({
          where,
        });
      }
      // Last week total
      let lastWeekStartDate = moment
        .utc()
        .startOf("week")
        .subtract(7, "d")
        .format(dateFormat);
      let lastWeekendDate = moment
        .utc()
        .endOf("week")
        .subtract(7, "d")
        .format(dateFormat);
      if (lastWeekStartDate && lastWeekendDate) {
        where.createdAt = {
          [Op.between]: [lastWeekStartDate, lastWeekendDate],
        };
        data.lastWeekWithdrawPendingCount = await Transaction.count({
          where,
        });
      }
      return data;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   *Get total withdraw request for admin dashboard
   * @param {Object} req
   */
  async getWithdrawRequestCount() {
    try {
      let where = { actionType: "withdrawal" };
      let data = {
        lastWeekWithdrawCount: 0,
        currentWeekWithdrawCount: 0,
      };
      // Current week total users
      const startCurrentWeekDate = moment
        .utc()
        .startOf("week")
        .format(dateFormat);
      const endCurrentWeekDate = moment.utc().endOf("week").format(dateFormat);
      if (startCurrentWeekDate && endCurrentWeekDate) {
        where.createdAt = {
          [Op.between]: [startCurrentWeekDate, endCurrentWeekDate],
        };
        data.currentWeekWithdrawCount = await Transaction.count({
          where,
        });
      }
      // Last week total users
      let lastWeekStartDate = moment
        .utc()
        .startOf("week")
        .subtract(7, "d")
        .format(dateFormat);
      let lastWeekendDate = moment
        .utc()
        .endOf("week")
        .subtract(7, "d")
        .format(dateFormat);
      if (lastWeekStartDate && lastWeekendDate) {
        where.createdAt = {
          [Op.between]: [lastWeekStartDate, lastWeekendDate],
        };
        data.lastWeekWithdrawCount = await Transaction.count({
          where,
        });
      }
      return data;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   *Get total trasaction count for admin dashborad
   * @param {Object} req
   */
  async getDashboardGraphData(req, status) {
    try {
      let queryData = req.query;
      let where = {};
      if (status != "pending") {
        where.status = status;
      } else {
        where.paymentStatus = status;
        where.actionType = "withdrawal";
      }
      // Current week
      if (queryData.type == "week") {
        const startCurrentWeekDate = moment
          .utc()
          .startOf("week")
          .format(dateFormat);
        const endCurrentWeekDate = moment
          .utc()
          .endOf("week")
          .format(dateFormat);
        if (startCurrentWeekDate && endCurrentWeekDate) {
          where.createdAt = {
            [Op.between]: [startCurrentWeekDate, endCurrentWeekDate],
          };
        }
      }

      // Current month
      if (queryData.type == "month") {
        let monthStartDate = moment.utc().startOf("month").format(dateFormat);
        let monthEndDate = moment.utc().endOf("month").format(dateFormat);
        if (monthStartDate && monthEndDate) {
          where.createdAt = { [Op.between]: [monthStartDate, monthEndDate] };
        }
      }
      if (queryData.type == "year") {
        let year = moment().year();
        where[Op.and] = Sequelize.where(
          Sequelize.fn("YEAR", Sequelize.col("created_at")),
          year
        );
      }
      return await Transaction.count({
        where,
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   *Get total trasaction graph data for admin dashboard
   * @param {Object} req
   */
  async getDashboardLineGraph(req, actionType) {
    try {
      let i;
      let name = "";
      if (actionType == "transfer") {
        name = "Sent Money";
      } else if (actionType == "deposit") {
        name = "Received Money";
      } else {
        name = "WithDraw Money";
      }

      let where = { actionType };
      let data = [];
      let monthNames = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
      ];

      for (i = 0; i < 12; i++) {
        if (monthNames[i]) {
          let year = moment().year();
          where[Op.and] = [
            Sequelize.where(
              Sequelize.fn("month", Sequelize.col("created_at")),
              parseInt(monthNames[i])
            ),
            Sequelize.where(
              Sequelize.fn("YEAR", Sequelize.col("created_at")),
              year
            ),
          ];
        }
        data.push(
          await Transaction.count({
            where,
          })
        );
      }
      return { name, data };
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *Get total transaction for admin dashboard
   * @param {Object} req
   */
  async getParentWalletLimit(req) {
    try {
      const {
        user: { id }, params
      } = req;
      const totalCreditAmoount = await Transaction.findOne({
        where: {
          toUserId: id,
          status: "success",
          paymentStatus: { [Op.in]: ["completed", "pending"] },
        },
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
      });
      const totalDebitAmoount = await Transaction.findOne({
        where: {
          [Op.or]: [{ fromUserId: id }, { parentId: id }],
          status: "success",
          paymentMethod: { [Op.in]: ["wallet", "account"] },
          paymentStatus: { [Op.in]: ["completed", "pending"] },
        },
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalAmount"],
        ],
      });
      let creditWalletAmount = 0;
      let debitWalletAmount = 0;
      if (totalCreditAmoount.get().totalAmount) {
        creditWalletAmount = totalCreditAmoount.get().totalAmount;
      }
      if (totalDebitAmoount.get().totalAmount) {
        debitWalletAmount = totalDebitAmoount.get().totalAmount;
      }
      let parentWalletAmount = creditWalletAmount - debitWalletAmount;
      // Sum child limit
      const usedCreditLimit = await ChildParent.sum("remainAmount", {
        where: { status: { [Op.ne]: "deleted" }, parentId: id, userId: { [Op.ne]: params?.id } },
        raw: true,
      });
      const finalWalletAmount =
        parseInt(parentWalletAmount) - parseInt(usedCreditLimit);
      return finalWalletAmount ?? 0;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *Get total transaction for admin dashboard
   * @param {Object} req
   */
  async getAllChildAmount(userId) {
    try {
      const TotalAmount = await ChildParent.sum("remainAmount", {
        where: { status: "active", isParentVerified: 1, parentId: userId },
        raw: true,
      });
      return TotalAmount ?? 0;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *Get refill Amount og user
   * @param {Object} req
   */
  async checkRefillAmount(req) {
    try {
      const {
        body: { parentId, remainAmount },
        user: { userType, id },
      } = req;
      const userId = userType === "secondary_user" ? parentId : id;
      const userData = await User.findOne({
        where: {
          id: userId,
          status: "active",
        },
        include: [
          {
            model: UserCard,
            where: { isDefault: 1 , status: 'active' },
          },
        ]
      });


      if (!userData?.autoToupStatus || userData.UserCards.length === 0) {
        return true;
      }
      if (
        parseFloat(remainAmount) >= parseFloat(userData?.minimumWalletAmount)
      ) {
        return true;
      } else {
        req.user = userData;
        req.body.cardNumber = userData.UserCards[0].cardNumber;
        req.body.cnpToken = userData.UserCards[0].cnpToken;
        req.body.amount = userData?.refillWalletAmount;
        req.body.parentId = null;

        return this.addMoneyFromCard(req);
      }
    } catch (error) {
      throw Error(error);
    }
  },
};
