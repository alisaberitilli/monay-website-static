package com.monayuser.ui.splash

import com.monayuser.data.model.response.SettingResponse
import com.monayuser.utils.CommonNavigator


interface SplashNavigator : CommonNavigator {

    fun getSettingData(settingResponse: SettingResponse)
}