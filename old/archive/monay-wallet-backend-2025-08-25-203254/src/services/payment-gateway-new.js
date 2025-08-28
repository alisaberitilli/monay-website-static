import ApiRequest from "./api-request";
import config from "../config";

const PaymentApi = {
  async authentication(currency) {
    try {
      return await ApiRequest.getRequest(
        `/gps/api/login/{merchantid}`,
        config.payment[currency]
      );
    } catch (error) {
      throw error;
    }
  },

  async saveCard(data) {
    try {
      return await this.cardPaymentRequest(config.payment[currency]);
    } catch (error) {
      throw error;
    }
  },

  async directCardPayment(data) {
    try {
      return await this.cardPaymentRequest(config.payment[currency]);
    } catch (error) {
      throw error;
    }
  },

  async paymentByCardToken(data) {
    try {
      return await this.cardPaymentRequest(config.payment[currency]);
    } catch (error) {
      throw error;
    }
  },

  async cardPaymentRequest(data) {
    try {
      return await ApiRequest.postRequest(
        `/gps/card/payments`,
        config.payment[currency]
      );
    } catch (error) {
      throw error;
    }
  },

  async saveBankAccount(data) {
    try {
      return await this.bankAccountPaymentRequest(config.payment[currency]);
    } catch (error) {
      throw error;
    }
  },

  async directBankAccountPayment(data) {
    try {
      return await this.bankAccountPaymentRequest(config.payment[currency]);
    } catch (error) {
      throw error;
    }
  },

  async paymentByBankAccountToken(data) {
    try {
      return await this.cardPaymentRequest(config.payment[currency]);
    } catch (error) {
      throw error;
    }
  },

  async bankAccountPaymentRequest(data) {
    try {
      return await ApiRequest.postRequest(
        `/gps/ach/payments`,
        config.payment[currency]
      );
    } catch (error) {
      throw error;
    }
  },
};

export default PaymentApi;
