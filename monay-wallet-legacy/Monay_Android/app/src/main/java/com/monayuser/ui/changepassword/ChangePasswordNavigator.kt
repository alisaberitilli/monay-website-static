package com.monayuser.ui.changepassword

import com.monayuser.data.model.response.ChangePasswordResponse
import com.monayuser.utils.CommonNavigator


interface ChangePasswordNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun proceed()
    fun changePasswordResponse(changePasswordResponse: ChangePasswordResponse)
}