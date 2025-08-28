package com.monayuser.ui.otpverify

import com.monayuser.data.model.response.*
import com.monayuser.utils.CommonNavigator

interface VerifyOtpNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun changeMobileNumber()
    fun resendOTP()
    fun proceed()
    fun getVerifyOTPResponse(verifyResponse: VerifyResponse)
    fun getVerifyPinResponse(verifyPinResponse: VerifyPinResponse)
    fun verifyNumberResponse(updateNumberResponse: VerifyUpdateNumberResponse)
    fun verifyEmailResponse(verifyResponse: UpdateEmailVerifyResponse)
    fun getInvalidOTP()
    fun successOtpSend(message: String)
    fun refreshActivity()
    fun getVerifyPrimaryOTPResponse(verifyResponse: VerifyPrimaryOtpResponse)
}