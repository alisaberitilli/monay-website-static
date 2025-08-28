package com.monayuser.ui.settings

import com.monayuser.utils.CommonNavigator

interface SettingsNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun clickOnBackButton()
    fun notification()
    fun clickOnSecurity()
    fun userPolicy()
    fun termsCondition()
    fun support()
    fun faq()
    fun howItWorks()
    fun changePassword()
    fun clickOnWithdrawMoney()
}