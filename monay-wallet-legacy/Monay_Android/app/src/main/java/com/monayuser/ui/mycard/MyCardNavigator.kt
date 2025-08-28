package com.monayuser.ui.mycard

import com.monayuser.data.model.response.AddCardResponse
import com.monayuser.data.model.response.DeleteCardResponse
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.utils.CommonNavigator


interface MyCardNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun showAddNewCardDialog()

    fun onBackPressFinish()

    fun addCardResponse(addCardResponse: AddCardResponse)

    fun getCardListResponse(getCardListResponse: GetCardListResponse)

    fun deleteCardResponse(deleteCardResponse: DeleteCardResponse, position: Int)

    fun tryAgain()
}