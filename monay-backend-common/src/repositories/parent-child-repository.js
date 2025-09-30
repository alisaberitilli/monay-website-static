import pkg from 'sequelize';
const { Op, Sequelize } = pkg;
import models from "../models/index.js";
import utility from "../services/utility.js";
import encryptAPIs from "../services/encrypt.js";

const fromDateTime = " 00:00:00";
const toDateTime = " 23:59:59";
const dateFormat = "YYYY-MM-DD HH:mm:ss";

export default {
  /*
   * Find user detail
   * @param {Object} whereObj
   */
  async findOne(whereObj) {
    try {
      if (!whereObj.status) {
        whereObj.status = { [Op.ne]: "deleted" };
      }
      return await ChildParent.findOne({
        where: whereObj,
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Update user
   * @param {Object} userObject
   * @param {Object} data
   */
  async updateSecondaryUser(id, data) {
    try {
      return await ChildParent.update(data, { where: { userId: id } });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * verify otp for
   * @param {Object} req
   */
  async verifyPrimaryOtp(req) {
    try {
      const { parentUserData, user: { id }, body } = req;
      let { otp } = body;

      otp = await encryptAPIs.encrypt(`${otp}`);
      let where = { user_id: id, verificationOtp: otp };

      let user = await ChildParent.findOne({ where });
      if (user) {
        await ChildParent.update({
          verificationOtp: null,
          isParentVerified: 1,
          status: 'inactive',
          parentId: parentUserData?.id,
          limit: 0,
          remainAmount: 0
        }, { where: { id: user?.id } });
        return { status: 'inactive' };
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get all secondary User list
   * @param {Object} req
   */
  async allSecondaryUser(req) {
    try {
      const {
        query: {
          name,
          email,
          limit,
          offset,
          sortBy,
          type,
          sortType,
          companyName,
          taxId,
          chamberOfCommerce,
          phoneNumber,
          toDate,
          accountNumber,
          country,
          status,
          fromDate,
        },
        headers: { timezone },
        user: { userType, id },
      } = req;
      const sortFields = [
        "id",
        "name",
        "email",
        "phoneNumber",
        "accountNumber",
        "kycStatus",
        "companyName",
        "taxId",
        "chamberOfCommerce",
        "createdAt",
        "updatedAt",
      ];
      let orderBy = [["createdAt", "DESC"]];
      const model = type === "secondary_user" ? "parent" : "User";
      let fullNameWhere = Sequelize.fn(
        "concat",
        Sequelize.col(`${model}.first_name`),
        " ",
        Sequelize.col(`${model}.last_name`)
      );
      let where = {
        status: { [Op.in]: ["active", "inactive"] },
      };
      if (userType === "user") {
        where.parentId = id;
      }

      if (name) {
        where = { [Op.and]: [fullNameWhere, where] };
      }
      if (email) {
        where[`$${model}.email$`] = { [Op.like]: `%${email}%` };
      }
      if (companyName) {
        where[`$${model}.company_name$`] = { [Op.like]: `%${companyName}%` };
      }
      if (taxId) {
        where[`$${model}.tax_id$`] = { [Op.like]: `%${taxId}%` };
      }
      if (chamberOfCommerce) {
        where[`$${model}.chamber_of_commerce$`] = {
          [Op.like]: `%${chamberOfCommerce}%`,
        };
      }
      if (phoneNumber) {
        where[`$${model}.phone_number$`] = { [Op.like]: `%${phoneNumber}%` };
      }
      if (accountNumber) {
        where[`$${model}.account_number$`] = {
          [Op.like]: `%${accountNumber}%`,
        };
      }
      if (country) {
        where[`$${model}.phone_number_country$`] = country;
      }
      if (status) {
        where[`$${model}.status$`] = status;
      }

      if (fromDate && toDate && timezone) {
        let fromDate = `${fromDate}${fromDateTime}`;
        let toDate = `${toDate}${toDateTime}`;
        fromDate = utility.convertDateFromTimezone(
          fromDate,
          timezone,
          dateFormat
        );
        toDate = utility.convertDateFromTimezone(toDate, timezone, dateFormat);
        fromDate = moment.utc(fromDate);
        toDate = moment.utc(toDate);
        where[`$${model}.created_at$`] = {
          [Op.gte]: fromDate,
          [Op.lte]: toDate,
        };
      }

      if (sortBy && sortType && sortFields.includes(sortBy)) {
        switch (sortBy) {
          case "name":
            orderBy = [[fullNameWhere, sortType]];
            break;
          case "email":
            orderBy = [[ChildParent.associations[model], "email", sortType]];
            break;
          case "phoneNumber":
            orderBy = [
              [ChildParent.associations[model], "phone_number", sortType],
            ];
            break;
          case "accountNumber":
            orderBy = [
              [ChildParent.associations[model], "account_number", sortType],
            ];
            break;
          case "chamberOfCommerce":
            orderBy = [
              [
                ChildParent.associations[model],
                "chamber_of_commerce",
                sortType,
              ],
            ];
            break;
          case "taxId":
            orderBy = [[ChildParent.associations[model], "tax_id", sortType]];
            break;
          case "companyName":
            orderBy = [
              [ChildParent.associations[model], "company_name", sortType],
            ];
            break;
          case "kycStatus":
            orderBy = [
              [ChildParent.associations[model], "kyc_status", sortType],
            ];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      const include = {
        model: User,
        attributes: {
          exclude: ["password"],
        },
        required: true,
        where: {
          status: { [Op.ne]: "deleted" },
        },
      };

      if (userType === "secondary_user") {
        where.userId = id;
      }
      if (type === "secondary_user") {
        include.as = "parent";
      }
      return await ChildParent.findAndCountAll({
        where,
        col: "id",
        distinct: true,
        include,
        order: orderBy,
        limit: parseInt(limit || 10),
        offset: parseInt(offset || 0),
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get secondary User Details
   * @param {Object} where
   */
  async secondaryUserDetails(where) {
    try {
      const include = {
        model: User,
        attributes: {
          exclude: ["password", "passwordResetToken"],
        },
        required: true,
        where: {
          status: { [Op.ne]: "deleted" },
        },
      };
      if ("parentId" in where) {
        include.as = "parent";
      }
      return await ChildParent.findOne({
        where,
        include,
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Secondary User status update and limit update
   * @param {Object} where
   */
  async secondaryUserStatusUpdate(req) {
    try {
      const { body, secondaryUser } = req;
      const { status, limit } = body;
      if (status === secondaryUser.status) {
        return false;
      }
      if (limit) {
        body.limit = parseInt(limit ?? 0);
        body.remainAmount = parseInt(limit ?? 0);
      }
      return await ChildParent.update(body, { where: { id: secondaryUser?.id } });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Wallet Limit Update
   * @param {Object} where
   */
  async walletLimitUpdate(req) {
    try {
      const {
        user: { id },
        body,
        params,
      } = req;
      body.cardId = params?.cardId;
      return await models.User.update(body, {
        where: { id, status: { [Op.ne]: "deleted" }, userType: "user" },
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * User auto topup status update
   */
  async autoToupUserStatusUpdate(req) {
    try {
      const { user, body } = req;
      return user.update(body);
    } catch (error) {
      throw Error(error)
    }
  },
  /**
   * verify otp for
   * @param {Object} req
   */
  async verifySecondaryUser(req) {
    try {
      let { userId } = req.body;
      await ChildParent.update({
        parentId: userId,
        isParentVerified: 1,
        status: 'inactive',        
        limit: 0,
        remainAmount: 0
      }, { where: { userId: req?.user?.id } });
      return true;
    } catch (error) {
      throw Error(error);
    }
  },
};
