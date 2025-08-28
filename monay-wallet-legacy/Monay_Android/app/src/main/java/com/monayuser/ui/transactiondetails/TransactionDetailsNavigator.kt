package com.monayuser.ui.transactiondetails

import com.monayuser.data.model.response.GetTransactionDetailsResponse
import com.monayuser.utils.CommonNavigator

interface TransactionDetailsNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun getTransactionDetailsResponse(getTransactionDetailsResponse: GetTransactionDetailsResponse)
    fun clickOnShareReceipt()
}