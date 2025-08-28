package com.monayuser.ui.wallet

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import androidx.core.app.ActivityOptionsCompat
import androidx.core.content.ContextCompat
import androidx.core.widget.NestedScrollView
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.databinding.ActivityWalletBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.transactiondetails.TransactionDetailsActivity
import com.monayuser.ui.wallet.adapter.WalletTransactionAdapter
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import de.hdodenhof.circleimageview.CircleImageView
import java.util.*

class WalletActivity : BaseActivity<ActivityWalletBinding, WalletViewModel>(),
    WalletNavigator {

    private var transactionList: ArrayList<RecentTransaction>? = null
    private var page = 1
    private var linearLayoutManager: LinearLayoutManager? = null
    private var isLoading = false
    private var transactListAdapter: WalletTransactionAdapter? = null
    var mRewardsViewModel: WalletViewModel = WalletViewModel()
    override val viewModel: WalletViewModel get() = mRewardsViewModel
    override val bindingVariable: Int get() = BR.walletVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_wallet

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@WalletActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mRewardsViewModel.navigator = this
        mRewardsViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to open add money screen.
     */
    override fun addMoney() {
        openAddMoney(this@WalletActivity)
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
        showProgressDialog(this@WalletActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@WalletActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@WalletActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is used to initialize an variable and call a function.
     */
    override fun init() {
        initializeAdapter()

        if (checkIfInternetOn()) {
            mRewardsViewModel.callWalletAPI(AppPreference.getInstance(this))

            mRewardsViewModel.callTransactionList(
                false,
                AppPreference.getInstance(this),
                "",
                "",
                "",
                "",
                "",
                "0",
                "10"
            )
        } else {
            tryAgain()
        }

        val userType = AppPreference.getInstance(this@WalletActivity!!).getValue(PreferenceKeys.USER_TYPE)

        if (userType.equals(AppConstants.SECONDARY_SIGNUP)) {
            viewDataBinding!!.tvText.setText(getString(R.string.total_wallet_balance))

            viewDataBinding!!.addMoney.visibility=View.GONE
        }
        else
        {
            viewDataBinding!!.tvText.setText(getString(R.string.wallet_balance))
            viewDataBinding!!.addMoney.visibility=View.VISIBLE
        }
    }

    inner class ItemEventListener : ClickListener() {
        override fun ondeleteAccount() {
            // This function is called when click on DELETE button
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
     * retry api calling  on click of try again
     *
     */
    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            initializeAdapter()
            viewDataBinding!!.groupMain.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

            mRewardsViewModel.callWalletAPI(AppPreference.getInstance(this))
            mRewardsViewModel.callTransactionList(
                false,
                AppPreference.getInstance(this),
                "",
                "",
                "",
                "",
                "",
                "0",
                "10"
            )
        } else {
            viewDataBinding!!.groupMain.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    /**
     * This method is called when click on back button
     */
    override fun onBackPressed() {
        finishActivity()
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getWalletResponse(walletResponse: WalletResponse) {
        viewDataBinding!!.viewBackground.visibility = View.VISIBLE

        if (walletResponse.data!!.totalWalletAmount.contains(".")) {

            val userType = AppPreference.getInstance(this@WalletActivity!!).getValue(PreferenceKeys.USER_TYPE)

            if (userType.equals(AppConstants.SECONDARY_SIGNUP)) {
                viewDataBinding!!.totalCashback.text =
                    "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", walletResponse.data!!.secondaryUserLimit.toFloat())}"
            }else{
                viewDataBinding!!.totalCashback.text =
                    "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", walletResponse.data!!.totalWalletAmount.toFloat())}"
            }

        } else {
            viewDataBinding!!.totalCashback.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", walletResponse.data!!.totalWalletAmount.toLong())}"
        }

        if (walletResponse.data!!.debitWalletAmount.contains(".")) {
            viewDataBinding!!.sentAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", walletResponse.data!!.debitWalletAmount.toFloat())}"
        } else {
            viewDataBinding!!.sentAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", walletResponse.data!!.debitWalletAmount.toLong())}"
        }
        if (walletResponse.data!!.creditWalletAmount.contains(".")) {
            viewDataBinding!!.receiveAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", walletResponse.data!!.creditWalletAmount.toFloat())}"
        } else {
            viewDataBinding!!.receiveAmount.text =
                "${AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", walletResponse.data!!.creditWalletAmount.toLong())}"
        }
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        transactionList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.transactionRecycler.layoutManager = linearLayoutManager
        transactListAdapter = WalletTransactionAdapter(
            this,
            transactionList!!
        )
        viewDataBinding!!.transactionRecycler.adapter = transactListAdapter

        viewDataBinding!!.transactionRecycler.addItemDecoration(
            DividerItemDecoration(
                viewDataBinding!!.transactionRecycler.getContext(),
                DividerItemDecoration.VERTICAL
            )
        )

        transactListAdapter!!.setOntemClickListener(object :
            WalletTransactionAdapter.OnItemClickListener {
            override fun onItemClicked(img:CircleImageView,position: Int) {
                val intent = Intent(this@WalletActivity, TransactionDetailsActivity::class.java)
                intent.putExtra(
                    AppConstants.TRANSACTION_ID,
                    transactionList!![position].id.toString()
                )
                val p1: androidx.core.util.Pair<View?, String> =
                    androidx.core.util.Pair(img as View?, "imagePass")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                    val options =
                        ActivityOptionsCompat.makeSceneTransitionAnimation(
                            this@WalletActivity, p1
                        )
                    startActivity(intent, options.toBundle())
                } else {
                    startActivity(intent)
                }
            }
        })

        var isLastPage = false
        viewDataBinding!!.scrollView.setOnScrollChangeListener { v: NestedScrollView?, scrollX: Int, scrollY: Int, oldScrollX: Int, oldScrollY: Int ->
            val nestedScrollView = checkNotNull(v) {
                return@setOnScrollChangeListener
            }
            val lastChild = nestedScrollView.getChildAt(nestedScrollView.childCount - 1)
                if (!isLoading && lastChild != null && (scrollY >= (lastChild.measuredHeight - nestedScrollView.measuredHeight)) && scrollY > oldScrollY && !isLoading && !isLastPage) {
                    //get more items
                        loadMoreItems()
                }
        }

    }

    fun loadMoreItems() {
        if (checkIfInternetOn()) {
            isLoading = true
            page += 1

            mRewardsViewModel.callTransactionList(
                true,
                AppPreference.getInstance(this),
                "",
                "",
                "",
                "",
                "",
                transactionList!!.size.toString(),
                "10"
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

    /**
     * This method is called when getting response after calling API.
     */
    override fun getTransactionListResponse(transactionListResponse: TransactionListResponse) {
        viewDataBinding!!.groupMain.visibility = View.VISIBLE
        viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

        if (transactionListResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.viewBackground.visibility = View.VISIBLE
            viewDataBinding!!.txtNoArticalFound.visibility = View.GONE
            viewDataBinding!!.transactionRecycler.visibility = View.VISIBLE
            transactionList!!.addAll(transactionListResponse.data!!.rows)
            transactListAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.viewBackground.visibility = View.VISIBLE
            viewDataBinding!!.txtNoArticalFound.visibility = View.VISIBLE
            viewDataBinding!!.transactionRecycler.visibility = View.GONE
        }

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                transactionListResponse.data!!.total,
                10
            )
        ) {
            isLoading = true
        }
    }
}