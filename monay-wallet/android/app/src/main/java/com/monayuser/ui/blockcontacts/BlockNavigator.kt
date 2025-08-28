package com.monayuser.ui.blockcontacts

import com.monayuser.data.model.response.BlockListResponse
import com.monayuser.data.model.response.BlockUnBlockResponse
import com.monayuser.data.model.response.UserSearchResponse
import com.monayuser.utils.CommonNavigator

interface BlockNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun clickOnBlockContacts()

    fun clickOnBackButton()

    fun getBlockedUserList(blockListResponse: BlockListResponse)

    fun getUnBlockedUserList(userSearchResponse: UserSearchResponse)

    fun getBlockAndUnBlockResponse(blockUnBlockResponse: BlockUnBlockResponse, position: Int)

    fun tryAgain()

    fun showPageLoader()

    fun showHideLoader()

    fun filterCancel()
}