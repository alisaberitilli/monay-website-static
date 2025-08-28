package com.monayuser.ui.subpaymentrequest

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.DeclinedPaymentRequestResponse
import com.monayuser.data.model.response.PaymentRequestResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.lang.Exception
import java.util.*

class SubPaymentRequestViewModel : BaseViewModel<SubPaymentRequestNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call payment request API.
     */
    internal fun paymentRequestApi(
        showProgress: Boolean,
        appPreferences: AppPreference,
        offset: String,
        limit: String,
        requestType: String
    ) {
        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            PaymentRequestResponse().doNetworkRequest(prepareRequestHashMap(
                offset,
                limit,
                requestType
            ),
                appPreferences,
                object : NetworkResponseCallback<PaymentRequestResponse> {
                    override fun onResponse(paymentRequestResponse: PaymentRequestResponse) {
                        try {
                            navigator!!.hideProgressBar()
                            navigator!!.showHideLoader()
                            if (paymentRequestResponse.isSuccess) {
                                navigator!!.paymentRequestResponse(paymentRequestResponse)
                            } else {
                                if (!paymentRequestResponse.message.equals("")) {
                                    onServerError(paymentRequestResponse.message)
                                } else {
                                    onServerError(paymentRequestResponse.errorBean!!.message!!)
                                }
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else {
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                        }

                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(
        offset: String,
        limit: String,
        requestType: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        requestParam!!["type"] = requestType
        return requestParam!!
    }

    /**
     * This method is used to call decline payment request API.
     */
    internal fun declinedPaymentRequestApi(
        appPreferences: AppPreference,
        requestId: String,
        reason: String,
        position: Int
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            DeclinedPaymentRequestResponse().doNetworkRequest(prepareRequestHashMap(
                requestId,
                reason
            ),
                appPreferences,
                object : NetworkResponseCallback<DeclinedPaymentRequestResponse> {
                    override fun onResponse(declinedPaymentRequestResponse: DeclinedPaymentRequestResponse) {
                        navigator!!.hideProgressBar()
                        if (declinedPaymentRequestResponse.isSuccess) {
                            navigator!!.declinedPaymentRequestResponse(
                                declinedPaymentRequestResponse,
                                position
                            )
                        } else {
                            if (!declinedPaymentRequestResponse.message.equals("")) {
                                onServerError(declinedPaymentRequestResponse.message)
                            } else {
                                onServerError(declinedPaymentRequestResponse.errorBean!!.message!!)
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
                        else {
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                        }

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
    private fun prepareRequestHashMap(requestId: String, reason: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["requestId"] = requestId
        requestParam!!["declineReason"] = reason
        return requestParam!!
    }
}