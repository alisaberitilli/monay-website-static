package com.monayuser.ui.resetpassword

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.ResetPasswordResponse
import com.monayuser.databinding.ActivityResetPasswordBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class ResetPasswordViewModel : BaseViewModel<ResetPasswordNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    var passwordStr: String = ""
    var confirmPasswordStr: String = ""

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

    fun backToLogin() {
        navigator!!.backToLogin()
    }

    /**
     * This method is used to apply validation on fields.
     */
    fun passwordValidation(resetPasswordBinding: ActivityResetPasswordBinding): Boolean {
        passwordStr = resetPasswordBinding.passwordEt.text.toString()
        confirmPasswordStr = resetPasswordBinding.confirmPasswordEt.text.toString()

        if (passwordStr.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_password))
            resetPasswordBinding.passwordEt.requestFocus()
            return false
        }

        if (!CommonUtils.validatePassword(passwordStr.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_length_must_be_between_6_16))
            resetPasswordBinding.passwordEt.requestFocus()
            return false
        }
        if (confirmPasswordStr.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_confirm_password))
            resetPasswordBinding.confirmPasswordEt.requestFocus()
            return false
        }
        if (!CommonUtils.validatePassword(confirmPasswordStr.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.valid_confirm_password))
            resetPasswordBinding.confirmPasswordEt.requestFocus()
            return false
        }
        if (confirmPasswordStr != passwordStr) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_and_confirm_password_does_not_match))
            resetPasswordBinding.confirmPasswordEt.requestFocus()
            return false
        }
        return true
    }

    /**
     * This method is used to call reset password API.
     */
    internal fun resetPasswordAPI(
        appPreferences: AppPreference,
        userId: String,
        email: String,
        countryCode: String,
        phoneNumber: String,
        otp: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ResetPasswordResponse().doNetworkRequest(prepareRequestHashMap(
                userId,
                email,
                countryCode,
                phoneNumber,
                otp
            ),
                appPreferences,
                object : NetworkResponseCallback<ResetPasswordResponse> {
                    override fun onResponse(response: ResetPasswordResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.passwordChangedSuccess(response)
                        } else {
                            if (!response.message.equals("")) {
                                onServerError(response.message)
                            } else {
                                onServerError(response.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(
        userId: String,
        email: String,
        countryCode: String,
        phoneNumber: String,
        otp: String
    ): HashMap<String, Any> {
        userId
        requestParam = HashMap()
        requestParam!!["newPassword"] = passwordStr
        requestParam!!["confirmPassword"] = confirmPasswordStr
        requestParam!!["otp"] = otp

        if (email == "") {
            requestParam!!["phoneNumberCountryCode"] = countryCode
            requestParam!!["username"] = phoneNumber
        } else {
            requestParam!!["username"] = email
            requestParam!!["phoneNumberCountryCode"] = countryCode
        }
        return requestParam!!
    }
}