package com.monayuser.ui.faq

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.FAQResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class FaqViewModel : BaseViewModel<FaqNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity(){
        navigator!!.backToPreviousActivity()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call Terms&Condition API.
     */
    internal fun faqAPI(
        showProgress: Boolean, appPreference : AppPreference,
        userType: String?, offset: String, limit: String
    ) {
        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }

        disposable.add(
            FAQResponse().doNetworkRequest(prepareRequestHashMap(
                offset, limit, userType
            ),
                appPreference,
                object : NetworkResponseCallback<FAQResponse> {
                    override fun onResponse(faqResponse: FAQResponse) {
                        try {
                            navigator!!.hideProgressBar()
                            navigator!!.showHideLoader()
                            if (faqResponse.isSuccess) {
                                navigator!!.showResponseData(faqResponse)
                            } else {
                                if (!faqResponse.message.equals("")) {
                                    onServerError(faqResponse.message)
                                } else {
                                    onServerError(faqResponse.errorBean!!.message!!)
                                }
                            }

                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        navigator!!.onUpdateAppVersion(message)
                    }
                })
        )
    }

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMap(
        offset: String, limit: String, type: String?
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        requestParam!!["userType"] = type!!
        return requestParam!!
    }
}