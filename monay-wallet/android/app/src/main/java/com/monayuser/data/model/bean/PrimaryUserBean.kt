package com.monayuser.data.model.bean

import java.io.Serializable

data class PrimaryUserBean(
    val `rows`: List<PrimaryAccountUser>,
    val count: Int

)
data class PrimaryAccountUser(
    val id: Int,
    val userId: Int,
    val parentId: Int,
    val verificationOtp: String?,
    val isParentVerified: Boolean?,
    val limit: String?,
    val remainAmount: Double,
    val updatedAt: String?,
    val status: String,
    val createdAt: String?,
    val parent : PrimaryUserData

): Serializable

data class PrimaryUserData(
    val accountNumber: Any?,
    val chamberOfCommerce: Any?,
    val codeSpentTime: String,
    val companyName: Any?,
    val createdAt: String,
    val email: String,
    val firstName: String?=null,
    val id: Int,
    val isEmailVerified: Boolean,
    val isKycVerified: Boolean,
    val isMobileVerified: Boolean,
    val isVerified: Boolean,
    val kycStatus: String,
    val lastName: String?=null,
    val mPin: String,
    val otpSpentTime: Any?,
    val passwordResetToken: Any?,
    val phoneNumber: String,
    val phoneNumberCountryCode: String,
    val profilePicture: Any?,
    val profilePictureUrl: String,
    val qrCode: String,
    val qrCodeUrl: String,
    val referralCode: Any?,
    val roleId: Any?,
    val status: String,
    val taxId: Any?,
    val uniqueCode: String,
    val updatedAt: String,
    val userType: String,
    val verificationCode: String,
    val verificationOtp: Any?,
    val refileWalletAmount: Double,
    val minimumWalletAmount: Double
)
