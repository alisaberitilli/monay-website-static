package com.monayuser.ui.faq

import com.monayuser.data.model.response.FAQResponse
import com.monayuser.utils.CommonNavigator


interface FaqNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun showResponseData(faqResponse: FAQResponse)
    fun showPageLoader()
    fun showHideLoader()
    fun tryAgain()
}