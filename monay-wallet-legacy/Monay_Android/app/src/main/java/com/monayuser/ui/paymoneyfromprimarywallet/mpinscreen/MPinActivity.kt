package com.monayuser.ui.paymoneyfromprimarywallet.mpinscreen

import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.Window

import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.AddMoneyResponse
import com.monayuser.data.model.response.PayMoneyResponse
import com.monayuser.data.model.response.SecondaryUserPayResponse

import com.monayuser.databinding.ActivityMpinSecondaryUserBinding
import com.monayuser.ui.base.BaseActivity

import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_forgot_pin.*

class MPinActivity : BaseActivity<ActivityMpinSecondaryUserBinding, MPinViewModel>(),
    MPinNavigator {

    private var cardBean: CardBean? = null
    private var userDataBean: RecentUserData? = null
    private var listType: String? = ""
    var userItem: HashMap<String, String>? = null
    val mPinViewModel: MPinViewModel = MPinViewModel()
    override val bindingVariable: Int get() = BR.secondaryMPinVM
    override val layoutId: Int get() = R.layout.activity_mpin_secondary_user
    override val viewModel: MPinViewModel get() = mPinViewModel
    var requestId: Int = 0
    var parentId: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@MPinActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)
        mPinViewModel.navigator = this
        mPinViewModel.initView()
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
            parentId = intent.getIntExtra(AppConstants.PARENT_ID,0)
            viewDataBinding!!.headerTxt.text =getString(R.string.pay_money) //cardBean!!.screenFrom

            requestId = intent.getIntExtra("REQUEST_ID",0)
            /*
            if (cardBean!!.screenFrom.equals(AppConstants.SECONDARY_ACCOUNT_SCREEEN)) {
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

            }*/
        }
    }
    override fun backToPreviousScreen() {
        finish()
    }

    override fun confirmPin() {
        hideKeyboard()
        if (mPinViewModel.pinValidation(viewDataBinding!!) && checkIfInternetOn()) {
            mPinViewModel.payMoney(
                AppPreference.getInstance(this),
                cardBean!!,
                requestId!!,
                parentId
            )
        }

    }


    override fun payMoneyResponse(payMoneyResponse: SecondaryUserPayResponse) {
        userDataBean = RecentUserData()
        userDataBean!!.amount = payMoneyResponse!!.data!!.amount
        userDataBean!!.transactionId = payMoneyResponse!!.data!!.transactionId
        userDataBean!!.status = payMoneyResponse!!.data!!.status

        userDataBean!!.firstName = payMoneyResponse!!.data!!.user!!.firstName
        userDataBean!!.lastName = payMoneyResponse!!.data!!.user!!.lastName
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.SENT_MONEY)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }


    override fun forgotPin() {
        val intent = Intent(this, MobileVerificationActivity::class.java)
        intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.PAY_MONEY_SECONDARY)
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