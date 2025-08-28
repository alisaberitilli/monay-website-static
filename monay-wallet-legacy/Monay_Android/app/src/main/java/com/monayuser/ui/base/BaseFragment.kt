package com.monayuser.ui.base

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.databinding.ViewDataBinding
import androidx.fragment.app.Fragment
import com.monayuser.BuildConfig
import com.monayuser.R
import com.monayuser.ui.changepassword.ChangePasswordActivity
import com.monayuser.ui.editprofile.EditProfileActivity
import com.monayuser.ui.faq.FaqActivity
import com.monayuser.ui.kyc.KYCActivity
import com.monayuser.ui.kyc.dynamic_kyc.DynamicKYCActivity
import com.monayuser.ui.kyc.dynamic_kyc.DynamicKYCViewModel
import com.monayuser.ui.mycard.MyCardActivity
import com.monayuser.ui.mycontact.UpdatedContactActivity
import com.monayuser.ui.notification.NotificationActivity
import com.monayuser.ui.paymentrequest.PaymentRequestActivity
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.requestmoney.RequestMoneyActivity
import com.monayuser.ui.setup.SecuritySetupActivity
import com.monayuser.ui.showmycode.ShowMyCodeActivity
import com.monayuser.ui.termsconditions.TermsConditionsActivity
import com.monayuser.ui.wallet.WalletActivity
import com.monayuser.utils.*
import com.tbruyelle.rxpermissions2.RxPermissions
import io.reactivex.disposables.CompositeDisposable

