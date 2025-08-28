package com.monayuser.ui.myrequest

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.MyRequestResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class MyRequestViewModel : BaseViewModel<MyRequestNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call support pending request API.
     */
    internal fun callMyRequestAPI(
        showProgress: Boolean,
        appPreferences: AppPreference,
        offset: String,
        limit: String
    ) {
        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            MyRequestResponse().doNetworkRequest(prepareRequestHashMap(offset, limit),
                appPreferences,
                object : NetworkResponseCallback<MyRequestResponse> {
                    override fun onResponse(myRequestResponse: MyRequestResponse) {
                        try {
                            navigator!!.hideProgressBar()
                            navigator!!.showHideLoader()
                            if (myRequestResponse.isSuccess) {
                                navigator!!.getMyRequestListData(myRequestResponse)
                            } else {
                                if (!myRequestResponse.message.equals("")) {
                                    onServerError(myRequestResponse.message)
                                } else {
                                    onServerError(myRequestResponse.errorBean!!.message!!)
                                }
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
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
    private fun prepareRequestHashMap(offset: String, limit: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        return requestParam!!
    }
}