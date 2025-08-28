package com.monayuser.ui.forgotmpin

import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.AddMoneyResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.RequestWithdrawalResponse
import com.monayuser.data.model.response.SendPaymentRequestResponse
import com.monayuser.databinding.ActivityForgotPinBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_forgot_pin.*

class ForgotMPinActivity : BaseActivity<ActivityForgotPinBinding, ForgotMPinViewModel>(),
    ForgotMPinNavigator {

    private var cardBean: CardBean? = null
    private var userDataBean: RecentUserData? = null
    private var listType: String? = ""
    var userItem: HashMap<String, String>? = null
    val mForgotMPinViewModel: ForgotMPinViewModel = ForgotMPinViewModel()
    override val bindingVariable: Int get() = BR.forgotPinVM
    override val layoutId: Int get() = R.layout.activity_forgot_pin
    override val viewModel: ForgotMPinViewModel get() = mForgotMPinViewModel
    var requestId: Int = 0
    lateinit var appPreferences: AppPreference
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@ForgotMPinActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)
        mForgotMPinViewModel.navigator = this
        mForgotMPinViewModel.initView()
        appPreferences = AppPreference.getInstance(this@ForgotMPinActivity)
    }

    override fun init() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) {
            forgotPinview.splitWidth = 15
            forgotPinview.pinHeight = 90
            forgotPinview.pinWidth = 135
        }
        forgotPinview.showCursor(true)

        if (intent != null && intent.hasExtra(AppConstants.CARD_DATA)) {
            cardBean = intent.getParcelableExtra<CardBean>(AppConstants.CARD_DATA)
            listType = intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)
            viewDataBinding!!.headerTxt.text = cardBean!!.screenFrom

            if (cardBean!!.screenFrom.equals(getString(R.string.pay_money))) {
                if (listType.equals(AppConstants.RECENT_CONTACT)) {
                    userDataBean =
                        intent.getSerializableExtra(AppConstants.USER_DATA) as RecentUserData?
                    requestId = userDataBean!!.requestId!!
                } else {
                    userItem =
                        intent.extras!!.get(AppConstants.CONTACT_USER_DATA) as HashMap<String, String>?
                    userDataBean = RecentUserData()
                    userDataBean!!.amount = cardBean!!.amount
                }
//            } else if (cardBean!!.screenFrom.equals(getString(R.string.add_money_title)) || cardBean!!.screenFrom.equals(getString(R.string.request_for_withdrawal))) {
//                if (listType.equals(AppConstants.RECENT_CONTACT)) {
//                    userDataBean =
//                        intent.getSerializableExtra(AppConstants.USER_DATA) as RecentUserData?
//                } else {
//                    userItem =
//                        intent.extras!!.get(AppConstants.CONTACT_USER_DATA) as HashMap<String, String>?
//                    userDataBean = RecentUserData()
//                    userDataBean!!.amount = cardBean!!.amount
//                }
//            } else if (cardBean!!.screenFrom.equals(getString(R.string.request_for_withdrawal))) {
//                if (listType.equals(AppConstants.RECENT_CONTACT)) {
//                    userDataBean =
//                        intent.getSerializableExtra(AppConstants.USER_DATA) as RecentUserData?
//                } else {
//                    userItem =
//                        intent.extras!!.get(AppConstants.CONTACT_USER_DATA) as HashMap<String, String>?
//                    userDataBean = RecentUserData()
//                    userDataBean!!.amount = cardBean!!.amount
//                }
            } else {
                if (listType.equals(AppConstants.RECENT_CONTACT)) {
                    userDataBean =
                        intent.getSerializableExtra(AppConstants.USER_DATA) as RecentUserData?
                } else {
                    userItem =
                        intent.extras!!.get(AppConstants.CONTACT_USER_DATA) as HashMap<String, String>?
                    userDataBean = RecentUserData()
                    userDataBean!!.amount = cardBean!!.amount
                }
            }
        }
    }

    override fun backToPreviousScreen() {
        finish()
    }

    override fun getInvalidPin() {
        if(!viewDataBinding!!.forgotPinview.value.equals(""))
        {
            viewDataBinding!!.forgotPinview.clearValue()
        }

    }

    override fun confirmPin() {
        hideKeyboard()
        if (mForgotMPinViewModel.pinValidation(viewDataBinding!!) && checkIfInternetOn()) {
            if (cardBean!!.screenFrom.equals(getString(R.string.request_money), true)) {
                mForgotMPinViewModel.sendPaymentRequestApi(
                    AppPreference.getInstance(this),
                    cardBean!!
                )
            } else if (cardBean!!.screenFrom.equals(getString(R.string.add_money_title), true)) {

                mForgotMPinViewModel.addMoney(
                    AppPreference.getInstance(this),
                    cardBean!!,
                    viewDataBinding!!.forgotPinview!!.value!!
                )
            } else if (cardBean!!.screenFrom.equals(
                    getString(R.string.request_for_withdrawal),
                    true
                )
            ) {
                mForgotMPinViewModel.requestWithdrawalAPI(
                    AppPreference.getInstance(this),
                    cardBean!!.amount!!,
                    cardBean!!.bankId!!
                )
            } else {
                mForgotMPinViewModel.payMoney(
                    AppPreference.getInstance(this),
                    cardBean!!,
                    requestId!!
                )
            }
        }
    }

    override fun getKYCStatusResponse(message: String) {
        try {
            val dialog = Dialog(this, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_kyc)
            dialog.window!!.setLayout(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)

            val btnOk = dialog.findViewById<View>(R.id.btn_ok) as Button
            val tvMessage = dialog.findViewById<View>(R.id.tv_message) as TextView
            val tvTitle = dialog.findViewById<View>(R.id.tv_title) as TextView
            val ivCross = dialog.findViewById<View>(R.id.iv_cross) as ImageView

            ivCross.visibility = View.VISIBLE

            btnOk.text = getString(R.string.complete_kyc)
            tvTitle.text = getString(R.string.complete_your_kyc)
            tvMessage.text = message

            btnOk.setOnClickListener {
                dialog.dismiss()

                if(appPreferences.getSavedUser(appPreferences).phoneNumberCountryCode.equals("+1")){
                    openKYCActivty(this@ForgotMPinActivity)
                }else{
                    openDynamicKYCActivty(this@ForgotMPinActivity)
                }
                //openKYCActivty(this)
            }

            ivCross.setOnClickListener {
                dialog.dismiss()
            }

            dialog.show()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun payMoneyResponse(payMoneyResponse: PayMoneyResponse) {
        userDataBean!!.amount = payMoneyResponse!!.data!!.amount.toString()
        userDataBean!!.transactionId = payMoneyResponse!!.data!!.transactionId
        userDataBean!!.status = payMoneyResponse!!.data!!.status
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.SENT_MONEY)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun addMoneyResponse(addMoneyResponse: AddMoneyResponse) {
        userDataBean!!.transactionId = addMoneyResponse.data!!.transactionId
        userDataBean!!.status = addMoneyResponse.data!!.status
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.ADD_MONEY)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun sendPaymentRequestResponse(sendPaymentRequestResponse: SendPaymentRequestResponse) {
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.REQUEST_MONEY)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        intent.putExtra("Amount", cardBean!!.amount)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun getWithdrawalMoneyResponse(requestWithdrawalResponse: RequestWithdrawalResponse) {
        userDataBean!!.transactionId = requestWithdrawalResponse.data!!.transactionId
        userDataBean!!.status = requestWithdrawalResponse.data!!.status
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.REQUEST_WITHDRAWAL)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun forgotPin() {
        val intent = Intent(this, MobileVerificationActivity::class.java)
        intent.putExtra(AppConstants.SCREEN_FROM, "PayMoney")
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
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
}