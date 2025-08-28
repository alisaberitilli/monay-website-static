package com.monayuser.ui.mycontact

import com.monayuser.data.model.response.AllContactSyncResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.data.model.response.UserSearchResponse
import com.monayuser.utils.CommonNavigator

interface MyContactNavigator:CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun filterContact()
    fun filterCancel()
    fun scanClick()
    fun recentUserListResponse(recentUserListResponse: RecentUserListResponse)
    fun tryAgain()
    fun syncContact()
    fun clickOnProceedButton()
    fun showPageLoader()
    fun showHideLoader()
    fun getUserSearchResponse(userSearchResponse: UserSearchResponse)
    fun getAllContactSyncResponse(contactSyncResponse: AllContactSyncResponse)
}