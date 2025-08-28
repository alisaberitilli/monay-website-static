package com.monayuser.ui.resetpassword

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.method.HideReturnsTransformationMethod
import android.text.method.PasswordTransformationMethod
import android.view.MotionEvent
import android.view.Window
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.ResetPasswordResponse
import com.monayuser.databinding.ActivityResetPasswordBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.login.LoginActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to reset new password
 */

class ResetPasswordActivity : BaseActivity<ActivityResetPasswordBinding, ResetPasswordViewModel>(),
    ResetPasswordNavigator {

    private var userId = ""
    var mResetPasswordViewModel: ResetPasswordViewModel = ResetPasswordViewModel()
    override val viewModel: ResetPasswordViewModel get() = mResetPasswordViewModel
    private var showPassword = false
    private var showConfirmPassword = false
    private var otpStr = ""
    private var email = ""
    private var phoneNumber = ""
    private var countryCode = ""

    override val bindingVariable: Int get() = BR.resetPasswordVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_reset_password

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@ResetPasswordActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)
        mResetPasswordViewModel.navigator = this
        mResetPasswordViewModel.initView()
    }

    /**
     * This method is used to initialize an variable and call a API.
     */
    override fun init() {
        if (intent != null && intent.hasExtra(AppConstants.EMAIL)) {
            email = intent.getStringExtra(AppConstants.EMAIL)!!
            countryCode = intent.getStringExtra(AppConstants.COUNTRY_CODE)!!
            phoneNumber = intent.getStringExtra(AppConstants.PHONE_NUMBER)!!
            otpStr = intent.getStringExtra(AppConstants.OTP_STR)!!
        }

        passwordTouchListener()
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun passwordTouchListener() {
        viewDataBinding!!.passwordEt.setOnTouchListener { v, event ->
            val right = 2
            if ((event.action == MotionEvent.ACTION_UP) && event.rawX >= viewDataBinding!!.passwordEt.right - viewDataBinding!!.passwordEt.compoundDrawables.get(
                    right
                ).bounds.width()
            ) {
                if (showPassword) {
                    viewDataBinding!!.passwordEt.setTransformationMethod(
                        PasswordTransformationMethod.getInstance()
                    )
                    showPassword = false
                    viewDataBinding!!.passwordEt.setCompoundDrawablesWithIntrinsicBounds(
                        0,
                        0,
                        R.mipmap.ic_hide_password,
                        0
                    )
                } else {
                    viewDataBinding!!.passwordEt.setTransformationMethod(
                        HideReturnsTransformationMethod.getInstance()
                    )
                    showPassword = true
                    viewDataBinding!!.passwordEt.setCompoundDrawablesWithIntrinsicBounds(
                        0,
                        0,
                        R.mipmap.ic_eye,
                        0
                    )
                }
            }
            false
        }

        viewDataBinding!!.confirmPasswordEt.setOnTouchListener { v, event ->
            val right = 2
            if ((event.action == MotionEvent.ACTION_UP) && event.rawX >= viewDataBinding!!.confirmPasswordEt.right - viewDataBinding!!.confirmPasswordEt.compoundDrawables.get(
                    right
                ).bounds.width()
            ) {
                if (showConfirmPassword) {
                    viewDataBinding!!.confirmPasswordEt.setTransformationMethod(
                        PasswordTransformationMethod.getInstance()
                    )
                    showConfirmPassword = false
                    viewDataBinding!!.confirmPasswordEt.setCompoundDrawablesWithIntrinsicBounds(
                        0,
                        0,
                        R.mipmap.ic_hide_password,
                        0
                    )
                } else {
                    viewDataBinding!!.confirmPasswordEt.setTransformationMethod(
                        HideReturnsTransformationMethod.getInstance()
                    )
                    showConfirmPassword = true
                    viewDataBinding!!.confirmPasswordEt.setCompoundDrawablesWithIntrinsicBounds(
                        0,
                        0,
                        R.mipmap.ic_eye,
                        0
                    )
                }
            }
            false
        }
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is called when click on confirm button
     */
    override fun proceed() {
        if (mResetPasswordViewModel.passwordValidation(viewDataBinding!!) && checkIfInternetOn()) {
            mResetPasswordViewModel.resetPasswordAPI(
                AppPreference.getInstance(this),
                userId,
                email,
                countryCode,
                phoneNumber,
                otpStr
            )
        }
    }

    override fun backToLogin() {
        CommonUtils.clearAllActivity(this, LoginActivity::class.java)
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun passwordChangedSuccess(response: ResetPasswordResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            response.message,
            ItemEventListener()
        )
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
        showProgressDialog(this@ResetPasswordActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@ResetPasswordActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            CommonUtils.clearAllActivity(this@ResetPasswordActivity, LoginActivity::class.java)
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
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@ResetPasswordActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun onBackPressed() {
        // This method is called when click on back button
    }
}