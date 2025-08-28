package com.monayuser.data.model.base

import com.monayuser.utils.NetworkResponseCallback
import com.monayuser.data.local.AppPreference
import java.io.Serializable
import kotlin.collections.HashMap

abstract class BaseModel<S, T> : Serializable {

    /**
     * Do network request.
     *
     * @param requestParam            the request param
     * @param laSupportPreference     the la support preference
     * @param networkResponseCallback the network response callback
     */
    abstract fun doNetworkRequest(
        requestParam: HashMap<String, String>, appPreference: AppPreference,
        networkResponseCallback: NetworkResponseCallback<Any>
    )
}
