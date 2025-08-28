package com.monayuser.ui.subpaymentrequest

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import androidx.core.app.ActivityOptionsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.DeclinedPaymentRequestResponse
import com.monayuser.data.model.response.PaymentRequestResponse
import com.monayuser.databinding.FragmentSubPaymentRequestBinding
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.paymoneyfromprimarywallet.PayMoneyFromPrimaryActivity
import com.monayuser.ui.subpaymentrequest.adapter.SubPaymentRequestAdapter
import com.monayuser.ui.transactiondetails.TransactionDetailsActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import de.hdodenhof.circleimageview.CircleImageView
import java.io.Serializable

class SubPaymentRequestFragment(int: Int) :
    BaseFragment<FragmentSubPaymentRequestBinding, SubPaymentRequestViewModel>(),
    SubPaymentRequestNavigator {

    private var subPaymentRequestAdapter: SubPaymentRequestAdapter? = null
    private var page = 1
    private var isLoading: Boolean = false
    var index: Int = int
    var paymentRequest: String = ""
    var mSubPaymentRequestViewModel: SubPaymentRequestViewModel = SubPaymentRequestViewModel()
    private var list: ArrayList<RecentTransaction> = ArrayList()

    override val bindingVariable: Int
        get() = BR.sunPaymentRequestVM
    lateinit var appPreferences: AppPreference

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.fragment_sub_payment_request

    override val viewModel: SubPaymentRequestViewModel
        get() = mSubPaymentRequestViewModel

    /**
     * This method is main method of class
     */
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mSubPaymentRequestViewModel.navigator = this
        appPreferences = AppPreference.getInstance(activity!!)
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            activity!!,
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
        if (index == 0) {
            paymentRequest = AppConstants.RECEIVED_REQUEST
        } else if (index == 1) {
            paymentRequest = AppConstants.MY_REQUEST
        } else if (index == 2) {
            paymentRequest = AppConstants.PAID_REQUEST
        } else if (index == 3) {
            paymentRequest = AppConstants.DECLINED_REQUEST
        }

        if (checkIfInternetOn()) {
            mSubPaymentRequestViewModel.paymentRequestApi(
                false,
                AppPreference.getInstance(activity!!),
                "0",
                "10",
                paymentRequest
            )
        } else {
            tryAgain()
        }
    }

    override fun onResume() {
        super.onResume()
        mSubPaymentRequestViewModel.initView()
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        list = ArrayList()
        val linearLayoutManager = LinearLayoutManager(activity!!)
        subPaymentRequestAdapter = SubPaymentRequestAdapter(requireContext(), list, index)
        viewDataBinding!!.paidRequestRecycler.layoutManager = linearLayoutManager
        viewDataBinding!!.paidRequestRecycler.adapter = subPaymentRequestAdapter

        subPaymentRequestAdapter!!.setOntemClickListener(object :
            SubPaymentRequestAdapter.OnItemClickListener {
            override fun onItemClickedPay(img:CircleImageView,recentTransaction: RecentTransaction) {
                var recentUserData = RecentUserData()
                recentUserData.id = recentTransaction.fromUser!!.id
                recentUserData.firstName = recentTransaction.fromUser!!.firstName
                recentUserData.lastName = recentTransaction.fromUser!!.lastName
                recentUserData.amount = recentTransaction.amount!!.toString()
                recentUserData.phoneNumberCountryCode =
                    recentTransaction.fromUser!!.phoneNumberCountryCode
                recentUserData.phoneNumber = recentTransaction.fromUser!!.phoneNumber
                recentUserData.requestId = recentTransaction!!.id
                recentUserData.profilePictureUrl = recentTransaction.fromUser.profilePictureUrl

                var userType =  AppPreference.getInstance(activity!!).getValue(
                    PreferenceKeys.USER_TYPE)

                if(userType!!.equals(AppConstants.SECONDARY_SIGNUP)){

                    val intent = Intent(requireContext(), PayMoneyFromPrimaryActivity::class.java)
                    intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                    intent.putExtra(AppConstants.COME_FROM, "PaymentRequest")
                    intent.putExtra(AppConstants.CONTACT_USER_DATA, recentUserData as Serializable?)

                    val p1: androidx.core.util.Pair<View?, String> =
                        androidx.core.util.Pair(img as View?, "imagePass")
                    val options =
                        ActivityOptionsCompat.makeSceneTransitionAnimation(
                            activity!!, p1
                        )
                    startActivity(intent, options.toBundle())

                }else{

                    val intent = Intent(requireContext(), PayMoneyActivity::class.java)
                    intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                    intent.putExtra(AppConstants.COME_FROM, "PaymentRequest")
                    intent.putExtra(AppConstants.CONTACT_USER_DATA, recentUserData as Serializable?)

                    val p1: androidx.core.util.Pair<View?, String> =
                        androidx.core.util.Pair(img as View?, "imagePass")
                    val options =
                        ActivityOptionsCompat.makeSceneTransitionAnimation(
                            activity!!, p1
                        )
                    startActivity(intent, options.toBundle())
                }

            }

            override fun onItemClickedDeclined(
                recentTransaction: RecentTransaction,
                position: Int
            ) {
                showDeclineDialog(position, recentTransaction!!.id.toString())
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
                } else if (index == 3){
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

        paidRequestRecycler.addOnScrollListener(object : RecyclerView.OnScrollListener() {
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
     * This method is used to show filter dialog
     */
    fun showDeclineDialog(position: Int, id: String) {
        val dialog = BottomSheetDialog(activity!!)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_decline, null)

        bottomSheet.ic_cross.setOnClickListener { dialog.dismiss() }

        bottomSheet.btn_no.setOnClickListener { dialog.dismiss() }

        bottomSheet.btn_yes.setOnClickListener {
            var reason = bottomSheet.et_reason.text.toString().trim()

            if (checkIfInternetOn()) {

                mSubPaymentRequestViewModel.declinedPaymentRequestApi(
                    AppPreference.getInstance(
                        activity!!
                    ), id.toString(), reason, position
                )
                dialog.dismiss()

            }
        }

        dialog.setContentView(bottomSheet)
        dialog.show()
    }

    override fun declinedPaymentRequestResponse(
        declinedPaymentRequestResponse: DeclinedPaymentRequestResponse,
        position: Int
    ) {
        list.removeAt(position)
        subPaymentRequestAdapter!!.notifyDataSetChanged()

        if (list.size == 0) {
            viewDataBinding!!.txtNoArticalFound.visibility = View.VISIBLE
            viewDataBinding!!.paidRequestRecycler.visibility = View.GONE
        }
    }

    fun loadMoreItems() {
        isLoading = true
        page += 1
        if (index == 0) {
            paymentRequest = AppConstants.RECEIVED_REQUEST
        } else if (index == 1) {
            paymentRequest = AppConstants.MY_REQUEST
        } else if (index == 2) {
            paymentRequest = AppConstants.PAID_REQUEST

        } else if (index == 3) {
            paymentRequest = AppConstants.DECLINED_REQUEST
        }
        if (checkIfInternetOn()) {
            mSubPaymentRequestViewModel.paymentRequestApi(
                true,
                AppPreference.getInstance(activity!!),
                list.size.toString(),
                "10",
                paymentRequest
            )
        }
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(activity!!)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
            mSubPaymentRequestViewModel.paymentRequestApi(
                false,
                AppPreference.getInstance(activity!!),
                "0",
                "10",
                paymentRequest
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

    override fun paymentRequestResponse(paymentRequestResponse: PaymentRequestResponse) {
        viewDataBinding!!.mainLayout.visibility = View.VISIBLE
        viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
        if (paymentRequestResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.txtNoArticalFound.visibility = View.GONE
            viewDataBinding!!.paidRequestRecycler.visibility = View.VISIBLE
            list!!.addAll(paymentRequestResponse!!.data!!.rows)
            subPaymentRequestAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.txtNoArticalFound.visibility = View.VISIBLE
            viewDataBinding!!.paidRequestRecycler.visibility = View.GONE
        }

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                paymentRequestResponse.data!!.total,
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