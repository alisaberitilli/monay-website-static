package com.monayuser.ui.withdrawal

import com.monayuser.data.model.response.WithdrawalHistoryResponse
import com.monayuser.utils.CommonNavigator

interface WithdrawalNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun showPageLoader()
    fun showHideLoader()
    fun getWithdrawalHistoryResponse(withdrawalHistoryResponse: WithdrawalHistoryResponse)
    fun tryAgain()
}