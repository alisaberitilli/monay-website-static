package com.monayuser.ui.home

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.util.Log
import android.view.View
import androidx.core.app.ActivityOptionsCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.PaymentRequest
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.DeclinedPaymentRequestResponse
import com.monayuser.data.model.response.HomeResponse
import com.monayuser.databinding.FragmentHomeBinding
import com.monayuser.ui.addmoneyinwallet.AddMoneyActivity
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.home.adapter.PaymentReqAdapter
import com.monayuser.ui.home.adapter.TransactionListAdapter
import com.monayuser.ui.mycontact.UpdatedContactActivity
import com.monayuser.ui.mytransaction.TransactionFragment
import com.monayuser.ui.navigation.NavigationActivity
import com.monayuser.ui.paymentrequest.PaymentRequestActivity
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.paymoneyfromprimarywallet.PayMoneyFromPrimaryActivity
import com.monayuser.ui.profile.ProfileFragment
import com.monayuser.ui.requestwithdrawal.RequestWithdrawalActivity
import com.monayuser.ui.transactiondetails.TransactionDetailsActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import de.hdodenhof.circleimageview.CircleImageView
import kotlinx.android.synthetic.main.dialog_decline.view.*
import java.io.Serializable
import java.util.*

/**
 * A simple [Fragment] subclass.
 */
class HomeFragment : BaseFragment<FragmentHomeBinding, HomeViewModel>(), HomeNavigator {

    private var linearLayoutManager: LinearLayoutManager? = null
    private var linearLayoutManager1: LinearLayoutManager? = null
    private var isLoading = false
    private var paymentReqAdapter: PaymentReqAdapter? = null
    private var transactionListAdapter: TransactionListAdapter? = null
    private var paymentRequestlList: ArrayList<PaymentRequest>? = null
    private var transactionList: ArrayList<RecentTransaction>? = null
    var mHomeViewModel: HomeViewModel = HomeViewModel()
    var fragment: Fragment? = null
    var fragmentT: Fragment? = null
    var userId: String? = ""
    var requestStatus = false
    lateinit var appPreferences: AppPreference
    private var broadcastReceiverNotification: BroadcastReceiver? = null
    private var badgeCount = 0

    override val bindingVariable: Int
        get() = BR.homeViewModel

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.fragment_home

    override val viewModel: HomeViewModel
        get() = mHomeViewModel

