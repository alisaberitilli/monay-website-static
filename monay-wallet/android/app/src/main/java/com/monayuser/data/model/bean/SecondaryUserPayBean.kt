package com.monayuser.data.model.bean

data class SecondaryUserPayBean(
    val actionType: String,
    val amount: String,
    val apiReponse: String,
    val bankName: Any?,
    val cardName: Any?,
    val cardType: Any?,
    val cnpToken: Any?,
    val createdAt: String,
    val fromUserId: Int,
    val id: Int,
    val last4Digit: Any?,
    val message: Any?,
    val parentId: Int,
    val paymentMethod: String,
    val paymentRequestId: Any?,
    val paymentStatus: String,
    val status: String,
    val toUserId: String,
    val transactionId: String,
    val transactionType: String,
    val transactionUserId: String,
    val updatedAt: String,
    val user: SecondaryUserBeanPay? = null
)

data class SecondaryUserBeanPay(
    var lastName: String? = null,
    var firstName: String? = null,
    val email: String? = null,
    var phoneNumber: String? = null,
 var phoneNumberCountryCode:String?= null
)