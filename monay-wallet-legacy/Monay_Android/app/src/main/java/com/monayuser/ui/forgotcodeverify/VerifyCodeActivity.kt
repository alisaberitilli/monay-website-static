package com.monayuser.ui.forgotcodeverify

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
import com.monayuser.data.model.response.VerifyOtpOnlyResponse
import com.monayuser.data.model.response.VerifyResponse
import com.monayuser.databinding.ActivityForgotCodeBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.ui.resetpassword.ResetPasswordActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import com.monayuser.utils.SmsBroadcastReceiver
import kotlinx.android.synthetic.main.activity_forgot_code.*

class VerifyCodeActivity : BaseActivity<ActivityForgotCodeBinding, VerifyCodeViewModel>(),
    VerifyCodeNavigator {
    private var otpStr = ""
    private var email = ""
    private var phoneNumber = ""
    private var countryCode = ""
    private var userId = ""
    private var screenFrom = ""
    private var verifiedStatus = ""
    var mVerifyOtpViewModel: VerifyCodeViewModel = VerifyCodeViewModel()
    override val viewModel: VerifyCodeViewModel get() = mVerifyOtpViewModel
    override val bindingVariable: Int get() = BR.verifyCodeVM
    var appPreferences = AppPreference()
    private lateinit var smsBroadcastReceiver: SmsBroadcastReceiver

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_forgot_code

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@VerifyCodeActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mVerifyOtpViewModel.navigator = this
        mVerifyOtpViewModel.initView()

        startSmsUserConsent()
    }

    override fun onStart() {
        super.onStart()
        registerToSmsBroadcastReceiver()
    }

    override fun onDestroy() {
        super.onDestroy()

        try {
            unregisterReceiver(smsBroadcastReceiver)
        }catch (e: java.lang.Exception){
            e.printStackTrace()
            // TO DO
        }
    }

    private fun startSmsUserConsent() {
        try {
         SmsRetriever.getClient(this).startSmsUserConsent(null)
        }catch (e:java.lang.Exception){
            e.printStackTrace()
        }
    }

    private fun registerToSmsBroadcastReceiver() {
        smsBroadcastReceiver = SmsBroadcastReceiver().also {
            it.smsBroadcastReceiverListener = object : SmsBroadcastReceiver.SmsBroadcastReceiverListener {
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
        if (screenFrom.equals(AppConstants.FORGOT_PASSWORD)) {
            mIsInForegroundMode = false
        }
        super.onResume()
    }

    /**
     * This method is called when click on change number button.
     */
    override fun changeMobileNumber() {
        finish()
    }

    /**
     * This method is called when click on resend button.
     */
    override fun resendOTP() {
        startSmsUserConsent()

        if (checkIfInternetOn()) {
            mVerifyOtpViewModel.resendOtpApi(
                AppPreference.getInstance(this),
                userId,
                email,
                countryCode,
                phoneNumber
            )
        }
    }

    /**
     * This method is called when click on proceed button.
     */
    override fun proceed() {
        startSmsUserConsent()
            if (checkIfInternetOn() && otpValidation()) {
                if (screenFrom.equals(AppConstants.FORGOT_PASSWORD)) {
                    mVerifyOtpViewModel.verifyOTPOnlyAPI(
                        AppPreference.getInstance(this),
                        otpStr,
                        email,
                        countryCode,
                        phoneNumber
                    )
                } else {
                    mVerifyOtpViewModel.verifyOTPAPI(
                        AppPreference.getInstance(this),
                        otpStr,
                        email,
                        countryCode,
                        phoneNumber,
                        AppPreference.getInstance(this).getValue(
                            PreferenceKeys.DEVICE_ID
                        ).toString()
                    )
                }
            }
    }

    /**
     * This method is used to open reset password screen.
     */
    override fun getVerifyOTPResponse(verifyResponse: VerifyResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            verifyResponse.message,
            ItemEventListener()
        )
    }

    override fun VerifyOTPOnlyResponse(verifyOtpOnlyResponse: VerifyOtpOnlyResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            verifyOtpOnlyResponse.message,
            ItemEventListener()
        )
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        pinviewVerify.setTextColor(
            ContextCompat.getColor(
                this@VerifyCodeActivity,
                R.color.dark_black
            )
        )
        pinviewVerify.setHintTextColor(
            ContextCompat.getColor(
                this@VerifyCodeActivity,
                R.color.gray_color
            )
        )
        pinviewVerify.showCursor(true)

        if (intent != null) {
            screenFrom = intent.getStringExtra(AppConstants.SCREEN_FROM)!!
            email = intent.getStringExtra(AppConstants.EMAIL)!!
            countryCode = intent.getStringExtra(AppConstants.COUNTRY_CODE)!!
            phoneNumber = intent.getStringExtra(AppConstants.PHONE_NUMBER)!!
            userId = intent.getStringExtra(AppConstants.USER_ID)!!
            verifiedStatus = intent.getStringExtra(AppConstants.VERIFIED_STATUS)!!
        }

        if (screenFrom.equals(AppConstants.FORGOT_PASSWORD)) {
            window.statusBarColor =
                    ContextCompat.getColor(this@VerifyCodeActivity, R.color.white)

            viewDataBinding!!.headerLayout.setBackgroundColor(resources.getColor(R.color.white))
            viewDataBinding!!.verifyCodeHeaderTxt.visibility = View.GONE
            viewDataBinding!!.backButton.setColorFilter(resources.getColor(R.color.dark_black))
            viewDataBinding!!.btnSignUP.text = getString(R.string.confirm)
            viewDataBinding!!.splashLogo.visibility = View.VISIBLE

            if (email == "") {
                forgot_password.text = getStringResource(R.string.forgot_code_desc)
                mobile_number_tv.text = "$countryCode $phoneNumber"
            } else {
                forgot_password.text = getStringResource(R.string.forgot_code_desc_email)
                mobile_number_tv.text = "$email"
            }
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.statusBarColor =
                    ContextCompat.getColor(this@VerifyCodeActivity, R.color.colorPrimary)
            }

            viewDataBinding!!.splashLogo.visibility = View.GONE
            if (email == "") {
                viewDataBinding!!.resendOtp.visibility = View.VISIBLE
                forgot_password.text = getStringResource(R.string.verify_mobile_desc_txt)
                mobile_number_tv.text = "$countryCode $phoneNumber"
                viewDataBinding!!.btnSignUP.text = getString(R.string.next_txt)
            } else {
                if (verifiedStatus.equals("already verified"))
                {
                    viewDataBinding!!.resendOtp.visibility = View.VISIBLE
                    forgot_password.text = getStringResource(R.string.verify_email_desc_txt)
                    mobile_number_tv.text = "$email"
                    viewDataBinding!!.btnSignUP.text = getString(R.string.next_txt)
                }
                else
                {
                    forgot_password.text = getStringResource(R.string.verify_email_desc_txt)
                    mobile_number_tv.text = "$email"
                    viewDataBinding!!.btnSignUP.text = getString(R.string.update_txt)
                }

            }

            viewDataBinding!!.headerLayout.setBackgroundColor(resources.getColor(R.color.colorPrimary))

            viewDataBinding!!.verifyCodeHeaderTxt.visibility = View.VISIBLE
            viewDataBinding!!.backButton.setColorFilter(resources.getColor(R.color.white))
        }
    }

    /**
     * This method is called when click on back button
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
        showProgressDialog(this@VerifyCodeActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@VerifyCodeActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            if (screenFrom.equals(AppConstants.FORGOT_PASSWORD)) {
                val intent = Intent(this@VerifyCodeActivity, ResetPasswordActivity::class.java)
                intent.putExtra(AppConstants.EMAIL, email)
                intent.putExtra(AppConstants.COUNTRY_CODE, countryCode)
                intent.putExtra(AppConstants.PHONE_NUMBER, phoneNumber)
                intent.putExtra(AppConstants.USER_ID, userId)
                intent.putExtra(AppConstants.OTP_STR, otpStr)
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            } else {
                if (email.equals("")) {
                    val intent =
                        Intent(this@VerifyCodeActivity, MobileVerificationActivity::class.java)
                    intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.EDIT_PROFILE)
                    intent.putExtra("STATUS", "ChangeNumber")
                    startActivityForResult(intent, 101)
                    overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                } else {
                    if (verifiedStatus.equals("already verified"))
                    {
                        val intent =
                            Intent(this@VerifyCodeActivity, MobileVerificationActivity::class.java)
                        intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.EDIT_PROFILE)
                        intent.putExtra("STATUS", "ChangeEmail")
                        startActivityForResult(intent, 101)
                        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                    }
                    else
                    {
                        setResult(Activity.RESULT_OK)
                        finish()
                    }
                }
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
        DialogUtils.sessionExpireDialog(this@VerifyCodeActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is used to applying OTP validation
     */
    fun otpValidation(): Boolean {
        hideKeyboard()
        otpStr = pinviewVerify.value.toString()
        if (otpStr == "") {
            mVerifyOtpViewModel!!.navigator!!.showValidationError(getString(R.string.enter_otp))
            return false
        }
        if (otpStr.length < 6) {
            mVerifyOtpViewModel!!.navigator!!.showValidationError(getString(R.string.pin_length))
            return false
        }

        return true
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 101) {
            if (resultCode == Activity.RESULT_OK) {
                setResult(Activity.RESULT_OK)
                finish()
            }
        } else if (requestCode == REQ_USER_CONSENT && (resultCode == Activity.RESULT_OK) && (data != null)){
            //That gives all message to us. We need to get the code from inside with regex
                val message = data.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
                val code = message?.let { fetchVerificationCode(it) }

                viewDataBinding!!.pinviewVerify.value = code
        }
    }

    override fun successResendOtp(message: String) {
//        DialogUtils.dialogWithOTPEvent(
//            this,
//            resources.getString(R.string.oops),
//            message,
//            ItemEventListener()
//        )

        if(!pinviewVerify.value.equals(""))
        {
            pinviewVerify.clearValue()
        }

        showValidationError(message)
    }

    override fun refreshActivity() {
        var intent = getIntent()
        finish()
        startActivity(intent)
    }
}