package com.monayuser.ui.subpaymentrequest

import com.monayuser.data.model.response.DeclinedPaymentRequestResponse
import com.monayuser.data.model.response.PaymentRequestResponse
import com.monayuser.utils.CommonNavigator

interface SubPaymentRequestNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun tryAgain()
    fun showPageLoader()
    fun showHideLoader()
    fun paymentRequestResponse(paymentRequestResponse: PaymentRequestResponse)
    fun declinedPaymentRequestResponse(
        declinedPaymentRequestResponse: DeclinedPaymentRequestResponse,
        position: Int
    )
}