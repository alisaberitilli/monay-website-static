package com.monayuser.ui.noteforsupport

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.view.Window
import android.view.inputmethod.EditorInfo
import androidx.core.content.ContextCompat
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.response.SupportResponse
import com.monayuser.databinding.ActivityNoteForSupportBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.ClickListener
import com.monayuser.utils.DialogUtils

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 17-jun-19.
 * Description : This class is used to reset new password
 */

class NoteForSupportActivity :
    BaseActivity<ActivityNoteForSupportBinding, NoteForSupportViewModel>(),
    NoteForSupportNavigator {

    var mChangePasswordViewModel: NoteForSupportViewModel = NoteForSupportViewModel()
    override val viewModel: NoteForSupportViewModel get() = mChangePasswordViewModel

    override val bindingVariable: Int get() = BR.noteForSupportVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_note_for_support

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@NoteForSupportActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mChangePasswordViewModel.navigator = this
        mChangePasswordViewModel.initView()
    }

    /**
     * This method is called when click on send button
     */
    override fun proceed() {
        if (!viewDataBinding!!.etMessage.text.toString().trim().equals("") && checkIfInternetOn()) {
            mChangePasswordViewModel.callSupportAPI(
                AppPreference.getInstance(this),
                viewDataBinding!!.etMessage.text.toString().trim()
            )
        } else {
            showValidationError(getStringResource(R.string.please_enter_message))
        }
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        val appPreferences = AppPreference.getInstance(this)
        viewDataBinding!!.etEmail.setText(appPreferences.getSavedUser(appPreferences).email)
        viewDataBinding!!.etMessage.setRawInputType(InputType.TYPE_CLASS_TEXT);
        viewDataBinding!!.etMessage.setImeActionLabel(
            getResources().getString(R.string.done),
            EditorInfo.IME_ACTION_DONE
        );
        viewDataBinding!!.etMessage.setImeOptions(EditorInfo.IME_ACTION_DONE);
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    /**
     * This method is used to hide progress bar
     */
    override fun hideProgressBar() {
        hideProgressDialog()
    }

    /**
     * This method is used to show progress bar
     */
    override fun showProgressBar() {
        showProgressDialog(this@NoteForSupportActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@NoteForSupportActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            finish()
        }

        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName = packageName // getPackageName() from Context or Activity object
            try {
                startActivity(
                    Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("market://details?id=$appPackageName")
                    )
                )
            } catch (anfe: android.content.ActivityNotFoundException) {
                startActivity(
                    Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://play.google.com/store/apps/details?id=$appPackageName")
                    )
                )
            }
        }
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@NoteForSupportActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getSupportResponse(supportResponse: SupportResponse) {
        DialogUtils.dialogWithEvent(
            this,
            resources.getString(R.string.support),
            supportResponse.message,
            ItemEventListener()
        )
    }
}