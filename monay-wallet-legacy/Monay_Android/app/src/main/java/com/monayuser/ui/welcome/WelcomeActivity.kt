package com.monayuser.ui.welcome

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Window
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.BuildConfig
import com.monayuser.R
import com.monayuser.databinding.ActivityWelcomeNewBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.login.LoginActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils


/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to welcome
 */

class WelcomeActivity : BaseActivity<ActivityWelcomeNewBinding, WelcomeViewModel>(),
    WelcomeNavigator {

    var mWelcomeViewModel: WelcomeViewModel = WelcomeViewModel()
    override val viewModel: WelcomeViewModel get() = mWelcomeViewModel
    override val bindingVariable: Int get() = BR.welcomeVM

    private var userName: String? = ""
    private var referralCode: String? = ""

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_welcome_new

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@WelcomeActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mWelcomeViewModel.navigator = this
        mWelcomeViewModel.initView()
 //       viewDataBinding!!.versionName.text = "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})"
        viewDataBinding!!.versionName.text = "${BuildConfig.VERSION_NAME} "


/*        intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
        intent.putExtra(AppConstants.USER_NAME,userName)*/
        if (intent != null) {
            try {
                userName = intent.getStringExtra(AppConstants.USER_NAME)!!
                referralCode = intent.getStringExtra(AppConstants.REFERRAL_CODE)!!
            }catch (e:Exception){

            }
        }
    }

    override fun onResume() {
        mIsInForegroundMode = false
        super.onResume()
    }

    override fun init() {
        // This method is used to initialize an variable and call a function.
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
        showProgressDialog(this@WelcomeActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@WelcomeActivity,
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
        DialogUtils.sessionExpireDialog(this@WelcomeActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is used to open Login screen
     */
    override fun openSignup() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            checkPermission(
                this,
                *CommonUtils.READS_PHONE_STATE
            )
        } else {
            val intent = Intent(this, LoginActivity::class.java)


        intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
        intent.putExtra(AppConstants.USER_NAME,userName)

            startActivity(intent)
            finish()
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        val intent = Intent(this, LoginActivity::class.java)

        intent.putExtra(AppConstants.REFERRAL_CODE,referralCode)
        intent.putExtra(AppConstants.USER_NAME,userName)

        startActivity(intent)
        finish()
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        DialogUtils.showAlertDialogNew(applicationContext.resources.getString(R.string.dialog_alert_heading),
            applicationContext.resources.getString(R.string.allow_permission_setting_telephone),
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
}