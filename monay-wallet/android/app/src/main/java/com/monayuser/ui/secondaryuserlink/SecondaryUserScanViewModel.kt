package com.monayuser.ui.secondaryuserlink

import android.app.Activity
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.*
import com.monayuser.databinding.ActivityLoginBinding
import com.monayuser.databinding.SecondaryUserScanBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.HashMap

class SecondaryUserScanViewModel : BaseViewModel<SecondaryUserScanNavigator>() {
    private var requestParam: HashMap<String, Any>? = null

    var selectCode=""
    var mobileStr=""
    fun initView() {
        navigator!!.init()
    }
    internal fun countryCodeAPI(appPreferences: AppPreference) {

        disposable.add(
            CountryCodeResponse().doNetworkRequest(
                HashMap(), appPreferences,
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


    internal fun primaryUserScan(appPreferences: AppPreference, id: String) {
        navigator!!.showProgressBar()
        disposable.add(
            ScanPrimaryUserResponse().doNetworkRequest(prepareRequestHashMap(id),
                appPreferences,
                object : NetworkResponseCallback<ScanPrimaryUserResponse> {
                    override fun onResponse(response: ScanPrimaryUserResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.primaryUserResponse(response)
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
    private fun prepareRequestHashMap(id: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["userId"] = id
        return requestParam!!
    }

    fun checkMobilePassword(viewDataBinding: SecondaryUserScanBinding, code: String): Boolean {
        selectCode = code
        mobileStr=viewDataBinding!!.etPrimaryUserMobile.text.toString().trim()
        if (viewDataBinding!!.etPrimaryUserMobile.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_mobile_number))
            viewDataBinding.etPrimaryUserMobile.requestFocus()
            return false
        }
        if (!CommonUtils.isMobileValidate(viewDataBinding!!.etPrimaryUserMobile.text.toString().trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_correct_mobile))
            viewDataBinding.etPrimaryUserMobile.requestFocus()
            return false
        }
        return true
    }
    internal fun mobileVerifyAPI(appPreferences: AppPreference, userType: String) {
        navigator!!.showProgressBar()
        disposable.add(
            SendPrimaryOtpResponse().doNetworkRequest(prepareRequestMobileHashMap(userType),
                appPreferences,
                object : NetworkResponseCallback<SendPrimaryOtpResponse> {
                    override fun onResponse(otpResponse: SendPrimaryOtpResponse) {
                        navigator!!.hideProgressBar()
                        if (otpResponse.isSuccess) {
                            navigator!!.sendPrimaryOtpResponse(otpResponse)
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
    private fun prepareRequestMobileHashMap(userType: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = selectCode
        requestParam!!["phoneNumber"] = mobileStr
        requestParam!!["userType"] = userType
        return requestParam!!
    }
}