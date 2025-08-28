package com.monayuser.ui.mobileverification

import android.app.Activity
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.*
import com.monayuser.databinding.ActivityMobileVerifyBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.HashMap

class MobileVerificationViewModel : BaseViewModel<MobileVerificationNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    var selectCode: String? = null
    var mobileStr: String? = null
    var emailStr: String? = null
    var isEmail: Boolean = false

    fun initView() {
        navigator!!.init()
    }

    fun proceed() {
        navigator!!.proceed()
    }

    fun backToPreviousScreen() {
        navigator!!.backToPreviousScreen()
    }

    fun useEmail() {
        navigator!!.useEmail()
    }

    fun backToLogin() {
        navigator!!.backToLogin()
    }

    fun checkMobile(viewDataBinding: ActivityMobileVerifyBinding, code: String?): Boolean {
        isEmail = false
        selectCode = code
        mobileStr = viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
        if (viewDataBinding!!.mobileNumberEt.text!!.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_mobile_number))
            viewDataBinding.mobileNumberEt.requestFocus()
            return false
        }
        if (!CommonUtils.isMobileValidate(
                viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
            )
        ) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_correct_mobile))
            viewDataBinding.mobileNumberEt.requestFocus()
            return false
        }
        return true
    }

    fun checkEmail(viewActivityBinding: ActivityMobileVerifyBinding, code: String?): Boolean {
        isEmail = true
        selectCode = code
        emailStr = viewActivityBinding.verifyEmailEt.text!!.trim().toString()
        if (emailStr!!.isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_email))
            viewActivityBinding.verifyEmailEt.requestFocus()
            return false
        }
        if (!CommonUtils.isEmailValid(emailStr!!)) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email_address))
            viewActivityBinding.verifyEmailEt.requestFocus()
            return false
        }

        return true
    }

    internal fun mobileVerifyAPI(appPreferences: AppPreference, userType: String) {
        navigator!!.showProgressBar()
        disposable.add(
            SendOtpResponse().doNetworkRequest(prepareRequestHashMap(userType),
                appPreferences,
                object : NetworkResponseCallback<SendOtpResponse> {
                    override fun onResponse(otpResponse: SendOtpResponse) {
                        navigator!!.hideProgressBar()
                        if (otpResponse.isSuccess) {
                            navigator!!.sendOtpResponse(otpResponse)
                        } else {
                            if (!otpResponse.message.equals("")) {
                                onServerError(otpResponse.message)
                            } else {
                                onServerError(otpResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(userType: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = selectCode.toString()
        requestParam!!["phoneNumber"] = mobileStr.toString()
        requestParam!!["userType"] = userType
        return requestParam!!
    }


    internal fun forgotPinAPI(appPreferences: AppPreference, userType: String) {
        navigator!!.showProgressBar()
        disposable.add(
            ForgotPinResponse().doNetworkRequest(prepareRequestHashMap1(),
                appPreferences,
                object : NetworkResponseCallback<ForgotPinResponse> {
                    override fun onResponse(pinResponse: ForgotPinResponse) {
                        navigator!!.hideProgressBar()
                        if (pinResponse.isSuccess) {
                            navigator!!.forgotPinResponse(pinResponse)
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
    private fun prepareRequestHashMap1(): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = selectCode.toString()
        if (isEmail) {
            requestParam!!["username"] = emailStr.toString()
        } else {
            requestParam!!["username"] = mobileStr.toString()
        }
        return requestParam!!
    }

    internal fun updateNumberAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            UpdateNumberResponse().doNetworkRequest(prepareRequestHashMapUpdateNumber(),
                appPreferences,
                object : NetworkResponseCallback<UpdateNumberResponse> {
                    override fun onResponse(numberResponse: UpdateNumberResponse) {
                        navigator!!.hideProgressBar()
                        if (numberResponse.isSuccess) {
                            navigator!!.updateNumber(numberResponse)
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
    private fun prepareRequestHashMapUpdateNumber(): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = selectCode.toString()
        requestParam!!["phoneNumber"] = mobileStr.toString()
        return requestParam!!
    }

    internal fun updateEmailAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            UpdateEmailResponse().doNetworkRequest(prepareRequestHashMapUpdateEmail(),
                appPreferences,
                object : NetworkResponseCallback<UpdateEmailResponse> {
                    override fun onResponse(emailResponse: UpdateEmailResponse) {
                        navigator!!.hideProgressBar()
                        if (emailResponse.isSuccess) {
                            navigator!!.updateEmail(emailResponse)
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
    private fun prepareRequestHashMapUpdateEmail(): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["email"] = emailStr.toString()
        return requestParam!!
    }
    lateinit var activity: Activity
    /**
     * This method is used to call Country Code API.
     */
    internal fun countryCodeAPI(appPreferences: AppPreference,activity: Activity) {
        //navigator!!.showProgressBar()
        this.activity = activity
        disposable.add(
            CountryCodeResponse().doNetworkRequest(HashMap(), appPreferences,
                object : NetworkResponseCallback<CountryCodeResponse> {
                    override fun onResponse(countryCodeResponse: CountryCodeResponse) {
                        //navigator!!.hideProgressBar()
                        if (countryCodeResponse.isSuccess) {
                            navigator!!.getCountryCodeList(countryCodeResponse.data!!)
                        } else {
                            navigator!!.showValidationError(countryCodeResponse.message)
                        }
                    }
                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
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
}