@file:Suppress("DEPRECATION")
package com.monayuser.utils
import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Build
import android.view.View
import android.view.Window
import android.view.animation.AlphaAnimation
import android.view.animation.AnimationSet
import android.widget.*
import cn.pedant.SweetAlert.OptAnimationLoader
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.ui.login.LoginActivity
import com.monayuser.ui.splash.SplashActivity
import java.util.*


object DialogUtils {

    private var pDialog: CustomProgressDialog? = null

    /*** method for show progress dialog ***/

    fun showProgressDialog(context: Context, loadingText: String) {
        try {
            pDialog = CustomProgressDialog.show(context, false, loadingText)
            if (pDialog != null && !pDialog!!.isShowing) {
                pDialog!!.show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

    }

    /*** method for hide progress dialog ***/
    fun hideProgressDialog() {
        try {
            if (pDialog != null) {
                if (pDialog!!.isShowing) {
                    pDialog!!.hide()
                }
                if (pDialog!!.isShowing) {
                    pDialog!!.dismiss()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

    }


    fun showAlertDialogWithListener(
        mContext: Context, type: String, msg: String,
        listener: EvenListener
    ) : Dialog? {
        try {
            val dialog1 = Dialog(mContext, R.style.alert_dialog)
            dialog1.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog1.setContentView(R.layout.dialog_internet)
            dialog1.setCancelable(false)
            dialog1.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog1.setCanceledOnTouchOutside(false)
            val mErrorFrame = dialog1.findViewById<View>(R.id.error_frame) as FrameLayout
            val mErrorX = mErrorFrame.findViewById<View>(R.id.error_x) as ImageView
            val tvOk = dialog1.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog1.findViewById<View>(R.id.message) as TextView
            val titleText = dialog1.findViewById<View>(R.id.titleText) as TextView
            tvMessage.text = msg
            if (type == "Error") {
                mErrorFrame.visibility = View.VISIBLE
                titleText.text = mContext.resources.getString(R.string.oops)
                val mErrorInAnim = OptAnimationLoader.loadAnimation(mContext, R.anim.error_frame_in)
                val mErrorXInAnim =
                    OptAnimationLoader.loadAnimation(mContext, R.anim.error_x_in) as AnimationSet
                mErrorFrame.startAnimation(mErrorInAnim)
                mErrorX.startAnimation(mErrorXInAnim)

                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
                    val childAnims = mErrorXInAnim.animations
                    var idx = 0
                    while (idx < childAnims.size) {
                        if (childAnims[idx] is AlphaAnimation) {
                            break
                        }
                        idx++
                    }
                    if (idx < childAnims.size) {
                        childAnims.removeAt(idx)
                    }
                }
            } else {
                mErrorFrame.visibility = View.GONE
                titleText.text = mContext.resources.getString(R.string.oops)
            }
            tvOk.setOnClickListener {
                listener.onsuccessEvent()
                dialog1.dismiss() }
            dialog1.show()
            return dialog1

        } catch (e: Exception) {
            e.printStackTrace()
        }
        return null
    }
    /*** method for show error dialog msg such as network, any msg ***/

    fun showAlertDialog(mContext: Context, type: String, msg: String): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)
            val mErrorFrame = dialog.findViewById<View>(R.id.error_frame) as FrameLayout
            val mErrorX = mErrorFrame.findViewById<View>(R.id.error_x) as ImageView
            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView
            tvMessage.text = msg
            if (type == "Error") {
                mErrorFrame.visibility = View.VISIBLE
                titleText.text = mContext.resources.getString(R.string.oops)
                val mErrorInAnim = OptAnimationLoader.loadAnimation(mContext, R.anim.error_frame_in)
                val mErrorXInAnim =
                    OptAnimationLoader.loadAnimation(mContext, R.anim.error_x_in) as AnimationSet
                mErrorFrame.startAnimation(mErrorInAnim)
                mErrorX.startAnimation(mErrorXInAnim)

                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
                    val childAnims = mErrorXInAnim.animations
                    var idx = 0
                    while (idx < childAnims.size) {
                        if (childAnims[idx] is AlphaAnimation) {
                            break
                        }
                        idx++
                    }
                    if (idx < childAnims.size) {
                        childAnims.removeAt(idx)
                    }
                }
            } else {
                mErrorFrame.visibility = View.GONE
                titleText.text = mContext.resources.getString(R.string.oops)
            }
            tvOk.setOnClickListener { dialog.dismiss() }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }

    fun showAlertDialog(mContext: Context, type: String, msg: String, title: String): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)
            val mErrorFrame = dialog.findViewById<View>(R.id.error_frame) as FrameLayout
            val mErrorX = mErrorFrame.findViewById<View>(R.id.error_x) as ImageView
            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView
            tvMessage.text = msg
            if (type == "Error") {
                mErrorFrame.visibility = View.VISIBLE
                titleText.text = title;
                val mErrorInAnim = OptAnimationLoader.loadAnimation(mContext, R.anim.error_frame_in)
                val mErrorXInAnim =
                    OptAnimationLoader.loadAnimation(mContext, R.anim.error_x_in) as AnimationSet
                mErrorFrame.startAnimation(mErrorInAnim)
                mErrorX.startAnimation(mErrorXInAnim)

                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
                    val childAnims = mErrorXInAnim.animations
                    var idx = 0
                    while (idx < childAnims.size) {
                        if (childAnims[idx] is AlphaAnimation) {
                            break
                        }
                        idx++
                    }
                    if (idx < childAnims.size) {
                        childAnims.removeAt(idx)
                    }
                }
            } else {
                mErrorFrame.visibility = View.GONE
                titleText.text = title;
            }
            tvOk.setOnClickListener { dialog.dismiss() }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }


    fun showFacebookDialog(mContext: Context, type: String, msg: String): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)
            val mErrorFrame = dialog.findViewById<View>(R.id.error_frame) as FrameLayout
            mErrorFrame.findViewById<View>(R.id.error_x) as ImageView
            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView
            tvMessage.text = msg

            mErrorFrame.visibility = View.GONE
            titleText.text = type

            tvOk.setOnClickListener { dialog.dismiss() }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }


    /*** method for show session expire dialog  ***/

    fun sessionExpireDialog(mContext: Activity): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)
            val mErrorFrame = dialog.findViewById<View>(R.id.error_frame) as FrameLayout
            val mErrorX = mErrorFrame.findViewById<View>(R.id.error_x) as ImageView
            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val title = dialog.findViewById<View>(R.id.titleText) as TextView
