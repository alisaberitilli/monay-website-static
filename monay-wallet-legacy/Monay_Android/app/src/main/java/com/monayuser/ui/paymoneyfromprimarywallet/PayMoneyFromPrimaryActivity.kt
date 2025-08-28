package com.monayuser.ui.paymoneyfromprimarywallet

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
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.*
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.PrimaryUserListResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.databinding.ActivityPayMoneyFromPrimaryBinding
import com.monayuser.ui.addmoneyinwallet.adapter.CardAdapter
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.forgotmpin.ForgotMPinActivity
import com.monayuser.ui.paymoneyfromprimarywallet.adapter.PrimaryUserAdapter
import com.monayuser.ui.paymoneyfromprimarywallet.mpinscreen.MPinActivity
import com.monayuser.ui.primaryuserlist.adapter.PrimaryUserListAdapter
import com.monayuser.ui.secondaryuserdetail.SecondaryUserDetailActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.utils.*
import com.whiteelephant.monthpicker.MonthPickerDialog
import kotlinx.android.synthetic.main.activity_pay_money.*
import kotlinx.android.synthetic.main.dialog_add_new_card.view.*
import java.util.*


class PayMoneyFromPrimaryActivity : BaseActivity<ActivityPayMoneyFromPrimaryBinding, PayMoneyFromPrimaryViewModel>(),
    PayMoneyFromPrimaryNavigator {

    var mPayMoneyFromPrimaryViewModel: PayMoneyFromPrimaryViewModel = PayMoneyFromPrimaryViewModel()
    override val viewModel: PayMoneyFromPrimaryViewModel get() = mPayMoneyFromPrimaryViewModel
    override val bindingVariable: Int get() = BR.payMoneyPrimaryWalletVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_pay_money_from_primary
    private var list: ArrayList<com.monayuser.data.model.bean.CardBean> = ArrayList()
    private var primaryUserList: ArrayList<PrimaryAccountUser>? = null
    private var linearLayoutManager: LinearLayoutManager? = null
    private var primaryUserListAdapter: PrimaryUserAdapter? = null
    var selectCode: String? = null
    private var page = 1
    private var isLoading = false
    private var walletAmount:Double = 0.0
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
    var parentId: Int = 0
    var userDataBean: RecentUserData? = null

    var userItem: HashMap<String, String>? = null

    var isParentSelect=false
    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@PayMoneyFromPrimaryActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mPayMoneyFromPrimaryViewModel.navigator = this
        mPayMoneyFromPrimaryViewModel.initView()
        window.setSharedElementEnterTransition(TransitionInflater.from(this@PayMoneyFromPrimaryActivity).inflateTransition(R.transition.transition))
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
        hideKeyboard()
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
        amountValidation()
        initializeAdapter()
        if (checkIfInternetOn()) {
            mPayMoneyFromPrimaryViewModel.callPrimaryAccountListAPI(false,
                AppPreference.getInstance(this@PayMoneyFromPrimaryActivity),
                "0",
                "10"
            )
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



    override fun successToSentMoney() {
        hideKeyboard()
        //var secondaryUserRemainAmount=AppPreference.getInstance(this@PayMoneyFromPrimaryActivity).getValue(PreferenceKeys.WALLET_AMOUNT)!!.toDouble()
        if (mPayMoneyFromPrimaryViewModel.checkValidation(viewDataBinding!!) && checkIfInternetOn()) {
                val enterAmount = amount_et.text.toString().toDouble()
                val finalWalletAmount = walletAmount
                if (enterAmount > 0) {
                    if(isParentSelect)
                    {
                        if (enterAmount <= finalWalletAmount) {
                           // if (enterAmount <= secondaryUserRemainAmount)
                            //{
                                paymentMethod = "wallet"
                                apicall()
                            //}
                            //else
                            //{
                             //   mPayMoneyFromPrimaryViewModel.navigator!!.showValidationError(getString(R.string.please_enter_valid_amount))
                            //}

                        }
                        else
                        {
                            mPayMoneyFromPrimaryViewModel.navigator!!.showValidationError(getString(R.string.please_enter_valid_amount))
                        }
                    }
                    else
                    {
                        mPayMoneyFromPrimaryViewModel.navigator!!.showValidationError(getString(R.string.please_select_primary_account))
                    }
                } else {
                    mPayMoneyFromPrimaryViewModel.navigator!!.showValidationError(getString(R.string.please_enter_amount))

                }


        }
    }


    private fun apicall() {
        hideKeyboard()
        val intent = Intent(this@PayMoneyFromPrimaryActivity, MPinActivity::class.java)
        var cardBean = CardBean()
        cardBean.screenFrom = AppConstants.SECONDARY_ACCOUNT_SCREEEN
        cardBean.userId = uId!!.toInt()
        cardBean.id = ""
        cardBean.cardType = ""
        cardBean.cardNumber = ""
        cardBean.nameOnCard = ""
        cardBean.month = ""
        cardBean.year = ""
        cardBean.cvv = ""
        cardBean.saveCard = ""
        cardBean.paymentMethod = "wallet"
        cardBean.amount = viewDataBinding!!.amountEt.text.toString().trim()
        cardBean.message = viewDataBinding!!.messageEt.text.toString().trim()
        intent.putExtra(AppConstants.CARD_DATA, cardBean)
        intent.putExtra(AppConstants.PARENT_ID, parentId)

        intent.putExtra("REQUEST_ID", requestId)


      //  intent.putExtra(AppConstants.CONTACT_LIST_TYPE, listType)
      //  intent.putExtra(AppConstants.USER_DATA, userItem!!)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)

        }
    private fun initializeAdapter() {
     primaryUserList = ArrayList()
        linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.recyclerViewPrimary.layoutManager = linearLayoutManager
        primaryUserListAdapter = PrimaryUserAdapter(this, primaryUserList!!)
        viewDataBinding!!.recyclerViewPrimary.adapter = primaryUserListAdapter
        primaryUserListAdapter!!.setOntemClickListener(object :
            PrimaryUserAdapter.OnItemClickListener {
            override fun onItemClicked(item: PrimaryAccountUser, position: Int) {
                isParentSelect=true
                parentId=item.parentId
                walletAmount=item.remainAmount
            }
        })
        UserScrollMethod()
    }
    private fun UserScrollMethod() {
        viewDataBinding!!.recyclerViewPrimary.addOnScrollListener(object :
            RecyclerView.OnScrollListener() {
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
    fun loadMoreItems() {
        if (checkIfInternetOn()) {
            isLoading = true
            page += 1
            mPayMoneyFromPrimaryViewModel.callPrimaryAccountListAPI(true,
                AppPreference.getInstance(this@PayMoneyFromPrimaryActivity),
                primaryUserList!!.size.toString(),
                "10"
            )
        }
    }
    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this@PayMoneyFromPrimaryActivity)) {
            initializeAdapter()
            viewDataBinding!!.recyclerViewPrimary.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.visibility = View.GONE
            viewDataBinding!!.tryAgain.visibility = View.GONE
            viewDataBinding!!.tvNoPrimaryAccount.visibility = View.GONE
            mPayMoneyFromPrimaryViewModel.callPrimaryAccountListAPI(false,
                AppPreference.getInstance(this@PayMoneyFromPrimaryActivity),
                "0",
                "10")
        } else {

            viewDataBinding!!.recyclerViewPrimary.visibility = View.GONE
            viewDataBinding!!.noInternet.visibility = View.VISIBLE
            viewDataBinding!!.tryAgain.visibility = View.VISIBLE
            viewDataBinding!!.tvNoPrimaryAccount.visibility = View.GONE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    override fun showPageLoader() {
        viewDataBinding!!.progress.visibility = View.VISIBLE
    }

    override fun showHideLoader() {
        viewDataBinding!!.progress.visibility = View.GONE
    }

    override fun getPrimaryUserListResponse(getListResponse: PrimaryUserListResponse) {
        primaryUserList!!.addAll(getListResponse.data!!.rows)
        if (primaryUserList!!.isEmpty())
        {
            viewDataBinding!!.tvNoPrimaryAccount.visibility= View.VISIBLE
            viewDataBinding!!.recyclerViewPrimary.visibility= View.GONE
        }
        else
        {
            viewDataBinding!!.tvNoPrimaryAccount.visibility= View.GONE
            viewDataBinding!!.recyclerViewPrimary.visibility= View.VISIBLE
        }
        primaryUserListAdapter!!.notifyDataSetChanged()
        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                getListResponse.data!!.count,
                10
            )
        ) {
            isLoading = true
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

    }

    /**
     * This method is used to show progress bar
     */
    override fun showProgressBar() {
        showProgressDialog(this@PayMoneyFromPrimaryActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@PayMoneyFromPrimaryActivity,
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
        DialogUtils.sessionExpireDialog(this@PayMoneyFromPrimaryActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}