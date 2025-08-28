package com.monayuser.ui.forgotmpin

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.response.AddMoneyResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.RequestWithdrawalResponse
import com.monayuser.data.model.response.SendPaymentRequestResponse
import com.monayuser.databinding.ActivityForgotPinBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class ForgotMPinViewModel : BaseViewModel<ForgotMPinNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    var otpStr: String? = ""

    fun backToPreviousScreen() {
        navigator!!.backToPreviousScreen()
    }

    fun confirmPin() {
        navigator!!.confirmPin()
    }

    fun initView() {
        navigator!!.init()
    }

    fun forgotPin() {
        navigator!!.forgotPin()
    }

    fun pinValidation(viewBinding: ActivityForgotPinBinding): Boolean {
        otpStr = viewBinding!!.forgotPinview.value.toString()
        if (otpStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_pin))
            return false
        }
        if (otpStr.toString().length < 4) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_lengthtxt))
            return false
        }
        return true
    }

    /**
     * This method is used to call pay money API.
     */
    internal fun payMoney(
        appPreferences: AppPreference, cardBean: CardBean,
        requestId: Int
    ) {
        navigator!!.showProgressBar()

        disposable.add(
            PayMoneyResponse().doNetworkRequest(prepareRequestHashMap(cardBean, requestId),
                appPreferences,
                object : NetworkResponseCallback<PayMoneyResponse> {
                    override fun onResponse(payMoneyResponse: PayMoneyResponse) {
                        navigator!!.hideProgressBar()
                        try {
                            if (payMoneyResponse.isSuccess) {
                                if (payMoneyResponse!!.status.equals(
                                        "TRANSACTION_LIMIT_EXHAUSTED",
                                        true
                                    )
                                ) {
                                    navigator!!.getKYCStatusResponse(payMoneyResponse!!.message)
                                } else {
                                    navigator!!.payMoneyResponse(payMoneyResponse)
                                }
                            } else if (!payMoneyResponse.message.equals("")) {
                                onServerError(payMoneyResponse.message)
                            } else {
                                onServerError(payMoneyResponse.errorBean!!.message!!)
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "") {
                            navigator!!.showValidationError(error)
                            navigator!!.getInvalidPin()
                        } else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(cardBean: CardBean, requestId: Int): HashMap<String, Any> {
        requestParam = HashMap()
        if (cardBean.userId == 0) {
            requestParam!!["toUserId"] = "0"
        } else {
            requestParam!!["toUserId"] = cardBean.userId.toString()
        }
        requestParam!!["requestId"] = requestId
        requestParam!!["amount"] = cardBean.amount!!
        requestParam!!["message"] = cardBean.message!!
        requestParam!!["paymentMethod"] = cardBean.paymentMethod!!.toLowerCase()
        requestParam!!["cardId"] = cardBean.id!!.toString()
        requestParam!!["cardType"] = ""
        requestParam!!["cardNumber"] = cardBean.cardNumber!!
        requestParam!!["nameOnCard"] = cardBean.nameOnCard!!
        requestParam!!["month"] = cardBean.month!!
        requestParam!!["year"] = cardBean.year!!
        requestParam!!["cvv"] = cardBean.cvv!!
        requestParam!!["mpin"] = otpStr!!
        requestParam!!["saveCard"] = cardBean.saveCard!!
        return requestParam!!
    }

    /**
     * This method is used to call add money API.
     */
    internal fun addMoney(
        appPreferences: AppPreference,
        cardBean: CardBean,
        mpin: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            AddMoneyResponse().doNetworkRequest(prepareRequestHashMapForAddMoney(cardBean, mpin!!),
                appPreferences,
                object : NetworkResponseCallback<AddMoneyResponse> {
                    override fun onResponse(moneyResponse: AddMoneyResponse) {
                        navigator!!.hideProgressBar()
                        if (moneyResponse.isSuccess) {
                            if (moneyResponse!!.status != null && moneyResponse!!.status.equals(
                                    "TRANSACTION_LIMIT_EXHAUSTED",
                                    true
                                )
                            ) {
                                navigator!!.getKYCStatusResponse(moneyResponse!!.message)
                            } else {
                                navigator!!.addMoneyResponse(moneyResponse)
                            }
                        } else {
                            if (!moneyResponse.message.equals("")) {
                                onServerError(moneyResponse.message)
                            } else {
                                onServerError(moneyResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "") {
                            navigator!!.showValidationError(error)
                            navigator!!.getInvalidPin()
                        } else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapForAddMoney(
        cardBean: CardBean,
        mpin: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["amount"] = cardBean.amount!!
        requestParam!!["cardId"] = cardBean.id!!.toString()
        requestParam!!["cardNumber"] = cardBean.cardNumber!!
        requestParam!!["month"] = cardBean.month!!
        requestParam!!["year"] = cardBean.year!!
        requestParam!!["cardType"] = ""
        requestParam!!["cvv"] = cardBean.cvv!!
        requestParam!!["nameOnCard"] = cardBean.nameOnCard!!
        requestParam!!["mpin"] = mpin
        requestParam!!["message"] = cardBean.message!!
        requestParam!!["saveCard"] = cardBean.saveCard!!
        return requestParam!!
    }

    /**
     * This method is used to call send payment request API.
     */
    internal fun sendPaymentRequestApi(appPreferences: AppPreference, cardBean: CardBean) {
        navigator!!.showProgressBar()
        disposable.add(
            SendPaymentRequestResponse().doNetworkRequest(prepareRequestHashMapForRequest(cardBean),
                appPreferences,
                object : NetworkResponseCallback<SendPaymentRequestResponse> {
                    override fun onResponse(sendPaymentRequestResponse: SendPaymentRequestResponse) {
                        navigator!!.hideProgressBar()

                        if (sendPaymentRequestResponse.isSuccess) {
                            if (sendPaymentRequestResponse!!.status != null && sendPaymentRequestResponse!!.status.equals(
                                    "TRANSACTION_LIMIT_EXHAUSTED",
                                    true
                                )
                            ) {
                                navigator!!.getKYCStatusResponse(sendPaymentRequestResponse!!.message)
                            } else {
                                navigator!!.sendPaymentRequestResponse(sendPaymentRequestResponse)
                            }
                        } else {
                            if (!sendPaymentRequestResponse.message.equals("")) {
                                onServerError(sendPaymentRequestResponse.message)
                            } else {
                                onServerError(sendPaymentRequestResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "") {
                            navigator!!.showValidationError(error)
                            navigator!!.getInvalidPin()
                        } else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapForRequest(cardBean: CardBean): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["toUserId"] = cardBean.userId!!.toString()
        requestParam!!["amount"] = cardBean.amount!!
        requestParam!!["message"] = cardBean.message!!
        return requestParam!!
    }

    /**
     * This method is used to call Request Withdrawal API.
     */
    internal fun requestWithdrawalAPI(
        appPreferences: AppPreference,
        amount: String,
        bankId: String
    ) {
        navigator!!.showProgressBar()

        disposable.add(
            RequestWithdrawalResponse().doNetworkRequest(prepareRequestHashMap(amount, bankId),
                appPreferences,
                object : NetworkResponseCallback<RequestWithdrawalResponse> {
                    override fun onResponse(requestWithdrawalResponse: RequestWithdrawalResponse) {
                        navigator!!.hideProgressBar()
                        if (requestWithdrawalResponse.isSuccess) {
                            if (requestWithdrawalResponse!!.status != null && requestWithdrawalResponse!!.status.equals(
                                    "TRANSACTION_LIMIT_EXHAUSTED",
                                    true
                                )
                            ) {
                                navigator!!.getKYCStatusResponse(requestWithdrawalResponse!!.message)
                            } else {
                                navigator!!.getWithdrawalMoneyResponse(requestWithdrawalResponse)
                            }
                        } else {
                            if (!requestWithdrawalResponse.message.equals("")) {
                                onServerError(requestWithdrawalResponse.message)
                            } else {
                                onServerError(requestWithdrawalResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "") {
                            navigator!!.showValidationError(error)
                            navigator!!.getInvalidPin()
                        } else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(amount: String, bankId: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["bankId"] = bankId
        requestParam!!["amount"] = amount.trim()
        requestParam!!["mpin"] = otpStr!!
        return requestParam!!
    }

}