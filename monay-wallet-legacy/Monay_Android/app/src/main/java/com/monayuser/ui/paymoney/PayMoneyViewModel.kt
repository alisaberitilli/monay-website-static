package com.monayuser.ui.paymoney

import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.databinding.ActivityPayMoneyBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CardValidator
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class PayMoneyViewModel : BaseViewModel<PayMoneyNavigator>() {

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

    fun checkValidation(viewDataBinding: ActivityPayMoneyBinding): Boolean {
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

    fun checkCardValidation(
        viewDataBinding: ActivityPayMoneyBinding,
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
            GetCardListResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreferences,
                object : NetworkResponseCallback<GetCardListResponse> {
                    override fun onResponse(getCardListResponse: GetCardListResponse) {
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

    internal fun callWalletAPI(
        appPreference: AppPreference
    ) {
        disposable.add(
            WalletResponse().doNetworkRequest(prepareRequestHashMap(),
                appPreference,
                object : NetworkResponseCallback<WalletResponse> {
                    override fun onResponse(walletResponse: WalletResponse) {
                        try {
                            if (walletResponse.isSuccess) {
                                navigator!!.getWalletResponse(walletResponse)
                            } else {
                                if (!walletResponse.message.equals("")) {
                                    onServerError(walletResponse.message)
                                } else {
                                    onServerError(walletResponse.errorBean!!.message!!)
                                }
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }

                    override fun onFailure(message: String) {
                        navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onServerError(error: String) {
                        if (error != null && error != "")
                            navigator!!.showValidationError(error)
                        else
                            navigator!!.showValidationError(navigator!!.getStringResource(R.string.http_some_other_error))
                    }

                    override fun onSessionExpire(error: String) {
                        navigator!!.showSessionExpireAlert()
                    }

                    override fun onUpdateAppVersion(message: String) {
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