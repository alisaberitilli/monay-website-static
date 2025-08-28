package com.monayuser.ui.notification

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.NotificationListResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class NotificationViewModel : BaseViewModel<NotificationNavigator>() {

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

    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    /**
     * This method is used to call notification API.
     */
    internal fun notificationAPI(
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
            NotificationListResponse().doNetworkRequest(prepareRequestHashMap(offset, limit),
                appPreferences,
                object : NetworkResponseCallback<NotificationListResponse> {
                    override fun onResponse(notificationListResponse: NotificationListResponse) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (notificationListResponse.isSuccess) {
                            navigator!!.getNotificationListResponse(notificationListResponse)
                        } else {
                            if (!notificationListResponse.message.equals("")) {
                                onServerError(notificationListResponse.message)
                            } else {
                                onServerError(notificationListResponse.errorBean!!.message!!)
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
                        else {
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                        }
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