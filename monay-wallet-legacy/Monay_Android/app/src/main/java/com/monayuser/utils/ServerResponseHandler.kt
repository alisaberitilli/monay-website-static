package com.monayuser.utils

import androidx.annotation.StringRes
import com.monayuser.MyApplication

import okhttp3.ResponseBody
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Response
import java.io.BufferedReader
import java.io.InputStreamReader

object ServerResponseHandler {

    /*** method for get string resource ***/
    private fun getString(@StringRes stringId: Int): String {
        return MyApplication.getInstance()!!.getString(stringId)
    }

    fun checkJsonErrorBody(jobject: JSONObject): String {
        try {
            if (jobject.has("error")) {
                val error = jobject.get("error")
                return getJsonErrorBody(error, jobject)
            } else {
                return jobject.optString("message")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return ""
    }

    fun getResponseBody(response: Response<ResponseBody>): String? {
        var reader: BufferedReader? = null
        var output: String? = null
        try {
            if (response.body() != null) {
                reader = BufferedReader(InputStreamReader(response.body()!!.byteStream()))
            } else if (response.errorBody() != null) {
                reader = BufferedReader(InputStreamReader(response.errorBody()!!.byteStream()))
            }
            output = reader!!.readLine()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return output
    }

    fun errorResponseHandler(
        output: String,
        response: Response<ResponseBody>,
        mNetworkResponseCallback: NetworkResponseCallback<*>
    ) {
        val output: String
        if (response.code() == 400 || response.code() == 500 || response.code() == 403 || response.code() == 404 || response.code() == 401) {
            output = ServerResponseHandler.getResponseBody(response)!!
            var outobject: JSONObject? = null
            try {
                outobject = JSONObject(output)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            val jsonArray = outobject!!.optJSONArray(AppConstants.ERROR)
            if (jsonArray == null) {
                if (response.code() == 401) {
                    val s = ServerResponseHandler.checkJsonErrorBody(outobject)
                    mNetworkResponseCallback.onSessionExpire(s)
                } else {
                    mNetworkResponseCallback.onServerError(
                        ServerResponseHandler.checkJsonErrorBody(
                            outobject
                        )
                    )
                }

            } else {
                mNetworkResponseCallback.onServerError(
                    ServerResponseHandler.checkJsonErrorBody(
                        jsonArray.optJSONObject(
                            0
                        )
                    )
                )
            }
        } else {
            val responseStr = ServerResponseHandler.getResponseBody(response)
            var jsonObject: JSONObject? = null
            try {
                jsonObject = JSONObject(responseStr)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            mNetworkResponseCallback.onServerError(
                ServerResponseHandler.checkJsonErrorBody(
                    jsonObject!!
                )
            )
        }
    }

    private fun getJsonErrorBody(error: Any, jobject: JSONObject): String {
        try {
            if (error is JSONObject) {
                var message = ""
                var name = ""
                var field = ""
                if (error.has("field"))
                    field = error.optString("field")

                if (error.has("message")) {
                    val msgObj = error.get("message")
                    if (msgObj is JSONObject) {
                        name = msgObj.optString("name")
                        message = msgObj.optString("message")
                    } else {
                        message = error.optString("message")
                    }
                } else {
                    try {
                        message = jobject.optString("message")
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
                return message
            } else if (error is JSONArray) {

                try {
                    return error.getJSONObject(0).optString("message")
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        } catch (je: Exception) {
            je.printStackTrace()
        }
        return ""
    }
}
