package com.monayuser.ui.setpin

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.ChangePinResponse
import com.monayuser.data.model.response.MPinResponse
import com.monayuser.data.model.response.ResetPinResponse
import com.monayuser.databinding.ActivityMpinLayoutBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class MPinViewModel : BaseViewModel<MPinNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    var oldPinStr: String? = ""
    var pinStr: String? = ""
    var confirmPinStr: String? = ""

    fun initView() {
        navigator!!.init()
    }

    fun setPin() {
        navigator!!.setPin()
    }

    fun backToPreviousScreen() {
        navigator!!.backToPreviousScreen()
    }

    fun backToSecurity() {
        navigator!!.backToSecurity()
    }

    fun pinValidation(viewBinding: ActivityMpinLayoutBinding): Boolean {
        pinStr = viewBinding.pinview.value.trim().toString()
        confirmPinStr = viewBinding.confirmPinview.value.trim().toString()
        if (pinStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_pin))
            return false
        }
        if (pinStr.toString().trim().length < 4) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_lengthtxt))
            return false
        }
        if (confirmPinStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_confirm_pin))
            return false
        }
        if (confirmPinStr != pinStr) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_not_matched))
            navigator!!.getWrongPinResponse()
            return false
        }
        return true
    }

    fun pinValidationNew(viewBinding: ActivityMpinLayoutBinding): Boolean {
        pinStr = viewBinding.pinview.value.trim().toString()
        confirmPinStr = viewBinding.confirmPinview.value.trim().toString()
        if (pinStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_pin_new))
            return false
        }
        if (pinStr.toString().trim().length < 4) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_lengthtxt))
            return false
        }
        if (confirmPinStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_confirm_pin_new))
            return false
        }
        if (confirmPinStr != pinStr) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_not_matched_new))
            navigator!!.getWrongPinResponse()
            return false
        }
        return true
    }

    fun oldPinValidation(viewBinding: ActivityMpinLayoutBinding): Boolean {
        oldPinStr = viewBinding.oldPinview.value.trim().toString()
        pinStr = viewBinding.pinview.value.trim().toString()
        confirmPinStr = viewBinding.confirmPinview.value.trim().toString()
        if (oldPinStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_old_pin))
            return false
        }
        if (oldPinStr.toString().trim().length < 4) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_lengthtxt))
            return false
        }
        if (pinStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_pin))
            return false
        }
        if (pinStr.toString().trim().length < 4) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_lengthtxt))
            return false
        }
        if (confirmPinStr == "") {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_confirm_pin))
            return false
        }
        if (confirmPinStr != pinStr) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.pin_not_matched))
            navigator!!.getWrongChangePinResponse()
            return false
        }
        return true
    }

    internal fun setMPinAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            MPinResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreferences,
                object : NetworkResponseCallback<MPinResponse> {
                    override fun onResponse(pinResponse: MPinResponse) {
                        navigator!!.hideProgressBar()
                        if (pinResponse.isSuccess) {
                            navigator!!.mPinResponse(pinResponse)
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
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.getWrongPinResponse()
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
        requestParam!!["mpin"] = confirmPinStr.toString()
        return requestParam!!
    }

    internal fun resetMPinAPI(
        appPreferences: AppPreference,
        otp: String,
        countryCode: String,
        phoneNumber: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ResetPinResponse().doNetworkRequest(prepareRequestHashMap1(
                otp,
                countryCode,
                phoneNumber
            ),
                appPreferences,
                object : NetworkResponseCallback<ResetPinResponse> {
                    override fun onResponse(pinResponse: ResetPinResponse) {
                        navigator!!.hideProgressBar()
                        if (pinResponse.isSuccess) {
                            navigator!!.resetPinResponse(pinResponse)
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
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.getWrongPinResponse()
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
        otp: String,
        countryCode: String,
        phoneNumber: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["phoneNumberCountryCode"] = countryCode
        requestParam!!["username"] = phoneNumber
        requestParam!!["otp"] = otp
        requestParam!!["mpin"] = pinStr.toString()
        requestParam!!["confirmMpin"] = confirmPinStr.toString()
        return requestParam!!
    }

    internal fun changeMPinAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            ChangePinResponse().doNetworkRequest(prepareRequestHashMapChangePin(),
                appPreferences,
                object : NetworkResponseCallback<ChangePinResponse> {
                    override fun onResponse(pinResponse: ChangePinResponse) {
                        navigator!!.hideProgressBar()
                        if (pinResponse.isSuccess) {
                            navigator!!.changePinResponse(pinResponse)
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
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.getWrongPinResponse()
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
    private fun prepareRequestHashMapChangePin(): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["currentMpin"] = oldPinStr.toString()
        requestParam!!["mpin"] = pinStr.toString()
        requestParam!!["confirmMpin"] = confirmPinStr.toString()
        return requestParam!!
    }
}