package com.monayuser.data.model.bean

data class FAQBean(
    val rows: List<Row>,
    val total: Int
)

data class Row(
    val answer: String,
    val createdAt: Any,
    val id: Int,
    val question: String,
    val updatedAt: Any,
    val userType: String
)
