package com.monayuser.ui.splash

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.Window
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks
import com.monayuser.BR
import com.monayuser.MyApplication
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.response.SettingResponse
import com.monayuser.databinding.ActivitySplashBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.setpin.SetMPinActivity
import com.monayuser.utils.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors

class SplashActivity : BaseActivity<ActivitySplashBinding, SplashViewModel>(),
    SplashNavigator {

    var mSplashViewModel: SplashViewModel = SplashViewModel()
    override val viewModel: SplashViewModel get() = mSplashViewModel
    override val bindingVariable: Int get() = BR.splashVM
    lateinit var appPreferences: AppPreference
    var isMPin: Boolean = false

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_splash

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        super.onCreate(savedInstanceState)
        appPreferences = AppPreference.getInstance(this)
        mSplashViewModel.navigator = this
        mSplashViewModel.initView()
    }

    override fun onResume() {
        mIsInForegroundMode = false
        super.onResume()
    }

    /**
     * initialize app and applying thread for open welcome screen
     *
     */
    override fun init() {

        initForFireBaseDeepLink()

        if (checkIfInternetOn()) {
            mSplashViewModel.callSettingAPI(appPreferences)
        }


    }


    private var userName: String? = ""
    private var referralCode: String? = ""

    private fun initForFireBaseDeepLink() {
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
    }

    override fun getSettingData(settingResponse: SettingResponse) {
        appPreferences.addValue(
            PreferenceKeys.CURRENCY_ABBREVIATIONS,
            settingResponse.data!!.currencyAbbr
        )

        appPreferences.addValue(
            PreferenceKeys.COUNTRY_NAME_CODE,
            settingResponse.data!!.country.code
        )

        Log.e(javaClass.name, "Country Name >>>>"+AppPreference.getInstance(context!!).getValue(PreferenceKeys.CURRENCY_ABBREVIATIONS))
        Log.e(javaClass.name, "Country Code >>>>"+AppPreference.getInstance(context!!).getValue(PreferenceKeys.COUNTRY_NAME_CODE))

//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
//            if (!CommonUtils.isStringNullOrBlank(
//                    AppPreference.getInstance(applicationContext!!)
//                        .getValue(PreferenceKeys.ACCESS_TOKEN)
//                )
//            ) {
//                checkPermission(
//                    this,
//                    *CommonUtils.CONTACTS_READS_AND_WRITE_PERMISSION
//                )
//            } else {
//                delayFun()
//            }
//        } else {
            delayFun()
//        }
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        delayFun()
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        delayFun()
    }


    private fun delayFun() {
        Handler().postDelayed({ moveToWelcomeScreen() }, 500)
    }

    /**
     * This method is used to open welcome screen
     */
    private fun moveToWelcomeScreen() {
        val appPreference = AppPreference.getInstance(this)
        if (CommonUtils.isStringNullOrBlank(appPreference.getValue(PreferenceKeys.ACCESS_TOKEN))) {
            openLaunch(this, referralCode!! , userName!!)
        } else {
            isMPin = appPreferences.getBoolean(PreferenceKeys.M_PIN)
            if (isMPin == true) {
                if (appPreference.getValue(PreferenceKeys.USER_TYPE).equals(AppConstants.SECONDARY_SIGNUP)) {
                    if (appPreference.getBoolean(PreferenceKeys.IS_LINKED)==true)
                    {
                        openNavigation(this)
                    }
                    else
                    {
                        openSecondaryUserScan(this)

                    }
                }
                else
                {
                    openNavigation(this)
                }
            } else {
                val intent = Intent(this@SplashActivity, SetMPinActivity::class.java)
                intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.LOGIN)
                startActivity(intent)
                finishAffinity()
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }
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
        showProgressDialog(this@SplashActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SplashActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            // This function is called when click on OK button
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
        DialogUtils.sessionExpireDialog(this@SplashActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}