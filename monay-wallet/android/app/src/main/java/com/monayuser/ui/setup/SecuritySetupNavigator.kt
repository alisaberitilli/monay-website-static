package com.monayuser.ui.setup

import com.monayuser.utils.CommonNavigator


interface SecuritySetupNavigator : CommonNavigator {
    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun setupFaceID()
    fun setupFingerPrint()
    fun setupPin()
    fun changePin()
}