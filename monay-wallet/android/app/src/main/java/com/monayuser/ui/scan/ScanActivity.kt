package com.monayuser.ui.scan

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.view.View
import android.view.Window
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.zxing.Result
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.BasicUserProfileResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.databinding.ActivityScanBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mycontact.NoContactFoundListener
import com.monayuser.ui.mycontact.UpdatedContactActivity
import com.monayuser.ui.mycontact.adapter.MyRecentContactAdapter
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.paymoneyfromprimarywallet.PayMoneyFromPrimaryActivity
import com.monayuser.ui.requestmoney.RequestMoneyActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import com.journeyapps.barcodescanner.CompoundBarcodeView
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.google.zxing.ResultPoint
import java.io.Serializable
import java.util.*

class ScanActivity : BaseActivity<ActivityScanBinding, ScanViewModel>(),
    ScanNavigator, NoContactFoundListener, BarcodeCallback {

    var mScanViewModel: ScanViewModel = ScanViewModel()
    private var noContactFoundListener: NoContactFoundListener? = null
    private val FLASH_STATE = "FLASH_STATE"
    private var requestStatus = false
    private var recentContactList: ArrayList<RecentUserData> = ArrayList()
    private var mScannerView: CompoundBarcodeView? = null
    private var mFlash = false
    private var name = ""

    override val bindingVariable: Int
        get() = BR.scanVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.activity_scan

    override val viewModel: ScanViewModel
        get() = mScanViewModel

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@ScanActivity, R.color.colorPrimary)
            val decorView = window.decorView //set status background black
            decorView.systemUiVisibility =
                decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
        }
        super.onCreate(savedInstanceState)
        mScanViewModel.navigator = this
        noContactFoundListener = this
        mScanViewModel.initView()
        mScannerView = CompoundBarcodeView(this@ScanActivity)
        // TODO: Configure CompoundBarcodeView appearance if needed
        // mScannerView!!.viewFinder.setBorderColor(resources.getColor(R.color.yellowish))
        viewDataBinding!!.contentFrame.addView(mScannerView)
        // mScannerView!!.setLaserColor(resources.getColor(R.color.colorPrimary))
        viewDataBinding!!.topLayout.setTransitionName("passValue")
    }

    override fun init() {
        initializeAdapter()
        if (intent != null && intent.hasExtra(AppConstants.TARGET_HOME)) {
            requestStatus = true
        }
        if (checkIfInternetOn()) {
            mScanViewModel.recentUserListAPi(AppPreference.getInstance(this), name, "0", "20")
        } else {
            tryAgain()
        }

        val userType = AppPreference.getInstance(this@ScanActivity).getValue(PreferenceKeys.USER_TYPE)

        if(userType.equals(AppConstants.SECONDARY_SIGNUP)){
            viewDataBinding!!.btnShowMyQr.visibility = View.GONE
        }

    }

    /**
     * This method is called when click on flash icon
     */
    override fun flashClick() {
        mFlash = !mFlash
        if (mFlash) mScannerView!!.setTorchOn() else mScannerView!!.setTorchOff()
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
     * This method is used to open my code class
     */
    override fun openMyCode() {
        openMyCodeActivity(this@ScanActivity)
    }

    override fun searchEditClick() {
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
//            checkPermission(
//                this@ScanActivity,
//                *CommonUtils.CONTACTS_READS_AND_WRITE_PERMISSION
//            )
//        } else {
//            val intent = Intent(this@ScanActivity, NewContactsActivity::class.java)
            val intent = Intent(this@ScanActivity, UpdatedContactActivity::class.java)
            startActivity(intent)
            finish()
//        }
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        val intent = Intent(this@ScanActivity, UpdatedContactActivity::class.java)
        startActivity(intent)
        finish()
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        val intent = Intent(this@ScanActivity, UpdatedContactActivity::class.java)
        startActivity(intent)
        finish()
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE
            mScanViewModel.recentUserListAPi(AppPreference.getInstance(this), name, "0", "20")
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
        showProgressDialog(this@ScanActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@ScanActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        viewDataBinding!!.recyclerRecentContact.layoutManager =
            LinearLayoutManager(this@ScanActivity)
        viewDataBinding!!.recyclerRecentContact.layoutManager =
            LinearLayoutManager(this@ScanActivity, LinearLayoutManager.HORIZONTAL, false)
        viewDataBinding!!.recyclerRecentContact.adapter = this.let {
            MyRecentContactAdapter(
                it,
                recentContactList
            )
        }
        (viewDataBinding!!.recyclerRecentContact.adapter as MyRecentContactAdapter).setOnItemClickListener(
            object :
                MyRecentContactAdapter.OnItemClickListener {
                override fun onItemClicked(items: RecentUserData) {
                    if (requestStatus) {
                        val intent = Intent(this@ScanActivity, RequestMoneyActivity::class.java)
                        intent.putExtra(AppConstants.CONTACT_USER_DATA, items as Serializable?)
                        intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                        startActivity(intent)
                        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                    } else {

                        var userType =  AppPreference.getInstance(this@ScanActivity).getValue(
                            PreferenceKeys.USER_TYPE)

                        if(userType!!.equals(AppConstants.SECONDARY_SIGNUP)){
                            val intent = Intent(this@ScanActivity, PayMoneyFromPrimaryActivity::class.java)
                            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                            intent.putExtra(AppConstants.CONTACT_USER_DATA, items as Serializable?)
                            startActivity(intent)
                            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                        }else{
                            val intent = Intent(this@ScanActivity, PayMoneyActivity::class.java)
                            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                            intent.putExtra(AppConstants.CONTACT_USER_DATA, items as Serializable?)
                            startActivity(intent)
                            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                        }

                    }
                }
            })
    }

    override fun recentUserListResponse(recentUserListResponse: RecentUserListResponse) {
        try {
            if (recentUserListResponse.data!!.rows.isNotEmpty()) {
                viewDataBinding!!.noRecentContact.visibility = View.GONE
                viewDataBinding!!.recyclerRecentContact.visibility = View.VISIBLE
                recentContactList!!.addAll(recentUserListResponse.data!!.rows)
                viewDataBinding!!.recyclerRecentContact.adapter!!.notifyDataSetChanged()
            } else {
                viewDataBinding!!.noRecentContact.visibility = View.VISIBLE
                viewDataBinding!!.recyclerRecentContact.visibility = View.GONE
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@ScanActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun noContactFound(position: Int, text: String) {
        // This method is called when no contact found from server side
    }

    override fun barcodeResult(result: BarcodeResult) {
        var id: String? =
            CommonUtils.getJsonValueStr("userId", CommonUtils.getJsonObject(result.text))
        var uId: String? = id!!

        if (id!! != null && !id.equals("")) {
            if (checkIfInternetOn()) {
                mScanViewModel.basicUserProfile(AppPreference.getInstance(this), uId.toString())
            }
        } else {
            showValidationError(getString(R.string.code_is_invalid))
        }

        val handler = Handler()
        handler.postDelayed({ mScannerView?.resume() }, 2000)
    }
    
    override fun possibleResultPoints(resultPoints: List<ResultPoint>) {
        // Handle possible result points if needed
    }

    override fun basicUserResponse(basicUserProfileResponse: BasicUserProfileResponse) {
        if (requestStatus) {
            val intent =
                Intent(this@ScanActivity, RequestMoneyActivity::class.java)
            intent.putExtra(
                AppConstants.CONTACT_USER_DATA,
                basicUserProfileResponse.data as Serializable?
            )
            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
            startActivity(intent)
            finish()
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {

            var userType =  AppPreference.getInstance(this@ScanActivity).getValue(
                PreferenceKeys.USER_TYPE)

            if(userType!!.equals(AppConstants.SECONDARY_SIGNUP)){

                val intent = Intent(this@ScanActivity, PayMoneyFromPrimaryActivity::class.java)
                intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                intent.putExtra(
                    AppConstants.CONTACT_USER_DATA,
                    basicUserProfileResponse.data as Serializable?
                )
                startActivity(intent)
                finish()
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)

            }else{

                val intent = Intent(this@ScanActivity, PayMoneyActivity::class.java)
                intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                intent.putExtra(
                    AppConstants.CONTACT_USER_DATA,
                    basicUserProfileResponse.data as Serializable?
                )
                startActivity(intent)
                finish()
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)

            }

        }
    }

    inner class ItemEventListener : ClickListener() {
        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName =
                this@ScanActivity.packageName // getPackageName() from Context or Activity object
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

    override fun onResume() {
        super.onResume()
        try {
            mScannerView?.decodeContinuous(this)
            // You can optionally set aspect ratio tolerance level
            // that is used in calculating the optimal Camera preview size
            mScannerView?.resume()
            if (mFlash) mScannerView?.setTorchOn() else mScannerView?.setTorchOff()
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
    }

    override fun onPause() {
        super.onPause()
        mScannerView?.pause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(FLASH_STATE, mFlash)
    }
}