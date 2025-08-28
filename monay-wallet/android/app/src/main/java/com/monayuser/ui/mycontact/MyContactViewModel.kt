package com.monayuser.ui.mycontact

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.AllContactSyncResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.data.model.response.UserSearchResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.ui.mycontact.model.Contact
import com.monayuser.utils.NetworkResponseCallback
import java.util.*


class MyContactViewModel : BaseViewModel<MyContactNavigator>() {

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

    fun clickOnProceedButton() {
        navigator!!.clickOnProceedButton()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    fun syncContact() {
        navigator!!.syncContact()
    }

    fun filterContact()
    {
        navigator!!.filterContact()
    }

    fun filterCancel()
    {
        navigator!!.filterCancel()
    }

    fun scanClick()
    {
        navigator!!.scanClick()
    }

    internal fun recentUserListAPi(
        appPreferences: AppPreference,
        name: String,
        offset: String,
        limit: String
    ) {
        disposable.add(
            RecentUserListResponse().doNetworkRequest(prepareRequestHashMap(offset, limit, name),
                appPreferences,
                object : NetworkResponseCallback<RecentUserListResponse> {
                    override fun onResponse(response: RecentUserListResponse) {
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

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(offset: String, limit: String, name: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        requestParam!!["name"] = name
        return requestParam!!
    }

    internal fun callUserSearchAPI(
        showProgress: Boolean,
        appPreferences: AppPreference,
        page: String,
        limit: String,
        name: String,
        phoneNumber: String
    ) {

//        if (showProgress) {
//            navigator!!.showPageLoader()
//        } else {
            navigator!!.showProgressBar()
//        }
        disposable.add(
            UserSearchResponse().doNetworkRequest(prepareRequestHashMapForUser(
                page,
                limit,
                name,
                phoneNumber
            ),
                appPreferences,
                object : NetworkResponseCallback<UserSearchResponse> {
                    override fun onResponse(userSearchResponse: UserSearchResponse) {
                        navigator!!.hideProgressBar()
//                        navigator!!.showHideLoader()
                        if (userSearchResponse.isSuccess) {
                            navigator!!.getUserSearchResponse(userSearchResponse)
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
//                        navigator!!.showHideLoader()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
//                        navigator!!.showHideLoader()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
//                        navigator!!.showHideLoader()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
//                        navigator!!.showHideLoader()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapForUser(
        page: String,
        limit: String,
        name: String,
        phoneNumber: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = page
        requestParam!!["limit"] = limit
        requestParam!!["name"] = name
        requestParam!!["phoneNumber"] = phoneNumber
        return requestParam!!
    }

    /**
     * This method is used to send parameter on server.
     */
    internal fun callAllSyncAPI(appPreferences: AppPreference, contactList: ArrayList<Contact?>) {
        navigator!!.showProgressBar()
        disposable.add(
            AllContactSyncResponse().doNetworkRequest(prepareRequestHashMapForAllSync(contactList),
                appPreferences,
                object : NetworkResponseCallback<AllContactSyncResponse> {
                    override fun onResponse(response: AllContactSyncResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.getAllContactSyncResponse(response)
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
    private fun prepareRequestHashMapForAllSync(contactList: ArrayList<Contact?>): HashMap<String, Any> {
        requestParam = HashMap()
//        Log.e(javaClass.name, "List size is >>>>>>" + contactList.size)
        requestParam!!["contacts"] = contactList
        return requestParam!!
    }
}