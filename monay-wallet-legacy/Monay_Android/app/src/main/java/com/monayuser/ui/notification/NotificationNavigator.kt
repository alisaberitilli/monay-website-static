package com.monayuser.ui.notification

import com.monayuser.data.model.response.NotificationListResponse
import com.monayuser.utils.CommonNavigator

interface NotificationNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun showBottomProgress()
    fun hideBottomProgress()
    fun showPageLoader()
    fun showHideLoader()
    fun getNotificationListResponse(notificationListResponse: NotificationListResponse)
    fun tryAgain()
    fun backToPreviousActivity()
}