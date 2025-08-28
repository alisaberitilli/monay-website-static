package com.monayuser.ui.autotopuppinverify

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
import com.monayuser.data.model.bean.CardBeanAutoTopUp
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.*
import com.monayuser.databinding.ActivityAutoTopupPinBinding
import com.monayuser.databinding.ActivityForgotPinBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_forgot_pin.*

class AutoTopUpMPinActivity : BaseActivity<ActivityAutoTopupPinBinding, AutoTopUpMPinViewModel>(),
    AutoTopUpMPinNavigator {

    private var cardBean: CardBeanAutoTopUp? = null
    private var userDataBean: RecentUserData? = null
    private var listType: String? = ""
    var userItem: HashMap<String, String>? = null
    val mAutoTopUpMPinViewModel: AutoTopUpMPinViewModel = AutoTopUpMPinViewModel()
    override val bindingVariable: Int get() = BR.autoTopUpPinVM
    override val layoutId: Int get() = R.layout.activity_auto_topup_pin
    override val viewModel: AutoTopUpMPinViewModel get() = mAutoTopUpMPinViewModel
    var requestId: Int = 0
    lateinit var appPreferences: AppPreference
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@AutoTopUpMPinActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)
        mAutoTopUpMPinViewModel.navigator = this
        mAutoTopUpMPinViewModel.initView()
        appPreferences = AppPreference.getInstance(this@AutoTopUpMPinActivity)
    }

    override fun init() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) {
            forgotPinview.splitWidth = 15
            forgotPinview.pinHeight = 90
            forgotPinview.pinWidth = 135
        }
        forgotPinview.showCursor(true)

        if (intent != null && intent.hasExtra(AppConstants.CARD_DATA)) {
            cardBean = intent.getParcelableExtra<CardBeanAutoTopUp>(AppConstants.CARD_DATA)
            listType = intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)
            viewDataBinding!!.headerTxt.text = cardBean!!.screenFrom

          /*  if (cardBean!!.screenFrom.equals(getString(R.string.pay_money))) {
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

    override fun onBackPressed() {
        super.onBackPressed()
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
        if (mAutoTopUpMPinViewModel.pinValidation(viewDataBinding!!) && checkIfInternetOn()) {
                mAutoTopUpMPinViewModel.callAutoTopUpApi(
                    AppPreference.getInstance(this),
                    cardBean!!,
                    requestId!!
                )
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
                    openKYCActivty(this@AutoTopUpMPinActivity)
                }else{
                    openDynamicKYCActivty(this@AutoTopUpMPinActivity)

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


    override fun payMoneyResponse(setAutoTopUpAmountResponse: SetAutoTopUpAmountResponse) {
        /*userDataBean!!.amount = payMoneyResponse!!.data!!.amount.toString()
        userDataBean!!.transactionId = payMoneyResponse!!.data!!.transactionId
        userDataBean!!.status = payMoneyResponse!!.data!!.status
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.SENT_MONEY)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)*/

        DialogUtils.showAlertDialogWithListener(this, "", setAutoTopUpAmountResponse.message,   ItemEventListener())
    }

    override fun forgotPin() {
        val intent = Intent(this, MobileVerificationActivity::class.java)
        intent.putExtra(AppConstants.SCREEN_FROM, getString(R.string.screen_auto_topup))
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
            var intent = Intent()
            setResult(RESULT_OK, intent)
            finish()
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