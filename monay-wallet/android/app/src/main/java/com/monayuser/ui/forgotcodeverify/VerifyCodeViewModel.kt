package com.monayuser.ui.forgotcodeverify

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.ResendOtpResponse
import com.monayuser.data.model.response.VerifyOtpOnlyResponse
import com.monayuser.data.model.response.VerifyResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class VerifyCodeViewModel : BaseViewModel<VerifyCodeNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun changeMobileNumber() {
        navigator!!.changeMobileNumber()
    }

    fun resendOTP() {
        navigator!!.resendOTP()
    }

    fun proceed() {
        navigator!!.proceed()
    }

    /**
     * This method is used to call Resend API.
     */
    internal fun resendOtpApi(
        appPreferences: AppPreference,
        userId: String,
        email: String,
        countryCode: String,
        phoneNumber: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ResendOtpResponse().doNetworkRequest(prepareRequestHashMap1(
                userId,
                email,
                countryCode,
                phoneNumber
            ),
                appPreferences,
                object : NetworkResponseCallback<ResendOtpResponse> {
                    override fun onResponse(resendOtpResponse: ResendOtpResponse) {
                        navigator!!.hideProgressBar()
                        if (resendOtpResponse.isSuccess) {
//                            navigator!!.showValidationError(resendOtpResponse.message)
                            navigator!!.successResendOtp(resendOtpResponse.message!!)

                        } else {
                            if (!resendOtpResponse.message.equals("")) {
                                onServerError(resendOtpResponse.message)
                            } else {
                                onServerError(resendOtpResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(message)
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap1(
        userId: String,
        email: String,
        countryCode: String,
        phoneNumber: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        userId
        requestParam!!["phoneNumberCountryCode"] = countryCode.trim()
        if (email.trim() == "") {
            requestParam!!["username"] = phoneNumber.trim()
        } else {
            requestParam!!["username"] = email.trim()
        }
        return requestParam!!
    }

    /**
     * This method is used to call verify OTP API.
     */
    internal fun verifyOTPAPI(
        appPreferences: AppPreference,
        otpCode: String,
        email: String,
        countryCode: String,
        phoneNumber: String,
        deviceId: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            VerifyResponse().doNetworkRequest(prepareRequestHashMap(
                otpCode,
                email,
                countryCode,
                phoneNumber,
                deviceId
            ),
                appPreferences,
                object : NetworkResponseCallback<VerifyResponse> {
                    override fun onResponse(verifyResponse: VerifyResponse) {
                        navigator!!.hideProgressBar()
                        if (verifyResponse.isSuccess) {
                            navigator!!.getVerifyOTPResponse(verifyResponse)
                        } else {
                            if (!verifyResponse.message.equals("")) {
                                onServerError(verifyResponse.message)
                            } else {
                                onServerError(verifyResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "")
                        {
//                            navigator!!.showValidationError(error)
                            navigator!!.successResendOtp(error)
                        }

                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(
        otpCode: String,
        email: String,
        countryCode: String,
        phoneNumber: String,
        deviceId: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        deviceId
        requestParam!!["otp"] = otpCode
        if (email.equals("")) {
            requestParam!!["phoneNumberCountryCode"] = countryCode
            requestParam!!["username"] = phoneNumber
        } else {
            requestParam!!["phoneNumberCountryCode"] = countryCode
            requestParam!!["username"] = email
        }
        return requestParam!!
    }


    internal fun verifyOTPOnlyAPI(
        appPreferences: AppPreference,
        otpCode: String,
        email: String,
        countryCode: String,
        phoneNumber: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            VerifyOtpOnlyResponse().doNetworkRequest(prepareRequestHashMapOtpOnly(
                otpCode,
                email,
                countryCode,
                phoneNumber
            ),
                appPreferences,
                object : NetworkResponseCallback<VerifyOtpOnlyResponse> {
                    override fun onResponse(verifyResponse: VerifyOtpOnlyResponse) {
                        navigator!!.hideProgressBar()
                        if (verifyResponse.isSuccess) {
                            navigator!!.VerifyOTPOnlyResponse(verifyResponse)
                        } else {
                            if (!verifyResponse.message.equals("")) {
                                onServerError(verifyResponse.message)
                            } else {
                                onServerError(verifyResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "")
                        {
//                            navigator!!.showValidationError(error)
                            navigator!!.successResendOtp(error)
                        }
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapOtpOnly(
        otpCode: String,
        email: String,
        countryCode: String,
        phoneNumber: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["otp"] = otpCode
        if (email.equals("")) {
            requestParam!!["phoneNumberCountryCode"] = countryCode
            requestParam!!["username"] = phoneNumber
        } else {
            requestParam!!["phoneNumberCountryCode"] = countryCode
            requestParam!!["username"] = email
        }
        return requestParam!!
    }

}