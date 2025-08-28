package com.monayuser.ui.settings

import com.monayuser.ui.base.BaseViewModel

class SettingsViewModel : BaseViewModel<SettingsNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun clickOnBackButton() {
        navigator!!.clickOnBackButton()
    }

    fun notification() {
        navigator!!.notification()
    }

    fun clickOnSecurity() {
        navigator!!.clickOnSecurity()
    }

    fun userPolicy() {
        navigator!!.userPolicy()
    }

    fun termsCondition() {
        navigator!!.termsCondition()
    }

    fun support() {
        navigator!!.support()
    }

    fun faq() {
        navigator!!.faq()
    }

    fun howItWorks() {
        navigator!!.howItWorks()
    }

    fun changePassword() {
        navigator!!.changePassword()
    }

    fun clickOnWithdrawMoney() {
        navigator!!.clickOnWithdrawMoney()
    }
}