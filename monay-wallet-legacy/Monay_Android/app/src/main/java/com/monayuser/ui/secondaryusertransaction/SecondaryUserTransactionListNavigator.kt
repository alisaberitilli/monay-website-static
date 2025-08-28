package com.monayuser.ui.secondaryusertransaction

import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonNavigator

interface SecondaryUserTransactionListNavigator : CommonNavigator{

    fun tryAgain()
    fun showPageLoader()
    fun showHideLoader()
    fun getTransactionListResponse(transactionListResponse: TransactionListResponse)
    fun backToPreviousActivity()

}