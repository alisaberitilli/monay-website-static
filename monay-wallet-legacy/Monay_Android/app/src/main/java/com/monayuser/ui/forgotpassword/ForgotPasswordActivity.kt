package com.monayuser.ui.forgotpassword

import android.Manifest
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.Window
import android.widget.*
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.response.ForgotPasswordResponse
import com.monayuser.databinding.ActivityForgotBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.forgotcodeverify.VerifyCodeActivity
import com.monayuser.ui.login.adapter.CountryListAdapter
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_forgot.*
import java.lang.Exception
import java.util.*
import kotlin.collections.ArrayList


/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to forgot password
 */

class ForgotPasswordActivity : BaseActivity<ActivityForgotBinding, ForgotPasswordViewModel>(),
    ForgotPasswordNavigator {

    var mForgotPasswordViewModel: ForgotPasswordViewModel = ForgotPasswordViewModel()
    override val viewModel: ForgotPasswordViewModel get() = mForgotPasswordViewModel
    lateinit var appPreferences: AppPreference
    var userId: String? = ""
    var selectCode: String? = null
    var mobileStr: String? = ""
    var emailStr: String? = ""
    var count: Int = 0
    var numberExists = false
    override val bindingVariable: Int get() = BR.forgotPasswordVM
    var countryCodeList=ArrayList<CountryData>()
    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_forgot

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@ForgotPasswordActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)
        mForgotPasswordViewModel.navigator = this

        if (!AppPreference.getInstance(this).getValue(PreferenceKeys.COUNTRY_NAME_CODE).equals(""))
            viewDataBinding!!.ccp.setCountryForNameCode(
                AppPreference.getInstance(context!!).getValue(
                    PreferenceKeys.COUNTRY_NAME_CODE
                )
            )

        mForgotPasswordViewModel.initView()
        viewDataBinding!!.ccp.showNameCode(false)

        startSmsUserConsent()
    }

    private fun startSmsUserConsent() {
        try {
         SmsRetriever.getClient(this).startSmsUserConsent(null)
        }catch (e: java.lang.Exception){
            e.printStackTrace()
        }
    }

    override fun onResume() {
        mIsInForegroundMode = false
        super.onResume()
    }

    /**
     * This method is called when click on send OTP button.
     */
    override fun proceed() {
        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        mobileStr = viewDataBinding!!.mobileNumberEt.text.toString()
        emailStr = viewDataBinding!!.emailEt.text.toString()
        if (mobileStr == "") {
            if (emailStr == "") {
                var errorMessage: String =
                    resources.getString(R.string.registered_mobile_number) + "\n" + getString(
                        R.string.or_text
                    ) + "\n" + getString(
                        R.string.registered_email_address
                    )
                mForgotPasswordViewModel.navigator!!.showValidationError(errorMessage)
            } else {
                hideKeyboard()
                if (mForgotPasswordViewModel.checkEmail(viewDataBinding!!, selectCode.toString())) {
                    mForgotPasswordViewModel.forgotPassAPI(AppPreference.getInstance(this))

                }
            }
        } else {
            if (emailStr == "") {
                hideKeyboard()
                if (mForgotPasswordViewModel.checkMobile(
                        viewDataBinding!!,
                        selectCode.toString()
                    ) && checkIfInternetOn()
                ) {
                    mForgotPasswordViewModel.forgotPassAPI(AppPreference.getInstance(this))

                }
            } else {
                var errorMessage: String =
                    resources.getString(R.string.registered_mobile_number) + "\n" + getString(
                        R.string.or_text
                    ) + "\n" + getString(
                        R.string.registered_email_address
                    )
                mForgotPasswordViewModel.navigator!!.showValidationError(errorMessage)
            }
        }
    }

    override fun useEmail() {
        // This function is called when click on use email text
    }

    /**
     * This method is used to open verify screen
     */
    override fun verifyCodeScreen(forgotPasswordResponse: ForgotPasswordResponse) {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED && mobileStr != ""
        ) {
            val subscriptionManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                SubscriptionManager.from(this)
            } else {
                TODO("VERSION.SDK_INT < LOLLIPOP_MR1")
            }
                val subsInfoList = subscriptionManager.activeSubscriptionInfoList
                Log.e("Test", "Current list = $subsInfoList")
                for (subscriptionInfo in subsInfoList) {
                    val number = subscriptionInfo.number
                    if (number.contains(mobileStr!!.trim())) {
                        numberExists = true
                        Log.e("Test", " Number is  $number")
                    }
                    Log.e("Test", " Number is  $number")
                }
        }

        if (numberExists) {
            hideKeyboard()
            val intent = Intent(this@ForgotPasswordActivity, VerifyCodeActivity::class.java)
            intent.putExtra(AppConstants.EMAIL, emailStr!!.toString().trim())
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(AppConstants.PHONE_NUMBER, mobileStr!!.toString().trim())
            intent.putExtra(AppConstants.USER_ID, userId)
            intent.putExtra(AppConstants.VERIFIED_STATUS, "")
            intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.FORGOT_PASSWORD)
            intent.putExtra("numberExists", "numberExists")
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            DialogUtils.dialogWithEvent(
                this,
                resources.getString(R.string.oops),
                forgotPasswordResponse.message,
                ItemEventListener()
            )
        }
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        viewDataBinding!!.mobileNumberEt.isCursorVisible = true
        val countryCode = resources.getStringArray(R.array.CountryCode)
        if (spinnerForgot != null) {
            val adapter =
                ArrayAdapter(this@ForgotPasswordActivity, R.layout.spinner_textview, countryCode)
            spinnerForgot.adapter = adapter
        }
        spinnerForgot.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View,
                position: Int,
                id: Long
            ) {
                selectCode = countryCode[position]
                (view as TextView).setTextColor(Color.BLACK)

            }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // write code to perform some action
            }
        }

        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        viewDataBinding!!.mobileNumberEt.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(
                s: CharSequence,
                start: Int,
                count: Int,
                after: Int
            ) {
                //  This method is not used for this functionality
            }

            override fun onTextChanged(
                s: CharSequence,
                start: Int,
                before: Int,
                count: Int
            ) {
                if (viewDataBinding!!.emailEt.text.toString().length > 1) {
                    viewDataBinding!!.emailEt.setText("")
                }
            }

            override fun afterTextChanged(s: Editable) {
            //  This method is not used for this functionality
            }
        })

        viewDataBinding!!.emailEt.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(
                s: CharSequence,
                start: Int,
                count: Int,
                after: Int
            ) {
                //  This method is not used for this functionality
            }

            override fun onTextChanged(
                s: CharSequence,
                start: Int,
                before: Int,
                count: Int
            ) {
                if (viewDataBinding!!.mobileNumberEt.text.toString().length > 1) {
                    viewDataBinding!!.mobileNumberEt.setText("")
                }
            }

            override fun afterTextChanged(s: Editable) {
                //  This method is not used for this functionality
            }
        })

        if (CommonUtils.isInternetOn(this)) {
            mForgotPasswordViewModel.countryCodeAPI(AppPreference.getInstance(this), this)
        }
        else
        {
            viewDataBinding!!.countryCodeTv.text="+1"
        }
    }

    /**
     * This method is called when click on back button.
     */
    override fun backToPreviousActivity() {
        finish()
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
        showProgressDialog(this@ForgotPasswordActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@ForgotPasswordActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            hideKeyboard()
            val intent = Intent(this@ForgotPasswordActivity, VerifyCodeActivity::class.java)
            intent.putExtra(AppConstants.EMAIL, emailStr!!.toString().trim())
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(AppConstants.PHONE_NUMBER, mobileStr!!.toString().trim())
            intent.putExtra(AppConstants.USER_ID, userId)
            intent.putExtra(AppConstants.VERIFIED_STATUS, "")
            intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.FORGOT_PASSWORD)
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
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
        DialogUtils.sessionExpireDialog(this@ForgotPasswordActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun countryCodeClick() {
        if(!countryCodeList.isEmpty())
        {
            showCountryList()
        }
        else
        {
            if (CommonUtils.isInternetOn(this)) {
                mForgotPasswordViewModel.countryCodeAPI(AppPreference.getInstance(this), this)

            }
            else
            {
                viewDataBinding!!.countryCodeTv.text="+1"
            }
        }
    }

    override fun getCountryCodeList(countryCode: ArrayList<CountryData>) {
        countryCodeList.clear()
        countryCodeList.addAll(countryCode)
        // countryListAdapter!!.notifyDataSetChanged()
        viewDataBinding!!.countryCodeTv.setText(countryCode[0].countryCallingCode)
    }

    lateinit var countryListAdapter: CountryListAdapter
    private fun showCountryList() {
        try {
            val builder = AlertDialog.Builder(this@ForgotPasswordActivity)
            val layoutInflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
            val view = layoutInflater.inflate(R.layout.dialog_state_list, null)
            val headerDialogTV = view.findViewById<TextView>(R.id.headerDialogTV)
            val filter = view.findViewById<EditText>(R.id.filter)
            val button2 = view.findViewById<ImageView>(R.id.button2)
            filter.setHint(R.string.search_country_code)
            headerDialogTV.text = getString(R.string.select_phone_code)
            val recyclerStateList: RecyclerView = view.findViewById(R.id.recyclerStateList)
            countryListAdapter = CountryListAdapter(this@ForgotPasswordActivity, countryCodeList)
            val linearLayoutManager = LinearLayoutManager(this@ForgotPasswordActivity)
            recyclerStateList.layoutManager = linearLayoutManager
            recyclerStateList.adapter = countryListAdapter
            builder.setView(view)
            val alert = builder.create()
            alert.show()
            countryListAdapter.setOnItemClickListener(object : CountryListAdapter.OnItemClickListener{
                override fun onItemClicked(view: View, countryCode: CountryData) {
                    viewDataBinding!!.countryCodeTv.setText(countryCode.countryCallingCode)
                    alert.dismiss()
                }
            })

            filter.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    s: CharSequence,
                    start: Int,
                    count: Int,
                    after: Int
                ) {
                }
                override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {}

                override fun afterTextChanged(s: Editable) {
                    countryListAdapter.updateList(filterCategory(s!!.toString().toLowerCase(Locale.getDefault()),countryCodeList))
                }
            })
            button2.setOnClickListener { alert.dismiss() }
        } catch (ex: Exception) {
            ex.printStackTrace()
        }
    }

    fun filterCategory(text: String,countryModelArrayList: List<CountryData>): ArrayList<CountryData> {
        val temp: ArrayList<CountryData> = ArrayList()
        for (countryModel in countryModelArrayList) {
//            if (countryModel.name!!.toLowerCase(Locale.getDefault()).contains(text!!)) {
//                temp.add(countryModel)
//            } else if (countryModel.phonecode!!.contains(text!!)) {
//                temp.add(countryModel)
//            }
        }
        return temp
    }
}