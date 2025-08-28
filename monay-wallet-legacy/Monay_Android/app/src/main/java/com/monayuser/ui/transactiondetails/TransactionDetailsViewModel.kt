package com.monayuser.ui.transactiondetails

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.GetTransactionDetailsResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class TransactionDetailsViewModel : BaseViewModel<TransactionDetailsNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    /**
     * This method is used to apply click event on fields.
     */
    fun initView() {
        navigator!!.init()
    }

    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun clickOnShareReceipt() {
        navigator!!.clickOnShareReceipt()
    }

    /**
     * This method is used to call Transaction details API.
     */
    internal fun callTransactionDetailsAPI(appPreference: AppPreference, id: String?) {
        navigator!!.showProgressBar()
        disposable.add(
            GetTransactionDetailsResponse().doNetworkRequest(prepareRequestHashMap(id),
                appPreference,
                object : NetworkResponseCallback<GetTransactionDetailsResponse> {
                    override fun onResponse(getTransactionDetailsResponse: GetTransactionDetailsResponse) {
                        try {
                            navigator!!.hideProgressBar()
                            if (getTransactionDetailsResponse.isSuccess) {
                                navigator!!.getTransactionDetailsResponse(
                                    getTransactionDetailsResponse
                                )
                            } else {
                                if (!getTransactionDetailsResponse.message.equals("")) {
                                    onServerError(getTransactionDetailsResponse.message)
                                } else {
                                    onServerError(getTransactionDetailsResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(id: String?): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["id"] = id!!
        return requestParam!!
    }
}