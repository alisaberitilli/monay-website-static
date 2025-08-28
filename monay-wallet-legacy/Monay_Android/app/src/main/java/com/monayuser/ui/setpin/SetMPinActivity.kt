package com.monayuser.ui.setpin

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import androidx.core.content.ContextCompat
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetBehavior.BottomSheetCallback
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.response.ChangePinResponse
import com.monayuser.data.model.response.MPinResponse
import com.monayuser.data.model.response.ResetPinResponse
import com.monayuser.databinding.ActivityMpinLayoutBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import com.monayuser.utils.PinView
import kotlinx.android.synthetic.main.activity_mpin_layout.*
import kotlinx.android.synthetic.main.dialog_setpin.view.*


class SetMPinActivity : BaseActivity<ActivityMpinLayoutBinding, MPinViewModel>(), MPinNavigator {

    val mMPinViewModel: MPinViewModel = MPinViewModel()
    override val bindingVariable: Int get() = BR.mPinVM
    override val layoutId: Int get() = R.layout.activity_mpin_layout
    override val viewModel: MPinViewModel get() = mMPinViewModel
    lateinit var appPreferences: AppPreference
    var screenFrom: String? = ""
    var countryCode: String? = ""
    var phoneNumber: String? = ""
    var otpStr: String? = ""
    var statusStr: String? = ""
    var emailStr: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@SetMPinActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        appPreferences = AppPreference.getInstance(this)
        mMPinViewModel.navigator = this
        mMPinViewModel.initView()
    }

    override fun init() {
        if (intent != null) {
            screenFrom = intent.getStringExtra(AppConstants.SCREEN_FROM)
            if (screenFrom.equals(AppConstants.LOGIN)) {
                phoneNumber = intent.getStringExtra(AppConstants.PHONE_NUMBER)
                countryCode = intent.getStringExtra(AppConstants.COUNTRY_CODE)
            } else {
                phoneNumber = intent.getStringExtra(AppConstants.PHONE_NUMBER)
                countryCode = intent.getStringExtra(AppConstants.COUNTRY_CODE)
                otpStr = intent.getStringExtra(AppConstants.OTP_STR)
                emailStr = intent.getStringExtra(AppConstants.EMAIL)!!
            }
        }

        if (screenFrom.equals("SecuritySetup")) {
            statusStr = intent.getStringExtra("STATUS")
            if (statusStr.equals("ChangePin")) {
                viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                viewDataBinding!!.mPinLogo.visibility = View.GONE
                viewDataBinding!!.viewLine.visibility = View.GONE
                viewDataBinding!!.setPinHeaderTxt.visibility = View.VISIBLE
                viewDataBinding!!.backToSecurty.visibility = View.GONE
                viewDataBinding!!.setPinHeaderTxt.text =
                    mMPinViewModel!!.navigator!!.getStringResource(R.string.pin)
                viewDataBinding!!.pinTitleText.text = getString(R.string.change_monay_pin)
                viewDataBinding!!.olderPinLayout.visibility = View.VISIBLE
                viewDataBinding!!.oldPinview.visibility = View.VISIBLE
                viewDataBinding!!.olderPinTxt.visibility = View.VISIBLE
                viewDataBinding!!.verifyCodeDesc.text =
                    mMPinViewModel!!.navigator!!.getStringResource(R.string.secure_your_account_txt)
            } else {
                viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                viewDataBinding!!.mPinLogo.visibility = View.GONE
                viewDataBinding!!.viewLine.visibility = View.GONE
                viewDataBinding!!.setPinHeaderTxt.visibility = View.VISIBLE
                viewDataBinding!!.backToSecurty.visibility = View.VISIBLE
                viewDataBinding!!.pinTitleText.text = getString(R.string.reset_mony_pin)
                viewDataBinding!!.setPinHeaderTxt.text =
                    mMPinViewModel!!.navigator!!.getStringResource(R.string.reset_pin)
            }
        } else if (screenFrom.equals("PayMoney")) {
            viewDataBinding!!.headerLayout.visibility = View.VISIBLE
            viewDataBinding!!.mPinLogo.visibility = View.GONE
            viewDataBinding!!.viewLine.visibility = View.VISIBLE
            viewDataBinding!!.setPinHeaderTxt.text = getString(R.string.reset_pin)
            viewDataBinding!!.backToSecurty.visibility = View.GONE
        } else if (screenFrom.equals(AppConstants.LOGIN)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.statusBarColor =
                    ContextCompat.getColor(this@SetMPinActivity, R.color.white)
            }
            viewDataBinding!!.headerLayout.visibility = View.GONE
            viewDataBinding!!.mPinLogo.visibility = View.VISIBLE
            viewDataBinding!!.viewLine.visibility = View.GONE
            viewDataBinding!!.setPinHeaderTxt.text = ""
            viewDataBinding!!.backToSecurty.visibility = View.GONE
            viewDataBinding!!.pinTitleText.text = getString(R.string.set_monay_pin)
            viewDataBinding!!.newPinTxt.text =
                mMPinViewModel!!.navigator!!.getStringResource(R.string.enter_your_pin)
            viewDataBinding!!.confirmNewPinTxt.text =
                mMPinViewModel!!.navigator!!.getStringResource(R.string.confirm_your_pin)
            viewDataBinding!!.verifyCodeDesc.text =
                mMPinViewModel!!.navigator!!.getStringResource(R.string.pin_secure_txt)
        } else {
            viewDataBinding!!.headerLayout.visibility = View.GONE
            viewDataBinding!!.mPinLogo.visibility = View.VISIBLE
            viewDataBinding!!.viewLine.visibility = View.GONE
            viewDataBinding!!.backToSecurty.visibility = View.GONE

        }

        pinview.setTextColor(ContextCompat.getColor(this@SetMPinActivity, R.color.dark_black))
        pinview.setHintTextColor(ContextCompat.getColor(this@SetMPinActivity, R.color.gray_color))
        confirmPinview.setTextColor(
            ContextCompat.getColor(
                this@SetMPinActivity,
                R.color.dark_black
            )
        )
        confirmPinview.setHintTextColor(
            ContextCompat.getColor(
                this@SetMPinActivity,
                R.color.gray_color
            )
        )
        oldPinview.setTextColor(ContextCompat.getColor(this@SetMPinActivity, R.color.dark_black))
        oldPinview.setHintTextColor(
            ContextCompat.getColor(
                this@SetMPinActivity,
                R.color.gray_color
            )
        )
        pinview.showCursor(true)
        confirmPinview.showCursor(true)
        oldPinview.showCursor(true)

        oldPinview.setPinViewEventListener(object : PinView.PinViewEventListener {
            override fun onDataEntered(pinview1: PinView, fromUser: Boolean) {
                //Make api calls here or what not
                pinview.requestFocus()

            }
        })

        pinview.setPinViewEventListener(object : PinView.PinViewEventListener {
            override fun onDataEntered(pin: PinView, fromUser: Boolean) {
                //Make api calls here or what not
                confirmPinview.requestFocus()

            }
        })
    }

    override fun getWrongPinResponse() {
        try {
            if (!viewDataBinding!!.pinview.value.equals("")) {
                viewDataBinding!!.pinview.clearValue()
            }

            if (!viewDataBinding!!.confirmPinview.value.equals("")) {
                viewDataBinding!!.confirmPinview.clearValue()
            }

            if (statusStr.equals("ChangePin")) {
                if (!viewDataBinding!!.oldPinview.value.equals("")) {
                    viewDataBinding!!.oldPinview.clearValue()
                }

                viewDataBinding!!.oldPinview.requestPinEntryFocus()
            } else {
                viewDataBinding!!.pinview.requestPinEntryFocus()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun getWrongChangePinResponse() {
        try {
            if (!viewDataBinding!!.pinview.value.equals("")) {
                viewDataBinding!!.pinview.clearValue()
            }

            if (!viewDataBinding!!.confirmPinview.value.equals("")) {
                viewDataBinding!!.confirmPinview.clearValue()
            }

            viewDataBinding!!.pinview.requestPinEntryFocus()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onResume() {
        if (intent != null && intent.hasExtra(AppConstants.LOGIN)) {
            mIsInForegroundMode = false
        }
        super.onResume()
    }

    override fun setPin() {
        if (statusStr.equals("ChangePin")) {
            if (mMPinViewModel.oldPinValidation(viewDataBinding!!) && checkIfInternetOn()) {
                mMPinViewModel.changeMPinAPI(AppPreference.getInstance(this))
            }
        } else {
            if (checkIfInternetOn()) {
                if (screenFrom.equals(AppConstants.LOGIN)) {
                    if (mMPinViewModel.pinValidationNew(viewDataBinding!!)) {
                        mMPinViewModel.setMPinAPI(AppPreference.getInstance(this))
                    }
                } else {
                    if (mMPinViewModel.pinValidation(viewDataBinding!!)) {
                        if (emailStr != null && !emailStr.equals("")) {
                            mMPinViewModel.resetMPinAPI(
                                AppPreference.getInstance(this),
                                otpStr.toString(),
                                countryCode.toString(),
                                emailStr.toString()
                            )
                        } else {
                            mMPinViewModel.resetMPinAPI(
                                AppPreference.getInstance(this),
                                otpStr.toString(),
                                countryCode.toString(),
                                phoneNumber.toString()
                            )
                        }
                    }
                }
            }
        }

    }

    override fun mPinResponse(mPinResponse: MPinResponse) {
        appPreferences.addBoolean(PreferenceKeys.M_PIN, true)
        showSetPinDialog()
    }

    override fun backToPreviousScreen() {
        finish()
    }

    override fun backToSecurity() {
        setResult(Activity.RESULT_OK)
        finish()
    }

    override fun resetPinResponse(resetPinResponse: ResetPinResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            resetPinResponse.message,
            ItemEventListener()
        )
    }

    override fun changePinResponse(changePinResponse: ChangePinResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            changePinResponse.message,
            ItemEventListener()
        )
    }

    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun showNetworkError(error: String?) {
        // This function is called when network error occurs
    }

    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            if (screenFrom.equals(AppConstants.LOGIN)) {
                appPreferences.addBoolean(PreferenceKeys.M_PIN, true)
            } else if (screenFrom.equals("SecuritySetup")) {
                if (statusStr.equals("ChangePin")) {
                    finish()
                } else {
                    setResult(Activity.RESULT_OK)
                    finish()
                }
            } else {
                setResult(Activity.RESULT_OK)
                finish()
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
    }

    fun showSetPinDialog() {
        viewDataBinding!!.bgLayout.visibility = View.VISIBLE
        val dialog = BottomSheetDialog(this)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_setpin, null)
        dialog.setCanceledOnTouchOutside(false)
        dialog.setCancelable(false)
        bottomSheet.ic_cross.setOnClickListener {
            viewDataBinding!!.bgLayout.visibility = View.GONE
            dialog.dismiss()
        }
        bottomSheet.btn_proceed.setOnClickListener {
            if (appPreferences.getBoolean(PreferenceKeys.M_PIN) == true) {
                if (appPreferences.getValue(PreferenceKeys.USER_TYPE).equals(AppConstants.SECONDARY_SIGNUP)) {
                    if (appPreferences.getBoolean(PreferenceKeys.IS_LINKED) == true) {
                        openNavigation(this)
                    } else {
                        openSecondaryUserScan(this)
                    }
                } else {
                    openNavigation(this)
                }
            }
        }
        dialog.setContentView(bottomSheet)
        val bottomSheetBehavior: BottomSheetBehavior<*> =
            BottomSheetBehavior.from(bottomSheet.getParent() as View)
        bottomSheetBehavior.setBottomSheetCallback(object : BottomSheetCallback() {
            override fun onStateChanged(bottomSheet: View, newState: Int) {
                onBackPressed()
            }

            override fun onSlide(
                bottomSheet: View,
                slideOffset: Float
            ) {
                bottomSheetBehavior.setHideable(false)
            }
        })
        bottomSheetBehavior.setHideable(false)
        dialog.show()
    }
}