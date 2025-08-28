package com.monayuser.ui.home

import com.monayuser.data.model.response.DeclinedPaymentRequestResponse
import com.monayuser.data.model.response.HomeResponse
import com.monayuser.utils.CommonNavigator


interface HomeNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */

    fun tryAgain()

    fun sendMoney()

    fun addMoney()

    fun requestMoney()

    fun openNotification()

    fun viewAllRequest()

    fun viewAllTransaction()

    fun openProfile()

    fun withdrawMoney()

    fun getHomeResponse(homeResponse: HomeResponse)

    fun declinedPaymentRequestResponse(declinedPaymentRequestResponse: DeclinedPaymentRequestResponse, position: Int)
}