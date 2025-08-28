package com.monayuser.ui.signup

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.*
import android.text.method.HideReturnsTransformationMethod
import android.text.method.LinkMovementMethod
import android.text.method.PasswordTransformationMethod
import android.text.style.ClickableSpan
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.Window
import android.view.inputmethod.EditorInfo
import androidx.core.content.ContextCompat
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks
import com.monayuser.BR
import com.monayuser.MyApplication
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.SignUpResponse
import com.monayuser.databinding.ActivitySignupBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.setpin.SetMPinActivity
import com.monayuser.ui.termsconditions.TermsConditionsActivity
import com.monayuser.utils.*
import kotlinx.android.synthetic.main.activity_signup.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to reset new password
 */

class SignupActivity : BaseActivity<ActivitySignupBinding, SignupViewModel>(),
    SignupNavigator {

    var mSignupViewModel: SignupViewModel = SignupViewModel()
    override val viewModel: SignupViewModel get() = mSignupViewModel
    private var showPassword = false
    private var showConfirmPassword = false
    var selectCode: String? = null
    var targetstr: String? = null
    private var phoneNumber = ""
    private var countryCode = ""
    override val bindingVariable: Int get() = BR.signupVM
    private var permissionStatus = false

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_signup

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = ContextCompat.getColor(this@SignupActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)

        mSignupViewModel.navigator = this
        mSignupViewModel.initView()
        viewModel.user.value = LoginBean()

      //  initForFireBaseDeepLink()
    }

    override fun onResume() {
        mIsInForegroundMode = false
        super.onResume()
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
            if (mSignupViewModel.validateFields(
                    viewDataBinding!!,
                    selectCode.toString(),
                    targetstr.toString()
                ) && checkIfInternetOn()
            ) {
                mSignupViewModel.signUpAPI(
                    AppPreference.getInstance(this),
                    targetstr.toString(),
                    countryCode,
                    phoneNumber,
                    referralCode!!,
                    this@SignupActivity
                )
            }
//        }
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        permissionStatus = true
        if (mSignupViewModel.validateFields(
                viewDataBinding!!,
                selectCode.toString(),
                targetstr.toString()
            ) && checkIfInternetOn()
        ) {
            mSignupViewModel.signUpAPI(
                AppPreference.getInstance(this),
                targetstr.toString(),
                countryCode,
                phoneNumber,referralCode!!,
                this@SignupActivity
            )
        }
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        permissionStatus = false

        if (mSignupViewModel.validateFields(
                viewDataBinding!!,
                selectCode.toString(),
                targetstr.toString()
            ) && checkIfInternetOn()
        ) {
            mSignupViewModel.signUpAPI(
                AppPreference.getInstance(this),
                targetstr.toString(),
                countryCode,
                phoneNumber,referralCode!!,
                this@SignupActivity
            )
        }
    }

    /**
     * This method is used to click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    private var userName: String? = ""
    private var referralCode: String? = ""

/*    private fun initForFireBaseDeepLink() {
        try {
            if (intent != null) {
                FirebaseDynamicLinks.getInstance().getDynamicLink(intent)
                    .addOnSuccessListener { pendingDynamicLinkData ->
                        if (pendingDynamicLinkData != null) {
                            Log.e(
                                AppConstants.LOG_CAT,
                                "pendingDynamicLinkData : Came after clicking the firebase link onSuccess ==> " + pendingDynamicLinkData.link
                            )
                            try {
                                referralCode = pendingDynamicLinkData.link!!.getQueryParameter(
                                    FirebaseConstants.DEEP_LINK_REFERRAL_CODE
                                )
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                            try {
                                userName =
                                    pendingDynamicLinkData.link!!.getQueryParameter(
                                        FirebaseConstants.DEEP_LINK_USER_NAME
                                    )
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }

                            println("=====referralCode=========>> "+referralCode+"=====userName=====>> "+userName)

                        } else {
                            Log.e(
                                AppConstants.LOG_CAT,
                                "pendingDynamicLinkData : IS NULL Not the case for the Firebase link ==> "
                            )
                        }
                    }.addOnFailureListener { e ->
                        Log.e(
                            AppConstants.LOG_CAT,
                            "getDynamicLink:onFailure$e"
                        )
                    }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }*/

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        mSignupViewModel.setTermsConditionText()

        if (intent != null) {
            try {
                userName = intent.getStringExtra(AppConstants.USER_NAME)!!
                referralCode = intent.getStringExtra(AppConstants.REFERRAL_CODE)!!


            } catch (e: Exception) {

            }
        }

        println("=======userName============="+userName+"==referralCode====="+referralCode)

        if (intent != null) {
            try {
            targetstr = intent.getStringExtra(AppConstants.TARGET_SIGNUP).toString()
            countryCode = intent.getStringExtra(AppConstants.COUNTRY_CODE)!!
            phoneNumber = intent.getStringExtra(AppConstants.PHONE_NUMBER)!!
            if (targetstr.equals(AppConstants.MERCHANT_SIGNUP)) {
                companyNameLayout.visibility = View.VISIBLE
                taxIdLayout.visibility = View.VISIBLE
                registrationLayout.visibility = View.VISIBLE
                viewDataBinding!!.registerNumberEt.setRawInputType(InputType.TYPE_CLASS_TEXT);
                viewDataBinding!!.registerNumberEt.setImeActionLabel(
                    getResources().getString(R.string.done),
                    EditorInfo.IME_ACTION_DONE
                );
                viewDataBinding!!.registerNumberEt.setImeOptions(EditorInfo.IME_ACTION_DONE);

                viewDataBinding!!.tvUser.text = getString(R.string.merchant)
                viewDataBinding!!.tvUser.setCompoundDrawablesRelativeWithIntrinsicBounds(
                    0,
                    R.mipmap.ic_merchant,
                    0,
                    0
                )
            } else if (targetstr.equals(AppConstants.SECONDARY_SIGNUP)) {
                companyNameLayout.visibility = View.GONE
                taxIdLayout.visibility = View.GONE
                registrationLayout.visibility = View.GONE

                if(referralCode!!.isNotEmpty()){
                    referralCodeLayout.visibility = View.GONE // GONE IN EVERY CASE //

                    viewDataBinding!!.referralCodeEt.setText(referralCode)
                   //viewModel.user.value!!.referralCode = referralCode
                }


                viewDataBinding!!.tvUser.text = getString(R.string.secondary_user)
                viewDataBinding!!.tvUser.setCompoundDrawablesRelativeWithIntrinsicBounds(
                    0,
                    R.mipmap.ic_user,
                    0,
                    0
                )
            }
            else {
                companyNameLayout.visibility = View.GONE
                taxIdLayout.visibility = View.GONE
                registrationLayout.visibility = View.GONE

                viewDataBinding!!.tvUser.text = getString(R.string.user)
                viewDataBinding!!.tvUser.setCompoundDrawablesRelativeWithIntrinsicBounds(
                    0,
                    R.mipmap.ic_user,
                    0,
                    0
                )
            }

            }catch (e:Exception){

            }
        }



        passwordTouchListener()

        viewDataBinding!!.emailEt.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(p0: Editable?) {
                //  This method is not used for this functionality
            }

            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                //  This method is not used for this functionality
            }

            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                if (CommonUtils.checkEmailValidation(p0!!.toString().trim())) {
                    viewModel.checkEmailAPI(AppPreference.getInstance(this@SignupActivity))
                } else {
                    if (p2 > viewDataBinding!!.tlEmail.counterMaxLength) {
                        viewDataBinding!!.tlEmail.error = getString(R.string.validation_email_valid)
                    }
                }
            }
        })
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

    override fun emailCheckResponse(status: Boolean, message: String) {
        if (status) {
            viewDataBinding!!.tlEmail.isErrorEnabled = true
            viewDataBinding!!.tlEmail.error = "Email already exist."
        } else {
            viewDataBinding!!.tlEmail.isErrorEnabled = false
        }
    }

    /**
     * This method is used to show terms & condition data
     */
    override fun setTermsConditionText() {
        val termsCondition: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                val intent = Intent(this@SignupActivity, TermsConditionsActivity::class.java)
                intent.putExtra(AppConstants.PN_NAME, getString(R.string.terms_amp_conditions))
                intent.putExtra(AppConstants.COME_FROM, AppConstants.COME_FROM)
                intent.putExtra(AppConstants.TARGET_SIGNUP, targetstr)
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)

                ds.setColor(ContextCompat.getColor(this@SignupActivity, R.color.colorPrimary))
            }
        }
        val privacyPolicy: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                val intent = Intent(this@SignupActivity, TermsConditionsActivity::class.java)
                intent.putExtra(AppConstants.PN_NAME, getString(R.string.privacy_policy_title))
                intent.putExtra(AppConstants.COME_FROM, AppConstants.COME_FROM)
                intent.putExtra(AppConstants.TARGET_SIGNUP, targetstr)
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)
                ds.setColor(ContextCompat.getColor(this@SignupActivity, R.color.colorPrimary))
            }
        }
        val clickableSpan1: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                agreedTermsFlag()
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)
                ds.setColor(ContextCompat.getColor(this@SignupActivity, R.color.dark_black))

            }
        }
        val clickableSpan3: ClickableSpan = object : ClickableSpan() {
            override fun onClick(view: View) {
                //  This method is used when click on spannable text
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.setUnderlineText(false)
                ds.setColor(ContextCompat.getColor(this@SignupActivity, R.color.dark_black))
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

    override fun agreedTermsFlag() {
        if (mSignupViewModel.agreedTermsCondition) {
            agreed_img.setImageResource(R.mipmap.ic_check_blank)
            mSignupViewModel.agreedTermsCondition = false
        } else {
            agreed_img.setImageResource(R.mipmap.ic_check_fill)
            mSignupViewModel.agreedTermsCondition = true
        }

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
        showProgressDialog(this@SignupActivity, resources.getString(R.string.LOADING))
    }

    /**
     * This method is used to open verification screen
     */
    override fun startVerificationActivity(signUpResponse: SignUpResponse) {
        if (signUpResponse!!.data!!.isMpinSet == true) {
            hideKeyboard()
            if (signUpResponse.data!!.userType.equals(AppConstants.SECONDARY_SIGNUP))
            {
                if (signUpResponse.data!!.parent!!.isEmpty())
                {
                    openSecondaryUserScan(this@SignupActivity)
                }
                else
                {
                    openNavigation(this@SignupActivity)
                }
            }
            else
            {
                openNavigation(this@SignupActivity)
            }

        } else {
            hideKeyboard()
            val intent = Intent(this@SignupActivity, SetMPinActivity::class.java)
            intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.LOGIN)
            startActivity(intent)
            finishAffinity()
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SignupActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }


    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            openLogin(this@SignupActivity)
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
        DialogUtils.sessionExpireDialog(this@SignupActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is used to open login screen
     */
    override fun login() {
        finish()
    }

    fun  checkNameIsBlank(): Boolean{
        return viewDataBinding!!.emailEt.text.toString().isNullOrEmpty()
    }
    fun  checkNameIsBlankNull(): Boolean{
        return CommonUtils.isEmailValid(viewDataBinding!!.emailEt.text.toString())
    }

}