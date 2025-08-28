package com.monayuser.ui.home

import android.util.Log
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.DeclinedPaymentRequestResponse
import com.monayuser.data.model.response.HomeResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class HomeViewModel : BaseViewModel<HomeNavigator>() {

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

    fun sendMoney() {
        navigator!!.sendMoney()
    }

    fun addMoney() {
        navigator!!.addMoney()
    }

    fun withdrawMoney() {
        navigator!!.withdrawMoney()
    }

    fun requestMoney() {
        navigator!!.requestMoney()
    }

    fun openNotification() {
        navigator!!.openNotification()
    }

    fun viewAllRequest() {
        navigator!!.viewAllRequest()
    }

    fun viewAllTransaction() {
        navigator!!.viewAllTransaction()
    }

    fun openProfile() {
        navigator!!.openProfile()
    }

    /**
     * This method is used to call Home API.
     */
    internal fun callHomeAPI(
        appPreference: AppPreference
    ) {
        navigator!!.showProgressBar()

        disposable.add(
            HomeResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreference,
                object : NetworkResponseCallback<HomeResponse> {
                    override fun onResponse(homeResponse: HomeResponse) {
                        try {
                            navigator!!.hideProgressBar()
                            if (homeResponse.isSuccess) {
                                navigator!!.getHomeResponse(homeResponse)
                            } else {
                                if (!homeResponse.message.equals("")) {
                                    onServerError(homeResponse.message)
                                } else {
                                    onServerError(homeResponse.errorBean!!.message!!)
                                }
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
    private fun prepareRequestHashMap(): HashMap<String, Any> {
        requestParam = HashMap()
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