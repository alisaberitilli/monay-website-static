package com.monayuser.ui.requestmoney

import com.monayuser.data.model.response.SendPaymentRequestResponse
import com.monayuser.utils.CommonNavigator

interface RequestMoneyNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()

    fun successToSentMoney()

    fun sendPaymentRequestResponse(sendPaymentRequestResponse: SendPaymentRequestResponse)

    fun getKYCStatusResponse(message: String)
}