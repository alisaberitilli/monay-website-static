package com.monayuser.ui.requestwithdrawal

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.InputFilter
import android.text.TextWatcher
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.View.OnTouchListener
import android.view.Window
import android.view.WindowManager
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.SpinnerAdapter
import androidx.core.content.ContextCompat
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.response.AddBankResponse
import com.monayuser.data.model.response.GetBankListResponse
import com.monayuser.data.model.response.RequestWithdrawalResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.databinding.ActivityRequestWithdrawalBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.forgotmpin.ForgotMPinActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import java.util.*


class RequestWithdrawalActivity :
    BaseActivity<ActivityRequestWithdrawalBinding, RequestWithdrawalViewModel>(),
    RequestWithdrawalNavigator {

    private var bankAdapter: SpinnerAdapter? = null
    private var bankId = ""
    private var bankList: ArrayList<CardBean>? = null
    private var walletAmount = 0.0
    private var holderName = ""
    private var bankName = ""
    private var accountNo = ""
    private var routingNo = ""
    private var swiftCode = ""
    private var dialog: BottomSheetDialog? = null

    var mRequestWithdrawalViewModel: RequestWithdrawalViewModel = RequestWithdrawalViewModel()
    override val viewModel: RequestWithdrawalViewModel get() = mRequestWithdrawalViewModel
    override val bindingVariable: Int get() = BR.requestWithdrawalVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_request_withdrawal
    lateinit var appPreferences: AppPreference
    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@RequestWithdrawalActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mRequestWithdrawalViewModel.navigator = this
        appPreferences = AppPreference.getInstance(this)
        mRequestWithdrawalViewModel.initView()
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
        viewDataBinding!!.tvCurrency.text =
            AppPreference.getInstance(this).getSavedUser(appPreferences).Country!!.currencyCode
        bankList = ArrayList()
        var cardBean = CardBean()
        cardBean.id = ""
        cardBean.bankName = "Select Bank"
        bankList!!.add(cardBean)

        amountValidationMethod()

        bankAdapter = ArrayAdapter(this, R.layout.spinner_bank_name, bankList!!)
        (bankAdapter as ArrayAdapter<CardBean>).setDropDownViewResource(R.layout.spinner_bank_name_new)
        viewDataBinding!!.spBank.adapter = bankAdapter!!

        viewDataBinding!!.spBank.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(
                    parent: AdapterView<*>,
                    view: View,
                    position: Int,
                    id: Long
                ) {
                    bankId = bankList!![position].id!!
                }

                override fun onNothingSelected(parent: AdapterView<*>) {
                    // This method is called when nothing selected
                }
            }

        viewDataBinding!!.spBank.setOnTouchListener(object : OnTouchListener {
            override fun onTouch(v: View, event: MotionEvent): Boolean {
                    if (event.action == MotionEvent.ACTION_UP && bankList!!.size == 1) {
                        DialogUtils.onDeleteDialog(
                            this@RequestWithdrawalActivity,
                            resources.getString(R.string.oops),
                            resources.getString(R.string.please_add_bank),
                            resources.getString(R.string.ok),
                            resources.getString(R.string.cancel),
                            ItemEventListener()
                        )
                        return true
                    }
                return false
            }
        })

        if (checkIfInternetOn()) {
            mRequestWithdrawalViewModel.callForGetBankListAPI(AppPreference.getInstance(this))
            mRequestWithdrawalViewModel.callWalletAPI(AppPreference.getInstance(this))
        }
    }

    private fun amountValidationMethod() {
        viewDataBinding!!.etAmount.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(p0: Editable?) {
                //  This method is not used for this functionality
            }

            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                //  This method is not used for this functionality
            }

            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                if (p0.toString().contains(".")) {
                    val maxLength = 9
                    val fArray = arrayOfNulls<InputFilter>(1)
                    fArray[0] = InputFilter.LengthFilter(maxLength)
                    viewDataBinding!!.etAmount.setFilters(fArray)

                    var pos = p0.toString().indexOf(".")

                    if (p0.toString().length > (pos + 3)) {
                        viewDataBinding!!.etAmount.setText(
                            String.format(
                                "%.2f",
                                p0.toString().toFloat()
                            )
                        )
                        viewDataBinding!!.etAmount.setSelection(viewDataBinding!!.etAmount.getText().length)
                    }
                } else {
                    if (p1 == 6) {
                        try {
                            var number: StringBuilder = StringBuilder(p0.toString())
                            number.setCharAt(6, ' ')
                            viewDataBinding!!.etAmount.setText(number.toString().trim())
                            viewDataBinding!!.etAmount.setSelection(viewDataBinding!!.etAmount.getText().length)
                        } catch (e: java.lang.Exception) {
                            e.printStackTrace()
                        }
                    }
                    val maxLength = 7
                    val fArray = arrayOfNulls<InputFilter>(1)
                    fArray[0] = InputFilter.LengthFilter(maxLength)
                    viewDataBinding!!.etAmount.setFilters(fArray)
                }
            }
        })
    }

    override fun clickOnSendRequest() {
        Log.e(javaClass.name, "bankId >>>>> ${bankId}")

        var amount = viewDataBinding!!.etAmount.text.trim().toString()
        if (!amount.isEmpty()) {
            if (amount.toDouble() > walletAmount) {
                showValidationError(getStringResource(R.string.please_enter_valid_amount))
            } else {
                if (bankId != "") {
                    if (checkIfInternetOn()) {
                        val intent = Intent(this, ForgotMPinActivity::class.java)
                        var cardBean = com.monayuser.data.model.bean.CardBean()
                        cardBean.screenFrom = getString(R.string.request_for_withdrawal)
                        cardBean.amount = amount
                        cardBean.bankId = bankId

                        intent.putExtra(AppConstants.CARD_DATA, cardBean)
                        startActivity(intent)
                        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                    }
                } else {
                    showValidationError(getStringResource(R.string.please_select_bank))
                }
            }
        } else {
            showValidationError(getStringResource(R.string.please_enter_amount))
            viewDataBinding!!.etAmount.requestFocus()
        }
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
            onBackPressed()
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

        override fun ondeleteAccount() {
            super.ondeleteAccount()
            mRequestWithdrawalViewModel.openBankAccountPopup()
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

    override fun getWithdrawalMoneyResponse(requestWithdrawalResponse: RequestWithdrawalResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            requestWithdrawalResponse.message,
            ItemEventListener()
        )
    }

    override fun getBankListResponse(getBankListResponse: GetBankListResponse) {
        bankList!!.addAll(getBankListResponse.data!!)
        bankAdapter = ArrayAdapter(this, R.layout.spinner_bank_name, bankList!!)
        (bankAdapter as ArrayAdapter<CardBean>).setDropDownViewResource(R.layout.spinner_bank_name_new)
        viewDataBinding!!.spBank.adapter = bankAdapter!!
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getWalletResponse(walletResponse: WalletResponse) {
        walletAmount = walletResponse.data!!.totalWalletAmount.toDouble()
        if (walletResponse.data!!.totalWalletAmount.contains(".")) {
            viewDataBinding!!.tvTotalCashback.text =
                "${
                    AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this))!!.Country!!.currencyCode
                } ${String.format("%.2f", walletResponse.data!!.totalWalletAmount.toFloat())}"
        } else {
            viewDataBinding!!.tvTotalCashback.text =
                "${
                    AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this))!!.Country!!.currencyCode
                } ${String.format("%,d", walletResponse.data!!.totalWalletAmount.toLong())}"
        }
    }

    override fun openBankAccountPopup() {
        dialog = BottomSheetDialog(this)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_new_bank, null)
        bottomSheet.findViewById<View>(R.id.imageCloseDialog).setOnClickListener { dialog!!.dismiss() }
        dialog!!.setContentView(bottomSheet)

        bottomSheet.findViewById<View>(R.id.btn_save).setOnClickListener {
            holderName = bottomSheet.findViewById<android.widget.EditText>(R.id.et_holder_name).text.toString()
            bankName = bottomSheet.findViewById<android.widget.EditText>(R.id.et_bank_name).text.toString()
            accountNo = bottomSheet.findViewById<android.widget.EditText>(R.id.et_account_no).text.toString()
            routingNo = bottomSheet.findViewById<android.widget.EditText>(R.id.et_routing_no).text.toString()
            swiftCode = bottomSheet.findViewById<android.widget.EditText>(R.id.et_swift_code).text.toString()

            if (checkIfInternetOn() && mRequestWithdrawalViewModel.checkBankValidation(bottomSheet)) {
                mRequestWithdrawalViewModel.callAddBankAPI(
                    AppPreference.getInstance(this),
                    accountNo,
                    bankName,
                    routingNo,
                    holderName,
                    swiftCode
                )
            }
        }
        dialog!!.show()
        dialog!!.getWindow()!!.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
    }

    override fun addBankResponse(addBankResponse: AddBankResponse) {
        bankList!!.add(addBankResponse.data!!)
        bankAdapter = ArrayAdapter(this, R.layout.spinner_bank_name, bankList!!)
        (bankAdapter as ArrayAdapter<CardBean>).setDropDownViewResource(R.layout.spinner_bank_name_new)
        viewDataBinding!!.spBank.adapter = bankAdapter!!

        dialog!!.dismiss()

        DialogUtils.dialogWithoutEvent(
            this,
            resources.getString(R.string.oops),
            addBankResponse.message
        )
    }
}