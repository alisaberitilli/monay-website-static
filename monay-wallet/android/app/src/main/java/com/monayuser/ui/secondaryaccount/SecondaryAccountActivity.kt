package com.monayuser.ui.secondaryaccount

import android.app.Activity
import android.app.Application
import android.app.Instrumentation
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.bean.SecondaryAccountUser
import com.monayuser.data.model.bean.SecondaryUser
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.data.model.response.SecondaryUserListResponse

import com.monayuser.databinding.ActivitySecondaryAccountBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.secondaryaccount.adapter.SecondaryUserListAdapter
import com.monayuser.ui.secondaryuserdetail.SecondaryUserDetailActivity
import com.monayuser.ui.secondaryusertransaction.SecondaryUserTransactionListActivity
import com.monayuser.utils.AppConstants

import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils


class SecondaryAccountActivity : BaseActivity<ActivitySecondaryAccountBinding,SecondaryAccountViewModel>(),SecondaryAccountNavigator {

    var mViewModel: SecondaryAccountViewModel = SecondaryAccountViewModel()
    override val viewModel: SecondaryAccountViewModel get() = mViewModel

    var selectCode: String? = null
    private var page = 1
    override val bindingVariable: Int get() = BR.secondaryAccountVM

    override val layoutId: Int get() = R.layout.activity_secondary_account
    private var secondaryUserList: ArrayList<SecondaryUser>? = null
    private var linearLayoutManager: LinearLayoutManager? = null
    private var secondaryUserListAdapter: SecondaryUserListAdapter? = null
    private var isLoading = false
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@SecondaryAccountActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mViewModel.navigator = this
        mViewModel.initView()
    }
    override fun init() {
        initializeAdapter()
        if (checkIfInternetOn()) {
            mViewModel.callSecondaryAccountListAPI(false,
                AppPreference.getInstance(this@SecondaryAccountActivity),
                "0",
                "10"
            )
        } else {
            tryAgain()
        }
    }


    /**
     * This method is used to initialize an adapter.
     */
    private fun initializeAdapter() {
        secondaryUserList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.rvSecondaryAccounts.layoutManager = linearLayoutManager
        secondaryUserListAdapter = SecondaryUserListAdapter(this, secondaryUserList!!)
        viewDataBinding!!.rvSecondaryAccounts.adapter = secondaryUserListAdapter
        secondaryUserListAdapter!!.setOntemClickListener(object :
            SecondaryUserListAdapter.OnItemClickListener {
            override fun onItemClicked(item: SecondaryAccountUser, position: Int) {
                secondaryUserListAdapter!!.updatePosition(position)
                val intent = Intent(this@SecondaryAccountActivity, SecondaryUserTransactionListActivity::class.java)
                intent.putExtra(AppConstants.USER_ID, item.id)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                startActivity(intent)

            }
            override fun onInfoItemClicked(item: SecondaryUser, position: Int) {

                    CommonUtils.ActivityNavigator.startActivityForResult(this@SecondaryAccountActivity, SecondaryUserDetailActivity::class.java,
                    bundleOf(Pair(AppConstants.SCREEN_FROM, AppConstants.SECONDARY_ACCOUNT_SCREEEN),
                        Pair(AppConstants.USER_ID, item.User.id),
                        Pair(AppConstants.USER_FIRST_NAME, item.User.firstName),
                        Pair(AppConstants.USER_LAST_NAME, item.User.lastName),
                        Pair(AppConstants.USER_COUNTRY_CODE, item.User.phoneNumberCountryCode),
                        Pair(AppConstants.USER_PHONE_NUMBER, item.User.phoneNumber),
                        /*Pair(AppConstants.SECONDARY_USER_WALLET_AMOUNT, item.limit.toString()),*/
                        Pair(AppConstants.USER_IMAGE, item.User.profilePictureUrl)),resultLauncher,null)
            }
        })
        UserScrollMethod()
    }

    var resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            if (checkIfInternetOn()) {
                secondaryUserList!!.clear()
                mViewModel.callSecondaryAccountListAPI(false,
                    AppPreference.getInstance(this@SecondaryAccountActivity),
                    "0",
                    "10"
                )
            } else {
                tryAgain()
            }
        }
    }



    private fun UserScrollMethod() {
        viewDataBinding!!.rvSecondaryAccounts.addOnScrollListener(object :
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
            mViewModel.callSecondaryAccountListAPI(true,
                AppPreference.getInstance(this@SecondaryAccountActivity),
                secondaryUserList!!.size.toString(),
                "10"
            )
        }
    }
    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this@SecondaryAccountActivity)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.rvSecondaryAccounts.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.visibility = View.GONE
            viewDataBinding!!.tryAgain.visibility = View.GONE
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            mViewModel.callSecondaryAccountListAPI(false,
                AppPreference.getInstance(this@SecondaryAccountActivity),
                "0",
                "10")
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.rvSecondaryAccounts.visibility = View.GONE
            viewDataBinding!!.noInternet.visibility = View.VISIBLE
            viewDataBinding!!.tryAgain.visibility = View.VISIBLE
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    override fun getSecondaryAccountListResponse(getListResponse: SecondaryUserListResponse) {
        secondaryUserList!!.addAll(getListResponse.data!!.rows)
        if (secondaryUserList!!.isEmpty())
        {
            viewDataBinding!!.tvNoRecord.visibility=View.VISIBLE
            viewDataBinding!!.rvSecondaryAccounts.visibility=View.GONE
        }
        else
        {
            viewDataBinding!!.tvNoRecord.visibility=View.GONE
            viewDataBinding!!.rvSecondaryAccounts.visibility=View.VISIBLE
            viewDataBinding!!.rvSecondaryAccounts
        }
        secondaryUserListAdapter!!.notifyDataSetChanged()

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                getListResponse.data!!.count,
                10
            )
        ) {
            isLoading = true
        }
    }

    override fun backToPreviousActivity() {
        onBackPressed()
    }
    override fun showNetworkError(error: String?) {
        //DialogUtils.sessionExpireDialog(this@SecondaryAccountActivity)
    }

    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@SecondaryAccountActivity)
    }

    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SecondaryAccountActivity, resources.getString(R.string.oops), error!!, ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {

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
    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun showHideLoader() {
        viewDataBinding!!.progress.visibility = View.GONE
    }

    override fun showPageLoader() {
        viewDataBinding!!.progress.visibility = View.VISIBLE
    }

}