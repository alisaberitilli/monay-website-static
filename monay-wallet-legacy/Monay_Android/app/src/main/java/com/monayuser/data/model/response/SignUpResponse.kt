package com.monayuser.data.model.response

import com.monayuser.data.Parser
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.remote.ApiFactory
import com.monayuser.data.remote.ApiInterface
import com.monayuser.utils.NetworkResponseCallback
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.Disposable
import io.reactivex.schedulers.Schedulers
import java.util.HashMap

class SignUpResponse : BaseResponse<SignUpResponse, String, Any>() {

    var data: LoginBean? = null
    override fun doNetworkRequest(
        requestParam: HashMap<String, Any>,
        appPreference: AppPreference,
        networkResponseCallback: NetworkResponseCallback<SignUpResponse>
    ): Disposable {
        val api = ApiFactory.clientWithHeader.create(ApiInterface::class.java)
        var userType = ""
        userType = requestParam["userType"].toString()
        requestParam.remove("userType")
        if (userType == "user") {
            return api.userSignUp(requestParam)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    { networkResponseCallback.onResponse(it) },
                    { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })
        }
        else if (userType == "secondaryUser")
        {
            return api.userSignUp(requestParam)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    { networkResponseCallback.onResponse(it) },
                    { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })

        }
       else {
            return api.vendorSignUp(requestParam)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    { networkResponseCallback.onResponse(it) },
                    { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })
        }
    }
}
