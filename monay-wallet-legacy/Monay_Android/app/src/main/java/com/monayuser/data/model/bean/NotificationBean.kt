package com.monayuser.data.model.bean

import com.google.gson.annotations.SerializedName

data class NotificationBean(
    val count: Int,
    val rows: List<NotificationRow>,
    val unReadCount: Int
)

data class NotificationRow(
    @SerializedName("User")
    val user: User,
    val createdAt: String,
    val fromUserId: Int,
    val id: Int,
    val message: String,
    val receiverRead: String,
    val toUserId: Int,
    val type: String
)

data class User(
    val createdAt: String,
    val email: String,
    val firstName: String,
    val id: Int,
    val lastName: String,
    val profilePicture: String,
    val profilePictureUrl: String?
)