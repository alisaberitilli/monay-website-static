package com.monayuser.data.model.bean

data class TransactionBean(
    val `rows`: List<RecentTransaction>,
    val total: Int
)