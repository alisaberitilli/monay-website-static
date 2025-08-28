package com.monayuser.ui.login

import android.app.Activity
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CountryCode
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.CountryCodeResponse
import com.monayuser.data.model.response.SignInResponse
import com.monayuser.databinding.ActivityLoginBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.AppConstants
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*
import kotlin.collections.ArrayList

class LoginViewModel : BaseViewModel<LoginNavigator>() {

    var user = MutableLiveData<LoginBean>()
    var agreedTermsCondition: Boolean = true
    var selectCode: String? = null
    private var requestParam: HashMap<String, Any>? = null
    var isEmail: Boolean = false
    lateinit var activity: Activity

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun forgotPassword() {
        navigator!!.forgotPassword()
    }

    fun proceed() {
        navigator!!.proceed()
    }

    fun agreedTermsFlag() {
        navigator!!.agreedTermsFlag()
    }

    fun setTermsConditionText() {
        navigator!!.setTermsConditionText()
    }

    fun useEmail() {
        navigator!!.useEmail()
    }

    fun clickOnSignUpButton() {
        navigator!!.clickOnSignUpButton()
    }

    /**
     * This method is used to apply validation on fields.
     */
    fun checkMobilePassword(viewDataBinding: ActivityLoginBinding, code: String?): Boolean {
        val userViewModel = user.value
        selectCode = code
        isEmail = false
        if (userViewModel!!.phoneNumber.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_mobile_number))
            viewDataBinding.mobileNumberEt.requestFocus()
            return false
        }
        if (!CommonUtils.isMobileValidate(userViewModel.phoneNumber.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_correct_mobile))
            viewDataBinding.mobileNumberEt.requestFocus()
            return false
        }
        if (userViewModel.password.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_password))
            viewDataBinding.passwordEt.requestFocus()
            return false
        }
        if (!agreedTermsCondition) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_terms_conditions))
            return false
        }
        return true
    }

    /**
     * This method is used to apply validation on fields.
     */
    fun checkEmailPassword(viewDataBinding: ActivityLoginBinding, code: String?): Boolean {
        val userViewModel = user.value
        selectCode = code
        isEmail = true
        if (userViewModel!!.email.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email))
            viewDataBinding.emailEt.requestFocus()
            return false
        }
        if (!CommonUtils.isEmailValid(userViewModel.email.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email_address))
            viewDataBinding.emailEt.requestFocus()
            return false
        }
        if (userViewModel.password.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_password))
            viewDataBinding.passwordEt.requestFocus()
            return false
        }
        if (!agreedTermsCondition) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_terms_conditions))
            return false
        }
        return true
    }

    /**
     * This method is used to call login API.
     */
    internal fun loginAPI(appPreferences: AppPreference, activity: Activity) {
        navigator!!.showProgressBar()
        this.activity = activity
        disposable.add(
            SignInResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreferences,
                object : NetworkResponseCallback<SignInResponse> {
                    override fun onResponse(signIpResponse: SignInResponse) {
                        navigator!!.hideProgressBar()
                        if (signIpResponse.isSuccess) {
                            if (signIpResponse.status.equals(
                                    "unverified",
                                    true
                                )
                            ) {
                                navigator!!.openVerificationActivity(signIpResponse)
                            } else {
                                val userString = Gson().toJson(signIpResponse.data)
                                appPreferences.addValue(PreferenceKeys.USER_DATA, userString)
                                appPreferences.addBoolean(
                                    PreferenceKeys.M_PIN,
                                    signIpResponse.data!!.isMpinSet
                                )
                                appPreferences.addValue(
                                    PreferenceKeys.ACCESS_TOKEN,
                                    signIpResponse.data!!.token
                                )
                                appPreferences.addValue(
                                    PreferenceKeys.USER_TYPE,
                                    signIpResponse.data!!.userType
                                )
                                if (signIpResponse.data!!.parent!!.isEmpty())
                                {
                                    appPreferences.addBoolean(
                                        PreferenceKeys.IS_LINKED,
                                        false
                                    )
                                }else
                                {
                                    appPreferences.addBoolean(
                                        PreferenceKeys.IS_LINKED,
                                        true
                                    )
                                }

                                navigator!!.startHomeActivity(signIpResponse)
                            }
                        } else {
                            if (signIpResponse!!.status.equals(
                                    "ACCOUNT_INACTIVE",
                                    true
                                )
                            ) {
                                navigator!!.getInActiveResponse()
                            } else if (!signIpResponse.message.equals("")) {
                                onServerError(signIpResponse.message)
                            } else {
                                onServerError(signIpResponse.errorBean!!.message!!)
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
        val userViewModel = user.value
        if (isEmail) {
            requestParam!!["username"] = userViewModel!!.email.trim()
            requestParam!!["phoneCountryCode"] = selectCode.toString()
        } else {
            requestParam!!["phoneCountryCode"] = selectCode.toString()
            requestParam!!["username"] = userViewModel!!.phoneNumber.trim()
        }
        requestParam!!["password"] = userViewModel!!.password.trim()
        requestParam!!["firebaseToken"] =
            AppPreference.getInstance(activity).getValue(PreferenceKeys.DEVICE_ID).toString()
        requestParam!!["deviceType"] = AppConstants.DEVICE_TYPE_ANDROID
        return requestParam!!
    }
    /**
     * This method is used to call Country Code API.
     */
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