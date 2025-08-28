package com.monayuser.ui.supportcategory

import com.monayuser.ui.base.BaseViewModel

class SupportCategoryViewModel : BaseViewModel<SupportCategoryNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }
}