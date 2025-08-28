package com.monayuser.ui.mybankaccounts

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.view.WindowManager
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.response.AddBankResponse
import com.monayuser.data.model.response.DeleteBankResponse
import com.monayuser.data.model.response.GetBankListResponse
import com.monayuser.databinding.ActivityBankAccountsBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mybankaccounts.adapter.BankAccountsAdapter
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.dialog_add_new_card.view.imageCloseDialog
import kotlinx.android.synthetic.main.dialog_new_bank.view.*
import java.util.*


class BankAccountsActivity : BaseActivity<ActivityBankAccountsBinding, BankAccountsViewModel>(),
    BankAccountsNavigator {

    private var linearLayoutManager: LinearLayoutManager? = null
    private var bankList: ArrayList<CardBean>? = null
    private var bankAccountsAdapter: BankAccountsAdapter? = null
    private var holderName = ""
    private var bankName = ""
    private var accountNo = ""
    private var routingNo = ""
    private var swiftCode = ""
    private var dialog: BottomSheetDialog? = null
    var mBankAccountsViewModel: BankAccountsViewModel = BankAccountsViewModel()
    override val viewModel: BankAccountsViewModel get() = mBankAccountsViewModel
    override val bindingVariable: Int get() = BR.bankAccountVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_bank_accounts

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@BankAccountsActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mBankAccountsViewModel.navigator = this
        mBankAccountsViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        onBackPressed()
    }

    /**
     * This method is used to initialize an variable and call a API.
     */
    override fun init() {
        initializeAdapter()
        if (checkIfInternetOn()) {
            mBankAccountsViewModel.callForGetBankListAPI(AppPreference.getInstance(this))
        } else {
            tryAgain()
        }
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.visibility = View.GONE
            viewDataBinding!!.tryAgain.visibility = View.GONE
            mBankAccountsViewModel.callForGetBankListAPI(AppPreference.getInstance(this))
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternet.visibility = View.VISIBLE
            viewDataBinding!!.tryAgain.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        bankList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.rvBankAccounts.layoutManager = linearLayoutManager
        bankAccountsAdapter = BankAccountsAdapter(this, bankList!!)
        viewDataBinding!!.rvBankAccounts.adapter = bankAccountsAdapter

        bankAccountsAdapter!!.setOnItemClickListener(object :
            BankAccountsAdapter.OnItemClickListener {
            override fun onItemClicked(view: View, position: Int) {
                if (checkIfInternetOn()) {
                    mBankAccountsViewModel.callForDeleteBankAPI(
                        AppPreference.getInstance(this@BankAccountsActivity),
                        bankList!![position].id.toString(),
                        position
                    )
                }
            }
        })
    }

    override fun openBankAccountPopup() {
        dialog = BottomSheetDialog(this)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_new_bank, null)
        bottomSheet.imageCloseDialog.setOnClickListener { dialog!!.dismiss() }
        dialog!!.setContentView(bottomSheet)

        var countryName=AppPreference.getInstance(this@BankAccountsActivity).getSavedUser(
            AppPreference.getInstance(this@BankAccountsActivity)).Country!!.name
        if (countryName==AppConstants.COUNTRY_INDIA)
        {
            bottomSheet.routeNumberText.visibility=View.GONE
            bottomSheet.ifscNumberText.visibility=View.VISIBLE
            bottomSheet.swiftNumberText.visibility=View.GONE
        }
        else
        {
            bottomSheet.ifscNumberText.visibility=View.GONE
            bottomSheet.routeNumberText.visibility=View.VISIBLE
            bottomSheet.swiftNumberText.visibility=View.VISIBLE
        }
        bottomSheet.btn_save.setOnClickListener {
            holderName = bottomSheet.et_holder_name.text.toString()
            bankName = bottomSheet.et_bank_name.text.toString()
            accountNo = bottomSheet.et_account_no.text.toString()
            if (countryName==AppConstants.COUNTRY_INDIA)
            {
                routingNo = bottomSheet.et_ifsc_no.text.toString()
                swiftCode = ""
                if (checkIfInternetOn() && mBankAccountsViewModel.checkBankINValidation(bottomSheet)) {
                    mBankAccountsViewModel.callAddBankAPI(
                        AppPreference.getInstance(this),
                        accountNo,
                        bankName,
                        routingNo,
                        holderName,
                        swiftCode
                    )
                }
            }
            else
            {
                routingNo = bottomSheet.et_routing_no.text.toString()
                swiftCode = bottomSheet.et_swift_code.text.toString()
                if (checkIfInternetOn() && mBankAccountsViewModel.checkBankValidation(bottomSheet)) {
                    mBankAccountsViewModel.callAddBankAPI(
                        AppPreference.getInstance(this),
                        accountNo,
                        bankName,
                        routingNo,
                        holderName,
                        swiftCode
                    )
                }
            }

        }
        dialog!!.show()
        dialog!!.getWindow()!!.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
    }

    override fun addBankResponse(addBankResponse: AddBankResponse) {
        viewDataBinding!!.mainLayout.visibility = View.VISIBLE
        viewDataBinding!!.noInternet.visibility = View.GONE
        viewDataBinding!!.tryAgain.visibility = View.GONE

        bankList!!.add(addBankResponse.data!!)
        bankAccountsAdapter!!.notifyDataSetChanged()
        dialog!!.dismiss()

        if (bankList!!.size > 0) {
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.rvBankAccounts.visibility = View.VISIBLE
        }

        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            addBankResponse.message,
            ItemEventListener()
        )
    }

    override fun getBankListResponse(getBankListResponse: GetBankListResponse) {
        if (getBankListResponse.data!!.isNotEmpty()) {
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.rvBankAccounts.visibility = View.VISIBLE
            bankList!!.addAll(getBankListResponse.data!!)
            bankAccountsAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.rvBankAccounts.visibility = View.GONE
        }
    }

    override fun deleteBankResponse(deleteBankResponse: DeleteBankResponse, position: Int) {
        bankList!!.removeAt(position)
        bankAccountsAdapter!!.notifyDataSetChanged()
        if (bankList!!.size == 0) {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.rvBankAccounts.visibility = View.GONE
        }

        DialogUtils.dialogWithoutEvent(
            this,
            resources.getString(R.string.oops),
            deleteBankResponse.message
        )
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

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            // This function is called when click on OK button
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

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}