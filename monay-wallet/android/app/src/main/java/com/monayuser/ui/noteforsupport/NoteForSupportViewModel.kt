package com.monayuser.ui.noteforsupport

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.SupportResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class NoteForSupportViewModel : BaseViewModel<NoteForSupportNavigator>() {
    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun proceed() {
        navigator!!.proceed()
    }

    /**
     * This method is used to call Support API.
     */
    internal fun callSupportAPI(
        appPreferences: AppPreference, message:String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            SupportResponse().doNetworkRequest(prepareRequestHashMap(message),
                appPreferences,
                object : NetworkResponseCallback<SupportResponse> {
                    override fun onResponse(supportResponse: SupportResponse) {
                        navigator!!.hideProgressBar()
                        if (supportResponse.isSuccess) {
                            navigator!!.getSupportResponse(supportResponse)
                        } else {
                            if (!supportResponse.message.equals("")) {
                                onServerError(supportResponse.message)
                            } else {
                                onServerError(supportResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(message: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["message"] = message
        return requestParam!!
    }
}