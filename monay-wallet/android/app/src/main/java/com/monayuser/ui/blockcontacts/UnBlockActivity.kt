package com.monayuser.ui.blockcontacts

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
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

class UnBlockActivity : BaseActivity<ActivityBlockBinding, BlockViewModel>(),
    BlockNavigator {

    private var blockList: ArrayList<RecentUserData>? = null
    private var page = 1
    private var linearLayoutManager: LinearLayoutManager? = null
    private var isLoading = false
    private var blockAdapter: BlockAdapter? = null
    private var name = ""
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
            window.statusBarColor =
                ContextCompat.getColor(this@UnBlockActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mBlockViewModel.navigator = this
        mBlockViewModel.initView()
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
        viewDataBinding!!.tvText.text = getString(R.string.contacts)
        viewDataBinding!!.searchEdit.visibility = View.VISIBLE
        viewDataBinding!!.crossImage.visibility = View.VISIBLE
        viewDataBinding!!.tvBlockContact.visibility = View.GONE
        viewDataBinding!!.tvTitle.visibility = View.GONE

        initializeAdapter()
        if (checkIfInternetOn()) {
            mBlockViewModel.callUnBlockedist(
                false,
                AppPreference.getInstance(this),
                name,
                "0",
                "10"
            )
        } else {
            tryAgain()
        }

        viewDataBinding!!.searchEdit.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(
                s: CharSequence,
                start: Int,
                count: Int,
                after: Int
            ) {
                //  This method is not used for this functionality
            }

            override fun onTextChanged(
                s: CharSequence,
                start: Int,
                before: Int,
                count: Int
            ) {
                page = 1
                blockList!!.clear()
                name = s.toString()
                if (checkIfInternetOn()) {
                    mBlockViewModel.callUnBlockedist(
                        false,
                        AppPreference.getInstance(this@UnBlockActivity),
                        name,
                        "0",
                        "10"
                    )
                }
            }

            override fun afterTextChanged(s: Editable) {
                //  This method is not used for this functionality
            }
        })
    }

    /**
     * This method is called when click on cancel button
     */
    override fun filterCancel() {
        name = ""
        page = 1
        blockList!!.clear()
        viewDataBinding!!.searchEdit.setText("")
        hideKeyboard()
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

            mBlockViewModel.callUnBlockedist(
                false,
                AppPreference.getInstance(this),
                name,
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
            blockList!!, true
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
                        AppPreference.getInstance(this@UnBlockActivity),
                        blockList!![position].id!!.toString(),
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

            mBlockViewModel.callUnBlockedist(
                true,
                AppPreference.getInstance(this),
                name,
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
    override fun getUnBlockedUserList(userSearchResponse: UserSearchResponse) {
        if (userSearchResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.rvBlock.visibility = View.VISIBLE
            blockList!!.addAll(userSearchResponse.data!!.rows)
            blockAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.rvBlock.visibility = View.GONE
        }

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                userSearchResponse.data!!.total,
                10
            )
        ) {
            isLoading = true
        }
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getBlockedUserList(blockListResponse: BlockListResponse) {
        // This function is used for getting block user list
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
}
