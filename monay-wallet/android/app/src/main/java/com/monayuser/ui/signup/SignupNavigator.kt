package com.monayuser.ui.signup

import com.monayuser.data.model.response.SignUpResponse
import com.monayuser.utils.CommonNavigator

interface SignupNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun agreedTermsFlag()
    fun setTermsConditionText()
    fun login()
    fun proceed()
    fun startVerificationActivity(signUpResponse: SignUpResponse)
    fun backToPreviousActivity()
    fun emailCheckResponse(status: Boolean, message: String)
}