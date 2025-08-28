package com.monayuser.ui.mybankaccounts

import android.view.View
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.AddBankResponse
import com.monayuser.data.model.response.DeleteBankResponse
import com.monayuser.data.model.response.GetBankListResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class BankAccountsViewModel : BaseViewModel<BankAccountsNavigator>() {

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

    fun openBankAccountPopup() {
        navigator!!.openBankAccountPopup()
    }

    fun tryAgain() {
        navigator!!.tryAgain()
    }

    /**
     * This method is used to call add bank API.
     */
    internal fun callAddBankAPI(
        appPreferences: AppPreference,
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        holderName: String,
        swiftCode: String
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            AddBankResponse().doNetworkRequest(prepareRequestHashMap(
                accountNumber,
                bankName,
                routingNumber,
                holderName,
                swiftCode
            ),
                appPreferences,
                object : NetworkResponseCallback<AddBankResponse> {
                    override fun onResponse(addBankResponse: AddBankResponse) {
                        navigator!!.hideProgressBar()

                        if (addBankResponse.isSuccess) {
                            navigator!!.addBankResponse(addBankResponse)
                        } else {
                            if (!addBankResponse.message.equals("")) {
                                onServerError(addBankResponse.message)
                            } else {
                                onServerError(addBankResponse.errorBean!!.message!!)
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
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        holderName: String,
        swiftCode: String
    ): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["accountNumber"] = accountNumber.trim()
        requestParam!!["bankName"] = bankName.trim()
        requestParam!!["routingNumber"] = routingNumber.trim()
        requestParam!!["accountHolderName"] = holderName.trim()
        requestParam!!["swiftCode"] = swiftCode.trim()
        return requestParam!!
    }

    /**
     * This method is used to apply bank validation on fields.
     */
    fun checkBankValidation(view: View): Boolean {
        if (view.et_holder_name.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_account_holder_name))
            view.et_holder_name.requestFocus()
            return false
        }
        if (view.et_bank_name.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_bank_name))
            view.et_bank_name.requestFocus()
            return false
        }
        if (view.et_account_no.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_bank_account_number))
            view.et_account_no.requestFocus()
            return false
        }
        if (view.et_routing_no.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_routing_number))
            view.et_routing_no.requestFocus()
            return false
        }
        if (view.et_routing_no.text.toString().length < 9) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_routing_number))
            view.et_routing_no.requestFocus()
            return false
        }
        return true
    }
    fun checkBankINValidation(view: View): Boolean {
        if (view.et_holder_name.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_account_holder_name))
            view.et_holder_name.requestFocus()
            return false
        }
        if (view.et_bank_name.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_bank_name))
            view.et_bank_name.requestFocus()
            return false
        }
        if (view.et_account_no.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_bank_account_number))
            view.et_account_no.requestFocus()
            return false
        }
        if (view.et_ifsc_no.text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_ifsc_number))
            view.et_ifsc_no.requestFocus()
            return false
        }
        return true
    }

    /**
     * This method is used to call Get Bank List API.
     */
    internal fun callForGetBankListAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            GetBankListResponse().doNetworkRequest(prepareRequestHashMapForGetBank(),
                appPreferences,
                object : NetworkResponseCallback<GetBankListResponse> {
                    override fun onResponse(getBankListResponse: GetBankListResponse) {
                        navigator!!.hideProgressBar()

                        if (getBankListResponse.isSuccess) {
                            navigator!!.getBankListResponse(getBankListResponse)
                        } else {
                            if (!getBankListResponse.message.equals("")) {
                                onServerError(getBankListResponse.message)
                            } else {
                                onServerError(getBankListResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMapForGetBank(): HashMap<String, Any> {
        requestParam = HashMap()
        return requestParam!!
    }

    /**
     * This method is used to call Delete bank API.
     */
    internal fun callForDeleteBankAPI(
        appPreferences: AppPreference,
        bankId: String,
        position: Int
    ) {
        navigator!!.showProgressBar()
        disposable.add(
            DeleteBankResponse().doNetworkRequest(prepareRequestHashMapForDeleteBank(bankId),
                appPreferences,
                object : NetworkResponseCallback<DeleteBankResponse> {
                    override fun onResponse(deleteBankResponse: DeleteBankResponse) {
                        navigator!!.hideProgressBar()

                        if (deleteBankResponse.isSuccess) {
                            navigator!!.deleteBankResponse(deleteBankResponse, position)
                        } else {
                            if (!deleteBankResponse.message.equals("")) {
                                onServerError(deleteBankResponse.message)
                            } else {
                                onServerError(deleteBankResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMapForDeleteBank(bankId: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["bankId"] = bankId
        return requestParam!!
    }
}