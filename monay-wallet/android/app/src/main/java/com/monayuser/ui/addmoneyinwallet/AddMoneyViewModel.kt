package com.monayuser.ui.addmoneyinwallet

import android.view.View
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.response.AddCardResponse
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.databinding.ActivityAddMoneyBinding
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CardValidator
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class AddMoneyViewModel : BaseViewModel<AddMoneyNavigator>() {
    private var requestParam: HashMap<String, Any>? = null
    private var amountTxt: String? = ""

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

    fun proceedToAddMoney() {
        navigator!!.proceedToAddMoney()
    }

    fun showAddNewCardDialog() {
        navigator!!.showAddNewCardDialog()
    }

    fun checkValidation(
        viewDataBinding: ActivityAddMoneyBinding,
        cardId: String,
        cardStatus: Boolean
    ): Boolean {
        amountTxt = viewDataBinding.moneyEt.text.trim().toString()
        if (viewDataBinding.moneyEt.text.trim().toString().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_amount))
            viewDataBinding.moneyEt.requestFocus()
            return false
        }

        if (!CommonUtils.isValidNumeric(viewDataBinding.moneyEt.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_amount_))
            viewDataBinding.moneyEt.requestFocus()
            return false
        }

        if (cardId == "" && cardStatus) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_select_card))
            return false
        }
        return true
    }

    internal fun callForGetCardListAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            GetCardListResponse().doNetworkRequest(prepareRequestHashMapForGetCard(),
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

    /**
     * This method is used to send parameter on server.
     */
    private fun prepareRequestHashMapForGetCard(): HashMap<String, Any> {
        requestParam = HashMap()
        return requestParam!!
    }

    /**
     * This method is used to call add card API.
     */
    internal fun callAddCardAPI(
        appPreferences: AppPreference,
        cardBean: CardBean
    ) {

        navigator!!.showProgressBar()
        disposable.add(
            AddCardResponse().doNetworkRequest(prepareRequestHashMap(
                cardBean
            ),
                appPreferences,
                object : NetworkResponseCallback<AddCardResponse> {
                    override fun onResponse(addCardResponse: AddCardResponse) {
                        navigator!!.hideProgressBar()

                        if (addCardResponse.isSuccess) {
                            navigator!!.addCardResponse(addCardResponse)
                        } else {
                            if (!addCardResponse.message.equals("")) {
                                onServerError(addCardResponse.message)
                            } else {
                                onServerError(addCardResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(
        cardBean: CardBean
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["cardNumber"] = cardBean.cardNumber!!.replace("\\s".toRegex(), "").trim()
        requestParam!!["nameOnCard"] = cardBean.nameOnCard!!
        requestParam!!["month"] = cardBean.month!!
        requestParam!!["year"] = cardBean.year!!
        requestParam!!["cvv"] = cardBean.cvv
        return requestParam!!
    }

    /**
     * This method is used to apply card validation on fields.
     */
    fun checkCardValidation(view: View, month: String, year: String): Boolean {
        if (view.findViewById<android.widget.EditText>(R.id.etCardHolderName).text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_name))
            view.findViewById<android.widget.EditText>(R.id.etCardHolderName).requestFocus()
            return false
        }

        if (view.findViewById<android.widget.EditText>(R.id.etCardNumber).text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_card_number))
            view.findViewById<android.widget.EditText>(R.id.etCardNumber).requestFocus()
            return false
        }

        if (view.findViewById<android.widget.EditText>(R.id.etCardNumber).text.toString().length < 12 || view.findViewById<android.widget.EditText>(R.id.etCardNumber).text.toString().length > 19) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_card_number))
            view.findViewById<android.widget.EditText>(R.id.etCardNumber).requestFocus()
            return false
        }

        if (month.isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_select_expiry_date))
            view.findViewById<android.widget.EditText>(R.id.etMonth).requestFocus()
            return false
        }

        if (view.findViewById<android.widget.EditText>(R.id.etCvv).text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_cvv))
            view.findViewById<android.widget.EditText>(R.id.etCvv).requestFocus()
            return false
        }

        if (view.findViewById<android.widget.EditText>(R.id.etCvv).text.toString().trim().length != 3) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_correct_cvv))
            view.findViewById<android.widget.EditText>(R.id.etCvv).requestFocus()
            return false
        }
        return true
    }

    /**
     * This method is used to apply card validation on fields.
     */
    fun checkCardValidationNew(
        viewDataBinding: ActivityAddMoneyBinding,
        cardId: String,
        cardStatus: Boolean,
        month: String,
        year: String
    ): Boolean {
        amountTxt = viewDataBinding.moneyEt.text.trim().toString()
        if (viewDataBinding.moneyEt.text.trim().toString().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_amount))
            viewDataBinding.moneyEt.requestFocus()
            return false
        }

        if (!CommonUtils.isValidNumeric(viewDataBinding.moneyEt.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_amount_))
            viewDataBinding.moneyEt.requestFocus()
            return false
        }

        if (cardId == "" && cardStatus) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_select_card))
            return false
        }

        if (viewDataBinding!!.cardHolderNameEt.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_name))
            viewDataBinding!!.cardHolderNameEt.requestFocus()
            return false
        }

        if (viewDataBinding!!.cardNumberEt.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_card_number))
            viewDataBinding!!.cardNumberEt.requestFocus()
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

        if (viewDataBinding!!.cardCVV.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_cvv))
            viewDataBinding!!.cardCVV.requestFocus()
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
        return true
    }
}