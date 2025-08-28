package com.monayuser.ui.mycard

import android.view.View
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.AddCardResponse
import com.monayuser.data.model.response.DeleteCardResponse
import com.monayuser.data.model.response.GetCardListResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.CardValidator
import com.monayuser.utils.NetworkResponseCallback
import kotlinx.android.synthetic.main.dialog_add_new_card.view.*
import java.util.*

class MyCardViewModel : BaseViewModel<MyCardNavigator>() {

    private var requestParam: HashMap<String, Any>? = null

    fun initView() {
        navigator!!.init()
    }

    /**
     * This method is used to apply click event on fields.
     */
    fun openAddNewCard() {
        navigator!!.showAddNewCardDialog()
    }

    fun onBackPressFinish() {
        navigator!!.onBackPressFinish()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call add card API.
     */
    internal fun callAddCardAPI(
        appPreferences: AppPreference,
        cardHolderName: String,
        cardNumber: String,
        month: String,
        year: String,
        cvv: String,
        cardType: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            AddCardResponse().doNetworkRequest(prepareRequestHashMap(
                cardHolderName,
                cardNumber,
                month,
                year,
                cvv,
                cardType
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
        cardHolderName: String,
        cardNumber: String,
        month: String,
        year: String,
        cvv: String,
        cardType: String
    ): HashMap<String, Any> {
        cardType
        requestParam = HashMap()
        requestParam!!["cardNumber"] = cardNumber.replace("\\s".toRegex(), "").trim()
        requestParam!!["nameOnCard"] = cardHolderName.trim()
        requestParam!!["month"] = month.trim()
        requestParam!!["year"] = year.trim()
        requestParam!!["cvv"] = cvv.trim()
        return requestParam!!
    }

    /**
     * This method is used to apply card validation on fields.
     */
    fun checkCardValidation(view: View, month: String, year: String): Boolean {
        if (view.etCardHolderName.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.enter_name))
            view.etCardHolderName.requestFocus()
            return false
        }
        if (view.etCardNumber.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_card_number))
            view.etCardNumber.requestFocus()
            return false
        }
        if (!CardValidator.validateCardNumber(view.etCardNumber.text.toString())) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_card_number))
            view.etCardNumber.requestFocus()
            return false
        }
        if (month.isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_select_expiry_date))
            view.etMonth.requestFocus()
            return false
        }
        if (!CardValidator.validateExpiryDate(month, year)) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_select_valid_expiry_date))
            return false
        }
        if (view.etCvv.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_cvv))
            view.etCvv.requestFocus()
            return false
        }
        if (!CardValidator.validateCVV(
                view.etCvv.text.toString().trim(),
                CardValidator.getCardType(view.etCardNumber.text.toString())
            )
        ) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_correct_cvv))
            view.etCvv.requestFocus()
            return false
        }
        return true
    }

    /**
     * This method is used to call Get card List API.
     */
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
     * This method is used to call Delete card API.
     */
    internal fun callForDeleteCardAPI(
        appPreferences: AppPreference,
        cardId: String,
        position: Int
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            DeleteCardResponse().doNetworkRequest(prepareRequestHashMapForDeleteCard(cardId),
                appPreferences,
                object : NetworkResponseCallback<DeleteCardResponse> {
                    override fun onResponse(deleteCardResponse: DeleteCardResponse) {
                        navigator!!.hideProgressBar()

                        if (deleteCardResponse.isSuccess) {
                            navigator!!.deleteCardResponse(deleteCardResponse, position)
                        } else {
                            if (!deleteCardResponse.message.equals("")) {
                                onServerError(deleteCardResponse.message)
                            } else {
                                onServerError(deleteCardResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMapForDeleteCard(cardId: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["cardId"] = cardId
        return requestParam!!
    }
}