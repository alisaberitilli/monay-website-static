package com.monayuser.data.remote

import com.monayuser.data.model.response.*
import io.reactivex.Observable
import okhttp3.RequestBody
import retrofit2.http.*

interface ApiInterface {

    @POST("user/signup")
    fun userSignUp(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SignUpResponse>

    @POST("merchant/signup")
    fun vendorSignUp(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SignUpResponse>

    @POST("user/kyc")
    fun callKYCApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<KYCResponse>

    @POST("verify-otp")
    fun callVerifyOTP(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<VerifyResponse>

    @Multipart
    @POST("media/upload/{mediaFor}/{mediaType}")
    fun uploadImage(
        @Header("Authorization") accessToken: String,
        @Path("mediaFor") mediaFor: String?,
        @Path("mediaType") mediaType: String?,
        @PartMap map: Map<String, @JvmSuppressWildcards RequestBody>
    ): Observable<MediaResponse>

    @PUT("user/update-profile")
    fun updateUserProfileAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<UserUpdateProfileResponse>

    @PUT("merchant/update-profile")
    fun updateVendorProfileAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<UserUpdateProfileResponse>

    /**
     * Get Login api method
     *
     * @param map
     * @return
     */
    @POST("login")
    fun onLogin(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SignInResponse>

    /**
     * Forgot Password API
     *
     * @param map
     * @return
     */
    @POST("forgot-password")
    fun onForgotPassword(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<ForgotPasswordResponse>

    /**
     * Resend Otp API
     * @param map
     */
    @POST("resend/otp")
    fun resendOTP(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<ResendOtpResponse>

    /**
     * ResetPasswordAPI
     * @param map
     */
    @POST("reset-password")
    fun resetPassword(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<ResetPasswordResponse>


    @POST("account/logout")
    fun logoutAPI(@Header("Authorization") accessToken: String): Observable<LogoutResponse>

    @POST("account/change-password")
    fun changePasswordAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<ChangePasswordResponse>

    @Multipart
    @POST("update-profile")
    fun updateProfileAPI(
        @Header("Authorization") accessToken: String,
        @PartMap map: Map<String, @JvmSuppressWildcards RequestBody>
    ): Observable<UpdateProfileResponse>


    @GET("user/payment/request/{type}")
    fun paymentRequest(
        @Header("Authorization") accessToken: String,
        @Path("type") type: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<PaymentRequestResponse>

    @POST("user/support/request")
    fun supportAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<SupportResponse>

    @GET("user/support/request")
    fun supportListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<SupportListRequestResponse>

    @GET("user/notification")
    fun notificationListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<NotificationListResponse>

    @PUT("payment/request/decline")
    fun declinedPaymentRequestApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<DeclinedPaymentRequestResponse>

    @POST("user/payment/request")
    fun paymentRequestApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<SendPaymentRequestResponse>

    @GET("cms")
    fun getCMSData(@QueryMap map: HashMap<String, Any>): Observable<TermsConditionsResponse>

    @GET("faq")
    fun getFAQData(
        @Header("Authorization") accessToken: String,
        @QueryMap map: HashMap<String, Any>
    ): Observable<FAQResponse>

    @GET("account/me")
    fun getUserProfileData(@Header("Authorization") accessToken: String): Observable<GetUserProfileResponse>

    @GET("user/transaction")
    fun getTransactionListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<TransactionListResponse>

    @GET("user/block")
    fun getBlockedList(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<BlockListResponse>

    @GET("user/search")
    fun callUserSearchListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<UserSearchResponse>

    @POST("user/block")
    fun callBlockAndUnBlockAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<BlockUnBlockResponse>

    @GET("user/transaction/{id}")
    fun getTransactionDetailsAPI(
        @Header("Authorization") accessToken: String,
        @Path("id") id: String
    ): Observable<GetTransactionDetailsResponse>

    @GET("user/my-request")
    fun callMyRequestListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<MyRequestResponse>

    @GET("home")
    fun callHomeAPI(@Header("Authorization") accessToken: String): Observable<HomeResponse>

    @GET("user/recent-payment-users")
    fun callRecentUserListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<RecentUserListResponse>

    @POST("user/card")
    fun addCardAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<AddCardResponse>

    @GET("user/cards")
    fun callGetCardListAPI(@Header("Authorization") accessToken: String): Observable<GetCardListResponse>

    @GET("user/cards")
    fun callGetCardListAPIAutoTopUp(@Header("Authorization") accessToken: String): Observable<GetCardListAutoTopUpResponse>

    @DELETE("user/card/{cardId}")
    fun deleteCardAPI(
        @Header("Authorization") accessToken: String,
        @Path("cardId") cardId: String?
    ): Observable<DeleteCardResponse>

    @POST("user/pay-money")
    fun userPayMoney(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<PayMoneyResponse>


    @POST("user/add-money/card")
    fun addMoney(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<AddMoneyResponse>

    @GET("user/banks")
    fun callBankListAPI(@Header("Authorization") accessToken: String): Observable<GetBankListResponse>

    @POST("user/bank")
    fun addBankAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<AddBankResponse>

    @DELETE("user/bank/{bankId}")
    fun deleteBankAPI(
        @Header("Authorization") accessToken: String,
        @Path("bankId") bankId: String?
    ): Observable<DeleteBankResponse>

    @POST("user/withdrawal-money")
    fun withdrawalMoneyAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<RequestWithdrawalResponse>

    @GET("user/withdrawal-history")
    fun withdrawalHistoryListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<WithdrawalHistoryResponse>

    @GET("user/wallet")
    fun getWalletAPI(@Header("Authorization") accessToken: String): Observable<WalletResponse>

    @POST("send-otp")
    fun sendOtpAPI(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SendOtpResponse>

    @PUT("user/set-pin")
    fun setPinApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<MPinResponse>

    @POST("user/forgot-pin")
    fun forgotPinApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<ForgotPinResponse>

    @POST("user/verify-pin-otp")
    fun verifyPinApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<VerifyPinResponse>

    @POST("user/reset-pin")
    fun resetPinApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<ResetPinResponse>

    @GET("user/profile/{userId}")
    fun userBasicProfile(
        @Header("Authorization") accessToken: String,
        @Path("userId") type: String
    ): Observable<BasicUserProfileResponse>

    @GET("setting")
    fun settingApi(): Observable<SettingResponse>

    @POST("user/payment/request/pay")
    fun paymentRequestPay(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<PayMoneyResponse>

    @POST("contact/sync")
    fun allContactSyncAPI(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<AllContactSyncResponse>


    @POST("send/email-verification-code")
    fun emailVerifyApi(@Header("Authorization") accessToken: String): Observable<EmailVerifyResponse>

    @POST("user/update/phone-number")
    fun updateNumberApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<UpdateNumberResponse>

    @POST("user/verify/phone-number")
    fun verifyNumberApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<VerifyUpdateNumberResponse>

    @POST("user/change-pin")
    fun changePinApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<ChangePinResponse>

    @POST("verify-otp-only")
    fun verifyOtpOnlyApi(@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<VerifyOtpOnlyResponse>

    @GET("user/check/email")
    fun callCheckEmailAPI(@QueryMap map: Map<String, @JvmSuppressWildcards Any>): Observable<CheckEmailResponse>

    @POST("user/update/email")
    fun updateEmailApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<UpdateEmailResponse>

    @POST("user/verify/email")
    fun verifyUpdateEmailApi(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<UpdateEmailVerifyResponse>

    @GET("user/country")
    fun countryCodeAPI(): Observable<CountryCodeResponse>

    @POST("send-primary-otp")
    fun sendPrimaryOtpAPI(@Header("Authorization") accessToken: String,@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SendPrimaryOtpResponse>

    @POST("verify-primary-otp")
    fun verifyPrimaryOtpAPI(@Header("Authorization") accessToken: String,@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<VerifyPrimaryOtpResponse>

    @GET("user-scan/{id}")
    fun userScanPrimary(
        @Header("Authorization") accessToken: String,
        @Path("id") id: String
    ): Observable<ScanPrimaryUserResponse>

    @GET("secondary-user")
    fun getSecondaryUserListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<SecondaryUserListResponse>

    @GET("secondary-user/{id}")
    fun secondaryUserDetailAPI(@Header("Authorization") accessToken: String,@Path("id") id: String): Observable<SecondaryUserDetailResponse>

    @PUT("secondary-user/status/{id}")
    fun secondaryUserActiveInactiveAPI(@Header("Authorization") accessToken: String,@Path("id") id: String, @Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SecondaryUserActiveInactiveResponse>

    @DELETE("secondary-user/{id}")
    fun deleteSecondaryUserAPI(
        @Header("Authorization") accessToken: String,
        @Path("id") id: String?
    ): Observable<DeleteSecondaryUserResponse>


    @GET("parent-user")
    fun getPrimaryUserListAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<PrimaryUserListResponse>

    @PUT("secondary-user/limit/{id}")
    fun secondaryUserLimitAPI(@Header("Authorization") accessToken: String,@Path("id") id: String, @Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SetLimitAmountResponse>


    @GET("user/kyc-document")
    fun getAllKYCDocumentsAPI(
        @Header("Authorization") accessToken: String,
        @QueryMap map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<GetAllKYCDocumentsResponse>


    @PUT("user/wallet-limit")
    fun setPrimaryAutoTopUp(@Header("Authorization") accessToken: String, @Body map: Map<String, @JvmSuppressWildcards Any>): Observable<SetAutoTopUpAmountResponse>


    @POST("user/pay-money")
    fun secondaryUserPayMoney(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<SecondaryUserPayResponse>


    @POST("user/payment/request/pay")
    fun paymentRequestPaySecondaryUser(
        @Header("Authorization") accessToken: String,
        @Body map: Map<String, @JvmSuppressWildcards Any>
    ): Observable<SecondaryUserPayResponse>


    @PUT("user/auto-toup")
    fun autoTopUpEnableDisableAPI(@Header("Authorization") accessToken: String,@Body map: Map<String, @JvmSuppressWildcards Any>): Observable<AutoTopUpEnableDisableResponse>


}
