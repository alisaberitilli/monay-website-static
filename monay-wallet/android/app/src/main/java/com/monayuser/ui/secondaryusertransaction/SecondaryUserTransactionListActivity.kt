package com.monayuser.ui.secondaryusertransaction

import android.app.DatePickerDialog
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.DatePicker
import android.widget.TextView
import androidx.core.app.ActivityOptionsCompat
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.databinding.ActivitySecondaryUserTransactionBinding

import com.monayuser.ui.base.BaseActivity

import com.monayuser.ui.mytransaction.adpter.TextFilterAdapter
import com.monayuser.ui.secondaryusertransaction.adapter.SecondaryUserTransactionAdapter
import com.monayuser.ui.transactiondetails.TransactionDetailsActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import de.hdodenhof.circleimageview.CircleImageView
import java.lang.Exception
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

class SecondaryUserTransactionListActivity : BaseActivity<ActivitySecondaryUserTransactionBinding, SecondaryUserTransactionViewModel>(),
    SecondaryUserTransactionListNavigator {

    private var transactionList: ArrayList<RecentTransaction>? = null
    private var page = 1
    private var linearLayoutManager: LinearLayoutManager? = null
    private var linearLayoutManager1: LinearLayoutManager? = null
    private var isLoading = false
    private var transactListAdapter: SecondaryUserTransactionAdapter? = null
    private var textFilterAdapter: TextFilterAdapter? = null
    private var filterList = ArrayList<HashMap<String, String>>()
    private var fromDate = ""
    private var toDate = ""
    private var name = ""
    private var transactionType = ""
    private var minPrice = ""
    private var maxPrice = ""
    var toMonth = 0
    var toDay = 0
    var toYear = 0
    var secondaryUserId=0
    var searchFilter: Boolean = false
    var mTransactionViewModel: SecondaryUserTransactionViewModel = SecondaryUserTransactionViewModel()

    override val bindingVariable: Int
        get() = BR.secondaryUserTransaction

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.activity_secondary_user_transaction

    override val viewModel: SecondaryUserTransactionViewModel
        get() = mTransactionViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@SecondaryUserTransactionListActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mTransactionViewModel.navigator = this
        mTransactionViewModel.initView()
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

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        if (intent != null) {
            secondaryUserId = intent.getIntExtra(AppConstants.USER_ID, 0)
        }
        initializeAdapter()
       if (checkIfInternetOn()) {
            mTransactionViewModel.callTransactionList(
                false,
                AppPreference.getInstance(this@SecondaryUserTransactionListActivity),
                secondaryUserId,
                "",
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

        }


    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this@SecondaryUserTransactionListActivity)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

            mTransactionViewModel.callTransactionList(
                false,
                AppPreference.getInstance(this@SecondaryUserTransactionListActivity),
                secondaryUserId,
                "",
                "",
                "",
                "",
                "",
                "",
                "0",
                "10"
            )
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }


    override fun backToPreviousActivity() {
        finish()
    }

    override fun onBackPressed() {
        finish()
    }
    /**
     * This method is used to show network error alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@SecondaryUserTransactionListActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
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
        showProgressDialog(this@SecondaryUserTransactionListActivity, resources.getString(R.string.LOADING))
    }

    inner class ItemEventListener : ClickListener() {

        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName =
                packageName // getPackageName() from Context or Activity object
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
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        transactionList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this@SecondaryUserTransactionListActivity)
        viewDataBinding!!.recyclerMyTransaction.layoutManager = linearLayoutManager
        transactListAdapter = SecondaryUserTransactionAdapter(
            this@SecondaryUserTransactionListActivity,
            transactionList!!, false
        )
        viewDataBinding!!.recyclerMyTransaction.adapter = transactListAdapter

        viewDataBinding!!.recyclerMyTransaction.addItemDecoration(
            DividerItemDecoration(
                viewDataBinding!!.recyclerMyTransaction.getContext(),
                DividerItemDecoration.VERTICAL
            )
        )

        transactListAdapter!!.setOnItemClickListener(object :
            SecondaryUserTransactionAdapter.OnItemClickListener {
            override fun onItemClicked(img: CircleImageView, position: Int) {

                val intent =
                    Intent(this@SecondaryUserTransactionListActivity, TransactionDetailsActivity::class.java)
                intent.putExtra(
                    AppConstants.TRANSACTION_ID,
                    transactionList!![position].id.toString()
                )
                val p1: androidx.core.util.Pair<View?, String> =
                    androidx.core.util.Pair(img as View?, "imagePass")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                    val options =
                        ActivityOptionsCompat.makeSceneTransitionAnimation(
                            this@SecondaryUserTransactionListActivity, p1
                        )
                    startActivity(intent, options.toBundle())
                } else {
                    startActivity(intent)
                }
            }
        })

        transactionScrollMethod()


    }

    private fun transactionScrollMethod() {
        viewDataBinding!!.recyclerMyTransaction.addOnScrollListener(object :
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

    fun loadMoreItems() {
        if (checkIfInternetOn()) {
            isLoading = true
            page += 1
            mTransactionViewModel.callTransactionList(
                true,
                AppPreference.getInstance(this@SecondaryUserTransactionListActivity),
                secondaryUserId,
                "",
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
        viewDataBinding!!.mainLayout.visibility = View.VISIBLE
        viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

        if (transactionListResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.txtNoArticalFound.visibility = View.GONE
            viewDataBinding!!.recyclerMyTransaction.visibility = View.VISIBLE
            transactionList!!.addAll(transactionListResponse.data!!.rows)
            transactListAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.txtNoArticalFound.visibility = View.VISIBLE
            viewDataBinding!!.recyclerMyTransaction.visibility = View.GONE
            if (searchFilter == true) {
                viewDataBinding!!.txtNoArticalFound.text =
                    resources.getString(R.string.no_result_found)
            } else {
                viewDataBinding!!.txtNoArticalFound.text =
                    resources.getString(R.string.secondary_user_do_not_have_any_transaction)
            }

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