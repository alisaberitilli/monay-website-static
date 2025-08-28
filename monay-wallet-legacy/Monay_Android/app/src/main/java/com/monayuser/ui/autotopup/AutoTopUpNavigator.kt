package com.monayuser.ui.autotopup

import com.monayuser.data.model.response.*
import com.monayuser.utils.CommonNavigator

interface AutoTopUpNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun successToSentMoney()
    fun validationResponse(cardNumber:String,nameOnCard:String,month:String,year:String,cvv:String)
    fun payMoneyResponse(payMoneyResponse: PayMoneyResponse)
    fun getCardListResponse(getCardListResponse: GetCardListAutoTopUpResponse)


    fun enableDisablePopup()
    fun AutoTopEnableDisableSuccessfully(response: AutoTopUpEnableDisableResponse,enableDisableBoolean: Boolean)


}