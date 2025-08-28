package com.monayuser.data.model.bean

data class TermsBean(
    val rows: List<TermsRow>
)

data class TermsRow(
    val createdAt: String,
    val id: Int,
    val pageContent: String,
    val pageKey: String,
    val pageName: String,
    val updatedAt: String,
    val userType: String
)