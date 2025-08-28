package com.monayuser.ui.settings

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Window
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.databinding.ActivitySettingsBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.supportcategory.SupportCategoryActivity
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils

class SettingsActivity : BaseActivity<ActivitySettingsBinding, SettingsViewModel>(),
    SettingsNavigator {

    var mSettingsViewModel: SettingsViewModel =
        SettingsViewModel()
    override val viewModel: SettingsViewModel get() = mSettingsViewModel
    override val bindingVariable: Int get() = BR.settingsVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_settings

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@SettingsActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mSettingsViewModel.navigator = this
        mSettingsViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun clickOnBackButton() {
        finish()
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
        showProgressDialog(this@SettingsActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SettingsActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is called when click on notification button
     */
    override fun notification() {
        openNotification(this)
    }

    /**
     * This method is called when click on security button
     */
    override fun clickOnSecurity() {
        openSecuritySetup(this)
    }

    /**
     * This method is called when click on privacy button
     */
    override fun userPolicy() {
        openUserPolicy(this)
    }

    /**
     * This method is called when click on terms & condition button
     */
    override fun termsCondition() {
        openTermsConditions(this)
    }

    /**
     * This method is called when click on support button
     */
    override fun support() {
        val intent = Intent(this, SupportCategoryActivity::class.java)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    /**
     * This method is called when click on FAQ button
     */
    override fun faq() {
        openFaq(this)
    }

    /**
     * This method is called when click on how it works button
     */
    override fun howItWorks() {
        openHowItWorks(this)
    }

    /**
     * This method is called when click on change password button
     */
    override fun changePassword() {
        openChangePassword(this)
    }

    override fun clickOnWithdrawMoney() {
        // This method is called when click on withdraw money
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@SettingsActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun init() {
        // This method is used to initialize an variable and call a function.
    }

    inner class ItemEventListener : ClickListener() {
        override fun ondeleteAccount() {
            // This method is called when click on delete button
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
}