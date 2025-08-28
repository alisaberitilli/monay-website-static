package com.monayuser.ui.withdrawal

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.WithdrawalHistoryResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class WithdrawalViewModel : BaseViewModel<WithdrawalNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call withdrawal history request API.
     */
    internal fun pendingRequestAPI(
        showProgress: Boolean,
        appPreferences: AppPreference,
        offset: String,
        limit: String
    ) {
        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            WithdrawalHistoryResponse().doNetworkRequest(prepareRequestHashMap(offset, limit),
                appPreferences,
                object : NetworkResponseCallback<WithdrawalHistoryResponse> {
                    override fun onResponse(withdrawalHistoryResponse: WithdrawalHistoryResponse) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (withdrawalHistoryResponse.isSuccess) {
                            navigator!!.getWithdrawalHistoryResponse(withdrawalHistoryResponse)
                        } else {
                            if (!withdrawalHistoryResponse.message.equals("")) {
                                onServerError(withdrawalHistoryResponse.message)
                            } else {
                                onServerError(withdrawalHistoryResponse.errorBean!!.message!!)
                            }
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
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
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
    private fun prepareRequestHashMap(offset: String, limit: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        return requestParam!!
    }
}