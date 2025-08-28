package com.monayuser.ui.autotopup

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.InputFilter
import android.text.InputFilter.LengthFilter
import android.text.TextWatcher
import android.transition.TransitionInflater
import android.view.View
import android.view.Window
import android.widget.EditText
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.gson.Gson
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CardBeanAutoTopUp
import com.monayuser.data.model.response.AutoTopUpEnableDisableResponse
import com.monayuser.data.model.response.GetCardListAutoTopUpResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.databinding.ActivityAddAutoPopupBinding
import com.monayuser.ui.autotopup.adapter.CardAutoTopUpAdapter
import com.monayuser.ui.autotopuppinverify.AutoTopUpMPinActivity
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.*
import com.whiteelephant.monthpicker.MonthPickerDialog
import kotlinx.android.synthetic.main.activity_pay_money.*
import kotlinx.android.synthetic.main.dialog_add_new_card.view.*
import java.util.*


class AutoTopUpActivity : BaseActivity<ActivityAddAutoPopupBinding, AutoTopUpViewModel>(),
    AutoTopUpNavigator {

    var mAutoTopUpViewModel: AutoTopUpViewModel = AutoTopUpViewModel()
    override val viewModel: AutoTopUpViewModel get() = mAutoTopUpViewModel
    override val bindingVariable: Int get() = BR.autoTopUpVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_add_auto_popup
    private var list: ArrayList<CardBeanAutoTopUp> = ArrayList()
    var paymentMethod: String? = "card"
    var uId: String? = ""
    var profilePic: String? = ""
    var fullName: String? = ""
    var listType: String? = ""
    var cardId: String? = ""
    var cardType: String? = ""
    var noCards: Boolean? = false
    var cardNumber: String? = ""
    var nameOnCard: String? = ""
    var cardCVV: String? = ""
    var cardMonth: String? = ""
    var cardYear: String? = ""
    var saveStatus = "yes"
    var requestId: Int = 0
    //var userDataBean: RecentUserData? = null
    //var userItem: HashMap<String, String>? = null

    var enableDisableAutoTopUp = false

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@AutoTopUpActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mAutoTopUpViewModel.navigator = this
        mAutoTopUpViewModel.initView()
        window.setSharedElementEnterTransition(
            TransitionInflater.from(this@AutoTopUpActivity)
                .inflateTransition(R.transition.transition)
        )
        //   viewDataBinding!!.userIV.setTransitionName("imagePass")
        setData()
    }


    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        onBackPressed()
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {

        var currencyCode = AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this@AutoTopUpActivity)).Country!!.currencyCode

        viewDataBinding!!.tvCurrency.text = currencyCode

        viewDataBinding!!.tvRefill.text = currencyCode

       var refillAmount =  AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this@AutoTopUpActivity)).refillWalletAmount!!
       var minAmount =  AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this@AutoTopUpActivity)).minimumWalletAmount!!

        if(!refillAmount.equals("0") && refillAmount.isNotEmpty()){
            viewDataBinding!!.refillAmountEt.setText(refillAmount)
            viewDataBinding!!.minAmountEt.setText(minAmount)
        }


        var cardText = CreditCardNumberFormattingTextWatcher(viewDataBinding!!.cardNumberEt)
        viewDataBinding!!.cardNumberEt.addTextChangedListener(cardText)