//            tvMessage.text = mContext.resources.getString(R.string.unauthorize_access)

            tvMessage.text = mContext.resources.getString(R.string.login_proceed)
            title.text = mContext.resources.getString(R.string.session_expired)
            mErrorFrame.visibility = View.VISIBLE
            val mErrorInAnim = OptAnimationLoader.loadAnimation(mContext, R.anim.error_frame_in)
            val mErrorXInAnim =
                OptAnimationLoader.loadAnimation(mContext, R.anim.error_x_in) as AnimationSet
            mErrorFrame.startAnimation(mErrorInAnim)
            mErrorX.startAnimation(mErrorXInAnim)

            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
                val childAnims = mErrorXInAnim.animations
                var idx = 0
                while (idx < childAnims.size) {
                    if (childAnims[idx] is AlphaAnimation) {
                        break
                    }
                    idx++
                }
                if (idx < childAnims.size) {
                    childAnims.removeAt(idx)
                }
            }
            tvOk.setOnClickListener {
                dialog.dismiss()
                val lang = AppPreference.getInstance(mContext).getValue(PreferenceKeys.APP_LANGUAGE)
                AppPreference.getInstance(mContext).clearSharedPreference()
                //SharedPreferencesTools.clearSharedPreferenceTools()
                AppPreference.getInstance(mContext).addValue(PreferenceKeys.APP_LANGUAGE, lang!!)
                CommonUtils.clearAllActivity(mContext, SplashActivity::class.java)
            }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }

    /*** method for show logout dialog  ***/

    fun onLogoutDialog(
        mContext: Context,
        title: String,
        message: String,
        submitMsg: String,
        cancleMsg: String,
        listener: EvenListener
    ) {
        try {
            val dialog = Dialog(mContext)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)
            dialog.getWindow()!!.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            dialog.setContentView(R.layout.dialog_log_out)
            //dialog.window!!.setWindowAnimations(R.style.Animation_WindowSlideUpDown)
            val headerTV = dialog.findViewById(R.id.textview__header) as TextView
            val messageTV = dialog.findViewById(R.id.textview__messages) as TextView
            headerTV.text = title
            messageTV.text = message
            val submit = dialog.findViewById(R.id.button_ok) as TextView
            val cancel = dialog.findViewById(R.id.button_cancel) as TextView
            submit.text = submitMsg
            cancel.text = cancleMsg
            submit.setOnClickListener {
                dialog.dismiss()
                if (title.equals(mContext.resources.getString(R.string.exit_alert))) {
                    listener.onExitApplication()
                } else {
                    listener.onSignout()
                }
            }
            cancel.setOnClickListener { dialog.dismiss() }
            dialog.show()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /*** method for show logout dialog  ***/

    fun onDeleteDialog(
        mContext: Context,
        title: String,
        message: String,
        submitMsg: String,
        cancleMsg: String,
        listener: EvenListener
    ) {
        try {
            val dialog = Dialog(mContext)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)
            dialog.getWindow()!!.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            dialog.setContentView(R.layout.dialog_log_out)
            val headerTV = dialog.findViewById(R.id.textview__header) as TextView
            val messageTV = dialog.findViewById(R.id.textview__messages) as TextView
            headerTV.text = title
            messageTV.text = message
            val submit = dialog.findViewById(R.id.button_ok) as TextView
            val cancel = dialog.findViewById(R.id.button_cancel) as TextView
            submit.text = submitMsg
            cancel.text = cancleMsg
            submit.setOnClickListener {
                dialog.dismiss()
                listener.ondeleteAccount()
            }
            cancel.setOnClickListener { dialog.dismiss() }
            dialog.show()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun onFinishExercise(
        mContext: Context,
        title: String,
        message: String,
        submitMsg: String,
        cancleMsg: String,
        listener: EvenListener
    ) {
        try {
            val dialog = Dialog(mContext)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)
            dialog.getWindow()!!.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            dialog.setContentView(R.layout.dialog_log_out)
            val headerTV = dialog.findViewById(R.id.textview__header) as TextView
            val messageTV = dialog.findViewById(R.id.textview__messages) as TextView
            headerTV.text = title
            messageTV.text = message
            val submit = dialog.findViewById(R.id.button_ok) as TextView
            val cancel = dialog.findViewById(R.id.button_cancel) as TextView
            submit.text = submitMsg
            cancel.text = cancleMsg
            submit.setOnClickListener {
                dialog.dismiss()
                listener.ondeleteAccount()
            }
            cancel.setOnClickListener { dialog.dismiss() }
            dialog.show()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }


    /*** method for show dialog when getting success response from api with button click event ***/

    fun dialogWithEvent(
        mContext: Activity,
        header: String,
        msg: String,
        listener: EvenListener
    ): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)

            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView

            titleText.text = header;
            tvMessage.text = msg


            tvOk.setOnClickListener {
                dialog.dismiss()
                listener.onsuccessEvent()
            }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }

    fun dialogWithOTPEvent(
        mContext: Activity,
        header: String,
        msg: String,
        listener: EvenListener
    ): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)

            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView

            titleText.text = header;
            tvMessage.text = msg


            tvOk.setOnClickListener {
                dialog.dismiss()
                listener.onYes()
            }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }

    fun dialogWithoutEvent(
        mContext: Activity,
        header: String,
        msg: String
    ): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)

            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView

            titleText.text = header;
            tvMessage.text = msg


            tvOk.setOnClickListener {
                dialog.dismiss()
            }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }


    /*** method for show dialog when getting success response from api with button click event ***/

    fun dialogForceUpdate(
        mContext: Activity,
        header: String,
        msg: String,
        listener: EvenListener
    ): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(false)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(false)

            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView

            titleText.text = header;
            tvMessage.text = msg


            tvOk.setOnClickListener {
                dialog.dismiss()
                listener.onForceUpdate()
            }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }


    /*** method for show dialog when getting success response from api with button click event ***/

    fun dialogResetDate(
        mContext: Activity,
        header: String,
        msg: String,
        listener: EvenListener
    ): Dialog? {

        try {
            val dialog = Dialog(mContext, R.style.alert_dialog)
            dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
            dialog.setContentView(R.layout.dialog_internet)
            dialog.setCancelable(true)
            dialog.window!!.attributes.windowAnimations = R.style.ZoomDialogAnimation
            dialog.setCanceledOnTouchOutside(true)

            val tvOk = dialog.findViewById<View>(R.id.confirm_button) as TextView
            val tvMessage = dialog.findViewById<View>(R.id.message) as TextView
            val titleText = dialog.findViewById<View>(R.id.titleText) as TextView

            titleText.text = header;
            tvMessage.text = msg


            tvOk.setOnClickListener {
                dialog.dismiss()
                listener.onResetDate()
            }
            dialog.show()
            return dialog

        } catch (e: Exception) {
            e.printStackTrace()
        }

        return null
    }



    fun showAlertDialogNew(
        header: String?,
        message: String,
        context: Context,
        onConfirmedListener: OnConfirmedListener?
    ) {

        val alertDialog = Dialog(context)
        alertDialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        alertDialog.setCanceledOnTouchOutside(false)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            Objects.requireNonNull<Window>(alertDialog.window)
                .setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        }
        alertDialog.setContentView(R.layout.dialog_internet)
        alertDialog.setCancelable(false)
        // alertDialog.show();
        val tvMessage = alertDialog.findViewById<TextView>(R.id.message)
        val tvHeader = alertDialog.findViewById<TextView>(R.id.titleText)
        if (header != null && !header.isEmpty()) {
            tvHeader.visibility = View.VISIBLE
            tvHeader.text = context.getString(R.string.app_name)
        } else {
            tvHeader.visibility = View.GONE
        }
        val buttonOk = alertDialog.findViewById<Button>(R.id.confirm_button)
        tvMessage.text = message
        buttonOk.setOnClickListener { view ->
            if (onConfirmedListener != null) {
                onConfirmedListener.onConfirmed()
                alertDialog.dismiss()
            }
            alertDialog.dismiss()
        }
        if (!alertDialog.isShowing) {
            alertDialog.show()
        }
    }

    interface OnConfirmedListener {
        fun onConfirmed()
    }
}