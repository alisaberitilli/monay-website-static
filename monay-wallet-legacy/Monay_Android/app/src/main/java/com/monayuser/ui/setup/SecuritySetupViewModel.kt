package com.monayuser.ui.setup

import com.monayuser.ui.base.BaseViewModel

class SecuritySetupViewModel : BaseViewModel<SecuritySetupNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun setupFaceID() {
        navigator!!.setupFaceID()
    }

    fun setupFingerPrint() {
        navigator!!.setupFingerPrint()
    }

    fun setupPin() {
        navigator!!.setupPin()
    }

    fun changePin() {
        navigator!!.changePin()
    }
}