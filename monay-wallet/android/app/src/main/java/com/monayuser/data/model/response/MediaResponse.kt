package com.monayuser.data.model.response

import android.net.Uri
import android.webkit.MimeTypeMap
import com.monayuser.data.Parser
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.MediaData
import com.monayuser.data.remote.ApiFactory
import com.monayuser.data.remote.ApiInterface
import com.monayuser.utils.AppConstants
import com.monayuser.utils.NetworkResponseCallback
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.Disposable
import io.reactivex.schedulers.Schedulers
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import java.io.File

class MediaResponse : BaseResponse<MediaResponse, String, Any>() {
    var data: MediaData? = null
    var requestParamRequestBody: HashMap<String, RequestBody>? = null
    var mFile: File? = null

    override fun doNetworkRequest(
        requestParam: HashMap<String, Any>,
        appPreferences: AppPreference,
        networkResponseCallback: NetworkResponseCallback<MediaResponse>
    ): Disposable {
        val api = ApiFactory.clientWithHeader.create(ApiInterface::class.java)
        mFile = File(requestParam[AppConstants.MEDIA_FILE].toString())
        requestParamRequestBody = HashMap<String, RequestBody>()
        if (mFile != null) {
                val selectedUri = Uri.fromFile(mFile)
                val fileExtension = MimeTypeMap.getFileExtensionFromUrl(selectedUri.toString())
                val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExtension)
                val reqBodyImageOfUser = RequestBody.create(mimeType!!.toMediaTypeOrNull(), mFile!!)

                requestParamRequestBody!!["file\"; filename=\"" + mFile!!.name + "\""] =
                    reqBodyImageOfUser

                if (!mFile!!.name.contains(".pdf")) {
                    requestParam[AppConstants.MEDIA_TYPE] = AppConstants.MEDIA_TYPE_IMAGE
                }
        }
        return api.uploadImage(
                "${AppConstants.BEARER} ${appPreferences.getSavedUser(
                    appPreferences
                ).token}",
                requestParam[AppConstants.MEDIA_FOR].toString(),
                requestParam[AppConstants.MEDIA_TYPE].toString(),
                requestParamRequestBody!!
            )
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                { networkResponseCallback.onResponse(it) },
                { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })
    }
}
