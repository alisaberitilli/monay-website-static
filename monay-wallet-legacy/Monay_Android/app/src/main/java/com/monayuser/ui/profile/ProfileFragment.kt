package com.monayuser.ui.profile

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.transition.TransitionInflater
import android.view.View
import android.widget.Toast
import androidx.core.app.ActivityOptionsCompat
import androidx.core.util.Pair
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.google.gson.Gson
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.response.GetUserProfileResponse
import com.monayuser.databinding.FragmentProfileBinding
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.editprofile.EditProfileActivity
import com.monayuser.ui.mybankaccounts.BankAccountsActivity
import com.monayuser.ui.withdrawal.WithdrawalActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils


class ProfileFragment : BaseFragment<FragmentProfileBinding, ProfileViewModel>(),
    ProfileNavigator {

    var mProfileViewModel: ProfileViewModel = ProfileViewModel()

    override val bindingVariable: Int
        get() = BR.profileVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.fragment_profile

    override val viewModel: ProfileViewModel
        get() = mProfileViewModel

    /**
     * This method is main method of class
     */

    companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment DetailFragment.
         */
        fun newInstance() = ProfileFragment()
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mProfileViewModel.navigator = this
        mProfileViewModel.initView()
       sharedElementEnterTransition = TransitionInflater.from(activity).inflateTransition(R.transition.ch_fragment_transition)
        sharedElementReturnTransition = TransitionInflater.from(activity).inflateTransition(R.transition.ch_fragment_transition)
        viewDataBinding!!.ivUser.setTransitionName("imagePass")
    }

    override fun openSecuritySetup() {
        openSecuritySetup(activity!!)
    }

    override fun clickOnShareCode() {
        val sendIntent = Intent()
        sendIntent.action = Intent.ACTION_SEND
        sendIntent.putExtra(Intent.EXTRA_SUBJECT, getString(R.string.app_name))

        sendIntent.putExtra(
            Intent.EXTRA_TEXT,
            AppPreference.getInstance(requireContext())
                .getSavedUser(AppPreference.getInstance(requireContext())).qrCodeUrl
        )
        sendIntent.type = "text/plain"
        startActivity(Intent.createChooser(sendIntent, "Share via"))
    }

    override fun openEditProfile() {
        val intent = Intent(requireContext(), EditProfileActivity::class.java)
        val p1 =
            Pair.create(
                viewDataBinding!!.ivUser as View?,
                "send_image"
            )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            val options =
                ActivityOptionsCompat.makeSceneTransitionAnimation(activity!!, p1)
            startActivityForResult(intent,2 ,options.toBundle())
        } else {
            startActivityForResult(intent,2)
        }


    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK && requestCode == 2) {
            callUserData()
        } else if (resultCode == 201 && requestCode == 2 && checkIfInternetOn()) {
            mProfileViewModel.callGetProfileApi(AppPreference.getInstance(requireContext()))
        }
    }

    override fun openMyCard() {
        openMyCard(activity!!)
    }

    override fun myWallet() {
        openMyWallet(activity!!)
    }

    override fun openWithdrawalHistory() {
        val intent = Intent(requireContext(), WithdrawalActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun openMyBankAccounts() {
        val intent = Intent(requireContext(), BankAccountsActivity::class.java)
        startActivity(intent)
        requireActivity().overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            activity!!,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        if (checkIfInternetOn()) {
            mProfileViewModel.callGetProfileApi(AppPreference.getInstance(requireContext()))
        }


        val userType = AppPreference.getInstance(activity!!).getValue(PreferenceKeys.USER_TYPE)

        if (userType.equals(AppConstants.SECONDARY_SIGNUP)) {
            viewDataBinding!!.tvKycStatus.visibility = View.GONE
            viewDataBinding!!.icQr.visibility = View.GONE
            viewDataBinding!!.progress.visibility = View.GONE
            viewDataBinding!!.tvAskToScan.visibility = View.GONE
            viewDataBinding!!.btnShareCode.visibility = View.GONE
        }
    }

    override fun tryAgain() {
        // This method is called when click on try again button
    }

    private fun callUserData() {
        val appPreferences = AppPreference.getInstance(requireContext())
        if (appPreferences.getSavedUser(appPreferences).profilePictureUrl != null && !appPreferences.getSavedUser(
                appPreferences
            ).profilePictureUrl.equals("")
        ) {
            CommonUtils.showProfile(
                requireContext(),
                appPreferences.getSavedUser(appPreferences).profilePictureUrl,
                viewDataBinding!!.ivUser
            )
        }

        viewDataBinding!!.tvCustId.visibility = View.VISIBLE
        viewDataBinding!!.tvCustId.text = "Cust ID ${appPreferences.getSavedUser(appPreferences).accountNumber}"

        viewDataBinding!!.tvName.text =
            "${appPreferences.getSavedUser(appPreferences).firstName} ${appPreferences.getSavedUser(
                appPreferences
            ).lastName}"

        viewDataBinding!!.tvEmail.text = appPreferences.getSavedUser(appPreferences).email
        viewDataBinding!!.tvMobile.text =
            "${appPreferences.getSavedUser(appPreferences).phoneNumberCountryCode} ${appPreferences.getSavedUser(
                appPreferences
            ).phoneNumber}"

        if (appPreferences.getSavedUser(appPreferences).isEmailVerified) {
            viewDataBinding!!.tvEmail.setCompoundDrawablesRelativeWithIntrinsicBounds(
                0,
                0,
                R.mipmap.ic_circle_check,
                0
            )
        } else {
            viewDataBinding!!.tvEmail.setCompoundDrawablesRelativeWithIntrinsicBounds(0, 0, 0, 0)
        }

        try {
            if (!CommonUtils.isStringNullOrBlank(appPreferences.getSavedUser(appPreferences).qrCodeUrl)) {
                Glide.with(this).load(appPreferences.getSavedUser(appPreferences).qrCodeUrl)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .apply(RequestOptions.noTransformation())
                    .into(viewDataBinding!!.icQr)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val userType = AppPreference.getInstance(activity!!).getValue(PreferenceKeys.USER_TYPE)

        if (!userType.equals(AppConstants.SECONDARY_SIGNUP)) { // In Case of not secondary user
            setKYCData(appPreferences)
        }


    }

    private fun setKYCData(appPreferences: AppPreference) {
        if ((appPreferences.getSavedUser(appPreferences).kycStatus.equals(
                "uploaded",
                true
            ) || appPreferences.getSavedUser(appPreferences).kycStatus.equals(
                "pending",
                true
            )) && !appPreferences.getSavedUser(appPreferences).isKycVerified
        ) {
            viewDataBinding!!.tvKycStatus.visibility = View.VISIBLE

            if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true)) {
                viewDataBinding!!.tvCompanyName.text =
                    appPreferences.getSavedUser(appPreferences).companyName
                viewDataBinding!!.tvTaxId.text = appPreferences.getSavedUser(appPreferences).taxId
                viewDataBinding!!.tvRegistrationNumber.text =
                    appPreferences.getSavedUser(appPreferences).chamberOfCommerce

                viewDataBinding!!.groupCompany.visibility = View.VISIBLE
                viewDataBinding!!.guideline6.setGuidelinePercent(0.63f)
                viewDataBinding!!.guideline1.setGuidelinePercent(0.1f)
            } else {
                viewDataBinding!!.guideline6.setGuidelinePercent(0.85f)
            }
        } else if (appPreferences.getSavedUser(appPreferences).kycStatus.equals(
                "rejected",
                true
            ) && !appPreferences.getSavedUser(appPreferences).isKycVerified
        ) {
            viewDataBinding!!.tvKycStatus.visibility = View.VISIBLE
            viewDataBinding!!.tvKycStatus.setCompoundDrawablesRelativeWithIntrinsicBounds(
                R.mipmap.ic_kyc_rejected,
                0,
                0,
                0
            )
            viewDataBinding!!.tvKycStatus.text = getString(R.string.kyc_rejected)

            if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true)) {
                viewDataBinding!!.tvCompanyName.text =
                    appPreferences.getSavedUser(appPreferences).companyName
                viewDataBinding!!.tvTaxId.text = appPreferences.getSavedUser(appPreferences).taxId
                viewDataBinding!!.tvRegistrationNumber.text =
                    appPreferences.getSavedUser(appPreferences).chamberOfCommerce

                viewDataBinding!!.groupCompany.visibility = View.VISIBLE
                viewDataBinding!!.guideline6.setGuidelinePercent(0.63f)
                viewDataBinding!!.guideline1.setGuidelinePercent(0.1f)
            } else {
                viewDataBinding!!.guideline6.setGuidelinePercent(0.85f)
            }
