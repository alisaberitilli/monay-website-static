package com.monayuser.ui.paymoneyfromprimarywallet

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.data.model.response.PrimaryUserListResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.databinding.ActivityPayMoneyBinding
import com.monayuser.databinding.ActivityPayMoneyFromPrimaryBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CardValidator
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class PayMoneyFromPrimaryViewModel : BaseViewModel<PayMoneyFromPrimaryNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    private var amountTxt: String? = ""
    private var messageTxt: String? = ""
    private var cardNumberTxt: String? = ""
    private var nameOnCardTxt: String? = ""
    private var exMonthTxt: String? = ""
    private var exYearTxt: String? = ""
    private var cvvTxt: String? = ""

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun backToPreviousActivity() {
        navigator!!.backToPreviousActivity()
    }

    fun successToSentMoney() {
        navigator!!.successToSentMoney()
    }

    fun checkValidation(viewDataBinding: ActivityPayMoneyFromPrimaryBinding): Boolean {
        amountTxt = viewDataBinding.amountEt.text.trim().toString()
        messageTxt = viewDataBinding.messageEt.text.trim().toString()
        if (viewDataBinding.amountEt.text.trim().toString().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_amount))
            viewDataBinding.amountEt.requestFocus()
            return false
        }

        if (!CommonUtils.isValidNumeric(viewDataBinding.amountEt.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_amount_))
            viewDataBinding.amountEt.requestFocus()
            return false
        }
        return true
    }


    internal fun callPrimaryAccountListAPI(showProgress:Boolean, appPreferences: AppPreference, offset:String, limit:String) {
        if (showProgress) {
            navigator!!.showPageLoader()
        } else {
            navigator!!.showProgressBar()
        }
        disposable.add(
            PrimaryUserListResponse().doNetworkRequest(prepareRequestHashMapForGetCard(offset,limit),
                appPreferences,
                object : NetworkResponseCallback<PrimaryUserListResponse> {
                    override fun onResponse(getListResponse: PrimaryUserListResponse) {
                        navigator!!.hideProgressBar()
                        navigator!!.showHideLoader()
                        if (getListResponse.isSuccess) {
                            navigator!!.getPrimaryUserListResponse(getListResponse)
                        } else {
                            if (!getListResponse.message.equals("")) {
                                onServerError(getListResponse.message)
                            } else {
                                onServerError(getListResponse.errorBean!!.message!!)
                            }
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
    private fun prepareRequestHashMapForGetCard(offset: String,limit: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["offset"] = offset
        requestParam!!["limit"] = limit
        return requestParam!!
    }
}