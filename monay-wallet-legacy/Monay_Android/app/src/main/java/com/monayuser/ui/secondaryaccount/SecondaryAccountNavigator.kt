package com.monayuser.ui.secondaryaccount

import com.monayuser.data.model.response.*
import com.monayuser.utils.CommonNavigator

interface SecondaryAccountNavigator : CommonNavigator {

    fun backToPreviousActivity()

    fun tryAgain()

    fun getSecondaryAccountListResponse(getListResponse: SecondaryUserListResponse)

    fun showPageLoader()
    fun showHideLoader()
}