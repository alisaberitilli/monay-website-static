import { Op } from 'sequelize';
import models from "../models";
import utility from "../services/utility";
import paymentGateway from "../services/payment-gateway";
const { UserCard } = models;

export default {
  /**
   * Find card detail
   * @param {Object} whereObj
   */
  async findOne(whereObj) {
    try {
      return await UserCard.findOne({
        where: whereObj,
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Find all card list
   * @param {Object} whereObj
   */
  async findAll(whereObj) {
    try {
      return await UserCard.findAll({
        where: whereObj,
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Delete card
   * @param {object} req
   */
  async deleteCard(req) {
    try {
      let { card, user } = req;
      req.body.cardId = card.id;
      req.body.token = card.cnpToken;
      let transactionId = await paymentGateway.getCardUniqueId();
      req.body.transactionId = transactionId;
      let tokenization = await paymentGateway.cardDeTokenization(req);
      // if card token exist or not exist on card server card deleted
      if (tokenization && tokenization?.data.statusCode === "200") {
        if (card && card?.isDefault) {
          await user.update({ autoToupStatus: false });
        }
        await card.update({ status: "deleted" });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Save card request
   * @param {Object} req
   */
  async saveCardRequest(req) {
    try {
      const userData = req.user;
      const { cardNumber, nameOnCard, month, year, isDefault } = req.body;
      let cardName = utility.getCardType(cardNumber);
      let lastDigit = cardNumber.substr(cardNumber.length - 4);
      if (isDefault) {
        await this.userCardIsDefaultUpdate(req);
      }
      const data = {
        cardType: null,
        cardName: cardName || null,
        cardIcon: utility.getCardIcon(cardName),
        cardNumber: null,
        nameOnCard,
        month,
        year,
        last4Digit: lastDigit,
        userId: userData.id,
        isDefault: !!isDefault
      };
      const result = await UserCard.create(data);

      if (result) {
        let transactionId = await paymentGateway.getCardUniqueId();
        req.body.transactionId = transactionId;
        let tokenization = await paymentGateway.cardTokenization(req);
        if (tokenization) {
          const { data } = tokenization;
          const { statusCode } = data;
          if (statusCode === "200") {
            let checkCard = await UserCard.findOne({
              where: {
                userId: userData.id,
                cnpToken: data?.token,
                status: 'active',
              },
            });
            if (checkCard) {
              result.destroy();
              if (isDefault) {
                const resultData = await UserCard.findOne({
                  where: {
                    userId: userData.id,
                    status: 'active',
                  },
                  order: [['id', 'DESC']]
                });
                resultData.update({ isDefault: !!isDefault })
              }
              return false;
            } else {
              result.set({
                transactionId: transactionId,
                cnpToken: data?.token,
                apiResponse: JSON.stringify(data),
                status: "active",
              });
              await result.save();
            }
          } else {
            await result.update({
              transactionId: transactionId,
              cnpToken: null,
              apiResponse: JSON.stringify(data),
              status: "invalid",
            }, { returning: true });
          }
        } else {
          await result.update({
            transactionId: transactionId,
            cnpToken: null,
            apiResponse: JSON.stringify(tokenization?.data),
            status: "invalid",
          }, { returning: true });
        }
      }
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * Card details update auto refill
  * @param {Object} req
  */
  async userCardIsDefaultUpdate(req) {
    try {
      const { user: { id }, } = req;
      return await UserCard.update({
        isDefault: false
      }, { where: { userId: id, isDefault: true, status: { [Op.ne]: 'deleted' } } });
    } catch (error) {
      throw Error(error);
    }
  },
};
