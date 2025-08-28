package com.monayuser.data

import com.jakewharton.retrofit2.adapter.rxjava2.HttpException
import com.monayuser.utils.AppConstants
import com.monayuser.utils.AppConstants.http_some_other_error
import com.monayuser.utils.NetworkResponseCallback
import com.monayuser.utils.ServerResponseHandler
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Response
import javax.net.ssl.SSLHandshakeException


object Parser {
    @Throws(Exception::class)
    fun parse(response: Response<ResponseBody>?, parseCallBack: ParseCallBack) {
        if (response != null && response.isSuccessful && response.code() == 200) {
            val output = ServerResponseHandler.getResponseBody(response)
            val `object` = JSONObject(output!!)
            if (`object`.optString("success").equals("true", ignoreCase = true)) {
                parseCallBack.onSuccess()
            } else if (`object`.optString("success").equals("false", ignoreCase = true)) {
                val temp = `object`.getJSONObject("error")
                parseCallBack.onServerError(temp.optString("message"))
            }
        } else if (response != null) {
            if (response.code() == 400 || response.code() == 500 || response.code() == 403 || response.code() == 404 || response.code() == 401) {
                if (response.code() == 401) {
                    val output = ServerResponseHandler.getResponseBody(response)
                    val `object` = JSONObject(output!!)
                    val errorObject = `object`.getJSONObject("error")
                    parseCallBack.onSessionExpire(errorObject.optString("message"))
                } else {
                    parseCallBack.onServerError(response.message())
                }
            } else {
                val responseStr = ServerResponseHandler.getResponseBody(response)
                val jsonObject = JSONObject(responseStr!!)
                parseCallBack.onServerError(ServerResponseHandler.checkJsonErrorBody(jsonObject))
            }
        }
    }

    fun parseErrorResponse(
        throwable: Throwable,
        networkResponseCallback: NetworkResponseCallback<*>
    ) {
        if (throwable is HttpException) {
            try {
                val response = throwable.response()
                when {
                    response.code() == 401 -> {
                        networkResponseCallback.onSessionExpire(
                            ServerResponseHandler.checkJsonErrorBody(
                                JSONObject(response.errorBody()!!.string())
                            )
                        )
                    }
                    response.code() == 403 -> {
                        networkResponseCallback.onUpdateAppVersion(
                            ServerResponseHandler.checkJsonErrorBody(
                                JSONObject(response.errorBody()!!.string())
                            )
                        )
                    }
                    response.code() == 500 -> {
//                        networkResponseCallback.onServerError(AppConstants.INTERNAL_SERVER_ERROR)
                        networkResponseCallback.onServerError(
                            ServerResponseHandler.checkJsonErrorBody(
                                JSONObject(response.errorBody()!!.string())
                            )
                        )
                    }
                    response.code() == 408 -> {
                        networkResponseCallback.onServerError(
                            "Request time out, please try again."
                        )
                    }
                    else -> {
                        val jsonObject = JSONObject(response.errorBody()!!.string())
                        networkResponseCallback.onServerError(
                            ServerResponseHandler.checkJsonErrorBody(
                                jsonObject
                            )
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                if (e is SSLHandshakeException) {
                    networkResponseCallback.onServerError("An SSL error has occurred and a secure connection to the server can not be made.")
                } else {
                    if (throwable.response().code() == 500)
                        networkResponseCallback.onServerError(AppConstants.INTERNAL_SERVER_ERROR)
                    else
                        networkResponseCallback.onServerError(http_some_other_error)
                }
            }

        } else if (throwable is SSLHandshakeException) {
            networkResponseCallback.onServerError("An SSL error has occurred and a secure connection to the server can not be made.")
        } else {
            networkResponseCallback.onServerError(http_some_other_error)
        }
    }

    interface ParseCallBack {
        fun onSuccess()

        fun onSessionExpire(msg: String)

        fun onServerError(msg: String)

        fun onAppVersionUpdate(msg: String)
    }
}
