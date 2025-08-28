package com.monayuser.ui.supportcategory

import com.monayuser.utils.CommonNavigator

interface SupportCategoryNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun tryAgain()
}