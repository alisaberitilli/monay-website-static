package com.monayuser.data.model.bean

data class CountryCode(
    val `data`: ArrayList<CountryData>
)

data class CountryData(
    val code: String,
    val countryCallingCode: String,
    val createdAt: String,
    val currencyCode: String,
    val id: Int,
    val name: String,
    val status: String,
    val updatedAt: String
)