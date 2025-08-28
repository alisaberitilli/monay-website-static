package com.monayuser.ui.successaddmoney

import com.monayuser.ui.base.BaseViewModel

class AddSentMoneyViewModel : BaseViewModel<AddSentMoneyNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun goToHome() {
        navigator!!.goToHome()
    }
}