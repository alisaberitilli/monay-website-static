package com.monayuser.ui.mobileverification

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.telephony.SubscriptionManager
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.*
import androidx.core.content.ContextCompat
import androidx.core.view.marginTop
import androidx.core.view.updateLayoutParams
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CountryCode
import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.response.ForgotPinResponse
import com.monayuser.data.model.response.SendOtpResponse
import com.monayuser.data.model.response.UpdateEmailResponse
import com.monayuser.data.model.response.UpdateNumberResponse
import com.monayuser.databinding.ActivityMobileVerifyBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.login.adapter.CountryListAdapter
import com.monayuser.ui.otpverify.VerifyOtpActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_mobile_verify.*
import java.lang.Exception
import java.util.*
import kotlin.collections.ArrayList


class MobileVerificationActivity :
    BaseActivity<ActivityMobileVerifyBinding, MobileVerificationViewModel>(),
    MobileVerificationNavigator {

    var mobileVerificationViewModel: MobileVerificationViewModel = MobileVerificationViewModel()
    override val bindingVariable: Int get() = BR.mobileVerifyVM
    override val layoutId: Int get() = R.layout.activity_mobile_verify
    override val viewModel: MobileVerificationViewModel get() = mobileVerificationViewModel
    var selectCode: String? = null
    var screenFrom: String? = ""
    var count: Int = 0
    var mobileStr: String? = ""
    var emailStr: String? = ""
    var userId: String? = ""
    var changeStatus: String? = ""
    var numberExists = false
    var reason = "VERSION.SDK_INT < LOLLIPOP_MR1"
    var countryCodeList=ArrayList<CountryData>()

    private var userName: String? = ""
    private var referralCode: String? = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@MobileVerificationActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mobileVerificationViewModel.navigator = this

        if (!AppPreference.getInstance(this).getValue(PreferenceKeys.COUNTRY_NAME_CODE).equals(""))
            viewDataBinding!!.ccp.setCountryForNameCode(AppPreference.getInstance(context!!).getValue(PreferenceKeys.COUNTRY_NAME_CODE))

        mobileVerificationViewModel.initView()

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

    override fun onResume() {
        if (screenFrom.equals(AppConstants.CHOOSE_SIGNUP)) {
            mIsInForegroundMode = false
        }
        super.onResume()
    }

    override fun init() {
        if (intent != null) {
            screenFrom = intent.getStringExtra(AppConstants.SCREEN_FROM);
        }
        if (screenFrom.toString().equals("SecuritySetup")) {
            viewDataBinding!!.headerLayout.visibility = View.VISIBLE
            viewDataBinding!!.mVerifyLogo.visibility = View.GONE
            viewDataBinding!!.mobileHeaderText.visibility = View.VISIBLE
            viewDataBinding!!.mobileHeaderText.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.forget_pin)
            viewDataBinding!!.mVerifyText.text = getString(R.string.forgot_monay_pin)
            viewDataBinding!!.mVerifyMobileTxt.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.enter_registered_mobile_number_verification)
            viewDataBinding!!.sendBtn.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.send_code)
            viewDataBinding!!.viewLine.visibility = View.GONE
            viewDataBinding!!.useEmailInstead.visibility = View.VISIBLE
        } else if (screenFrom.toString().equals("PayMoney") || screenFrom.toString().equals(getString(R.string.screen_auto_topup))) {
            viewDataBinding!!.headerLayout.visibility = View.VISIBLE
            viewDataBinding!!.mVerifyLogo.visibility = View.GONE
            viewDataBinding!!.mobileHeaderText.text = getString(R.string.forgot_pin_txt)
            viewDataBinding!!.mVerifyText.text = getString(R.string.forgot_pin_txt)
            viewDataBinding!!.mVerifyMobileTxt.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.enter_registered_mobile_number_verification)
            viewDataBinding!!.sendBtn.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.send_otp)
            viewDataBinding!!.viewLine.visibility = View.GONE
            viewDataBinding!!.useEmailInstead.visibility = View.VISIBLE
        }
        else if (screenFrom.toString().equals(AppConstants.PAY_MONEY_SECONDARY)) {
            viewDataBinding!!.headerLayout.visibility = View.VISIBLE
            viewDataBinding!!.mVerifyLogo.visibility = View.GONE
            viewDataBinding!!.mobileHeaderText.text = getString(R.string.forgot_pin_txt)
            viewDataBinding!!.mVerifyText.text = getString(R.string.forgot_pin_txt)
            viewDataBinding!!.mVerifyMobileTxt.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.enter_registered_mobile_number_verification)
            viewDataBinding!!.sendBtn.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.send_otp)
            viewDataBinding!!.viewLine.visibility = View.GONE
            viewDataBinding!!.useEmailInstead.visibility = View.VISIBLE
        }else if (screenFrom.toString().equals(AppConstants.EDIT_PROFILE)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.statusBarColor =
                    ContextCompat.getColor(this@MobileVerificationActivity, R.color.colorPrimary)
            }
            changeStatus = intent.getStringExtra("STATUS");
            /**
             * comment for future changes if need
             */
            if (changeStatus.equals("ChangeNumber")) {
                viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                viewDataBinding!!.mVerifyLogo.visibility = View.VISIBLE
                viewDataBinding!!.mobileHeaderText.text = getString(R.string.change_mobile_number)
                viewDataBinding!!.mVerifyText.text = getString(R.string.change_mobile_number)
                viewDataBinding!!.mVerifyMobileTxt.text =
                    mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.enter_new_mobile_number)
                viewDataBinding!!.sendBtn.text =
                    mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.send_code)
                viewDataBinding!!.viewLine.visibility = View.GONE
                viewDataBinding!!.useEmailInstead.visibility = View.GONE
            } else {
                viewDataBinding!!.mobileLayout.visibility = View.GONE
                viewDataBinding!!.verifyEmailLayout.visibility = View.VISIBLE
                viewDataBinding!!.headerLayout.visibility = View.VISIBLE
                viewDataBinding!!.mVerifyLogo.visibility = View.VISIBLE
                viewDataBinding!!.mobileHeaderText.text = resources.getString(R.string.change_email)
                viewDataBinding!!.mVerifyText.text = resources.getString(R.string.change_email)
                viewDataBinding!!.mVerifyMobileTxt.text = getString(R.string.enter_new_email)
                viewDataBinding!!.sendBtn.text =
                    mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.send_code)
                viewDataBinding!!.viewLine.visibility = View.GONE
                viewDataBinding!!.useEmailInstead.visibility = View.GONE
            }

        } else if (screenFrom.toString().equals(AppConstants.CHOOSE_SIGNUP)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.statusBarColor =
                    ContextCompat.getColor(this@MobileVerificationActivity, R.color.white)
            }
            viewDataBinding!!.backToLogin.visibility = View.VISIBLE
            viewDataBinding!!.headerLayout.visibility = View.VISIBLE
            viewDataBinding!!.headerLayout.setBackgroundColor(resources.getColor(R.color.white));
            viewDataBinding!!.mVerifyLogo.visibility = View.VISIBLE
            viewDataBinding!!.mVerifyLogo.updateLayoutParams<ViewGroup.MarginLayoutParams> {
                setMargins(0, 30, 0, 0)
            }
            viewDataBinding!!.mVerifyText.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.mobile_verification)
            viewDataBinding!!.mVerifyMobileTxt.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.please_enter_your_mobile_number_to_verify_your_account)
            viewDataBinding!!.sendBtn.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.send)
            viewDataBinding!!.viewLine.visibility = View.GONE
            viewDataBinding!!.backButton.visibility = View.GONE
            viewDataBinding!!.mobileHeaderText.visibility = View.GONE
            viewDataBinding!!.useEmailInstead.visibility = View.GONE
        } else {
            viewDataBinding!!.headerLayout.visibility = View.GONE
            viewDataBinding!!.mVerifyLogo.visibility = View.VISIBLE
            viewDataBinding!!.mVerifyText.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.mobile_verification)
            viewDataBinding!!.mVerifyMobileTxt.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.please_enter_your_mobile_number_to_verify_your_account)
            viewDataBinding!!.sendBtn.text =
                mobileVerificationViewModel!!.navigator!!.getStringResource(R.string.send)
            viewDataBinding!!.viewLine.visibility = View.GONE
            viewDataBinding!!.useEmailInstead.visibility = View.GONE

        }
        val countryCode = resources.getStringArray(R.array.CountryCode)
        if (spinnerMobileVerify != null) {
            val adapter = ArrayAdapter(
                this@MobileVerificationActivity,
                R.layout.spinner_textview,
                countryCode
            )
            spinnerMobileVerify.adapter = adapter
        }
        spinnerMobileVerify.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View,
                position: Int,
                id: Long
            ) {
                selectCode = countryCode[position]
                (view as TextView).setTextColor(Color.BLACK)
            }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // This method is called when nothing is selected
            }
        }

        viewDataBinding!!.ccp.showNameCode(false)
        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        if (CommonUtils.isInternetOn(this)) {
            mobileVerificationViewModel.countryCodeAPI(AppPreference.getInstance(this), this)
        }
        else
        {
            viewDataBinding!!.countryCodeTv.text="+1"
        }
    }

    override fun useEmail() {
        if (count == 0) {
            count = 1
            viewDataBinding!!.mobileLayout.visibility = View.GONE
            viewDataBinding!!.verifyEmailLayout.visibility = View.VISIBLE
            viewDataBinding!!.mobileNumberEt.text!!.clear()
            viewDataBinding!!.verifyEmailEt.text!!.clear()
            viewDataBinding!!.verifyEmailEt.requestFocus()
            viewDataBinding!!.verifyEmailEt.setFocusable(true)
            viewDataBinding!!.verifyEmailEt.setFocusableInTouchMode(true)
            viewDataBinding!!.useEmailInstead.setText(getString(R.string.use_mobile_instead))
            val slideUp: Animation = AnimationUtils.loadAnimation(this, R.anim.slide_for_in)
            viewDataBinding!!.verifyEmailLayout.startAnimation(slideUp)
        } else {
            count = 0
            viewDataBinding!!.verifyEmailLayout.visibility = View.GONE
            viewDataBinding!!.mobileLayout.visibility = View.VISIBLE
            viewDataBinding!!.useEmailInstead.setText(R.string.use_email_instead)
            viewDataBinding!!.mobileNumberEt.text!!.clear()
            viewDataBinding!!.verifyEmailEt.text!!.clear()
            viewDataBinding!!.mobileNumberEt.requestFocus()
            viewDataBinding!!.mobileNumberEt.setFocusable(true)
            viewDataBinding!!.mobileNumberEt.setFocusableInTouchMode(true)
            val slideUp: Animation = AnimationUtils.loadAnimation(this, R.anim.slide_for_in)
            viewDataBinding!!.mobileLayout.startAnimation(slideUp)
        }

    }
    override fun getCountryCodeList(countryCode: ArrayList<CountryData>) {
        countryCodeList.clear()
        countryCodeList.addAll(countryCode)
        // countryListAdapter!!.notifyDataSetChanged()
        viewDataBinding!!.countryCodeTv.setText(countryCode[0].countryCallingCode)
    }
    override fun proceed() {
        hideKeyboard()
        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        var userType: String =
            AppPreference.getInstance(this).getValue(PreferenceKeys.USER_TYPE).toString()

        when (screenFrom) {
            "SecuritySetup", "PayMoney",AppConstants.PAY_MONEY_SECONDARY -> {
                conditionForSecurityMoney(userType)
            }
            AppConstants.CHOOSE_SIGNUP -> {
                if (mobileVerificationViewModel.checkMobile(
                        viewDataBinding!!,
                        selectCode
                    ) && checkIfInternetOn()
                ) {
                    mobileVerificationViewModel.mobileVerifyAPI(
                        AppPreference.getInstance(this),
                        userType
                    )
                }
            }
            AppConstants.EDIT_PROFILE -> {
                if (changeStatus.equals("ChangeNumber")) {
                    if (mobileVerificationViewModel.checkMobile(
                            viewDataBinding!!,
                            selectCode
                        ) && checkIfInternetOn()
                    ) {
                        mobileVerificationViewModel.updateNumberAPI(AppPreference.getInstance(this))
                    }
                } else {
                    if (mobileVerificationViewModel.checkEmail(
                            viewDataBinding!!,
                            selectCode
                        ) && checkIfInternetOn()
                    ) {
                        mobileVerificationViewModel.updateEmailAPI(
                            AppPreference.getInstance(this)
                        )
                    }
                }
            }
            else -> {
                mobileVerificationViewModel.forgotPinAPI(
                    AppPreference.getInstance(this),
                    userType
                )
            }
        }
    }

    private fun conditionForSecurityMoney(userType: String) {
        mobileStr = viewDataBinding!!.mobileNumberEt.text.toString()
        emailStr = viewDataBinding!!.verifyEmailEt.text.toString()
        if (count == 0) {
            if (mobileStr == "") {
                mobileVerificationViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_mobile_number))
            } else {
                hideKeyboard()
                if (mobileVerificationViewModel.checkMobile(
                        viewDataBinding!!,
                        selectCode
                    ) && checkIfInternetOn()
                ) {
                    mobileVerificationViewModel.forgotPinAPI(
                        AppPreference.getInstance(this),
                        userType
                    )
                }
            }
        } else {
            if (emailStr == "") {
                mobileVerificationViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_email))
            } else {
                hideKeyboard()
                if (mobileVerificationViewModel.checkEmail(
                        viewDataBinding!!,
                        selectCode
                    )
                ) {
                    mobileVerificationViewModel.forgotPinAPI(
                        AppPreference.getInstance(this),
                        userType
                    )
                }
            }
        }
    }

    override fun sendOtpResponse(sendOtpResponse: SendOtpResponse) {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED && mobileStr != "" && count == 0
        ) {
               val subscriptionManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                    SubscriptionManager.from(this)
                } else {
                    TODO(reason)
                }
                val subsInfoList = subscriptionManager.activeSubscriptionInfoList
                Log.e("Test", "Current list = $subsInfoList")
                for (subscriptionInfo in subsInfoList) {
                    val number = subscriptionInfo.number
                    if (number.contains(mobileStr!!.trim())) {
                        numberExists = true
                        Log.e("Test", " Number is  $number")
                    }
                }
        }

        if (numberExists) {
            hideKeyboard()
            val intent = Intent(this@MobileVerificationActivity, VerifyOtpActivity::class.java)
            intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
            intent.putExtra(AppConstants.USER_NAME,userName)
            intent.putExtra("verify_status", "verify_status")
            intent.putExtra(AppConstants.SCREEN_FROM, screenFrom)
            intent.putExtra(
                AppConstants.EMAIL,
                viewDataBinding!!.verifyEmailEt.text!!.trim().toString()
            )
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(
                AppConstants.PHONE_NUMBER,
                viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
            )
            startActivityForResult(intent, 201)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            DialogUtils.dialogWithEvent(
                this, resources.getString(R.string.oops),
                sendOtpResponse.message, ItemEventListener()
            )
        }
    }


    override fun forgotPinResponse(forgotPinResponse: ForgotPinResponse) {
        if (screenFrom==AppConstants.PAY_MONEY_SECONDARY)
        {
            hideKeyboard()
            val intent = Intent(this@MobileVerificationActivity, VerifyOtpActivity::class.java)
            intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
            intent.putExtra(AppConstants.USER_NAME,userName)
            intent.putExtra("verify_status", "verify_status")
            intent.putExtra(AppConstants.SCREEN_FROM, screenFrom)
            intent.putExtra(
                AppConstants.EMAIL,
                viewDataBinding!!.verifyEmailEt.text!!.trim().toString()
            )
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(
                AppConstants.PHONE_NUMBER,
                viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
            )
            startActivityForResult(intent, 201)

            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
        else
        {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.READ_PHONE_STATE
                ) == PackageManager.PERMISSION_GRANTED && mobileStr != "" && count == 0
            ) {
                val subscriptionManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                    SubscriptionManager.from(this)
                } else {
                    TODO(reason)
                }
                val subsInfoList = subscriptionManager.activeSubscriptionInfoList
                Log.e("Test", "Current list = $subsInfoList")
                for (subscriptionInfo in subsInfoList) {
                    val number = subscriptionInfo.number
                    if (number.contains(mobileStr!!.trim())) {
                        numberExists = true
                        Log.e("Test", " Number is  $number")
                    }
                }
            }

            if (numberExists) {
                hideKeyboard()
                val intent = Intent(this@MobileVerificationActivity, VerifyOtpActivity::class.java)
                intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
                intent.putExtra(AppConstants.USER_NAME,userName)
                intent.putExtra("verify_status", "verify_status")
                intent.putExtra(AppConstants.SCREEN_FROM, screenFrom)
                intent.putExtra(
                    AppConstants.EMAIL,
                    viewDataBinding!!.verifyEmailEt.text!!.trim().toString()
                )
                intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
                intent.putExtra(
                    AppConstants.PHONE_NUMBER,
                    viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
                )
                startActivityForResult(intent, 201)

                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            } else {
                DialogUtils.dialogWithEvent(
                    this, resources.getString(R.string.oops),
                    forgotPinResponse.message, ItemEventListener()
                )
            }
        }

    }

    override fun updateNumber(updateNumberResponse: UpdateNumberResponse) {
            if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED && mobileStr != "" && count == 0
        ) {
                val subscriptionManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                    SubscriptionManager.from(this)
                } else {
                    TODO(reason)
                }
                val subsInfoList = subscriptionManager.activeSubscriptionInfoList
                Log.e("Test", "Current list = $subsInfoList")
                for (subscriptionInfo in subsInfoList) {
                    val number = subscriptionInfo.number
                    if (number.contains(mobileStr!!.trim())) {
                        numberExists = true
                        Log.e("Test", " Number is  $number")
                    }
                }
        }

        if (numberExists) {
            hideKeyboard()
            val intent = Intent(this@MobileVerificationActivity, VerifyOtpActivity::class.java)
            intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
            intent.putExtra(AppConstants.USER_NAME,userName)

            intent.putExtra("verify_status", "verify_status")
            intent.putExtra(AppConstants.SCREEN_FROM, screenFrom)
            intent.putExtra(
                AppConstants.EMAIL,
                viewDataBinding!!.verifyEmailEt.text!!.trim().toString()
            )
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(
                AppConstants.PHONE_NUMBER,
                viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
            )
            startActivityForResult(intent, 201)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            DialogUtils.dialogWithEvent(
                this, resources.getString(R.string.oops),
                updateNumberResponse.message, ItemEventListener()
            )
        }
    }

    override fun updateEmail(emailResponse: UpdateEmailResponse) {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED && mobileStr != "" && count == 0
        ) {
            val subscriptionManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                SubscriptionManager.from(this)
            } else {
                TODO(reason)
            }
                val subsInfoList = subscriptionManager.activeSubscriptionInfoList
                Log.e("Test", "Current list = $subsInfoList")
                for (subscriptionInfo in subsInfoList) {
                    val number = subscriptionInfo.number
                    if (number.contains(mobileStr!!.trim())) {
                        numberExists = true
                        Log.e("Test", " Number is  $number")
                    }
                }
        }

        if (numberExists) {
            hideKeyboard()
            val intent = Intent(this@MobileVerificationActivity, VerifyOtpActivity::class.java)

            intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
            intent.putExtra(AppConstants.USER_NAME,userName)

            intent.putExtra("verify_status", "verify_status")
            intent.putExtra(AppConstants.SCREEN_FROM, screenFrom)
            intent.putExtra(
                AppConstants.EMAIL,
                viewDataBinding!!.verifyEmailEt.text!!.trim().toString()
            )
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(
                AppConstants.PHONE_NUMBER,
                viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
            )
            startActivityForResult(intent, 201)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            DialogUtils.dialogWithEvent(
                this, resources.getString(R.string.oops),
                emailResponse.message, ItemEventListener()
            )
        }
    }

    override fun backToLogin() {
        finish()
    }


    override fun backToPreviousScreen() {
        finish()
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    private fun startSmsUserConsent() {
        try {
           SmsRetriever.getClient(this).startSmsUserConsent(null)
        }catch (e:java.lang.Exception){
            e.printStackTrace()
        }
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            hideKeyboard()
            val intent = Intent(this@MobileVerificationActivity, VerifyOtpActivity::class.java)

            intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
            intent.putExtra(AppConstants.USER_NAME,userName)

            intent.putExtra("verify_status", "verify_status")
            intent.putExtra(AppConstants.SCREEN_FROM, screenFrom)
            intent.putExtra(
                AppConstants.EMAIL,
                viewDataBinding!!.verifyEmailEt.text!!.trim().toString()
            )
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(
                AppConstants.PHONE_NUMBER,
                viewDataBinding!!.mobileNumberEt.text!!.trim().toString()
            )
            startActivityForResult(intent, 201)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
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

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 201 && resultCode == Activity.RESULT_OK) {
                setResult(Activity.RESULT_OK)
                finish()
        }
    }

    override fun countryCodeClick() {
        if(!countryCodeList.isEmpty())
        {
            showCountryList()
        }
        else
        {
            if (CommonUtils.isInternetOn(this)) {
                mobileVerificationViewModel.countryCodeAPI(AppPreference.getInstance(this), this)

            }
            else
            {
                viewDataBinding!!.countryCodeTv.text="+1"
            }
        }
    }

    lateinit var countryListAdapter: CountryListAdapter
    private fun showCountryList() {
        try {
            val builder = AlertDialog.Builder(this@MobileVerificationActivity)
            val layoutInflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
            val view = layoutInflater.inflate(R.layout.dialog_state_list, null)
            val headerDialogTV = view.findViewById<TextView>(R.id.headerDialogTV)
            val filter = view.findViewById<EditText>(R.id.filter)
            val button2 = view.findViewById<ImageView>(R.id.button2)
            filter.setHint(R.string.search_country_code)
            headerDialogTV.text = getString(R.string.select_phone_code)
            val recyclerStateList: RecyclerView = view.findViewById(R.id.recyclerStateList)
            countryListAdapter = CountryListAdapter(this@MobileVerificationActivity, countryCodeList)
            val linearLayoutManager = LinearLayoutManager(this@MobileVerificationActivity)
            recyclerStateList.layoutManager = linearLayoutManager
            recyclerStateList.adapter = countryListAdapter
            builder.setView(view)
            val alert = builder.create()
            alert.show()
            countryListAdapter.setOnItemClickListener(object : CountryListAdapter.OnItemClickListener{
                override fun onItemClicked(view: View, countryCode: CountryData) {
                    viewDataBinding!!.countryCodeTv.setText(countryCode.countryCallingCode)
                    alert.dismiss()
                }
            })

            filter.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    s: CharSequence,
                    start: Int,
                    count: Int,
                    after: Int
                ) {
                }
                override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {}

                override fun afterTextChanged(s: Editable) {
                    countryListAdapter.updateList(filterCategory(s!!.toString().toLowerCase(Locale.getDefault()),countryCodeList))
                }
            })
            button2.setOnClickListener { alert.dismiss() }
        } catch (ex: Exception) {
            ex.printStackTrace()
        }
    }

    fun filterCategory(text: String,countryModelArrayList: List<CountryData>): ArrayList<CountryData> {
        val temp: ArrayList<CountryData> = ArrayList()
        for (countryModel in countryModelArrayList) {
//            if (countryModel.name!!.toLowerCase(Locale.getDefault()).contains(text!!)) {
//                temp.add(countryModel)
//            } else if (countryModel.phonecode!!.contains(text!!)) {
//                temp.add(countryModel)
//            }
        }
        return temp
    }
}