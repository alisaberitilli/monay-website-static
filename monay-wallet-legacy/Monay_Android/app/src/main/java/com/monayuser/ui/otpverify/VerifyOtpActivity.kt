package com.monayuser.ui.otpverify

import android.app.Activity
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import androidx.core.content.ContextCompat
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.response.*
import com.monayuser.databinding.ActivityVerifyOtpBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.setpin.SetMPinActivity
import com.monayuser.ui.signup.SignupActivity
import com.monayuser.utils.*
import kotlinx.android.synthetic.main.activity_verify_otp.*

class VerifyOtpActivity : BaseActivity<ActivityVerifyOtpBinding, VerifyOtpViewModel>(),
    VerifyOtpNavigator {

    private var otpStr = ""
    private var email = ""
    private var phoneNumber = ""
    private var countryCode = ""
    private var userId = ""
    var userType: String? = ""
    var screenFrom: String? = ""

    private var userName: String? = ""
    private var referralCode: String? = ""


    private lateinit var smsBroadcastReceiver: SmsBroadcastReceiver

    var mVerifyOtpViewModel: VerifyOtpViewModel = VerifyOtpViewModel()
    override val viewModel: VerifyOtpViewModel get() = mVerifyOtpViewModel

    override val bindingVariable: Int get() = BR.verifyOtpVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_verify_otp

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        requestWindowFeature(Window.FEATURE_NO_TITLE)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@VerifyOtpActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mVerifyOtpViewModel.navigator = this
        mVerifyOtpViewModel.initView()

        startSmsUserConsent()


/*        intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
        intent.putExtra(AppConstants.USER_NAME,userName)*/
        if (intent != null) {
            try {
                userName = intent.getStringExtra(AppConstants.USER_NAME)!!
                referralCode = intent.getStringExtra(AppConstants.REFERRAL_CODE)!!
            } catch (e: Exception) {

            }
        }
    }

    /**
     * This method is called when click on change number button.
     */
    override fun changeMobileNumber() {
        finish()

    }

    override fun onStart() {
        super.onStart()
        registerToSmsBroadcastReceiver()
    }

    override fun onDestroy() {
        super.onDestroy()

        try {
            unregisterReceiver(smsBroadcastReceiver)
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
            // TO DO
        }
    }

    private fun startSmsUserConsent() {
        try {
            SmsRetriever.getClient(this).startSmsUserConsent(null)
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
    }

    private fun registerToSmsBroadcastReceiver() {
        smsBroadcastReceiver = SmsBroadcastReceiver().also {
            it.smsBroadcastReceiverListener =
                object : SmsBroadcastReceiver.SmsBroadcastReceiverListener {
                    override fun onSuccess(intent: Intent?) {
                        intent?.let { context -> startActivityForResult(context, REQ_USER_CONSENT) }
                    }

                    override fun onFailure() {
                        // TO DO
                    }
                }
        }

        val intentFilter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)
        registerReceiver(smsBroadcastReceiver, intentFilter)
    }

    private fun fetchVerificationCode(message: String): String {
        return Regex("(\\d{6})").find(message)?.value ?: ""
    }

    companion object {
        const val TAG = "SMS_USER_CONSENT"

        const val REQ_USER_CONSENT = 100
    }

    override fun onResume() {
        if (screenFrom.equals(AppConstants.CHOOSE_SIGNUP)) {
            mIsInForegroundMode = false
        }
        super.onResume()
    }

    /**
     * This method is called when click on resend button.
     */
    override fun resendOTP() {
        startSmsUserConsent()

        if (checkIfInternetOn()) {
            if (screenFrom.equals(AppConstants.CHOOSE_SIGNUP)) {
                mVerifyOtpViewModel.resendOtpApi(
                    AppPreference.getInstance(this),
                    userId,
                    countryCode,
                    phoneNumber,
                    email
                )
            } else if (screenFrom.equals(AppConstants.EDIT_PROFILE)) {
                if (email != null && !email.equals("")) {
                    mVerifyOtpViewModel.updateEmailAPI(
                        AppPreference.getInstance(this),
                        email
                    )
                } else {
                    mVerifyOtpViewModel.updateNumberAPI(
                        AppPreference.getInstance(this),
                        countryCode,
                        phoneNumber
                    )
                }

            } else if (screenFrom.equals(AppConstants.SECONDARY_USER)) {
                mVerifyOtpViewModel.resendOtpApi(
                    AppPreference.getInstance(this),
                    userId,
                    countryCode,
                    phoneNumber,
                    email
                )
            } else {
                if (email != null && !email.equals("")) {
                    mVerifyOtpViewModel.forgotPinAPI(
                        AppPreference.getInstance(this),
                        countryCode,
                        email.trim().toString()
                    )
                } else {
                    mVerifyOtpViewModel.forgotPinAPI(
                        AppPreference.getInstance(this),
                        countryCode,
                        phoneNumber
                    )
                }

            }

        }
    }

    override fun getInvalidOTP() {
        if (!viewDataBinding!!.pinview.value.equals("")) {
            viewDataBinding!!.pinview.clearValue()
        }
    }

    /**
     * This method is called when click on proceed button.
     */
    override fun proceed() {
        startSmsUserConsent()

        if (pinValidation() && checkIfInternetOn()) {
            if (screenFrom.equals(AppConstants.CHOOSE_SIGNUP)) {
                mVerifyOtpViewModel.callVerifyOTPAPI(
                    AppPreference.getInstance(this),
                    otpStr,
                    email,
                    countryCode,
                    phoneNumber,
                    CommonUtils.getDeviceId(this)!!,
                    AppPreference.getInstance(this).getValue(PreferenceKeys.DEVICE_ID)
                        .toString()
                )
            } else if (screenFrom.equals(AppConstants.SECONDARY_USER)) {
                mVerifyOtpViewModel.callVerifyPrimaryUserOTPAPI(
                    AppPreference.getInstance(this),
                    otpStr,
                    email,
                    countryCode,
                    phoneNumber,
                    CommonUtils.getDeviceId(this)!!,
                    AppPreference.getInstance(this).getValue(PreferenceKeys.DEVICE_ID)
                        .toString()
                )
            } else if (screenFrom.equals(AppConstants.EDIT_PROFILE)) {

                if (!email.equals("")) {
                    mVerifyOtpViewModel.updateEmailVerifyAPI(
                        AppPreference.getInstance(this),
                        otpStr,
                        email
                    )
                } else {
                    mVerifyOtpViewModel.updateNumberVerifyAPI(
                        AppPreference.getInstance(this),
                        otpStr,
                        countryCode,
                        phoneNumber
                    )
                }

            } else {

                if (email != null && !email.equals("")) {
                    mVerifyOtpViewModel.verifyPinOTPAPI(
                        AppPreference.getInstance(this),
                        otpStr,
                        countryCode,
                        email
                    )
                } else {
                    mVerifyOtpViewModel.verifyPinOTPAPI(
                        AppPreference.getInstance(this),
                        otpStr,
                        countryCode,
                        phoneNumber
                    )
                }
            }
        }
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        pinview.setTextColor(ContextCompat.getColor(this@VerifyOtpActivity, R.color.dark_black))
        pinview.setHintTextColor(ContextCompat.getColor(this@VerifyOtpActivity, R.color.gray_color))
        pinview.showCursor(true)
        if (intent != null && intent.hasExtra(AppConstants.PHONE_NUMBER)) {
            screenFrom = intent.getStringExtra(AppConstants.SCREEN_FROM)!!
            countryCode = intent.getStringExtra(AppConstants.COUNTRY_CODE)!!
            phoneNumber = intent.getStringExtra(AppConstants.PHONE_NUMBER)!!
            email = intent.getStringExtra(AppConstants.EMAIL)!!

            verifyStatusCodition()

            when (screenFrom) {
                "SecuritySetup" -> {
                    viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                    viewDataBinding!!.otpVerifyLogo.visibility = View.GONE
                    viewDataBinding!!.viewLine.visibility = View.GONE
                    viewDataBinding!!.verifyOtpHeaderTxt.visibility = View.VISIBLE

                    viewDataBinding!!.resendOtp.text =
                        mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.resend_code)
                    viewDataBinding!!.verifyOtpHeaderTxt.text =
                        mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.verification_txt)
                }
                AppConstants.EDIT_PROFILE -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        window.statusBarColor =
                            ContextCompat.getColor(this@VerifyOtpActivity, R.color.colorPrimary)
                    }

                    if (email.equals("")) {
                        viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                        viewDataBinding!!.otpVerifyLogo.visibility = View.GONE
                        viewDataBinding!!.viewLine.visibility = View.GONE
                        viewDataBinding!!.verifyOtpHeaderTxt.visibility = View.VISIBLE
                        viewDataBinding!!.verifyCodeDesc.text =
                            mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.forgot_code_desc)
                        viewDataBinding!!.resendOtp.text =
                            mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.resend_code)
                        viewDataBinding!!.verifyOtpHeaderTxt.text =
                            mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.verification_txt)
                    } else {
                        viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                        viewDataBinding!!.otpVerifyLogo.visibility = View.GONE
                        viewDataBinding!!.viewLine.visibility = View.GONE
                        viewDataBinding!!.verifyOtpHeaderTxt.visibility = View.VISIBLE
                        viewDataBinding!!.verifyCodeDesc.text =
                            mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.forgot_code_desc_email)
                        viewDataBinding!!.resendOtp.text =
                            mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.resend_code)
                        viewDataBinding!!.verifyOtpHeaderTxt.text =
                            mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.verification_txt)
                    }

                }
                "PayMoney" -> {
                    viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                    viewDataBinding!!.otpVerifyLogo.visibility = View.GONE
                    viewDataBinding!!.viewLine.visibility = View.VISIBLE
                    viewDataBinding!!.verifyOtpHeaderTxt.text = getString(R.string.forgot_pin_txt)
                }
                AppConstants.PAY_MONEY_SECONDARY -> {
                    viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                    viewDataBinding!!.otpVerifyLogo.visibility = View.GONE
                    viewDataBinding!!.viewLine.visibility = View.VISIBLE
                    viewDataBinding!!.verifyOtpHeaderTxt.text = getString(R.string.forgot_pin_txt)
                }

                AppConstants.CHOOSE_SIGNUP -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        window.statusBarColor =
                            ContextCompat.getColor(this@VerifyOtpActivity, R.color.white)
                    }
                    viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                    viewDataBinding!!.headerLayout.setBackgroundColor(resources.getColor(R.color.white));
                    viewDataBinding!!.otpVerifyLogo.visibility = View.VISIBLE
                    viewDataBinding!!.viewLine.visibility = View.GONE
                    viewDataBinding!!.verifyOtpHeaderTxt.visibility = View.GONE
                    viewDataBinding!!.backButton.visibility = View.GONE
                    viewDataBinding!!.verifyCodeDesc.text =
                        mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.forgot_code_desc)
                    viewDataBinding!!.resendOtp.text =
                        mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.resend_code)
                }
                AppConstants.SECONDARY_USER -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        window.statusBarColor =
                            ContextCompat.getColor(this@VerifyOtpActivity, R.color.white)
                    }
                    viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                    viewDataBinding!!.headerLayout.setBackgroundColor(resources.getColor(R.color.white));
                    viewDataBinding!!.otpVerifyLogo.visibility = View.VISIBLE
                    viewDataBinding!!.viewLine.visibility = View.GONE
                    viewDataBinding!!.verifyOtpHeaderTxt.visibility = View.GONE
                    viewDataBinding!!.backButton.visibility = View.GONE
                    viewDataBinding!!.verifyCodeDesc.text =
                        mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.forgot_code_desc)
                    viewDataBinding!!.resendOtp.text =
                        mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.resend_code)
                }
                else -> {
                    viewDataBinding!!.headerLayout.visibility = View.GONE
                    viewDataBinding!!.otpVerifyLogo.visibility = View.VISIBLE
                    viewDataBinding!!.viewLine.visibility = View.GONE
                }
            }
        }
    }

    private fun verifyStatusCodition() {
        if (intent.hasExtra("verify_status")) {
            viewDataBinding!!.change.visibility = View.GONE
            if (email != null && !email.equals("")) {
                viewDataBinding!!.verifyCodeDesc.text =
                    mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.forgot_code_desc_email)

                viewDataBinding!!.mobileNumberTv.text = email
            } else {
                viewDataBinding!!.verifyCodeDesc.text =
                    mVerifyOtpViewModel!!.navigator!!.getStringResource(R.string.forgot_code_desc)
                viewDataBinding!!.mobileNumberTv.text = "$countryCode $phoneNumber"
            }
        }
    }

    /**
     * This method is called when click on back button.
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to hide progress bar
     */
    override fun hideProgressBar() {
        hideProgressDialog()
    }

    /**
     * This method is used to show progress bar
     */
    override fun showProgressBar() {
        showProgressDialog(this@VerifyOtpActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@VerifyOtpActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            if (screenFrom.equals(AppConstants.CHOOSE_SIGNUP)) {
//                if (userType.equals("User")) {
//                    val intent = Intent(this@VerifyOtpActivity, SignupActivity::class.java)
//                    intent.putExtra(AppConstants.TARGET_SIGNUP, userType)
//                    intent.putExtra(AppConstants.PHONE_NUMBER, phoneNumber)
//                    intent.putExtra(AppConstants.COUNTRY_CODE, countryCode)
//                    startActivity(intent)
//                    overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
//                } else {
                val intent = Intent(this@VerifyOtpActivity, SignupActivity::class.java)


                intent.putExtra(AppConstants.REFERRAL_CODE, referralCode)
                intent.putExtra(AppConstants.USER_NAME, userName)

                intent.putExtra(AppConstants.TARGET_SIGNUP, userType)
                intent.putExtra(AppConstants.PHONE_NUMBER, phoneNumber)
                intent.putExtra(AppConstants.COUNTRY_CODE, countryCode)
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
//                }
            } else if (screenFrom.equals(AppConstants.EDIT_PROFILE)) {
                setResult(Activity.RESULT_OK)
                finish()
            } else if (screenFrom.equals(AppConstants.SECONDARY_USER)) {

                AppPreference.getInstance(this@VerifyOtpActivity)
                    .addBoolean(PreferenceKeys.IS_LINKED, true)
                openNavigation(this@VerifyOtpActivity)
                finish()
            } else {
                hideKeyboard()
                val intent = Intent(this@VerifyOtpActivity, SetMPinActivity::class.java)
                intent.putExtra(AppConstants.SCREEN_FROM, screenFrom)
                intent.putExtra("STATUS", "VerifyOtp")
                intent.putExtra(AppConstants.PHONE_NUMBER, phoneNumber)
                intent.putExtra(AppConstants.COUNTRY_CODE, countryCode)
                intent.putExtra(AppConstants.EMAIL, email.trim().toString())
                intent.putExtra(AppConstants.OTP_STR, otpStr)
                startActivityForResult(intent, 201)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }


        }


        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName = packageName // getPackageName() from Context or Activity object
            try {
                startActivity(
                    Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("market://details?id=$appPackageName")
                    )
                )
            } catch (anfe: android.content.ActivityNotFoundException) {
                startActivity(
                    Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://play.google.com/store/apps/details?id=$appPackageName")
                    )
                )
            }
        }

        override fun onYes() {
            super.onYes()
        }
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@VerifyOtpActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is used to applying OTP validation
     */
    fun pinValidation(): Boolean {
        hideKeyboard()
        otpStr = pinview.value.toString()
        if (otpStr == "") {
            mVerifyOtpViewModel.navigator!!.showValidationError(getString(R.string.enter_otp))
            return false
        }
        if (otpStr.toString().length < 6) {
            mVerifyOtpViewModel.navigator!!.showValidationError(getString(R.string.pin_length))
            return false
        }
        return true
    }

    /**
     * This method is used to show home screen
     */
    override fun getVerifyOTPResponse(verifyResponse: VerifyResponse) {
        userType =
            AppPreference.getInstance(this@VerifyOtpActivity).getValue(PreferenceKeys.USER_TYPE)
                .toString()
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            verifyResponse.message,
            ItemEventListener()
        )

    }

    override fun getVerifyPinResponse(verifyPinResponse: VerifyPinResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            verifyPinResponse.message,
            ItemEventListener()
        )
    }

    override fun verifyNumberResponse(updateNumberResponse: VerifyUpdateNumberResponse) {
        DialogUtils.dialogWithEvent(
            this, resources.getString(R.string.oops),
            updateNumberResponse.message, ItemEventListener()
        )
    }

    override fun verifyEmailResponse(verifyResponse: UpdateEmailVerifyResponse) {
        DialogUtils.dialogWithEvent(
            this, resources.getString(R.string.oops),
            verifyResponse.message, ItemEventListener()
        )
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == 201) {
                setResult(Activity.RESULT_OK)
                finish()
            } else if (requestCode == REQ_USER_CONSENT && (resultCode == Activity.RESULT_OK) && (data != null)) {
                //That gives all message to us. We need to get the code from inside with regex
                val message = data.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
                val code = message?.let { fetchVerificationCode(it) }

                viewDataBinding!!.pinview.value = code
            }
        }
    }

    override fun successOtpSend(message: String) {
        if (!viewDataBinding!!.pinview.value.equals("")) {
            viewDataBinding!!.pinview.clearValue()
        }

        showValidationError(message)

//        DialogUtils.dialogWithOTPEvent(
//            this,
//            resources.getString(R.string.oops),
//            message,
//            ItemEventListener()
//        )
    }

    override fun refreshActivity() {
        var intent = getIntent()
        finish()
        startActivity(intent)
    }

    override fun getVerifyPrimaryOTPResponse(verifyResponse: VerifyPrimaryOtpResponse) {
        userType =
            AppPreference.getInstance(this@VerifyOtpActivity).getValue(PreferenceKeys.USER_TYPE)
                .toString()
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            verifyResponse.message,
            ItemEventListener()
        )
    }

}