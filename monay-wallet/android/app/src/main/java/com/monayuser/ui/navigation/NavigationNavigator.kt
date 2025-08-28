package com.monayuser.ui.navigation

import com.monayuser.utils.CommonNavigator


interface NavigationNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun openScanner()
}