package com.monayuser.ui.mycard

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.widget.RadioButton
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.response.AddCardResponse
import com.monayuser.data.model.response.DeleteCardResponse
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.databinding.ActivityMyCardBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mycard.adapter.MyCardAdapter
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.CreditCardNumberFormattingTextWatcher
import com.monayuser.utils.DialogUtils
// TODO: Replace with Material DatePicker when implementing month/year selection
// import com.google.android.material.datepicker.MaterialDatePicker
import java.util.*
import kotlin.collections.ArrayList

class MyCardActivity : BaseActivity<ActivityMyCardBinding, MyCardViewModel>(),
    MyCardNavigator {

    private var cardNumber = ""
    private var cardName = ""
    private var monthMain = ""
    private var yearMain = ""
    private var cvv = ""
    private var cardList: ArrayList<CardBean>? = null
    private var linearLayoutManager: LinearLayoutManager? = null
    private var myCardAdapter: MyCardAdapter? = null
    private var dialog: BottomSheetDialog? = null
    private var cardType = ""

    var myCardViewModel: MyCardViewModel = MyCardViewModel()
    override val viewModel: MyCardViewModel get() = myCardViewModel

    override val bindingVariable: Int get() = BR.myCardVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_my_card

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@MyCardActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        myCardViewModel.navigator = this
        myCardViewModel.initView()
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        initializeAdapter()
        if (checkIfInternetOn()) {
            myCardViewModel.callForGetCardListAPI(AppPreference.getInstance(this))
        } else {
            tryAgain()
        }
    }

    /**
     * This method is used to initialize an adapter.
     */
    private fun initializeAdapter() {
        cardList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.myCardRecyclerView.layoutManager = linearLayoutManager
        myCardAdapter = MyCardAdapter(this, cardList!!)
        viewDataBinding!!.myCardRecyclerView.adapter = myCardAdapter

        myCardAdapter!!.setOntemClickListener(object :
            MyCardAdapter.OnItemClickListener {
            override fun onItemClicked(view: View, position: Int) {
                if (checkIfInternetOn()) {
                    myCardViewModel.callForDeleteCardAPI(
                        AppPreference.getInstance(this@MyCardActivity),
                        cardList!![position].id.toString(),
                        position
                    )
                }
            }
        })
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
            myCardViewModel.callForGetCardListAPI(AppPreference.getInstance(this))
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
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
        showProgressDialog(this@MyCardActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@MyCardActivity,
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
        DialogUtils.sessionExpireDialog(this@MyCardActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun getCardListResponse(getCardListResponse: GetCardListResponse) {
        viewDataBinding!!.mainLayout.visibility = View.VISIBLE
        viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
        if (getCardListResponse.data!!.isNotEmpty()) {
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.myCardRecyclerView.visibility = View.VISIBLE
            cardList!!.addAll(getCardListResponse.data!!)
            myCardAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.myCardRecyclerView.visibility = View.GONE
        }

    }

    override fun deleteCardResponse(deleteCardResponse: DeleteCardResponse, position: Int) {
        cardList!!.removeAt(position)
        myCardAdapter!!.notifyDataSetChanged()

        if (cardList!!.size == 0) {
            viewDataBinding!!.tvNoRecord.visibility = View.VISIBLE
            viewDataBinding!!.myCardRecyclerView.visibility = View.GONE
        }

        DialogUtils.dialogWithoutEvent(
            this,
            resources.getString(R.string.oops),
            deleteCardResponse.message
        )
    }

    /**
     * This method is used to show add card dialog
     */
    override fun showAddNewCardDialog() {
        cardType = getStringResource(R.string.debit_card)
        dialog = BottomSheetDialog(this)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_add_new_card, null)
        bottomSheet.findViewById<View>(R.id.imageCloseDialog).setOnClickListener { dialog!!.dismiss() }
        dialog!!.setContentView(bottomSheet)

        var cardText = CreditCardNumberFormattingTextWatcher(bottomSheet.findViewById(R.id.etCardNumber))
        bottomSheet.findViewById<android.widget.EditText>(R.id.etCardNumber).addTextChangedListener(cardText)

        bottomSheet.findViewById<View>(R.id.etMonth).setOnClickListener {
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

        bottomSheet.findViewById<View>(R.id.btnAddCard).setOnClickListener {
            val debitRadio: RadioButton = bottomSheet.findViewById<RadioButton>(R.id.rb_debit)
            bottomSheet.findViewById<RadioButton>(R.id.rb_credit)

            if (debitRadio.isChecked) {
                cardType = getStringResource(R.string.debit_card)
            } else {
                cardType = getStringResource(R.string.credit_card)
            }

            cardName = bottomSheet.findViewById<android.widget.EditText>(R.id.etCardHolderName).text.toString().trim()

            if (!bottomSheet.findViewById<android.widget.EditText>(R.id.etCardNumber).text.toString().equals("")) {
                cardNumber =
                    bottomSheet.findViewById<android.widget.EditText>(R.id.etCardNumber).text.toString()!!.replace("\\s".toRegex(), "").trim()
            } else {
                cardNumber = bottomSheet.findViewById<android.widget.EditText>(R.id.etCardNumber).text.toString()!!
            }

            cvv = bottomSheet.findViewById<android.widget.EditText>(R.id.etCvv).text.toString()

            if (checkIfInternetOn() && myCardViewModel.checkCardValidation(
                    bottomSheet,
                    monthMain,
                    yearMain
                )
            ) {
                myCardViewModel.callAddCardAPI(
                    AppPreference.getInstance(this),
                    cardName,
                    cardNumber,
                    monthMain,
                    yearMain,
                    cvv,
                    cardType
                )
                dialog!!.dismiss()
            }
        }
        dialog!!.show()
        dialog!!.getWindow()!!.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
    }

    override fun addCardResponse(addCardResponse: AddCardResponse) {
        viewDataBinding!!.mainLayout.visibility = View.VISIBLE
        viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

        cardList!!.add(addCardResponse.data!!)
        myCardAdapter!!.notifyDataSetChanged()
        dialog!!.dismiss()

        if (cardList!!.size > 0) {
            viewDataBinding!!.tvNoRecord.visibility = View.GONE
            viewDataBinding!!.myCardRecyclerView.visibility = View.VISIBLE
        }

        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            addCardResponse.message,
            ItemEventListener()
        )
    }

    /**
     * This method is called when click on back button
     */
    override fun onBackPressFinish() {
        finish()
    }
}