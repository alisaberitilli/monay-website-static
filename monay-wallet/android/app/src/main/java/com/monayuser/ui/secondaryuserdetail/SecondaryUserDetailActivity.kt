package com.monayuser.ui.secondaryuserdetail

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Window
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.response.DeleteSecondaryUserResponse
import com.monayuser.data.model.response.SecondaryUserActiveInactiveResponse
import com.monayuser.data.model.response.SecondaryUserDetailResponse
import com.monayuser.data.model.response.SetLimitAmountResponse
import com.monayuser.databinding.ActivitySecondaryUserDetailBinding
import com.monayuser.ui.addmoneyinwallet.AddMoneyActivity
import com.monayuser.ui.autotopup.AutoTopUpActivity
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mobileverification.MobileVerificationActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils


class SecondaryUserDetailActivity :
    BaseActivity<ActivitySecondaryUserDetailBinding, SecondaryUserDetailViewModel>(),
    SecondaryUserDetailNavigator {

    var mSecuritySetupViewModel: SecondaryUserDetailViewModel = SecondaryUserDetailViewModel()
    override val viewModel: SecondaryUserDetailViewModel get() = mSecuritySetupViewModel
    var switchONnOffStr: String? = null
    override val bindingVariable: Int get() = BR.secondaryUserDetailVM
    private val SECURITY_SETTING_REQUEST_CODE = 233
    var screenFrom: String? = ""
    var secondaryUserId: Int = 0
    var secondaryUserImage: String? = ""
    var secondaryUserFName: String? = ""
    var secondaryUserLName: String? = ""
    var secondaryMobileNumber: String? = ""
    var secondaryUserCountryCode: String? = ""
    var checkedUnCheckedStatus=false
    var secondaryUserWalletAmount: String? = ""
    var currencyCode=""
    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_secondary_user_detail

    lateinit var appPreference: AppPreference
    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@SecondaryUserDetailActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mSecuritySetupViewModel.navigator = this

        mSecuritySetupViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    override fun setRange() {
        var walletAmount=AppPreference.getInstance(this).getValue(PreferenceKeys.WALLET_AMOUNT)
       if (mSecuritySetupViewModel.checkLimitAmountValidation(viewDataBinding!!) && checkIfInternetOn()) {
          if (viewDataBinding!!.etLimitAmount.text.toString().toDouble()>walletAmount!!.toDouble())
             {
                        showBottomDialog()
              }
              else
               {
                   if (checkIfInternetOn())
                   {
                       mSecuritySetupViewModel.setSecondaryAccountLimitAPI(AppPreference.getInstance(this@SecondaryUserDetailActivity),secondaryUserId.toString())
                   }


               }
          }
    }



    /**
     * This method is used to initialize variable and call a API.
     */
    override fun init() {
        hideKeyboard()

        if (!isDeviceSecure()) {
            AppPreference.getInstance(this).addBoolean(
                PreferenceKeys.APP_LOCK,
                true
            )
        }
        appPreference=AppPreference.getInstance(this)
        getIntentData()
    }

    fun getIntentData()
    {
        if (intent != null) {
            screenFrom = intent.getStringExtra(AppConstants.SCREEN_FROM)
            secondaryUserId = intent.getIntExtra(AppConstants.USER_ID,0)
            secondaryMobileNumber = intent.getStringExtra(AppConstants.USER_PHONE_NUMBER)
            secondaryUserCountryCode = intent.getStringExtra(AppConstants.USER_COUNTRY_CODE)
            secondaryUserFName = intent.getStringExtra(AppConstants.USER_FIRST_NAME)
            secondaryUserLName = intent.getStringExtra(AppConstants.USER_LAST_NAME)
            secondaryUserImage = intent.getStringExtra(AppConstants.USER_IMAGE)
            secondaryUserWalletAmount=intent.getStringExtra(AppConstants.SECONDARY_USER_WALLET_AMOUNT)
        }
        currencyCode=AppPreference.getInstance(this@SecondaryUserDetailActivity).getSavedUser(appPreference).Country!!.currencyCode.toString()
       // viewDataBinding!!.textUserName.text=secondaryUserFName+" "+secondaryUserLName

        viewDataBinding!!.tvBalanceTxt.text=getStringResource(R.string.available_balance)
        viewDataBinding!!.tvSetRange.text=getStringResource(R.string.set_limit)
        viewDataBinding!!.tvName.text = secondaryUserFName+" "+secondaryUserLName
        viewDataBinding!!.tvMobile.text =secondaryUserCountryCode+" "+secondaryMobileNumber
        CommonUtils.showProfile(
            this,
            secondaryUserImage,
            viewDataBinding!!.ivUser
        )

        viewDataBinding!!.switchEnableSecondaryUser.setOnClickListener {
            if (checkedUnCheckedStatus)
            {
                if (checkIfInternetOn()) {
                    viewDataBinding!!.switchEnableSecondaryUser.isChecked=false
                    mSecuritySetupViewModel.setSecondaryUserActiveInactiveApi(AppPreference.getInstance(this@SecondaryUserDetailActivity),secondaryUserId.toString(), AppConstants.IN_ACTIVE)
                    checkedUnCheckedStatus=false
                }
                else
                {
                    viewDataBinding!!.switchEnableSecondaryUser.isChecked=true
                }
            }
            else
            {
                if (checkIfInternetOn()) {
                    viewDataBinding!!.switchEnableSecondaryUser.isChecked=true
                    mSecuritySetupViewModel.setSecondaryUserActiveInactiveApi(AppPreference.getInstance(this@SecondaryUserDetailActivity),secondaryUserId.toString(), AppConstants.ACTIVE)
                    checkedUnCheckedStatus=true
                }
                else
                {
                    viewDataBinding!!.switchEnableSecondaryUser.isChecked=false
                }

            }


        }
        if (checkIfInternetOn()) {
            mSecuritySetupViewModel.secondaryUserDetailApi(AppPreference.getInstance(this@SecondaryUserDetailActivity),secondaryUserId.toString())
        }
    }

    override fun removeSecondaryAccount() {
        DialogUtils.onDeleteDialog(
            this,
            resources.getString(R.string.dialog_alert_heading),
            resources.getString(R.string.want_to_delete_secondary_account),
            resources.getString(R.string.yes),
            resources.getString(R.string.no),
            ItemEventListener()
        )

    }

    override fun secondaryUserDetailResponse(response: SecondaryUserDetailResponse) {

        if (response.data!!.status=="active")
        {
            checkedUnCheckedStatus=true
            viewDataBinding!!.switchEnableSecondaryUser.isChecked=true
        }
        else
        {
            checkedUnCheckedStatus=false
            viewDataBinding!!.switchEnableSecondaryUser.isChecked=false
        }
        //viewDataBinding!!.tvAvailableAmount.text=currencyCode+" "+response.data.limit
        if (response.data.remainAmount.toString().contains(".")) {
            viewDataBinding!!.tvAvailableAmount.text =
                "${AppPreference.getInstance(this@SecondaryUserDetailActivity).getSavedUser(AppPreference.getInstance(this@SecondaryUserDetailActivity)).Country!!.currencyCode} ${String.format("%.2f", response.data.remainAmount)}"
        } else {
            viewDataBinding!!.tvAvailableAmount.text =
                "${AppPreference.getInstance(this@SecondaryUserDetailActivity).getSavedUser(AppPreference.getInstance(this@SecondaryUserDetailActivity)).Country!!.currencyCode} ${String.format("%,d", response.data.remainAmount)}"
        }
    }


    override fun removeSecondaryAccountResponse(response: DeleteSecondaryUserResponse) {

        var intent = Intent()
        setResult(RESULT_OK, intent)
        finish()


    }

    override fun secondaryUserActiveInactiveResponse(response: SecondaryUserActiveInactiveResponse) {

        DialogUtils.showAlertDialog(
            this@SecondaryUserDetailActivity,
            "",
            getStringResource(R.string.status_update)
        )
    }

    override fun setSecondaryAccountLimitResponse(response: SetLimitAmountResponse) {
        viewDataBinding!!.etLimitAmount.text!!.clear()
        DialogUtils.dialogWithEvent(
            this@SecondaryUserDetailActivity,
            "",
            response.message,
            ItemEventListener()
        )
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
        showProgressDialog(this@SecondaryUserDetailActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SecondaryUserDetailActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            // This function is called when click on OK button
            init()
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
            if (checkIfInternetOn()) {
                mSecuritySetupViewModel.removeSecondaryAccountAPI(AppPreference.getInstance(this@SecondaryUserDetailActivity),secondaryUserId.toString())
            }
        }
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@SecondaryUserDetailActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == 2101) {
            if (resultCode == Activity.RESULT_OK) {
                AppPreference.getInstance(this).addBoolean(
                    PreferenceKeys.APP_LOCK,
                    false
                )
                switchFingerPrint.isChecked = !AppPreference.getInstance(this).getBoolean(PreferenceKeys.APP_LOCK)
            }
        } else if (requestCode == SECURITY_SETTING_REQUEST_CODE) {
            //When user is enabled Security settings then we don't get any kind of RESULT_OK
            //So we need to check whether device has enabled screen lock or not
            if (isDeviceSecure()) {
                //If screen lock enabled show toast and start intent to authenticate user
                Toast.makeText(
                    this,
                    resources.getString(R.string.device_is_secure),
                    Toast.LENGTH_SHORT
                ).show()

                val km =
                    getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
                if (km.isKeyguardSecure) {
                    val authIntent = km.createConfirmDeviceCredentialIntent(
                        getString(R.string.app_name),
                        getString(R.string.confirm_pattern)
                    )
                    startActivityForResult(authIntent, 2101)
                }
            } else {
                //If screen lock is not enabled just update text
                Toast.makeText(
                    this,
                    resources.getString(R.string.security_device_cancelled),
                    Toast.LENGTH_SHORT
                ).show()
            }

        }
    }

    /**
     * method to return whether device has screen lock enabled or not
     */
    private fun isDeviceSecure(): Boolean {
        val keyguardManager =
            getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

        //this method only work whose api level is greater than or equal to Jelly_Bean (16)
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN && keyguardManager.isKeyguardSecure

        //You can also use keyguardManager.isDeviceSecure(); but it requires API Level 23
    }

    fun showBottomDialog() {
        val dialog = BottomSheetDialog(this)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_enough_wallet, null)
        bottomSheet.ic_cross.setOnClickListener { dialog.dismiss() }
        bottomSheet.btn_top_up.setOnClickListener {
            dialog.dismiss()
            val intent = Intent(this, AddMoneyActivity::class.java)
            startActivity(intent)
            finish()
        }
        bottomSheet.btn_adjust_limit.setOnClickListener {
            dialog.dismiss()
        }
        dialog.setContentView(bottomSheet)
        dialog.show()
    }
}