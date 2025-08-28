package com.monayuser.ui.mybankaccounts

import com.monayuser.data.model.response.*
import com.monayuser.utils.CommonNavigator

interface BankAccountsNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()

    fun openBankAccountPopup()

    fun addBankResponse(addBankResponse: AddBankResponse)

    fun getBankListResponse(getBankListResponse: GetBankListResponse)

    fun deleteBankResponse(deleteBankResponse: DeleteBankResponse, position: Int)

    fun tryAgain()
}