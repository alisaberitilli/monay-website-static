package com.monayuser.ui.showmycode

import com.monayuser.ui.base.BaseViewModel

class MyCodeViewModel : BaseViewModel<MyCodeNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun openEditProfile() {
        navigator!!.openEditProfile()
    }

    fun shareQRCOde() {
        navigator!!.shareQRCOde()
    }

    fun openScanner() {
        navigator!!.openScanner()
    }
}