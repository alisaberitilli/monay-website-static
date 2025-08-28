package com.monayuser.ui.secondaryuserdetail

import com.monayuser.data.model.response.DeleteSecondaryUserResponse
import com.monayuser.data.model.response.SecondaryUserActiveInactiveResponse
import com.monayuser.data.model.response.SecondaryUserDetailResponse
import com.monayuser.data.model.response.SetLimitAmountResponse
import com.monayuser.utils.CommonNavigator


interface SecondaryUserDetailNavigator : CommonNavigator {
    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()


    fun setRange()

    fun secondaryUserDetailResponse(response: SecondaryUserDetailResponse)

    fun secondaryUserActiveInactiveResponse(response: SecondaryUserActiveInactiveResponse)

    fun removeSecondaryAccountResponse(response: DeleteSecondaryUserResponse)

    fun removeSecondaryAccount()
    fun setSecondaryAccountLimitResponse(response: SetLimitAmountResponse)
}