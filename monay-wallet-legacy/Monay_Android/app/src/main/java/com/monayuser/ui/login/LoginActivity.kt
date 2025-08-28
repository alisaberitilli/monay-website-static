package com.monayuser.ui.login

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlertDialog
import android.app.Dialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.telephony.SubscriptionManager
import android.text.*
import android.text.method.HideReturnsTransformationMethod
import android.text.method.LinkMovementMethod
import android.text.method.PasswordTransformationMethod
import android.text.style.ClickableSpan
import android.util.Log
import android.view.*
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.*
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CountryCode
import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.SignInResponse
import com.monayuser.databinding.ActivityLoginBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.login.adapter.CountryListAdapter
import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.ui.otpverify.VerifyOtpActivity
import com.monayuser.ui.setpin.SetMPinActivity
import com.monayuser.ui.termsconditions.TermsConditionsActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_login.*
import kotlinx.android.synthetic.main.dialog_signup.view.*
import zendesk.configurations.Configuration
import zendesk.core.AnonymousIdentity
import zendesk.core.Zendesk
import zendesk.support.Support
import zendesk.support.request.RequestActivity
import zendesk.support.requestlist.RequestListActivity
import java.lang.Exception
import java.util.*

import kotlin.collections.ArrayList

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to login
 */

class LoginActivity : BaseActivity<ActivityLoginBinding, LoginViewModel>(),
    LoginNavigator {

    var mLoginViewModel: LoginViewModel = LoginViewModel()
    override val viewModel: LoginViewModel get() = mLoginViewModel
    private var showPassword = false
    var selectCode: String? = null
    override val bindingVariable: Int get() = BR.loginVM
    private var count: Int = 0
    private var permissionStatus = false
    var numberExists = false
    var countryCodeList=ArrayList<CountryData>()
    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_login

    private var userName: String? = ""
    private var referralCode: String? = ""

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = ContextCompat.getColor(this@LoginActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)
        mLoginViewModel.navigator = this

        if (!AppPreference.getInstance(this).getValue(PreferenceKeys.COUNTRY_NAME_CODE).equals(""))
            viewDataBinding!!.ccp.setCountryForNameCode(
                AppPreference.getInstance(context!!).getValue(PreferenceKeys.COUNTRY_NAME_CODE)
            )
        // viewDataBinding!!.countryCodeTv.text=AppPreference.getInstance(context!!).getValue(PreferenceKeys.COUNTRY_NAME_CODE)
        mLoginViewModel.initView()
        viewModel.user.value = LoginBean()

        Zendesk.INSTANCE.init(
            this, getString(R.string.zendesk_url),
            getString(R.string.zendesk_application_id),
            getString(R.string.zendesk_client_id)
        )

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

    private fun startSmsUserConsent() {
        try {
            SmsRetriever.getClient(this).startSmsUserConsent(null)
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
    }

    override fun onResume() {
        mIsInForegroundMode = false
        super.onResume()
    }

    override fun getCountryCodeList(countryCode: ArrayList<CountryData>) {
        countryCodeList.clear()
        countryCodeList.addAll(countryCode)
        // countryListAdapter!!.notifyDataSetChanged()
        viewDataBinding!!.countryCodeTv.setText(countryCode[0].countryCallingCode)

    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        permissionStatus = true
        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        val mobileStr = mobile_number_et.getText().toString()
        val emailStr = email_et.getText().toString()
        if (count == 0) {
            if (mobileStr == "") {
                mLoginViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_mobile_number))
            } else {
                hideKeyboard()
                if (mLoginViewModel.checkMobilePassword(
                        viewDataBinding!!,
                        selectCode
                    ) && checkIfInternetOn()
                ) {
                    mLoginViewModel.loginAPI(AppPreference.getInstance(this), this@LoginActivity)
                }
            }
        } else if (emailStr == "") {
            mLoginViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_email))
        } else {
            hideKeyboard()
            if (mLoginViewModel.checkEmailPassword(
                    viewDataBinding!!,
                    selectCode
                ) && checkIfInternetOn()
            ) {
                mLoginViewModel.loginAPI(AppPreference.getInstance(this), this@LoginActivity)
            }
        }
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        permissionStatus = false

        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        val mobileStr = mobile_number_et.getText().toString()
        val emailStr = email_et.getText().toString()
        if (count == 0) {
            if (mobileStr == "") {
                mLoginViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_mobile_number))
            } else {
                hideKeyboard()
                if (mLoginViewModel.checkMobilePassword(
                        viewDataBinding!!,
                        selectCode
                    ) && checkIfInternetOn()
                ) {
                    mLoginViewModel.loginAPI(AppPreference.getInstance(this), this@LoginActivity)
                }
            }
        } else if (emailStr == "") {
            mLoginViewModel.navigator!!.showValidationError(getStringResource(
                R.string.validation_email))
        } else {
            hideKeyboard()
            if (mLoginViewModel.checkEmailPassword(
                    viewDataBinding!!,
                    selectCode
                ) && checkIfInternetOn()
            ) {
                mLoginViewModel.loginAPI(AppPreference.getInstance(this), this@LoginActivity)
            }
        }
    }

    /**
     * This method is called when click on proceed button.
     */
    override fun proceed() {
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
//            checkPermission(
//                this,
//                *CommonUtils.CONTACTS_READS_AND_WRITE_PERMISSION
//            )
//        } else {
        permissionStatus = true
        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        val mobileStr = mobile_number_et.getText().toString()
        val emailStr = email_et.getText().toString()
        if (count == 0) {
            if (mobileStr == "") {
                mLoginViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_mobile_number))
            } else {
                hideKeyboard()
                if (mLoginViewModel.checkMobilePassword(
                        viewDataBinding!!,
                        selectCode
                    ) && checkIfInternetOn()
                ) {
                    mLoginViewModel.loginAPI(
                        AppPreference.getInstance(this),
                        this@LoginActivity
                    )
                }
            }
        } else if (emailStr == "") {
            mLoginViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_email))
        } else {
            hideKeyboard()
            if (mLoginViewModel.checkEmailPassword(
                    viewDataBinding!!,
                    selectCode
                ) && checkIfInternetOn()
            ) {
                mLoginViewModel.loginAPI(
                    AppPreference.getInstance(this),
                    this@LoginActivity
                )
            }
        }
