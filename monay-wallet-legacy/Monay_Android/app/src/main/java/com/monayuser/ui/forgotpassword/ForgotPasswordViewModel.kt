package com.monayuser.ui.forgotpassword

import android.app.Activity
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.CountryCodeResponse
import com.monayuser.data.model.response.ForgotPasswordResponse
import com.monayuser.databinding.ActivityForgotBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class ForgotPasswordViewModel : BaseViewModel<ForgotPasswordNavigator>() {
    var selectCode: String? = ""
    var isEmail: Boolean = false
    private var requestParam: HashMap<String, Any>? = null
    lateinit var viewActivityBinding: ActivityForgotBinding
    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun proceed() {
        navigator!!.proceed()
    }

    fun useEmail() {
        navigator!!.useEmail()
    }

    /**
     * This method is used to apply mobile validation on fields.
     */
    fun checkMobile(viewActivityBinding: ActivityForgotBinding, code: String): Boolean {
        selectCode = code
        isEmail = false
        this.viewActivityBinding = viewActivityBinding
        var mobileStr = viewActivityBinding.mobileNumberEt.text!!.trim().toString()
        if (mobileStr.isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.registered_mobile_number))
            viewActivityBinding.mobileNumberEt.requestFocus()
            return false
        }
        if (!CommonUtils.isMobileValidate(mobileStr)) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_correct_mobile))
            viewActivityBinding.mobileNumberEt.requestFocus()
            return false
        }
        return true
    }

    /**
     * This method is used to apply email validation on fields.
     */
    fun checkEmail(viewActivityBinding: ActivityForgotBinding,code: String): Boolean {
        isEmail = true
        selectCode = code
        this.viewActivityBinding = viewActivityBinding
        var emailStr = viewActivityBinding.emailEt.text!!.trim().toString()
        if (emailStr.isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.registered_email_address))
            viewActivityBinding.emailEt.requestFocus()
            return false
        }
        if (!CommonUtils.isEmailValid(emailStr)) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email_address))
            viewActivityBinding.emailEt.requestFocus()
            return false
        }
        return true
    }

    /**
     * This method is used to call Forgot Password API.
     */
    internal fun forgotPassAPI(
        appPreferences: AppPreference
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ForgotPasswordResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreferences,
                object : NetworkResponseCallback<ForgotPasswordResponse> {
                    override fun onResponse(forgotPasswordResponse: ForgotPasswordResponse) {
                        navigator!!.hideProgressBar()
                        if (forgotPasswordResponse.isSuccess) {
                            navigator!!.verifyCodeScreen(forgotPasswordResponse)
                        } else {
                            if (!forgotPasswordResponse.message.equals("")) {
                                onServerError(forgotPasswordResponse.message)
                            } else {
                                onServerError(forgotPasswordResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(): HashMap<String, Any> {
        requestParam = HashMap()
        if (isEmail) {
            requestParam!!["username"] = viewActivityBinding.emailEt.text!!.trim().toString()
        } else {
            requestParam!!["username"] = viewActivityBinding.mobileNumberEt.text!!.trim().toString()
        }
        requestParam!!["phoneNumberCountryCode"] = selectCode.toString()

        return requestParam!!
    }

    lateinit var activity: Activity
    internal fun countryCodeAPI(appPreferences: AppPreference,activity: Activity) {
        this.activity = activity
        disposable.add(
            CountryCodeResponse().doNetworkRequest(HashMap(), appPreferences,
                object : NetworkResponseCallback<CountryCodeResponse> {
                    override fun onResponse(countryCodeResponse: CountryCodeResponse) {
                        if (countryCodeResponse.isSuccess) {
                            navigator!!.getCountryCodeList(countryCodeResponse.data!!)
                        } else {
                            navigator!!.showValidationError(countryCodeResponse.message)
                        }
                    }
                    override fun onFailure(message: String) {
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }
                    override fun onServerError(error: String) {
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }
                    override fun onSessionExpire(error: String) {
                        navigator!!.showSessionExpireAlert()
                    }
                    override fun onUpdateAppVersion(message: String) {

                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }
}