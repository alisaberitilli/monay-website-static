package com.monayuser.ui.secondaryuserdetail

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.*
import com.monayuser.databinding.ActivityLoginBinding
import com.monayuser.databinding.ActivitySecondaryUserDetailBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.HashMap

class SecondaryUserDetailViewModel : BaseViewModel<SecondaryUserDetailNavigator>() {
    private var requestParam: HashMap<String, Any>? = null
    fun initView() {
        navigator!!.init()
    }

    fun setRange(){
        navigator!!.setRange()
    }

    var limitAmount=""
    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }


    internal fun secondaryUserDetailApi(appPreferences: AppPreference, id: String) {
        navigator!!.showProgressBar()
        disposable.add(
            SecondaryUserDetailResponse().doNetworkRequest(prepareRequestHashMap(id),
                appPreferences,
                object : NetworkResponseCallback<SecondaryUserDetailResponse> {
                    override fun onResponse(response: SecondaryUserDetailResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.secondaryUserDetailResponse(response)
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


    internal fun setSecondaryUserActiveInactiveApi(appPreferences: AppPreference, id: String, status :String) {
        navigator!!.showProgressBar()
        disposable.add(
            SecondaryUserActiveInactiveResponse().doNetworkRequest(prepareRequestHashMapActiveInactive(id,status),
                appPreferences,
                object : NetworkResponseCallback<SecondaryUserActiveInactiveResponse> {
                    override fun onResponse(response: SecondaryUserActiveInactiveResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.secondaryUserActiveInactiveResponse(response)
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


    internal fun removeSecondaryAccountAPI(appPreferences: AppPreference, id: String) {
        navigator!!.showProgressBar()
        disposable.add(
            DeleteSecondaryUserResponse().doNetworkRequest(prepareRequestHashMapDeleteUser(id),
                appPreferences,
                object : NetworkResponseCallback<DeleteSecondaryUserResponse> {
                    override fun onResponse(response: DeleteSecondaryUserResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.removeSecondaryAccountResponse(response)
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


    internal fun setSecondaryAccountLimitAPI(appPreferences: AppPreference, id: String) {
        navigator!!.showProgressBar()
        disposable.add(
            SetLimitAmountResponse().doNetworkRequest(prepareRequestHashMapLimitUser(id),
                appPreferences,
                object : NetworkResponseCallback<SetLimitAmountResponse> {
                    override fun onResponse(response: SetLimitAmountResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.setSecondaryAccountLimitResponse(response)
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

    fun checkLimitAmountValidation(viewDataBinding: ActivitySecondaryUserDetailBinding): Boolean {
        limitAmount = viewDataBinding.etLimitAmount.text!!.trim().toString()
        if (viewDataBinding.etLimitAmount.text!!.trim().toString().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_amount))
            viewDataBinding.etLimitAmount.requestFocus()
            return false
        }
        if (!CommonUtils.isValidNumeric(viewDataBinding.etLimitAmount.text!!.trim().toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_amount_))
            viewDataBinding.etLimitAmount.requestFocus()
            return false
        }
        return true
    }

    fun removeSecondaryAccount(){
        navigator!!.removeSecondaryAccount()
    }
    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(id: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["userId"] = id
        return requestParam!!
    }
    private fun prepareRequestHashMapDeleteUser(id: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["id"] = id
        return requestParam!!
    }

    private fun prepareRequestHashMapActiveInactive(id: String,status: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["userId"] = id
        requestParam!!["status"] = status
        return requestParam!!
    }

    private fun prepareRequestHashMapLimitUser(id: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["userId"] = id
        requestParam!!["limit"] = limitAmount.toInt()
        return requestParam!!
    }
}