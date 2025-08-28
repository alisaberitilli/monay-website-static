package com.monayuser.ui.paymentrequest

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.view.Window
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import com.google.android.material.tabs.TabLayout
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.databinding.ActivityPaymentRequestBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.paymentrequest.adapter.PaymentRequestPageAdapter
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_payment_request.*

class PaymentRequestActivity :
    BaseActivity<ActivityPaymentRequestBinding, PaymentRequestViewModel>(),
    PaymentRequestNavigator {

    var mPaymentRequestViewModel: PaymentRequestViewModel = PaymentRequestViewModel()
    override val viewModel: PaymentRequestViewModel get() = mPaymentRequestViewModel
    override val bindingVariable: Int get() = BR.paymentRequestVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_payment_request

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@PaymentRequestActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mPaymentRequestViewModel.navigator = this
        mPaymentRequestViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * initialize variable and tabs
     *
     */
    override fun init() {

        val userType = AppPreference.getInstance(this@PaymentRequestActivity).getValue(PreferenceKeys.USER_TYPE)
        if (!userType.equals(AppConstants.SECONDARY_SIGNUP)) { // If user type is secondary or not..
            tabs!!.addTab(tabs!!.newTab().setText(" "+getString(R.string.my_request_tab)+" "))
            tabs!!.tabMode = TabLayout.MODE_SCROLLABLE
        }else{
            tabs!!.tabMode = TabLayout.MODE_FIXED
        }

        tabs!!.addTab(tabs!!.newTab().setText(" "+getString(R.string.received_tab)+" "))
        tabs!!.addTab(tabs!!.newTab().setText(" "+getString(R.string.paid_tab)+" "))
        tabs!!.addTab(tabs!!.newTab().setText(" "+getString(R.string.decline_tab)+" "))
       tabs!!.tabGravity = TabLayout.GRAVITY_FILL

        val adapter =
            PaymentRequestPageAdapter(
                this,
                supportFragmentManager,
                tabs!!.tabCount, userType!!
            )
        viewPager!!.adapter = adapter

        viewPager!!.addOnPageChangeListener(TabLayout.TabLayoutOnPageChangeListener(tabs))

        tabs!!.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab) {
                viewPager!!.currentItem = tab.position
            }

            override fun onTabUnselected(tab: TabLayout.Tab) {
                // This method is called when tab is unselected
            }

            override fun onTabReselected(tab: TabLayout.Tab) {
                // This method is called when tab is reselected
            }
        })

        if (intent != null && intent.hasExtra("pay")) {
            tabs!!.getTabAt(1)!!.select()
        }

        changeTabsFont()
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
        showProgressDialog(this@PaymentRequestActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@PaymentRequestActivity,
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
     * set tab layout font programmatically
     *
     */
    private fun changeTabsFont() {

        val vg = tabs.getChildAt(0) as ViewGroup
        val tabsCount = vg.childCount
        for (j in 0 until tabsCount) {
            val vgTab = vg.getChildAt(j) as ViewGroup
            val tabChildCount = vgTab.childCount
            for (i in 0 until tabChildCount) {
                val tabViewChild = vgTab.getChildAt(i)
                if (tabViewChild is TextView) {
                    tabViewChild.setTypeface(
                        ResourcesCompat.getFont(
                            this@PaymentRequestActivity,
                            R.font.cerapro_medium
                        )
                    ) //*Typeface.createFromAsset(getActivity().getAssets(), getResources().getString(R.string.font_RW_bold))*//*
                }
            }
        }

    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@PaymentRequestActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}