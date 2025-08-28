package com.monayuser.ui.paymoney

import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.utils.CommonNavigator

interface PayMoneyNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun successToSentMoney()
    fun getWalletResponse(walletResponse: WalletResponse)
    fun validationResponse(cardNumber:String,nameOnCard:String,month:String,year:String,cvv:String)
    fun payMoneyResponse(payMoneyResponse: PayMoneyResponse)
    fun getCardListResponse(getCardListResponse: GetCardListResponse)
}