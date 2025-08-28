package com.monayuser.ui.forgotpassword

import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.response.ForgotPasswordResponse
import com.monayuser.utils.CommonNavigator

interface ForgotPasswordNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun proceed()
    fun useEmail()
    fun verifyCodeScreen(forgotPasswordNavigator: ForgotPasswordResponse)
    fun countryCodeClick()
    fun getCountryCodeList(countryCode: ArrayList<CountryData>)
}