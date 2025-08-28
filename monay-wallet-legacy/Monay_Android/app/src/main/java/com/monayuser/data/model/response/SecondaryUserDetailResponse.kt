package com.monayuser.data.model.response

import com.monayuser.data.Parser
import com.monayuser.data.local.AppPreference
import com.monayuser.data.remote.ApiFactory
import com.monayuser.data.remote.ApiInterface
import com.monayuser.utils.AppConstants
import com.monayuser.utils.NetworkResponseCallback
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.Disposable
import io.reactivex.schedulers.Schedulers

class SecondaryUserDetailResponse : BaseResponse<SecondaryUserDetailResponse, String, Any>() {
    val data: SecondaryUserDetail? = null
    override fun doNetworkRequest(
        requestParam: HashMap<String, Any>,
        appPreference: AppPreference,
        networkResponseCallback: NetworkResponseCallback<SecondaryUserDetailResponse>
    ): Disposable {
        val api = ApiFactory.clientWithHeader.create(ApiInterface::class.java)
        var userId: String? = ""
        userId = requestParam["userId"].toString()
        requestParam.remove("userId")
        return api.secondaryUserDetailAPI(
            "${AppConstants.BEARER} ${
                appPreference.getSavedUser(
                    appPreference
                ).token
            }", userId
        )
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                { networkResponseCallback.onResponse(it) },
                { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) }
            )
    }
}