//        viewDataBinding!!.radioDebitCard.setChecked(true)
//        viewDataBinding!!.llCard.visibility = View.VISIBLE
        viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
        cardType = getString(R.string.debit_card)
        hideKeyboard()

        amountValidation()
        cardExpiryPopup()

        viewDataBinding!!.cbSave.visibility = View.VISIBLE
        viewDataBinding!!.cbSave.isChecked = true
        viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)


        viewDataBinding!!.tvPay.setOnClickListener {
            (recyclerViewCard.adapter as CardAutoTopUpAdapter).updateUi()
            viewDataBinding!!.radioCreditCard.setChecked(false)
            viewDataBinding!!.radioDebitCard.setChecked(true)
            viewDataBinding!!.llCard.visibility = View.VISIBLE
            viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
            cardType = getString(R.string.debit_card)
            hideKeyboard()
            list.onEach { it.isDefault = false }
        }

        viewDataBinding!!.radioDebitCard.setOnClickListener {
            (recyclerViewCard.adapter as CardAutoTopUpAdapter).updateUi()
            viewDataBinding!!.radioCreditCard.setChecked(false)
            viewDataBinding!!.radioDebitCard.setChecked(true)
            viewDataBinding!!.llCard.visibility = View.VISIBLE
            viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
            cardType = getString(R.string.debit_card)
            hideKeyboard()
            list.onEach { it.isDefault = false }
        }

        viewDataBinding!!.radioCreditCard.setOnClickListener {
            cardType = "Credit Card"
            viewDataBinding!!.radioCreditCard.setChecked(true)
            viewDataBinding!!.radioDebitCard.setChecked(false)
            viewDataBinding!!.llCard.visibility = View.GONE
            viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_select)
            (recyclerViewCard.adapter as CardAutoTopUpAdapter).updateUi()
            hideKeyboard()

            list.onEach { it.isDefault = false }
        }

        initializeAdapter()
        if (checkIfInternetOn()) {
            mAutoTopUpViewModel.callForGetCardListAPI(AppPreference.getInstance(this))
            //       mAutoTopUpViewModel.callWalletAPI(AppPreference.getInstance(this))
        }

        enableDisableAutoTopUp = AppPreference.getInstance(this@AutoTopUpActivity).getSavedUser( AppPreference.getInstance(this@AutoTopUpActivity)).autoToupStatus
        viewDataBinding!!.switchAutoTopUp.isChecked = enableDisableAutoTopUp
        viewDataBinding!!.switchAutoTopUp.setOnClickListener {

            if (enableDisableAutoTopUp) {
                if (checkIfInternetOn()) {

                    mAutoTopUpViewModel.setAutoTopUpEnableDisable(
                        AppPreference.getInstance(this@AutoTopUpActivity),
                        AppConstants.IN_ACTIVE,
                        false
                    )
                } else {
                    viewDataBinding!!.switchAutoTopUp.isChecked = true
                }
            } else {
                if (checkIfInternetOn()) {
                    if(list.size>0) {
                        mAutoTopUpViewModel.setAutoTopUpEnableDisable(
                            AppPreference.getInstance(this@AutoTopUpActivity),
                            AppConstants.ACTIVE,
                            true
                        )
                    }else{
                        viewDataBinding!!.switchAutoTopUp.isChecked = false

                        DialogUtils.showAlertDialog(
                            this,
                            "",
                            getString(R.string.update_auto_top_up_alert)
                        )
                    }


                } else {
                    viewDataBinding!!.switchAutoTopUp.isChecked = false
                }


            }
        }

    }


    private fun cardExpiryPopup() {
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

            builder.setTitle("Selected Expiry Date")
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

    private fun amountValidation() {
        viewDataBinding!!.minAmountEt.addTextChangedListener(object : TextWatcher {
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
                    fArray[0] = LengthFilter(maxLength)
                    viewDataBinding!!.minAmountEt.setFilters(fArray)

                    var pos = p0.toString().indexOf(".")

                    if (p0.toString().length > (pos + 3)) {
                        viewDataBinding!!.minAmountEt.setText(
                            String.format(
                                "%.2f",
                                p0.toString().toFloat()
                            )
                        )
                        viewDataBinding!!.minAmountEt.setSelection(viewDataBinding!!.minAmountEt.getText().length)
                    }

                } else {
                    if (p1 == 6) {
                        try {
                            var number: StringBuilder = StringBuilder(p0.toString())
                            number.setCharAt(6, ' ')
                            viewDataBinding!!.minAmountEt.setText(number.toString().trim())
                            viewDataBinding!!.minAmountEt.setSelection(viewDataBinding!!.minAmountEt.getText().length)
                        } catch (e: java.lang.Exception) {
                            e.printStackTrace()
                        }
                    }
                    val maxLength = 7
                    val fArray = arrayOfNulls<InputFilter>(1)
                    fArray[0] = LengthFilter(maxLength)
                    viewDataBinding!!.minAmountEt.setFilters(fArray)
                }
            }
        })

        viewDataBinding!!.refillAmountEt.addTextChangedListener(object : TextWatcher {
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
                    fArray[0] = LengthFilter(maxLength)
                    viewDataBinding!!.refillAmountEt.setFilters(fArray)

                    var pos = p0.toString().indexOf(".")

                    if (p0.toString().length > (pos + 3)) {
                        viewDataBinding!!.refillAmountEt.setText(
                            String.format(
                                "%.2f",
                                p0.toString().toFloat()
                            )
                        )
                        viewDataBinding!!.refillAmountEt.setSelection(viewDataBinding!!.refillAmountEt.getText().length)
                    }

                } else {
                    if (p1 == 6) {
                        try {
                            var number: StringBuilder = StringBuilder(p0.toString())
                            number.setCharAt(6, ' ')
                            viewDataBinding!!.refillAmountEt.setText(number.toString().trim())
                            viewDataBinding!!.refillAmountEt.setSelection(viewDataBinding!!.refillAmountEt.getText().length)
                        } catch (e: java.lang.Exception) {
                            e.printStackTrace()
                        }
                    }
                    val maxLength = 7
                    val fArray = arrayOfNulls<InputFilter>(1)
                    fArray[0] = LengthFilter(maxLength)
                    viewDataBinding!!.refillAmountEt.setFilters(fArray)
                }
            }
        })
    }

    private fun setData() {


    }

    private fun statusCheck() {
        if (viewDataBinding!!.cbSave.isChecked) {
            saveStatus = "yes"
        } else {

            saveStatus = "no"
        }
    }

    override fun successToSentMoney() {
        hideKeyboard()
        statusCheck()

        if (mAutoTopUpViewModel.checkValidation(viewDataBinding!!) && checkIfInternetOn()) {

            cardCheckCondition()
        }
    }

    private fun cardCheckCondition() {
        if (viewDataBinding!!.radioCreditCard.isChecked || viewDataBinding!!.radioDebitCard.isChecked) {
            cardId = ""
            cardCVV = ""
            cardNumber = ""
            nameOnCard = ""
            if (mAutoTopUpViewModel.checkCardValidation(
                    viewDataBinding!!,
                    cardMonth!!,
                    cardYear!!
                )
            ) {
                apicall()
            }
//                } else if () {
//                    cardId = ""
//                    cardCVV = ""
//                    cardNumber = ""
//                    nameOnCard = ""
//                    if (mAutoTopUpViewModel.checkCardValidation(
//                            viewDataBinding!!,
//                            cardMonth!!,
//                            cardYear!!
//                        )
//                    ) {
//                        apicall()
//                    }
        } else {
            if (cardId.equals("")) {
                mAutoTopUpViewModel.navigator!!.showValidationError(getString(R.string.please_select_card))
            } else {
                apicall()
            }
        }
    }


    override fun validationResponse(
        cNumber: String,
        cName: String,
        month: String,
        year: String,
        cvv: String
    ) {
        cardMonth = cardMonth!!
        cardCVV = cvv
        cardNumber = cNumber
        cardYear = cardYear!!
        nameOnCard = cName
    }

    private fun apicall() {
        hideKeyboard()
        val intent = Intent(this, AutoTopUpMPinActivity::class.java)
        var cardBean = com.monayuser.data.model.bean.CardBeanAutoTopUp()
        cardBean.screenFrom = getString(R.string.pay_money)
        cardBean.paymentMethod = paymentMethod.toString()
        if (!uId.equals("")) {
            cardBean.userId = uId!!.toInt()
            cardBean.id = cardId!!
            cardBean.cardType = cardType!!
            if (!cardNumber.equals("")) {
                cardBean.cardNumber = cardNumber!!.replace("\\s".toRegex(), "").trim()
            } else {
                cardBean.cardNumber = cardNumber!!
            }

            cardBean.nameOnCard = nameOnCard!!
            cardBean.month = cardMonth!!
            cardBean.year = cardYear!!
            cardBean.cvv = cardCVV!!
            cardBean.saveCard = saveStatus
            cardBean.minimumWalletAmount = viewDataBinding!!.minAmountEt.text.toString().trim()
            cardBean.refileWalletAmount = viewDataBinding!!.minAmountEt.text.toString().trim()
            cardBean.message = ""//viewDataBinding!!.messageEt.text.toString().trim()
            intent.putExtra(AppConstants.CARD_DATA, cardBean)
            //   intent.putExtra(AppConstants.CONTACT_LIST_TYPE, listType)
            //intent.putExtra(AppConstants.USER_DATA, userDataBean!!)
//            startActivity(intent)
            resultLauncher.launch(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            cardBean.userId = 0
            cardBean.id = cardId!!
            cardBean.cardType = cardType!!
            if (!cardNumber.equals("")) {
                cardBean.cardNumber = cardNumber!!.replace("\\s".toRegex(), "").trim()
            } else {
                cardBean.cardNumber = cardNumber!!
            }
            cardBean.nameOnCard = nameOnCard!!
            cardBean.month = cardMonth!!
            cardBean.year = cardYear!!
            cardBean.cvv = cardCVV!!
            cardBean.saveCard = saveStatus
            cardBean.minimumWalletAmount = viewDataBinding!!.minAmountEt.text.toString().trim()
            cardBean.refileWalletAmount = viewDataBinding!!.refillAmountEt.text.toString().trim()
            cardBean.message = ""// viewDataBinding!!.messageEt.text.toString().trim()
            intent.putExtra(AppConstants.CARD_DATA, cardBean)
            //intent.putExtra(AppConstants.CONTACT_LIST_TYPE, listType)
            // intent.putExtra(AppConstants.USER_DATA, userItem!!)
            //startActivity(intent)
            resultLauncher.launch(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    var resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {

            var loginBean = AppPreference.getInstance(this@AutoTopUpActivity).getSavedUser( AppPreference.getInstance(this@AutoTopUpActivity))

            loginBean.refillWalletAmount = viewDataBinding!!.refillAmountEt.text.toString().trim()

            loginBean.minimumWalletAmount = viewDataBinding!!.minAmountEt.text.toString().trim()

            val userString = Gson().toJson(loginBean)
            AppPreference.getInstance(this@AutoTopUpActivity).addValue(PreferenceKeys.USER_DATA, userString)

            val intent = intent
            finish()
            startActivity(intent)
        }
    }

    override fun payMoneyResponse(payMoneyResponse: PayMoneyResponse) {
        //   userDataBean!!.amount = payMoneyResponse!!.data!!.amount.toString()
        // userDataBean!!.transactionId = payMoneyResponse!!.data!!.transactionId

//        val intent = Intent(this, AddSentMoneyActivity::class.java)
//        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.SENT_MONEY)
//        intent.putExtra(AppConstants.USER_DATA, userDataBean)
//        startActivity(intent)
//        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)

        DialogUtils.showAlertDialog(
            this,
            "",
            payMoneyResponse.message
        )

    }

    override fun AutoTopEnableDisableSuccessfully(
        response: AutoTopUpEnableDisableResponse,
        enableDisableBoolean: Boolean
    ) {

        viewDataBinding!!.switchAutoTopUp.isChecked = enableDisableBoolean
        enableDisableAutoTopUp = enableDisableBoolean

        var loginBean = AppPreference.getInstance(this@AutoTopUpActivity).getSavedUser( AppPreference.getInstance(this@AutoTopUpActivity))

        loginBean.autoToupStatus = enableDisableAutoTopUp

        val userString = Gson().toJson(loginBean)
        AppPreference.getInstance(this@AutoTopUpActivity).addValue(PreferenceKeys.USER_DATA, userString)


        DialogUtils.showAlertDialog(
            this,
            "",
            response.message
        )
    }


    override fun getCardListResponse(getCardListResponse: GetCardListAutoTopUpResponse) {

        if (getCardListResponse.data!!.isNotEmpty()) {
            noCards = false
            viewDataBinding!!.tvText.visibility = View.VISIBLE
            viewDataBinding!!.tvNoCard.visibility = View.GONE
            viewDataBinding!!.recyclerViewCard.visibility = View.VISIBLE
            list.addAll(getCardListResponse.data!!)
            recyclerViewCard.adapter!!.notifyDataSetChanged()
        } else {
            noCards = true
            viewDataBinding!!.tvNoCard.visibility = View.GONE
            viewDataBinding!!.tvText.visibility = View.GONE
            viewDataBinding!!.recyclerViewCard.visibility = View.GONE


            ////////////////////////////////////////////////////////////////////////////////////////////
            ///////////WHEN CARD LIST IS NOT ADDED THEN WE NED TO DISABLE TOGGLE////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////

            viewDataBinding!!.switchAutoTopUp.isChecked = false
            enableDisableAutoTopUp = false

            var loginBean = AppPreference.getInstance(this@AutoTopUpActivity).getSavedUser( AppPreference.getInstance(this@AutoTopUpActivity))
            loginBean.autoToupStatus = false
            val userString = Gson().toJson(loginBean)
            AppPreference.getInstance(this@AutoTopUpActivity).addValue(PreferenceKeys.USER_DATA, userString)
            /////////////////////////////////////////////////////////////////////////////////////////////////
        }
    }

    override fun enableDisablePopup() {
        TODO("Not yet implemented")
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        recyclerViewCard.layoutManager = LinearLayoutManager(this)
        recyclerViewCard.adapter = this.let {
            CardAutoTopUpAdapter(
                it,
                list, false
            )
        }

        recyclerViewCard.addItemDecoration(
            DividerItemDecoration(

                recyclerViewCard.getContext(),
                DividerItemDecoration.VERTICAL
            )
        )

        (recyclerViewCard.adapter as CardAutoTopUpAdapter).setOntemClickListener(object :
            CardAutoTopUpAdapter.OnItemClickListener {
            override fun onItemClicked(view: View, position: Int) {
                val etCvv = view.findViewById<EditText>(R.id.etCvv)
                var cardBean = com.monayuser.data.model.bean.CardBeanAutoTopUp()
                cardBean.screenFrom = getString(R.string.screen_auto_topup)
                cardBean!!.cardIconUrl = ""
                cardBean!!.cardType = ""
                cardBean.paymentMethod = paymentMethod.toString()

            //    cardBean.userId = uId!!.toInt()
                cardBean.id = cardId!!
                cardBean.cardType = cardType!!
                if (!cardNumber.equals("")) {
                    cardBean.cardNumber = cardNumber!!.replace("\\s".toRegex(), "").trim()
                } else {
                    cardBean.cardNumber = cardNumber!!
                }

                list.onEach { it.isDefault = false }

                checkValidation(cardBean, view, position)

            }

            override fun onItemChecked(
                view: View,
                cardBean: CardBeanAutoTopUp
            ) {
                val etCvv = view.findViewById<EditText>(R.id.etCvv)
                etCvv.setText("")
                cardId = cardBean.id.toString()
                cardNumber = cardBean.cardNumber
                nameOnCard = cardBean.nameOnCard
                cardMonth = cardBean.month
                cardCVV = cardBean.cvv
                cardYear = cardBean.year
                cardBean.isDefault = false
                viewDataBinding!!.radioCreditCard.setChecked(false)
                viewDataBinding!!.radioDebitCard.setChecked(false)
                viewDataBinding!!.llCard.visibility = View.GONE
                viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)

                list.onEach { it.isDefault = false }
            }
        })
    }

    private fun checkValidation(cardBean: CardBeanAutoTopUp, view: View, position: Int) {
        val intent = Intent(this@AutoTopUpActivity, AutoTopUpMPinActivity::class.java)

        if (mAutoTopUpViewModel.checkValidation(viewDataBinding!!) && checkIfInternetOn()) {
            if (view.etCvv.text.toString().trim().isEmpty()) {
                showValidationError(getStringResource(R.string.please_enter_cvv))
                view.etCvv.requestFocus()
                return
            }

            if (view.etCvv.text.toString().trim().length < 3) {
                showValidationError(getStringResource(R.string.please_enter_correct_cvv))
                view.etCvv.requestFocus()
                return
            }

            if (list[position].cardName != null && (list[position].cardName.equals(
                    "American Express",
                    true
                ) || list[position].cardName.equals("AMEX", true)) && view.etCvv.text.toString()
                    .trim().length != 4
            ) {
                showValidationError(getStringResource(R.string.please_enter_correct_cvv))
                view.etCvv.requestFocus()
                return
            }


            cardBean.nameOnCard = nameOnCard!!
            cardBean.month = cardMonth!!
            cardBean.year = cardYear!!
            cardBean.cvv = view.etCvv.text.toString().trim()
            cardBean.minimumWalletAmount = viewDataBinding!!.minAmountEt.text.toString().trim()
            cardBean.refileWalletAmount = viewDataBinding!!.refillAmountEt.text.toString().trim()
            //  cardBean.message = viewDataBinding!!.messageEt.text.toString().trim()
            intent.putExtra(AppConstants.CARD_DATA, cardBean)
            //  intent.putExtra(AppConstants.CONTACT_LIST_TYPE, listType)
            //intent.putExtra(AppConstants.USER_DATA, userDataBean!!)
           // startActivity(intent)
            resultLauncher.launch(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    /**
     * This method is used to hide progress bar
     */
    override fun hideProgressBar() {
        hideProgressDialog()
    }

    override fun onResume() {
        super.onResume()
        (recyclerViewCard.adapter as CardAutoTopUpAdapter).updateUi()
    }

    /**
     * This method is used to show progress bar
     */
    override fun showProgressBar() {
        showProgressDialog(this@AutoTopUpActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@AutoTopUpActivity,
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
        DialogUtils.sessionExpireDialog(this@AutoTopUpActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}