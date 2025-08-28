package com.monayuser.utils

import android.Manifest


/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 20-Jun-19.
 * Description : This class is used to define all constant fields
 */

object AppConstants {

    /**
     * Staging Dev server
     */
    val BASE_URL = "https://qa.monay.com/api/"

    val SMS_PROVIDER = "QP-MONAY"
    var DEVICE_TYPE_ANDROID = "android"
    val BEARER = "Bearer"

    val CAMERA_REQUEST = 2
    val GALLERY_IMAGE_REQUEST = 1

    val INTERNAL_SERVER_ERROR = "Internal Server Error"
    val DOCUMENT_REQUEST_CODE = 1431
    val http_some_other_error_new = "Some error occurred! Please try again later."
    val http_some_other_error = "Request time out, please try again."
    val IMAGE_DIRECTORY_NAME = "Temp"

    val MEDIA_FOR = "mediaFor"
    val MEDIA_TYPE = "mediaType"
    val MEDIA_TYPE_IMAGE = "image"
    val MEDIA_TYPE_PDF = "pdf"

    var ANDROID_DEVICE_ID = ""

    val MEDIA_FILE = "file"
    val LOG_CAT = "MonayUser"
    val SENT_MONEY = "SENT_MONEY"
    val ADD_MONEY = "ADD_MONEY"
    val REQUEST_WITHDRAWAL = "REQUEST_WITHDRAWAL"
    val REQUEST_MONEY = "REQUEST_MONEY"
    val TARGET_SUCCESS = "TARGET_SUCCESS"
    val TARGET_SIGNUP = "TARGET_SIGNUP"
    val TARGET_HOME = "TARGET_HOME"

    val USER_SIGNUP = "user"
    val MERCHANT_SIGNUP = "merchant"
    val SECONDARY_SIGNUP = "secondaryUser"
    val MEDIA_PERMISSION = arrayOf(
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.CAMERA
    )
    val READ_WRITE_PERMISSION =
        arrayOf(
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE
        )
    /*=====================QuitApplication Uses Key ===========================*/

    val ERROR = "error"

    val PN_NAME = "name"
    val PN_VALUE = "value"
    val PN_DATE = "date"
    val PN_TYPE = "type"
    val PN_PRICE = "price"
    val ABOUT_US = "about-us"
    val TERMS_AND_CONDITIONS = "terms_conditions"
    val HOW_IT_WORKS = "how_it_works"
    val PRIVACY_POLICY = "privacy_policy"
    val RECEIVED_REQUEST = "received"
    val MY_REQUEST = "my_request"
    val PAID_REQUEST = "paid"
    val DECLINED_REQUEST = "declined"
    val USER_DATA = "user_data"
    val RECENT_CONTACT = "RecentContact"
    val MY_CONTACT = "MyContact"
    val CONTACT_USER_DATA = "contact_user_data"
    val CONTACT_LIST_TYPE = "contactListType"
    val SCREEN_FROM = "screenfrom"
    val USER_ID = "userId"
    val COUNTRY_CODE = "countryCode"
    val PHONE_NUMBER = "phoneNumber"
    val EMAIL = "email"
    val OTP_STR = "otpStr"

    val TRANSACTION_ID = "transaction_id"
    val TRANSACTION = "transaction"

    val CARD_DATA = "card_data"
    val VERIFIED_STATUS = "verified_status"
/*=====================Screens Name Uses Key ===========================*/

    val FORGOT_PASSWORD = "ForgotPassword"
    val LOGIN = "LoginScreen"
    val CHOOSE_SIGNUP = "ChooseSignUp"
    val EDIT_PROFILE = "EditProfile"
    val COME_FROM = "ComeFrom"
    val NOTIFICATION = "notification"

    val NEW_NOTIFICATION = "NEW_NOTIFICATION"
    val DATE_FORMAT_YEAR = "yyyy-MM-dd"
    val DATE_FORMAT_MONTH = "dd MMM"
    val SIMPLE_DATE_FORMAT = "dd/MM/yyyy"

    val SECONDARY_USER = "SecondaryUserScanActivity"
    val SECONDARY_ACCOUNT_SCREEEN = "SecondaryAccountScreen"
    val IS_LINKED = false
    val USER_FIRST_NAME = "firstname"
    val USER_LAST_NAME = "lastname"
    val USER_IMAGE = "image"
    val USER_COUNTRY_CODE = "countrycode"
    val USER_PHONE_NUMBER = "phonenumber"

    val ACTIVE = "active"
    val IN_ACTIVE = "inactive"

    val TOTAL_WALLET_AMOUNT = "wallet_amount"


    val REFERRAL_CODE = "REFERRAL_CODE"
    val USER_NAME = "USER_NAME"

    val SECONDARY_USER_WALLET_AMOUNT = "wallet_amount"
    val PARENT_ID = "parentId"
    val PAY_MONEY_SECONDARY="PayMoneySecondary"
    val COUNTRY_INDIA="India"
}

