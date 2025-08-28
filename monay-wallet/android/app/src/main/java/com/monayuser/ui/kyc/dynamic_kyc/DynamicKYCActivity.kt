package com.monayuser.ui.kyc.dynamic_kyc

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.AsyncTask
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Button
import android.widget.RadioButton
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.google.gson.Gson
import com.iceteck.silicompressorr.SiliCompressor
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.AddressBean
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.bean.UserKyc
import com.monayuser.data.model.response.GetAllKYCDocumentsResponse
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.data.model.response.KYCResponse
import com.monayuser.data.model.response.MediaResponse
import com.monayuser.databinding.ActivityDynamicKycActivityBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.kyc.KYCActivity
import com.monayuser.ui.kyc.dynamic_kyc.adapter.DynamicAddressKycAdapter
import com.monayuser.ui.kyc.dynamic_kyc.adapter.DynamicPictureKycAdapter
import com.monayuser.utils.*
// TODO: Replace with UCrop when implementing image cropping
// import com.yalantis.ucrop.UCrop
import java.io.File
import java.io.IOException
import java.lang.ref.WeakReference
import java.text.SimpleDateFormat
import java.util.*

class DynamicKYCActivity : BaseActivity<ActivityDynamicKycActivityBinding, DynamicKYCViewModel>(),
    DynamicKYCNavigator {
    private var mDynamicKYCViewModel: DynamicKYCViewModel =
        DynamicKYCViewModel()
    override val viewModel: DynamicKYCViewModel get() = mDynamicKYCViewModel
    override val bindingVariable: Int get() = BR.dynamicKycVM
    private lateinit var pictureArrayList: ArrayList<AddressBean>
    private lateinit var addressArrayList: ArrayList<AddressBean>
    private var pictureKycAdapter: DynamicPictureKycAdapter? = null
    private var addressKycAdapter: DynamicAddressKycAdapter? = null
    private var mImageUri: Uri? = null
    private var imageFilePath: String? = null
    private var imageFilePathForDoc: String? = null
    private var newImageFilePath: String? = null
    private var imageStatus = false
    private var imageBackStatus = false
    private var addressImageBackStatus = false
    private var documentPath: String? = null
    private var documentPathNew: String? = null
    private var addressBackPath: String? = null
    private var addressBackPathNew: String? = null
    private var imageBackPath: String? = null
    private var imageBackPathNew: String? = null
    private var identificationField = ""
    private var addressField = ""
    private var applicationPDF = "application/pdf"
    private var userKYC = "user-kyc"
    private var pictureImageCount = 0
    private var addressImageCount = 0
    private var imageCount = 0
    private var addressCount =0

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_dynamic_kyc_activity

    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mDynamicKYCViewModel.navigator = this
        mDynamicKYCViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun clickOnBackButton() {
        finish()
    }

    override fun clickOnSubmitButton() {
        if (checkValidationFields()) {
            mDynamicKYCViewModel.uploadKYCApi(
                AppPreference.getInstance(this),
                identificationField,
                imageFilePath!!,
                imageBackPath.toString(),
                addressField,
                documentPath!!, addressBackPath.toString()
            )
        }
    }

    /**
     * This method is used to apply validation on fields.
     */
    private fun checkValidationFields(): Boolean {
        if (identificationField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_identification))
            return false
        }
        if (pictureImageCount == 2) {
            if (imageFilePath == null || imageFilePath!!.isEmpty()) {
                showValidationError(getStringResource(R.string.please_select_identification_image))
                return false
            }
            if (imageBackPath == null || imageBackPath!!.isEmpty()) {
                showValidationError(getStringResource(R.string.please_select_identification_back_image))
                return false
            }
        } else {
            if (imageFilePath == null || imageFilePath!!.isEmpty()) {
                showValidationError(getStringResource(R.string.please_select_identification_image))
                return false
            }
        }

        if (addressField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_address_proof))
            return false
        }
        if (addressImageCount == 2) {
            if (documentPath == null || documentPath!!.isEmpty()) {
                showValidationError(getStringResource(R.string.please_select_address_proof_image))
                return false
            }
            if (addressBackPath == null || addressBackPath!!.isEmpty()) {
                showValidationError(getStringResource(R.string.please_select_address_proof_back_image))
                return false
            }
        } else {
            if (documentPath == null || documentPath!!.isEmpty()) {
                showValidationError(getStringResource(R.string.please_select_address_proof_image))
                return false
            }
        }
        return true
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


    override fun getKycResponse(response: GetAllKYCDocumentsResponse) {
        if (response.data!!.picture.isNotEmpty()) {
            pictureArrayList.addAll(response.data!!.picture)
            pictureKycAdapter!!.notifyDataSetChanged();
        }
        if (response.data!!.address.isNotEmpty()) {
            addressArrayList.addAll(response.data!!.address)
            addressKycAdapter!!.notifyDataSetChanged();
        }
        if (checkIfInternetOn()) {
            mDynamicKYCViewModel.callGetProfileApi(AppPreference.getInstance(this))
        }
    }

    override fun init() {
        pictureArrayList = ArrayList()
        addressArrayList = ArrayList()
        initializeAdapter()


        if (checkIfInternetOn()) {
            mDynamicKYCViewModel.callGetAllKYCDocumentsApi(AppPreference.getInstance(this))
        }


    }

    /**
     * This method is used to open gallery & camera popup.
     */
    override fun clickOnPictureImageUpload() {
        if (identificationField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_identification))
        } else {
            imageFilePath = ""
            imageStatus = true
            imageBackStatus = false
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

    override fun clickOnPictureBackImageUpload() {
        if (identificationField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_identification))
        } else {
            imageBackPath = ""
            imageStatus = true
            imageBackStatus = true
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

    override fun clickOnAddressImageUpload() {
        if (addressField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_address_proof))
        } else {
            documentPath = ""
            imageStatus = false
            addressImageBackStatus = false
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

    override fun clickOnAddressBackImageUpload() {
        if (addressField.isEmpty()) {
            showValidationError(getStringResource(R.string.please_select_address_proof))
        } else {
            addressBackPath = ""
            imageStatus = false
            addressImageBackStatus = true
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
     * This method is used to initialize adapter
     */
    private fun initializeAdapter() {
        //picture adapter
        val linearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.dynamicKycPictureRecyclerView.layoutManager = linearLayoutManager
        pictureKycAdapter = DynamicPictureKycAdapter(this, pictureArrayList)
        viewDataBinding!!.dynamicKycPictureRecyclerView.adapter = pictureKycAdapter

        pictureKycAdapter!!.setOnItemClickListener(object :
            DynamicPictureKycAdapter.OnItemClickListener {
            override fun onItemClicked(addressBean: AddressBean, position: Int) {
                Log.d("TAG", "onItemClicked: " + addressBean.requiredDocumentName)
                pictureKycAdapter?.mPictureSelectedItem = position
                pictureKycAdapter?.notifyDataSetChanged();
                pictureImageCount = addressBean.uploadImageCount
                if (addressBean.uploadImageCount == 2) {
                    identificationField = addressBean.requiredDocumentName
                    imageBackStatus = true
                    viewDataBinding!!.groupImage.visibility = View.VISIBLE
                    viewDataBinding!!.groupImageBack.visibility = View.VISIBLE
                } else {
                    addressImageBackStatus = true
                    identificationField = addressBean.requiredDocumentName
                    viewDataBinding!!.groupImage.visibility = View.VISIBLE
                    viewDataBinding!!.groupImageBack.visibility = View.GONE
                }
            }
        })

        //address adapter
        val addressLinearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.dynamicKycAddressRecyclerView.layoutManager = addressLinearLayoutManager
        addressKycAdapter = DynamicAddressKycAdapter(this, addressArrayList)
        viewDataBinding!!.dynamicKycAddressRecyclerView.adapter = addressKycAdapter

        addressKycAdapter!!.setOnItemClickListener(object :
            DynamicAddressKycAdapter.OnItemClickListener {
            override fun onItemClicked(addressBean: AddressBean, position: Int) {
                Log.d("TAG", "onItemClicked: address: " + addressBean.requiredDocumentName)
                addressKycAdapter?.mSelectedItem = position
                addressKycAdapter?.notifyDataSetChanged();
                addressImageCount = addressBean.uploadImageCount
                if (addressBean.uploadImageCount == 2) {
                    addressField = addressBean.requiredDocumentName
                    viewDataBinding!!.groupAddressImage.visibility = View.VISIBLE
                    viewDataBinding!!.groupAddressImageBack.visibility = View.VISIBLE
                } else {
                    addressField = addressBean.requiredDocumentName
                    viewDataBinding!!.groupAddressImage.visibility = View.VISIBLE
                    viewDataBinding!!.groupAddressImageBack.visibility = View.GONE
                }
            }
        })

    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@DynamicKYCActivity)
    }

    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@DynamicKYCActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
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
    private fun showPickImageDialog() {

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
////                "application/msword",
////                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
////                "image/jpeg",
////                "image/jpg",
////                "image/png",
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
            var intent = Intent()
            intent.setType("application/pdf");
            intent.setAction(Intent.ACTION_GET_CONTENT);
            startActivityForResult(Intent.createChooser(intent, "Select Pdf"), AppConstants.DOCUMENT_REQUEST_CODE)

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
                        ImageCompressionAsyncTask(this@DynamicKYCActivity).execute(
                            mImageUri.toString(),
                            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString() + "/Silicompressor/images"
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
                ImageCompressionAsyncTask(this@DynamicKYCActivity).execute(
                    selectedImage.toString(),
                    Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString() + "/Silicompressor/images"
                )
            } else {
                viewModel.navigator!!.showValidationError(getString(R.string.file_size))
            }
        } else if (requestCode == AppConstants.DOCUMENT_REQUEST_CODE && data != null) {
            if (!addressImageBackStatus) {
                documentCondition(data)
            } else {
                backAddressCondition(data)
            }

        }

        croppingImageCondition(requestCode, resultCode, data)
    }

    private fun backAddressCondition(data: Intent) {
        if (checkIfInternetOn()) {
            if (data.data != null) {
                val uri: Uri = data.data!!
                if (imageStatus) {
                    imageFileCondition(uri)
                } else {
                    backAddressImageFileCondition(uri)
                }
            } else {
                val uri: Uri? = data.data
                Log.e("fileUri: ", uri.toString())
                if (imageStatus) {
                    imageFileElsePath(uri)
                } else {
                    backAddressElseCondition(uri)
                }
            }
        }
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

        documentPath= FileUtils.copyFileToInternalStorage(this,uri!!,"Monay")!!
        var file=File(documentPath)
        if (FileUtils.getSizeOfFile(file)) {
            viewModel.callUpdateImageApi(
                File(documentPath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            documentPathNew = documentPath
        }
        else
        {
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


    private fun documentFileCondition(uri: Uri) {
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
        documentPath= FileUtils.copyFileToInternalStorage(this,uri,"Monay")!!
        var file=File(documentPath)
        if (FileUtils.getSizeOfFile(file)) {
            viewModel.callUpdateImageApi(
                File(documentPath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            documentPathNew = documentPath
        }
        else
        {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }
    }

    private fun backAddressElseCondition(uri: Uri?) {
        addressBackPath= FileUtils.copyFileToInternalStorage(this,uri!!,"Monay")!!
        var file=File(addressBackPath)
        if (FileUtils.getSizeOfFile(file)) {
            viewModel.callUpdateImageApi(
                File(addressBackPath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            addressBackPathNew = addressBackPath
        }
        else
        {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }

//        if (FileUtils.getPDFFileSize(this, uri!!)) {
//            addressBackPath = FileUtils.getRealPath(this, uri)!!
//            viewModel.callUpdateImageApi(
//                File(addressBackPath!!),
//                AppPreference.getInstance(this),
//                userKYC,
//                AppConstants.MEDIA_TYPE_PDF
//            )
//            addressBackPathNew = addressBackPath
//        } else {
//            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
//        }
    }

    private fun backAddressImageFileCondition(uri: Uri) {
//        if (FileUtils.getPDFFileSize(this, uri!!)) {
//            addressBackPath = FileUtils.getRealPath(this, uri)!!
//            viewModel.callUpdateImageApi(
//                File(addressBackPath!!),
//                AppPreference.getInstance(this),
//                userKYC,
//                AppConstants.MEDIA_TYPE_PDF
//            )
//            addressBackPathNew = addressBackPath
//        } else {
//            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
//        }
        addressBackPath= FileUtils.copyFileToInternalStorage(this,uri,"Monay")!!
        var file=File(addressBackPath)
        if (FileUtils.getSizeOfFile(file)) {
            viewModel.callUpdateImageApi(
                File(addressBackPath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            addressBackPathNew = addressBackPath
        }
        else
        {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }
    }

    private fun imageFileElsePath(uri: Uri?) {
        imageFilePath= FileUtils.copyFileToInternalStorage(this,uri!!,"Monay")!!
        var file=File(imageFilePath)
        if (FileUtils.getSizeOfFile(file)) {

            viewModel.callUpdateImageApi(
                File(imageFilePath!!),
                AppPreference.getInstance(this),
                userKYC,
                AppConstants.MEDIA_TYPE_PDF
            )
            imageFilePathForDoc = imageFilePath
        }
        else {
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


    private fun imageFileCondition(uri: Uri) {
        imageFilePath= FileUtils.copyFileToInternalStorage(this,uri,"Monay")!!
        var file=File(imageFilePath)
        if (FileUtils.getSizeOfFile(file)) {
            if (!imageBackStatus)
            {
                viewModel.callUpdateImageApi(
                    File(imageFilePath!!),
                    AppPreference.getInstance(this),
                    userKYC,
                    AppConstants.MEDIA_TYPE_PDF
                )
                imageFilePathForDoc = imageFilePath
            }
            else
            {
                imageBackPath = imageFilePath
                viewModel.callUpdateImageApi(
                    File(imageBackPath!!),
                    AppPreference.getInstance(this),
                    userKYC,
                    AppConstants.MEDIA_TYPE_PDF
                )
                imageBackPathNew = imageBackPath
            }
            //imageFilePathForDoc = imageFilePath
        } else {
            viewModel.navigator!!.showValidationError(getString(R.string.file_size))
        }

//        if (FileUtils.getPDFFileSize(this, uri!!)) {
//            if (!imageBackStatus) {
//                imageFilePath = FileUtils.getRealPath(this, uri)!!
//                viewModel.callUpdateImageApi(
//                    File(imageFilePath!!),
//                    AppPreference.getInstance(this),
//                    userKYC,
//                    AppConstants.MEDIA_TYPE_PDF
//                )
//                imageFilePathForDoc = imageFilePath
//            } else {
//                imageBackPath = FileUtils.getRealPath(this, uri)!!
//                viewModel.callUpdateImageApi(
//                    File(imageBackPath!!),
//                    AppPreference.getInstance(this),
//                    userKYC,
//                    AppConstants.MEDIA_TYPE_PDF
//                )
//                imageBackPathNew = imageBackPath
//            }
//
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
                        viewModel.getFilePathFromURI(this@DynamicKYCActivity, resultUri).toString()
                    ImageCompressionAsyncTask(this@DynamicKYCActivity).execute(
                        resultUri.toString(),
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                            .toString() + "/Silicompressor/images"
                    )
                } else if (resultCode == UCrop.RESULT_ERROR) {
                    mDynamicKYCViewModel.navigator!!.showValidationError(getStringResource(R.string.something_went_wrong))
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        */
    }

    companion object {
        class ImageCompressionAsyncTask(var mContext: DynamicKYCActivity) :
            AsyncTask<String?, Void?, String?>() {

            private val activityReference: WeakReference<DynamicKYCActivity> =
                WeakReference(mContext)

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
                File(viewModel.getFilePathFromURI(this@DynamicKYCActivity, uri).toString()),
                AppPreference.getInstance(this), userKYC, AppConstants.MEDIA_TYPE_IMAGE
            )
        }
    }

    override fun responseUploadImage(mediaResponse: MediaResponse) {
        if (imageStatus) {
            if (!imageBackStatus) {
                if (!imageFilePath.equals("")) {
                    viewDataBinding!!.wvIdentification.visibility = View.INVISIBLE
                    viewDataBinding!!.ivUploadImageNew.visibility = View.VISIBLE
                    viewDataBinding!!.tvUploadImageNew.visibility = View.VISIBLE
                    viewDataBinding!!.ivDelete.visibility = View.VISIBLE
                    viewDataBinding!!.groupImage.visibility = View.INVISIBLE
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
                    viewDataBinding!!.ivIdentification.visibility = View.VISIBLE
                    viewDataBinding!!.cvImage.visibility = View.VISIBLE
                    viewDataBinding!!.ivDelete.visibility = View.VISIBLE
                    viewDataBinding!!.groupImage.visibility = View.INVISIBLE
                    viewDataBinding!!.ivUploadImageNew.visibility = View.INVISIBLE
                    viewDataBinding!!.tvUploadImageNew.visibility = View.INVISIBLE
                }
            } else {
                if (!imageBackPath.equals("")) {
                    viewDataBinding!!.wvIdentificationBack.visibility = View.INVISIBLE
                    viewDataBinding!!.ivUploadImageNewBack.visibility = View.VISIBLE
                    viewDataBinding!!.tvUploadImageNewBack.visibility = View.VISIBLE
                    viewDataBinding!!.ivDeleteBack.visibility = View.VISIBLE
                    viewDataBinding!!.groupImageBack.visibility = View.INVISIBLE
                    viewDataBinding!!.cvImageBack.visibility = View.VISIBLE

                    imageBackPath = mediaResponse.data!!.basePath
                    imageBackPathNew=mediaResponse.data!!.baseUrl

                } else {
                    imageBackPath = mediaResponse.data!!.basePath
                    imageBackPathNew=mediaResponse.data!!.baseUrl
                    try {
                        if (!CommonUtils.isStringNullOrBlank(newImageFilePath)) {
                            Glide.with(this).load(newImageFilePath)
                                .thumbnail(0.5f)
                                .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                                .apply(RequestOptions.centerCropTransform())
                                .into(viewDataBinding!!.ivIdentificationBack)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                    viewDataBinding!!.ivIdentificationBack.visibility = View.VISIBLE
                    viewDataBinding!!.ivDeleteBack.visibility = View.VISIBLE
                    viewDataBinding!!.groupImageBack.visibility = View.INVISIBLE
                    viewDataBinding!!.cvImageBack.visibility = View.VISIBLE
                    viewDataBinding!!.ivUploadImageBack.visibility = View.INVISIBLE
                    viewDataBinding!!.tvUploadImageBack.visibility = View.INVISIBLE
                }
            }
        } else
            if (!addressImageBackStatus) {
                if (!documentPath.equals("")) {
//                viewDataBinding!!.tvUploadDoc.text = documentPath
                    viewDataBinding!!.ivAddressIdentification.visibility = View.INVISIBLE
                    viewDataBinding!!.ivAddressUploadImageNew.visibility = View.VISIBLE
                    viewDataBinding!!.tvAddressUploadImageNew.visibility = View.VISIBLE
                    viewDataBinding!!.tvAddressUploadImage.visibility = View.VISIBLE
                    viewDataBinding!!.ivAddressDelete.visibility = View.VISIBLE
                    viewDataBinding!!.groupAddressImage.visibility = View.INVISIBLE
                    viewDataBinding!!.cvAddressImage.visibility = View.VISIBLE
                    documentPath = mediaResponse.data!!.basePath
                    documentPathNew=mediaResponse.data!!.baseUrl

                } else {
                    documentPath = mediaResponse.data!!.basePath
                    documentPathNew=mediaResponse.data!!.baseUrl
                    setDocumentImage()
                    viewDataBinding!!.ivAddressIdentification.visibility = View.VISIBLE
                    viewDataBinding!!.ivAddressDelete.visibility = View.VISIBLE
                    viewDataBinding!!.cvAddressImage.visibility = View.VISIBLE
                    viewDataBinding!!.groupAddressImage.visibility = View.INVISIBLE
                    viewDataBinding!!.ivAddressUploadImageNew.visibility = View.INVISIBLE
                    viewDataBinding!!.tvAddressUploadImageNew.visibility = View.INVISIBLE


                }
            } else {
                if (!addressBackPath.equals("")) {
//                viewDataBinding!!.tvUploadDoc.text = documentPath
                    viewDataBinding!!.ivAddressIdentificationBack.visibility = View.INVISIBLE
                    viewDataBinding!!.ivUploadAddressImageNewBack.visibility = View.VISIBLE
                    viewDataBinding!!.tvUploadAddressImageNewBack.visibility = View.VISIBLE
                    viewDataBinding!!.tvUploadAddressImageBack.visibility = View.VISIBLE
                    viewDataBinding!!.ivAddressDeleteBack.visibility = View.VISIBLE
                    viewDataBinding!!.groupAddressImageBack.visibility = View.INVISIBLE
                    addressBackPath = mediaResponse.data!!.basePath
                    addressBackPathNew=mediaResponse.data!!.baseUrl
                } else {
                    addressBackPath = mediaResponse.data!!.basePath
                    addressBackPathNew=mediaResponse.data!!.baseUrl
                    setDocumentBackImage()
//                    viewDataBinding!!.ivUploadAddressImageNewBack.visibility = View.VISIBLE
//                    viewDataBinding!!.tvUploadAddressImageBack.visibility = View.VISIBLE
                    viewDataBinding!!.cvAddressImageBack.visibility = View.VISIBLE
                    viewDataBinding!!.ivAddressIdentificationBack.visibility = View.VISIBLE

                    viewDataBinding!!.ivAddressDeleteBack.visibility = View.VISIBLE
                    viewDataBinding!!.groupAddressImageBack.visibility = View.INVISIBLE
                    viewDataBinding!!.ivUploadAddressImageNewBack.visibility = View.INVISIBLE
                    viewDataBinding!!.tvUploadAddressImageNewBack.visibility = View.INVISIBLE


                }
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

    override fun clickOnOpenDocBack() {
        if (imageBackPathNew!!.contains("http")) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(imageBackPathNew!!))
            startActivity(browserIntent)
        } else {
            val pdfFile = File(imageBackPathNew!!)
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

    override fun clickOnAddressProofBackDoc() {
        if (addressBackPathNew!!.contains("http")) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(addressBackPathNew!!))
            startActivity(browserIntent)
        } else {
            val pdfFile = File(addressBackPathNew!!)
            val openPdf = Intent(Intent.ACTION_VIEW)
            openPdf.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            var fileUri: Uri = FileProvider.getUriForFile(this, packageName, pdfFile)
            openPdf.setDataAndType(fileUri, applicationPDF)
            openPdf.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(Intent.createChooser(openPdf, "Select Application"))
        }
    }
    override fun clickOnDeleteImage() {
        imageFilePath = ""
        newImageFilePath = ""
        imageFilePathForDoc = ""
        viewDataBinding!!.ivIdentification.visibility = View.INVISIBLE
        viewDataBinding!!.cvImage.visibility = View.INVISIBLE
        viewDataBinding!!.ivUploadImageNew.visibility = View.VISIBLE
        viewDataBinding!!.tvUploadImageNew.visibility = View.VISIBLE
        viewDataBinding!!.ivDelete.visibility = View.INVISIBLE
        viewDataBinding!!.groupImage.visibility = View.VISIBLE
    }

    override fun clickOnDeleteBackImage() {

        imageBackPath = ""
        imageBackPathNew = ""
        viewDataBinding!!.ivIdentificationBack.visibility = View.INVISIBLE
        viewDataBinding!!.cvImageBack.visibility = View.INVISIBLE
        viewDataBinding!!.ivUploadImageBack.visibility = View.VISIBLE
        viewDataBinding!!.tvUploadImageBack.visibility = View.VISIBLE
        viewDataBinding!!.ivDeleteBack.visibility = View.INVISIBLE
        viewDataBinding!!.groupImageBack.visibility = View.VISIBLE


    }

    override fun clickOnDeleteAddressImage() {
        viewDataBinding!!.ivAddressIdentification.visibility = View.INVISIBLE
        viewDataBinding!!.cvAddressImage.visibility = View.INVISIBLE
        viewDataBinding!!.ivAddressUploadImageNew.visibility = View.VISIBLE
        viewDataBinding!!.tvAddressUploadImage.visibility = View.VISIBLE
        viewDataBinding!!.ivAddressDelete.visibility = View.INVISIBLE
        viewDataBinding!!.groupAddressImage.visibility = View.VISIBLE
        documentPath = ""
        documentPathNew = ""

    }

    override fun clickOnDeleteAddressBackImage() {

        viewDataBinding!!.ivAddressIdentificationBack.visibility = View.INVISIBLE
        viewDataBinding!!.ivUploadAddressImageNewBack.visibility = View.VISIBLE
        viewDataBinding!!.cvAddressImageBack.visibility = View.INVISIBLE
        viewDataBinding!!.tvUploadAddressImageBack.visibility = View.VISIBLE
        viewDataBinding!!.ivAddressDeleteBack.visibility = View.INVISIBLE
        viewDataBinding!!.groupAddressImageBack.visibility = View.VISIBLE
        addressBackPath = ""
        addressBackPathNew = ""

    }

    private fun setDocumentImage() {
        try {
            if (!CommonUtils.isStringNullOrBlank(newImageFilePath)) {
                Log.e("", "setDocumentImage: " + newImageFilePath)
                Glide.with(this).load(newImageFilePath)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .apply(RequestOptions.centerCropTransform())
                    .into(
                        viewDataBinding!!.ivAddressIdentification

                    )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun setDocumentBackImage() {
        try {
            if (!CommonUtils.isStringNullOrBlank(newImageFilePath)) {
                Log.e("", "setDocumentBackImage: " + newImageFilePath)
                Glide.with(this).load(newImageFilePath)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .apply(RequestOptions.centerCropTransform())
                    .into(
                        viewDataBinding!!.ivAddressIdentificationBack

                    )
            }
        } catch (e: Exception) {
            e.printStackTrace()
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
        var isImageBack = false
        var isAddressBack = false

        if (user.kycStatus.equals("uploaded", true) || user.kycStatus.equals("approved", true)) {
          /*  viewDataBinding!!.ivDeleteDoc.visibility = View.GONE
            viewDataBinding!!.ivDelete.visibility = View.GONE
            viewDataBinding!!.btnSubmit.visibility = View.GONE
            viewDataBinding!!.groupDoc.visibility = View.GONE
            viewDataBinding!!.groupImage.visibility = View.GONE*/
            viewDataBinding!!.btnSubmit.visibility = View.INVISIBLE

                for (i in 0 until pictureArrayList.size) {
                val view = viewDataBinding!!.dynamicKycPictureRecyclerView.getChildAt(i)
//                        as RadioButton

                var radioButton = view.findViewById<RadioButton>(R.id.radio_button)
                if (user.userKycs != null && user.userKycs!![0].idProofName.equals(
                        pictureArrayList[i].requiredDocumentName, true
                    )
                ) {
                    radioButton.isChecked = true
                    if (pictureArrayList[i].uploadImageCount==2){
                        isImageBack = true
                    }
                } else {
                    radioButton.isEnabled = false
                    radioButton.isFocusable = false
                }
            }


            for (i in 0 until addressArrayList.size) {
                val view = viewDataBinding!!.dynamicKycAddressRecyclerView.getChildAt(i)

//                        as RadioButton
                var radioButton = view.findViewById<RadioButton>(R.id.radio_button)
                if (user.userKycs != null && user.userKycs!![0].addressProofName.equals(
                        addressArrayList[i].requiredDocumentName, true
                    )
                ) {
                    radioButton.isChecked = true
                    if (addressArrayList[i].uploadImageCount==2){
                        isAddressBack = true
                    }
                } else {
                    radioButton.isEnabled = false
                    radioButton.isFocusable = false
                }

            }

            showIDProofData(user)
            showAddressProofData(user)
            if (isImageBack){showBackIDProofData(user)}
            if (isAddressBack){ showBackAddressProofData(user)}




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
            viewDataBinding!!.groupImage.visibility = View.INVISIBLE
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

    private fun showBackIDProofData(user: LoginBean) {

            if (user.userKycs != null && user.userKycs!![0].idProofBackImageUrl.contains(".pdf")) {
                imageBackPath = user.userKycs!![0].idProofBackImageUrl
                viewDataBinding!!.wvIdentificationBack.visibility = View.INVISIBLE
                viewDataBinding!!.ivUploadImageBack.visibility = View.VISIBLE
                viewDataBinding!!.tvUploadImageBack.visibility = View.VISIBLE
            } else {
                viewDataBinding!!.ivIdentificationBack.visibility = View.VISIBLE
                viewDataBinding!!.groupImageBack.visibility = View.INVISIBLE
                try {
                    if (!CommonUtils.isStringNullOrBlank(user.userKycs!![0].idProofBackImageUrl)) {
                        Glide.with(this).load(user.userKycs!![0].idProofBackImageUrl)
                            .thumbnail(0.5f)
                            .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                            .apply(RequestOptions.centerCropTransform())
                            .into(viewDataBinding!!.ivIdentificationBack)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }


    }


    private fun showAddressProofData(user: LoginBean) {
        if (user.userKycs != null && user.userKycs!![0].addressProofImageUrl.contains(".pdf")) {
            documentPathNew = user.userKycs!![0].addressProofImageUrl
            viewDataBinding!!.wvAddressIdentification.visibility = View.INVISIBLE
            viewDataBinding!!.ivAddressUploadImageNew.visibility = View.VISIBLE
            viewDataBinding!!.tvAddressUploadImageNew.visibility = View.VISIBLE
        } else {
            viewDataBinding!!.ivAddressIdentification.visibility = View.VISIBLE
            viewDataBinding!!.groupAddressImage.visibility = View.INVISIBLE
            try {
                if (!CommonUtils.isStringNullOrBlank(user.userKycs!![0].addressProofImageUrl)) {
                    Glide.with(this).load(user.userKycs!![0].addressProofImageUrl)
                        .thumbnail(0.5f)
                        .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                        .apply(RequestOptions.centerCropTransform())
                        .into(viewDataBinding!!.ivAddressIdentification)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun showBackAddressProofData(user: LoginBean) {


            if (user.userKycs != null && user.userKycs!![0].addressProofBackImageUrl.contains(".pdf")) {
                addressBackPathNew = user.userKycs!![0].addressProofBackImageUrl
                viewDataBinding!!.wvAddressIdentificationBack.visibility = View.INVISIBLE
                viewDataBinding!!.ivUploadAddressImageNewBack.visibility = View.VISIBLE
                viewDataBinding!!.tvUploadAddressImageNewBack.visibility = View.VISIBLE
            } else {
                viewDataBinding!!.ivAddressIdentificationBack.visibility = View.VISIBLE
                viewDataBinding!!.groupAddressImageBack.visibility = View.INVISIBLE

                try {
                    if (!CommonUtils.isStringNullOrBlank(user.userKycs!![0].addressProofBackImageUrl)) {
                        Glide.with(this).load(user.userKycs!![0].addressProofBackImageUrl)
                            .thumbnail(0.5f)
                            .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                            .apply(RequestOptions.centerCropTransform())
                            .into(viewDataBinding!!.ivAddressIdentificationBack)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }


    }
}
