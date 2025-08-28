package com.monayuser.ui.showmycode

import com.monayuser.utils.CommonNavigator

interface MyCodeNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun openEditProfile()
    fun shareQRCOde()
    fun openScanner()
}