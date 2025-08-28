package com.monayuser.ui.editprofile

import com.monayuser.data.model.response.*
import com.monayuser.utils.CommonNavigator


interface EditProfileNavigator : CommonNavigator {
    /**
     * This all method is used to provide callback when clicking on fields.
     */
    fun proceed()

    fun opneGalleryCamera()

    fun updateProfileResponse(updateProfileResponse: UpdateProfileResponse)

    fun updateProfileResponseForUser(userUpdateProfileResponse: UserUpdateProfileResponse)

    fun responseUploadImage(mediaResponse: MediaResponse)

    fun verifyEmail()

    fun changeNumber()

    fun emailVerifyResponse(emailResponse: EmailVerifyResponse)

    fun verifyMobileResponse(resendOtpResponse: ResendOtpResponse)
}