package com.monayuser.ui.changepassword

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
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.ChangePasswordResponse
import com.monayuser.databinding.ActivityChangePasswordBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to reset new password
 */

class ChangePasswordActivity :
    BaseActivity<ActivityChangePasswordBinding, ChangePasswordViewModel>(),
    ChangePasswordNavigator {
    var mChangePasswordViewModel: ChangePasswordViewModel = ChangePasswordViewModel()
    override val viewModel: ChangePasswordViewModel get() = mChangePasswordViewModel
    private var showPassword = false
    private var showConfirmPassword = false
    private var showOldPassword = false
    override val bindingVariable: Int get() = BR.changePasswordVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_change_password

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@ChangePasswordActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mChangePasswordViewModel.navigator = this
        mChangePasswordViewModel.initView()
        mChangePasswordViewModel.user.value = LoginBean()
    }

    /**
     * This method is called when click on update button.
     */
    override fun proceed() {
        if (mChangePasswordViewModel.validateFields(viewDataBinding!!) && checkIfInternetOn()) {
            mChangePasswordViewModel.callChangePasswordAPi(AppPreference.getInstance(this))
        }
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        oldPasswordListener()
        newPasswordListener()
        confirmPasswordListener()
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun confirmPasswordListener() {
        viewDataBinding!!.confirmPasswordEt.setOnTouchListener { v, event ->
            val right = 2
            if (event.action == MotionEvent.ACTION_UP && (event.rawX >= viewDataBinding!!.confirmPasswordEt.right - viewDataBinding!!.confirmPasswordEt.compoundDrawables.get(right).bounds.width())) {
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

    @SuppressLint("ClickableViewAccessibility")
    private fun newPasswordListener() {
        viewDataBinding!!.newPasswordEt.setOnTouchListener { v, event ->
            val right = 2
            if (event.action == MotionEvent.ACTION_UP && (event.rawX >= viewDataBinding!!.newPasswordEt.right - viewDataBinding!!.newPasswordEt.compoundDrawables.get(right).bounds.width())) {
                    if (showPassword) {
                        viewDataBinding!!.newPasswordEt.setTransformationMethod(
                            PasswordTransformationMethod.getInstance()
                        )
                        showPassword = false
                        viewDataBinding!!.newPasswordEt.setCompoundDrawablesWithIntrinsicBounds(
                            0,
                            0,
                            R.mipmap.ic_hide_password,
                            0
                        )
                    } else {
                        viewDataBinding!!.newPasswordEt.setTransformationMethod(
                            HideReturnsTransformationMethod.getInstance()
                        )
                        showPassword = true
                        viewDataBinding!!.newPasswordEt.setCompoundDrawablesWithIntrinsicBounds(
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

    @SuppressLint("ClickableViewAccessibility")
    private fun oldPasswordListener() {
        viewDataBinding!!.oldPasswordEt.setOnTouchListener { v, event ->
            val right = 2
            if (event.action == MotionEvent.ACTION_UP && (event.rawX >= viewDataBinding!!.oldPasswordEt.right - viewDataBinding!!.oldPasswordEt.compoundDrawables.get(right).bounds.width())) {
                    if (showOldPassword) {
                        viewDataBinding!!.oldPasswordEt.setTransformationMethod(
                            PasswordTransformationMethod.getInstance()
                        )
                        showOldPassword = false
                        viewDataBinding!!.oldPasswordEt.setCompoundDrawablesWithIntrinsicBounds(
                            0,
                            0,
                            R.mipmap.ic_hide_password,
                            0
                        )
                    } else {
                        viewDataBinding!!.oldPasswordEt.setTransformationMethod(
                            HideReturnsTransformationMethod.getInstance()
                        )
                        showOldPassword = true
                        viewDataBinding!!.oldPasswordEt.setCompoundDrawablesWithIntrinsicBounds(
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
     * This method is called when click on back button.
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun changePasswordResponse(changePasswordResponse: ChangePasswordResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            changePasswordResponse.message,
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
        showProgressDialog(this@ChangePasswordActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@ChangePasswordActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            finish()
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
        DialogUtils.sessionExpireDialog(this@ChangePasswordActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}