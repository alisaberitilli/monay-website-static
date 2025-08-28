package com.monayuser.fcm

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Color
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.ui.navigation.NavigationActivity
import com.monayuser.ui.splash.SplashActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.CommonUtils
import org.json.JSONObject

class FireBaseMessagingService : FirebaseMessagingService() {

    private var appPreference: AppPreference? = null

    override fun onNewToken(s: String) {
        super.onNewToken(s)
        Log.e("Refresh Token", s!!)
    }

    @SuppressLint("NewApi")
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        //create notification
        appPreference = AppPreference.getInstance(this)

        if (remoteMessage.data.isNotEmpty()) {
            val mapNotification = remoteMessage.data
            if (!isAppIsInBackground(this)) {
                createNotification(mapNotification)

                val jsonObject = JSONObject(mapNotification["message"].toString())
                val requestAcceptIntent = Intent(AppConstants.NEW_NOTIFICATION)
                requestAcceptIntent.putExtra("type", jsonObject["type"].toString())
                sendBroadcast(requestAcceptIntent)
            } else {
                createNotification(mapNotification)
            }
        }
    }

    private fun createNotification(mapNotification: Map<String, String>) {
        val jsonObject = JSONObject(mapNotification["message"].toString())

        val messageBody = jsonObject["message"].toString()
        val notificationTag = jsonObject.optString("badge").toInt()
        val notificationSoundURI = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val intentForNotification = Intent()
        intentForNotification.flags =
            Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TASK

        val mNotificationBuilder = NotificationCompat.Builder(this)

        if (!CommonUtils.isStringNullOrBlank(
                AppPreference.getInstance(this)
                    .getValue(PreferenceKeys.ACCESS_TOKEN)
            )
        ) {
            intentForNotification.setClass(this, NavigationActivity::class.java)
        } else {
            intentForNotification.setClass(this, SplashActivity::class.java)
        }

        intentForNotification.putExtra(AppConstants.NOTIFICATION, AppConstants.NOTIFICATION)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mNotificationBuilder.setSmallIcon(R.mipmap.ic_launcher)
            val bitmap = BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher)
            mNotificationBuilder.setColor(resources.getColor(R.color.transparent))
            mNotificationBuilder.setContentTitle(jsonObject["title"].toString())
            mNotificationBuilder.setLargeIcon(bitmap)
        } else {
            mNotificationBuilder.setSmallIcon(R.mipmap.ic_launcher)
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            notificationTag,
            intentForNotification,
            PendingIntent.FLAG_UPDATE_CURRENT
        )

        mNotificationBuilder.setContentTitle(jsonObject["title"].toString())
            .setStyle(NotificationCompat.BigTextStyle().bigText(messageBody))
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setSound(notificationSoundURI)
            .setNumber(notificationTag)
            .setContentIntent(pendingIntent)

        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (notificationTag > 1)
            notificationManager.cancel(
                (notificationTag - 1))

        val channelId = getString (R.string.notification_channel_id) // The id of the channel.
        mNotificationBuilder.setChannelId(channelId)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name: CharSequence =
                getString(R.string.app_name) // The user-visible name of the channel.
            val importance = NotificationManager.IMPORTANCE_HIGH
            val mChannel = NotificationChannel(channelId, name, importance)
            mChannel.enableLights(true)
            mChannel.enableVibration(true)
            mChannel.lightColor = Color.WHITE
            mChannel.setShowBadge(true)
            notificationManager.createNotificationChannel(mChannel)
        }

        notificationManager.notify(notificationTag, mNotificationBuilder.build())
    }

    @SuppressLint("NewApi")
    private fun isAppIsInBackground(context: Context): Boolean {
        var isInBackground = true
        val am =
            context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val runningProcesses =
            am.runningAppProcesses
        for (processInfo in runningProcesses) {
            if (processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                for (activeProcess in processInfo.pkgList) {
                    if (activeProcess == context.packageName) {
                        isInBackground = false
                    }
                }
            }
        }
        return isInBackground
    }
}