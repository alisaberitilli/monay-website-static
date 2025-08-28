package com.monayuser.data.model.bean

import java.io.Serializable

data class RecentUserListResponseBean(
    val rows: List<RecentUserData>,
    val total: Int
)

data class RecentUserData(
    var profilePictureUrl: String? = null,
    var lastName: String? = null,
    val companyName: Any? = null,
    val otpSentTime: Any? = null,
    val passwordResetToken: Any? = null,
    var phoneNumberCountryCode: String? = null,
    var firstName: String? = null,
    val profilePicture: Any? = null,
    val createdAt: String? = null,
    var phoneNumber: String? = null,
    val qrCode: String? = null,
    val taxId: Any? = null,
    val registrationNumber: Any? = null,
    val qrCodeUrl: String? = null,
    val mPin: Any? = null,
    var id: Int? = null,
    val userType: String? = null,
    val email: String? = null,
    val verificationOtp: Any? = null,
    var status: String? = null,
    val updatedAt: String? = null,
    var amount: String? = null,
    var transactionId: String? = null,
    var requestId: Int? = null,
    val blockUser: BlockUser? = null
) : Serializable {
    override fun toString(): String {
        return "${firstName} ${lastName}"
    }
}

data class BlockUser(
    var profilePictureUrl: String? = null,
    var lastName: String? = null,
    var phoneNumberCountryCode: String? = null,
    var firstName: String? = null,
    val profilePicture: Any? = null,
    val createdAt: String? = null,
    var phoneNumber: String? = null,
    var id: Int? = null,
    val email: String? = null
)