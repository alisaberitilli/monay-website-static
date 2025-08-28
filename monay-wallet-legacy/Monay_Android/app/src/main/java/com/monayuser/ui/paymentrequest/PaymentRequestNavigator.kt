package com.monayuser.ui.paymentrequest

import com.monayuser.utils.CommonNavigator


interface PaymentRequestNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
}