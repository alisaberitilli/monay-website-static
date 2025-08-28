package com.monayuser.ui.splash

import com.google.gson.Gson
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.response.SettingResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.AppConstants
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class SplashViewModel : BaseViewModel<SplashNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    /**
     * This method is used to provide callback for initialization.
     */
    fun initView() {
        navigator!!.init()
    }

    internal fun callSettingAPI(appPreferences: AppPreference) {
        disposable.add(
            SettingResponse().doNetworkRequest(prepareRequestHashMapForGetCard(),
                appPreferences,
                object : NetworkResponseCallback<SettingResponse> {
                    override fun onResponse(settingResponse: SettingResponse) {
                        if (settingResponse.isSuccess) {
                            val settingString = Gson().toJson(settingResponse.data)
                            appPreferences.addValue(PreferenceKeys.SETTING_DATA, settingString)

                            navigator!!.getSettingData(settingResponse)
                        } else {
                            if (!settingResponse.message.equals("")) {
                                onServerError(settingResponse.message)
                            } else {
                                onServerError(settingResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMapForGetCard(): HashMap<String, Any> {
        requestParam = HashMap()
        return requestParam!!
    }
}