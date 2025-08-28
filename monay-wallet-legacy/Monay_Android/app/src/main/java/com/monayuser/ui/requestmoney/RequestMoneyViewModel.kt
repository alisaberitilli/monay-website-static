package com.monayuser.ui.requestmoney

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.SendPaymentRequestResponse
import com.monayuser.databinding.ActivityRequestMoneyBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class RequestMoneyViewModel : BaseViewModel<RequestMoneyNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    var amount = ""
    var message = ""

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun successToSentMoney() {
        navigator!!.successToSentMoney()
    }

    fun checkAmountMessage(viewDataBinding: ActivityRequestMoneyBinding): Boolean {
        amount = viewDataBinding!!.amountEt.text.trim().toString()
        message = viewDataBinding!!.messageEt.text.trim().toString()
        if (viewDataBinding!!.amountEt.text.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_amount))
            viewDataBinding.amountEt.requestFocus()
            return false
        }

        if (!CommonUtils.isValidNumeric(viewDataBinding.amountEt.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_amount_))
            viewDataBinding.amountEt.requestFocus()
            return false
        }
        return true
    }

    /**
     * This method is used to call send payment request API.
     */
    internal fun sendPaymentRequestApi(appPreferences: AppPreference, toUserId: String) {
        navigator!!.showProgressBar()
        disposable.add(
            SendPaymentRequestResponse().doNetworkRequest(prepareRequestHashMap(toUserId),
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
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
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
    private fun prepareRequestHashMap(toUserId: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["toUserId"] = toUserId
        requestParam!!["amount"] = amount
        requestParam!!["message"] = message
        return requestParam!!
    }
}