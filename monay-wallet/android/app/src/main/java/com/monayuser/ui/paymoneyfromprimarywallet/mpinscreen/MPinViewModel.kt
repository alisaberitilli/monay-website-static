package com.monayuser.ui.paymoneyfromprimarywallet.mpinscreen

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.SecondaryUserPayResponse
import com.monayuser.databinding.ActivityForgotPinBinding
import com.monayuser.databinding.ActivityMpinSecondaryUserBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.HashMap

class MPinViewModel : BaseViewModel<MPinNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    var otpStr: String? = ""


    fun initView() {
        navigator!!.init()
    }


    fun pinValidation(viewBinding: ActivityMpinSecondaryUserBinding): Boolean {
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
        requestId: Int,parentId:Int
    ) {
        navigator!!.showProgressBar()

        disposable.add(
            SecondaryUserPayResponse().doNetworkRequest(prepareRequestHashMap(cardBean, requestId,parentId),
                appPreferences,
                object : NetworkResponseCallback<SecondaryUserPayResponse> {
                    override fun onResponse(payMoneyResponse: SecondaryUserPayResponse) {
                        navigator!!.hideProgressBar()
                        try {
                            if (payMoneyResponse.isSuccess) {
                                navigator!!.payMoneyResponse(payMoneyResponse)
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
                           // navigator!!.getInvalidPin()
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
    private fun prepareRequestHashMap(cardBean: CardBean, requestId: Int,parentId: Int): HashMap<String, Any> {
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
        if (requestId != 0) {
            requestParam!!["parentId"] = parentId.toString()
        }else{
            requestParam!!["parentId"] = parentId
        }

        return requestParam!!
    }
}