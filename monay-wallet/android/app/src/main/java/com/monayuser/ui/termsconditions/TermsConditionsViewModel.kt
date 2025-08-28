package com.monayuser.ui.termsconditions

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.TermsConditionsResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class TermsConditionsViewModel : BaseViewModel<TermsConditionsNavigator>() {

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

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call Terms&Condition API.
     */
    internal fun termsAPI(
        appPreference: AppPreference,
        cmsType: String?, slug: String?
    ) {
        navigator!!.showProgressBar()

        disposable.add(
            TermsConditionsResponse().doNetworkRequest(prepareRequestHashMap(
                cmsType, slug
            ),
                appPreference,
                object : NetworkResponseCallback<TermsConditionsResponse> {
                    override fun onResponse(termsConditionResponse: TermsConditionsResponse) {
                        try {
                            navigator!!.hideProgressBar()
                            if (termsConditionResponse.isSuccess) {
                                navigator!!.showResponseData(termsConditionResponse)
                            } else {
                                if (!termsConditionResponse.message.equals("")) {
                                    onServerError(termsConditionResponse.message)
                                } else {
                                    onServerError(termsConditionResponse.errorBean!!.message!!)
                                }
                            }

                        } catch (e: Exception) {
                            e.printStackTrace()
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
        type: String?, slug: String?
    ): HashMap<String, Any> {
        slug
        requestParam = HashMap()
        requestParam!!["userType"] = type!!
        return requestParam!!
    }
}