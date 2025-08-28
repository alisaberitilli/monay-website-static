package com.monayuser.data.model.bean

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class HomeBean(
    val creditWalletAmount: String,
    val debitWalletAmount: String,
    val paymentRequest: List<PaymentRequest>,
    val recentTransaction: List<RecentTransaction>,
    val totalWalletAmount: String,
    val secondaryUserLimit : Double,
    val unReadCount: Int
)

data class PaymentRequest(
    val amount: String,
    val createdAt: String,
    val fromUser: FromUser,
    val fromUserId: Int,
    val id: Int,
    val message: String,
    val status: String,
    val toUserId: Int,
    val updatedAt: String
)

data class FromUser(
    val email: String,
    val firstName: String,
    val id: Int,
    val lastName: String,
    val profilePicture: Any,
    val profilePictureUrl: String,
    val phoneNumberCountryCode: String,
    val phoneNumber: String
)

data class RecentTransaction(
    val accountNumber: String?,
    val actionType: String,
    val amount: String,
    val apiReponse: String,
    val cardName: String,
    val cardType: String,
    val createdAt: String,
    val fromUser: FromUserX?,
    @SerializedName("Transaction")
    val transaction: Transaction?,
    val fromUserId: Int,
    val id: Int,
    val last4Digit: String,
    val message: String?,
    val paymentMethod: String?,
    val paymentRequestId: String?,
    val paymentStatus: String,
    val routingNumber: String?,
    val status: String,
    val toUser: ToUser?,
    val toUserId: Int,
    val transactionId: String?,
    val declineReason: String?,
    val transactionType: String,
    val updatedAt: String,
    val bankName: String
): Serializable

data class FromUserX(
    val firstName: String,
    val id: Int,
    val lastName: String,
    val profilePictureUrl: String?,
    val email: String?,
    val phoneNumberCountryCode: String?,
    val phoneNumber: String?
) : Serializable

data class Transaction(
    val id: Int,
    val transactionId: String,
    val amount: String
)

data class ToUser(
    val firstName: String,
    val id: Int,
    val lastName: String,
    val profilePictureUrl: String?,
    val email: String?
) : Serializable