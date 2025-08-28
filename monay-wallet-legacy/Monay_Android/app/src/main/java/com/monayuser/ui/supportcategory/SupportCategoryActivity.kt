package com.monayuser.ui.supportcategory

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.databinding.ActivitySupportCategoryBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.supportcategory.adapter.SupportCategoryAdapter
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import zendesk.configurations.Configuration
import zendesk.core.AnonymousIdentity
import zendesk.core.Zendesk
import zendesk.support.Support
import zendesk.support.request.RequestActivity
import zendesk.support.requestlist.RequestListActivity


class SupportCategoryActivity :
    BaseActivity<ActivitySupportCategoryBinding, SupportCategoryViewModel>(),
    SupportCategoryNavigator {

    private var supportCategoryAdapter: SupportCategoryAdapter? = null
    private lateinit var categoryList: ArrayList<HashMap<String, String>>
    var mSupportViewModel: SupportCategoryViewModel = SupportCategoryViewModel()
    override val viewModel: SupportCategoryViewModel get() = mSupportViewModel
    override val bindingVariable: Int get() = BR.supportCategoryVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_support_category

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@SupportCategoryActivity, R.color.colorPrimary)

        }
        super.onCreate(savedInstanceState)

        mSupportViewModel.navigator = this

        if (checkIfInternetOn())
            mSupportViewModel.initView()
        else
            tryAgain()

        val appPreferences = AppPreference.getInstance(this)

        Zendesk.INSTANCE.init(
            this, getString(R.string.zendesk_url),
            getString(R.string.zendesk_application_id),
            getString(R.string.zendesk_client_id)
        )

        if (AppPreference.getInstance(this).getValue(
                PreferenceKeys.LOGIN_WITH_MOBILE
            ).toString().equals("1")
        ) {
            val identity = AnonymousIdentity.Builder()
                .withNameIdentifier(appPreferences.getSavedUser(appPreferences).firstName +" "+appPreferences.getSavedUser(appPreferences).lastName)
                .withEmailIdentifier(appPreferences.getSavedUser(appPreferences).phoneNumber)
                .build()
            Zendesk.INSTANCE.setIdentity(identity)
        } else {
            val identity = AnonymousIdentity.Builder()
                .withNameIdentifier(appPreferences.getSavedUser(appPreferences).firstName +" "+appPreferences.getSavedUser(appPreferences).lastName) // email is optional
                .withEmailIdentifier(appPreferences.getSavedUser(appPreferences).email)
                .build()
            Zendesk.INSTANCE.setIdentity(identity)
        }

        Support.INSTANCE.init(Zendesk.INSTANCE);
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        categoryList = ArrayList()
        var hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "Issue with Add Money")
        hashMap.put(AppConstants.PN_VALUE, "add_money")
        categoryList.add(hashMap)
        hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "Issue with Send Money")
        hashMap.put(AppConstants.PN_VALUE, "send_money")
        categoryList.add(hashMap)
        hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "Issue with Request Money")
        hashMap.put(AppConstants.PN_VALUE, "request_money")
        categoryList.add(hashMap)
        hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "Failed Transactions")
        hashMap.put(AppConstants.PN_VALUE, "failed_transactions")
        categoryList.add(hashMap)
        hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "Need help with Account & Settings")
        hashMap.put(AppConstants.PN_VALUE, "account_settings")
        categoryList.add(hashMap)
        hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "KYC Support")
        hashMap.put(AppConstants.PN_VALUE, "kyc_support")
        categoryList.add(hashMap)
        hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "Report Fraudulent Activity")
        hashMap.put(AppConstants.PN_VALUE, "report_fraudulent_activity")
        categoryList.add(hashMap)
        hashMap = HashMap<String, String>()
        hashMap.put(AppConstants.PN_NAME, "Others")
        hashMap.put(AppConstants.PN_VALUE, "others")
        categoryList.add(hashMap)

        var linearLayoutManager = LinearLayoutManager(this)
        linearLayoutManager.orientation = RecyclerView.VERTICAL
        viewDataBinding!!.rvSupportCategory.layoutManager = linearLayoutManager
        supportCategoryAdapter = SupportCategoryAdapter(this, categoryList)
        viewDataBinding!!.rvSupportCategory.adapter = supportCategoryAdapter

        supportCategoryAdapter!!.setOnItemClickListener(object :
            SupportCategoryAdapter.OnItemClickListener {
            override fun onItemClicked(items: HashMap<String, String>, position: Int) {
                val requestConfiguration: Configuration =
                    RequestActivity.builder() // set its properties
                        .withRequestSubject(categoryList[position][AppConstants.PN_NAME]!!)
                        .withTags(categoryList[position][AppConstants.PN_VALUE]!!)
                        .config()

                RequestListActivity.builder()
                    .show(this@SupportCategoryActivity, requestConfiguration)
            }
        })
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
        showProgressDialog(this@SupportCategoryActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SupportCategoryActivity,
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
        DialogUtils.sessionExpireDialog(this@SupportCategoryActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * retry api calling  on click of try again
     *
     */
    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
            init()
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }
}