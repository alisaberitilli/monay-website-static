package com.monayuser.ui.secondaryusertransaction

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.HashMap

class SecondaryUserTransactionViewModel : BaseViewModel<SecondaryUserTransactionListNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun showFilterDialog() {

    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call transaction list API.
     */
    internal fun callTransactionList(
        showProgress: Boolean,
        appPreferences: AppPreference,
        secondaryUserId:Int,
        name: String,
        minAmount: String,
        maxAmount: String,
        fromDate: String,
        toDate: String,
        transactionType: String,
        offset: String,
        limit: String
    ) {
        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            TransactionListResponse().doNetworkRequest(prepareRequestHashMap(secondaryUserId,
                name,
                minAmount,
                maxAmount,
                fromDate,
                toDate,
                transactionType,
                offset,
                limit
            ),
                appPreferences,
                object : NetworkResponseCallback<TransactionListResponse> {
                    override fun onResponse(transactionListResponse: TransactionListResponse) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (transactionListResponse.isSuccess) {
                            navigator!!.getTransactionListResponse(transactionListResponse)
                        } else {
                            if (!transactionListResponse.message.equals("")) {
                                onServerError(transactionListResponse.message)
                            } else {
                                onServerError(transactionListResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(
        id:Int,
        name: String,
        minAmount: String,
        maxAmount: String,
        fromDate: String,
        toDate: String,
        transactionType: String,
        offset: String,
        limit: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["secondaryUserId"] = id
        requestParam!!["name"] = name
        requestParam!!["minAmount"] = minAmount
        requestParam!!["maxAmount"] = maxAmount
        requestParam!!["fromDate"] = fromDate
        requestParam!!["toDate"] = toDate
        requestParam!!["actionType"] = transactionType.toLowerCase()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        return requestParam!!
    }
}