package com.monayuser.ui.shareinvite

import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.utils.CommonNavigator

interface ShareInviteNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun clickOnBackButton()

    fun clickOnShareInviteButton()

    fun getProfileResponse(getUserProfileResponse: GetUserProfileResponse)
}