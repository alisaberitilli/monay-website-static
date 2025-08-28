package com.monayuser.ui.autotopup

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.*
import com.monayuser.databinding.ActivityAddAutoPopupBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.AppConstants
import com.monayuser.utils.CardValidator
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class AutoTopUpViewModel : BaseViewModel<AutoTopUpNavigator>() {

    private var requestParam: HashMap<String, Any>? = null
    private var minAmountTxt: String? = ""
    private var refillAmountTxt: String? = ""
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

    fun enableDisablePopup(){
        navigator!!.enableDisablePopup()
    }

    fun successToSentMoney() {
        navigator!!.successToSentMoney()
    }

    fun checkValidation(viewDataBinding: ActivityAddAutoPopupBinding): Boolean {
        minAmountTxt = viewDataBinding.minAmountEt.text.trim().toString()
        refillAmountTxt = viewDataBinding.refillAmountEt.text.trim().toString()
        messageTxt = ""//viewDataBinding.messageEt.text.trim().toString()
        if (viewDataBinding.minAmountEt.text.trim().toString().isEmpty() ) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_minmum_amount))
            viewDataBinding.minAmountEt.requestFocus()
            return false
        }

        if (viewDataBinding.refillAmountEt.text.trim().toString().isEmpty() ) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_minmum_amount))
            viewDataBinding.refillAmountEt.requestFocus()
            return false
        }
        if (!CommonUtils.isValidNumeric(viewDataBinding.minAmountEt.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_refill_amount))
            viewDataBinding.minAmountEt.requestFocus()
            return false
        }
        if (!CommonUtils.isValidNumeric(viewDataBinding.refillAmountEt.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_refill_amount))
            viewDataBinding.refillAmountEt.requestFocus()
            return false
        }
        return true
    }

    fun checkCardValidation(
        viewDataBinding: ActivityAddAutoPopupBinding,
        month: String,
        year: String
    ): Boolean {
        cardNumberTxt = viewDataBinding!!.cardNumberEt.text?.trim().toString()
        nameOnCardTxt = viewDataBinding!!.cardHolderNameEt.text!!.trim().toString()
        cvvTxt = viewDataBinding!!.cardCVV.text!!.trim().toString()

        if (viewDataBinding!!.cardHolderNameEt.text!!.trim().toString().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_name))
            viewDataBinding.cardHolderNameEt.requestFocus()
            return false
        }
        if (viewDataBinding!!.cardNumberEt.text?.trim().toString().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_card_number))
            viewDataBinding.cardNumberEt.requestFocus()
            return false
        }
        if (!CardValidator.validateCardNumber(viewDataBinding!!.cardNumberEt.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_card_number))
            viewDataBinding!!.cardNumberEt.requestFocus()
            return false
        }
        if (month.isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_select_expiry_date))
            return false
        }
        if (!CardValidator.validateExpiryDate(month, year)) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_select_valid_expiry_date))
            return false
        }
        if (viewDataBinding!!.cardCVV.text!!.trim().toString().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_cvv))
            viewDataBinding.cardCVV.requestFocus()
            return false
        }
        if (!CardValidator.validateCVV(
                viewDataBinding!!.cardCVV.text.toString().trim(),
                CardValidator.getCardType(viewDataBinding!!.cardNumberEt.text.toString())
            )
        ) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_correct_cvv))
            viewDataBinding!!.cardCVV.requestFocus()
            return false
        }
        navigator!!.validationResponse(
            cardNumberTxt.toString().replace("\\s".toRegex(), "").trim(),
            nameOnCardTxt.toString(), exMonthTxt.toString(), exYearTxt.toString(), cvvTxt.toString()
        )
        return true
    }

    internal fun callForGetCardListAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            GetCardListAutoTopUpResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreferences,
                object : NetworkResponseCallback<GetCardListAutoTopUpResponse> {
                    override fun onResponse(getCardListResponse: GetCardListAutoTopUpResponse) {
                        navigator!!.hideProgressBar()
                        if (getCardListResponse.isSuccess) {
                            navigator!!.getCardListResponse(getCardListResponse)
                        } else {
                            if (!getCardListResponse.message.equals("")) {
                                onServerError(getCardListResponse.message)
                            } else {
                                onServerError(getCardListResponse.errorBean!!.message!!)
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

    private fun prepareRequestHashMapActiveInactive(enableDisable: String): HashMap<String, Any> {
        requestParam = HashMap()
        if(enableDisable.equals(AppConstants.ACTIVE)){
            requestParam!!["autoToupStatus"] = "true"
        }else{
            requestParam!!["autoToupStatus"] = "false"
        }
        return requestParam!!
    }

    internal fun setAutoTopUpEnableDisable(appPreferences: AppPreference, enableDisable:String,enableDisableBoolean: Boolean) {
        navigator!!.showProgressBar()
        disposable.add(
            AutoTopUpEnableDisableResponse().doNetworkRequest(prepareRequestHashMapActiveInactive(enableDisable),
                appPreferences,
                object : NetworkResponseCallback<AutoTopUpEnableDisableResponse> {
                    override fun onResponse(response: AutoTopUpEnableDisableResponse) {
                        navigator!!.hideProgressBar()
                        if (response.isSuccess) {
                            navigator!!.AutoTopEnableDisableSuccessfully(response,enableDisableBoolean)
                        } else {
                            if (!response.message.equals("")) {
                                onServerError(response.message)
                            } else {
                                onServerError(response.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(): HashMap<String, Any> {
        requestParam = HashMap()
        return requestParam!!
    }
}