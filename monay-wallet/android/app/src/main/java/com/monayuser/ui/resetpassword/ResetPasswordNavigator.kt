package com.monayuser.ui.resetpassword

import com.monayuser.data.model.response.ResetPasswordResponse
import com.monayuser.utils.CommonNavigator

interface ResetPasswordNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun proceed()
    fun backToLogin()
    fun passwordChangedSuccess(response: ResetPasswordResponse)
}