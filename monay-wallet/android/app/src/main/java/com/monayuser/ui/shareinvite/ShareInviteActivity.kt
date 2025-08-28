package com.monayuser.ui.shareinvite

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.Window
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.google.android.gms.tasks.Task
import com.google.firebase.dynamiclinks.DynamicLink
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks
import com.google.firebase.dynamiclinks.ShortDynamicLink
import com.google.gson.Gson
import com.monayuser.BR
import com.monayuser.BuildConfig
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.databinding.ActivitySettingsBinding
import com.monayuser.databinding.ActivityShareInviteBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.supportcategory.SupportCategoryActivity
import com.monayuser.utils.*

class ShareInviteActivity : BaseActivity<ActivityShareInviteBinding, ShareInviteViewModel>(),
    ShareInviteNavigator {

    var mShareInviteViewModel: ShareInviteViewModel =
        ShareInviteViewModel()
    override val viewModel: ShareInviteViewModel get() = mShareInviteViewModel
    override val bindingVariable: Int get() = BR.shareInviteVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_share_invite

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@ShareInviteActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        mShareInviteViewModel.navigator = this
        mShareInviteViewModel.initView()
    }

    /**
     * This method is called when click on back button
     */
    override fun clickOnBackButton() {
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
        showProgressDialog(this@ShareInviteActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@ShareInviteActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    override fun clickOnShareInviteButton() {
        initFireBaseDeepLink()
    }

   var userName: String? = null
    /*   var userIdGlobal: Int? = null*/
    var referralCodeGlobal: String? = null
    private var deepLinkToShare = ""
    /**
     * This method is used for create firebase dynamic link for sharing
     */
    private fun initFireBaseDeepLink() {
        try {
            if (CommonUtils.isInternetOn(this@ShareInviteActivity)) {
                //http://xenon.codiantdev.com/detail?carId=$carId&carName=$carName&come_from_screen=$comeFromScreen

               //var userName = userName!!.substringBefore("/").trim()

                val linkFirebase =  FirebaseConstants.FIREBASE_DEEP_LINK_URL + FirebaseConstants.QUESTION_MARK + FirebaseConstants.DEEP_LINK_REFERRAL_CODE + FirebaseConstants.EQUALS_TO.toString() + referralCodeGlobal +
                           FirebaseConstants.AMPERSAND + FirebaseConstants.DEEP_LINK_USER_NAME + FirebaseConstants.EQUALS_TO + userName //+ FirebaseConstants.AMPERSAND

                println("====linkFirebase>>>========="+linkFirebase)
                //+ FirebaseConstants.DEEP_LINK_COME_FROM_SCREEN +
                          //  FirebaseConstants.EQUALS_TO + AppConstants.MY_GARAGE_ACTIVITY
                Log.e(AppConstants.LOG_CAT,"Link for fire base share product ====>> \$linkFirebase")
                val domainUriPrefix =
                    FirebaseConstants.SCHEME_HTTPS + FirebaseConstants.COLON_DOUBLE_SLASH + getString(
                        R.string.deep_link_host
                    )
                Log.e(
                    AppConstants.LOG_CAT,
                    "domainUriPrefix OTHER USER PROFILE ====>> \$domainUriPrefix"
                )
                val dynamicLinksLong: DynamicLink = FirebaseDynamicLinks.getInstance()
                    .createDynamicLink()
                    .setLink(Uri.parse(linkFirebase))
                    .setDomainUriPrefix(domainUriPrefix)
                    .setAndroidParameters(
                        DynamicLink.AndroidParameters.Builder(BuildConfig.APPLICATION_ID).build()
                    )
                    .setIosParameters(
                        DynamicLink.IosParameters.Builder(FirebaseConstants.IOS_BUNDLE_IDENTIFIER)
                            .setAppStoreId(FirebaseConstants.IOS_APP_ID).build()
                    )
                    .buildDynamicLink()
                Log.e(
                    AppConstants.LOG_CAT,
                    "  DynamicLinks  LONG  for other user profile ====>> \${dynamicLinksLong.uri.toString()} "
                )
                val longLinkToAppend: String = dynamicLinksLong.uri.toString() +
                        FirebaseConstants.AMPERSAND + FirebaseConstants.EFR + FirebaseConstants.EQUALS_TO + FirebaseConstants.ONE +
                        FirebaseConstants.AMPERSAND + FirebaseConstants.OFL + FirebaseConstants.EQUALS_TO + FirebaseConstants.FIREBASE_DEEP_LINK_URL +
                        FirebaseConstants.SINGLE_FORWARD_SLASH
                Log.e(
                    AppConstants.LOG_CAT,
                    "  DynamicLinks  LONG  After append for other user profile  ====>> \${longLinkToAppend} "
                )

                val shortLinkTask: Task<ShortDynamicLink> =
                    FirebaseDynamicLinks.getInstance().createDynamicLink()
                        .setLink(Uri.parse(linkFirebase))
                        .setLongLink(Uri.parse(longLinkToAppend))
                        .setDomainUriPrefix(domainUriPrefix)
                        .setAndroidParameters(
                            DynamicLink.AndroidParameters.Builder(BuildConfig.APPLICATION_ID)
                                .build()
                        )
                        .setIosParameters(
                            DynamicLink.IosParameters.Builder(FirebaseConstants.IOS_BUNDLE_IDENTIFIER)
                                .setAppStoreId(
                                    FirebaseConstants.IOS_APP_ID
                                ).build()
                        )
                        .buildShortDynamicLink()
                        .addOnCompleteListener { task ->
                            if (task != null) {
                                if (task.result != null) {
                                    if (task.result!!.shortLink != null) {
                                        //  String shortLink = task.getResult().getShortLink();
                                        deepLinkToShare =
                                            task.result!!.shortLink.toString()

                                        CommonUtils.defaultShareItemsDeepLink(
                                            this@ShareInviteActivity, deepLinkToShare
                                        )

                                        Log.e(
                                            AppConstants.LOG_CAT,
                                            "ShortLink to share OTHER USER PROFILE  ====>> " + deepLinkToShare.toString()
                                        )
                                    }
                                }
                            }
                        }


                /*  addOnCompleteListener(
                        this,
                        new OnCompleteListener<ShortDynamicLink> {

                    @Override
                    onComplete(task: Task<ShortDynamicLink>) {

                        if (task != null) {
                            if (task.result != null) {
                                if (task.result!!.shortLink != null) {
                                    val shortLink = task.result!!.shortLink
                                            deepLinkToShare = task.result!!.shortLink.toString()
                                    Log.e(
                                            AppConstants.LOG_CAT,
                                            "ShortLink to share OTHER USER PROFILE  ====>> " + shortLink.toString());
                                    )
                                }
                            }
                        }


                    }
                })*/
            }
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(this@ShareInviteActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun init() {
        // This method is used to initialize an variable and call a function.
        if (checkIfInternetOn()) {
            mShareInviteViewModel.callGetProfileApi(AppPreference.getInstance(this@ShareInviteActivity))
        }
    }

    inner class ItemEventListener : ClickListener() {
        override fun ondeleteAccount() {
            // This method is called when click on delete button
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


    override fun getProfileResponse(getUserProfileResponse: GetUserProfileResponse) {
        var loginBean = getUserProfileResponse.data!!
        var appPreference = AppPreference.getInstance(this@ShareInviteActivity)
        var user: LoginBean = appPreference.getSavedUser(appPreference)


        referralCodeGlobal = user.referralCode

        userName = user.firstName+" "+user.lastName

        loginBean.token = user.token
        val userString = Gson().toJson(loginBean)
        appPreference.addValue(PreferenceKeys.USER_DATA, userString)

        try {
            if (!CommonUtils.isStringNullOrBlank(appPreference.getSavedUser(appPreference).qrCodeUrl)) {
                Glide.with(this).load(appPreference.getSavedUser(appPreference).qrCodeUrl)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .apply(RequestOptions.noTransformation())
                    .into(viewDataBinding!!.icQr)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}