import models from '../models/index.js';

export default {

  /**
   * Get cms pages
   * @param {object} req
   */
  async findAll(req) {
    try {
      let queryData = req.query;
      let where = {};
      if (queryData.userType) {
        where.role = queryData.userType;
      }
      const cmsPages = await Cms.findAll({ where: where });
      return cmsPages;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get cms detail
   * @param {Object} where
   */
  async findOne(where) {
    try {
      const result = await Cms.findOne({
        where: where
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Update cms page
   * @param {object} cmsObject
   * @param {object} data
   */
  async updateCmsPage(req, cmsObject, data) {
    try {
      const result = await cmsObject.update(data);
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Save FAQ
   * @param {object} req
   */
  async saveFaq(req) {
    const { question, answer, userType } = req.body;
    try {
      const data = {
        question,
        answer,
        userType
      };
      const result = await Faq.create(data);
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get faq list
   * @param {object} req
   */
  async getFaqList(req) {
    try {
      const queryData = req.query;
      let where = {};
      if (queryData.userType) {
        where.role = queryData.userType;
      }
      const orderBy = [['createdAt', 'DESC']];
      const faqList = await Faq.findAndCountAll({
        where: where,
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0)
      });
      return faqList;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Update faq detail
   * @param {object} faqObject
   * @param {object} data
   */
  async updateFaq(faqObject, data) {
    try {
      const res = await faqObject.update(data);
      return res;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Delete faq
   * @param {object} req 
   */
  async deleteFaq(req) {
    try {
      const paramData = req.params;
      const cmsFaq = await Faq.destroy({ where: { id: paramData.faqId } });
      return cmsFaq;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Find faq detail
   * @param {object} req
   */
  async findFaq(req) {
    const paramData = req.params;
    try {
      const cmsFaq = await Faq.findOne({ where: { id: paramData.faqId } });
      return cmsFaq;
    } catch (error) {
      throw Error(error);
    }
  }
};
