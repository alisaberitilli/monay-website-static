package com.monayuser.ui.successaddmoney

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.databinding.ActivityAddSentMoneyBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.navigation.NavigationActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils

class AddSentMoneyActivity : BaseActivity<ActivityAddSentMoneyBinding, AddSentMoneyViewModel>(),
    AddSentMoneyNavigator {

    private var recentUserData: RecentUserData? = null
    var mAddSentMoneyViewModel: AddSentMoneyViewModel = AddSentMoneyViewModel()
    override val viewModel: AddSentMoneyViewModel get() = mAddSentMoneyViewModel
    override val bindingVariable: Int get() = BR.addSentMoneyVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_add_sent_money

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@AddSentMoneyActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mAddSentMoneyViewModel.navigator = this
        mAddSentMoneyViewModel.initView()
    }

    /**
     * This method is called when click on go to home button
     */
    override fun goToHome() {
        if (intent.getStringExtra(AppConstants.TARGET_SUCCESS)!!
                .equals(AppConstants.REQUEST_WITHDRAWAL)
        ) {
            val intent = Intent(this, NavigationActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
            intent.putExtra(AppConstants.REQUEST_WITHDRAWAL, AppConstants.REQUEST_WITHDRAWAL)
            startActivity(intent)
        } else {
            val intent = Intent(this@AddSentMoneyActivity, NavigationActivity::class.java)
            intent.putExtra(AppConstants.COME_FROM, AppConstants.COME_FROM)
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            finishAffinity()
        }
    }

    override fun onBackPressed() {
        val intent = Intent(this@AddSentMoneyActivity, NavigationActivity::class.java)
        intent.putExtra(AppConstants.COME_FROM, AppConstants.COME_FROM)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        finishAffinity()
    }

    /**
     * This method is used to initialize variable and call a API.
     */
    override fun init() {
        if (intent != null) {
            recentUserData = intent.getSerializableExtra(AppConstants.USER_DATA) as RecentUserData?
            if (intent.getStringExtra(AppConstants.TARGET_SUCCESS)!!
                    .equals(AppConstants.ADD_MONEY)
            ) {
                addMoneyCondition()
            } else if (intent.getStringExtra(AppConstants.TARGET_SUCCESS)!!
                    .equals(AppConstants.REQUEST_WITHDRAWAL)
            ) {
                requestWithdrawalCondition()
            } else if (intent.getStringExtra(AppConstants.TARGET_SUCCESS)!!
                    .equals(AppConstants.REQUEST_MONEY)
            ) {
                requestMoneyCondition()
            } else {
                elseOrOtherCondition()
            }
        }
    }

    private fun elseOrOtherCondition() {
        if (recentUserData!!.status.equals("failed", true)) {
            titleText.text = "Send money failed"
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_error_failed)
        } else {
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_verified)
            titleText.text =
                "${getString(R.string.successfully_sent_money)} ${recentUserData!!.firstName} ${recentUserData!!.lastName}."
        }

        if (recentUserData!!.amount!!.contains(".")) {
            viewDataBinding!!.tvAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", recentUserData!!.amount!!.toFloat())}"
        } else {
            viewDataBinding!!.tvAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", recentUserData!!.amount!!.toLong())}"
        }
        viewDataBinding!!.transactionID.text =
            "${getString(R.string.transaction_id)}: ${recentUserData!!.transactionId}"
    }

    private fun requestMoneyCondition() {
        if (recentUserData!!.status.equals("failed", true)) {
            titleText.text = "Request request failed"
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_error_failed)
        } else {
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_verified)
            titleText.text =
                "${getString(R.string.successfully_requset_money)} ${recentUserData!!.firstName} ${recentUserData!!.lastName}."
        }
        viewDataBinding!!.transactionID.visibility = View.GONE
        var amount: String? = intent.getStringExtra("Amount")

        if (amount!!.contains(".")) {
            viewDataBinding!!.tvAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", amount!!.toFloat())}"
        } else {
            viewDataBinding!!.tvAmount.text = "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", amount!!.toLong())}"
        }
    }

    private fun requestWithdrawalCondition() {
        if (recentUserData!!.status.equals("failed", true)) {
            titleText.text = "Withdrawal request failed"
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_error_failed)
        } else {
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_verified)
            titleText.text = getString(R.string.successfully_request_withdrawal)
        }
        if (recentUserData!!.amount!!.contains(".")) {
            viewDataBinding!!.tvAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", recentUserData!!.amount!!.toFloat())}"
        } else {
            viewDataBinding!!.tvAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", recentUserData!!.amount!!.toLong())}"
        }
        viewDataBinding!!.transactionID.text =
            "${getString(R.string.transaction_id)}: ${recentUserData!!.transactionId}"
    }

    private fun addMoneyCondition() {
        if (recentUserData!!.status.equals("failed", true)) {
            titleText.text = "Add Money failed"
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_error_failed)
        } else {
            viewDataBinding!!.ivLogo.setImageResource(R.mipmap.ic_verified)
            titleText.text = getString(R.string.successfully_add_money)
        }
        if (recentUserData!!.amount!!.contains(".")) {
            viewDataBinding!!.tvAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", recentUserData!!.amount!!.toFloat())}"
        } else {
            viewDataBinding!!.tvAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", recentUserData!!.amount!!.toLong())}"
        }
        viewDataBinding!!.transactionID.text =
            "${getString(R.string.transaction_id)}: ${recentUserData!!.transactionId}"
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
        showProgressDialog(this@AddSentMoneyActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@AddSentMoneyActivity,
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
        DialogUtils.sessionExpireDialog(this@AddSentMoneyActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}