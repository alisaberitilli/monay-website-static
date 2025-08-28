package com.monayuser.ui.myrequest

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import androidx.core.app.ActivityOptionsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.response.MyRequestResponse
import com.monayuser.databinding.FragmentMyRequestBinding
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.subpaymentrequest.adapter.SubPaymentRequestAdapter
import com.monayuser.ui.transactiondetails.TransactionDetailsActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import de.hdodenhof.circleimageview.CircleImageView

class MyRequestFragment :
    BaseFragment<FragmentMyRequestBinding, MyRequestViewModel>(),
    MyRequestNavigator {

    private var subPaymentRequestAdapter: SubPaymentRequestAdapter? = null
    private var page = 1
    private var isLoading: Boolean = false
    var mMyRequestViewModel: MyRequestViewModel = MyRequestViewModel()
    private var list: ArrayList<RecentTransaction> = ArrayList()
    override val bindingVariable: Int
        get() = BR.myRequestVM
    lateinit var appPreferences: AppPreference

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.fragment_my_request

    override val viewModel: MyRequestViewModel
        get() = mMyRequestViewModel

    /**
     * This method is main method of classs
     */
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mMyRequestViewModel.navigator = this
        appPreferences = AppPreference.getInstance(requireActivity())
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            requireActivity(),
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is used to initialize variable and call a API.
     */
    override fun init() {
        initializeAdapter()

        if (checkIfInternetOn()) {
            mMyRequestViewModel.callMyRequestAPI(
                false,
                AppPreference.getInstance(requireActivity()),
                "0",
                "10"
            )
        } else {
            tryAgain()
        }
    }

    override fun onResume() {
        super.onResume()
        mMyRequestViewModel.initView()
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        list = ArrayList()
        val linearLayoutManager = LinearLayoutManager(requireActivity())
        subPaymentRequestAdapter = SubPaymentRequestAdapter(requireContext(), list, 1)
        viewDataBinding!!.paidRequestRecycler.layoutManager = linearLayoutManager
        viewDataBinding!!.paidRequestRecycler.adapter = subPaymentRequestAdapter

        subPaymentRequestAdapter!!.setOntemClickListener(object :
            SubPaymentRequestAdapter.OnItemClickListener {
            override fun onItemClickedPay(img:CircleImageView,recentTransaction: RecentTransaction) {
                // This method is called when click on pay button
            }

            override fun onItemClickedDeclined(
                recentTransaction: RecentTransaction,
                position: Int
            ) {
            // This method is called when click on declined button
            }

            override fun onItemClicked(img: CircleImageView, position: Int) {
                if (list[position].transaction != null) {
                    val intent = Intent(requireContext(), TransactionDetailsActivity::class.java)
                    intent.putExtra(
                        AppConstants.TRANSACTION_ID,
                        list!![position].transaction!!.id.toString()
                    )
                    val p1: androidx.core.util.Pair<View?, String> =
                        androidx.core.util.Pair(img as View?, "imagePass")
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                        val options =
                            ActivityOptionsCompat.makeSceneTransitionAnimation(
                                activity!!,p1)
                        startActivity(intent, options.toBundle())
                    } else {
                        startActivity(intent)
                    }
                } else {
                    val intent = Intent(requireContext(), TransactionDetailsActivity::class.java)
                    intent.putExtra(
                        AppConstants.TRANSACTION,
                        list[position]
                    )
                    val p1: androidx.core.util.Pair<View?, String> =
                        androidx.core.util.Pair(img as View?, "imagePass")
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                        val options =
                            ActivityOptionsCompat.makeSceneTransitionAnimation(
                                activity!!,p1)
                        startActivity(intent, options.toBundle())
                    } else {
                        startActivity(intent)
                    }
                }
            }
        })

        viewDataBinding!!.paidRequestRecycler.addOnScrollListener(object :
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
        isLoading = true
        page += 1
        if (checkIfInternetOn()) {
            mMyRequestViewModel.callMyRequestAPI(
                true,
                AppPreference.getInstance(activity!!),
                list.size.toString(),
                "10"
            )
        }
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(activity!!)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
            mMyRequestViewModel.callMyRequestAPI(
                false,
                AppPreference.getInstance(activity!!),
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
     * This method is used to show progress bar
     */
    override fun showPageLoader() {
        viewDataBinding!!.progress.visibility = View.VISIBLE
    }

    /**
     * This method is used to hide progress bar
     */
    override fun showHideLoader() {
        viewDataBinding!!.progress.visibility = View.GONE
    }

    override fun getMyRequestListData(myRequestResponse: MyRequestResponse) {
        viewDataBinding!!.mainLayout.visibility = View.VISIBLE
        viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
        if (myRequestResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.txtNoArticalFound.visibility = View.GONE
            viewDataBinding!!.paidRequestRecycler.visibility = View.VISIBLE
            list.addAll(myRequestResponse!!.data!!.rows)
            subPaymentRequestAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.txtNoArticalFound.visibility = View.VISIBLE
            viewDataBinding!!.paidRequestRecycler.visibility = View.GONE
        }

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                myRequestResponse.data!!.total,
                10
            )
        ) {
            isLoading = true
        }
    }

    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(activity!!)
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
        showProgressDialog(activity!!, resources.getString(R.string.LOADING))
    }

    inner class ItemEventListener : ClickListener() {

        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName =
                activity!!.packageName // getPackageName() from Context or Activity object
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
}