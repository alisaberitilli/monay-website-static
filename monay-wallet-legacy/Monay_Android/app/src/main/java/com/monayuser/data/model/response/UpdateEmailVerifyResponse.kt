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
import java.util.HashMap

class UpdateEmailVerifyResponse : BaseResponse<UpdateEmailVerifyResponse, String, Any>() {
    override fun doNetworkRequest(
        requestParam: HashMap<String, Any>,
        appPreference: AppPreference,
        networkResponseCallback: NetworkResponseCallback<UpdateEmailVerifyResponse>
    ): Disposable {
        val api = ApiFactory.clientWithHeader.create(ApiInterface::class.java)
        return api.verifyUpdateEmailApi(
            "${AppConstants.BEARER} ${appPreference.getSavedUser(appPreference).token}",
            requestParam
        )
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                { networkResponseCallback.onResponse(it) },
                { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })
    }
}