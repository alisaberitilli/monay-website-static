package com.monayuser.ui.myrequest

import com.monayuser.data.model.response.MyRequestResponse
import com.monayuser.utils.CommonNavigator

interface MyRequestNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun tryAgain()
    fun showPageLoader()
    fun showHideLoader()
    fun getMyRequestListData(myRequestResponse: MyRequestResponse)
}