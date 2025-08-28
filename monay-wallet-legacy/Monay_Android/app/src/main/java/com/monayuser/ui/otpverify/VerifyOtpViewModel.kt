package com.monayuser.ui.otpverify

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.*
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class VerifyOtpViewModel : BaseViewModel<VerifyOtpNavigator>() {

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
     * This method is used to call Verify OTP API.
     */
    internal fun callVerifyOTPAPI(
        appPreferences: AppPreference,
        otpCode: String,
        email: String,
        countryCode: String,
        phoneNumber: String,
        modelNumber: String,
        deviceId: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            VerifyResponse().doNetworkRequest(prepareRequestHashMap(
                otpCode,
                email,
                countryCode,
                phoneNumber,
                modelNumber,
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
                        if (error != null && error != "") {
                            navigator!!.successOtpSend(error)
                        } else
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
        modelNumber: String,
        deviceId: String
    ): HashMap<String, Any> {
        deviceId
        modelNumber
        requestParam = HashMap()
        requestParam!!["otp"] = otpCode
        requestParam!!["phoneNumberCountryCode"] = countryCode.trim()
        if (email.trim() == "") {
            requestParam!!["username"] = phoneNumber.trim()
        } else {
            requestParam!!["username"] = email.trim()
        }
        return requestParam!!
    }

    /**
     * This method is used to call Resend OTP API.
     */
    internal fun resendOtpApi(
        appPreferences: AppPreference,
        userId: String,
        countryCode: String,
        phoneNumber: String,
        email: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ResendOtpResponse().doNetworkRequest(prepareRequestHashMapForResend(
                userId,
                countryCode,
                phoneNumber,
                email
            ),
                appPreferences,
                object : NetworkResponseCallback<ResendOtpResponse> {
                    override fun onResponse(resendOtpResponse: ResendOtpResponse) {
                        navigator!!.hideProgressBar()
                        if (resendOtpResponse.isSuccess) {
//                            navigator!!.showValidationError(resendOtpResponse.message)
                            navigator!!.successOtpSend(resendOtpResponse.message)
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
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "") {
                            navigator!!.showValidationError(error)
                        } else
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
    private fun prepareRequestHashMapForResend(
        userId: String,
        countryCode: String,
        phoneNumber: String,
        email: String
    ): HashMap<String, Any> {
        userId
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = countryCode.trim()
        if (email.trim() == "") {
            requestParam!!["username"] = phoneNumber.trim()
        } else {
            requestParam!!["username"] = email.trim()
        }
        return requestParam!!
    }


    internal fun verifyPinOTPAPI(
        appPreferences: AppPreference, otpCode: String, countryCode: String, phoneNumber: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            VerifyPinResponse().doNetworkRequest(prepareRequestHashMap1(
                otpCode,
                countryCode,
                phoneNumber
            ),
                appPreferences,
                object : NetworkResponseCallback<VerifyPinResponse> {
                    override fun onResponse(verifyResponse: VerifyPinResponse) {
                        navigator!!.hideProgressBar()
                        if (verifyResponse.isSuccess) {
                            navigator!!.getVerifyPinResponse(verifyResponse)
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
                        if (error != null && error != "") {
                            navigator!!.successOtpSend(error)
                        } else
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
        otpCode: String,
        countryCode: String,
        phoneNumber: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["otp"] = otpCode
        requestParam!!["phoneNumberCountryCode"] = countryCode.trim()
        requestParam!!["username"] = phoneNumber.trim()
        return requestParam!!
    }


    internal fun forgotPinAPI(
        appPreferences: AppPreference,
        countryCode: String,
        phoneNumber: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ForgotPinResponse().doNetworkRequest(prepareRequestHashMap1(countryCode, phoneNumber),
                appPreferences,
                object : NetworkResponseCallback<ForgotPinResponse> {
                    override fun onResponse(pinResponse: ForgotPinResponse) {
                        navigator!!.hideProgressBar()
                        if (pinResponse.isSuccess) {
//                            navigator!!.showValidationError(pinResponse.message)
                            navigator!!.successOtpSend(pinResponse.message)
                        } else {
                            if (!pinResponse.message.equals("")) {
                                onServerError(pinResponse.message)
                            } else {
                                onServerError(pinResponse.errorBean!!.message!!)
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
        countryCode: String,
        phoneNumber: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = countryCode.toString()
        requestParam!!["username"] = phoneNumber.toString()
        return requestParam!!
    }

    internal fun updateNumberVerifyAPI(
        appPreferences: AppPreference,
        otp: String,
        countryCode: String,
        phoneNumber: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            VerifyUpdateNumberResponse().doNetworkRequest(prepareRequestHashMapNumberVerify(
                otp,
                countryCode,
                phoneNumber
            ),
                appPreferences,
                object : NetworkResponseCallback<VerifyUpdateNumberResponse> {
                    override fun onResponse(verifyResponse: VerifyUpdateNumberResponse) {
                        navigator!!.hideProgressBar()
                        if (verifyResponse.isSuccess) {
                            navigator!!.verifyNumberResponse(verifyResponse)
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
                        navigator!!.showValidationError(message)
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "") {
                            navigator!!.successOtpSend(error)
                        } else
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
    private fun prepareRequestHashMapNumberVerify(
        otp: String,
        countryCode: String,
        phoneNumber: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = countryCode.toString()
        requestParam!!["phoneNumber"] = phoneNumber.toString()
        requestParam!!["otp"] = otp.toString()
        return requestParam!!
    }


    internal fun updateNumberAPI(
        appPreferences: AppPreference,
        countryCode: String,
        number: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            UpdateNumberResponse().doNetworkRequest(prepareRequestHashMapUpdateNumber(
                countryCode,
                number
            ),
                appPreferences,
                object : NetworkResponseCallback<UpdateNumberResponse> {
                    override fun onResponse(numberResponse: UpdateNumberResponse) {
                        navigator!!.hideProgressBar()
                        if (numberResponse.isSuccess) {
//                            navigator!!.showValidationError(numberResponse.message)
                            navigator!!.successOtpSend(numberResponse.message)
                        } else {
                            if (!numberResponse.message.equals("")) {
                                onServerError(numberResponse.message)
                            } else {
                                onServerError(numberResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMapUpdateNumber(
        countryCode: String,
        number: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = countryCode
        requestParam!!["phoneNumber"] = number
        return requestParam!!
    }



    internal fun updateEmailVerifyAPI(
        appPreferences: AppPreference,
        otp: String,
        email: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            UpdateEmailVerifyResponse().doNetworkRequest(prepareRequestHashMapEmailVerify(
                otp,
                email),
                appPreferences,
                object : NetworkResponseCallback<UpdateEmailVerifyResponse> {
                    override fun onResponse(verifyResponse: UpdateEmailVerifyResponse) {
                        navigator!!.hideProgressBar()
                        if (verifyResponse.isSuccess) {
                            navigator!!.verifyEmailResponse(verifyResponse)
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
                        navigator!!.showValidationError(message)
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "") {
//                            navigator!!.showValidationError(error)
                            navigator!!.successOtpSend(error)
//                            navigator!!.getInvalidOTP()
                        } else
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
    private fun prepareRequestHashMapEmailVerify(
        otp: String,
        email: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["email"] = email
        requestParam!!["otp"] = otp
        return requestParam!!
    }

    internal fun updateEmailAPI(appPreferences: AppPreference, email : String) {
        navigator!!.showProgressBar()
        disposable.add(
            UpdateEmailResponse().doNetworkRequest(prepareRequestHashMapUpdateEmail(email),
                appPreferences,
                object : NetworkResponseCallback<UpdateEmailResponse> {
                    override fun onResponse(emailResponse: UpdateEmailResponse) {
                        navigator!!.hideProgressBar()
                        if (emailResponse.isSuccess) {
//                            navigator!!.showValidationError(emailResponse.message)
                            navigator!!.successOtpSend(emailResponse.message)
                        } else {
                            if (!emailResponse.message.equals("")) {
                                onServerError(emailResponse.message)
                            } else {
                                onServerError(emailResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMapUpdateEmail(email: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["email"] = email.toString()
        return requestParam!!
    }

    internal fun callVerifyPrimaryUserOTPAPI(
        appPreferences: AppPreference,
        otpCode: String,
        email: String,
        countryCode: String,
        phoneNumber: String,
        modelNumber: String,
        deviceId: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            VerifyPrimaryOtpResponse().doNetworkRequest(prepareRequestSecondaryHashMap(
                otpCode,
                email,
                countryCode,
                phoneNumber,
                modelNumber,
                deviceId
            ),
                appPreferences,
                object : NetworkResponseCallback<VerifyPrimaryOtpResponse> {
                    override fun onResponse(verifyResponse: VerifyPrimaryOtpResponse) {
                        navigator!!.hideProgressBar()
                        if (verifyResponse.isSuccess) {
                            navigator!!.getVerifyPrimaryOTPResponse(verifyResponse)
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
                        if (error != null && error != "") {
                            navigator!!.successOtpSend(error)
                        } else
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
    private fun prepareRequestSecondaryHashMap(
        otpCode: String,
        email: String,
        countryCode: String,
        phoneNumber: String,
        modelNumber: String,
        deviceId: String
    ): HashMap<String, Any> {
        deviceId
        modelNumber
        requestParam = HashMap()
        requestParam!!["otp"] = otpCode
        requestParam!!["phoneNumberCountryCode"] = countryCode.trim()
        requestParam!!["username"] = phoneNumber.trim()

        return requestParam!!
    }
}