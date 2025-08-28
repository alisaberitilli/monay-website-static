package com.monayuser.ui.kyc

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.net.http.SslError
import android.os.AsyncTask
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Environment.getExternalStoragePublicDirectory
import android.provider.DocumentsContract
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Button
import android.widget.RadioButton
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.net.toUri
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.google.gson.Gson
import com.iceteck.silicompressorr.SiliCompressor
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.bean.UserKyc
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.data.model.response.KYCResponse
import com.monayuser.data.model.response.MediaResponse
import com.monayuser.databinding.ActivityKycBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.*
import com.monayuser.utils.FilePath.isExternalStorageDocument
// TODO: Replace with UCrop when implementing image cropping
// import com.yalantis.ucrop.UCrop
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.lang.ref.WeakReference
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList


class KYCActivity : BaseActivity<ActivityKycBinding, KYCViewModel>(),
    KYCNavigator {

    private var mImageUri: Uri? = null
    private var imageFilePath: String? = null
    private var imageFilePathForDoc: String? = null
    private var newImageFilePath: String? = null
    private var imageStatus = false
    private var documentPath: String? = null
    private var documentPathNew: String? = null
    private var identificationField = ""
    private var addressField = ""
    private var applicationPDF = "application/pdf"
    private var userKYC = "user-kyc"

    var imageSelect=false
    var docType=""
    var docSelect=false
    var mKYCViewModel: KYCViewModel =
        KYCViewModel()
    override val viewModel: KYCViewModel get() = mKYCViewModel
    override val bindingVariable: Int get() = BR.kycVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_kyc

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@KYCActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mKYCViewModel.navigator = this
        mKYCViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun clickOnBackButton() {
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
        showProgressDialog(this@KYCActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    override fun tryAgain() {
        // This method is called when click on try button
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        Toast.makeText(this, getStringResource(R.string.allow_permission), Toast.LENGTH_SHORT)
            .show()
        moveToApplicationSetting()
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        if (checkIfInternetOn()) {
            showPickImageDialog()
        }
    }

    /**
     * This method is used to open gallery & camera popup.
     */
    override fun clickOnImageUpload() {
        docType="IDProof"
        val radioButtonID: Int = viewDataBinding!!.rgDocument.getCheckedRadioButtonId()

        if (radioButtonID >= 0) {
            val radioButton: View = viewDataBinding!!.rgDocument.findViewById(radioButtonID)
            val idx: Int = viewDataBinding!!.rgDocument.indexOfChild(radioButton)

            val r: RadioButton = viewDataBinding!!.rgDocument.getChildAt(idx) as RadioButton
            identificationField = r.getText().toString()
        }

        if (identificationField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_identification))
        } else {
            imageFilePath = ""
            imageStatus = true
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                checkPermission(
                    this,
                    *CommonUtils.READ_WRITE_EXTERNAL_STORAGE_AND_CAMERA
                )
            } else {
                if (checkIfInternetOn()) {
                    showPickImageDialog()
                }
            }
        }
    }

    override fun clickOnDocumentUpload() {
        docType="AddressProof"
        val radioButtonID1: Int = viewDataBinding!!.rgProof.getCheckedRadioButtonId()
        if (radioButtonID1 >= 0) {
            val radioButton1: View = viewDataBinding!!.rgProof.findViewById(radioButtonID1)
            val idx1: Int = viewDataBinding!!.rgProof.indexOfChild(radioButton1)

            val r1: RadioButton = viewDataBinding!!.rgProof.getChildAt(idx1) as RadioButton
            addressField = r1.getText().toString()
        }

        if (addressField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_address_proof))
        } else {
            documentPath = ""
            imageStatus = false
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                checkPermission(
                    this,
                    *CommonUtils.READ_WRITE_EXTERNAL_STORAGE_AND_CAMERA
                )
            } else {
                if (checkIfInternetOn()) {
                    showPickImageDialog()
                }
            }
        }
    }

    override fun clickOnDeleteImage() {
        imageFilePath = ""
        imageFilePathForDoc = ""

        viewDataBinding!!.ivIdentification.visibility = View.GONE
        viewDataBinding!!.ivDelete.visibility = View.GONE
        viewDataBinding!!.wvIdentification.visibility = View.GONE
        viewDataBinding!!.ivUploadImageNew.visibility = View.GONE
        viewDataBinding!!.tvUploadImageNew.visibility = View.GONE
        viewDataBinding!!.groupImage.visibility = View.VISIBLE
        viewDataBinding!!.cvImage.visibility = View.INVISIBLE
    }

    override fun clickOnDeleteDoc() {
        documentPath = ""
        documentPathNew = ""

        viewDataBinding!!.ivDocument.visibility = View.GONE
        viewDataBinding!!.wvDocument.visibility = View.GONE
        viewDataBinding!!.ivUploadDocNew.visibility = View.GONE
        viewDataBinding!!.tvUploadDocNew.visibility = View.GONE
        viewDataBinding!!.ivDeleteDoc.visibility = View.GONE
        viewDataBinding!!.groupDoc.visibility = View.VISIBLE
        viewDataBinding!!.cvDoc.visibility = View.INVISIBLE
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@KYCActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@KYCActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * The type Web view client.
     */
    inner class WebViewClient : android.webkit.WebViewClient() {

        override fun shouldOverrideUrlLoading(
            view: WebView,
            url: String
        ): Boolean {
            view.loadUrl(url)
            return true
        }

        override fun onPageFinished(
            view: WebView,
            url: String
        ) {
            // This method is called when page is finished
        }

        override fun onReceivedSslError(
            view: WebView?,
            handler: SslErrorHandler?,
            error: SslError?
        ) {
            handler!!.proceed()
        }
    }

    override fun getProfileResponse(getUserProfileResponse: GetUserProfileResponse) {
        var loginBean = getUserProfileResponse.data!!
        var appPreference = AppPreference.getInstance(this)
        var user: LoginBean = appPreference.getSavedUser(appPreference)

        loginBean.token = user.token

        val userString = Gson().toJson(loginBean)
        appPreference.addValue(PreferenceKeys.USER_DATA, userString)

        callUserData()
    }

    private fun callUserData() {
        var appPreference = AppPreference.getInstance(this)
        var user: LoginBean = appPreference.getSavedUser(appPreference)

        if (user.kycStatus.equals("uploaded", true) || user.kycStatus.equals("approved", true)) {
            viewDataBinding!!.ivDeleteDoc.visibility = View.GONE
            viewDataBinding!!.ivDelete.visibility = View.GONE
            viewDataBinding!!.btnSubmit.visibility = View.GONE
            viewDataBinding!!.groupDoc.visibility = View.GONE
            viewDataBinding!!.groupImage.visibility = View.GONE

            showIDProofData(user)
            showAddressProofData(user)

            for (i in 0 until viewDataBinding!!.rgDocument.childCount) {
                val r1: RadioButton = viewDataBinding!!.rgDocument.getChildAt(i) as RadioButton
                if (user.userKycs != null && user.userKycs!![0].idProofName.equals(
                        r1.getText().toString(), true
                    )
                ) {
                    viewDataBinding!!.rgDocument.check(r1.id)
                }
                r1.isEnabled = false
                r1.isFocusable = false
            }

            for (i in 0 until viewDataBinding!!.rgProof.childCount) {
                val r1: RadioButton = viewDataBinding!!.rgProof.getChildAt(i) as RadioButton
                if (user.userKycs != null && user.userKycs!![0].addressProofName.equals(
                        r1.getText().toString(), true
                    )
                ) {
                    viewDataBinding!!.rgProof.check(r1.id)
                }
                r1.isEnabled = false
                r1.isFocusable = false
            }
        }
    }

    private fun showAddressProofData(user: LoginBean) {
        if (user.userKycs != null && user.userKycs!![0].addressProofImageUrl.contains(".pdf")) {
            documentPathNew = user.userKycs!![0].addressProofImageUrl
            viewDataBinding!!.wvDocument.visibility = View.INVISIBLE
            viewDataBinding!!.ivUploadDocNew.visibility = View.VISIBLE
            viewDataBinding!!.tvUploadDocNew.visibility = View.VISIBLE
        } else {
            viewDataBinding!!.ivDocument.visibility = View.VISIBLE
            try {
                if (!CommonUtils.isStringNullOrBlank(user.userKycs!![0].addressProofImageUrl)) {
                    Glide.with(this).load(user.userKycs!![0].addressProofImageUrl)
                        .thumbnail(0.5f)
                        .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                        .apply(RequestOptions.centerCropTransform())
                        .into(viewDataBinding!!.ivDocument)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun showIDProofData(user: LoginBean) {
        if (user.userKycs != null && user.userKycs!![0].idProofImageUrl.contains(".pdf")) {
            imageFilePathForDoc = user.userKycs!![0].idProofImageUrl
            viewDataBinding!!.wvIdentification.visibility = View.INVISIBLE
            viewDataBinding!!.ivUploadImageNew.visibility = View.VISIBLE
            viewDataBinding!!.tvUploadImageNew.visibility = View.VISIBLE
        } else {
            viewDataBinding!!.ivIdentification.visibility = View.VISIBLE
            try {
                if (!CommonUtils.isStringNullOrBlank(user.userKycs!![0].idProofImageUrl)) {
                    Glide.with(this).load(user.userKycs!![0].idProofImageUrl)
                        .thumbnail(0.5f)
                        .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                        .apply(RequestOptions.centerCropTransform())
                        .into(viewDataBinding!!.ivIdentification)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * This method is used to initialize an variable and call a function.
     */
    override fun init() {
        val webViewClient: WebViewClient = WebViewClient()
        viewDataBinding!!.wvIdentification.setWebViewClient(webViewClient)
        viewDataBinding!!.wvIdentification.getSettings().setDomStorageEnabled(true)
        viewDataBinding!!.wvIdentification.getSettings().setLoadsImagesAutomatically(true)
        viewDataBinding!!.wvIdentification.getSettings().setJavaScriptEnabled(true)
        viewDataBinding!!.wvIdentification.clearCache(true);
        viewDataBinding!!.wvIdentification.clearHistory();
        viewDataBinding!!.wvIdentification.getSettings()
            .setJavaScriptCanOpenWindowsAutomatically(true);

        viewDataBinding!!.wvIdentification.getSettings().setAppCacheEnabled(false)
        viewDataBinding!!.wvIdentification.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, progress: Int) {

                if (progress == 100) {
                    // Hide progress bar when loading is finished
                }
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            viewDataBinding!!.wvIdentification.settings.layoutAlgorithm =
                WebSettings.LayoutAlgorithm.TEXT_AUTOSIZING
        } else {
            viewDataBinding!!.wvIdentification.settings.layoutAlgorithm =
                WebSettings.LayoutAlgorithm.NORMAL
        }

        val webViewClient1: WebViewClient = WebViewClient()
        viewDataBinding!!.wvDocument.setWebViewClient(webViewClient1)
        viewDataBinding!!.wvDocument.getSettings().setDomStorageEnabled(true)
        viewDataBinding!!.wvDocument.getSettings().setLoadsImagesAutomatically(true)
        viewDataBinding!!.wvDocument.getSettings().setJavaScriptEnabled(true)
        viewDataBinding!!.wvDocument.clearCache(true);
        viewDataBinding!!.wvDocument.clearHistory();
        viewDataBinding!!.wvDocument.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);

        viewDataBinding!!.wvDocument.getSettings().setAppCacheEnabled(false)
        viewDataBinding!!.wvDocument.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, progress: Int) {

                if (progress == 100) {
                    // Hide progress bar when loading is finished
                }
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            viewDataBinding!!.wvDocument.settings.layoutAlgorithm =
                WebSettings.LayoutAlgorithm.TEXT_AUTOSIZING
        } else {
            viewDataBinding!!.wvDocument.settings.layoutAlgorithm =
                WebSettings.LayoutAlgorithm.NORMAL
        }

        if (checkIfInternetOn()) {
            mKYCViewModel.callGetProfileApi(AppPreference.getInstance(this))
        }
    }

    override fun clickOnIdentificationDoc() {
        if (imageFilePathForDoc!!.contains("http")) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(imageFilePathForDoc!!))
            startActivity(browserIntent)
        } else {
            val pdfFile = File(imageFilePathForDoc!!)
            val openPdf = Intent(Intent.ACTION_VIEW)
            openPdf.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            var fileUri: Uri = FileProvider.getUriForFile(this, packageName, pdfFile)
            openPdf.setDataAndType(fileUri, applicationPDF)
            openPdf.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(Intent.createChooser(openPdf, "Select Application"))
        }
    }

    override fun clickOnAddressProofDoc() {
        if (documentPathNew!!.contains("http")) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(documentPathNew!!))
            startActivity(browserIntent)
        } else {
            val pdfFile = File(documentPathNew!!)
            val openPdf = Intent(Intent.ACTION_VIEW)
            openPdf.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            var fileUri: Uri = FileProvider.getUriForFile(this, packageName, pdfFile)
            openPdf.setDataAndType(fileUri, applicationPDF)
            openPdf.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(Intent.createChooser(openPdf, "Select Application"))
        }
    }

    override fun clickForNoEvent() {
        // This method is used when click on no event
    }

    override fun getKYCResponse(kycResponse: KYCResponse) {
        try {
            var userKyc: UserKyc = kycResponse.data!!
            var appPreference = AppPreference.getInstance(this)
            var user: LoginBean = appPreference.getSavedUser(appPreference)
            var userList = ArrayList<UserKyc>()
            userList.add(userKyc)

            user.kycStatus = "uploaded"

            user.userKycs = userList

            val userString = Gson().toJson(user)
            appPreference.addValue(PreferenceKeys.USER_DATA, userString)


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

            btnOk.setOnClickListener {
                dialog.dismiss()
                onBackPressed()
            }
            dialog.show()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun clickOnSubmitButton() {
        val radioButtonID: Int = viewDataBinding!!.rgDocument.getCheckedRadioButtonId()

        if (radioButtonID >= 0) {
            val radioButton: View = viewDataBinding!!.rgDocument.findViewById(radioButtonID)
            val idx: Int = viewDataBinding!!.rgDocument.indexOfChild(radioButton)

            val r: RadioButton = viewDataBinding!!.rgDocument.getChildAt(idx) as RadioButton
            identificationField = r.getText().toString()
        }

        val radioButtonID1: Int = viewDataBinding!!.rgProof.getCheckedRadioButtonId()
        if (radioButtonID1 >= 0) {
            val radioButton1: View = viewDataBinding!!.rgProof.findViewById(radioButtonID1)
            val idx1: Int = viewDataBinding!!.rgProof.indexOfChild(radioButton1)

            val r1: RadioButton = viewDataBinding!!.rgProof.getChildAt(idx1) as RadioButton
            addressField = r1.getText().toString()
        }

        if (checkValidationFields()) {
            mKYCViewModel.uploadKYCApi(
                AppPreference.getInstance(this),
                identificationField,
                imageFilePath!!,
                addressField,
                documentPath!!
            )
        }
    }


    /**
     * This method is used to apply validation on fields.
     */
    fun checkValidationFields(): Boolean {
        if (identificationField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_identification))
            return false
        }
        if (imageFilePath == null || imageFilePath!!.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_identification_image))
            return false
        }
        if (addressField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_address_proof))
            return false
        }
        if (documentPath == null || documentPath!!.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_address_proof_image))
            return false
        }
        return true
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            // This function is called when click on OK button
        }

        override fun ondeleteAccount() {
            // This function is called when click on DELETE button
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

    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// START CODE FOR PIC IMAGE FROM CAMERA AND GALLERY //////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    fun showPickImageDialog() {

        val selectImageDialog = Dialog(this, R.style.Theme_Dialog)
        selectImageDialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        selectImageDialog.setCancelable(true)
        selectImageDialog.setCanceledOnTouchOutside(true)
        selectImageDialog.setContentView(R.layout.dialog_camera_gallery)
        window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        selectImageDialog.window!!.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        selectImageDialog.window!!.attributes.windowAnimations = R.style.up_down_dialog

        //casting
        val takePhoto = selectImageDialog.findViewById<TextView>(R.id.takePhoto)
        val chooseFromGallery = selectImageDialog.findViewById<TextView>(R.id.chooseFromGallery)
        val cancelTextView = selectImageDialog.findViewById<TextView>(R.id.cancelTextView)
        val tvHeader = selectImageDialog.findViewById<TextView>(R.id.tv_header)
        val tvDocument = selectImageDialog.findViewById<TextView>(R.id.chooseDocument)
        val viewLine = selectImageDialog.findViewById<View>(R.id.line4)
        viewLine.visibility = View.VISIBLE
        tvDocument.visibility = View.VISIBLE
        tvHeader.text = getString(R.string.choose_from)

        cancelTextView.setOnClickListener { selectImageDialog.dismiss() }
        takePhoto.setOnClickListener {
            pickImageFromCamera()
            selectImageDialog.dismiss()

        }

        chooseFromGallery.setOnClickListener {
            pickImageFromGallery()
            selectImageDialog.dismiss()
        }

        tvDocument.setOnClickListener {
//            val mimeTypes = arrayOf(
//                "application/msword",
//                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//                "image/jpeg",
//                "image/jpg",
//                "image/png",
//                applicationPDF
//            )
//
//            val intent = Intent(Intent.ACTION_GET_CONTENT)
//            intent.addCategory(Intent.CATEGORY_OPENABLE)
//
//            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//                intent.type = if (mimeTypes.size == 1) mimeTypes[0] else "*/*"
//                if (mimeTypes.isNotEmpty()) {
//                    intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)
//                }
//            } else {
//                var mimeTypesStr = ""
//                for (mimeType in mimeTypes) {
//                    mimeTypesStr += "$mimeType|"
//                }
//                intent.type = mimeTypesStr.substring(0, mimeTypesStr.length - 1)
//            }
//            startActivityForResult(intent, AppConstants.DOCUMENT_REQUEST_CODE)

            selectImageDialog.dismiss()
            val pdfIntent = Intent(Intent.ACTION_GET_CONTENT)
            pdfIntent.type = "application/pdf"
            pdfIntent.addCategory(Intent.CATEGORY_OPENABLE)
            startActivityForResult(pdfIntent, AppConstants.DOCUMENT_REQUEST_CODE)
        }
        selectImageDialog.show()
    }

    /**
     * Capturing Camera Image will lauch camera app requrest image capture
     *
     */
    private fun pickImageFromCamera() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            val pictureIntent = Intent(
                MediaStore.ACTION_IMAGE_CAPTURE
            )
            if (pictureIntent.resolveActivity(packageManager) != null) {
                //Create a file to store the image
                var photoFile: File? = null
                try {
                    photoFile = createImageFile(this)
                } catch (ex: IOException) {
                    // Error occurred while creating the File
                }

                if (photoFile != null) {
                    mImageUri = FileProvider.getUriForFile(
                        this,
                        packageName, photoFile
                    )
                    pictureIntent.putExtra(
                        MediaStore.EXTRA_OUTPUT,
                        mImageUri
                    )
                    startActivityForResult(
                        pictureIntent,
                        AppConstants.CAMERA_REQUEST
                    )
                }
            }
        } else {
            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            mImageUri = getOutputMediaFileUri(MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE)
            intent.putExtra(MediaStore.EXTRA_OUTPUT, mImageUri)
            // start the image capture Intent
            startActivityForResult(intent, AppConstants.CAMERA_REQUEST)
        }
    }

    private fun pickImageFromGallery() {
        val i = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        i.type = "image/*"
        startActivityForResult(i, AppConstants.GALLERY_IMAGE_REQUEST)
    }


    /*Helper Methods*/
    @Throws(IOException::class)
    private fun createImageFile(context: Context): File {
        val timeStamp = SimpleDateFormat(
            "yyyyMMdd_HHmmss",
            Locale.getDefault()
        ).format(Date())
        val imageFileName = "IMG_" + timeStamp + "_"
        val storageDir = context.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        val image = File.createTempFile(
            imageFileName, /* prefix */
            ".jpg", /* suffix */
            storageDir      /* directory */
        )
        return image
    }

    /**
     * Creating file uri to store image/video
     */
    private fun getOutputMediaFileUri(type: Int): Uri {
        return Uri.fromFile(getOutputMediaFile(type))
    }

    private fun getOutputMediaFile(type: Int): File? {
        // External sdcard location
        val mediaStorageDir = File(
            Environment
                .getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
            AppConstants.IMAGE_DIRECTORY_NAME
        )

        // Create the storage directory if it does not exist
        if (!mediaStorageDir.exists() && !mediaStorageDir.mkdirs()) {
            return null
        }

        // Create a media file name
        val timeStamp = SimpleDateFormat(
            "yyyyMMdd_HHmmss",
            Locale.getDefault()
        ).format(Date())
        val mediaFile: File
        if (type == MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE) {
            mediaFile = File(
                mediaStorageDir.path + File.separator
                        + "IMG_" + timeStamp + ".jpg"
            )
        } else {
            return null
        }

        return mediaFile
    }


    /**
     * Here we store the file url as it will be null after returning from camera
     * app
     */
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)

        // save file url in bundle as it will be null on scren orientation
        // changes
        outState.putParcelable("file_uri", mImageUri)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)

        // get the file url
        mImageUri = savedInstanceState.getParcelable("file_uri")
    }
    private var filePath: Uri? = null
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == AppConstants.CAMERA_REQUEST) {
            when (resultCode) {
                Activity.RESULT_OK -> {
                    // TODO: Implement image cropping with UCrop
                    // For now, use image directly without cropping
                    if (FileUtils.getPDFFileSize(this, mImageUri!!)) {
                        ImageCompressionAsyncTask(this).execute(
                            mImageUri.toString(),
                            getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString() + "/Silicompressor/images"
                        )
                    } else {
                        viewModel.navigator!!.showValidationError(getString(R.string.file_size))
                    }

                }
                Activity.RESULT_CANCELED -> // user cancelled Image capture
                    Toast.makeText(
                        applicationContext,
                        getStringResource(R.string.cancel_image_capture), Toast.LENGTH_SHORT
                    )
                        .show()
                else -> // failed to capture image
                    Toast.makeText(
                        applicationContext,
                        getStringResource(R.string.fail_image_capture), Toast.LENGTH_SHORT
                    )
                        .show()
            }
        } else if (requestCode == AppConstants.GALLERY_IMAGE_REQUEST && resultCode == Activity.RESULT_OK && null != data) {
            val selectedImage = data.data
            // TODO: Implement image cropping with UCrop
            // For now, use image directly without cropping
            if (FileUtils.getPDFFileSize(this, selectedImage!!)) {
                ImageCompressionAsyncTask(this).execute(
                    selectedImage.toString(),
                    getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString() + "/Silicompressor/images"
                )
            } else {
                viewModel.navigator!!.showValidationError(getString(R.string.file_size))
            }
        } else if (requestCode == AppConstants.DOCUMENT_REQUEST_CODE && data != null) {
             documentCondition(data)
            }

        croppingImageCondition(requestCode, resultCode, data)
    }

    private fun documentCondition(data: Intent) {
        if (checkIfInternetOn()) {
            if (data.data != null) {
                val uri: Uri = data.data!!
                if (imageStatus) {
                    imageFileCondition(uri)
                } else {
                    documentFileCondition(uri)
                }
            } else {
                val uri: Uri? = data.data
                Log.e("fileUri: ", uri.toString())
                if (imageStatus) {
                    imageFileElsePath(uri)
                } else {
                    documentElseCondition(uri)
                }
            }
        }
    }

    private fun documentElseCondition(uri: Uri?) {
        if (FileUtils.getPDFFileSize(this, uri!!)) {
            documentPath = FileUtils.getRealPath(this, uri)!!
            viewModel.callUpdateImageApi(
                File(documentPath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
           // documentPathNew = documentPath
        } else {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }
    }

    private fun imageFileElsePath(uri: Uri?) {
        if (FileUtils.getPDFFileSize(this, uri!!)) {
            imageFilePath = FileUtils.getRealPath(this, uri)!!
            viewModel.callUpdateImageApi(
                File(imageFilePath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            //imageFilePathForDoc = imageFilePath
        } else {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }
    }

    private fun documentFileCondition(uri: Uri) {
        documentPath= FileUtils.copyFileToInternalStorage(this,uri,"Monay")!!
        var file=File(documentPath)
        if (FileUtils.getSizeOfFile(file)) {
            viewModel.callUpdateImageApi(
                File(documentPath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            //documentPathNew = documentPath
        } else {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }
//        if (FileUtils.getPDFFileSize(this, uri!!)) {
//            documentPath = FileUtils.getRealPath(this, uri)!!
//            viewModel.callUpdateImageApi(
//                File(documentPath!!),
//                AppPreference.getInstance(this),
//                userKYC,
//                AppConstants.MEDIA_TYPE_PDF
//            )
//            documentPathNew = documentPath
//        } else {
//            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
//        }
    }

    private fun imageFileCondition(uri: Uri) {
        imageFilePath= FileUtils.copyFileToInternalStorage(this,uri,"Monay")!!
        var file=File(imageFilePath)
        if (FileUtils.getSizeOfFile(file)) {
            viewModel.callUpdateImageApi(
                File(imageFilePath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            //imageFilePathForDoc = imageFilePath
        } else {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }

//        if (FileUtils.getPDFFileSize(this, uri!!)) {
//            imageFilePath = FileUtils.getRealPath(this, uri)!!
//            viewModel.callUpdateImageApi(
//                File(imageFilePath!!),
//                AppPreference.getInstance(this),
//                userKYC,
//                AppConstants.MEDIA_TYPE_PDF
//            )
//            imageFilePathForDoc = imageFilePath
//        } else {
//            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
//        }
    }

    private fun croppingImageCondition(requestCode: Int, resultCode: Int, data: Intent?) {
        // TODO: Implement UCrop result handling when image cropping is re-enabled
        /*
        try {
            if (requestCode == UCrop.REQUEST_CROP) {
                val resultUri = UCrop.getOutput(data!!)
                if (resultCode == RESULT_OK && resultUri != null) {
                    newImageFilePath =
                        viewModel.getFilePathFromURI(this@KYCActivity, resultUri).toString()
                    ImageCompressionAsyncTask(this).execute(
                        resultUri.toString(),
                        getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString() + "/Silicompressor/images"
                    )
                } else if (resultCode == UCrop.RESULT_ERROR) {
                    mKYCViewModel.navigator!!.showValidationError(getStringResource(R.string.something_went_wrong))
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        */
    }

    companion object {
        class ImageCompressionAsyncTask(var mContext: KYCActivity) :
            AsyncTask<String?, Void?, String?>() {

            private val activityReference: WeakReference<KYCActivity> = WeakReference(mContext)

            override fun doInBackground(vararg params: String?): String {
                return SiliCompressor.with(mContext)
                    .compress(params[0], File(params[1]))
            }

            override fun onPostExecute(s: String?) {

                val activity = activityReference.get() ?: return

                var length = 0f
                val name: String
                var compressUri: Uri? = null


                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    compressUri = Uri.parse(s)
                    val c: Cursor? =
                        mContext.contentResolver.query(compressUri, null, null, null, null)

                    c!!.moveToFirst()
                    name = c.getString(c.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                    length = c.getLong(c.getColumnIndex(OpenableColumns.SIZE)) / 1024.toFloat()
                } else {
                    val imageFile = File(s)
                    compressUri = Uri.fromFile(imageFile)
                    name = imageFile.name
                    length = imageFile.length() / 1024f // Size in KB

                }

                try {
                    val bitmap =
                        MediaStore.Images.Media.getBitmap(mContext.contentResolver, compressUri)
                    if (FileUtils.getFileSize(compressUri)) {
                        activity.callImagePostApi(compressUri)
                    } else {
                        activity.viewModel.navigator!!.showValidationError(activity.getString(R.string.file_size))
                    }
                    //activity.viewDataBinding!!.ivIdentification.setImageURI(compressUri)
                    val compressWidth = bitmap.width
                    val compressHieght = bitmap.height
                    java.lang.String.format(
                        Locale.US,
                        "Name: %s\nSize: %fKB\nWidth: %d\nHeight: %d",
                        name,
                        length,
                        compressWidth,
                        compressHieght
                    )

                } catch (e: IOException) {
                    e.printStackTrace()
                }

            }

        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// END CODE FOR PIC IMAGE FROM CAMERA AND GALLERY //////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////


    fun callImagePostApi(uri: Uri) {
        if (checkIfInternetOn()) {
            viewModel.callUpdateImageApi(
                File(viewModel.getFilePathFromURI(this@KYCActivity, uri).toString()),
                AppPreference.getInstance(this), userKYC, AppConstants.MEDIA_TYPE_IMAGE
            )
        }
    }

    override fun responseUploadImage(mediaResponse: MediaResponse) {
        if (imageStatus) {
            if (!imageFilePath.equals("")) {
                viewDataBinding!!.wvIdentification.visibility = View.INVISIBLE
                viewDataBinding!!.ivUploadImageNew.visibility = View.VISIBLE
                viewDataBinding!!.tvUploadImageNew.visibility = View.VISIBLE
                viewDataBinding!!.ivDelete.visibility = View.VISIBLE
                viewDataBinding!!.groupImage.visibility = View.GONE
                viewDataBinding!!.cvImage.visibility = View.VISIBLE
                imageFilePath = mediaResponse.data!!.basePath
                imageFilePathForDoc=mediaResponse.data!!.baseUrl
            } else {
                imageFilePath = mediaResponse.data!!.basePath
                imageFilePathForDoc=mediaResponse.data!!.baseUrl
                try {
                    if (!CommonUtils.isStringNullOrBlank(newImageFilePath)) {
                        Glide.with(this).load(newImageFilePath)
                            .thumbnail(0.5f)
                            .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                            .apply(RequestOptions.centerCropTransform())
                            .into(viewDataBinding!!.ivIdentification)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                viewDataBinding!!.cvImage.visibility = View.VISIBLE
                viewDataBinding!!.ivIdentification.visibility = View.VISIBLE
                viewDataBinding!!.ivDelete.visibility = View.VISIBLE
                viewDataBinding!!.groupImage.visibility = View.GONE
            }
        } else {
            if (!documentPath.equals("")) {
//                viewDataBinding!!.tvUploadDoc.text = documentPath
                viewDataBinding!!.wvDocument.visibility = View.INVISIBLE
                viewDataBinding!!.ivUploadDocNew.visibility = View.VISIBLE
                viewDataBinding!!.tvUploadDocNew.visibility = View.VISIBLE
                viewDataBinding!!.ivDeleteDoc.visibility = View.VISIBLE
                viewDataBinding!!.groupDoc.visibility = View.GONE
                viewDataBinding!!.cvDoc.visibility = View.VISIBLE
                documentPath = mediaResponse.data!!.basePath
                documentPathNew=mediaResponse.data!!.baseUrl
            } else {
                documentPath = mediaResponse.data!!.basePath
                documentPathNew=mediaResponse.data!!.baseUrl
                setDocumentImage()
                viewDataBinding!!.ivDocument.visibility = View.VISIBLE
                viewDataBinding!!.ivDeleteDoc.visibility = View.VISIBLE
                viewDataBinding!!.cvDoc.visibility = View.VISIBLE
                viewDataBinding!!.groupDoc.visibility = View.GONE
            }
        }
    }

    private fun setDocumentImage() {
        try {
            if (!CommonUtils.isStringNullOrBlank(newImageFilePath)) {
                Glide.with(this).load(newImageFilePath)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .apply(RequestOptions.centerCropTransform())
                    .into(viewDataBinding!!.ivDocument)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}