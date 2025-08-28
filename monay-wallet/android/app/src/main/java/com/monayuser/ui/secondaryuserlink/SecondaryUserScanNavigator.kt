package com.monayuser.ui.secondaryuserlink

import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.response.BasicUserProfileResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.data.model.response.ScanPrimaryUserResponse
import com.monayuser.data.model.response.SendPrimaryOtpResponse
import com.monayuser.utils.CommonNavigator

interface SecondaryUserScanNavigator : CommonNavigator {

    fun flashClick()
    fun cancelScan()
    fun tryAgain()
    fun countryCodeClick()
    fun getCountryCodeList(countryCode: ArrayList<CountryData>)
    fun onClickNext()
    fun sendPrimaryOtpResponse(otpResponse: SendPrimaryOtpResponse)
    fun primaryUserResponse(response: ScanPrimaryUserResponse)
}