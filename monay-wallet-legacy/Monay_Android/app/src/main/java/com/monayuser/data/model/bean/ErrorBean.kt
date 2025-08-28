package com.monayuser.data.model.bean

import com.google.gson.annotations.SerializedName

data class ErrorBean(
    @SerializedName("message")
    val message: String?
)
