package com.monayuser.ui.welcome

import com.monayuser.ui.base.BaseViewModel

class WelcomeViewModel : BaseViewModel<WelcomeNavigator>() {

    /**
     * This method is used to apply click event on fields.
     */
    fun initView() {
        navigator!!.init()
    }

    fun openSignup() {
        navigator!!.openSignup()
    }
}