package com.monayuser.ui.paymoney

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
import android.widget.RadioButton
import android.widget.RadioGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.bumptech.glide.Glide
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.databinding.ActivityPayMoneyBinding
import com.monayuser.ui.addmoneyinwallet.adapter.CardAdapter
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.forgotmpin.ForgotMPinActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.utils.*
// TODO: Replace with Material DatePicker when implementing month/year selection
// import com.google.android.material.datepicker.MaterialDatePicker
import java.util.*


class PayMoneyActivity : BaseActivity<ActivityPayMoneyBinding, PayMoneyViewModel>(),
    PayMoneyNavigator {

    var mPayMoneyViewModel: PayMoneyViewModel = PayMoneyViewModel()
    override val viewModel: PayMoneyViewModel get() = mPayMoneyViewModel
    override val bindingVariable: Int get() = BR.payMoneyVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_pay_money
    private var list: ArrayList<com.monayuser.data.model.bean.CardBean> = ArrayList()
    private var walletAmount = ""
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
    var saveStatus = ""
    var requestId: Int = 0
    var userDataBean: RecentUserData? = null
    var userItem: HashMap<String, String>? = null

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@PayMoneyActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mPayMoneyViewModel.navigator = this
        mPayMoneyViewModel.initView()
        window.setSharedElementEnterTransition(TransitionInflater.from(this@PayMoneyActivity).inflateTransition(R.transition.transition))
        viewDataBinding!!.userIV.setTransitionName("imagePass")
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
        viewDataBinding!!.tvCurrency.text = AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode

        var cardText = CreditCardNumberFormattingTextWatcher(viewDataBinding!!.cardNumberEt)
        viewDataBinding!!.cardNumberEt.addTextChangedListener(cardText)

        viewDataBinding!!.radioDebitCard.setChecked(true)
        viewDataBinding!!.llCard.visibility = View.VISIBLE
        viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
        cardType = getString(R.string.debit_card)
        hideKeyboard()

        amountValidation()
        cardExpiryPopup()

        viewDataBinding!!.cbSave.visibility = View.VISIBLE
        viewDataBinding!!.cbSave.isChecked = true
        viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
        if (intent != null) {
            if (intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)
                    .equals(AppConstants.RECENT_CONTACT)
            ) {
                var flag: String? = intent.getStringExtra(AppConstants.COME_FROM)
                userDataBean =
                    intent.getSerializableExtra(AppConstants.CONTACT_USER_DATA) as? RecentUserData
                listType = intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)!!
                uId = userDataBean!!.id.toString()

                if (userDataBean!!.amount != null && !userDataBean!!.amount.equals(""))
                    viewDataBinding!!.amountEt.setText(userDataBean!!.amount)
                if (flag.equals("PaymentRequest")) {
                    requestId = userDataBean!!.requestId!!
                } else {
                    userDataBean!!.requestId = 0
                }
            } else {
                userItem =
                    intent.extras!!.get(AppConstants.CONTACT_USER_DATA) as HashMap<String, String>?
                uId = ""
                listType = intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)!!
            }
        }

        viewDataBinding!!.tvPay.setOnClickListener {
            (recyclerViewCard.adapter as CardAdapter).updateUi()
            viewDataBinding!!.radioCreditCard.setChecked(false)
            viewDataBinding!!.radioDebitCard.setChecked(true)
            viewDataBinding!!.llCard.visibility = View.VISIBLE
            viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
            cardType = getString(R.string.debit_card)
            hideKeyboard()
        }

        viewDataBinding!!.radioDebitCard.setOnClickListener {
            (recyclerViewCard.adapter as CardAdapter).updateUi()
            viewDataBinding!!.radioCreditCard.setChecked(false)
            viewDataBinding!!.radioDebitCard.setChecked(true)
            viewDataBinding!!.llCard.visibility = View.VISIBLE
            viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
            cardType = getString(R.string.debit_card)
            hideKeyboard()
        }

        viewDataBinding!!.radioCreditCard.setOnClickListener {
            cardType = "Credit Card"
            viewDataBinding!!.radioCreditCard.setChecked(true)
            viewDataBinding!!.radioDebitCard.setChecked(false)
            viewDataBinding!!.llCard.visibility = View.GONE
            viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_select)
            (recyclerViewCard.adapter as CardAdapter).updateUi()
            hideKeyboard()
        }

        initializeAdapter()
        if (checkIfInternetOn()) {
            mPayMoneyViewModel.callForGetCardListAPI(AppPreference.getInstance(this))
            mPayMoneyViewModel.callWalletAPI(AppPreference.getInstance(this))
        }

        cardValidation()
    }

    private fun cardValidation() {
        radio_group.setOnCheckedChangeListener(RadioGroup.OnCheckedChangeListener { group, checkedId ->
            var id: Int = radio_group.checkedRadioButtonId
            if (id != -1) { // If any radio button checked from radio group
                // Get the instance of radio button using id
                val radio: RadioButton = findViewById(id)
                paymentMethod = radio.text.toString()

                if ("${radio.text}".equals(getString(R.string.wallet), true)) {
                    wallet_selection_layout.visibility = View.VISIBLE
                    card_selection_layout.visibility = View.GONE
                    cardId = "";
                    cardType = ""
                    cardCVV = ""
                    cardNumber = ""
                    nameOnCard = ""
                    (recyclerViewCard.adapter as CardAdapter).updateUi()
                    viewDataBinding!!.radioCreditCard.setChecked(false)
                    viewDataBinding!!.radioDebitCard.setChecked(false)
                    viewDataBinding!!.llCard.visibility = View.GONE
                    viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
                    viewDataBinding!!.tvText.visibility = View.GONE
                } else {
                    walletRadioBtn.isChecked = false
                    wallet_selection_layout.visibility = View.GONE
                    card_selection_layout.visibility = View.VISIBLE

                    if (list.size > 0)
                        viewDataBinding!!.tvText.visibility = View.VISIBLE
                }
            }
        })
    }

    private fun cardExpiryPopup() {
        viewDataBinding!!.cardExMonth.setOnClickListener {
            // TODO: Implement card expiry date picker using Material DatePicker
            // For now, show a simple alert to user
            showValidationError("Card expiry selection temporarily disabled. Please contact support.")
            
            /* 
            TODO: Replace with Material DatePicker implementation:
            val materialDateBuilder = MaterialDatePicker.Builder.datePicker()
            val picker = materialDateBuilder.build()
            picker.show(supportFragmentManager, picker.toString())
            */
        }
    }

    private fun amountValidation() {
        viewDataBinding!!.amountEt.addTextChangedListener(object : TextWatcher {
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
                    viewDataBinding!!.amountEt.setFilters(fArray)

                    var pos = p0.toString().indexOf(".")

                    if (p0.toString().length > (pos + 3)) {
                        viewDataBinding!!.amountEt.setText(
                            String.format(
                                "%.2f",
                                p0.toString().toFloat()
                            )
                        )
                        viewDataBinding!!.amountEt.setSelection(viewDataBinding!!.amountEt.getText().length)
                    }

                } else {
                    if (p1 == 6) {
                        try {
                            var number: StringBuilder = StringBuilder(p0.toString())
                            number.setCharAt(6, ' ')
                            viewDataBinding!!.amountEt.setText(number.toString().trim())
                            viewDataBinding!!.amountEt.setSelection(viewDataBinding!!.amountEt.getText().length)
                        } catch (e: java.lang.Exception) {
                            e.printStackTrace()
                        }
                    }
                    val maxLength = 7
                    val fArray = arrayOfNulls<InputFilter>(1)
                    fArray[0] = LengthFilter(maxLength)
                    viewDataBinding!!.amountEt.setFilters(fArray)
                }
            }
        })
    }

    private fun setData() {
        if (listType.equals(AppConstants.MY_CONTACT)) {
            if (!userItem!!.get("image").equals("null")) {
                if (!userItem!!.get("image").equals("")) {
                    Glide.with(this)
                        .load(Uri.parse(userItem!!.get("image")))
                        .into(viewDataBinding!!.userIV)
                } else {
                    viewDataBinding!!.userIV.setImageResource(R.mipmap.ic_user_icon)
                }
            } else {
                profilePic = ""
                viewDataBinding!!.userIV.setImageResource(R.mipmap.ic_user_icon)
            }
            viewDataBinding!!.fullName.text = userItem!!.get("name")
            viewDataBinding!!.contactTV.text = userItem!!.get("contact")
            fullName = userItem!!.get("name")
        } else {
            if (userDataBean!!.profilePictureUrl != null && !userDataBean!!.profilePictureUrl.equals(
                    ""
                )
            ) {
                CommonUtils.showProfile(
                    this,
                    userDataBean!!.profilePictureUrl,
                    viewDataBinding!!.userIV
                )
            }
            viewDataBinding!!.fullName.text =
                "${userDataBean!!.firstName} ${userDataBean!!.lastName}"
            viewDataBinding!!.contactTV.text =
                "${userDataBean!!.phoneNumberCountryCode} ${userDataBean!!.phoneNumber}"
            fullName = "${userDataBean!!.firstName} ${userDataBean!!.lastName}"
        }

        if (requestId != 0) {
            viewDataBinding!!.amountEt.isFocusable = false
            viewDataBinding!!.amountEt.isEnabled = false
        }
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
        if (mPayMoneyViewModel.checkValidation(viewDataBinding!!) && checkIfInternetOn()) {
            if (paymentMethod.equals(getString(R.string.wallet), true)) {
                val enterAmount = amount_et.text.toString().toFloat()
                val finalWalletAmount = walletAmount.toFloat()
                if (enterAmount > 0) {
                    if (enterAmount <= finalWalletAmount) {
                        cardType = ""
                        cardId = ""
                        cardCVV = ""
                        cardNumber = ""
                        nameOnCard = ""
                        paymentMethod = "wallet"
                        apicall()
                    } else {
                        mPayMoneyViewModel.navigator!!.showValidationError(getString(R.string.please_enter_valid_amount))
                    }
                } else {
                    mPayMoneyViewModel.navigator!!.showValidationError(getString(R.string.please_enter_amount))
                }

            } else {
                cardCheckCondition()
            }
        }
    }

    private fun cardCheckCondition() {
        if (viewDataBinding!!.radioCreditCard.isChecked || viewDataBinding!!.radioDebitCard.isChecked) {
            cardId = ""
            cardCVV = ""
            cardNumber = ""
            nameOnCard = ""
            if (mPayMoneyViewModel.checkCardValidation(
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
//                    if (mPayMoneyViewModel.checkCardValidation(
//                            viewDataBinding!!,
//                            cardMonth!!,
//                            cardYear!!
//                        )
//                    ) {
//                        apicall()
//                    }
        } else {
            if (cardId.equals("")) {
                mPayMoneyViewModel.navigator!!.showValidationError(getString(R.string.please_select_card))
            } else {
                apicall()
            }
        }
    }

    override fun getWalletResponse(walletResponse: WalletResponse) {
        walletAmount = walletResponse.data!!.totalWalletAmount
        if (walletResponse.data!!.totalWalletAmount.contains(".")) {
            viewDataBinding!!.walletAmountText.text =
                "${ AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%.2f", walletResponse.data!!.totalWalletAmount.toFloat())}"
        } else {
            viewDataBinding!!.walletAmountText.text =
                "${ AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode} ${String.format("%,d", walletResponse.data!!.totalWalletAmount.toLong())}"
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
        val intent = Intent(this, ForgotMPinActivity::class.java)
        var cardBean = com.monayuser.data.model.bean.CardBean()
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
            cardBean.amount = viewDataBinding!!.amountEt.text.toString().trim()
            cardBean.message = viewDataBinding!!.messageEt.text.toString().trim()
            intent.putExtra(AppConstants.CARD_DATA, cardBean)
            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, listType)
            intent.putExtra(AppConstants.USER_DATA, userDataBean!!)
            startActivity(intent)
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
            cardBean.amount = viewDataBinding!!.amountEt.text.toString().trim()
            cardBean.message = viewDataBinding!!.messageEt.text.toString().trim()
            intent.putExtra(AppConstants.CARD_DATA, cardBean)
            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, listType)
            intent.putExtra(AppConstants.USER_DATA, userItem!!)
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    override fun payMoneyResponse(payMoneyResponse: PayMoneyResponse) {
        userDataBean!!.amount = payMoneyResponse!!.data!!.amount.toString()
        userDataBean!!.transactionId = payMoneyResponse!!.data!!.transactionId

        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.SENT_MONEY)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun getCardListResponse(getCardListResponse: GetCardListResponse) {
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
        }
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        recyclerViewCard.layoutManager = LinearLayoutManager(this)
        recyclerViewCard.adapter = this.let {
            CardAdapter(
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

        (recyclerViewCard.adapter as CardAdapter).setOntemClickListener(object :
            CardAdapter.OnItemClickListener {
            override fun onItemClicked(view: View, position: Int) {
                val etCvv = view.findViewById<EditText>(R.id.etCvv)
                var cardBean = com.monayuser.data.model.bean.CardBean()
                cardBean.screenFrom = getString(R.string.pay_money)
                cardBean!!.cardIconUrl = ""
                cardBean!!.cardType = ""
                cardBean.paymentMethod = paymentMethod.toString()

                cardBean.userId = uId!!.toInt()
                cardBean.id = cardId!!
                cardBean.cardType = cardType!!
                if (!cardNumber.equals("")) {
                    cardBean.cardNumber = cardNumber!!.replace("\\s".toRegex(), "").trim()
                } else {
                    cardBean.cardNumber = cardNumber!!
                }

                checkValidation(cardBean, view, position)
            }

            override fun onItemChecked(view: View, cardBean: com.monayuser.data.model.bean.CardBean) {
                val etCvv = view.findViewById<EditText>(R.id.etCvv)
                etCvv.setText("")
                cardId = cardBean.id.toString()
                cardNumber = cardBean.cardNumber
                nameOnCard = cardBean.nameOnCard
                cardMonth = cardBean.month
                cardCVV = cardBean.cvv
                cardYear = cardBean.year
                viewDataBinding!!.radioCreditCard.setChecked(false)
                viewDataBinding!!.radioDebitCard.setChecked(false)
                viewDataBinding!!.llCard.visibility = View.GONE
                viewDataBinding!!.imageCreditCard.setImageResource(R.mipmap.ic_card_unselect)
            }
        })
    }

    private fun checkValidation(cardBean: CardBean, view: View, position: Int) {
        val intent = Intent(this@PayMoneyActivity, ForgotMPinActivity::class.java)

        if (mPayMoneyViewModel.checkValidation(viewDataBinding!!) && checkIfInternetOn()) {
            if (view.findViewById<EditText>(R.id.etCvv).text.toString().trim().isEmpty()) {
                showValidationError(getStringResource(R.string.please_enter_cvv))
                view.findViewById<EditText>(R.id.etCvv).requestFocus()
                return
            }

            if (view.findViewById<EditText>(R.id.etCvv).text.toString().trim().length < 3) {
                showValidationError(getStringResource(R.string.please_enter_correct_cvv))
                view.findViewById<EditText>(R.id.etCvv).requestFocus()
                return
            }

            if (list[position].cardName != null && (list[position].cardName.equals(
                    "American Express",
                    true
                ) || list[position].cardName.equals("AMEX", true)) && view.findViewById<EditText>(R.id.etCvv).text.toString()
                    .trim().length != 4
            ) {
                showValidationError(getStringResource(R.string.please_enter_correct_cvv))
                view.findViewById<EditText>(R.id.etCvv).requestFocus()
                return
            }


            cardBean.nameOnCard = nameOnCard!!
            cardBean.month = cardMonth!!
            cardBean.year = cardYear!!
            cardBean.cvv = view.findViewById<EditText>(R.id.etCvv).text.toString().trim()
            cardBean.amount = viewDataBinding!!.amountEt.text.toString().trim()
            cardBean.message = viewDataBinding!!.messageEt.text.toString().trim()
            intent.putExtra(AppConstants.CARD_DATA, cardBean)
            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, listType)
            intent.putExtra(AppConstants.USER_DATA, userDataBean!!)
            startActivity(intent)
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
        (viewDataBinding!!.recyclerViewCard.adapter as CardAdapter).updateUi()
    }

    /**
     * This method is used to show progress bar
     */
    override fun showProgressBar() {
        showProgressDialog(this@PayMoneyActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@PayMoneyActivity,
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
        DialogUtils.sessionExpireDialog(this@PayMoneyActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}