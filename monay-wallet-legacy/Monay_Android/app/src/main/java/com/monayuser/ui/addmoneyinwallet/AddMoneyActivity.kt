package com.monayuser.ui.addmoneyinwallet

import android.app.DatePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.InputFilter
import android.text.TextWatcher
import android.view.View
import android.view.Window
import android.widget.CompoundButton
import android.widget.DatePicker
import android.widget.EditText
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.AddCardResponse
import com.monayuser.data.model.response.AddMoneyResponse
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.databinding.ActivityAddMoneyBinding
import com.monayuser.ui.addmoneyinwallet.adapter.CardAdapter
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.forgotmpin.ForgotMPinActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.utils.*
import com.whiteelephant.monthpicker.MonthPickerDialog
import kotlinx.android.synthetic.main.activity_add_money.*
import kotlinx.android.synthetic.main.activity_pay_money.*
import kotlinx.android.synthetic.main.dialog_add_new_card.view.*
import java.util.*

class AddMoneyActivity : BaseActivity<ActivityAddMoneyBinding, AddMoneyViewModel>(),
    AddMoneyNavigator {
    private var cardBeanMain: CardBean? = null
    private var cardAdapter: CardAdapter? = null
    private var dialog: BottomSheetDialog? = null
    var cardMonth: String? = ""
    var cardYear: String? = ""
    var mAddMoneyViewModel: AddMoneyViewModel = AddMoneyViewModel()
    override val viewModel: AddMoneyViewModel get() = mAddMoneyViewModel
    override val bindingVariable: Int get() = BR.addMoneyVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_add_money

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@AddMoneyActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mAddMoneyViewModel.navigator = this
        mAddMoneyViewModel.initView()
    }

    /**
     * This method is called when click on back button.
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        viewDataBinding!!.tvCurrency.text = AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this))!!.Country!!.currencyCode
        cardBeanMain = com.monayuser.data.model.bean.CardBean()

        val cardText = CreditCardNumberFormattingTextWatcher(viewDataBinding!!.cardNumberEt)
        viewDataBinding!!.cardNumberEt.addTextChangedListener(cardText)

        initializeFields()
        openExpiryDialog()
        initializeAdapter()

        viewDataBinding!!.cbSave.isChecked = true

        viewDataBinding!!.rbPay.setOnCheckedChangeListener(object :
            CompoundButton.OnCheckedChangeListener {
            override fun onCheckedChanged(p0: CompoundButton?, p1: Boolean) {
                if (p1) {
                    viewDataBinding!!.llCard.visibility = View.VISIBLE
                    (viewDataBinding!!.cardRecycler.adapter as CardAdapter).updateUi()
                    cardBeanMain = CardBean()
                } else {
                    viewDataBinding!!.llCard.visibility = View.GONE
                }
            }
        })

        if (checkIfInternetOn()) {
            mAddMoneyViewModel.callForGetCardListAPI(AppPreference.getInstance(this))
        } else {
            tryAgain()
        }

        viewDataBinding!!.rbPay.isChecked = true
    }

    private fun initializeFields() {
        viewDataBinding!!.moneyEt.addTextChangedListener(object : TextWatcher {
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
                    viewDataBinding!!.moneyEt.setFilters(fArray)

                    val pos = p0.toString().indexOf(".")

                    if (p0.toString().length > (pos + 3)) {
                        viewDataBinding!!.moneyEt.setText(
                            String.format(
                                "%.2f",
                                p0.toString().toFloat()
                            )
                        )
                        viewDataBinding!!.moneyEt.setSelection(viewDataBinding!!.moneyEt.getText().length)
                    }
                } else {
                    if (p1 == 6) {
                        try {
                            val number: StringBuilder = StringBuilder(p0.toString())
                            number.setCharAt(6, ' ')
                            viewDataBinding!!.moneyEt.setText(number.toString().trim())
                            viewDataBinding!!.moneyEt.setSelection(viewDataBinding!!.moneyEt.getText().length)
                        } catch (e: java.lang.Exception) {
                            e.printStackTrace()
                        }
                    }
                    val maxLength = 7
                    val fArray = arrayOfNulls<InputFilter>(1)
                    fArray[0] = InputFilter.LengthFilter(maxLength)
                    viewDataBinding!!.moneyEt.setFilters(fArray)
                }
            }
        })

    }

    private fun openExpiryDialog() {
        viewDataBinding!!.cardExMonth.setOnClickListener {

            val mCurrentDate = Calendar.getInstance()
            val month = mCurrentDate[Calendar.MONTH]
            mCurrentDate[Calendar.DAY_OF_MONTH]
            val year = mCurrentDate[Calendar.YEAR]

            val builder = MonthPickerDialog.Builder(
                this,
                MonthPickerDialog.OnDateSetListener { selectedMonth, selectedYear ->
                    if ((year == selectedYear && selectedMonth >= month) || year < selectedYear) {
                        cardMonth = CommonUtils.getDateInFormat(
                            "MM",
                            "MM",
                            "${selectedMonth + 1}"
                        )
                        cardYear = selectedYear.toString()
                        viewDataBinding!!.cardExMonth.setText(
                            CommonUtils.getDateInFormat(
                                "yyyy-MM",
                                "MM/yy",
                                "$selectedYear-${selectedMonth + 1}"
                            )
                        )
                    } else {
                        showValidationError(getString(R.string.please_select_valid_expiry_date))
                    }
                },
                year,
                month
            )

            builder.setTitle("Select Expiry Date")
                .setMonthRange(Calendar.JANUARY, Calendar.DECEMBER)
                .setActivatedMonth(month)
                .setYearRange(year, 2050)
                .setOnMonthChangedListener { selectedMonth ->
                }
                .setOnYearChangedListener { }
                .build()
                .show()
        }
    }

    private var list: ArrayList<com.monayuser.data.model.bean.CardBean> = ArrayList()

    private fun initializeAdapter() {
        cardRecycler.layoutManager = LinearLayoutManager(this)
        cardAdapter = this.let {
            CardAdapter(
                it,
                list, true
            )
        }
        cardRecycler.adapter = cardAdapter

        cardAdapter!!.setOntemClickListener(object :
            CardAdapter.OnItemClickListener {
            override fun onItemClicked(view: View, position: Int) {
                val etCvv = view.findViewById<EditText>(R.id.etCvv)
                if (list[position].cardType.isNullOrEmpty()) {
                    cardBeanMain!!.cardType = ""
                }
                if (list[position].cardIconUrl.isNullOrEmpty()) {
                    cardBeanMain!!.cardIconUrl = ""
                }

                cardBeanMain!!.cvv = etCvv.text.toString().trim()

                if (mAddMoneyViewModel.checkValidation(
                        viewDataBinding!!,
                        cardBeanMain!!.id.toString(), true
                    )) {

                    if (view.etCvv.text.toString().trim().isEmpty()) {
                        showValidationError(getStringResource(R.string.please_enter_cvv))
                        etCvv.requestFocus()
                        return
                    } else if (etCvv.text.toString().trim().length < 3) {
                        showValidationError(getStringResource(R.string.please_enter_correct_cvv))
                        view.etCvv.requestFocus()
                        return
                    }

                    if (list[position].cardName != null && (list[position].cardName.equals(
                            "American Express",
                            true
                        ) || list[position].cardName.equals("AMEX", true)) && etCvv.text.toString()
                            .trim().length != 4
                    ) {
                        showValidationError(getStringResource(R.string.please_enter_correct_cvv))
                        view.etCvv.requestFocus()
                        return
                    }


                    val intent = Intent(this@AddMoneyActivity, ForgotMPinActivity::class.java)
                    cardBeanMain!!.screenFrom = getString(R.string.add_money_title)
                    cardBeanMain!!.amount = viewDataBinding!!.moneyEt.text.toString().trim()
                    cardBeanMain!!.message = viewDataBinding!!.messageEt.text.toString().trim()

                    intent.putExtra(AppConstants.CARD_DATA, cardBeanMain)
                    startActivity(intent)
                    overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                }
            }

            override fun onItemChecked(
                view: View,
                cardBean: com.monayuser.data.model.bean.CardBean
            ) {
                val etCvv = view.findViewById<EditText>(R.id.etCvv)
                etCvv.setText("")

                cardBeanMain = CardBean()
                cardBeanMain = cardBean

                viewDataBinding!!.rbPay.setChecked(false)

            }
        })
    }

    /**
     * This method is called when click on add money button.
     */
    override fun proceedToAddMoney() {
        hideKeyboard()

        if (viewDataBinding!!.cbSave.isChecked) {
            cardBeanMain!!.saveCard = "yes"
        } else {
            cardBeanMain!!.saveCard = "no"
        }

        cardBeanMain!!.nameOnCard = viewDataBinding!!.cardHolderNameEt.text.toString()
        if (!viewDataBinding!!.cardNumberEt.text.toString().equals("")) {
            cardBeanMain!!.cardNumber =
                viewDataBinding!!.cardNumberEt.text.toString()!!.replace("\\s".toRegex(), "").trim()
        } else {
            cardBeanMain!!.cardNumber = viewDataBinding!!.cardNumberEt.text.toString()!!
        }

        cardBeanMain!!.year = cardYear!!
        cardBeanMain!!.month = cardMonth!!
        cardBeanMain!!.cvv = viewDataBinding!!.cardCVV.text.toString()

        if (mAddMoneyViewModel.checkCardValidationNew(
                viewDataBinding!!,
                cardBeanMain!!.id.toString(), false, cardMonth!!, cardYear!!
            ) && checkIfInternetOn()
        ) {
            val intent = Intent(this, ForgotMPinActivity::class.java)
            cardBeanMain!!.screenFrom = getString(R.string.add_money_title)
            cardBeanMain!!.amount = viewDataBinding!!.moneyEt.text.toString().trim()
            cardBeanMain!!.message = viewDataBinding!!.messageEt.text.toString().trim()

            intent.putExtra(AppConstants.CARD_DATA, cardBeanMain)
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    override fun getCardListResponse(getCardListResponse: GetCardListResponse) {
        if (getCardListResponse.data!!.isNotEmpty()) {
            viewDataBinding!!.tvNoCard.visibility = View.GONE
            viewDataBinding!!.tvText.visibility = View.VISIBLE
            viewDataBinding!!.cardRecycler.visibility = View.VISIBLE
            list.addAll(getCardListResponse.data!!)
            cardAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.tvText.visibility = View.GONE
            viewDataBinding!!.tvNoCard.visibility = View.GONE
            viewDataBinding!!.cardRecycler.visibility = View.GONE
        }
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

            mAddMoneyViewModel.callForGetCardListAPI(AppPreference.getInstance(this))

        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    override fun addMoneyResponse(addMoneyResponse: AddMoneyResponse) {
        var recentUserData = RecentUserData()
        recentUserData!!.amount = viewDataBinding!!.moneyEt.text.trim().toString()
        recentUserData!!.transactionId = addMoneyResponse.data!!.transactionId
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.ADD_MONEY)
        intent.putExtra(AppConstants.USER_DATA, recentUserData)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
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
        showProgressDialog(this@AddMoneyActivity, resources.getString(R.string.LOADING))
    }

    /**
     * This method is used to show network error alert
     */
    override fun showNetworkError(error: String?) {
        // This function is called when network error occurs
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@AddMoneyActivity,
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
        DialogUtils.sessionExpireDialog(this@AddMoneyActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is used to show add card dialog
     */
    override fun showAddNewCardDialog() {
        if (mAddMoneyViewModel.checkValidation(
                viewDataBinding!!,
                cardBeanMain!!.id.toString(), false
            ) && checkIfInternetOn()
        ) {
            var monthMain = ""
            var yearMain = ""

            (viewDataBinding!!.cardRecycler.adapter as CardAdapter).updateUi()
            cardBeanMain = CardBean()

            dialog = BottomSheetDialog(this)
            val bottomSheet = layoutInflater.inflate(R.layout.dialog_add_new_card, null)

            // your work
            bottomSheet.imageCloseDialog.setOnClickListener { dialog!!.dismiss() }
            bottomSheet.cb_save.visibility = View.VISIBLE
            bottomSheet.cb_save.isChecked = true
            bottomSheet.etMonth.setOnClickListener {

                val mCurrentDate = Calendar.getInstance()
                val month = mCurrentDate[Calendar.MONTH]
                val day = mCurrentDate[Calendar.DAY_OF_MONTH]
                val year = mCurrentDate[Calendar.YEAR]
                val mDatePicker = DatePickerDialog(
                    this,
                    R.style.datepicker,
                    DatePickerDialog.OnDateSetListener { datePicker: DatePicker, mYear: Int, mMonth: Int, dayOfMonth: Int ->
                        monthMain = CommonUtils.getDateInFormat(
                            "MM",
                            "MM",
                            "${mMonth + 1}"
                        )
                        yearMain = mYear.toString()
                        bottomSheet.etMonth.setText(
                            CommonUtils.getDateInFormat(
                                "yyyy-MM-dd",
                                "MM/yy",
                                "$mYear-${mMonth + 1}-$dayOfMonth"
                            )
                        )
                    },
                    year,
                    month,
                    day
                )
                mDatePicker.datePicker.minDate = System.currentTimeMillis() - 1000
                mDatePicker.show()
            }
            dialog!!.setContentView(bottomSheet)

            bottomSheet.btnAddCard.setOnClickListener {

                if (bottomSheet.cb_save.isChecked) {
                    cardBeanMain!!.saveCard = "yes"
                } else {
                    cardBeanMain!!.saveCard = "no"
                }
                cardBeanMain!!.nameOnCard = bottomSheet.etCardHolderName.text.toString()
                cardBeanMain!!.cardNumber = bottomSheet.etCardNumber.text.toString()
                cardBeanMain!!.year = yearMain
                cardBeanMain!!.month = monthMain
                cardBeanMain!!.cvv = bottomSheet.etCvv.text.toString()

                if (checkIfInternetOn() && mAddMoneyViewModel.checkCardValidation(
                        bottomSheet,
                        monthMain,
                        yearMain
                    )
                ) {
                    mAddMoneyViewModel.callAddCardAPI(
                        AppPreference.getInstance(this),
                        cardBeanMain!!
                    )

                    dialog!!.dismiss()
                }
            }
            dialog!!.show()
        } else {
            viewDataBinding!!.rbPay.setChecked(false)
        }
    }

    override fun addCardResponse(addCardResponse: AddCardResponse) {
        try {
            var cardBean: CardBean = addCardResponse.data!!
            cardBean.cardType = ""
            cardBean.cardIconUrl = ""
            list.add(cardBean)
            cardAdapter!!.notifyDataSetChanged()
            dialog!!.dismiss()

            if (list!!.size > 0) {
                viewDataBinding!!.tvText.visibility = View.VISIBLE
                viewDataBinding!!.cardRecycler.visibility = View.VISIBLE
            }

            if (mAddMoneyViewModel.checkValidation(
                    viewDataBinding!!,
                    cardBeanMain!!.id.toString(), false
                ) && checkIfInternetOn()
            ) {
                val intent = Intent(this, ForgotMPinActivity::class.java)
                cardBeanMain!!.screenFrom = getString(R.string.add_money_title)
                cardBeanMain!!.amount = viewDataBinding!!.moneyEt.text.toString().trim()

                intent.putExtra(AppConstants.CARD_DATA, cardBeanMain)
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}