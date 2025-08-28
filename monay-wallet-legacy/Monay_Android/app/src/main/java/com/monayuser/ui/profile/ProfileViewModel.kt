package com.monayuser.ui.profile

import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback

class ProfileViewModel : BaseViewModel<ProfileNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun openEditProfile() {
        navigator!!.openEditProfile()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    fun clickOnShareCode() {
        navigator!!.clickOnShareCode()
    }

    fun openSecuritySetup() {
        navigator!!.openSecuritySetup()
    }

    fun openMyCard() {
        navigator!!.openMyCard()
    }

    fun openWithdrawalHistory() {
        navigator!!.openWithdrawalHistory()
    }

    fun openMyBankAccounts() {
        navigator!!.openMyBankAccounts()
    }

    fun myWallet() {
        navigator!!.myWallet()
    }

    fun openPaymentRequest() {
        navigator!!.openPaymentRequest()
    }

    fun showBarCode() {
        navigator!!.showBarCode()
    }

    fun shareQRCOde() {
        navigator!!.shareQRCOde()
    }

    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
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
