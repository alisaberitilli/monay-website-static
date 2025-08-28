package com.monayuser.ui.faq

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.widget.AbsListView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.Row
import com.monayuser.data.model.response.FAQResponse
import com.monayuser.databinding.ActivityFaqBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.faq.adapter.FAQExpandableAdapter
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to reset new password
 */

class FaqActivity :
    BaseActivity<ActivityFaqBinding, FaqViewModel>(),
    FaqNavigator {

    private var page = 1
    private var linearLayoutManager: LinearLayoutManager? = null
    private var isLoading = false
    private var faqAdapter: FAQExpandableAdapter? = null
    private var faqList: ArrayList<Row> = ArrayList()
    var mFaqViewModel: FaqViewModel = FaqViewModel()
    override val viewModel: FaqViewModel get() = mFaqViewModel
    override val bindingVariable: Int get() = BR.faqVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_faq

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@FaqActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mFaqViewModel.navigator = this
        mFaqViewModel.initView()

        if (checkIfInternetOn()) {
            mFaqViewModel.faqAPI(
                false, AppPreference.getInstance(this), AppPreference.getInstance(this)
                    .getSavedUser(AppPreference.getInstance(this)).userType, "0", "10"
            )
        } else {
            tryAgain()
        }
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

            mFaqViewModel.faqAPI(
                false, AppPreference.getInstance(this), AppPreference.getInstance(this)
                    .getSavedUser(AppPreference.getInstance(this)).userType, "0", "10"
            )

        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    /**
     * This method is called when click on back button.
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        initializeAdapter()

    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun showResponseData(faqResponse: FAQResponse) {
        faqList!!.addAll(faqResponse!!.data!!.rows)

        if (faqList.size > 0) {
            viewDataBinding!!.txtNoArticalFound.visibility = View.GONE
            viewDataBinding!!.exFaq.visibility = View.VISIBLE
            faqAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.txtNoArticalFound.visibility = View.VISIBLE
            viewDataBinding!!.exFaq.visibility = View.GONE
        }

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                faqResponse.data!!.total,
                10
            )
        ) {
            isLoading = true
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
        showProgressDialog(this@FaqActivity, resources.getString(R.string.LOADING))
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        linearLayoutManager = LinearLayoutManager(this)
        faqAdapter = FAQExpandableAdapter(this, faqList)
        viewDataBinding!!.exFaq.setAdapter(faqAdapter)

        viewDataBinding!!.exFaq.setOnScrollListener(object : AbsListView.OnScrollListener{
            override fun onScroll(p0: AbsListView?, firstVisibleItemPosition: Int, visibleItemCount: Int, totalItemCount: Int) {
                if (totalItemCount > 0 && !isLoading) {
                    var lastInScreen = firstVisibleItemPosition + visibleItemCount
                    if(lastInScreen == totalItemCount) {
                        loadMoreItems()
                    }
                }
            }

            override fun onScrollStateChanged(p0: AbsListView?, p1: Int) {
                // This function is called when scroll state changed
            }
        })
    }

    fun loadMoreItems() {
        if (checkIfInternetOn()) {
            isLoading = true
            page += 1

            mFaqViewModel.faqAPI(
                true, AppPreference.getInstance(this), AppPreference.getInstance(this)
                    .getSavedUser(AppPreference.getInstance(this)).userType, faqList.size.toString(), "10"
            )
        }
    }

    /**
     * This method is used to show bottom progress bar
     */
    override fun showPageLoader() {
        viewDataBinding!!.progress.visibility = View.VISIBLE
    }

    /**
     * This method is used to hide bottom progress bar
     */
    override fun showHideLoader() {
        viewDataBinding!!.progress.visibility = View.GONE
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@FaqActivity,
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
        DialogUtils.sessionExpireDialog(this@FaqActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}
