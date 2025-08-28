package com.monayuser.ui.requestwithdrawal

import android.view.View
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.AddBankResponse
import com.monayuser.data.model.response.GetBankListResponse
import com.monayuser.data.model.response.RequestWithdrawalResponse
import com.monayuser.data.model.response.WalletResponse
import com.monayuser.ui.base.BaseViewModel
import com.monayuser.utils.NetworkResponseCallback
import java.util.*

class RequestWithdrawalViewModel : BaseViewModel<RequestWithdrawalNavigator>() {

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

    fun clickOnSendRequest() {
        navigator!!.clickOnSendRequest()
    }

    fun openBankAccountPopup() {
        navigator!!.openBankAccountPopup()
    }

    /**
     * This method is used to call Request Withdrawal API.
     */
    internal fun requestWithdrawalAPI(
        appPreferences: AppPreference,
        amount: String,
        bankId: String
    ) {
        navigator!!.showProgressBar()

        disposable.add(
            RequestWithdrawalResponse().doNetworkRequest(prepareRequestHashMap(amount, bankId),
                appPreferences,
                object : NetworkResponseCallback<RequestWithdrawalResponse> {
                    override fun onResponse(requestWithdrawalResponse: RequestWithdrawalResponse) {
                        navigator!!.hideProgressBar()
                        if (requestWithdrawalResponse.isSuccess) {
                            navigator!!.getWithdrawalMoneyResponse(requestWithdrawalResponse)
                        } else {
                            if (!requestWithdrawalResponse.message.equals("")) {
                                onServerError(requestWithdrawalResponse.message)
                            } else {
                                onServerError(requestWithdrawalResponse.errorBean!!.message!!)
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
    private fun prepareRequestHashMap(amount: String, bankId: String): HashMap<String, Any> {
        requestParam = HashMap()
        requestParam!!["bankId"] = bankId
        requestParam!!["amount"] = amount.trim()
        return requestParam!!
    }


    /**
     * This method is used to call Get Bank List API.
     */
    internal fun callForGetBankListAPI(appPreferences: AppPreference) {
        navigator!!.showProgressBar()
        disposable.add(
            GetBankListResponse().doNetworkRequest(prepareRequestHashMap(),
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
     * This method is used to call Wallet API.
     */
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
        if (view.findViewById<android.widget.EditText>(R.id.et_holder_name).text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_account_holder_name))
            view.findViewById<android.widget.EditText>(R.id.et_holder_name).requestFocus()
            return false
        }
        if (view.findViewById<android.widget.EditText>(R.id.et_bank_name).text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_bank_name))
            view.findViewById<android.widget.EditText>(R.id.et_bank_name).requestFocus()
            return false
        }
        if (view.findViewById<android.widget.EditText>(R.id.et_account_no).text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_bank_account_number))
            view.findViewById<android.widget.EditText>(R.id.et_account_no).requestFocus()
            return false
        }
        if (view.findViewById<android.widget.EditText>(R.id.et_routing_no).text.toString().trim().isEmpty()) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_routing_number))
            view.findViewById<android.widget.EditText>(R.id.et_routing_no).requestFocus()
            return false
        }
        if (view.findViewById<android.widget.EditText>(R.id.et_routing_no).text.toString().length < 9) {
            navigator!!.showValidationError(navigator!!.getStringResource(R.string.please_enter_valid_routing_number))
            view.findViewById<android.widget.EditText>(R.id.et_routing_no).requestFocus()
            return false
        }
        return true
    }
}