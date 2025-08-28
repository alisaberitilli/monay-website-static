package com.monayuser.ui.paymentrequest

import com.monayuser.ui.base.BaseViewModel

class PaymentRequestViewModel : BaseViewModel<PaymentRequestNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity(){
        navigator!!.backToPreviousActivity()
    }
}