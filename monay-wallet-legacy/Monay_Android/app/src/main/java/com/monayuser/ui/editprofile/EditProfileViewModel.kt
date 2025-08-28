package com.monayuser.ui.editprofile

import android.content.Context
import android.net.Uri
import android.text.TextUtils
import androidx.lifecycle.MutableLiveData
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.EmailVerifyResponse
import com.monayuser.data.model.response.MediaResponse
import com.monayuser.data.model.response.ResendOtpResponse
import com.monayuser.data.model.response.UserUpdateProfileResponse
import com.monayuser.databinding.ActivityEditProfileBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.AppConstants
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.IoUtils
import com.monayuser.utils.NetworkResponseCallback
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream

class EditProfileViewModel : BaseViewModel<EditProfileNavigator>() {

    var user = MutableLiveData<LoginBean>()

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */

    fun proceed() {
        navigator!!.proceed()
    }

    fun opneGalleryCamera() {
        navigator!!.opneGalleryCamera()
    }

    fun verifyEmail() {
        navigator!!.verifyEmail()
    }

    fun changeNumber() {
        navigator!!.changeNumber()
    }

    /**
     * This method is used to apply validation on fields.
     */
    internal fun validateFields(
        viewDataBinding: ActivityEditProfileBinding,
        appPreferences: AppPreference
    ): Boolean {
        val userViewModel = user.value

        if (userViewModel!!.firstName.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_first_name))
            viewDataBinding.editUserName.requestFocus()
            return false
        }

        if (userViewModel!!.lastName.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_last_name))
            viewDataBinding.editUserName.requestFocus()
            return false
        }

        if (userViewModel!!.email.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email))
            viewDataBinding.editUserEmail.requestFocus()
            return false
        }

        if (!CommonUtils.isEmailValid(userViewModel!!.email.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_email_valid))
            viewDataBinding.editUserEmail.requestFocus()
            return false
        }

        if (userViewModel!!.phoneNumber.trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.validation_mobile_number))
            viewDataBinding.editUserNumber.requestFocus()
            return false
        }

        if (!CommonUtils.isMobileValidate(userViewModel!!.phoneNumber.trim())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.valid_mobile_number))
            viewDataBinding.editUserNumber.requestFocus()
            return false
        }

        if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true) && !appPreferences.getSavedUser(appPreferences).userType.equals(AppConstants.SECONDARY_SIGNUP)) {
            if (userViewModel!!.companyName.trim().isEmpty()) {
                navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_company_name))
                viewDataBinding.companyNameEt.requestFocus()
                return false
            }

            if (userViewModel.taxId.trim().isEmpty()) {
                navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_tax_id))
                viewDataBinding.taxCribNumberEt.requestFocus()
                return false
            }

            if (userViewModel.registrationNumber.trim().isEmpty()) {
                navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_registration_number))
                viewDataBinding.registerNumberEt.requestFocus()
                return false
            }
        }
        return true
    }

    /**
     * This method is used to call Update Profile API.
     */
    internal fun updateProfileAPIForUserOrVendor(
        appPreferences: AppPreference, countryCode: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            UserUpdateProfileResponse().doNetworkRequest(prepareRequestHashMapForUser(
                appPreferences,
                countryCode
            ),
                appPreferences,
                object : NetworkResponseCallback<UserUpdateProfileResponse> {
                    override fun onResponse(userUpdateProfileResponse: UserUpdateProfileResponse) {
                        navigator!!.hideProgressBar()
                        if (userUpdateProfileResponse.isSuccess) {
                            navigator!!.updateProfileResponseForUser(userUpdateProfileResponse)
                        } else {
                            if (!userUpdateProfileResponse.message.equals("")) {
                                onServerError(userUpdateProfileResponse.message)
                            } else {
                                onServerError(userUpdateProfileResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapForUser(
        appPreferences: AppPreference,
        countryCode: String
    ): HashMap<String, Any> {
        val requestParam: HashMap<String, Any> = HashMap()
        val userViewModel = user.value

        requestParam["firstName"] = userViewModel!!.firstName.trim()
        requestParam["lastName"] = userViewModel!!.lastName.trim()
        requestParam["email"] = userViewModel!!.email.trim()
        requestParam["phoneNumberCountryCode"] = countryCode
        requestParam["phoneNumber"] = userViewModel!!.phoneNumber.trim()
        requestParam["profilePicture"] = userViewModel!!.profilePicture.trim()
        if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true)&& !appPreferences.getSavedUser(appPreferences).userType.equals(AppConstants.SECONDARY_SIGNUP)) {
            requestParam["companyName"] = userViewModel!!.companyName.trim()
            requestParam["taxId"] = userViewModel!!.taxId.trim()
            requestParam["chamberOfCommerce"] = userViewModel!!.registrationNumber.trim()
        }
        return requestParam!!
    }

    fun callUpdateImageApi(mFile: File, appPreferences: AppPreference, userType: String) {
        navigator!!.showProgressBar()
        disposable.add(
            MediaResponse().doNetworkRequest(prepareRequestHashMap(mFile, userType), appPreferences,
                object : NetworkResponseCallback<MediaResponse> {
                    override fun onResponse(`object`: MediaResponse) {
                        navigator!!.hideProgressBar()
                        if (`object`.isSuccess) {
                            navigator!!.responseUploadImage(`object`)
                        } else {
                            if (!`object`.message.equals("")) {
                                onServerError(`object`.message)
                            } else {
                                onServerError(`object`.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showNetworkError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != "")
                            navigator!!.showNetworkError(error)
                        else
                            navigator!!.showNetworkError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    private fun prepareRequestHashMap(mFile: File?, userType: String): HashMap<String, Any> {
        val requestParam = java.util.HashMap<String, Any>()
        requestParam[AppConstants.MEDIA_FILE] = mFile!!
        requestParam[AppConstants.MEDIA_FOR] = userType
        requestParam[AppConstants.MEDIA_TYPE] = AppConstants.MEDIA_TYPE_IMAGE
        return requestParam
    }


    fun getFilePathFromURI(context: Context, contentUri: Uri?): String? {
        //copy file and send new file path
        val fileName = getFileName(contentUri)
        val rootDataDir = context.filesDir
        if (!TextUtils.isEmpty(fileName)) {
            val copyFile =
                File(rootDataDir.toString() + File.separator + fileName + ".jpg")
            copy(context, contentUri, copyFile)
            return copyFile.absolutePath
        }
        return null
    }

    fun getFileName(uri: Uri?): String? {
        if (uri == null) return null
        var fileName: String? = null
        val path: String? = uri.path
        val cut = path!!.lastIndexOf('/')
        if (cut != -1) {
            fileName = path.substring(cut + 1)
        }
        return fileName
    }

    fun copy(
        context: Context,
        srcUri: Uri?,
        dstFile: File?
    ) {
        try {
            val inputStream =
                context.contentResolver.openInputStream(srcUri!!) ?: return
            val outputStream: OutputStream = FileOutputStream(dstFile)
            IoUtils.copy(inputStream, outputStream)
            inputStream.close()
            outputStream.close()
        } catch (e: IOException) {
            e.printStackTrace()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    internal fun verifyEmailApi(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            EmailVerifyResponse().doNetworkRequest(prepareRequestHashMapEmailVerify(),
                appPreferences,
                object : NetworkResponseCallback<EmailVerifyResponse> {
                    override fun onResponse(emailResponse: EmailVerifyResponse) {
                        navigator!!.hideProgressBar()
                        if (emailResponse.isSuccess) {
                            navigator!!.emailVerifyResponse(emailResponse)
                        } else {
                            if (!emailResponse.message.equals("")) {
                                onServerError(emailResponse.message)
                            } else {
                                onServerError(emailResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(message)
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapEmailVerify(): HashMap<String, Any> {
        var requestParam: java.util.HashMap<String, Any>? = HashMap()
        return requestParam!!
    }

    internal fun resendOtpApi(
        appPreferences: AppPreference, countryCode: String, phoneNumber: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            ResendOtpResponse().doNetworkRequest(prepareRequestHashMapForResend(
                countryCode,
                phoneNumber
            ),
                appPreferences,
                object : NetworkResponseCallback<ResendOtpResponse> {
                    override fun onResponse(resendOtpResponse: ResendOtpResponse) {
                        navigator!!.hideProgressBar()
                        if (resendOtpResponse.isSuccess) {
                            navigator!!.verifyMobileResponse(resendOtpResponse)
                        } else {
                            if (!resendOtpResponse.message.equals("")) {
                                onServerError(resendOtpResponse.message)
                            } else {
                                onServerError(resendOtpResponse.errorBean!!.message!!)
                            }
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapForResend(
        countryCode: String,
        phoneNumber: String
    ): java.util.HashMap<String, Any> {
        var requestParam: java.util.HashMap<String, Any>? = HashMap()
        requestParam!!["phoneNumberCountryCode"] = countryCode.trim()
        requestParam!!["username"] = phoneNumber.trim()
        return requestParam!!
    }
}