//        }
    }

    override fun getInActiveResponse() {
        val dialog = Dialog(this, R.style.alert_dialog)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.dialog_kyc)
        dialog.window!!.setLayout(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        dialog.setCancelable(false)
        dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
        dialog.setCanceledOnTouchOutside(false)

        val btnOk = dialog.findViewById<View>(R.id.btn_ok) as Button
        val tvMessage = dialog.findViewById<View>(R.id.tv_message) as TextView
        val tvTitle = dialog.findViewById<View>(R.id.tv_title) as TextView
        val tvContact = dialog.findViewById<View>(R.id.tv_contact) as TextView
        val ivCancel = dialog.findViewById<View>(R.id.iv_cross) as ImageView

        tvTitle.text = getString(R.string.app_name)
        tvMessage.text = getString(R.string.block_message)
        btnOk.visibility = View.GONE
        tvContact.visibility = View.VISIBLE
        ivCancel.visibility = View.VISIBLE

        ivCancel.setOnClickListener {
            dialog.dismiss()
        }

        tvContact.setOnClickListener {
            dialog.dismiss()

            if (count == 0) {
                val identity = AnonymousIdentity.Builder()
                    .withNameIdentifier(viewModel.user.value!!.phoneNumber.trim())
                    .build()

                AppPreference.getInstance(this).addValue(
                    PreferenceKeys.LOGIN_WITH_MOBILE,
                    "1"
                )

                Zendesk.INSTANCE.setIdentity(identity)
                Support.INSTANCE.init(Zendesk.INSTANCE);
            } else {
                val identity = AnonymousIdentity.Builder()
                    .withNameIdentifier(viewModel.user.value!!.email.trim()) // email is optional
                    .build()

                AppPreference.getInstance(this).addValue(
                    PreferenceKeys.LOGIN_WITH_MOBILE,
                    "2"
                )

                Zendesk.INSTANCE.setIdentity(identity)
                Support.INSTANCE.init(Zendesk.INSTANCE);
            }

            val requestConfiguration: Configuration =
                RequestActivity.builder() // set its properties
                    .withRequestSubject("Blocked User")
                    .withTags("blocked_user")
                    .config()

            RequestListActivity.builder()
                .show(this, requestConfiguration)
        }
        dialog.show()
    }

    override fun clickOnSignUpButton() {
        showSignUpDialog()
    }

    fun showSignUpDialog() {
        val dialog = BottomSheetDialog(this)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_signup, null)
        bottomSheet.btn_signup.text = getString(R.string.signup_as_user)
        bottomSheet.ll_primary_user.isSelected = true
        bottomSheet.img_user.setImageResource(R.mipmap.ic_user_active)
        AppPreference.getInstance(this).addValue(PreferenceKeys.USER_TYPE, AppConstants.USER_SIGNUP)
        bottomSheet.ic_cross.setOnClickListener { dialog.dismiss() }

        bottomSheet.ll_primary_user.setOnClickListener {

            bottomSheet.ll_primary_user.isSelected = true
            bottomSheet.ll_secondary_user.isSelected = false
            bottomSheet.ll_merchant.isSelected = false

            bottomSheet.img_user.setImageResource(R.mipmap.ic_user_active)
            bottomSheet.img_secondary_user.setImageResource(R.mipmap.ic_user_deactivate)
            bottomSheet.img_merchant.setImageResource(R.mipmap.ic_merchant_deactive)


            AppPreference.getInstance(this)
                .addValue(PreferenceKeys.USER_TYPE, AppConstants.USER_SIGNUP)
            bottomSheet.btn_signup.text = getString(R.string.signup_as_user)
        }

        bottomSheet.ll_secondary_user.setOnClickListener {

            bottomSheet.ll_primary_user.isSelected = false
            bottomSheet.ll_secondary_user.isSelected = true
            bottomSheet.ll_merchant.isSelected = false

            bottomSheet.img_user.setImageResource(R.mipmap.ic_user_deactivate)
            bottomSheet.img_secondary_user.setImageResource(R.mipmap.ic_user_active)
            bottomSheet.img_merchant.setImageResource(R.mipmap.ic_merchant_deactive)


            AppPreference.getInstance(this)
                .addValue(PreferenceKeys.USER_TYPE, AppConstants.SECONDARY_SIGNUP)
            bottomSheet.btn_signup.text = getString(R.string.signup_as_secondary)

        }
        bottomSheet.ll_merchant.setOnClickListener {

            bottomSheet.ll_primary_user.isSelected = false
            bottomSheet.ll_secondary_user.isSelected = false
            bottomSheet.ll_merchant.isSelected = true

            bottomSheet.img_user.setImageResource(R.mipmap.ic_user_deactivate)
            bottomSheet.img_secondary_user.setImageResource(R.mipmap.ic_user_deactivate)
            bottomSheet.img_merchant.setImageResource(R.mipmap.ic_merchant_active)

            AppPreference.getInstance(this)
                .addValue(PreferenceKeys.USER_TYPE, AppConstants.MERCHANT_SIGNUP)
            bottomSheet.btn_signup.text = getString(R.string.signup_as_merchant)

        }

        bottomSheet.btn_signup.setOnClickListener {
            val intent = Intent(this, MobileVerificationActivity::class.java)

            intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
            intent.putExtra(AppConstants.USER_NAME,userName)

            intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.CHOOSE_SIGNUP)
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            dialog.dismiss()
        }

        dialog.setContentView(bottomSheet)
        dialog.show()
    }

    override fun startHomeActivity(signIpResponse: SignInResponse) {
        if (signIpResponse!!.data!!.isMpinSet == true) {
            hideKeyboard()
            if (signIpResponse.data!!.userType.equals(AppConstants.SECONDARY_SIGNUP))
            {
                if (signIpResponse.data!!.parent!!.isEmpty())
                {
                    openSecondaryUserScan(this@LoginActivity)
                }
                else
                {
                    openNavigation(this@LoginActivity)
                }
            }
            else
            {
                openNavigation(this@LoginActivity)
            }

        } else {
            hideKeyboard()
            val intent = Intent(this@LoginActivity, SetMPinActivity::class.java)
            intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.LOGIN)
            startActivity(intent)
            finishAffinity()
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    override fun useEmail() {
        if (count == 0) {
            count = 1
            viewDataBinding!!.mobileLayout.visibility = View.GONE
            viewDataBinding!!.emailLayout.visibility = View.VISIBLE
            viewDataBinding!!.mobileNumberEt.text!!.clear()
            viewDataBinding!!.emailEt.text!!.clear()
            viewDataBinding!!.emailEt.isFocusable = true
            viewDataBinding!!.emailEt.isFocusableInTouchMode = true
            viewDataBinding!!.passwordEt.isFocusable = false
            viewDataBinding!!.useEmailInstead.setText(getString(R.string.use_mobile_instead))

            val slideUp: Animation = AnimationUtils.loadAnimation(this, R.anim.slide_for_in)
            viewDataBinding!!.emailLayout.startAnimation(slideUp)
        } else {
            count = 0
            viewDataBinding!!.emailLayout.visibility = View.GONE
            viewDataBinding!!.mobileLayout.visibility = View.VISIBLE
            viewDataBinding!!.useEmailInstead.setText(R.string.use_email_instead)
            viewDataBinding!!.mobileNumberEt.text!!.clear()
            viewDataBinding!!.emailEt.text!!.clear()
            viewDataBinding!!.mobileNumberEt.requestFocus()
            viewDataBinding!!.mobileNumberEt.setFocusable(true)
            viewDataBinding!!.mobileNumberEt.setFocusableInTouchMode(true)

            val slideUp: Animation = AnimationUtils.loadAnimation(this, R.anim.slide_for_in)
            viewDataBinding!!.mobileLayout.startAnimation(slideUp)
        }
    }

    /**
     * This method is used to initialize an variable.
     */
    @SuppressLint("ClickableViewAccessibility")
    override fun init() {
        // viewDataBinding!!.ccp.showNameCode(false)

        mLoginViewModel.setTermsConditionText()
        val countryCode = resources.getStringArray(R.array.CountryCode)
        if (spinnerLogin != null) {
            val adapter = ArrayAdapter(this@LoginActivity, R.layout.spinner_textview, countryCode)
            spinnerLogin.adapter = adapter
        }
        spinnerLogin.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
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
                // write code to perform some action
            }
        }
        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        viewDataBinding!!.passwordEt.setOnTouchListener { v, event ->
            val right = 2
            if (event.action == MotionEvent.ACTION_UP) {
                viewDataBinding!!.passwordEt.requestFocus()
                viewDataBinding!!.passwordEt.setFocusable(true)
                viewDataBinding!!.passwordEt.setFocusableInTouchMode(true)
                if (event.rawX >= viewDataBinding!!.passwordEt.right - viewDataBinding!!.passwordEt.compoundDrawables.get(
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
            }
            false
        }
        if (CommonUtils.isInternetOn(this)) {
            mLoginViewModel.countryCodeAPI(AppPreference.getInstance(this), this)
        }
        else
        {
            viewDataBinding!!.countryCodeTv.text="+1"
        }


    }

    /**
     * This method is used to open verification screen
     */
    override fun openVerificationActivity(signIpResponse: SignInResponse) {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED && viewModel.user.value!!.phoneNumber != ""
        ) {
            val subscriptionManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                SubscriptionManager.from(this)
            } else {
                TODO("VERSION.SDK_INT < LOLLIPOP_MR1")
            }
            val subsInfoList = subscriptionManager.activeSubscriptionInfoList
            Log.e("Test", "Current list = $subsInfoList")
            for (subscriptionInfo in subsInfoList) {
                val number = subscriptionInfo.number
                if (number.contains(viewModel.user.value!!.phoneNumber.trim())) {
                    numberExists = true
                    Log.e("Test", " Number is  $number")
                }
            }
        }

        if (numberExists) {
            val intent = Intent(this@LoginActivity, VerifyOtpActivity::class.java)
            intent.putExtra("email", viewModel.user.value!!.email)
            intent.putExtra("verify_status", "verify_status")
            intent.putExtra("countryCode", selectCode)
            intent.putExtra("phoneNumber", viewModel.user.value!!.phoneNumber)
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            DialogUtils.dialogWithEvent(
                this,
                resources.getString(R.string.oops),
                signIpResponse.errorBean!!.message!!,
                ItemEventListener()
            )
        }
    }

    override fun agreedTermsFlag() {
        if (mLoginViewModel.agreedTermsCondition) {
            agreed_img.setImageResource(R.mipmap.ic_check_blank)
            mLoginViewModel.agreedTermsCondition = false
        } else {
            agreed_img.setImageResource(R.mipmap.ic_check_fill)
            mLoginViewModel.agreedTermsCondition = true
        }
    }

    /**
     * This method is used to open forgot password screen
     */
    override fun forgotPassword() {
        hideKeyboard()
        openForgotPassword(this@LoginActivity)
    }

    /**
     * This method is used to show terms & condition data
     */
    override fun setTermsConditionText() {
        val termsCondition: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                val intent = Intent(this@LoginActivity, TermsConditionsActivity::class.java)
                intent.putExtra(AppConstants.PN_NAME, getString(R.string.terms_amp_conditions))
                intent.putExtra(AppConstants.COME_FROM, AppConstants.COME_FROM)
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)

                ds.setColor(ContextCompat.getColor(this@LoginActivity, R.color.colorPrimary))
            }
        }
        val privacyPolicy: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                val intent = Intent(this@LoginActivity, TermsConditionsActivity::class.java)
                intent.putExtra(AppConstants.PN_NAME, getString(R.string.privacy_policy_title))
                intent.putExtra(AppConstants.COME_FROM, AppConstants.COME_FROM)
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)

                ds.setColor(ContextCompat.getColor(this@LoginActivity, R.color.colorPrimary))
            }
        }
        val clickableSpan1: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                agreedTermsFlag()
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)

                ds.setColor(ContextCompat.getColor(this@LoginActivity, R.color.dark_black))

            }
        }
        val clickableSpan3: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                // This method is not used for functionality
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)
                ds.setColor(ContextCompat.getColor(this@LoginActivity, R.color.dark_black))
            }
        }

        val firstText = SpannableString(getString(R.string.agreed_text1))
        firstText.setSpan(clickableSpan1, 0, firstText.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)

        val secondText = SpannableString(getString(R.string.agreed_text2))
        secondText.setSpan(termsCondition, 0, secondText.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)

        val thirdText = SpannableString(getString(R.string.agreed_text3))
        thirdText.setSpan(clickableSpan3, 0, thirdText.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)

        val fouthText = SpannableString(getString(R.string.agreed_text4))
        fouthText.setSpan(privacyPolicy, 0, fouthText.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)


        agreed_text.setText(
            TextUtils.concat(
                firstText,
                " ",
                secondText,
                " ",
                thirdText,
                " ",
                fouthText
            )
        )
        agreed_text.setMovementMethod(LinkMovementMethod.getInstance())
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
        showProgressDialog(this@LoginActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@LoginActivity, resources.getString(R.string.oops), error!!, ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            val intent = Intent(this@LoginActivity, VerifyOtpActivity::class.java)
            intent.putExtra("email", viewModel.user.value!!.email)
            intent.putExtra("verify_status", "verify_status")
            intent.putExtra("countryCode", selectCode)
            intent.putExtra("phoneNumber", viewModel.user.value!!.phoneNumber)
            startActivity(intent)
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

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@LoginActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun countryCodeClick() {
        if(!countryCodeList.isEmpty())
        {
            showCountryList()
        }
        else
        {
            if (CommonUtils.isInternetOn(this)) {
                mLoginViewModel.countryCodeAPI(AppPreference.getInstance(this), this)

            }
            else
            {
                viewDataBinding!!.countryCodeTv.text="+1"
            }
        }


    }
    lateinit var countryListAdapter:CountryListAdapter
    private fun showCountryList() {
        try {
            val builder = AlertDialog.Builder(this@LoginActivity)
            val layoutInflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
            val view = layoutInflater.inflate(R.layout.dialog_state_list, null)
            val headerDialogTV = view.findViewById<TextView>(R.id.headerDialogTV)
            val filter = view.findViewById<EditText>(R.id.filter)
            val button2 = view.findViewById<ImageView>(R.id.button2)
            filter.setHint(R.string.search_country_code)
            headerDialogTV.text = getString(R.string.select_phone_code)
            val recyclerStateList: RecyclerView = view.findViewById(R.id.recyclerStateList)
            countryListAdapter = CountryListAdapter(this@LoginActivity, countryCodeList)
            val linearLayoutManager = LinearLayoutManager(this@LoginActivity)
            recyclerStateList.layoutManager = linearLayoutManager
            recyclerStateList.adapter = countryListAdapter
            builder.setView(view)
            val alert = builder.create()
            alert.show()
            countryListAdapter.setOnItemClickListener(object :CountryListAdapter.OnItemClickListener{
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