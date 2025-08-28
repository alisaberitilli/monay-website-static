package com.monayuser.ui.more

import com.monayuser.data.model.response.LogoutResponse
import com.monayuser.utils.CommonNavigator

interface MoreNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun logout()
    fun myWallet()
    fun paymentRequests()
    fun withdrawMoney()
    fun withdrawalRequestHistory()
    fun myCards()
    fun myBankAccounts()
    fun settingsSupports()
    fun logoutResponse(logoutResponse: LogoutResponse)
    fun blockContacts()
    fun kyc()
    fun clickOnShareInvites()
    fun clickOnSecondaryUser()
    fun clickOnAutoTopUp()
    fun clickOnPrimaryUser()
}