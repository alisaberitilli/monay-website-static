package com.monayuser.ui.kyc.dynamic_kyc

import com.monayuser.data.model.response.GetAllKYCDocumentsResponse
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.data.model.response.KYCResponse
import com.monayuser.data.model.response.MediaResponse
import com.monayuser.utils.CommonNavigator

interface DynamicKYCNavigator : CommonNavigator {
    fun clickOnBackButton()
    fun clickOnSubmitButton()
    fun getKycResponse(response: GetAllKYCDocumentsResponse)
    fun clickOnPictureImageUpload()
    fun clickOnPictureBackImageUpload()
    fun clickOnAddressImageUpload()
    fun clickOnAddressBackImageUpload()
    fun responseUploadImage(mediaResponse: MediaResponse)
    fun clickOnDeleteImage()
    fun clickOnDeleteBackImage()
    fun clickOnDeleteAddressImage()
    fun clickOnDeleteAddressBackImage()
    fun getKYCResponse(kycResponse: KYCResponse)
    fun getProfileResponse(getUserProfileResponse: GetUserProfileResponse)
    fun clickOnIdentificationDoc()
    fun clickOnAddressProofDoc()
    fun clickOnAddressProofBackDoc()
    fun clickOnOpenDocBack()
}