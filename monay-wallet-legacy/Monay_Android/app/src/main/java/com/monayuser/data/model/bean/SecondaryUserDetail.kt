package com.monayuser.data.model.response

data class SecondaryUserDetail(
    val User: User,
    val createdAt: String,
    val id: Int,
    val isParentVerified: Boolean,
    val limit: Double?,
    val parentId: Int,
    val remainAmount: Double?,
    val status: String,
    val updatedAt: String,
    val userId: Int,
    val verificationOtp: Any?
)

data class User(
    val accountNumber: Any?,
    val chamberOfCommerce: Any?,
    val codeSpentTime: String,
    val companyName: Any?,
    val createdAt: String,
    val email: String,
    val firstName: String,
    val id: Int,
    val isEmailVerified: Boolean,
    val isKycVerified: Boolean,
    val isMobileVerified: Boolean,
    val isVerified: Boolean,
    val kycStatus: String,
    val lastName: String,
    val mPin: String,
    val otpSpentTime: Any?,
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
    val verificationOtp: Any?
)