package com.monayuser.ui.forgotmpin

import com.monayuser.data.model.response.AddMoneyResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.RequestWithdrawalResponse
import com.monayuser.data.model.response.SendPaymentRequestResponse
import com.monayuser.utils.CommonNavigator

interface ForgotMPinNavigator : CommonNavigator {

    fun backToPreviousScreen()
    fun confirmPin()
    fun forgotPin()
    fun payMoneyResponse(payMoneyResponse: PayMoneyResponse)
    fun sendPaymentRequestResponse(sendPaymentRequestResponse: SendPaymentRequestResponse)
    fun addMoneyResponse(addMoneyResponse: AddMoneyResponse)
    fun getWithdrawalMoneyResponse(requestWithdrawalResponse: RequestWithdrawalResponse)
    fun getKYCStatusResponse(message: String)
    fun getInvalidPin()
}