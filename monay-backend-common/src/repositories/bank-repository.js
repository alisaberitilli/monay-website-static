import models from '../models/index.js';
import paymentGateway from '../services/payment-gateway.js';

export default {
  /**
   * Find bank account detail by id
   * @param {Object} whereObj 
   */
  async findOne(whereObj) {
    try {
      return await UserBankAccount.findOne({
        where: whereObj
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Find all bank account list
   * @param {Object} whereObj 
   */
  async findAll(whereObj) {
    try {
      return await UserBankAccount.findAll({
        where: whereObj
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Delete bank account
   * @param {object} req 
   */
  async deleteBank(req) {
    try {
      let { bank } = req;
      req.body.cardId = bank.id;
      req.body.token = bank.cnpToken;
      let transactionId = await paymentGateway.getBankAccountUniqueId();
      req.body.transactionId = transactionId;
      let tokenization = await paymentGateway.bankAccountDeTokenization(req);
      if (tokenization && tokenization?.data?.statusCode === "200") {
        await bank.update({ status: 'deleted' });
        return true;
      } else {
        await bank.update({ status: 'deleted' });
        return true;
      }
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Save bank account
   * @param {Object} req
   */
  async saveBankRequest(req) {
    try {
      const userData = req.user;
      const {
        accountHolderName,
        bankName,
        routingNumber,
        swiftCode,
        accountNumber
      } = req.body;

      const data = {
        accountHolderName,
        swiftCode: swiftCode ? swiftCode : null,
        bankName,
        routingNumber,
        userId: userData.id,
        last4Digit: accountNumber.substr(accountNumber.length - 4),
      }
      const result = await UserBankAccount.create(data);
      if (result) {
        req.body.bankId = result.id;
        let transactionId = await paymentGateway.getBankAccountUniqueId();
        req.body.transactionId = transactionId;
        let tokenization = await paymentGateway.bankAccountTokenization(req);
        if (tokenization.data.statusCode === "200") {
          let checkBank = await UserBankAccount.findOne({ where: { userId: userData.id, cnpToken: tokenization.data.token } });
          if (checkBank) {
            result.destroy();
            return false;
          } else {
            await result.update({ transactionId: transactionId, cnpToken: tokenization?.data?.token, apiResponse: JSON.stringify(tokenization?.data), status: 'active' });
          }
        } else {
          await result.update({ transactionId: transactionId, cnpToken: null, apiResponse: JSON.stringify(tokenization?.data), status: 'invalid' });
        }
      }
      return result;
    } catch (error) {
      throw Error(error);
    }
  }
};
