package com.monayuser.ui.primaryuserlist

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
import com.monayuser.data.model.bean.PrimaryAccountUser
import com.monayuser.data.model.bean.SecondaryAccountUser
import com.monayuser.data.model.bean.SecondaryUser
import com.monayuser.data.model.response.PrimaryUserListResponse
import com.monayuser.data.model.response.SecondaryUserListResponse
import com.monayuser.databinding.ActivityPrimaryUserBinding
import com.monayuser.databinding.ActivitySecondaryAccountBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.primaryuserlist.adapter.PrimaryUserListAdapter
import com.monayuser.ui.secondaryuserdetail.SecondaryUserDetailActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils

class PrimaryUserListActivity : BaseActivity<ActivityPrimaryUserBinding, PrimaryUserListViewModel>(),
    PrimaryUserListNavigator {

    var mViewModel: PrimaryUserListViewModel = PrimaryUserListViewModel()
    override val viewModel: PrimaryUserListViewModel get() = mViewModel

    var selectCode: String? = null
    private var page = 1
    override val bindingVariable: Int get() = BR.primaryUserListVM

    override val layoutId: Int get() = R.layout.activity_primary_user
    private var primaryUserList: ArrayList<PrimaryAccountUser>? = null
    private var linearLayoutManager: LinearLayoutManager? = null
    private var primaryUserListAdapter: PrimaryUserListAdapter? = null
    private var isLoading = false
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@PrimaryUserListActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mViewModel.navigator = this
        mViewModel.initView()
    }
    override fun init() {
        initializeAdapter()
        if (checkIfInternetOn()) {
            mViewModel.callPrimaryAccountListAPI(false,
                AppPreference.getInstance(this@PrimaryUserListActivity),
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
        primaryUserList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.rvPrimaryAccounts.layoutManager = linearLayoutManager
        primaryUserListAdapter = PrimaryUserListAdapter(this, primaryUserList!!)
        viewDataBinding!!.rvPrimaryAccounts.adapter = primaryUserListAdapter
        primaryUserListAdapter!!.setOntemClickListener(object :
            PrimaryUserListAdapter.OnItemClickListener {
            override fun onInfoItemClicked(item: SecondaryAccountUser, position: Int) {
                val intent = Intent(this@PrimaryUserListActivity, SecondaryUserDetailActivity::class.java)
                intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.SECONDARY_ACCOUNT_SCREEEN)
                intent.putExtra(AppConstants.USER_ID, item.id)
                intent.putExtra(AppConstants.USER_FIRST_NAME, item.firstName)
                intent.putExtra(AppConstants.USER_LAST_NAME, item.lastName)
                intent.putExtra(AppConstants.USER_COUNTRY_CODE, item.phoneNumberCountryCode)
                intent.putExtra(AppConstants.USER_PHONE_NUMBER, item.phoneNumber)
                intent.putExtra(AppConstants.USER_IMAGE, item.profilePictureUrl)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                startActivity(intent)
            }
        })
        UserScrollMethod()
    }
    private fun UserScrollMethod() {
        viewDataBinding!!.rvPrimaryAccounts.addOnScrollListener(object :
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
            mViewModel.callPrimaryAccountListAPI(true,
                AppPreference.getInstance(this@PrimaryUserListActivity),
                primaryUserList!!.size.toString(),
                "10"
            )
        }
    }
    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this@PrimaryUserListActivity)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.rvPrimaryAccounts.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.visibility = View.GONE
            viewDataBinding!!.tryAgain.visibility = View.GONE
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            mViewModel.callPrimaryAccountListAPI(false,
                AppPreference.getInstance(this@PrimaryUserListActivity),
                "0",
                "10")
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.rvPrimaryAccounts.visibility = View.GONE
            viewDataBinding!!.noInternet.visibility = View.VISIBLE
            viewDataBinding!!.tryAgain.visibility = View.VISIBLE
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    override fun getPrimaryUserListResponse(getListResponse: PrimaryUserListResponse) {
        primaryUserList!!.addAll(getListResponse.data!!.rows)
        if (primaryUserList!!.isEmpty())
        {
            viewDataBinding!!.tvNoRecord.visibility= View.VISIBLE
            viewDataBinding!!.rvPrimaryAccounts.visibility= View.GONE
        }
        else
        {
            viewDataBinding!!.tvNoRecord.visibility= View.GONE
            viewDataBinding!!.rvPrimaryAccounts.visibility= View.VISIBLE
        }
        primaryUserListAdapter!!.notifyDataSetChanged()

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
        DialogUtils.sessionExpireDialog(this@PrimaryUserListActivity)
    }

    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@PrimaryUserListActivity, resources.getString(R.string.oops), error!!, ItemEventListener()
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