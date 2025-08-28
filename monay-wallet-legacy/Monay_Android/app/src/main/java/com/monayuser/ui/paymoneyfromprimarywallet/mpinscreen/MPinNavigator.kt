package com.monayuser.ui.paymoneyfromprimarywallet.mpinscreen

import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.SecondaryUserPayResponse
import com.monayuser.utils.CommonNavigator

interface MPinNavigator : CommonNavigator {

    fun backToPreviousScreen()
    fun confirmPin()
    fun forgotPin()
    fun payMoneyResponse(payMoneyResponse: SecondaryUserPayResponse)
}