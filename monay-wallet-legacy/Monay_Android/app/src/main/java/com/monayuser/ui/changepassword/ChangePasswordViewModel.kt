package com.monayuser.ui.changepassword

import androidx.lifecycle.MutableLiveData
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.ChangePasswordResponse
import com.monayuser.databinding.ActivityChangePasswordBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class ChangePasswordViewModel : BaseViewModel<ChangePasswordNavigator>() {

    var user = MutableLiveData<LoginBean>()
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

    fun proceed() {
        navigator!!.proceed()
    }

    /**
     * This method is used to apply validation on fields.
     */
    internal fun validateFields(viewDataBinding: ActivityChangePasswordBinding): Boolean {
        val userViewModel = user.value

        if (userViewModel!!.oldPassword.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.old_validation_password))
            viewDataBinding.oldPasswordEt.requestFocus()
            return false
        }

        if (userViewModel.oldPassword.trim().length < 6) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_length_must_be_between_6_16))
            viewDataBinding.oldPasswordEt.requestFocus()
            return false
        }

        if (userViewModel.password.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_password_new))
            viewDataBinding.newPasswordEt.requestFocus()
            return false
        }

        if (!CommonUtils.validatePassword(userViewModel.password.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_length_must_be_between_6_16))
            viewDataBinding.newPasswordEt.requestFocus()
            return false
        }

        if (userViewModel.oldPassword.trim() == userViewModel.password.trim()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_and_current_password_match))
            viewDataBinding.confirmPasswordEt.requestFocus()
            return false
        }

        if (userViewModel.confirmPassword.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_confirm_password))
            viewDataBinding.confirmPasswordEt.requestFocus()
            return false
        }

        if (userViewModel.confirmPassword.trim().length < 6) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_length_must_be_between_6_16))
            viewDataBinding.confirmPasswordEt.requestFocus()
            return false
        }

        if (!CommonUtils.validatePassword(userViewModel.confirmPassword.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.valid_confirm_password))
            viewDataBinding.confirmPasswordEt.requestFocus()
            return false
        }

        if (userViewModel.confirmPassword.trim() != userViewModel.password.trim()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.password_and_confirm_password_does_not_match))
            viewDataBinding.confirmPasswordEt.requestFocus()
            return false
        }

        return true
    }

    /**
     * This method is used to call ChangePassword API.
     */
    internal fun callChangePasswordAPi(
        appPreferences: AppPreference
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ChangePasswordResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreferences,
                object : NetworkResponseCallback<ChangePasswordResponse> {
                    override fun onResponse(changePasswordResponse: ChangePasswordResponse) {
                        navigator!!.hideProgressBar()
                        if (changePasswordResponse.isSuccess) {
                            navigator!!.changePasswordResponse(changePasswordResponse)
                        } else {
                            if (!changePasswordResponse.message.equals("")) {
                                onServerError(changePasswordResponse.message)
                            } else {
                                onServerError(changePasswordResponse.errorBean!!.message!!)
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

        requestParam!!["currentPassword"] = userViewModel!!.oldPassword.trim()
        requestParam!!["newPassword"] = userViewModel!!.password.trim()
        requestParam!!["confirmNewPassword"] = userViewModel!!.confirmPassword.trim()
        return requestParam!!
    }
}