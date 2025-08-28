package com.monayuser.ui.mobileverification

import com.monayuser.data.model.bean.CountryCode
import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.response.ForgotPinResponse
import com.monayuser.data.model.response.SendOtpResponse
import com.monayuser.data.model.response.UpdateEmailResponse
import com.monayuser.data.model.response.UpdateNumberResponse
import com.monayuser.utils.CommonNavigator

interface MobileVerificationNavigator:CommonNavigator {

    fun proceed()
    fun sendOtpResponse(sendOtpResponse: SendOtpResponse)
    fun backToPreviousScreen()
    fun useEmail()
    fun forgotPinResponse(forgotPinResponse: ForgotPinResponse)
    fun updateNumber(updateNumberResponse: UpdateNumberResponse)
    fun updateEmail(emailResponse: UpdateEmailResponse)
    fun backToLogin()
    fun getCountryCodeList(countryCode: ArrayList<CountryData>)

    fun countryCodeClick()
}