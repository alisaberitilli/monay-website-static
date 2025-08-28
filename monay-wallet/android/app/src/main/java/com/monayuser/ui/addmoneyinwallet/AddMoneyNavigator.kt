package com.monayuser.ui.addmoneyinwallet

import com.monayuser.data.model.response.AddCardResponse
import com.monayuser.data.model.response.AddMoneyResponse
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.utils.CommonNavigator


interface AddMoneyNavigator : CommonNavigator {
    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun proceedToAddMoney()
    fun getCardListResponse(getCardListResponse: GetCardListResponse)
    fun addMoneyResponse(addMoneyResponse: AddMoneyResponse)
    fun addCardResponse(addCardResponse: AddCardResponse)
    fun showAddNewCardDialog()
    fun tryAgain()
}