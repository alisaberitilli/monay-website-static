package com.monayuser.ui.setup

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.Window
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.databinding.ActivitySetupBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.ui.setpin.SetMPinActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils

class SecuritySetupActivity :
    BaseActivity<ActivitySetupBinding, SecuritySetupViewModel>(),
    SecuritySetupNavigator {

    var mSecuritySetupViewModel: SecuritySetupViewModel = SecuritySetupViewModel()
    override val viewModel: SecuritySetupViewModel get() = mSecuritySetupViewModel
    var switchONnOffStr: String? = null
    override val bindingVariable: Int get() = BR.setupVM
    private val SECURITY_SETTING_REQUEST_CODE = 233

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_setup

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@SecuritySetupActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mSecuritySetupViewModel.navigator = this
        mSecuritySetupViewModel.initView()
    }

    /**
     * This method is called when click on face setup button
     */
    override fun setupFaceID() {
        // This method is called when click on face setup button
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        Toast.makeText(this, getStringResource(R.string.allow_permission), Toast.LENGTH_SHORT)
            .show()

        moveToApplicationSetting()
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        openLoginByFingerPrint(this@SecuritySetupActivity, switchONnOffStr)
    }

    override fun setupFingerPrint() {
        // This method is called when click on finger setup button
    }

    /**
     * This method is called when click on pin setup button
     */
    override fun setupPin() {
        hideKeyboard()
        val intent = Intent(this@SecuritySetupActivity, MobileVerificationActivity::class.java)
        intent.putExtra(AppConstants.SCREEN_FROM, "SecuritySetup")
        intent.putExtra("STATUS", "ForgotPin")
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun changePin() {
        hideKeyboard()
        val intent = Intent(this@SecuritySetupActivity, SetMPinActivity::class.java)
        intent.putExtra(AppConstants.SCREEN_FROM, "SecuritySetup")
        intent.putExtra(AppConstants.EMAIL, "")
        intent.putExtra("STATUS", "ChangePin")
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to initialize variable and call a API.
     */
    override fun init() {
        hideKeyboard()

        if (!isDeviceSecure()) {
            AppPreference.getInstance(this).addBoolean(
                PreferenceKeys.APP_LOCK,
                true
            )
        }

        conditionForSwitch()
    }

    private fun conditionForSwitch() {

        switchFingerPrint.isChecked = !AppPreference.getInstance(this).getBoolean(PreferenceKeys.APP_LOCK)

        switchFingerPrint.setOnCheckedChangeListener { buttonView, isChecked ->
            if (isChecked) {
//                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    val km =
                        getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
                    if (km.isKeyguardSecure && AppPreference.getInstance(this).getBoolean(PreferenceKeys.APP_LOCK)) {
                        val authIntent = km.createConfirmDeviceCredentialIntent(
                            getString(R.string.app_name),
                            getString(R.string.confirm_pattern)
                        )
                        startActivityForResult(authIntent, 2101)
                    } else {
                        //If some exception occurs means Screen lock is not set up please set screen lock
                        //Open Security screen directly to enable patter lock


                        //If some exception occurs means Screen lock is not set up please set screen lock
                        //Open Security screen directly to enable patter lock
                        val intent = Intent(Settings.ACTION_SECURITY_SETTINGS)
                        try {

                            //Start activity for result
                            startActivityForResult(
                                intent,
                                SECURITY_SETTING_REQUEST_CODE
                            )
                        } catch (ex: java.lang.Exception) {

                            //If app is unable to find any Security settings then user has to set screen lock manually
                            Toast.makeText(
                                this,
                                resources.getString(R.string.setting_label),
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
//                }
            } else {
                AppPreference.getInstance(this).addBoolean(
                    PreferenceKeys.APP_LOCK,
                    true
                )
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
        showProgressDialog(this@SecuritySetupActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SecuritySetupActivity,
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
        DialogUtils.sessionExpireDialog(this@SecuritySetupActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == 2101) {
            if (resultCode == Activity.RESULT_OK) {
                AppPreference.getInstance(this).addBoolean(
                    PreferenceKeys.APP_LOCK,
                    false
                )
                switchFingerPrint.isChecked = !AppPreference.getInstance(this).getBoolean(PreferenceKeys.APP_LOCK)
            }
        } else if (requestCode == SECURITY_SETTING_REQUEST_CODE) {
            //When user is enabled Security settings then we don't get any kind of RESULT_OK
            //So we need to check whether device has enabled screen lock or not
            if (isDeviceSecure()) {
                //If screen lock enabled show toast and start intent to authenticate user
                Toast.makeText(
                    this,
                    resources.getString(R.string.device_is_secure),
                    Toast.LENGTH_SHORT
                ).show()

                val km =
                    getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
                if (km.isKeyguardSecure) {
                    val authIntent = km.createConfirmDeviceCredentialIntent(
                        getString(R.string.app_name),
                        getString(R.string.confirm_pattern)
                    )
                    startActivityForResult(authIntent, 2101)
                }
            } else {
                //If screen lock is not enabled just update text
                Toast.makeText(
                    this,
                    resources.getString(R.string.security_device_cancelled),
                    Toast.LENGTH_SHORT
                ).show()
            }

        }
    }

    /**
     * method to return whether device has screen lock enabled or not
     */
    private fun isDeviceSecure(): Boolean {
        val keyguardManager =
            getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

        //this method only work whose api level is greater than or equal to Jelly_Bean (16)
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN && keyguardManager.isKeyguardSecure

        //You can also use keyguardManager.isDeviceSecure(); but it requires API Level 23
    }
}