package com.monayuser.ui.navigation


import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PersistableBundle
import android.view.View
import android.view.Window
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView
// TODO: Replace with Material BottomNavigationView
// import com.google.android.material.bottomnavigation.BottomNavigationView
// import com.luseen.spacenavigation.SpaceItem
// import com.luseen.spacenavigation.SpaceOnClickListener
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.databinding.ActivityNavigationNewBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.home.HomeFragment
import com.monayuser.ui.more.MoreFragment
import com.monayuser.ui.mytransaction.TransactionFragment
import com.monayuser.ui.profile.ProfileFragment
import com.monayuser.ui.scan.ScanFragment
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import de.hdodenhof.circleimageview.CircleImageView


class NavigationActivity : BaseActivity<ActivityNavigationNewBinding, NavigationViewModel>(),
    NavigationNavigator {

    var mForgotPasswordViewModel: NavigationViewModel = NavigationViewModel()
    override val viewModel: NavigationViewModel get() = mForgotPasswordViewModel
    override val bindingVariable: Int get() = BR.navigationVM
    lateinit var homeFragment: HomeFragment
    lateinit var activity: Activity

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int get() = R.layout.activity_navigation_new

    /**
     * This method is main method of class
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@NavigationActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)

        mIsInForegroundMode = true
        homeFragment = HomeFragment()
        mForgotPasswordViewModel.navigator = this
        // TODO: Initialize BottomNavigationView properly
        // viewDataBinding!!.spaceNavigationView.initWithSaveInstanceState(savedInstanceState)
        mForgotPasswordViewModel.initView()

        if (intent != null && intent.hasExtra(AppConstants.NOTIFICATION)) {
            openNotification(this)
        }
    }

    override fun onResume() {
        if (intent != null && (intent.hasExtra(AppConstants.REQUEST_WITHDRAWAL) || intent.hasExtra(AppConstants.COME_FROM))) {
            mIsInForegroundMode = false
        }
        super.onResume()
    }

    override fun onSaveInstanceState(outState: Bundle, outPersistentState: PersistableBundle) {
        super.onSaveInstanceState(outState, outPersistentState)
        // TODO: Handle BottomNavigationView state saving
        // viewDataBinding!!.spaceNavigationView.onSaveInstanceState(outState)
    }

    fun hideNavigation() {
        // TODO: Hide BottomNavigationView
        // viewDataBinding!!.bottomNavigation.visibility = View.GONE
    }

    fun showNavigation() {
        // TODO: Show BottomNavigationView
        // viewDataBinding!!.bottomNavigation.visibility = View.VISIBLE
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        openFragment(HomeFragment(), "Home")
        // TODO: Set up BottomNavigationView with proper menu items
        /*
        val bottomNavigation = viewDataBinding!!.bottomNavigation
        bottomNavigation.setOnNavigationItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
                    openFragment(HomeFragment(), "Home")
                    true
                }
                R.id.navigation_transaction -> {
                    openFragment(TransactionFragment(), "Transaction")
                    true
                }
                R.id.navigation_profile -> {
                    openFragment(ProfileFragment(), "Profile")
                    true
                }
                R.id.navigation_more -> {
                    openFragment(MoreFragment(), "More")
                    true
                }
                R.id.navigation_scanner -> {
                    openScanner()
                    true
                }
                else -> false
            }
        }
        */
    }

    /**
     * This method is used to open a fragment
     */
    fun openFragment(fragment: Fragment?, tag: String) {
        val transaction =
            supportFragmentManager.beginTransaction()
        transaction.replace(R.id.container, fragment!!, tag)
        transaction.addToBackStack(null)
        transaction.commit()
    }

    public fun clickOnBottomNavigation(id: Int) {
        // TODO: Update BottomNavigationView selected item
        // viewDataBinding!!.bottomNavigation.selectedItemId = id
    }

    fun clickProfile(image: CircleImageView) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {

            val detailFragment: Fragment = ProfileFragment.newInstance()

            if (image != null) {
                supportFragmentManager
                    .beginTransaction()
                    .addToBackStack(null)
                    .replace(R.id.container, detailFragment)
                    .addSharedElement(image, "imagePass")
                    .commit()
            }

            // TODO: Update BottomNavigationView selected item to profile
            // viewDataBinding!!.bottomNavigation.selectedItemId = R.id.navigation_profile

        } else {
            // Code to run on older devices
            // TODO: Update BottomNavigationView selected item to profile
            // viewDataBinding!!.bottomNavigation.selectedItemId = R.id.navigation_profile
        }
    }

    /**
     * This listener is used to get callback on bottom navigation menu
     */
    var navigationItemSelectedListener =
        BottomNavigationView.OnNavigationItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_home -> {
                    openFragment(HomeFragment(), "Home")
                    return@OnNavigationItemSelectedListener true
                }
                R.id.navigation_transaction -> {
                    openFragment(TransactionFragment(), "Transaction")
                    return@OnNavigationItemSelectedListener true
                }
                R.id.navigation_camera -> {
                    openFragment(ScanFragment(), "Scan")
                    return@OnNavigationItemSelectedListener true
                }
                R.id.navigation_profile -> {
                    openFragment(ProfileFragment(), "Profile")
                    return@OnNavigationItemSelectedListener true
                }
                R.id.navigation_more -> {
                    openFragment(MoreFragment(), "More")
                    return@OnNavigationItemSelectedListener true
                }
            }
            false
        }

    /**
     * This method is called when click on scan button
     */
    override fun openScanner() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            checkPermission(
                this@NavigationActivity,
                *CommonUtils.READ_WRITE_EXTERNAL_STORAGE_AND_CAMERA
            )
        } else {
            openScanActivityScreen(this@NavigationActivity)
        }
    }

    override fun rxPermissionDenied() {
        super.rxPermissionDenied()
        Toast.makeText(this, getStringResource(R.string.allow_permission), Toast.LENGTH_SHORT)
            .show()

        moveToApplicationSetting()
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        openScanActivityScreen(this@NavigationActivity)
    }

    /**
     * This method is called when click on back button
     */
    override fun onBackPressed() {
        val fragment =
            supportFragmentManager.findFragmentById(R.id.container)
        if (fragment!!.tag == "Home") {
            DialogUtils.onLogoutDialog(
                this@NavigationActivity,
                resources.getString(R.string.exit_alert),
                resources.getString(R.string.want_to_exit),
                resources.getString(R.string.yes),
                resources.getString(R.string.no),
                ItemEventListener()
            )
        } else {
            // TODO: Update BottomNavigationView selected item to home\n            // viewDataBinding!!.bottomNavigation.selectedItemId = R.id.navigation_home
            //super.onBackPressed()
        }
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
        showProgressDialog(this@NavigationActivity, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this@NavigationActivity,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
    }

    inner class ItemEventListener : ClickListener() {
        override fun onsuccessEvent() {
            // This function is called when click on OK button
        }

        override fun onExitApplication() {
            super.onExitApplication()
            finishActivity()
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
        DialogUtils.sessionExpireDialog(this@NavigationActivity)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }
}