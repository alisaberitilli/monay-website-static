package com.monayuser.ui.scan

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.view.View
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.zxing.Result
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.response.BasicUserProfileResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.databinding.FragmentScanBinding
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.mycontact.NoContactFoundListener
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.scan.adapter.RecentContactAdapter
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.fragment_scan.*
import me.dm7.barcodescanner.zxing.ZXingScannerView
import java.util.*

/**
 * A simple [Fragment] subclass.
 */
class ScanFragment : BaseFragment<FragmentScanBinding, ScanViewModel>(), ScanNavigator,
    NoContactFoundListener, ZXingScannerView.ResultHandler {

    private var list: ArrayList<HashMap<String, String>> = ArrayList()
    var mScanViewModel: ScanViewModel = ScanViewModel()
    private var noContactFoundListener: NoContactFoundListener? = null
    private val FLASH_STATE = "FLASH_STATE"
    private var mScannerView: ZXingScannerView? = null
    private var mFlash = false
    override val bindingVariable: Int
        get() = BR.scanVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.fragment_scan

    override val viewModel: ScanViewModel
        get() = mScanViewModel

    /**
     * This method is main method of class
     */
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mScanViewModel.navigator = this
        noContactFoundListener = this
        mScanViewModel.initView()

        mScannerView = ZXingScannerView(activity)
        mScannerView!!.setBorderColor(R.color.white_gray_color)
        content_frame.addView(mScannerView)
    }

    override fun tryAgain() {
        // This method is called when click on try again button
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            activity!!,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is used to initialize variable and call a API.
     */
    override fun init() {
        initializeAdapter()
    }

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        recyclerRecentContact.layoutManager = LinearLayoutManager(activity)
        recyclerRecentContact.layoutManager =
            LinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)
        recyclerRecentContact.adapter = this.let {
            RecentContactAdapter(
                activity!!,
                list
            )
        }
        noContactFoundListener?.let {
            (recyclerRecentContact.adapter as RecentContactAdapter).noContactView(
                it
            )
        }
        (recyclerRecentContact.adapter as RecentContactAdapter).setOnItemClickListener(object :
            RecentContactAdapter.OnItemClickListener {
            override fun onItemClicked(pos: Int) {

                var userType =  AppPreference.getInstance(activity!!).getValue(
                    PreferenceKeys.USER_TYPE)

                if(userType!!.equals(AppConstants.SECONDARY_SIGNUP)){
                    val intent = Intent(activity!!, PayMoneyActivity::class.java)
                    startActivity(intent)
                    activity!!.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                }else{
                    val intent = Intent(activity!!, PayMoneyActivity::class.java)
                    startActivity(intent)
                    activity!!.overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                }
               // openPayMoney(activity!!)

            }
        })
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(activity!!)
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
        activity!!.onBackPressed()
    }

    override fun openMyCode() {
        // This method is used to open my code class
    }

    override fun searchEditClick() {
        // This method is called when click on search icon
    }

    override fun basicUserResponse(basicUserProfileResponse: BasicUserProfileResponse) {
        // This method is used to getting basic user response
    }

    override fun recentUserListResponse(recentUserListResponse: RecentUserListResponse) {
        // This method is used to getting recent user list
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
        showProgressDialog(activity!!, resources.getString(R.string.LOADING))
    }

    inner class ItemEventListener : ClickListener() {
        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName =
                activity!!.packageName // getPackageName() from Context or Activity object
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

    override fun noContactFound(position: Int, text: String) {
        // This method is called when no user found
    }

    override fun handleResult(rawResult: Result?) {
        val handler = Handler()
        handler.postDelayed({ mScannerView?.resumeCameraPreview(this) }, 2000)
    }

    override fun onResume() {
        super.onResume()
        mScannerView?.setResultHandler(this)
        // You can optionally set aspect ratio tolerance level
        // that is used in calculating the optimal Camera preview size
        mScannerView?.startCamera()
        mScannerView?.setFlash(mFlash)
    }

    override fun onPause() {
        super.onPause()
        mScannerView?.stopCamera()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(FLASH_STATE, mFlash)
    }
}
