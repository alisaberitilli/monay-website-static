package com.monayuser.ui.base

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.inputmethod.InputMethodManager
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityOptionsCompat
import androidx.databinding.DataBindingUtil
import androidx.databinding.ViewDataBinding
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import androidx.lifecycle.ProcessLifecycleOwner
import com.google.firebase.iid.FirebaseInstanceId
import com.monayuser.BuildConfig
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.ui.addmoneyinwallet.AddMoneyActivity
import com.monayuser.ui.changepassword.ChangePasswordActivity
import com.monayuser.ui.editprofile.EditProfileActivity
import com.monayuser.ui.faq.FaqActivity
import com.monayuser.ui.forgotcodeverify.VerifyCodeActivity
import com.monayuser.ui.forgotpassword.ForgotPasswordActivity
import com.monayuser.ui.kyc.KYCActivity
import com.monayuser.ui.kyc.dynamic_kyc.DynamicKYCActivity
import com.monayuser.ui.login.LoginActivity
import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.ui.navigation.NavigationActivity
import com.monayuser.ui.notification.NotificationActivity
import com.monayuser.ui.otpverify.VerifyOtpActivity
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.resetpassword.ResetPasswordActivity
import com.monayuser.ui.scan.ScanActivity
import com.monayuser.ui.secondaryuserlink.SecondaryUserScanActivity
import com.monayuser.ui.setpin.SetMPinActivity
import com.monayuser.ui.setup.SecuritySetupActivity
import com.monayuser.ui.showmycode.ShowMyCodeActivity
import com.monayuser.ui.signup.SignupActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.ui.termsconditions.TermsConditionsActivity
import com.monayuser.ui.welcome.WelcomeActivity
import com.monayuser.utils.*
import com.tbruyelle.rxpermissions2.RxPermissions
import io.reactivex.disposables.CompositeDisposable

