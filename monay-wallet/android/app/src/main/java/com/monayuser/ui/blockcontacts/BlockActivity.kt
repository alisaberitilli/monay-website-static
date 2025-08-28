package com.monayuser.ui.blockcontacts

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.BlockListResponse
import com.monayuser.data.model.response.BlockUnBlockResponse
import com.monayuser.data.model.response.UserSearchResponse
import com.monayuser.databinding.ActivityBlockBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.blockcontacts.adapter.BlockAdapter
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils

class BlockActivity : BaseActivity<ActivityBlockBinding, BlockViewModel>(),
    BlockNavigator {

    private var blockList: ArrayList<RecentUserData>? = null
    private var page = 1
    private var linearLayoutManager: LinearLayoutManager? = null
    private var isLoading = false
    private var blockAdapter: BlockAdapter? = null
    var mBlockViewModel: BlockViewModel = BlockViewModel()

    override val bindingVariable: Int
        get() = BR.blockVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.activity_block

    override val viewModel: BlockViewModel
        get() = mBlockViewModel

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = ContextCompat.getColor(this@BlockActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mBlockViewModel.navigator = this
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
        initializeAdapter()

        if (checkIfInternetOn()) {
            mBlockViewModel.callBlockedist(false, AppPreference.getInstance(this), "0", "10")
        } else {
            tryAgain()
        }
    }

    override fun onResume() {
        super.onResume()
        page = 1
        mBlockViewModel.initView()
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

            mBlockViewModel.callBlockedist(false, AppPreference.getInstance(this), "0", "10")

        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    /**
     * This method is used to show network error alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this)
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
        showProgressDialog(this, resources.getString(R.string.LOADING))
    }

    inner class ItemEventListener : ClickListener() {

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
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        blockList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.rvBlock.layoutManager = linearLayoutManager
        blockAdapter = BlockAdapter(
            this,
            blockList!!, false
        )
        viewDataBinding!!.rvBlock.adapter = blockAdapter

        viewDataBinding!!.rvBlock.addItemDecoration(
            DividerItemDecoration(
                viewDataBinding!!.rvBlock.getContext(),
                DividerItemDecoration.VERTICAL
            )
        )

        blockAdapter!!.setOnItemClickListener(object :
            BlockAdapter.OnItemClickListener {
            override fun onItemClicked(position: Int) {
                if (checkIfInternetOn()) {
                    mBlockViewModel.callBlockAndUnBlockAPI(
                        AppPreference.getInstance(this@BlockActivity),
                        blockList!![position].blockUser!!.id!!.toString(),
                        position
                    )
                }
            }
        })

        viewDataBinding!!.rvBlock.addOnScrollListener(object : RecyclerView.OnScrollListener() {
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

            mBlockViewModel.callBlockedist(
                true,
                AppPreference.getInstance(this),
                blockList!!.size.toString(),
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

    override fun clickOnBlockContacts() {
        // This function is called when click on block button
    }

    override fun clickOnBackButton() {
        onBackPressed()
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getBlockedUserList(blockListResponse: BlockListResponse) {
        if (blockListResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.rvBlock.visibility = View.VISIBLE
            blockList!!.addAll(blockListResponse.data!!.rows)
            blockAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.rvBlock.visibility = View.GONE
        }

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                blockListResponse.data!!.total,
                10
            )
        ) {
            isLoading = true
        }
    }

    override fun getUnBlockedUserList(userSearchResponse: UserSearchResponse) {
        // This function is used for getting un-blockable list
    }

    override fun getBlockAndUnBlockResponse(
        blockUnBlockResponse: BlockUnBlockResponse,
        position: Int
    ) {
        blockList!!.removeAt(position)
        blockAdapter!!.notifyDataSetChanged()

        if (blockList!!.size == 0) {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.rvBlock.visibility = View.GONE
        }
    }

    override fun filterCancel() {
        // This function is called when click on cancel button
    }
}
