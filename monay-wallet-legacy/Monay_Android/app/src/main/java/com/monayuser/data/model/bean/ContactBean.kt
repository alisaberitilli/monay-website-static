package com.monayuser.data.model.bean

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.Serializable

//(indices = [Index(value = ["mobile_number"], unique = true)])
@Entity
data class ContactBean(
    var name: String? = null,
    var id: String? = null,
    @ColumnInfo(name = "profile_picture_url")
    var profilePictureUrl: String? = null,
    @ColumnInfo(name = "first_name")
    var firstName: String? = null,
    @ColumnInfo(name = "last_name")
    var lastName: String? = null,
    @ColumnInfo(name = "is_blocked")
    var isBlocked: Int = 0,
    @ColumnInfo(name = "is_deleted")
    var isDeleted: Boolean? = false,
    @ColumnInfo(name = "is_invited")
    var isInvited: Boolean? = false,
    @ColumnInfo(name = "is_monay_user")
    var isMonayUser: Boolean? = false,
    @ColumnInfo(name = "country_code")
    var phoneNumberCountryCode: String? = null,
    @ColumnInfo(name = "mobile_number")
    var phoneNumber: Long? = null,
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "local_id")
    var localId: Int = 0,
    @ColumnInfo(name = "is_login_user")
    var isLoginUser: Boolean? = false,
    @ColumnInfo(name = "random_number")
    var randomNumber: String? = null
) : Serializable