    /**
     * This method is main method of class
     */
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mHomeViewModel.navigator = this
        fragment = ProfileFragment()
        fragmentT = TransactionFragment()
        appPreferences = AppPreference.getInstance(requireContext())
        mHomeViewModel.initView()
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        val intent = Intent(requireContext(), UpdatedContactActivity::class.java)
        if (requestStatus)
            intent.putExtra(AppConstants.TARGET_HOME, AppConstants.TARGET_HOME)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        requestStatus = false
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        val intent = Intent(requireContext(), UpdatedContactActivity::class.java)
        if (requestStatus)
            intent.putExtra(AppConstants.TARGET_HOME, AppConstants.TARGET_HOME)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        requestStatus = false
    }

    /**
     * This method is used to open contact list screen
     */
    override fun sendMoney() {
        requestStatus = false
        val intent = Intent(requireContext(), UpdatedContactActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun withdrawMoney() {
        val intent = Intent(requireContext(), RequestWithdrawalActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun addMoney() {
        val intent = Intent(requireContext(), AddMoneyActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun requestMoney() {
        requestStatus = true
        val intent = Intent(requireContext(), UpdatedContactActivity::class.java)
            intent.putExtra(AppConstants.TARGET_HOME, AppConstants.TARGET_HOME)
            startActivity(intent)
            requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun tryAgain() {
        // This method is called when click on try button
    }

    /**
     * This method is called when click on notification icon.
     */
    override fun openNotification() {
        openNotification(requireActivity())
    }

    override fun viewAllRequest() {
        val intent = Intent(requireContext(), PaymentRequestActivity::class.java)
        intent.putExtra("pay", "pay")
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun viewAllTransaction() {
        (requireActivity() as NavigationActivity).clickOnBottomNavigation(1)
    }

    override fun openProfile() {
        // (requireActivity() as NavigationActivity).clickOnBottomNavigation(2)
        (requireActivity() as NavigationActivity).clickProfile(viewDataBinding!!.imageUser)
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

    override fun onResume() {
        super.onResume()
        initializeAdapter()
        val userType = AppPreference.getInstance(requireActivity()).getValue(PreferenceKeys.USER_TYPE)

            viewDataBinding!!.tvNoRequest.visibility = View.VISIBLE


        viewDataBinding!!.tvNoTransaction.visibility = View.VISIBLE
        if (checkIfInternetOn()) {
            mHomeViewModel.callHomeAPI(AppPreference.getInstance(requireContext()))
        }

        registerNotification()
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        if (appPreferences.getSavedUser(appPreferences).profilePictureUrl != null && !appPreferences.getSavedUser(
                appPreferences
            ).profilePictureUrl.equals("")
        ) {
            CommonUtils.showProfile(
                requireContext(),
                appPreferences.getSavedUser(appPreferences).profilePictureUrl,
                viewDataBinding!!.imageUser
            )
        }

        viewDataBinding!!.userName.text =
            "Hi, ${appPreferences.getSavedUser(appPreferences).firstName} ${appPreferences.getSavedUser(
                appPreferences
            ).lastName}"

        if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true)) {
            viewDataBinding!!.cvWithdraw.visibility = View.VISIBLE
        }

        val userType = AppPreference.getInstance(requireActivity()).getValue(PreferenceKeys.USER_TYPE)

        if (userType.equals(AppConstants.SECONDARY_SIGNUP)) {

            viewDataBinding!!.tvWalletBalance.setText(getString(R.string.total_wallet_balance))

            viewDataBinding!!.btnAddMoney.isEnabled = false
            viewDataBinding!!.btnAddMoney.setBackgroundResource(R.drawable.gray_btn_selector_disable)
            viewDataBinding!!.btnAddMoney.setTextColor(ContextCompat.getColor(requireActivity(), R.color.home_tray_text_color))


            viewDataBinding!!.btnRequestMoney.isEnabled = false
            viewDataBinding!!.btnRequestMoney.setBackgroundResource(R.drawable.gray_btn_selector_disable)
            viewDataBinding!!.btnRequestMoney.setTextColor(ContextCompat.getColor(requireActivity(), R.color.home_tray_text_color))


        /*    viewDataBinding!!.tvNoRequest.visibility = View.GONE

            viewDataBinding!!.recyclerPaymentRequest.visibility = View.GONE
                viewDataBinding!!.paymentRequestTitle.visibility = View.GONE*/



        }else{
            viewDataBinding!!.tvWalletBalance.setText(getString(R.string.wallet_balance))

            viewDataBinding!!.btnAddMoney.isEnabled = true
            viewDataBinding!!.btnAddMoney.setBackgroundResource(R.drawable.gray_btn_selector)
            viewDataBinding!!.btnAddMoney.setTextColor(ContextCompat.getColor(requireActivity(), R.color.colorPrimary))


            viewDataBinding!!.btnRequestMoney.isEnabled = true
            viewDataBinding!!.btnRequestMoney.setBackgroundResource(R.drawable.gray_btn_selector)
            viewDataBinding!!.btnRequestMoney.setTextColor(ContextCompat.getColor(requireActivity(), R.color.colorPrimary))
        }



    }

    /**
     * This method is used to initialize an adapter.
     */
    private fun initializeAdapter() {
        paymentRequestlList = ArrayList()
        linearLayoutManager = LinearLayoutManager(requireContext())
        viewDataBinding!!.recyclerPaymentRequest.layoutManager = linearLayoutManager
        paymentReqAdapter = PaymentReqAdapter(requireContext(), paymentRequestlList!!)
        viewDataBinding!!.recyclerPaymentRequest.adapter = paymentReqAdapter
        transactionList = ArrayList()
        linearLayoutManager1 = LinearLayoutManager(requireContext())
        viewDataBinding!!.recyclerRecentTransaction.layoutManager = linearLayoutManager1
        transactionListAdapter = TransactionListAdapter(requireContext(), transactionList!!, true)
        viewDataBinding!!.recyclerRecentTransaction.adapter = transactionListAdapter

        transactionListAdapter!!.setOnItemClickListener(object :
            TransactionListAdapter.OnItemClickListener {
            override fun onItemClicked(img: CircleImageView, position: Int) {
                val intent =
                    Intent(requireContext(), TransactionDetailsActivity::class.java)
                intent.putExtra(
                    AppConstants.TRANSACTION_ID,
                    transactionList!![position].id.toString()
                )
                val p1: androidx.core.util.Pair<View?, String> =
                    androidx.core.util.Pair(img as View?, "imagePass")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                    val options =
                        ActivityOptionsCompat.makeSceneTransitionAnimation(
                            activity!!, p1
                        )
                    startActivity(intent, options.toBundle())
                } else {
                    startActivity(intent)
                }
            }
        })

        paymentReqAdapter!!.setOnItemClickListener(object :
            PaymentReqAdapter.OnItemClickListener {
            override fun onItemClicked(view: View, position: Int) {
                // This method is called when click on recyclerview's item
            }

            override fun onDeclineButtonClicked(view: View, position: Int) {
                showDeclineDialog(position)
            }

            override fun onPayButtonClicked(img:CircleImageView,view: View, position: Int) {
                var recentUserData = RecentUserData()
                recentUserData.id = paymentRequestlList!![position].fromUser.id
                recentUserData.firstName = paymentRequestlList!![position].fromUser.firstName
                recentUserData.lastName = paymentRequestlList!![position].fromUser.lastName
                recentUserData.amount = paymentRequestlList!![position].amount!!.toString()
                recentUserData.phoneNumberCountryCode =
                    paymentRequestlList!![position].fromUser.phoneNumberCountryCode
                recentUserData.phoneNumber = paymentRequestlList!![position].fromUser.phoneNumber
                recentUserData.profilePictureUrl =
                    paymentRequestlList!![position].fromUser.profilePictureUrl
                recentUserData.requestId = paymentRequestlList!![position].id
                recentUserData.profilePictureUrl =
                    paymentRequestlList!![position].fromUser.profilePictureUrl

                // Manage secondary user cases....
                if (appPreferences.getSavedUser(appPreferences).userType.equals(AppConstants.SECONDARY_SIGNUP)) {

                    val intent = Intent(requireContext(), PayMoneyFromPrimaryActivity::class.java)
                    intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                    //intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                    intent.putExtra(AppConstants.COME_FROM, "PaymentRequest")
                    intent.putExtra(AppConstants.CONTACT_USER_DATA, recentUserData as Serializable?)

                    val p1: androidx.core.util.Pair<View?, String> =
                        androidx.core.util.Pair(img as View?, "imagePass")
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                        val options =
                            ActivityOptionsCompat.makeSceneTransitionAnimation(
                                activity!!, p1
                            )
                        startActivity(intent, options.toBundle())
                    } else {
                        startActivity(intent)
                    }
                }else{
                    val intent = Intent(requireContext(), PayMoneyActivity::class.java)
                    intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                    //intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                    intent.putExtra(AppConstants.COME_FROM, "PaymentRequest")
                    intent.putExtra(AppConstants.CONTACT_USER_DATA, recentUserData as Serializable?)

                    val p1: androidx.core.util.Pair<View?, String> =
                        androidx.core.util.Pair(img as View?, "imagePass")
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                        val options =
                            ActivityOptionsCompat.makeSceneTransitionAnimation(
                                activity!!, p1
                            )
                        startActivity(intent, options.toBundle())
                    } else {
                        startActivity(intent)
                    }
                }

            }
        })

        viewDataBinding!!.recyclerPaymentRequest.addOnScrollListener(object :
            RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                val visibleItemCount = linearLayoutManager!!.childCount
                val totalItemCount = linearLayoutManager!!.itemCount
                val firstVisibleItemPosition = linearLayoutManager!!.findFirstVisibleItemPosition()

                if (!isLoading && (visibleItemCount + firstVisibleItemPosition >= totalItemCount) && firstVisibleItemPosition >= 0) {
                        // This is used for pagination
                }
            }
        })
    }

    fun afterTextChanged(view: Editable) {
        var s: String? = null
        try {
            // The comma in the format specifier does the trick
            s = String.format("%,d", view.toString().toLong())
        } catch (e: NumberFormatException) {
            e.printStackTrace()
        }
    }

    override fun getHomeResponse(homeResponse: HomeResponse) {
        badgeCount = homeResponse.data!!.unReadCount

        if (badgeCount != 0) {
            viewDataBinding!!.notificationBadgeCountTV.text =
                badgeCount.toString()
            viewDataBinding!!.notificationBadgeCountTV.visibility = View.VISIBLE
        } else {
            viewDataBinding!!.notificationBadgeCountTV.visibility = View.GONE
        }

        val userType = AppPreference.getInstance(requireActivity()).getValue(PreferenceKeys.USER_TYPE)

        if (userType.equals(AppConstants.SECONDARY_SIGNUP)) {
            AppPreference.getInstance(requireActivity()).addValue(PreferenceKeys.WALLET_AMOUNT,homeResponse.data!!.secondaryUserLimit.toString())
            if (homeResponse.data!!.secondaryUserLimit.toString().contains(".")) {
                viewDataBinding!!.totalCashback.text =
                    "${AppPreference.getInstance(requireActivity()).getSavedUser(AppPreference.getInstance(requireActivity())).Country!!.currencyCode} ${String.format("%.2f", homeResponse.data!!.secondaryUserLimit)}"
            } else {
                viewDataBinding!!.totalCashback.text =
                    "${AppPreference.getInstance(requireActivity()).getSavedUser(AppPreference.getInstance(requireActivity())).Country!!.currencyCode} ${String.format("%,d", homeResponse.data!!.secondaryUserLimit)}"
            }
        }
        else
        {
            AppPreference.getInstance(requireActivity()).addValue(PreferenceKeys.WALLET_AMOUNT,homeResponse.data!!.totalWalletAmount)
            if (homeResponse.data!!.totalWalletAmount.contains(".")) {
                viewDataBinding!!.totalCashback.text =
                    "${AppPreference.getInstance(requireActivity()).getSavedUser(AppPreference.getInstance(requireActivity())).Country!!.currencyCode} ${String.format("%.2f", homeResponse.data!!.totalWalletAmount.toFloat())}"
            } else {
                viewDataBinding!!.totalCashback.text =
                    "${AppPreference.getInstance(requireActivity()).getSavedUser(AppPreference.getInstance(requireActivity())).Country!!.currencyCode} ${String.format("%,d", homeResponse.data!!.totalWalletAmount.toLong())}"
            }
        }


        if (homeResponse.data!!.paymentRequest.isNotEmpty()) {
            viewDataBinding!!.tvNoRequest.visibility = View.GONE
            viewDataBinding!!.tvPaymentAll.visibility = View.VISIBLE
            viewDataBinding!!.recyclerPaymentRequest.visibility = View.VISIBLE
            paymentRequestlList!!.addAll(homeResponse.data!!.paymentRequest)
            paymentReqAdapter!!.notifyDataSetChanged()
        } else {

                viewDataBinding!!.tvNoRequest.visibility = View.VISIBLE
                viewDataBinding!!.recyclerPaymentRequest.visibility = View.GONE

        }
        if (homeResponse.data!!.recentTransaction.isNotEmpty()) {
            viewDataBinding!!.tvNoTransaction.visibility = View.GONE
            viewDataBinding!!.recyclerRecentTransaction.visibility = View.VISIBLE
            transactionList!!.addAll(homeResponse.data!!.recentTransaction)
            transactionListAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.tvNoTransaction.visibility = View.VISIBLE
            viewDataBinding!!.recyclerRecentTransaction.visibility = View.GONE
        }
    }

    override fun declinedPaymentRequestResponse(
        declinedPaymentRequestResponse: DeclinedPaymentRequestResponse,
        position: Int
    ) {
        onResume()
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(requireActivity())
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
        showProgressDialog(requireActivity(), resources.getString(R.string.LOADING))
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

    /**
     * This method is used to show filter dialog
     */
    fun showDeclineDialog(position: Int) {
        val dialog = BottomSheetDialog(requireActivity())
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_decline, null)

        bottomSheet.ic_cross.setOnClickListener { dialog.dismiss() }

        bottomSheet.btn_no.setOnClickListener { dialog.dismiss() }

        bottomSheet.btn_yes.setOnClickListener {
            var reason = bottomSheet.et_reason.text.toString().trim()

            if (checkIfInternetOn()) {
                mHomeViewModel.declinedPaymentRequestApi(
                    AppPreference.getInstance(requireActivity()),
                    paymentRequestlList!![position].id.toString(), reason,
                    position
                )
                dialog.dismiss()
            }
        }
        dialog.setContentView(bottomSheet)
        dialog.show()
    }

    override fun onPause() {
        super.onPause()
        unRegisterNotification()
    }

    private fun registerNotification() {
        val intentFilter = IntentFilter(AppConstants.NEW_NOTIFICATION)
        broadcastReceiverNotification = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (activity != null && isAdded) {
                    requireActivity().runOnUiThread(Runnable {

                        Log.e(javaClass.name,">>>>>>>>>>>>>> Receiver called")

                        badgeCount += 1
                        viewDataBinding!!.notificationBadgeCountTV.text =
                            badgeCount.toString()
                        viewDataBinding!!.notificationBadgeCountTV.visibility = View.VISIBLE

                        if (intent.getStringExtra("type")!!.equals("WITHDRAWAL_REQUEST", true)) {
                            initializeAdapter()

                            viewDataBinding!!.tvNoRequest.visibility = View.VISIBLE

                            viewDataBinding!!.tvNoTransaction.visibility = View.VISIBLE
                            if (checkIfInternetOn()) {
                                mHomeViewModel.callHomeAPI(AppPreference.getInstance(requireContext()))
                            }
                        }
                    })
                }
            }
        }
        requireActivity().registerReceiver(broadcastReceiverNotification, intentFilter)
    }

    private fun unRegisterNotification() {
        try {
            requireActivity().unregisterReceiver(broadcastReceiverNotification)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

}
