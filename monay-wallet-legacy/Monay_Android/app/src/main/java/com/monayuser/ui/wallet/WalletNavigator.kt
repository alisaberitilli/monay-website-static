package com.monayuser.ui.wallet

import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.utils.CommonNavigator

interface WalletNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun tryAgain()
    fun backToPreviousActivity()
    fun addMoney()
    fun getWalletResponse(walletResponse: WalletResponse)
    fun showPageLoader()
    fun showHideLoader()
    fun getTransactionListResponse(transactionListResponse: TransactionListResponse)
}