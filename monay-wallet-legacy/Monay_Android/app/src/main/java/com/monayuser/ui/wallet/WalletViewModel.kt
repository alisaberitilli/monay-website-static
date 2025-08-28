package com.monayuser.ui.wallet

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class WalletViewModel : BaseViewModel<WalletNavigator>() {

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

    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun addMoney() {
        navigator!!.addMoney()
    }

    /**
     * This method is used to call Wallet API.
     */
    internal fun callWalletAPI(
        appPreference: AppPreference
    ) {
        disposable.add(
            WalletResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreference,
                object : NetworkResponseCallback<WalletResponse> {
                    override fun onResponse(walletResponse: WalletResponse) {
                        try {
                            if (walletResponse.isSuccess) {
                                navigator!!.getWalletResponse(walletResponse)
                            } else {
                                if (!walletResponse.message.equals("")) {
                                    onServerError(walletResponse.message)
                                } else {
                                    onServerError(walletResponse.errorBean!!.message!!)
                                }
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {

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
     * This method is used to call transaction list API.
     */
    internal fun callTransactionList(
        showProgress: Boolean,
        appPreferences: AppPreference,
        name: String,
        minAmount: String,
        maxAmount: String,
        fromDate: String,
        toDate: String,
        offset: String,
        limit: String
    ) {

        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            TransactionListResponse().doNetworkRequest(prepareRequestHashMap(
                name,
                minAmount,
                maxAmount,
                fromDate,
                toDate,
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
        name: String,
        minAmount: String,
        maxAmount: String,
        fromDate: String,
        toDate: String,
        offset: String,
        limit: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["name"] = name
        requestParam!!["minAmount"] = minAmount
        requestParam!!["maxAmount"] = maxAmount
        requestParam!!["fromDate"] = fromDate
        requestParam!!["toDate"] = toDate
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        requestParam!!["actionType"] = ""
        requestParam!!["paymentMethod"] = "wallet"
        return requestParam!!
    }
}