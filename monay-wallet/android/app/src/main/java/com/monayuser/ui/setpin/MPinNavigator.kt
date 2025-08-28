package com.monayuser.ui.setpin

import com.monayuser.data.model.response.ChangePinResponse
import com.monayuser.data.model.response.MPinResponse
import com.monayuser.data.model.response.ResetPinResponse
import com.monayuser.utils.CommonNavigator

interface MPinNavigator : CommonNavigator{
    fun setPin()
    fun mPinResponse(mPinResponse: MPinResponse)
    fun backToPreviousScreen()
    fun backToSecurity()
    fun resetPinResponse(resetPinResponse: ResetPinResponse)
    fun changePinResponse(changePinResponse: ChangePinResponse)
    fun getWrongPinResponse()
    fun getWrongChangePinResponse()
}