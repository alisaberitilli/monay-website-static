package com.monayuser.ui.secondaryuserlink

import android.Manifest
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.telephony.SubscriptionManager
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.Window
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.zxing.Result
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.CountryData
import com.monayuser.data.model.response.BasicUserProfileResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.data.model.response.ScanPrimaryUserResponse
import com.monayuser.data.model.response.SendPrimaryOtpResponse
import com.monayuser.databinding.SecondaryUserScanBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.login.adapter.CountryListAdapter
import com.monayuser.ui.otpverify.VerifyOtpActivity
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.requestmoney.RequestMoneyActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_login.*
import kotlinx.android.synthetic.main.fragment_scan.*
import me.dm7.barcodescanner.zxing.ZXingScannerView
import java.io.Serializable
import java.lang.Exception
import java.util.*
import kotlin.collections.ArrayList

class SecondaryUserScanActivity : BaseActivity<SecondaryUserScanBinding, SecondaryUserScanViewModel>(), SecondaryUserScanNavigator,
    ZXingScannerView.ResultHandler {
    var mScanViewModel: SecondaryUserScanViewModel = SecondaryUserScanViewModel()

    private val FLASH_STATE = "FLASH_STATE"
    private var mScannerView: ZXingScannerView? = null
    private var mFlash = false
    override val bindingVariable: Int
        get() = BR.secondaryScanVM
    var selectCode: String =""
    private var count: Int = 0
    private var permissionStatus = false
    var numberExists = false
    var reason = "VERSION.SDK_INT < LOLLIPOP_MR1"
    var screenFrom: String? = ""
    var userType: String? = ""
    /**
     *
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.secondary_user_scan

    override val viewModel: SecondaryUserScanViewModel
        get() = mScanViewModel
    var countryCodeList=ArrayList<CountryData>()
    private var requestStatus = false
    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = ContextCompat.getColor(this@SecondaryUserScanActivity, R.color.colorPrimary)
            val decorView = window.decorView //set status background black
            decorView.systemUiVisibility = decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
        }
        super.onCreate(savedInstanceState)
        mScanViewModel.navigator = this
        mScanViewModel.initView()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            checkPermission(
                this@SecondaryUserScanActivity,
                *CommonUtils.READ_WRITE_EXTERNAL_STORAGE_AND_CAMERA
            )
        } else {
            // openScanActivityScreen(this@NavigationActivity)
            initializeScanner()
        }
    }

    override fun init() {
        if (intent != null && intent.hasExtra(AppConstants.TARGET_HOME)) {
            requestStatus = true
        }
        if (checkIfInternetOn()) {
            mScanViewModel.countryCodeAPI(AppPreference.getInstance(this@SecondaryUserScanActivity))
        }
        else
        {
            tryAgain()
            viewDataBinding!!.countryCodeTv.text="+1"
        }
    }
    fun initializeScanner()
    {
        mScannerView = ZXingScannerView(this@SecondaryUserScanActivity)
        mScannerView!!.setBorderColor(resources.getColor(R.color.yellowish))
        viewDataBinding!!.contentFrame.addView(mScannerView)
        mScannerView!!.setLaserColor(resources.getColor(R.color.colorPrimary))
        viewDataBinding!!.topLayout.setTransitionName("passValue")
    }

    override fun countryCodeClick() {
        if(!countryCodeList.isEmpty())
        {
            showCountryList()
        }
        else
        {
            if (CommonUtils.isInternetOn(this)) {
                mScanViewModel.countryCodeAPI(AppPreference.getInstance(this))

            }
            else
            {
                viewDataBinding!!.countryCodeTv.text="+1"
            }
        }

    }


    lateinit var countryListAdapter: CountryListAdapter
    private fun showCountryList() {
        try {
            val builder = AlertDialog.Builder(this@SecondaryUserScanActivity)
            val layoutInflater = getSystemService(AppCompatActivity.LAYOUT_INFLATER_SERVICE) as LayoutInflater
            val view = layoutInflater.inflate(R.layout.dialog_state_list, null)
            val headerDialogTV = view.findViewById<TextView>(R.id.headerDialogTV)
            val filter = view.findViewById<EditText>(R.id.filter)
            val button2 = view.findViewById<ImageView>(R.id.button2)
            filter.setHint(R.string.search_country_code)
            headerDialogTV.text = getString(R.string.select_phone_code)
            val recyclerStateList: RecyclerView = view.findViewById(R.id.recyclerStateList)
            countryListAdapter = CountryListAdapter(this@SecondaryUserScanActivity, countryCodeList)
            val linearLayoutManager = LinearLayoutManager(this@SecondaryUserScanActivity)
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
    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
            mScanViewModel.countryCodeAPI(AppPreference.getInstance(this))
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@SecondaryUserScanActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }
    /**
     * This method is used to initialize variable and call a API.
     */
    override fun getCountryCodeList(countryCode: ArrayList<CountryData>) {
        countryCodeList.clear()
        countryCodeList.addAll(countryCode)
        // countryListAdapter!!.notifyDataSetChanged()
        viewDataBinding!!.countryCodeTv.setText(countryCode[0].countryCallingCode)
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@SecondaryUserScanActivity!!)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is called when click on flash icon
     */
    override fun flashClick() {
        mFlash = !mFlash
        mScannerView!!.flash = mFlash
    }

    /**
     * This method is called when click on cancel icon
     */
    override fun cancelScan() {
        finish()
    }

    override fun onBackPressed() {
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
        showProgressDialog(this, resources.getString(R.string.LOADING))
    }

    inner class ItemEventListener : ClickListener() {
        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName =
                packageName // getPackageName() from Context or Activity object
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

        override fun onsuccessEvent() {
            super.onsuccessEvent()
            AppPreference.getInstance(this@SecondaryUserScanActivity).addBoolean(PreferenceKeys.IS_LINKED, true)
            openNavigation(this@SecondaryUserScanActivity)
            finish()

        }
    }
    override fun handleResult(rawResult: Result?) {
        var id: String? = CommonUtils.getJsonValueStr("userId", CommonUtils.getJsonObject(rawResult!!.text))
        Log.d("serverscan","===="+CommonUtils.getJsonObject(rawResult!!.text))
        var uId: String? = id!!
        if (id!! != null && !id.equals("")) {
            if (checkIfInternetOn()) {
                mScanViewModel.primaryUserScan(AppPreference.getInstance(this), uId.toString())
            }
        } else {
            showValidationError(getString(R.string.code_is_invalid))
        }

        val handler = Handler()
        handler.postDelayed({ mScannerView?.resumeCameraPreview(this) }, 2000)
    }


    override fun primaryUserResponse(response: ScanPrimaryUserResponse) {
        userType =
            AppPreference.getInstance(this@SecondaryUserScanActivity).getValue(PreferenceKeys.USER_TYPE)
                .toString()
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            response.message,
            ItemEventListener()
        )
    }

    override fun onClickNext() {
        selectCode = viewDataBinding!!.countryCodeTv.text.toString()
        val mobileStr = viewDataBinding!!.etPrimaryUserMobile.text.toString()
        var userType: String = AppPreference.getInstance(this).getValue(PreferenceKeys.USER_TYPE).toString()
        if (count == 0) {
            if (mobileStr == "") {
                mScanViewModel.navigator!!.showValidationError(getStringResource(R.string.validation_mobile_number))
            } else {
                hideKeyboard()
                if (mScanViewModel.checkMobilePassword(
                        viewDataBinding!!,selectCode
                    ) && checkIfInternetOn()
                ) {
                    mScanViewModel.mobileVerifyAPI(
                        AppPreference.getInstance(this),
                        userType
                    )
                }
            }
        }
    }

    override fun sendPrimaryOtpResponse(otpResponse: SendPrimaryOtpResponse) {

        val intent = Intent(this@SecondaryUserScanActivity, VerifyOtpActivity::class.java)
        intent.putExtra("verify_status", "verify_status")
        intent.putExtra(AppConstants.SCREEN_FROM, "SecondaryUserScanActivity")
        intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
        intent.putExtra(AppConstants.EMAIL,"")
        intent.putExtra(
            AppConstants.PHONE_NUMBER,
            viewDataBinding!!.etPrimaryUserMobile.text!!.trim().toString()
        )
        startActivityForResult(intent, 201)
        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }
    override fun onResume() {
        super.onResume()
        try {
            mScannerView?.setResultHandler(this)
            // You can optionally set aspect ratio tolerance level
            // that is used in calculating the optimal Camera preview size
            mScannerView?.startCamera()
            mScannerView?.setFlash(mFlash)
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
    }

    override fun onPause() {
        super.onPause()
        mScannerView?.stopCamera()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(FLASH_STATE, mFlash)
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        Toast.makeText(this, getStringResource(R.string.allow_permission), Toast.LENGTH_SHORT)
            .show()

        moveToApplicationSetting()
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        initializeScanner()

    }

}