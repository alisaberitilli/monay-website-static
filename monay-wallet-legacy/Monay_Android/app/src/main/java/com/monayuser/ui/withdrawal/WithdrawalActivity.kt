package com.monayuser.ui.withdrawal

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
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.response.WithdrawalHistoryResponse
import com.monayuser.databinding.ActivityWithdrawalBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.withdrawal.adapter.WithdrawalAdapter
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import java.util.*

class WithdrawalActivity : BaseActivity<ActivityWithdrawalBinding, WithdrawalViewModel>(),
    WithdrawalNavigator {

    private var page = 1
    private var linearLayoutManager: LinearLayoutManager? = null
    private var isLoading = false
    private var withdrawalAdapter: WithdrawalAdapter? = null
    private var withdrawalList: ArrayList<RecentTransaction>? = null
    var mWithdrawalViewModel: WithdrawalViewModel = WithdrawalViewModel()
    override val viewModel: WithdrawalViewModel get() = mWithdrawalViewModel
    override val bindingVariable: Int get() = BR.withdrawalVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_withdrawal

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@WithdrawalActivity, R.color.colorPrimary)
        }

        super.onCreate(savedInstanceState)
        mWithdrawalViewModel.navigator = this
        mWithdrawalViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        onBackPressed()
    }

    /**
     * This method is used to initialize an variable and call a API.
     */
    override fun init() {
        initializeAdapter()
        if (checkIfInternetOn()) {
            mWithdrawalViewModel.pendingRequestAPI(
                false,
                AppPreference.getInstance(this),
                "0",
                "10"
            )
        } else {
            tryAgain()
        }
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.visibility = View.GONE
            viewDataBinding!!.tryAgain.visibility = View.GONE
            mWithdrawalViewModel.pendingRequestAPI(
                false,
                AppPreference.getInstance(this),
                "0",
                "10"
            )
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternet.visibility = View.VISIBLE
            viewDataBinding!!.tryAgain.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        withdrawalList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.rvWithdrawal.layoutManager = linearLayoutManager
        withdrawalAdapter = WithdrawalAdapter(this, withdrawalList!!)
        viewDataBinding!!.rvWithdrawal.adapter = withdrawalAdapter

        withdrawalAdapter!!.setOnItemClickListener(object :
            WithdrawalAdapter.OnItemClickListener {
            override fun onItemClicked(view: View, position: Int) {
                // This method is used when click on recyclerview's item
            }
        })

        viewDataBinding!!.rvWithdrawal.addOnScrollListener(object :
            RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                val visibleItemCount = linearLayoutManager!!.childCount
                val totalItemCount = linearLayoutManager!!.itemCount
                val firstVisibleItemPosition = linearLayoutManager!!.findFirstVisibleItemPosition()

                if (!isLoading && (visibleItemCount + firstVisibleItemPosition >= totalItemCount) && firstVisibleItemPosition >= 0) {
                        loadMoreItems()
                }
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
        showProgressDialog(this, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this,
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
        DialogUtils.sessionExpireDialog(this)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
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

    fun loadMoreItems() {
        if (checkIfInternetOn()) {
            isLoading = true
            page += 1
            mWithdrawalViewModel.pendingRequestAPI(
                true,
                AppPreference.getInstance(this),
                withdrawalList!!.size.toString(),
                "10"
            )
        }
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getWithdrawalHistoryResponse(withdrawalHistoryResponse: WithdrawalHistoryResponse) {
        if (withdrawalHistoryResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.rvWithdrawal.visibility = View.VISIBLE
            withdrawalList!!.addAll(withdrawalHistoryResponse.data!!.rows)
            withdrawalAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.rvWithdrawal.visibility = View.GONE
        }
        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                withdrawalHistoryResponse.data!!.total,
                10
            )
        ) {
            isLoading = true
        }
    }
}