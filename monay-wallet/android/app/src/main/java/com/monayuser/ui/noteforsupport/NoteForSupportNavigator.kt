package com.monayuser.ui.noteforsupport

import com.monayuser.data.model.response.SupportResponse
import com.monayuser.utils.CommonNavigator

interface NoteForSupportNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun backToPreviousActivity()
    fun proceed()
    fun getSupportResponse(supportResponse: SupportResponse)
}