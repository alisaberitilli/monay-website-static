package com.monayuser.ui.primaryuserlist

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.PrimaryUserListResponse
import com.monayuser.data.model.response.SecondaryUserListResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.HashMap

class PrimaryUserListViewModel : BaseViewModel<PrimaryUserListNavigator>(){
    private var requestParam: HashMap<String, Any>? = null
    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to call Get card List API.
     */
    internal fun callPrimaryAccountListAPI(showProgress:Boolean, appPreferences: AppPreference, offset:String, limit:String) {
        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            PrimaryUserListResponse().doNetworkRequest(prepareRequestHashMapForGetCard(offset,limit),
                appPreferences,
                object : NetworkResponseCallback<PrimaryUserListResponse> {
                    override fun onResponse(getListResponse: PrimaryUserListResponse) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (getListResponse.isSuccess) {
                            navigator!!.getPrimaryUserListResponse(getListResponse)
                        } else {
                            if (!getListResponse.message.equals("")) {
                                onServerError(getListResponse.message)
                            } else {
                                onServerError(getListResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapForGetCard(offset: String,limit: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        return requestParam!!
    }
}
