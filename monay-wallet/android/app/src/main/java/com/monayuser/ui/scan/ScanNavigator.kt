package com.monayuser.ui.scan

import com.monayuser.data.model.response.BasicUserProfileResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.utils.CommonNavigator

interface ScanNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun flashClick()
    fun cancelScan()
    fun openMyCode()
    fun searchEditClick()
    fun basicUserResponse(basicUserProfileResponse: BasicUserProfileResponse)
    fun recentUserListResponse(recentUserListResponse: RecentUserListResponse)
    fun tryAgain()
}