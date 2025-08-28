package com.monayuser.ui.showmycode

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Window
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.databinding.ActivityShowMyCodeNewBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils

class ShowMyCodeActivity : BaseActivity<ActivityShowMyCodeNewBinding, MyCodeViewModel>(),
    MyCodeNavigator {

    var myCodeViewModel: MyCodeViewModel = MyCodeViewModel()
    override val bindingVariable: Int get() = BR.myCodeVM
    override val viewModel: MyCodeViewModel get() = myCodeViewModel
    lateinit var appPreferences: AppPreference

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_show_my_code_new

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@ShowMyCodeActivity, R.color.white)
        }
        super.onCreate(savedInstanceState)
        appPreferences = AppPreference.getInstance(this@ShowMyCodeActivity)
        myCodeViewModel.navigator = this
        myCodeViewModel.initView()
    }

    /**
     * This method is used to initialize variable and call a API.
     */
    override fun init() {
        if (appPreferences.getSavedUser(appPreferences).profilePictureUrl != null && !appPreferences.getSavedUser(
                appPreferences
            ).profilePictureUrl.equals("")
        ) {
            CommonUtils.showProfile(
                this,
                appPreferences.getSavedUser(appPreferences).profilePictureUrl,
                viewDataBinding!!.ivUser
            )
        }

        viewDataBinding!!.tvName.setText(
            "${appPreferences.getSavedUser(appPreferences).firstName} ${appPreferences.getSavedUser(
                appPreferences
            ).lastName}"
        )

        viewDataBinding!!.tvNumber.text =
            "${appPreferences.getSavedUser(appPreferences).phoneNumberCountryCode} ${appPreferences.getSavedUser(
                appPreferences
            ).phoneNumber}"

        viewDataBinding!!.tvEmail.text = appPreferences.getSavedUser(appPreferences).email

        try {
            if (!CommonUtils.isStringNullOrBlank(appPreferences.getSavedUser(appPreferences).qrCodeUrl)) {
                Glide.with(this).load(appPreferences.getSavedUser(appPreferences).qrCodeUrl)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().placeholder(R.mipmap.ic_scan_qr).dontAnimate())
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .apply(RequestOptions.noTransformation())
                    .into(viewDataBinding!!.icQr)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * This method is called when click on back button
     */
    override fun backToPreviousActivity() {
        finish()
    }

    override fun openScanner() {
        onBackPressed()
    }

    /**
     * This method is called when click on edit profile button
     */
    override fun openEditProfile() {
        openEditProfile(this@ShowMyCodeActivity)
    }

    /**
     * This method is called when click on share QR button
     */
    override fun shareQRCOde() {
        Toast.makeText(
            this@ShowMyCodeActivity,
            "will share the QR code by Native share",
            Toast.LENGTH_SHORT
        ).show()
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
        showProgressDialog(this@ShowMyCodeActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@ShowMyCodeActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@ShowMyCodeActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            // This function is called when click on OK button
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
}