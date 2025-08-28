package com.monayuser.ui.forgotcodeverify

import com.monayuser.data.model.response.VerifyOtpOnlyResponse
import com.monayuser.data.model.response.VerifyResponse
import com.monayuser.utils.CommonNavigator

interface VerifyCodeNavigator : CommonNavigator {
    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun changeMobileNumber()
    fun resendOTP()
    fun proceed()
    fun getVerifyOTPResponse(verifyResponse: VerifyResponse)
    fun VerifyOTPOnlyResponse(verifyOtpOnlyResponse: VerifyOtpOnlyResponse)
    fun successResendOtp(message: String)
    fun refreshActivity()
}