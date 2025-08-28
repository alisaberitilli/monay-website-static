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

class SetAutoTopUpAmountResponse : BaseResponse<SetAutoTopUpAmountResponse, String, Any>() {
    val data: SecondaryUserDetail? = null
    override fun doNetworkRequest(
        requestParam: HashMap<String, Any>,
        appPreference: AppPreference,
        networkResponseCallback: NetworkResponseCallback<SetAutoTopUpAmountResponse>
    ): Disposable {
        val api = ApiFactory.clientWithHeader.create(ApiInterface::class.java)
        var userId: String? = ""
        userId = requestParam["userId"].toString()
        requestParam.remove("userId")
        return api.setPrimaryAutoTopUp(
            "${AppConstants.BEARER} ${
                appPreference.getSavedUser(
                    appPreference
                ).token
            }", requestParam
        )
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                { networkResponseCallback.onResponse(it) },
                { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) }
            )
    }
}