package com.monayuser.ui.editprofile

import android.Manifest
import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.telephony.SubscriptionManager
import android.text.InputType
import android.transition.TransitionInflater
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.inputmethod.EditorInfo
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.gson.Gson
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.*
import com.monayuser.databinding.ActivityEditProfileBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.forgotcodeverify.VerifyCodeActivity
import com.monayuser.utils.*
// TODO: Replace with UCrop when implementing image cropping
// import com.yalantis.ucrop.UCrop
// Removed synthetic imports - using ViewBinding instead
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class EditProfileActivity : BaseActivity<ActivityEditProfileBinding, EditProfileViewModel>(),
    EditProfileNavigator, View.OnClickListener {

    var count: Int = 0
    var selectCode: String? = null
    var mEditProfileViewModel: EditProfileViewModel = EditProfileViewModel()
    override val viewModel: EditProfileViewModel get() = mEditProfileViewModel
    override val bindingVariable: Int get() = BR.editProfileVM
    private var mImageUri: Uri? = null
    private var imageFilePath: String? = null
    var emailVerify: String = ""
    var mobileVerify: String = ""
    var email: String = ""
    var mobileNumber: String = ""
    val screenRequestcode: Int = 301
    var numberExists = false
    var alreadyVerified = "already verified"

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_edit_profile

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@EditProfileActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mEditProfileViewModel.navigator = this
        viewModel.user.value = LoginBean()

        if (!AppPreference.getInstance(this).getValue(PreferenceKeys.COUNTRY_NAME_CODE).equals(""))
            viewDataBinding!!.ccp.setCountryForNameCode(AppPreference.getInstance(context!!).getValue(PreferenceKeys.COUNTRY_NAME_CODE))

        mEditProfileViewModel.initView()
        viewDataBinding!!.includeToolbar.imageViewBack.setOnClickListener(this)

        val userType = AppPreference.getInstance(this@EditProfileActivity).getValue(PreferenceKeys.USER_TYPE)

        if (!AppPreference.getInstance(this).getSavedUser(AppPreference.getInstance(this)).userType.equals("user", true)  && !userType.equals(AppConstants.SECONDARY_SIGNUP)) {
            viewDataBinding!!.companyNameLayout.visibility = View.VISIBLE
            viewDataBinding!!.taxCribLayout.visibility = View.VISIBLE
            viewDataBinding!!.registerLayout.visibility = View.VISIBLE

            viewDataBinding!!.registerNumberEt.setRawInputType(InputType.TYPE_CLASS_TEXT);
            viewDataBinding!!.registerNumberEt.setImeActionLabel(
                getResources().getString(R.string.done),
                EditorInfo.IME_ACTION_DONE
            );
            viewDataBinding!!.registerNumberEt.setImeOptions(EditorInfo.IME_ACTION_DONE);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setSharedElementEnterTransition(TransitionInflater.from(this@EditProfileActivity).inflateTransition(R.transition.transition))
            viewDataBinding!!.userProfileImgView.setTransitionName("send_image")
        }

        startSmsUserConsent()
    }

    private fun startSmsUserConsent() {
        try {
            SmsRetriever.getClient(this).startSmsUserConsent(null)
        }catch (e:java.lang.Exception){
            e.printStackTrace()
        }
    }

    /**
     * This method is called when click on update button.
     */
    override fun proceed() {
        selectCode = viewDataBinding!!.ccp.selectedCountryCodeWithPlus
        if (mEditProfileViewModel.validateFields(
                viewDataBinding!!, AppPreference.getInstance(this)
            ) && checkIfInternetOn()
        ) {
            mEditProfileViewModel.updateProfileAPIForUserOrVendor(
                AppPreference.getInstance(this),
                selectCode!!
            )
        }
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun updateProfileResponse(updateProfileResponse: UpdateProfileResponse) {
        var loginBean = updateProfileResponse.data!!
        var appPreference = AppPreference.getInstance(this)
        var user: LoginBean = appPreference.getSavedUser(appPreference)
        loginBean.token = user.token
        val userString = Gson().toJson(loginBean)
        appPreference.addValue(PreferenceKeys.USER_DATA, userString)

        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.profile_tab),
            updateProfileResponse.message,
            ItemEventListener()
        )
    }

    override fun updateProfileResponseForUser(userUpdateProfileResponse: UserUpdateProfileResponse) {
        var loginBean = userUpdateProfileResponse.data!!
        var appPreference = AppPreference.getInstance(this)
        var user: LoginBean = appPreference.getSavedUser(appPreference)

        loginBean.token = user.token
        val userString = Gson().toJson(loginBean)
        appPreference.addValue(PreferenceKeys.USER_DATA, userString)
        emailVerify=""
        mobileVerify=""
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.profile_tab),
            userUpdateProfileResponse.message,
            ItemEventListener()
        )
    }

    /**
     * This method is used to open gallery & camera popup.
     */
    override fun opneGalleryCamera() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            checkPermission(
                this@EditProfileActivity,
                *CommonUtils.READ_WRITE_EXTERNAL_STORAGE_AND_CAMERA
            )
        } else {
            showPickImageDialog()
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
        showPickImageDialog()
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        textViewHeader.setText(getString(R.string.edit_profile))
        val countryCode = resources.getStringArray(R.array.CountryCode)
        if (spinnerLogin != null) {
            val adapter = ArrayAdapter(this, R.layout.spinner_textview, countryCode)
            spinnerLogin.adapter = adapter
        }
        spinnerLogin.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View,
                position: Int,
                id: Long
            ) {
                selectCode = countryCode[position]
            }

            override fun onNothingSelected(parent: AdapterView<*>) {
                // This method is called when nothing selected
            }
        }

        spinnerLogin.isEnabled = false
        val appPreferences = AppPreference.getInstance(this)
        viewDataBinding!!.ccp.showNameCode(false)
        viewDataBinding!!.ccp.isEnabled = false
        viewDataBinding!!.ccp.isFocusable = false
        viewDataBinding!!.ccp.setCcpClickable(false)
        viewDataBinding!!.ccp.setCountryForPhoneCode(
            (appPreferences.getSavedUser(appPreferences).phoneNumberCountryCode.toString()
                .replace("+", "").toInt())
        )

        selectCode = viewDataBinding!!.ccp.selectedCountryCodeWithPlus
        if (appPreferences.getSavedUser(appPreferences).profilePictureUrl != null && !appPreferences.getSavedUser(
                appPreferences
            ).profilePictureUrl.equals("")
        ) {
            CommonUtils.showProfile(
                this,
                appPreferences.getSavedUser(appPreferences).profilePictureUrl,
                viewDataBinding!!.userProfileImgView
            )
        }

        viewDataBinding!!.editUserName.setText("${appPreferences.getSavedUser(appPreferences).firstName}")
        viewDataBinding!!.editUserLastName.setText("${appPreferences.getSavedUser(appPreferences).lastName}")
        viewDataBinding!!.editUserEmail.setText(appPreferences.getSavedUser(appPreferences).email)
        viewDataBinding!!.editUserNumber.setText(appPreferences.getSavedUser(appPreferences).phoneNumber)

        if (appPreferences.getSavedUser(appPreferences).isEmailVerified) {
            //viewDataBinding!!.verifyEmail.visibility=View.GONE
                viewDataBinding!!.editUserEmail.isFocusable = false
            viewDataBinding!!.editUserEmail.isEnabled = false

            viewDataBinding!!.verifyEmail.text = resources.getString(R.string.change_email)
            emailVerify= alreadyVerified
            if(Build.VERSION.SDK_INT <= Build.VERSION_CODES.M){
                if (viewDataBinding!!.editUserEmail.text.length<=30)
                {
                    viewDataBinding!!.editUserEmail.setPadding(40, 30, 65, 30)
                }
                else
                {
                    viewDataBinding!!.editUserEmail.setPadding(40, 15, 160, 15)
                }
            }
        } else {
            /*viewDataBinding!!.editUserEmail.isFocusable = true
                viewDataBinding!!.editUserEmail.isEnabled = true
            */
            viewDataBinding!!.editUserEmail.isFocusable = false
            viewDataBinding!!.editUserEmail.isEnabled = false
        }

        if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true)) {
            viewDataBinding!!.registerNumberEt.setText(appPreferences.getSavedUser(appPreferences).chamberOfCommerce)
            viewDataBinding!!.companyNameEt.setText(appPreferences.getSavedUser(appPreferences).companyName)
            viewDataBinding!!.taxCribNumberEt.setText(appPreferences.getSavedUser(appPreferences).taxId)
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
        showProgressDialog(this@EditProfileActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@EditProfileActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    override fun emailVerifyResponse(emailResponse: EmailVerifyResponse) {
        emailVerify = "verified"
        mobileVerify = ""
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.oops),
            emailResponse.message,
            ItemEventListener()
        )
    }

    override fun verifyMobileResponse(resendOtpResponse: ResendOtpResponse) {
        if (emailVerify.equals(""))
        {
            mobileVerify = "verified"
            emailVerify = ""
        }
        else
        {
            emailVerify = alreadyVerified
            mobileVerify = ""
        }


        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED && mobileNumber != "" && mobileVerify == "verified"
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
                    if (number.contains(mobileNumber!!.trim())) {
                        numberExists = true
                        Log.e("Test", " Number is  $number")
                    }
                }
        }

        if (numberExists) {
            val intent = Intent(this@EditProfileActivity, VerifyCodeActivity::class.java)
            intent.putExtra(AppConstants.EMAIL, "")
            intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
            intent.putExtra(AppConstants.PHONE_NUMBER, mobileNumber)
            intent.putExtra(AppConstants.USER_ID, "")
            intent.putExtra(AppConstants.VERIFIED_STATUS, "verified")
            intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.EDIT_PROFILE)
            intent.putExtra("numberExists", "numberExists")
            startActivityForResult(intent, screenRequestcode)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            DialogUtils.dialogWithEvent(
                this,
                resources.getString(R.string.oops),
                resendOtpResponse.message,
                ItemEventListener()
            )
        }
    }

    override fun verifyEmail() {
        email = editUserEmail.text.toString().trim()
        val appPreferences = AppPreference.getInstance(this)
        if (!viewDataBinding!!.editUserEmail.text.toString().equals("")) {
            if (checkIfInternetOn()) {
                if (appPreferences.getSavedUser(appPreferences).isEmailVerified)
                {
                    emailVerify= alreadyVerified
                    mEditProfileViewModel.resendOtpApi(
                        AppPreference.getInstance(this),
                        selectCode.toString(),
                        email.toString()
                    )
                }
                else
                {
                    if (appPreferences.getSavedUser(appPreferences).email != email) {
                        mEditProfileViewModel!!.navigator!!.showValidationError(getStringResource(R.string.please_update_save_email))
                    } else {
                        mEditProfileViewModel.verifyEmailApi(
                            AppPreference.getInstance(this)
                        )
                    }
                }
            }
        } else {
            mEditProfileViewModel!!.navigator!!.showValidationError(getStringResource(R.string.enter_email))
        }
    }

    override fun changeNumber() {
        emailVerify = ""
        selectCode = viewDataBinding!!.ccp.selectedCountryCodeWithPlus
        mobileNumber = editUserNumber.text.toString()
        if (!viewDataBinding!!.editUserNumber.text.toString().equals("")) {
            if (checkIfInternetOn()) {
                mEditProfileViewModel.resendOtpApi(
                    AppPreference.getInstance(this),
                    selectCode.toString(),
                    mobileNumber
                )
            }
        } else {
            mEditProfileViewModel!!.navigator!!.showValidationError(getStringResource(R.string.registered_mobile_number))
        }
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            selectCode = viewDataBinding!!.ccp.selectedCountryCodeWithPlus

            if (emailVerify.equals("verified")) {
                val intent = Intent(this@EditProfileActivity, VerifyCodeActivity::class.java)
                intent.putExtra(AppConstants.EMAIL, email)
                intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
                intent.putExtra(AppConstants.PHONE_NUMBER, "")
                intent.putExtra(AppConstants.USER_ID, "")
                intent.putExtra(AppConstants.VERIFIED_STATUS, "verified")
                intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.EDIT_PROFILE)
                startActivityForResult(intent, screenRequestcode)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            } else if (mobileVerify.equals("verified")) {
                val intent = Intent(this@EditProfileActivity, VerifyCodeActivity::class.java)
                intent.putExtra(AppConstants.EMAIL, "")
                intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
                intent.putExtra(AppConstants.PHONE_NUMBER, mobileNumber)
                intent.putExtra(AppConstants.USER_ID, "")
                intent.putExtra(AppConstants.VERIFIED_STATUS, "verified")
                intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.EDIT_PROFILE)
                startActivityForResult(intent, screenRequestcode)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }
            else if (emailVerify.equals(alreadyVerified))
            {
                val intent = Intent(this@EditProfileActivity, VerifyCodeActivity::class.java)
                intent.putExtra(AppConstants.EMAIL, email)
                intent.putExtra(AppConstants.COUNTRY_CODE, selectCode)
                intent.putExtra(AppConstants.PHONE_NUMBER, "")
                intent.putExtra(AppConstants.USER_ID, "")
                intent.putExtra(AppConstants.VERIFIED_STATUS, alreadyVerified)
                intent.putExtra(AppConstants.SCREEN_FROM, AppConstants.EDIT_PROFILE)
                startActivityForResult(intent, screenRequestcode)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }
            else {
                setResult(Activity.RESULT_OK)
                finish()
            }
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
        DialogUtils.sessionExpireDialog(this@EditProfileActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is used to show session expire alert
     */
    override fun onClick(p0: View?) {
        val id: Int = p0!!.id
        if (id == R.id.imageViewBack) {
            supportFinishAfterTransition()
        }
    }


    override fun responseUploadImage(mediaResponse: MediaResponse) {
        viewModel.user.value?.profilePicture = mediaResponse.data!!.basePath
//        CommonUtils.showProfile(
//            this,
//            mediaResponse.data!!.baseUrl,
//            viewDataBinding!!.userProfileImgView
//        )
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

        val takePhoto = selectImageDialog.findViewById<TextView>(R.id.takePhoto)
        val chooseFromGallery = selectImageDialog.findViewById<TextView>(R.id.chooseFromGallery)
        val cancelTextView = selectImageDialog.findViewById<TextView>(R.id.cancelTextView)

        cancelTextView.setOnClickListener { selectImageDialog.dismiss() }
        takePhoto.setOnClickListener {
            pickImageFromCamera()
            selectImageDialog.dismiss()
        }

        chooseFromGallery.setOnClickListener {
            pickImageFromGallery()
            selectImageDialog.dismiss()
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

        imageFilePath = image.absolutePath
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
        outState.putParcelable("file_uri", mImageUri)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        // get the file url
        mImageUri = savedInstanceState.getParcelable("file_uri")
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        when (requestCode) {
            200 -> {
                finish()
            }
            screenRequestcode -> {
                setResult(201)
                finish()
            }
            AppConstants.CAMERA_REQUEST -> {
                when (resultCode) {
                    Activity.RESULT_OK -> {
                        // TODO: Implement image cropping with UCrop
                        // For now, just use the image directly without cropping
                        if (FileUtils.getPDFFileSize(this,mImageUri!!)){
                            viewDataBinding!!.userProfileImgView!!.setImageURI(mImageUri)
                            callImagePostApi(mImageUri!!)
                        }else{
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
            }
            AppConstants.GALLERY_IMAGE_REQUEST -> {
                if (resultCode == Activity.RESULT_OK && null != data) {
                    val selectedImage = data!!.data

                    // TODO: Implement image cropping with UCrop
                    // For now, just use the image directly without cropping
                    if (FileUtils.getPDFFileSize(this, selectedImage!!)) {
                        viewDataBinding!!.userProfileImgView!!.setImageURI(selectedImage)
                        callImagePostApi(selectedImage)
                    } else {
                        viewModel.navigator!!.showValidationError(getString(R.string.file_size))
                    }
                }
            }
        }
        conditionForCropping(requestCode, resultCode, data)
    }

    private fun conditionForCropping(requestCode: Int, resultCode: Int, data: Intent?) {
        // TODO: Implement UCrop result handling when image cropping is re-enabled
        /* 
        try {
            if (requestCode == UCrop.REQUEST_CROP) {
                val resultUri = UCrop.getOutput(data!!)
                if (resultCode == RESULT_OK && resultUri != null) {
                    viewDataBinding!!.userProfileImgView!!.setImageURI(resultUri)
                    if (FileUtils.getFileSize(resultUri)){
                        callImagePostApi(resultUri)
                    }else{
                        viewModel.navigator!!.showValidationError(getString(R.string.file_size))
                    }
                } else if (resultCode == UCrop.RESULT_ERROR) {
                    mEditProfileViewModel.navigator!!.showValidationError(getStringResource(R.string.something_went_wrong))
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        */
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
                File(viewModel.getFilePathFromURI(this@EditProfileActivity, uri).toString()),
                AppPreference.getInstance(this), "user"
            )
        }
    }
}