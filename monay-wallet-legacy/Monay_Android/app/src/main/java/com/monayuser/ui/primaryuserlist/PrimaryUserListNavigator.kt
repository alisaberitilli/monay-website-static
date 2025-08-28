package com.monayuser.ui.primaryuserlist

import com.monayuser.data.model.response.PrimaryUserListResponse
import com.monayuser.data.model.response.SecondaryUserListResponse
import com.monayuser.utils.CommonNavigator

interface PrimaryUserListNavigator : CommonNavigator {
    fun backToPreviousActivity()

    fun tryAgain()

    fun getPrimaryUserListResponse(getListResponse: PrimaryUserListResponse)

    fun showPageLoader()
    fun showHideLoader()
}