package com.monayuser.ui.blockcontacts

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.BlockListResponse
import com.monayuser.data.model.response.BlockUnBlockResponse
import com.monayuser.data.model.response.UserSearchResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class BlockViewModel : BaseViewModel<BlockNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    fun clickOnBackButton() {
        navigator!!.clickOnBackButton()
    }

    fun clickOnBlockContacts() {
        navigator!!.clickOnBlockContacts()
    }

    fun filterCancel() {
        navigator!!.filterCancel()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call blocked list API.
     */
    internal fun callBlockedist(
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
            BlockListResponse().doNetworkRequest(prepareRequestHashMap(offset, limit),
                appPreferences,
                object : NetworkResponseCallback<BlockListResponse> {
                    override fun onResponse(blockListResponse: BlockListResponse) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (blockListResponse.isSuccess) {
                            navigator!!.getBlockedUserList(blockListResponse)
                        } else {
                            if (!blockListResponse.message.equals("")) {
                                onServerError(blockListResponse.message)
                            } else {
                                onServerError(blockListResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(offset: String, limit: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        return requestParam!!
    }

    /**
     * This method is used to call blocked list API.
     */
    internal fun callUnBlockedist(
        showProgress: Boolean,
        appPreferences: AppPreference,
        name: String,
        offset: String,
        limit: String
    ) {

        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            UserSearchResponse().doNetworkRequest(prepareRequestHashMap(offset, limit, name),
                appPreferences,
                object : NetworkResponseCallback<UserSearchResponse> {
                    override fun onResponse(userSearchResponse: UserSearchResponse) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (userSearchResponse.isSuccess) {
                            navigator!!.getUnBlockedUserList(userSearchResponse)
                        } else {
                            if (!userSearchResponse.message.equals("")) {
                                onServerError(userSearchResponse.message)
                            } else {
                                onServerError(userSearchResponse.errorBean!!.message!!)
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

    /**
     * This method is used to call block and unblock API.
     */
    internal fun callBlockAndUnBlockAPI(
        appPreferences: AppPreference,
        blockUserId: String,
        position: Int
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            BlockUnBlockResponse().doNetworkRequest(prepareRequestHashMap(blockUserId),
                appPreferences,
                object : NetworkResponseCallback<BlockUnBlockResponse> {
                    override fun onResponse(blockUnBlockResponse: BlockUnBlockResponse) {
                        navigator!!.hideProgressBar()
                        if (blockUnBlockResponse.isSuccess) {
                            navigator!!.getBlockAndUnBlockResponse(blockUnBlockResponse, position)
                        } else {
                            if (!blockUnBlockResponse.message.equals("")) {
                                onServerError(blockUnBlockResponse.message)
                            } else {
                                onServerError(blockUnBlockResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(blockUserId: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["blockUserId"] = blockUserId
        return requestParam!!
    }
}