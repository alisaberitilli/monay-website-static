package com.monayuser

import android.app.Application
import com.monayuser.utils.AppConstants
import com.monayuser.utils.CommonUtils


class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        AppConstants.ANDROID_DEVICE_ID = getDeviceId()
    }

    companion object {
        private var instance: MyApplication? = null

        @Synchronized
        fun getInstance(): MyApplication? {
            if (instance == null) {
                instance = MyApplication()
            }
            return instance
        }
    }

    override fun getDeviceId(): String {
        return CommonUtils.getDeviceId(applicationContext!!)!!
    }
}