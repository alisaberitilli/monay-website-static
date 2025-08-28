package com.monayuser.data.model.bean

import com.google.gson.annotations.SerializedName

data class SupportRequestBean(
    @SerializedName("current_page")
    val currentPage: Int,
    val rows: List<SupportData>,
    @SerializedName("first_page_url")
    val firstPageUrl: String,
    val from: Int,
    @SerializedName("last_page")
    val lastPage: Int,
    @SerializedName("last_page_url")
    val lastPageUrl: String,
    @SerializedName("next_page_url")
    val nextPageUrl: Any?,
    val path: String,
    @SerializedName("per_page")
    val perPage: Int,
    @SerializedName("prev_page_url")
    val prevPageUrl: Any,
    val to: Int,
    val total: Int
)

data class SupportData(
    @SerializedName("admin_message")
    val adminMessage: Any,
    val createdAt: String,
    val id: Int,
    val status: String,
    val updatedAt: String,
    val userId: Int,
    val message: String
)