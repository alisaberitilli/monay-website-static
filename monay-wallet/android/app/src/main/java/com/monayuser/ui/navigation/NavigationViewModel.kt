package com.monayuser.ui.navigation

import com.monayuser.ui.base.BaseViewModel

class NavigationViewModel : BaseViewModel<NavigationNavigator>() {

    /**
     * This method is used to apply click event on fields.
     */
    fun initView() {
        navigator!!.init()
    }

    fun openScanner() {
        navigator!!.openScanner()
    }
}