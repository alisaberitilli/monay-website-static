package com.monayuser.ui.transactiondetails

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.text.format.DateFormat
import android.transition.TransitionInflater
import android.view.View
import android.view.Window
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.response.GetTransactionDetailsResponse
import com.monayuser.databinding.ActivityTransactionDetailsBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import java.io.File
import java.io.FileOutputStream
import java.util.*
import android.graphics.Bitmap.CompressFormat
import android.util.Log
import java.io.FileNotFoundException
import java.io.IOException


class TransactionDetailsActivity :
    BaseActivity<ActivityTransactionDetailsBinding, TransactionDetailsViewModel>(),
    TransactionDetailsNavigator {

    private var transactionId = ""
    private var file: File? = null
    private var recentTransaction: RecentTransaction? = null
    var mTransactionDetailsViewModel: TransactionDetailsViewModel = TransactionDetailsViewModel()
    override val viewModel: TransactionDetailsViewModel get() = mTransactionDetailsViewModel
    override val bindingVariable: Int get() = BR.transactionDetailsVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_transaction_details

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@TransactionDetailsActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        if (intent != null && intent.hasExtra(AppConstants.TRANSACTION_ID)) {
            transactionId = intent.getStringExtra(AppConstants.TRANSACTION_ID)!!
        }

        if (intent != null && intent.hasExtra(AppConstants.TRANSACTION)) {
            recentTransaction =
                intent.getSerializableExtra(AppConstants.TRANSACTION) as RecentTransaction?
        }

        mTransactionDetailsViewModel.navigator = this
        mTransactionDetailsViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        onBackPressed()
    }

    var userType=""
    /**
     * This method is used to initialize an variable and call a function.
     */
    override fun init() {
        window.setSharedElementEnterTransition(TransitionInflater.from(this@TransactionDetailsActivity).inflateTransition(R.transition.transition))
        viewDataBinding!!.userIV.setTransitionName("imagePass")
        if (checkIfInternetOn()) {
            if (!transactionId.equals("")) {
                viewDataBinding!!.textUserName.text = getString(R.string.transaction_detail)
                mTransactionDetailsViewModel.callTransactionDetailsAPI(
                    AppPreference.getInstance(this), transactionId
                )
            } else {
                viewDataBinding!!.textUserName.text = getString(R.string.detail)
                setData(recentTransaction!!)
            }
        }
        userType = AppPreference.getInstance(this).getValue(PreferenceKeys.USER_TYPE).toString()


    }

    override fun clickOnShareReceipt() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            checkPermission(
                this@TransactionDetailsActivity,
                *CommonUtils.READ_WRITE_EXTERNAL_STORAGE_AND_CAMERA
            )
        } else {
            //takeScreenshot()
            takeScreenshot(getWindow().getDecorView().getRootView());
        }
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        Toast.makeText(this, getStringResource(R.string.allow_permission), Toast.LENGTH_SHORT)
            .show()
        moveToApplicationSetting()
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        //takeScreenshot()
        takeScreenshot(getWindow().getDecorView().getRootView());
    }

