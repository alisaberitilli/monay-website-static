package com.monayuser.ui.termsconditions

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.TermsConditionsResponse
import com.monayuser.databinding.ActivityTermsConditionsBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to reset new password
 */
class TermsConditionsActivity :
    BaseActivity<ActivityTermsConditionsBinding, TermsConditionsViewModel>(),
    TermsConditionsNavigator {

    lateinit var type: String
    var cmsType = ""
    var mTermsConditionsViewModel: TermsConditionsViewModel = TermsConditionsViewModel()
    override val viewModel: TermsConditionsViewModel get() = mTermsConditionsViewModel
    override val bindingVariable: Int get() = BR.termsConditionsVM
    var targetstr = ""

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_terms_conditions

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@TermsConditionsActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mTermsConditionsViewModel.navigator = this
        mTermsConditionsViewModel.initView()
        if (intent != null) {
            type = intent.getStringExtra(AppConstants.PN_NAME)!!
            if (type.equals(getString(R.string.privacy_policy_title))) {
                viewDataBinding!!.textUserName.text =
                    mTermsConditionsViewModel!!.navigator!!.getStringResource(R.string.privacy_policy_title)
            } else {
                viewDataBinding!!.textUserName.text = intent.getStringExtra(AppConstants.PN_NAME)
            }

            if (intent.hasExtra(AppConstants.TARGET_SIGNUP)) {
                targetstr = intent.getStringExtra(AppConstants.TARGET_SIGNUP)!!
            }
        }
        callTermsApi()
    }

    override fun onResume() {
        if (intent != null && intent.hasExtra(AppConstants.COME_FROM)) {
            mIsInForegroundMode = false
        }
        super.onResume()
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to call Terms and About API.
     */
    fun callTermsApi() {
        var userType = ""

        try {
            userType = AppPreference.getInstance(this)
                .getSavedUser(AppPreference.getInstance(this)).userType
        } catch (e: Exception) {
            e.printStackTrace()
        }
        if (CommonUtils.isStringNullOrBlank(userType)) {
            userType = targetstr
        }

        if (checkIfInternetOn()) {
            when (type) {
                getString(R.string.about) -> {
                    mTermsConditionsViewModel.termsAPI(
                        AppPreference.getInstance(this),
                        userType,
                        AppConstants.ABOUT_US
                    )

                    cmsType = AppConstants.ABOUT_US
                }
                getString(R.string.terms_amp_conditions) -> {
                    mTermsConditionsViewModel.termsAPI(
                        AppPreference.getInstance(this),
                        userType,
                        AppConstants.TERMS_AND_CONDITIONS
                    )

                    cmsType = AppConstants.TERMS_AND_CONDITIONS
                }
                getString(R.string.how_it_work) -> {
                    mTermsConditionsViewModel.termsAPI(
                        AppPreference.getInstance(this),
                        userType,
                        AppConstants.HOW_IT_WORKS
                    )

                    cmsType = AppConstants.HOW_IT_WORKS
                }
                else -> {
                    mTermsConditionsViewModel.termsAPI(
                        AppPreference.getInstance(this),
                        userType,
                        AppConstants.PRIVACY_POLICY
                    )
                    cmsType = AppConstants.PRIVACY_POLICY
                }
            }
        } else {
            tryAgain()
        }
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        viewDataBinding!!.mainLayout.setVisibility(View.VISIBLE)
        val webViewClient: WebViewClient = WebViewClient()
        web_view.setWebViewClient(webViewClient)
        web_view.getSettings().setDomStorageEnabled(true)
        web_view.getSettings().setLoadsImagesAutomatically(true)
        web_view.getSettings().setJavaScriptEnabled(true)
        web_view.getSettings().setAppCacheEnabled(false)
        web_view.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY)
        web_view.getSettings().setBuiltInZoomControls(true)

        web_view.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, progress: Int) {
                if (progress == 100) {
                    // Hide progress bar when loading is finished
                }
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
        showProgressDialog(this@TermsConditionsActivity, resources.getString(R.string.LOADING))
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun showResponseData(termsConditionsResponse: TermsConditionsResponse) {
        for (i in termsConditionsResponse.data!!.rows.indices) {
            if (termsConditionsResponse.data!!.rows[i].pageKey.equals(cmsType, true)) {
                viewDataBinding!!.webView.loadDataWithBaseURL(
                    null,
                    termsConditionsResponse.data!!.rows[i].pageContent,
                    "text/html",
                    "utf-8",
                    null
                )
                break
            }
        }
    }

    /**
     * retry api calling  on click of try again
     *
     */
    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
            callTermsApi()
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
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
            this@TermsConditionsActivity,
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
        DialogUtils.sessionExpireDialog(this@TermsConditionsActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * The type Web view client.
     */
    inner class WebViewClient : android.webkit.WebViewClient() {
        override fun shouldOverrideUrlLoading(
            view: WebView,
            url: String
        ): Boolean {
            view.loadUrl(url)
            return true
        }

        override fun onPageFinished(
            view: WebView,
            url: String
        ) {
            super.onPageFinished(view, url)
        }
    }
}