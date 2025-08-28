package com.monayuser.ui.more

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.LogoutResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback

class MoreViewModel : BaseViewModel<MoreNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun logout() {
        navigator!!.logout()
    }

    fun clickOnMyWallet() {
        navigator!!.myWallet()
    }

    fun clickOnPaymentRequests() {
        navigator!!.paymentRequests()
    }

    fun clickOnWithdrawMoney() {
        navigator!!.withdrawMoney()
    }

    fun clickOnWithdrawalRequestHistory() {
        navigator!!.withdrawalRequestHistory()
    }

    fun clickOnMyCards() {
        navigator!!.myCards()
    }

    fun clickOnShareInvites() {
        navigator!!.clickOnShareInvites()
    }

    fun clickOnSecondaryUser() {
        navigator!!.clickOnSecondaryUser()
    }

    fun clickOnPrimaryUser() {
        navigator!!.clickOnPrimaryUser()
    }


    fun clickOnAutoTopUp() {
        navigator!!.clickOnAutoTopUp()
    }

    fun clickOnMyBankAccounts() {
        navigator!!.myBankAccounts()
    }

    fun clickOnSettingsSupports() {
        navigator!!.settingsSupports()
    }

    fun clickOnBlockContacts() {
        navigator!!.blockContacts()
    }

    fun clickOnKYC() {
        navigator!!.kyc()
    }

    /**
     * This method is used to call Logout API.
     */
    internal fun callLogoutAPI(
        appPreferences: AppPreference
    ) {
        val map = HashMap<String, Any>()
        navigator!!.showProgressBar()
        disposable.add(
            LogoutResponse().doNetworkRequest(map,
                appPreferences,
                object : NetworkResponseCallback<LogoutResponse> {
                    override fun onResponse(logoutResponse: LogoutResponse) {
                        navigator!!.hideProgressBar()
                        if (logoutResponse.isSuccess) {
                            navigator!!.logoutResponse(logoutResponse)
                        } else {
                            if (!logoutResponse.message.equals("")) {
                                onServerError(logoutResponse.message)
                            } else {
                                onServerError(logoutResponse.errorBean!!.message!!)
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
}