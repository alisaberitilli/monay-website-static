package com.monayuser.ui.kyc

import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.data.model.response.KYCResponse
import com.monayuser.data.model.response.MediaResponse
import com.monayuser.utils.CommonNavigator

interface KYCNavigator : CommonNavigator {

    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun tryAgain()
    fun clickOnBackButton()
    fun clickOnSubmitButton()
    fun responseUploadImage(mediaResponse: MediaResponse)
    fun clickOnImageUpload()
    fun clickOnDocumentUpload()
    fun clickOnDeleteImage()
    fun clickOnDeleteDoc()
    fun getKYCResponse(kycResponse: KYCResponse)
    fun getProfileResponse(getUserProfileResponse: GetUserProfileResponse)
    fun clickOnIdentificationDoc()
    fun clickOnAddressProofDoc()
    fun clickForNoEvent()
}