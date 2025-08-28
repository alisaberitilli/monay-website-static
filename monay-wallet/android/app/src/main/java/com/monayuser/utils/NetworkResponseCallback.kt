package com.monayuser.utils

interface NetworkResponseCallback<T> {

    fun onResponse(data: T)

    fun onFailure(message: String)

    fun onServerError(error: String)

    fun onSessionExpire(error: String)

    fun onUpdateAppVersion(message: String)
}