//    private fun takeScreenshot() {
//        viewDataBinding!!.btnShare.visibility = View.GONE
//
//        val now = Date()
//        DateFormat.format("yyyy-MM-dd_hh:mm:ss", now)
//        try {
//            val mPath: String =
//                Environment.getExternalStorageDirectory().toString().toString() + "/" + now + ".jpg"
//            // create bitmap screen capture
//            val v1 = window.decorView.rootView
//            v1.isDrawingCacheEnabled = true
//            val bitmap = Bitmap.createBitmap(v1.drawingCache)
//            v1.isDrawingCacheEnabled = false
//            val imageFile = File(mPath)
//            val outputStream = FileOutputStream(imageFile)
//            val quality = 100
//            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
//            outputStream.flush()
//            outputStream.close()
//            shareImage(imageFile)
//        } catch (e: Throwable) {
//            // Several error may come out with file handling or DOM
//            e.printStackTrace()
//        }
//    }

    protected fun takeScreenshot(view: View): File? {
        val date = Date()
        try {
            val dirpath: String
            // Initialising the directory of storage
            dirpath =
                this@TransactionDetailsActivity.getExternalFilesDir(Environment.DIRECTORY_PICTURES).toString()
            val file = File(dirpath)
            if (!file.exists()) {
                val mkdir = file.mkdir()
            }
            // File name : keeping file name unique using data time.
            val path = dirpath + "/" + date.time + ".jpeg"
            view.isDrawingCacheEnabled = true
            val bitmap = Bitmap.createBitmap(view.drawingCache)
            view.isDrawingCacheEnabled = false
            val imageurl = File(path)
            val outputStream = FileOutputStream(imageurl)
            bitmap.compress(CompressFormat.JPEG, 50, outputStream)
            outputStream.flush()
            outputStream.close()
            shareImage(imageurl)
            Log.d("Scr5eenPath", "takeScreenshot Path: $imageurl")
            return imageurl
        } catch (io: FileNotFoundException) {
            io.printStackTrace()
        } catch (e: IOException) {
            e.printStackTrace()
        }
        return null
    }


