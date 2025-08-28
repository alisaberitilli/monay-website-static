package com.monayuser.data.model.bean

data class KycBean(
    val picture: List<AddressBean>,
    val address: List<AddressBean>
)


data class AddressBean(
    val id: Long,
    val requiredDocumentName: String,
    val documentKey: String,
    val countryCode: String,
    val type: String,
    val uploadImageCount: Int,
    val createdAt: String,
    val updatedAt: String
)
