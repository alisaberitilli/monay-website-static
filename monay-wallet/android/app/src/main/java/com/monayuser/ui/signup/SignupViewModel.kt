package com.monayuser.ui.signup

import android.content.Context
import androidx.lifecycle.MutableLiveData
import com.google.gson.Gson
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.CheckEmailResponse
import com.monayuser.data.model.response.SignUpResponse
import com.monayuser.databinding.ActivitySignupBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.AppConstants
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback

class SignupViewModel : BaseViewModel<SignupNavigator>() {

    var user = MutableLiveData<LoginBean>()
    var agreedTermsCondition: Boolean = false
    private var requestParam: HashMap<String, Any>? = null
    private var selectCode: String? = null
    private var targetStr: String? = null
    private var mobileStr: String? = null
    lateinit var context: Context

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun callLoginPage() {
        navigator!!.login()
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

    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    /**
     * This method is used to apply validation on fields.
     */
    internal fun validateFields(
        viewDataBinding: ActivitySignupBinding,
        code: String,
        target: String
    ): Boolean {
        val userViewModel = user.value
        selectCode = code
        targetStr = target
        if (userViewModel!!.firstName.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_first_name))
            viewDataBinding.firstNameEt.requestFocus()
            return false
        }
        if (!CommonUtils!!.userNameValidate(userViewModel!!.firstName.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_name))
            viewDataBinding.firstNameEt.requestFocus()
            return false
        }
        if (userViewModel.lastName.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_last_name))
            viewDataBinding.lastNameEt.requestFocus()
            return false
        }
        if (!CommonUtils!!.userNameValidate(userViewModel!!.lastName.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_name))
               return false
        }
        if (userViewModel.email.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email))
            viewDataBinding.emailEt.requestFocus()
            return false
        }
        if (!CommonUtils.isEmailValid(userViewModel.email.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email_valid))
            viewDataBinding.emailEt.requestFocus()
            return false
        }
        if (userViewModel.password.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_password))
            viewDataBinding.passwordEt.requestFocus()
            return false
        }
        if (!CommonUtils.validatePassword(userViewModel.password.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_length_must_be_between_6_16))
            viewDataBinding.passwordEt.requestFocus()
            return false
        }
        if (userViewModel.confirmPassword.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_confirm_password))
            viewDataBinding.confirmPasswordEt.requestFocus()
            return false
        }
        if (userViewModel.confirmPassword != userViewModel.password) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_and_confirm_password_does_not_match))
            viewDataBinding.confirmPasswordEt.requestFocus()
            return false
        }
        if (targetStr.equals(AppConstants.MERCHANT_SIGNUP)) {
            if (userViewModel!!.companyName.trim().isEmpty()) {
                navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_company_name))
                viewDataBinding.companyNameEt.requestFocus()
                return false
            }
            if (userViewModel.taxId.trim().isEmpty()) {
                navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_tax_id))
                viewDataBinding.taxCribNumberEt.requestFocus()
                return false
            }

            if (userViewModel.registrationNumber.trim().isEmpty()) {
                navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_registration_number))
                viewDataBinding.registerNumberEt.requestFocus()
                return false
            }
        }

        if (!agreedTermsCondition) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_terms_conditions))
            return false
        }
        return true
    }

    /**
     * This method is used to call SignUp API.
     */
    internal fun signUpAPI(
        appPreferences: AppPreference,
        targetStr1: String,
        countyCode: String,
        phoneNumber: String,referralCode:String,
        context: Context
    ) {
        targetStr = targetStr1
        selectCode = countyCode
        mobileStr = phoneNumber
        this.context = context
        navigator!!.showProgressBar()
        disposable.add(
            SignUpResponse().doNetworkRequest(prepareRequestHashMap(referralCode),
                appPreferences,
                object : NetworkResponseCallback<SignUpResponse> {
                    override fun onResponse(signUpResponse: SignUpResponse) {
                        navigator!!.hideProgressBar()
                        if (signUpResponse.isSuccess) {
                            val userString = Gson().toJson(signUpResponse.data)
                            appPreferences.addValue(PreferenceKeys.USER_DATA, userString)
                            appPreferences.addBoolean(
                                PreferenceKeys.M_PIN,
                                signUpResponse.data!!.isMpinSet
                            )
                            appPreferences.addValue(
                                PreferenceKeys.ACCESS_TOKEN,
                                signUpResponse.data!!.token
                            )
                            appPreferences.addValue(
                                PreferenceKeys.USER_TYPE,
                                signUpResponse.data!!.userType
                            )
                            if (signUpResponse.data!!.parent!!.isEmpty())
                            {
                                appPreferences.addBoolean(
                                    PreferenceKeys.IS_LINKED,
                                    false)
                            }
                            else
                            {
                                appPreferences.addBoolean(
                                    PreferenceKeys.IS_LINKED,
                                    true)
                            }
                            navigator!!.startVerificationActivity(signUpResponse)
                        } else {
                            if (!signUpResponse.message.equals("")) {
                                onServerError(signUpResponse.message)
                            } else {
                                onServerError(signUpResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(referralCode: String): HashMap<String, Any> {
        requestParam = HashMap()
        val userViewModel = user.value
        requestParam!!["firstName"] = userViewModel!!.firstName.trim()
        requestParam!!["email"] = userViewModel!!.email.trim()
        requestParam!!["lastName"] = userViewModel!!.lastName.trim()
        requestParam!!["phoneNumberCountryCode"] = selectCode.toString()
        requestParam!!["phoneNumber"] = mobileStr.toString()
        requestParam!!["password"] = userViewModel!!.password.trim()
        requestParam!!["confirmPassword"] = userViewModel!!.confirmPassword.trim()
        requestParam!!["deviceType"] = AppConstants.DEVICE_TYPE_ANDROID
        requestParam!!["firebaseToken"] =
            AppPreference.getInstance(context).getValue(PreferenceKeys.DEVICE_ID).toString()
        if (targetStr.equals(AppConstants.MERCHANT_SIGNUP)) {
            requestParam!!["userType"] = "merchant"
            requestParam!!["companyName"] = userViewModel!!.companyName.trim()
            requestParam!!["taxId"] = userViewModel!!.taxId.trim()
            requestParam!!["chamberOfCommerce"] = userViewModel!!.registrationNumber.trim()
        } else  if (targetStr.equals(AppConstants.SECONDARY_SIGNUP)) {
            requestParam!!["userType"] = "secondaryUser"
            if(referralCode.isNotEmpty()){
             requestParam!!["referralCode"]  = referralCode
            }
        }else {
            requestParam!!["userType"] = "user"
        }
        return requestParam!!
    }

    /**
     * This method is used to check email API.
     */
    internal fun checkEmailAPI(appPreferences: AppPreference) {
        disposable.add(
            CheckEmailResponse().doNetworkRequest(prepareRequestHashMapForEmail(),
                appPreferences,
                object : NetworkResponseCallback<CheckEmailResponse> {
                    override fun onResponse(checkEmailResponse: CheckEmailResponse) {
                        navigator!!.hideProgressBar()
                        if (checkEmailResponse.isSuccess) {
                            navigator!!.emailCheckResponse(true, checkEmailResponse.message)
                        } else {
                            navigator!!.emailCheckResponse(false, checkEmailResponse.message)
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

    private fun prepareRequestHashMapForEmail(): HashMap<String, Any> {
        requestParam = HashMap()
        val userViewModel = user.value
        requestParam!!["email"] = userViewModel!!.email.trim()
        return requestParam!!
    }
}