//    fun store(bm: Bitmap, fileName: String?) {
//        val dirPath =
//            Environment.getExternalStorageDirectory().absolutePath + "/Screenshots"
//        val dir = File(dirPath)
//        if (!dir.exists()) dir.mkdirs()
//        file = File(dirPath, fileName)
//        try {
//            val fOut = FileOutputStream(file)
//            bm.compress(Bitmap.CompressFormat.PNG, 85, fOut)
//            fOut.flush()
//            fOut.close()
//        } catch (e: Exception) {
//            e.printStackTrace()
//        }
//    }

    private fun shareImage(file: File) {
        var uri: Uri? = null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            uri = FileProvider.getUriForFile(
                this,
                packageName, file
            )
        } else {
            uri = Uri.fromFile(file)
        }
        val intent = Intent()
        intent.action = Intent.ACTION_SEND
        intent.type = "image/*"
        intent.putExtra(Intent.EXTRA_SUBJECT, "")
        intent.putExtra(Intent.EXTRA_TEXT, "")
        intent.putExtra(Intent.EXTRA_STREAM, uri)
        try {
            startActivity(Intent.createChooser(intent, "Share Screenshot"))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "No App Available", Toast.LENGTH_SHORT).show()
        }

        viewDataBinding!!.btnShare.visibility = View.VISIBLE
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
        showProgressDialog(this@TransactionDetailsActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@TransactionDetailsActivity,
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
        DialogUtils.sessionExpireDialog(this@TransactionDetailsActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getTransactionDetailsResponse(getTransactionDetailsResponse: GetTransactionDetailsResponse) {
        setData(getTransactionDetailsResponse.data!!)
    }

    fun setData(recentTransaction: RecentTransaction?) {
        if (recentTransaction!!.actionType.equals("deposit", true)) {
            depositCondition(recentTransaction)
        } else if (recentTransaction!!.actionType.equals(
                "withdraw",
                true
            ) || recentTransaction!!.actionType.equals("withdrawal", true)
        ) {
            withdrawalCondition(recentTransaction)
        } else {
            otherOrElseCondition(recentTransaction)
        }

        viewDataBinding!!.tvTime.text = CommonUtils.getDateInFormatUTC(
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd MMM YYYY, hh:mm a", recentTransaction!!.createdAt
        )

        if (recentTransaction!!.status.equals("failed", true) || recentTransaction!!.status.equals("pending", true)) {
            viewDataBinding!!.tvPaidText.text =
                recentTransaction!!.status.capitalize()

            if (recentTransaction!!.amount.contains(".")) {
                viewDataBinding!!.tvPaidAmount.text =
                    "${recentTransaction!!.status.capitalize()} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                        "%.2f",
                        recentTransaction!!.amount.toFloat()
                    )}"
            } else {
                viewDataBinding!!.tvPaidAmount.text =
                    "${recentTransaction!!.status.capitalize()} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                        "%,d",
                        recentTransaction!!.amount.toLong()
                    )}"
            }
        } else if (recentTransaction!!.status.equals("declined", true)) {
            viewDataBinding!!.tvPaidText.text =
                recentTransaction!!.status.capitalize()

            if (recentTransaction!!.amount.contains(".")) {
                viewDataBinding!!.tvPaidAmount.text =
                    "${recentTransaction!!.status.capitalize()} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                        "%.2f",
                        recentTransaction!!.amount.toFloat()
                    )}"
            } else {
                viewDataBinding!!.tvPaidAmount.text =
                    "${recentTransaction!!.status.capitalize()} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                        "%,d",
                        recentTransaction!!.amount.toLong()
                    )}"
            }

            viewDataBinding!!.tvMessageText.text = getString(R.string.decline_reason)

            viewDataBinding!!.tvTime.text = CommonUtils.getDateInFormatUTC(
                "yyyy-MM-dd'T'HH:mm:ss",
                "dd MMM YYYY, hh:mm a", recentTransaction!!.updatedAt
            )
        }

        if (recentTransaction!!.amount.contains(".")) {
            viewDataBinding!!.tvTotal.text =
                "${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                    "%.2f",
                    recentTransaction!!.amount.toFloat()
                )}"
        } else {
            viewDataBinding!!.tvTotal.text =
                "${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format("%,d", recentTransaction!!.amount.toLong())}"
        }

        setMessageTransactionData(recentTransaction)

        setPaymentData(recentTransaction)
    }

    private fun setMessageTransactionData(recentTransaction: RecentTransaction) {
        if (recentTransaction!!.message != null && !recentTransaction!!.message.equals("") && !recentTransaction!!.status.equals("declined", true))
            viewDataBinding!!.tvMessage.text = recentTransaction!!.message
        else if (recentTransaction!!.declineReason != null && !recentTransaction!!.declineReason.equals(""))
            viewDataBinding!!.tvMessage.text = recentTransaction!!.declineReason
        else
            viewDataBinding!!.tvMessage.text = "-"

        if (recentTransaction!!.transactionId != null) {
            viewDataBinding!!.tvTransactionId.text =
                recentTransaction!!.transactionId!!
        } else {
            viewDataBinding!!.tvTransactionId.text = "-"
        }
    }

    private fun setPaymentData(recentTransaction: RecentTransaction) {
        if (recentTransaction!!.paymentMethod != null) {
            if (userType==AppConstants.SECONDARY_SIGNUP)
            {
                viewDataBinding!!.tvPayment.text =recentTransaction.toUser!!.firstName+" "+recentTransaction.toUser!!.lastName+" Wallet"
            }
            else{
                if (recentTransaction!!.paymentMethod.equals("card", true)) {
                    viewDataBinding!!.tvPayment.text =
                        "${recentTransaction!!.paymentMethod!!.capitalize()}, ending ${recentTransaction!!.last4Digit}"
                } else if (recentTransaction!!.paymentMethod.equals("account", true)) {
                    viewDataBinding!!.tvPayment.text =
                        "${recentTransaction!!.paymentMethod!!.capitalize()}, from ${recentTransaction!!.bankName}"
                } else {
                    viewDataBinding!!.tvPayment.text =
                        "${recentTransaction!!.paymentMethod!!.capitalize()}"
                }
            }

        } else {
            viewDataBinding!!.tvPayment.text = "-"
        }
    }

    private fun otherOrElseCondition(recentTransaction: RecentTransaction) {
        if (recentTransaction!!.toUser != null && (recentTransaction!!.toUser!!.id != AppPreference.getInstance(this)
                .getSavedUser(AppPreference.getInstance(this)).id)
        ) {
            if (recentTransaction!!.toUser!!.profilePictureUrl != null && !recentTransaction!!.toUser!!.profilePictureUrl.equals(
                    ""
                )
            ) {
                CommonUtils.showProfile(
                    this,
                    recentTransaction!!.toUser!!.profilePictureUrl,
                    viewDataBinding!!.userIV
                )
            }
            viewDataBinding!!.tvName.text =
                "${recentTransaction!!.toUser!!.firstName} ${recentTransaction!!.toUser!!.lastName}"


            viewDataBinding!!.tvPaidText.text = getString(R.string.paid_to)
            if (recentTransaction!!.amount.contains(".")) {
                viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.transfer)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                    "%.2f",
                    recentTransaction!!.amount.toFloat()
                )}"
            } else {
                viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.transfer)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                    "%,d",
                    recentTransaction!!.amount.toLong()
                )}"
            }
        } else {
            if (recentTransaction!!.fromUser!!.profilePictureUrl != null && !recentTransaction!!.fromUser!!.profilePictureUrl.equals(
                    ""
                )
            ) {
                CommonUtils.showProfile(
                    this,
                    recentTransaction!!.fromUser!!.profilePictureUrl,
                    viewDataBinding!!.userIV
                )
            }
            viewDataBinding!!.tvName.text =
                "${recentTransaction!!.fromUser!!.firstName} ${recentTransaction!!.fromUser!!.lastName}"


            viewDataBinding!!.tvPaidText.text = getString(R.string.added)
            if (recentTransaction!!.amount.contains(".")) {
                viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.added)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                    "%.2f",
                    recentTransaction!!.amount.toFloat()
                )}"
            } else {
                viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.added)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                    "%,d",
                    recentTransaction!!.amount.toLong()
                )}"
            }
        }
    }

    private fun withdrawalCondition(recentTransaction: RecentTransaction) {
        if (recentTransaction!!.fromUser!!.profilePictureUrl != null && !recentTransaction!!.fromUser!!.profilePictureUrl.equals(
                ""
            )
        ) {
            CommonUtils.showProfile(
                this,
                recentTransaction!!.fromUser!!.profilePictureUrl,
                viewDataBinding!!.userIV
            )
        }
        viewDataBinding!!.tvName.text =
            "${recentTransaction!!.fromUser!!.firstName} ${recentTransaction!!.fromUser!!.lastName}"

        viewDataBinding!!.tvPaidText.text = getString(R.string.withdrawal)
        if (recentTransaction!!.amount.contains(".")) {
            viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.withdrawal)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                "%.2f",
                recentTransaction!!.amount.toFloat()
            )}"
        } else {
            viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.withdrawal)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                "%,d",
                recentTransaction!!.amount.toLong()
            )}"
        }
    }

    private fun depositCondition(recentTransaction: RecentTransaction) {
        if (recentTransaction!!.toUser!!.profilePictureUrl != null && !recentTransaction!!.toUser!!.profilePictureUrl.equals(
                ""
            )
        ) {
            CommonUtils.showProfile(
                this,
                recentTransaction!!.toUser!!.profilePictureUrl,
                viewDataBinding!!.userIV
            )
        }
        viewDataBinding!!.tvName.text =
            "${recentTransaction!!.toUser!!.firstName} ${recentTransaction!!.toUser!!.lastName}"

        viewDataBinding!!.tvPaidText.text = getString(R.string.added)
        if (recentTransaction!!.amount.contains(".")) {
            viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.added)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                "%.2f",
                recentTransaction!!.amount.toFloat()
            )}"
        } else {
            viewDataBinding!!.tvPaidAmount.text = "${getString(R.string.added)} ${AppPreference.getInstance(this@TransactionDetailsActivity).getSavedUser(AppPreference.getInstance(this@TransactionDetailsActivity)).Country!!.currencyCode} ${String.format(
                "%,d",
                recentTransaction!!.amount.toLong()
            )}"
        }
    }
}