package com.monayuser.ui.autotopuppinverify

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBeanAutoTopUp
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.SetAutoTopUpAmountResponse
import com.monayuser.databinding.ActivityAutoTopupPinBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class AutoTopUpMPinViewModel : BaseViewModel<AutoTopUpMPinNavigator>() {

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

    fun pinValidation(viewBinding: ActivityAutoTopupPinBinding): Boolean {
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
    internal fun callAutoTopUpApi(
        appPreferences: AppPreference, cardBean: CardBeanAutoTopUp,
        requestId: Int
    ) {
        navigator!!.showProgressBar()

        disposable.add(
            SetAutoTopUpAmountResponse().doNetworkRequest(prepareRequestHashMap(cardBean, requestId),
                appPreferences,
                object : NetworkResponseCallback<SetAutoTopUpAmountResponse> {
                    override fun onResponse(setAutoTopUpAmountResponse: SetAutoTopUpAmountResponse) {
                        navigator!!.hideProgressBar()
                        try {
                            if (setAutoTopUpAmountResponse.isSuccess) {
                                if (setAutoTopUpAmountResponse!!.status.equals(
                                        "TRANSACTION_LIMIT_EXHAUSTED",
                                        true
                                    )
                                ) {
                                    navigator!!.getKYCStatusResponse(setAutoTopUpAmountResponse!!.message)
                                } else {
                                    navigator!!.payMoneyResponse(setAutoTopUpAmountResponse)
                                }
                            } else if (!setAutoTopUpAmountResponse.message.equals("")) {
                                onServerError(setAutoTopUpAmountResponse.message)
                            } else {
                                onServerError(setAutoTopUpAmountResponse.errorBean!!.message!!)
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

   /* "minimumWalletAmount": 0,
    "refillWalletAmount": 0,
    "paymentMethod": "card",
    "cardId": "string",
    "cardType": "string",
    "cardNumber": "string",
    "nameOnCard": "string",
    "month": "string",
    "year": "string",
    "cvv": "string",
    "saveCard": "no",
    "mpin": "string"*/
    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(cardBean: CardBeanAutoTopUp, requestId: Int): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["minimumWalletAmount"] = cardBean.minimumWalletAmount!!
        requestParam!!["refillWalletAmount"] = cardBean.refileWalletAmount!!
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





}

