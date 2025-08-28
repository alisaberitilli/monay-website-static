package com.monayuser.ui.more

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.response.LogoutResponse
import com.monayuser.databinding.FragmentMoreBinding
import com.monayuser.ui.autotopup.AutoTopUpActivity
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.blockcontacts.BlockActivity
import com.monayuser.ui.mybankaccounts.BankAccountsActivity
import com.monayuser.ui.primaryuserlist.PrimaryUserListActivity
import com.monayuser.ui.requestwithdrawal.RequestWithdrawalActivity
import com.monayuser.ui.secondaryaccount.SecondaryAccountActivity
import com.monayuser.ui.settings.SettingsActivity
import com.monayuser.ui.shareinvite.ShareInviteActivity
import com.monayuser.ui.splash.SplashActivity
import com.monayuser.ui.withdrawal.WithdrawalActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils


class MoreFragment : BaseFragment<FragmentMoreBinding, MoreViewModel>(),
    MoreNavigator {

    var mMoreViewModel: MoreViewModel = MoreViewModel()
    lateinit var appPreferences: AppPreference

    override val bindingVariable: Int
        get() = BR.moreVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.fragment_more
    override val viewModel: MoreViewModel
        get() = mMoreViewModel
    var userType: String? = ""

    /**
     * This method is main method of class
     */
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mMoreViewModel.navigator = this
        appPreferences = AppPreference.getInstance(requireActivity())
        mMoreViewModel.initView()
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
     * This method is used to initialize an variable.
     */
    override fun init() {
//        contactRepository = ContactRepository(activity)


        userType = AppPreference.getInstance(requireActivity()).getValue(PreferenceKeys.USER_TYPE)


        viewDataBinding!!.rlBlock.visibility = View.GONE

        if(userType.equals(AppConstants.SECONDARY_SIGNUP)){

            viewDataBinding!!.rlPrimaryUser.visibility = View.VISIBLE


        }else if(userType.equals(AppConstants.USER_SIGNUP) || userType.equals(AppConstants.MERCHANT_SIGNUP)){


             viewDataBinding!!.rlShareInvites.visibility = View.VISIBLE

             viewDataBinding!!.rlAutoTopup.visibility = View.VISIBLE

            viewDataBinding!!.rlCards.visibility = View.VISIBLE

            viewDataBinding!!.rlBank.visibility = View.VISIBLE

            viewDataBinding!!.rlKyc.visibility = View.VISIBLE

            viewDataBinding!!.rlWithdraw.visibility = View.VISIBLE

            viewDataBinding!!.rlWithdrawRequest.visibility = View.VISIBLE

            viewDataBinding!!.rlBank.visibility = View.VISIBLE
            viewDataBinding!!.viewWithdraw.visibility = View.VISIBLE
            viewDataBinding!!.viewWithdrawRequest.visibility = View.VISIBLE
            viewDataBinding!!.viewBank.visibility = View.VISIBLE

            if (userType.equals(AppConstants.USER_SIGNUP)) {

                viewDataBinding!!.rlSecondaryUser.visibility = View.VISIBLE

            }
        }

    }

    override fun logout() {
        DialogUtils.onLogoutDialog(
            requireContext(),
            resources.getString(R.string.logout_),
            resources.getString(R.string.want_to_logout),
            resources.getString(R.string.logout_),
            resources.getString(R.string.cancel),
            ItemEventListener()
        )
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun logoutResponse(logoutResponse: LogoutResponse) {
        var manager = requireActivity().getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.cancelAll()
        AppPreference.getInstance(requireContext()).clearSharedPreference()
        CommonUtils.clearAllActivity(requireActivity(), SplashActivity::class.java)
    }

    override fun myWallet() {
        openMyWallet(requireActivity())
    }

    override fun paymentRequests() {
        openPaymentRequest(requireActivity())
    }

    override fun kyc() {

        if(appPreferences.getSavedUser(appPreferences).phoneNumberCountryCode.equals("+1")){
            openKYCActivty(requireActivity())
        }else{
            openDynamicKYCActivty(requireActivity())

        }
    }

    override fun clickOnShareInvites() {
        val intent = Intent(requireContext(), ShareInviteActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)

    }

    override fun clickOnSecondaryUser() {
        val intent = Intent(requireContext(), SecondaryAccountActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun clickOnPrimaryUser() {
        val intent = Intent(requireContext(), PrimaryUserListActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun clickOnAutoTopUp() {

        val intent = Intent(requireContext(), AutoTopUpActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)

    }

    override fun withdrawMoney() {
        val intent = Intent(requireContext(), RequestWithdrawalActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun withdrawalRequestHistory() {
        val intent = Intent(requireContext(), WithdrawalActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun blockContacts() {
        val intent = Intent(requireContext(), BlockActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun myCards() {
        openMyCard(requireActivity())
    }

    override fun myBankAccounts() {
        val intent = Intent(requireContext(), BankAccountsActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun settingsSupports() {
        val intent = Intent(requireContext(), SettingsActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
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
                requireActivity().packageName // getPackageName() from Context or Activity object
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

        override fun onSignout() {
            super.onSignout()
            if (checkIfInternetOn()) {
                viewModel.callLogoutAPI(AppPreference.getInstance(requireContext()))
            }
        }
    }
}