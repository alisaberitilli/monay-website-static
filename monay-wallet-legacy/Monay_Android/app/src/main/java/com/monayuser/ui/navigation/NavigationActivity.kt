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
import com.luseen.spacenavigation.SpaceItem
import com.luseen.spacenavigation.SpaceOnClickListener
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
        viewDataBinding!!.spaceNavigationView.initWithSaveInstanceState(savedInstanceState)
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
        viewDataBinding!!.spaceNavigationView.onSaveInstanceState(outState)
    }

    fun hideNavigation() {
        viewDataBinding!!.spaceNavigationView.visibility = View.GONE
    }

    fun showNavigation() {
        viewDataBinding!!.spaceNavigationView.visibility = View.VISIBLE
    }

    /**
     * This method is used to initialize an variable.
     */
    override fun init() {
        openFragment(HomeFragment(), "Home")
        viewDataBinding!!.spaceNavigationView.addSpaceItem(
            SpaceItem(
                getString(R.string.home_tab),
                R.mipmap.ic_home_new
            )
        )
        viewDataBinding!!.spaceNavigationView.addSpaceItem(
            SpaceItem(
                getString(R.string.transaction_tab),
                R.mipmap.ic_transaction_new
            )
        )
        viewDataBinding!!.spaceNavigationView.addSpaceItem(
            SpaceItem(
                getString(R.string.profile_tab),
                R.mipmap.ic_profile_new
            )
        )
        viewDataBinding!!.spaceNavigationView.addSpaceItem(
            SpaceItem(
                getString(R.string.more_tab),
                R.mipmap.ic_more_new
            )
        )
        viewDataBinding!!.spaceNavigationView.showIconOnly()

        viewDataBinding!!.spaceNavigationView.setSpaceOnClickListener(object :
            SpaceOnClickListener {
            override fun onCentreButtonClick() {
                openScanner()
            }

            override fun onItemReselected(itemIndex: Int, itemName: String?) {
                // This method is called when item is reselected
            }

            override fun onItemClick(itemIndex: Int, itemName: String?) {
                when (itemIndex) {
                    0 -> {
                        openFragment(HomeFragment(), "Home")
                    }
                    1 -> {
                        openFragment(TransactionFragment(), "Transaction")
                    }
                    2 -> {
                        openFragment(ProfileFragment(), "Profile")
                    }
                    3 -> {
                        openFragment(MoreFragment(), "More")
                    }
                }
            }
        })
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

        viewDataBinding!!.spaceNavigationView.changeCurrentItem(id)
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

            viewDataBinding!!.spaceNavigationView.changeCurrentItem(2)

        } else {
            // Code to run on older devices
            viewDataBinding!!.spaceNavigationView.changeCurrentItem(2)
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
            viewDataBinding!!.spaceNavigationView.changeCurrentItem(0)
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