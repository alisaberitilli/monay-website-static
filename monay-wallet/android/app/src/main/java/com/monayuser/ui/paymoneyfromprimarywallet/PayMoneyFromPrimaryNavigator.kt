package com.monayuser.ui.paymoneyfromprimarywallet

import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.PrimaryUserListResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.utils.CommonNavigator

interface PayMoneyFromPrimaryNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun successToSentMoney()
    fun getPrimaryUserListResponse(getListResponse: PrimaryUserListResponse)
    fun tryAgain()
    fun showPageLoader()
    fun showHideLoader()

}