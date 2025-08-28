package com.monayuser.ui.profile

import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.utils.CommonNavigator

interface ProfileNavigator : CommonNavigator {
    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun openEditProfile()
    fun openSecuritySetup()
    fun openMyCard();
    fun myWallet()
    fun clickOnShareCode()
    fun openPaymentRequest()
    fun showBarCode()
    fun shareQRCOde()
    fun backToPreviousActivity()
    fun openWithdrawalHistory()
    fun openMyBankAccounts()
    fun getProfileResponse(getUserProfileResponse: GetUserProfileResponse)
    fun tryAgain()
}