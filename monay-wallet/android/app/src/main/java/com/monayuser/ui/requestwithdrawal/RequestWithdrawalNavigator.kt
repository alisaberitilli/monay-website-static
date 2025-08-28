package com.monayuser.ui.requestwithdrawal

import com.monayuser.data.model.response.AddBankResponse
import com.monayuser.data.model.response.GetBankListResponse
import com.monayuser.data.model.response.RequestWithdrawalResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.utils.CommonNavigator

interface RequestWithdrawalNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()

    fun clickOnSendRequest()

    fun getWithdrawalMoneyResponse(requestWithdrawalResponse: RequestWithdrawalResponse)

    fun getBankListResponse(getBankListResponse: GetBankListResponse)

    fun getWalletResponse(walletResponse: WalletResponse)

    fun openBankAccountPopup()

    fun addBankResponse(addBankResponse: AddBankResponse)
}