package com.monayuser.ui.kyc.dynamic_kyc

import android.content.Context
import android.net.Uri
import android.text.TextUtils
import android.util.Log
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.GetAllKYCDocumentsResponse
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.data.model.response.KYCResponse
import com.monayuser.data.model.response.MediaResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.AppConstants
import com.monayuser.utils.IoUtils
import com.monayuser.utils.NetworkResponseCallback
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream
import java.util.HashMap

class DynamicKYCViewModel : BaseViewModel<DynamicKYCNavigator>() {

    fun initView() {
        navigator!!.init()
    }

    fun clickOnBackButton() {
        navigator!!.clickOnBackButton()
    }

    fun clickOnPictureImageUpload() {
        navigator!!.clickOnPictureImageUpload()
    }

    fun clickOnPictureBackImageUpload() {
        navigator!!.clickOnPictureBackImageUpload()
    }

    fun clickOnAddressImageUpload() {
        navigator!!.clickOnAddressImageUpload()
    }

    fun clickOnAddressBackImageUpload() {
        navigator!!.clickOnAddressBackImageUpload()
    }

    fun clickOnSubmitButton() {
        navigator!!.clickOnSubmitButton()
    }

    fun callUpdateImageApi(
        mFile: File,
        appPreferences: AppPreference,
        userType: String,
        mediaType: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            MediaResponse().doNetworkRequest(prepareRequestHashMap(mFile, userType, mediaType),
                appPreferences,
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

    private fun prepareRequestHashMap(
        mFile: File?,
        userType: String,
        mediaType: String
    ): HashMap<String, Any> {
        val requestParam = java.util.HashMap<String, Any>()
        requestParam[AppConstants.MEDIA_FILE] = mFile!!
        requestParam[AppConstants.MEDIA_FOR] = userType
        requestParam[AppConstants.MEDIA_TYPE] = mediaType
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

    /**
     * This method is used to call KYC API.
     */
    internal fun uploadKYCApi(
        appPreferences: AppPreference,
        idProofName: String,
        idProofImage: String,
        idProofBackImage: String,
        addressProofName: String,
        addressProofImage: String,
        addressProofBackImage: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            KYCResponse().doNetworkRequest(prepareRequestHashMap(
                idProofName,
                idProofImage,
                idProofBackImage,
                addressProofName,
                addressProofImage, addressProofBackImage
            ),
                appPreferences,
                object : NetworkResponseCallback<KYCResponse> {
                    override fun onResponse(kycResponse: KYCResponse) {
                        navigator!!.hideProgressBar()
                        if (kycResponse.isSuccess) {
                             navigator!!.getKYCResponse(kycResponse)
                        } else {
                            if (!kycResponse.message.equals("")) {
                                onServerError(kycResponse.message)
                            } else {
                                onServerError(kycResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(
        idProofName: String,
        idProofImage: String,
        idProofBackImage: String,
        addressProofName: String,
        addressProofImage: String,
        addressProofBackImage: String
    ): HashMap<String, Any> {
        val requestParam: HashMap<String, Any> = HashMap()
        requestParam["idProofName"] = idProofName
        requestParam["idProofImage"] = idProofImage
        if (idProofBackImage.isNotEmpty() && idProofBackImage != "null" && idProofBackImage != null) {
            requestParam["idProofBackImage"] = idProofBackImage
        }
        requestParam["addressProofName"] = addressProofName
        requestParam["addressProofImage"] = addressProofImage
        if (addressProofBackImage.isNotEmpty() && addressProofBackImage != "null" && addressProofBackImage != null) {
            requestParam["addressProofBackImage"] = addressProofBackImage
        }
        Log.d("TAG", "prepareRequestHashMap: $requestParam")
        return requestParam
    }

    fun callGetAllKYCDocumentsApi(appPreference: AppPreference) {
        navigator!!.showProgressBar()
        val map = HashMap<String, String>()
        disposable.add(
            GetAllKYCDocumentsResponse().doNetworkRequest(prepareRequestHashMapForGetAllKYCDocuments(
                "+91"
            ),
                appPreference, object : NetworkResponseCallback<GetAllKYCDocumentsResponse> {
                    override fun onResponse(`object`: GetAllKYCDocumentsResponse) {
                        navigator!!.hideProgressBar()
                        if (`object`.isSuccess) {
                            Log.d("TAG", "onResponse:callGetAllKYCDocumentsApi: " + `object`)
                            navigator!!.getKycResponse(`object`)
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
                        navigator!!.showNetworkError(message)
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showNetworkError(error)
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
    private fun prepareRequestHashMapForGetAllKYCDocuments(
        countryCode: String
    ): HashMap<String, Any> {
        val requestParam: HashMap<String, Any> = HashMap()
        requestParam["countryCode"] = countryCode
        return requestParam
    }

    fun callGetProfileApi(appPreference: AppPreference) {
        navigator!!.showProgressBar()
        val map = HashMap<String, String>()
        disposable.add(
            GetUserProfileResponse().doNetworkRequest(map,
                appPreference, object : NetworkResponseCallback<GetUserProfileResponse> {
                    override fun onResponse(`object`: GetUserProfileResponse) {
                        navigator!!.hideProgressBar()
                        if (`object`.isSuccess) {
                            navigator!!.getProfileResponse(`object`)
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
                        navigator!!.showNetworkError(message)
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showNetworkError(error)
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

}