//        } else if (appPreferences.getSavedUser(appPreferences).kycStatus.equals(
//                "pending",
//                true
//            ) && !appPreferences.getSavedUser(appPreferences).isKycVerified
//        ) {
//            viewDataBinding!!.tvKycStatus.visibility = View.VISIBLE
//
//            if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true)) {
//                viewDataBinding!!.tvCompanyName.text =
//                    appPreferences.getSavedUser(appPreferences).companyName
//                viewDataBinding!!.tvTaxId.text = appPreferences.getSavedUser(appPreferences).taxId
//                viewDataBinding!!.tvRegistrationNumber.text =
//                    appPreferences.getSavedUser(appPreferences).chamberOfCommerce
//
//                viewDataBinding!!.groupCompany.visibility = View.VISIBLE
//                viewDataBinding!!.guideline6.setGuidelinePercent(0.63f)
//                viewDataBinding!!.guideline1.setGuidelinePercent(0.1f)
//            } else {
//                viewDataBinding!!.guideline6.setGuidelinePercent(0.85f)
//            }
        } else {
            viewDataBinding!!.tvKycStatus.visibility = View.VISIBLE
            viewDataBinding!!.tvKycStatus.setCompoundDrawablesRelativeWithIntrinsicBounds(
                R.mipmap.ic_kyc_complete,
                0,
                0,
                0
            )
            viewDataBinding!!.tvKycStatus.text = getString(R.string.kyc_verified)

            if (!appPreferences.getSavedUser(appPreferences).userType.equals("user", true)) {
                viewDataBinding!!.tvCompanyName.text =
                    appPreferences.getSavedUser(appPreferences).companyName
                viewDataBinding!!.tvTaxId.text = appPreferences.getSavedUser(appPreferences).taxId
                viewDataBinding!!.tvRegistrationNumber.text =
                    appPreferences.getSavedUser(appPreferences).chamberOfCommerce

                viewDataBinding!!.groupCompany.visibility = View.VISIBLE
                viewDataBinding!!.guideline6.setGuidelinePercent(0.63f)
                viewDataBinding!!.guideline1.setGuidelinePercent(0.1f)
            } else {
                viewDataBinding!!.guideline6.setGuidelinePercent(0.85f)
            }
        }
    }

    override fun backToPreviousActivity() {
        // This method is called when click on back button
    }

    override fun showBarCode() {
        openMyCodeScreen(activity!!)
    }

    override fun shareQRCOde() {
        Toast.makeText(activity!!, "will share the QR code by Native share", Toast.LENGTH_SHORT)
            .show()
    }

    override fun openPaymentRequest() {
        openPaymentRequest(activity!!)
    }

    /**
     * This method is used to show session expire alert
     */
    override fun showSessionExpireAlert() {
        DialogUtils.sessionExpireDialog(activity!!)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
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
        showProgressDialog(activity!!, resources.getString(R.string.LOADING))
    }

    inner class ItemEventListener : ClickListener() {
        override fun onForceUpdate() {
            super.onForceUpdate()
            val appPackageName =
                activity!!.packageName // getPackageName() from Context or Activity object
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
        var appPreference = AppPreference.getInstance(requireContext())
        var user: LoginBean = appPreference.getSavedUser(appPreference)

        loginBean.token = user.token
        val userString = Gson().toJson(loginBean)
        appPreference.addValue(PreferenceKeys.USER_DATA, userString)
        callUserData()
    }
}

