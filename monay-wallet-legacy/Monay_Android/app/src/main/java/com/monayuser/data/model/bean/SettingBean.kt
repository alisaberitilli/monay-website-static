package com.monayuser.data.model.bean

import com.google.gson.annotations.SerializedName

data class SettingBean(
    @SerializedName("android_app_version")
    val androidAppVersion: String,
    @SerializedName("android_force_update")
    val androidForceUpdate: Int,
    @SerializedName("contact_sync_duration")
    val contactSyncDuration: String,
    val country: Country,
    val countryPhoneCode: String,
    val currencyAbbr: String,
    @SerializedName("invite_message")
    val inviteMessage: String = "",
    @SerializedName("ios_app_version")
    val iosAppVersion: String,
    @SerializedName("ios_force_update")
    val iosForceUpdate: Int
)

data class Country(
    val code: String = "",
    val countryCallingCode: String,
    val createdAt: Any,
    val currencyCode: String,
    val id: Int,
    val name: String,
    val updatedAt: Any
)