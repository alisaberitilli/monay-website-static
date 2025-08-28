package com.monayuser.data.model.bean

import com.google.gson.annotations.SerializedName

data class LoginBean(
    var createdAt: String = "",
    var email: String = "",
    var firstName: String = "",
    var id: Int = 0,
    var lastName: String = "",
    var phoneNumber: String = "",
    var phoneNumberCountryCode: String = "",
    var profilePicture: String = "",
    var profilePictureUrl: String = "",
    var status: String = "",
    var token: String = "",
    var updatedAt: String = "",
    var userType: String = "",
    var name: String = "",
    var qrCodeUrl: String = "",
    var companyName: String = "",
    var taxId: String = "",
    var registrationNumber: String = "",
    var chamberOfCommerce: String = "",
    var qrCode: String = "",
    var isMpinSet: Boolean = false,
    var resetOtp: String = "",
    var resetOtpDateTime: String = "",
    var password: String = "",
    var oldPassword: String = "",
    var confirmPassword: String = "",
    var terms: Boolean = false,
    var isVerified: Boolean = false,
    var isMobileVerified: Boolean = false,
    var isEmailVerified: Boolean = false,
    @SerializedName("UserKycs")
    var userKycs: ArrayList<UserKyc>? = null,
    var codeSpentTime: String = "",
    var isKycVerified: Boolean = false,
    var kycStatus: String = "",
    var otpSpentTime: String = "",
    var uniqueCode: String = "",
    var verificationCode: String = "",
    var accountNumber: String = "",
    var parent: ArrayList<PrimaryUser>? = null,
    var Country: UserCountry? = null,
    var autoToupStatus: Boolean = false,
    var refillWalletAmount: String? = null,
    var minimumWalletAmount: String? = null,
    var referralCode:String? = null
)

data class UserKyc(
    var addressProofImage: String = "",
    var addressProofImageUrl: String = "",
    var addressProofName: String = "",
    var idProofImage: String = "",
    var idProofImageUrl: String = "",
    var idProofBackImage: String = "",
    var idProofBackImageUrl: String = "",
    var idProofName: String = "",
    var reason: String = "",
    var addressProofBackImage: String = "",
    var addressProofBackImageUrl: String = ""
)
data class PrimaryUser(
    var parentId: Int ,
    var userId: Int ,
    var status: String = ""
)
data class UserCountry(
    var id: Int ,
    var code: String = "",
    var name: String = "",
    var countryCallingCode: String = "",
    var currencyCode: String? = null,
    var status: String = ""

)