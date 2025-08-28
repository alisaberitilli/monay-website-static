package com.monayuser.ui.termsconditions

import com.monayuser.data.model.response.TermsConditionsResponse
import com.monayuser.utils.CommonNavigator

interface TermsConditionsNavigator : CommonNavigator {
    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun showResponseData(termsConditionsResponse: TermsConditionsResponse)
    fun tryAgain()
}