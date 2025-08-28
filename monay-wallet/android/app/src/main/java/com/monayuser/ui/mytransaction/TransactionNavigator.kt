package com.monayuser.ui.mytransaction

import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.utils.CommonNavigator

interface TransactionNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun showPageLoader()
    fun showHideLoader()
    fun showFilterDialog()
    fun getTransactionListResponse(transactionListResponse: TransactionListResponse)
    fun tryAgain()
}