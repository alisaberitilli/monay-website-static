package com.monayuser.data.model.response

import android.net.Uri
import android.webkit.MimeTypeMap
import com.monayuser.data.Parser
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.LoginBean
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
import java.lang.Exception

class UpdateProfileResponse : BaseResponse<UpdateProfileResponse, String, Any>() {
    var requestParamRequestBody: HashMap<String, RequestBody>? = null
    var mFile: File? = null
    var data: LoginBean? = null

    override fun doNetworkRequest(
        requestParam: HashMap<String, Any>,
        appPreference: AppPreference,
        networkResponseCallback: NetworkResponseCallback<UpdateProfileResponse>
    ): Disposable {
        val api = ApiFactory.clientWithHeader.create(ApiInterface::class.java)

        mFile = File(requestParam[AppConstants.MEDIA_FILE].toString())
        requestParam.remove(AppConstants.MEDIA_FILE)
        requestParamRequestBody = HashMap<String, RequestBody>()
        if (mFile != null) {
            try {
                val selectedUri = Uri.fromFile(mFile)
                val fileExtension = MimeTypeMap.getFileExtensionFromUrl(selectedUri.toString())
                val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExtension)
                val reqBodyImageOfUser = RequestBody.create(mimeType!!.toMediaTypeOrNull(), mFile!!)

                requestParamRequestBody!!["profile_image\"; filename=\"" + mFile!!.name + "\""] =
                    reqBodyImageOfUser
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        var iterator = requestParam.iterator()
        while (iterator.hasNext()) {
            var item = iterator.next()
            requestParamRequestBody!![item.key] =
                RequestBody.create("text/plain".toMediaTypeOrNull(), item.value.toString())
        }
        return api.updateProfileAPI(
                "${AppConstants.BEARER} ${appPreference.getSavedUser(appPreference).token}",
                requestParamRequestBody!!
            )
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                { networkResponseCallback.onResponse(it) },
                { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })
    }
}