/**
 * The type Base fragment.
 *
 * @param <T> the type parameter
 * @param <V> the type parameter
</V></T> */
/*Base Class for all fragments*/
abstract class BaseFragment<T : ViewDataBinding, V : BaseViewModel<*>> : Fragment(),
    CommonNavigator {

    val REQUEST_CODE_FOR_PERMISSION_SETTING = 1111
    var compositeDisposable = CompositeDisposable()

    /**
     * Get base activity.
     *
     * @return the base activity
     */
    var baseActivity: BaseActivity<*, *>? = null
        private set
    private var mRootView: View? = null

    /**
     * Get view data binding.
     *
     * @return the view data binding
     */
    var viewDataBinding: T? = null
        private set
    private var mViewModel: V? = null
    //    private ProgressHUD pDialog;

    /**
     * Override for set binding variable
     *
     * @return variable id
     */
    abstract val bindingVariable: Int

    /**
     * Get layout id.
     *
     * @return layout resource id
     */
    abstract//    @LayoutRes
    val layoutId: Int

    /**
     * Override for set view model
     *
     * @return view model instance
     */
    abstract val viewModel: V

    override fun onAttach(context: Context) {
        if (context != null) {
            super.onAttach(context)
        }
        if (context is BaseActivity<*, *>) {
            val activity = context as BaseActivity<*, *>?
            this.baseActivity = activity
            activity!!.onFragmentAttached()
        }
    }

    /**
     * This message is used to create a object of view model
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        mViewModel = viewModel
        setHasOptionsMenu(false)
    }

    /**
     * This message is used to bind layout
     */
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        viewDataBinding = DataBindingUtil.inflate(inflater, layoutId, container, false)
        mRootView = viewDataBinding!!.root
        return mRootView
    }

    override fun onDetach() {
        baseActivity = null
        super.onDetach()
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewDataBinding!!.setVariable(bindingVariable, mViewModel)
        viewDataBinding!!.executePendingBindings()
    }

    /**
     * Hide keyboard.
     */
    fun hideKeyboard() {
        if (baseActivity != null) {
            baseActivity!!.hideKeyboard()
        }
    }

    /*** method for show progress dialog ***/
    private var pDialog: CustomProgressDialog? = null

    fun showProgressDialog(context: Context, loadingText: String) {
        try {
            pDialog = CustomProgressDialog.show(context, false, loadingText)
            if (pDialog != null) {
                pDialog!!.show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

    }

    /*** method for hide progress dialog ***/
    fun hideProgressDialog() {
        try {
            if (pDialog != null) {
                pDialog!!.dismiss()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

    }

    //rx method to check permission
    fun checkPermission(context: Context, vararg permissions: String) {
        compositeDisposable.add(
            RxPermissions(this)
                .request(*permissions)
                .subscribe { granted ->
                    if (granted!!) {
                        rxPermissionGranted()
                    } else {
                        rxPermissionDenied()
                    }
                })
    }

    protected open fun rxPermissionGranted() {
        // invoked when permission granted
    }

    protected open fun rxPermissionDenied() {
        // invoked when permission denied
    }

    fun moveToApplicationSetting() {
        DialogUtils.showAlertDialogNew(resources.getString(R.string.dialog_alert_heading),
            resources.getString(R.string.allow_permission_setting),
            requireActivity(), object : DialogUtils.OnConfirmedListener {
                override fun onConfirmed() {

                    startActivityForResult(
                        Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.parse("package:" + BuildConfig.APPLICATION_ID)
                        ), REQUEST_CODE_FOR_PERMISSION_SETTING
                    );

                }
            })
    }

    override fun onDestroy() {
        super.onDestroy()
        compositeDisposable.dispose()
    }

    /**
     * The interface Callback.
     */
    interface Callback {

        /**
         * On fragment attached.
         */
        fun onFragmentAttached()

        /**
         * On fragment detached.
         *
         * @param tag the tag
         */
        fun onFragmentDetached(tag: String)
    }

    fun openSecuritySetup(mContext: Activity) {
        val intent = Intent(mContext, SecuritySetupActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openEditProfile(mContext: Activity) {
        val intent = Intent(mContext, EditProfileActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openMyCard(mContext: Activity) {
        val intent = Intent(mContext, MyCardActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openTermsConditions(mContext: Activity) {
        val intent = Intent(mContext, TermsConditionsActivity::class.java)
        intent.putExtra(AppConstants.PN_NAME, getString(R.string.terms_amp_conditions))
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openHowItWorks(mContext: Activity) {
        val intent = Intent(mContext, TermsConditionsActivity::class.java)
        intent.putExtra(AppConstants.PN_NAME, getString(R.string.how_it_work))
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openFaq(mContext: Activity) {
        val intent = Intent(mContext, FaqActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openChangePassword(mContext: Activity) {
        val intent = Intent(mContext, ChangePasswordActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openUserPolicy(mContext: Activity) {
        val intent = Intent(mContext, TermsConditionsActivity::class.java)
        intent.putExtra(AppConstants.PN_NAME, getString(R.string.privacy_policy_title))
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openNotification(mContext: Activity) {
        val intent = Intent(mContext, NotificationActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openMyContactScreen(mContext: Activity) {
        val intent = Intent(mContext, UpdatedContactActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openRequestMoneyScreen(mContext: Activity) {
        val intent = Intent(mContext, RequestMoneyActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openRewardsCashback(mContext: Activity) {
        // This function is called when click on rewards section
    }

    fun openPaymentRequest(mContext: Activity) {
        val intent = Intent(mContext, PaymentRequestActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openKYCActivty(mContext: Activity) {
        val intent = Intent(mContext, KYCActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openDynamicKYCActivty(mContext: Activity) {
        val intent = Intent(mContext, DynamicKYCActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openMyWallet(mContext: Activity) {
        val intent = Intent(mContext, WalletActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openSupport(mContext: Activity) {
        // This function is called when click on support section
    }


    fun openPayMoney(mContext: Activity) {
        val intent = Intent(mContext, PayMoneyActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    fun openMyCodeScreen(mContext: Activity) {
        val intent = Intent(mContext, ShowMyCodeActivity::class.java)
        startActivity(intent)
        mContext.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun showValidationError(message: String) {
        DialogUtils.showAlertDialog(requireContext(), "", message)
    }

    override fun showProgressBar() {
        showProgressDialog(requireContext(), resources.getString(R.string.LOADING))
    }

    override fun hideProgressBar() {
        hideProgressDialog()
    }

    fun checkIfInternetOn(): Boolean {
        if (CommonUtils.isInternetOn(requireContext())) {
            return true
        } else {
            DialogUtils.showAlertDialog(
                requireContext(),
                "",
                getStringResource(R.string.validation_internet_connection)
            )
            return false
        }
    }
}
