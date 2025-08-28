package com.monayuser.ui.scan

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.BasicUserProfileResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class ScanViewModel : BaseViewModel<ScanNavigator>() {
    private var requestParam: HashMap<String, Any>? = null
    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun flashClick() {
        navigator!!.flashClick()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    fun cancelScan() {
        navigator!!.cancelScan()
    }

    fun openMyCode() {
        navigator!!.openMyCode()
    }

    fun searchEditClick() {
        navigator!!.searchEditClick()
    }

    internal fun recentUserListAPi(
        appPreferences: AppPreference,
        name: String,
        offset: String,
        limit: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            RecentUserListResponse().doNetworkRequest(prepareRequestHashMap(offset, limit, name),
                appPreferences,
                object : NetworkResponseCallback<RecentUserListResponse> {
                    override fun onResponse(response: RecentUserListResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.recentUserListResponse(response)
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
    private fun prepareRequestHashMap(
        offset: String,
        limit: String,
        name: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        requestParam!!["name"] = name
        return requestParam!!
    }

    internal fun basicUserProfile(appPreferences: AppPreference, id: String) {
        navigator!!.showProgressBar()
        disposable.add(
            BasicUserProfileResponse().doNetworkRequest(prepareRequestHashMap(id),
                appPreferences,
                object : NetworkResponseCallback<BasicUserProfileResponse> {
                    override fun onResponse(response: BasicUserProfileResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.basicUserResponse(response)
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
}