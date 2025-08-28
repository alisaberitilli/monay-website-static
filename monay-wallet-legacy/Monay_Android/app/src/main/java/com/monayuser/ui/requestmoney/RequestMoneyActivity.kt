package com.monayuser.ui.requestmoney

import android.app.Dialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.InputFilter
import android.text.TextWatcher
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.SendPaymentRequestResponse
import com.monayuser.databinding.ActivityRequestMoneyBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.successaddmoney.AddSentMoneyActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils

class RequestMoneyActivity : BaseActivity<ActivityRequestMoneyBinding, RequestMoneyViewModel>(),
    RequestMoneyNavigator {

    var mRequestMoneyViewModel: RequestMoneyViewModel = RequestMoneyViewModel()
    override val viewModel: RequestMoneyViewModel get() = mRequestMoneyViewModel
    override val bindingVariable: Int get() = BR.requestMoneyVM
    var listType: String? = ""
    var userDataBean: RecentUserData? = null
    var userItem: HashMap<String, String>? = null
    var uId: String? = ""
    var profilePic: String? = ""
    var fullName: String? = ""
    lateinit var appPreferences: AppPreference
    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_request_money

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@RequestMoneyActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mRequestMoneyViewModel.navigator = this
        mRequestMoneyViewModel.initView()
        appPreferences = AppPreference.getInstance(this@RequestMoneyActivity)
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to initialize an variable and call a API.
     */
    override fun init() {
        viewDataBinding!!.tvCurrency.text = AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).Country!!.currencyCode

        if (intent != null) {
            if (intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)
                    .equals(AppConstants.RECENT_CONTACT)
            ) {
                userDataBean =
                    intent.getSerializableExtra(AppConstants.CONTACT_USER_DATA) as? RecentUserData
                listType = intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)!!
                uId = userDataBean!!.id.toString()
            } else {
                userItem =
                    intent.extras!!.get(AppConstants.CONTACT_USER_DATA) as HashMap<String, String>?
                uId = ""
                listType = intent.getStringExtra(AppConstants.CONTACT_LIST_TYPE)!!
            }
        }

        amountValidationMethod()

        setUserData()
    }

    private fun amountValidationMethod() {
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
                    fArray[0] = InputFilter.LengthFilter(maxLength)
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
                    fArray[0] = InputFilter.LengthFilter(maxLength)
                    viewDataBinding!!.amountEt.setFilters(fArray)
                }
            }
        })
    }

    private fun setUserData() {
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
            viewDataBinding!!.tvMobile.text = userItem!!.get("contact")
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
            viewDataBinding!!.tvMobile.text =
                "${userDataBean!!.phoneNumberCountryCode} ${userDataBean!!.phoneNumber}"
            fullName = "${userDataBean!!.firstName} ${userDataBean!!.lastName}"

        }
    }

    override fun successToSentMoney() {
        if (mRequestMoneyViewModel.checkAmountMessage(viewDataBinding!!) && checkIfInternetOn()) {
            mRequestMoneyViewModel.sendPaymentRequestApi(
                AppPreference.getInstance(this),
                userDataBean!!.id.toString()
            )
        }
    }

    override fun sendPaymentRequestResponse(sendPaymentRequestResponse: SendPaymentRequestResponse) {
        val intent = Intent(this, AddSentMoneyActivity::class.java)
        intent.putExtra(AppConstants.TARGET_SUCCESS, AppConstants.REQUEST_MONEY)
        intent.putExtra(AppConstants.USER_DATA, userDataBean)
        intent.putExtra("Amount", viewDataBinding!!.amountEt.text.toString().trim())
        startActivity(intent)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        finishAffinity()
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
        showProgressDialog(this@RequestMoneyActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@RequestMoneyActivity,
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
        DialogUtils.sessionExpireDialog(this@RequestMoneyActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
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
                //openKYCActivty(this)
                if(appPreferences.getSavedUser(appPreferences).phoneNumberCountryCode.equals("+1")){
                    openKYCActivty(this@RequestMoneyActivity)
                }else{
                    openDynamicKYCActivty(this@RequestMoneyActivity)
                }
            }

            ivCross.setOnClickListener {
                dialog.dismiss()
            }

            dialog.show()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
