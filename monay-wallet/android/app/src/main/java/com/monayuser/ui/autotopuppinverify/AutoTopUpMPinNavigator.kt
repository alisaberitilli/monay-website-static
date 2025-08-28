package com.monayuser.ui.autotopuppinverify

import com.monayuser.data.model.response.*
import com.monayuser.utils.CommonNavigator

interface AutoTopUpMPinNavigator : CommonNavigator {

    fun backToPreviousScreen()
    fun confirmPin()
    fun forgotPin()
    fun payMoneyResponse(payMoneyResponse: SetAutoTopUpAmountResponse)
    fun getKYCStatusResponse(message: String)
    fun getInvalidPin()
}