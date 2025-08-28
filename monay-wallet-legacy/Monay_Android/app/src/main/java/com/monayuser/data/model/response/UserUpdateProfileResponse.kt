package com.monayuser.data.model.response

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
import java.util.HashMap

class UserUpdateProfileResponse : BaseResponse<UserUpdateProfileResponse, String, Any>() {

    var data: LoginBean? = null
    override fun doNetworkRequest(
        requestParam: HashMap<String, Any>,
        appPreference: AppPreference,
        networkResponseCallback: NetworkResponseCallback<UserUpdateProfileResponse>
    ): Disposable {
        val api = ApiFactory.clientWithHeader.create(ApiInterface::class.java)
        if (appPreference.getSavedUser(appPreference).userType == "user" || appPreference.getSavedUser(appPreference).userType.equals(AppConstants.SECONDARY_SIGNUP)) {
            return api.updateUserProfileAPI(
                    "${AppConstants.BEARER} ${appPreference.getSavedUser(
                        appPreference
                    ).token}", requestParam
                )
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    { networkResponseCallback.onResponse(it) },
                    { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })
        } else {
            return api.updateVendorProfileAPI(
                    "${AppConstants.BEARER} ${appPreference.getSavedUser(
                        appPreference
                    ).token}", requestParam
                )
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                    { networkResponseCallback.onResponse(it) },
                    { throwable -> Parser.parseErrorResponse(throwable, networkResponseCallback) })
        }
    }
}