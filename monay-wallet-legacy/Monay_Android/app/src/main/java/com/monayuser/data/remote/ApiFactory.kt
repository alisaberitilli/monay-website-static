package com.monayuser.data.remote

import android.os.Build
import com.google.gson.GsonBuilder
import com.jakewharton.retrofit2.adapter.rxjava2.RxJava2CallAdapterFactory
import com.monayuser.BuildConfig
import com.monayuser.utils.AppConstants
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.*
import java.util.concurrent.TimeUnit


object ApiFactory {

    private var retrofitWithHeader: Retrofit? = null

    val clientWithHeader: Retrofit
        get() {
            val httpClientBuilder = OkHttpClient.Builder()
            httpClientBuilder.addInterceptor { chain ->

                val original = chain.request()
                val requestBuilder = original.newBuilder()
                requestBuilder.addHeader("Accept", "application/json")
                requestBuilder.addHeader("timezone", TimeZone.getDefault().id)
                requestBuilder.addHeader("app-version", "${BuildConfig.VERSION_NAME}")
                requestBuilder.addHeader("device-id", AppConstants.ANDROID_DEVICE_ID)
                requestBuilder.addHeader("device-model", Build.MODEL)
                requestBuilder.addHeader("os-version", Build.VERSION.RELEASE)
                val request = requestBuilder.build()

                chain.proceed(request)
            }

            httpClientBuilder.connectTimeout(5, TimeUnit.MINUTES)
            httpClientBuilder.readTimeout(5, TimeUnit.MINUTES)
            httpClientBuilder.writeTimeout(5, TimeUnit.MINUTES)

            val loggingInterceptor = HttpLoggingInterceptor()
            loggingInterceptor.level = HttpLoggingInterceptor.Level.BODY
            httpClientBuilder.addInterceptor(loggingInterceptor)

            if (retrofitWithHeader == null) {
                val gson = GsonBuilder().setLenient().create()
                retrofitWithHeader = Retrofit.Builder()
                    .baseUrl(BuildConfig.BASE_URL)
                    .client(httpClientBuilder.build())
                    .addConverterFactory(GsonConverterFactory.create(gson))
                    .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
                    .build()
            }
            return retrofitWithHeader!!
        }
}
