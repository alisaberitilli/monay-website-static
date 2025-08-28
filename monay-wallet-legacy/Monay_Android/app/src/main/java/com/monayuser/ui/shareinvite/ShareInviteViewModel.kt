package com.monayuser.ui.shareinvite

import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback

class ShareInviteViewModel : BaseViewModel<ShareInviteNavigator>() {

    fun initView() {
        navigator!!.init()
    }
    /**
     * This method is used to apply click event on fields.
     */
    fun clickOnBackButton() {
        navigator!!.clickOnBackButton()
    }


    fun clickOnShareInviteButton() {
        navigator!!.clickOnShareInviteButton()
    }


    fun callGetProfileApi(appPreference: AppPreference) {
        navigator!!.showProgressBar()
        val map = HashMap<String, String>()
        disposable.add(

            GetUserProfileResponse().doNetworkRequest(map,
                appPreference, object : NetworkResponseCallback<GetUserProfileResponse> {
                    override fun onResponse(`object`: GetUserProfileResponse) {
                        navigator!!.hideProgressBar()
                        if (`object`.isSuccess) {
                            navigator!!.getProfileResponse(`object`)
                        } else {
                            if (!`object`.message.equals("")) {
                                onServerError(`object`.message)
                            } else {
                                onServerError(`object`.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showNetworkError(message)
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showNetworkError(error)
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
}