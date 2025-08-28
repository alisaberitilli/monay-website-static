package com.monayuser.ui.login

import com.monayuser.data.model.bean.CountryCode
import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.response.SignInResponse
import com.monayuser.utils.CommonNavigator

interface LoginNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun agreedTermsFlag()
    fun setTermsConditionText()
    fun forgotPassword()
    fun proceed()
    fun openVerificationActivity(signIpResponse: SignInResponse)
    fun startHomeActivity(signIpResponse: SignInResponse)
    fun useEmail()
    fun clickOnSignUpButton()
    fun getInActiveResponse()

    fun getCountryCodeList(countryCode: ArrayList<CountryData>)
    fun countryCodeClick()
}