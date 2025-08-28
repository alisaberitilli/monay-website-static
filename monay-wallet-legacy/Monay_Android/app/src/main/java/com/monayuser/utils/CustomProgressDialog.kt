package com.monayuser.utils

import android.app.Dialog
import android.content.Context
import android.view.Gravity
import android.widget.TextView
import com.monayuser.R

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 01-Jul-19.
 * Description : This class is used to create custom progress dialog
 */

class CustomProgressDialog : Dialog {

    constructor(context: Context, theme: Int) : super(context, theme) {}

    companion object {
        fun show(context: Context, cancelable: Boolean, message: String): CustomProgressDialog {
            val dialog = CustomProgressDialog(context, R.style.CustomProgressDialog)
            dialog.setTitle("")
            dialog.setContentView(R.layout.custom_progress_dialog)
            dialog.setCancelable(cancelable)
            dialog.setCanceledOnTouchOutside(cancelable)
            val textOfLoader = dialog.findViewById(R.id.textOfLoader) as TextView
            val gifImage = dialog.findViewById(R.id.gif_image) as GifImageView
            gifImage.setGifImageResource(R.drawable.ic_splash_logo);
            textOfLoader.text = message
            dialog.window!!.attributes.gravity = Gravity.CENTER
            val lp = dialog.window!!.attributes
            lp.dimAmount = 0.4f
            dialog.window!!.attributes = lp
            return dialog
        }
    }
}