/**
 * The type Base activity.
 *
 * @param <T> the type parameter
 * @param <V> the type parameter
</V></T> */
/*Base Class for all activities*/
abstract class BaseActivity<T : ViewDataBinding, V : BaseViewModel<*>> : AppCompatActivity(),
    BaseFragment.Callback, CommonNavigator {

    /**
     * Get view data binding.
     *
     * @return the view data binding
     */
    val REQUEST_CODE_FOR_PERMISSION_SETTING = 1111
    var compositeDisposable = CompositeDisposable()
    var viewDataBinding: T? = null
    private var mViewModel: V? = null
    private var permission: Array<String>? = null
    var context: Context? = null
    var appreference: AppPreference? = null


    /**
     * Override for set binding variable
     *
     * @return variable id
     */
    abstract val bindingVariable: Int

    /**
     * Gets layout id.
     *
     * @return layout resource id
     */
    abstract//    @LayoutRes
    val layoutId: Int

    /**
     * Override for set view model
     *
     * @return view model instance
     */
    abstract val viewModel: V

    companion object {
        var mIsInForegroundMode = false
    }

    override fun onFragmentAttached() {
        // This function is called when fragment is attached
    }

    override fun onFragmentDetached(tag: String) {
        // This function is called when fragment is de-attached
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        permission = null
        context = this@BaseActivity
        getToken()
        performDataBinding()

        ProcessLifecycleOwner.get()
            .lifecycle
            .addObserver(
                ForegroundBackgroundListener()
                    .also {

                    })
    }

    /*** method for show progress dialog ***/
    private var pDialog: CustomProgressDialog? = null

    fun showProgressDialog(context: Context, loadingText: String) {
        try {
            pDialog = CustomProgressDialog.show(context, false, loadingText)
            if (pDialog != null) {
                pDialog!!.show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

    }

    /*** method for hide progress dialog ***/
    fun hideProgressDialog() {
        try {
            if (pDialog != null) {
                pDialog!!.dismiss()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

    }

    fun finishActivity() {
        finish()
        overridePendingTransition(R.anim.right_slide_in, R.anim.right_slide_out)
    }

    /**
     * Hide keyboard.
     */
    fun hideKeyboard() {
        val view = this.currentFocus
        if (view != null) {
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm?.hideSoftInputFromWindow(view.windowToken, 0)
        }
    }

    //performing data binding
    private fun performDataBinding() {
        viewDataBinding = DataBindingUtil.setContentView(this, layoutId)
        this.mViewModel = if (mViewModel == null) viewModel else mViewModel
        viewDataBinding!!.setVariable(bindingVariable, mViewModel)
        viewDataBinding!!.executePendingBindings()
    }

    override fun onDestroy() {
        super.onDestroy()
        compositeDisposable.dispose()
    }


    //rx method to check permission
    @RequiresApi(Build.VERSION_CODES.M)
    fun checkPermission(context: Context, vararg permissions: String) {
        compositeDisposable.add(
            RxPermissions(this)
                .request(*permissions)
                .subscribe { granted ->
                    if (granted!!) {
                        rxPermissionGranted()
                    } else {
                        rxPermissionDenied()
                    }
                })
    }

    protected open fun rxPermissionGranted() {
        // invoked when permission granted
    }

    protected open fun rxPermissionDenied() {
        // invoked when permission denied
    }

    fun moveToApplicationSetting() {
        DialogUtils.showAlertDialogNew(applicationContext.resources.getString(R.string.dialog_alert_heading),
            applicationContext.resources.getString(R.string.allow_permission_setting),
            this, object : DialogUtils.OnConfirmedListener {
                override fun onConfirmed() {

                    startActivityForResult(
                        Intent(
                            android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.parse("package:" + BuildConfig.APPLICATION_ID)
                        ), REQUEST_CODE_FOR_PERMISSION_SETTING
                    );

                }
            })

    }

    fun openLaunch(mContext: Context,referralCode:String , userName:String) {
        val intent = Intent(mContext, WelcomeActivity::class.java)

        intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
        intent.putExtra(AppConstants.USER_NAME,userName)

        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        finish()
    }


    fun openLogin(mContext: Context) {
        val intent = Intent(mContext, LoginActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        finishAffinity()
    }

    fun openKYCActivty(mContext: Activity) {
        val intent = Intent(mContext, KYCActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openDynamicKYCActivty(mContext: Activity) {
        val intent = Intent(mContext, DynamicKYCActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openVerifyForgotCode(mContext: Context) {
        val intent = Intent(mContext, VerifyCodeActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openVerifyOtp(mContext: Context) {
        val intent = Intent(mContext, VerifyOtpActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openNavigation(mContext: Context) {
        val intent = Intent(mContext, NavigationActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        finishAffinity()
    }

    fun openForgotPassword(mContext: Context) {
        val intent = Intent(mContext, ForgotPasswordActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openEditProfile(mContext: Context) {
        val intent = Intent(mContext, EditProfileActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openSignup(mContext: Context, targetSignup: String) {
        val intent = Intent(mContext, SignupActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SIGNUP, targetSignup)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openMobileVerification(mContext: Context) {
        val intent = Intent(mContext, MobileVerificationActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openLoginSignup(mContext: Context) {
        // This function is called when clicking on login button
    }

    fun openTermsConditions(mContext: Context) {
        val intent = Intent(mContext, TermsConditionsActivity::class.java)
        intent.putExtra(AppConstants.PN_NAME, getString(R.string.terms_amp_conditions))
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openChangePassword(mContext: Activity) {
        val intent = Intent(mContext, ChangePasswordActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openFaq(mContext: Activity) {
        val intent = Intent(mContext, FaqActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openNotification(mContext: Activity) {
        val intent = Intent(mContext, NotificationActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openSupport(mContext: Activity) {
        // This function is called when clicking on support button
    }

    fun openSecuritySetup(mContext: Activity) {
        val intent = Intent(mContext, SecuritySetupActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openUserPolicy(mContext: Context) {
        val intent = Intent(mContext, TermsConditionsActivity::class.java)
        intent.putExtra(AppConstants.PN_NAME, getString(R.string.privacy_policy_title))
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openHowItWorks(mContext: Activity) {
        val intent = Intent(mContext, TermsConditionsActivity::class.java)
        intent.putExtra(AppConstants.PN_NAME, getString(R.string.how_it_work))
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openResetPassword(mContext: Context) {
        val intent = Intent(mContext, ResetPasswordActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openSuccessToAddOrSentMoney(mContext: Context, successTarget: String) {
        val intent = Intent(mContext, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, successTarget)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openAddMoney(mContext: Context) {
        val intent = Intent(mContext, AddMoneyActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }


    fun openNoteForSupport(mContext: Context) {
        // This function is called when clicking on support button
    }

    fun openLoginByPin(mContext: Context) {
        // This function is called when clicking on login by pin button
    }

    fun openLoginByFingerPrint(mContext: Context, switchONnOffStr: String?) {
        // This function is invoked when fingerprint functionality is completed
    }

    fun openLoginByFaceID(mContext: Context, switchONnOffForFaceStr: String) {
        // This function is invoked when faceID functionality is completed
    }

  /*  fun openPayMoneyScreen(mContext: Context) {
        val intent = Intent(mContext, PayMoneyActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }*/

    fun openScanActivityScreen(mContext: Context) {
        val intent = Intent(mContext, ScanActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openMyCodeActivity(mContext: Context) {
        val intent = Intent(mContext, ShowMyCodeActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openMPinActivity(mContext: Context) {
        val intent = Intent(mContext, SetMPinActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        finishAffinity()
    }

    fun openSecondaryUserScan(mContext: Context) {
        val intent = Intent(mContext, SecondaryUserScanActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        finishAffinity()
    }

    override fun showValidationError(message: String) {
        DialogUtils.showAlertDialog(this, "", message)
    }

    override fun showProgressBar() {
        showProgressDialog(this, resources.getString(R.string.LOADING))
    }

    override fun hideProgressBar() {
        hideProgressDialog()
    }

    fun checkIfInternetOn(): Boolean {
        if (CommonUtils.isInternetOn(this)) {
            return true
        } else {
            DialogUtils.showAlertDialog(
                this,
                "",
                getStringResource(R.string.validation_internet_connection)
            )
            return false
        }
    }

    private fun getToken() {
        FirebaseInstanceId.getInstance().instanceId.addOnSuccessListener { instanceIdResult ->
            AppPreference.getInstance(this@BaseActivity)
                .addValue(PreferenceKeys.DEVICE_ID, instanceIdResult.token)
        }
    }

    override fun onResume() {
        super.onResume()
        if (mIsInForegroundMode && !AppPreference.getInstance(this)
                .getBoolean(PreferenceKeys.APP_LOCK) && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP
        ) {
            val km = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            if (km.isKeyguardSecure) {
                val authIntent = km.createConfirmDeviceCredentialIntent(
                    getString(R.string.app_name),
                    getResources().getString(R.string.confirm_pattern)
                )
                startActivityForResult(authIntent, 2101)
            }
        }
    }

    override fun onPause() {
        super.onPause()
    }

    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == 2101) {
            if (resultCode == Activity.RESULT_OK) {
                mIsInForegroundMode = false
            } else {
                mIsInForegroundMode = false
                val intent = Intent()
                intent.action = Intent.ACTION_MAIN
                intent.addCategory(Intent.CATEGORY_HOME)
                startActivity(intent)
            }
        }
    }

    class ForegroundBackgroundListener : LifecycleObserver {

        @OnLifecycleEvent(Lifecycle.Event.ON_START)
        fun startSomething() {
            // This function is invoked when app is in foreground state
        }

        @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
        fun stopSomething() {
            mIsInForegroundMode = true
        }
    }
}

