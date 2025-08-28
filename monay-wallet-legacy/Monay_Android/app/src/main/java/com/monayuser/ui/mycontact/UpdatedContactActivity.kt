package com.monayuser.ui.mycontact

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.*
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.Filter
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.data.model.response.AllContactSyncResponse
import com.monayuser.data.model.response.RecentUserListResponse
import com.monayuser.data.model.response.UserSearchResponse
import com.monayuser.databinding.ActivityUpdateContactsBinding
import com.monayuser.ui.base.BaseActivity
import com.monayuser.ui.mycontact.adapter.*
import com.monayuser.ui.mycontact.model.Contact
import com.monayuser.ui.paymoney.PayMoneyActivity
import com.monayuser.ui.paymoneyfromprimarywallet.PayMoneyFromPrimaryActivity
import com.monayuser.ui.requestmoney.RequestMoneyActivity
import com.monayuser.ui.scan.ScanActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import kotlinx.android.synthetic.main.activity_my_contact.*
import kotlinx.android.synthetic.main.dialog_invite.view.*
import java.io.Serializable
import java.util.regex.Pattern


class UpdatedContactActivity : BaseActivity<ActivityUpdateContactsBinding, MyContactViewModel>(),
    MyContactNavigator, NoContactFoundListener, NoRecentFoundListener, NoAllContactFoundListener {

    var openScan: String = ""
    private var requestStatus = false
    private var searchString = ""
    private var recentStatus = false
    private var recentContactList: ArrayList<RecentUserData> = ArrayList()
    private var monayContactList: ArrayList<RecentUserData> = ArrayList()
    private var allContactsList: ArrayList<Contact?> = ArrayList()
    private var allLocalContactsList: ArrayList<Contact?> = ArrayList()
    private var recentLinearLayoutManager: LinearLayoutManager? = null
    private var monayLinearLayoutManager: LinearLayoutManager? = null
    private var allLinearLayoutManager: LinearLayoutManager? = null
    private var recentContactAdapter: MyRecentContactAdapter? = null
    private var monayContactAdapter: NewMonayContactAdapter? = null
    private var allContactsAdapter: AllContactsAdapter? = null
    private var noContactFoundListener: NoContactFoundListener? = null
    private var noAllContactFoundListener: NoAllContactFoundListener? = null
    private var noContactFoundListenerRecent: NoRecentFoundListener? = null
    private var numberStatus = true
    private var contactStatus = false
    private var allContactStatus = false
    private var isLoading = false
    var adapterContacts: ContactsAdapter? = null

    override val bindingVariable: Int get() = BR.myContactVM

    override val layoutId: Int get() = R.layout.activity_update_contacts

    var myContactViewModel: MyContactViewModel = MyContactViewModel()

    override val viewModel: MyContactViewModel get() = myContactViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor =
                ContextCompat.getColor(this@UpdatedContactActivity, R.color.colorPrimary)
        }
        super.onCreate(savedInstanceState)
        noContactFoundListener = this
        noContactFoundListenerRecent = this
        myContactViewModel.navigator = this

        myContactViewModel.initView()

        viewDataBinding!!.searchEdit.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(
                s: CharSequence,
                start: Int,
                count: Int,
                after: Int
            ) {
                // This method is not used for any functionality
            }

            override fun onTextChanged(
                s: CharSequence,
                start: Int,
                before: Int,
                count: Int
            ) {
                noContactCondtion(s)

                if (adapterContacts != null) {
                    adapterContacts!!.getFilter()
                        .filter(s.toString(), object : Filter.FilterListener {
                            override fun onFilterComplete(count: Int) {
                                if (count == 0) {
                                    viewDataBinding!!.rvAllContacts.setVisibility(View.GONE)
                                    viewDataBinding!!.lvContacts.setVisibility(View.GONE)
                                    viewDataBinding!!.tvAllContact.setVisibility(View.GONE)
                                    allContactStatus = true

                                    conditionForHiding(s)
                                } else {
//                                    Log.e(javaClass.name, "List size is >>>>>> ???? "+count)
                                    viewDataBinding!!.lvContacts.setVisibility(View.VISIBLE)
                                    viewDataBinding!!.tvAllContact.setVisibility(View.VISIBLE)
                                    allContactStatus = false
                                    viewDataBinding!!.tvText.visibility = View.GONE
                                    viewDataBinding!!.btnProceed.visibility = View.GONE
                                    viewDataBinding!!.tvText.visibility = View.GONE
                                }
                            }
                        })
                }

                searchString = s.toString()

             numberStatusCondition(s)
            }

            override fun afterTextChanged(s: Editable) {
                if (searchString.length == 0) {
                    viewDataBinding!!.btnProceed.visibility = View.GONE
                }
            }
        })

        hideKeyboard()
    }

    private fun conditionForHiding(s: CharSequence) {
        if (recentStatus && contactStatus) {
            viewDataBinding!!.myContactRecyclerView.setVisibility(View.GONE)
            viewDataBinding!!.contactText.setVisibility(View.GONE)

            viewDataBinding!!.myRecentContactRecyclerView.setVisibility(
                View.GONE
            )
            viewDataBinding!!.recentText.setVisibility(View.GONE)
            viewDataBinding!!.txtNoRecentUser.setVisibility(View.GONE)
            viewDataBinding!!.view1.setVisibility(View.GONE)
            if (numberStatus) {
                viewDataBinding!!.btnProceed.visibility = View.VISIBLE
                viewDataBinding!!.tvText.visibility = View.GONE
            } else {
                viewDataBinding!!.btnProceed.visibility = View.GONE
                viewDataBinding!!.tvText.visibility = View.VISIBLE
                viewDataBinding!!.tvText.text =
                    "We could not find ${s.toString()} in your contacts. Try entering their mobile number"
            }
        }
    }

    private fun numberStatusCondition(s: CharSequence) {
        if (Pattern.matches("[0-9]+", s.toString())) {
            numberStatus = true
        } else {
            numberStatus = false
        }
    }

    private fun noContactCondtion(s: CharSequence) {
        if (monayContactList.size > 0) {
            s.toString()
                ?.let {
                    monayContactAdapter!!.filter(
                        it
                    )
                }
        } else {
            noContactFound(0, s.toString())
        }

        if (recentContactList.size > 0) {
            s.toString()
                ?.let {
                    recentContactAdapter!!.filter(
                        it
                    )
                }
        } else {
            noRecentFound(0, s.toString())
        }
    }

    override fun init() {
        if (intent != null && intent.hasExtra(AppConstants.TARGET_HOME)) {
            requestStatus = true
        }

        viewDataBinding!!.syncContact.setOnClickListener{
            syncContact()
        }

        viewDataBinding!!.syncContactBtn.setOnClickListener{
            syncContact()
        }

        initializeAdapter()

        if (checkIfInternetOn()) {
            myContactViewModel.recentUserListAPi(
                AppPreference.getInstance(this),
                "",
                "0",
                "20"
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (ContextCompat.checkSelfPermission(
                        this,
                        Manifest.permission.READ_CONTACTS
                    ) == PackageManager.PERMISSION_GRANTED
                ) {
                    fetchContactsFromPhoneBook()
                } else {
                    viewDataBinding!!.lvContacts.visibility = View.GONE
                    viewDataBinding!!.contactText.visibility = View.GONE
                    viewDataBinding!!.tvAllContact.visibility = View.GONE
                    viewDataBinding!!.myContactRecyclerView.visibility = View.GONE
                    viewDataBinding!!.noContactText.visibility = View.VISIBLE
                    viewDataBinding!!.syncContact.visibility = View.VISIBLE
                }
            } else {
                fetchContactsFromPhoneBook()
            }
        } else {
            tryAgain()
        }
    }

    private fun fetchContactsFromPhoneBook() {
        try {
            showProgressBar()
            Thread {
                runOnUiThread {
                    //your code or your request that you want to run on uiThread
                    allContactsList.addAll(ContactFetcher(this@UpdatedContactActivity).fetchAll())
//                        Log.e(javaClass.name, "List size is >>>>>>" + allContactsList.size)
                    if (allContactsList.size == 0) {
//                            viewDataBinding!!.svContacts.visibility = View.GONE
                        viewDataBinding!!.noContactText.visibility = View.VISIBLE
                        viewDataBinding!!.syncContact.visibility = View.VISIBLE
                        hideProgressBar()
                    } else {
                        viewDataBinding!!.lvContacts.visibility = View.VISIBLE
                        adapterContacts = ContactsAdapter(
                            this@UpdatedContactActivity,
                            allContactsList!!
                        )
//                            viewDataBinding!!.lvContacts.setex(true)
                        viewDataBinding!!.lvContacts.setAdapter(adapterContacts)

                        hideProgressBar()

                        myContactViewModel.callAllSyncAPI(
                            AppPreference.getInstance(this@UpdatedContactActivity),
                            allContactsList
                        )

//                            Thread {
//                                runOnUiThread {
//                                    setListViewHeightBasedOnChildren(viewDataBinding!!.lvContacts)
//                                }
//                            }.start()

                        adapterContacts!!.setOnItemClickListener(
                            object :
                                ContactsAdapter.OnItemClickListener {
                                override fun onInviteClicked(
                                    position: Int,
                                    contactBean: Contact
                                ) {
                                    val dialog = BottomSheetDialog(this@UpdatedContactActivity)
                                    val bottomSheet =
                                        layoutInflater.inflate(R.layout.dialog_invite, null)

                                    bottomSheet.imageCloseDialog.setOnClickListener { dialog.dismiss() }

                                    bottomSheet.btn_invite.setOnClickListener {
                                        inviteFunctionality()
                                        dialog.dismiss()
                                    }

                                    bottomSheet.tv_name.text =
                                        "${contactBean.name.toString()} is not on Monay. Invite your friend."

                                    dialog.setContentView(bottomSheet)
                                    dialog.show()
                                }
                            })
                    }
                }
            }.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun inviteFunctionality() {
        val sendIntent = Intent()
        sendIntent.action = Intent.ACTION_SEND
        sendIntent.putExtra(
            Intent.EXTRA_SUBJECT,
            getString(R.string.app_name)
        )

        var appPreference =
            AppPreference.getInstance(this@UpdatedContactActivity)

        try {
            if (appPreference.getSettingData(appPreference).inviteMessage.contains(
                    "{appLink}"
                )
            ) {
                sendIntent.putExtra(
                    Intent.EXTRA_TEXT,
                    "${
                        appPreference.getSettingData(
                            appPreference
                        ).inviteMessage.replace(
                            "{appLink}",
                            "http://play.google.com/store/apps/details?id=$packageName"
                        )
                    }"
                )
            } else {
                sendIntent.putExtra(
                    Intent.EXTRA_TEXT,
                    "${
                        appPreference.getSettingData(
                            appPreference
                        ).inviteMessage
                    }" +
                            "\n http://play.google.com/store/apps/details?id=$packageName"
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
            sendIntent.putExtra(
                Intent.EXTRA_TEXT,
                "Invite your friends to use Monay.\n" +
                        "Safe. Secure. Digital Wallet." +
                        "\n http://play.google.com/store/apps/details?id=$packageName"
            )
        }

        sendIntent.type = "text/plain"
        startActivity(
            Intent.createChooser(
                sendIntent,
                "Share via"
            )
        )
    }

    private fun initializeAdapter() {
        recentContactList = ArrayList()
        monayContactList = ArrayList()
        allContactsList = ArrayList()
//        allLocalContactsList = ArrayList()

        recentLinearLayoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        viewDataBinding!!.myRecentContactRecyclerView.layoutManager = recentLinearLayoutManager
        recentContactAdapter = MyRecentContactAdapter(this, recentContactList)
        viewDataBinding!!.myRecentContactRecyclerView.adapter = recentContactAdapter

        monayLinearLayoutManager = LinearLayoutManager(this)
        viewDataBinding!!.myContactRecyclerView.layoutManager = monayLinearLayoutManager
        viewDataBinding!!.myContactRecyclerView.addItemDecoration(
            DividerItemDecoration(
                viewDataBinding!!.myContactRecyclerView.getContext(),
                DividerItemDecoration.VERTICAL
            )
        )
        monayContactAdapter = NewMonayContactAdapter(this, monayContactList)
        viewDataBinding!!.myContactRecyclerView.adapter = monayContactAdapter


//        viewDataBinding!!.svContacts.setOnScrollChangeListener(NestedScrollView.OnScrollChangeListener { v: NestedScrollView, scrollX: Int, scrollY: Int, oldScrollX: Int, oldScrollY: Int ->
//            if (v.getChildAt(v.childCount - 1) != null) {
//                if (scrollY >= v.getChildAt(v.childCount - 1)
//                        .measuredHeight - v.measuredHeight &&
//                    scrollY > oldScrollY
//                ) {
//                    //code to fetch more data for endless scrolling
//                }
//            }
//        } as NestedScrollView.OnScrollChangeListener)

        noContactFoundListener?.let {
            monayContactAdapter!!.noContactView(
                it
            )
        }

        noContactFoundListenerRecent?.let {
            recentContactAdapter!!.noContactView(
                it
            )
        }

        recentContactAdapter!!.setOnItemClickListener(
            object :
                MyRecentContactAdapter.OnItemClickListener {
                override fun onItemClicked(items: RecentUserData) {
                    if (requestStatus) {
                        val intent =
                            Intent(this@UpdatedContactActivity, RequestMoneyActivity::class.java)
                        intent.putExtra(AppConstants.CONTACT_USER_DATA, items as Serializable?)
                        intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                        startActivity(intent)
                        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                    } else {


                        var userType =  AppPreference.getInstance(this@UpdatedContactActivity!!).getValue(PreferenceKeys.USER_TYPE)

                        if(userType!!.equals(AppConstants.SECONDARY_SIGNUP)){
                            val intent = Intent(
                                this@UpdatedContactActivity,
                                PayMoneyFromPrimaryActivity::class.java
                            )
                            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                            intent.putExtra(AppConstants.CONTACT_USER_DATA, items as Serializable?)
                            startActivity(intent)
                            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                        }else{
                            val intent = Intent(
                                this@UpdatedContactActivity,
                                PayMoneyActivity::class.java
                            )
                            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                            intent.putExtra(AppConstants.CONTACT_USER_DATA, items as Serializable?)
                            startActivity(intent)
                            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                        }

                    }
                }
            })

        monayContactAdapter!!.setOnItemClickListener(object :
            NewMonayContactAdapter.OnItemClickListener {
            override fun onItemClicked(recentUserData: RecentUserData) {
                if (requestStatus) {
                    val intent =
                        Intent(this@UpdatedContactActivity, RequestMoneyActivity::class.java)
                    intent.putExtra(
                        AppConstants.CONTACT_USER_DATA,
                        recentUserData as Serializable?
                    )
                    intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                    startActivity(intent)
                    overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                } else {

                    var userType =  AppPreference.getInstance(this@UpdatedContactActivity!!).getValue(PreferenceKeys.USER_TYPE)

                    if(userType!!.equals(AppConstants.SECONDARY_SIGNUP)){
                        val intent = Intent(
                            this@UpdatedContactActivity,
                            PayMoneyFromPrimaryActivity::class.java
                        )
                        intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                        intent.putExtra(
                            AppConstants.CONTACT_USER_DATA,
                            recentUserData as Serializable?
                        )
                        startActivity(intent)
                        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                    }else{

                        val intent = Intent(
                            this@UpdatedContactActivity,
                            PayMoneyActivity::class.java
                        )
                        intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                        intent.putExtra(
                            AppConstants.CONTACT_USER_DATA,
                            recentUserData as Serializable?
                        )
                        startActivity(intent)
                        overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
                    }

                }
            }

            override fun onInviteClicked(position: Int, recentUserData: RecentUserData) {
                // This method is called when click on invite text
            }
        })
    }

    override fun backToPreviousActivity() {
        finish()
    }

    override fun filterContact() {
        firstLayout.visibility = View.GONE
        searchLayout.visibility = View.VISIBLE
        val slideUp: Animation = AnimationUtils.loadAnimation(this, R.anim.slide_for_in)
        searchLayout.startAnimation(slideUp)
    }

    override fun filterCancel() {
        searchEdit.setText("")
        hideKeyboard()
        searchLayout.visibility = View.GONE
        firstLayout.visibility = View.VISIBLE
        val slideUp: Animation = AnimationUtils.loadAnimation(this, R.anim.slide_for_in)
        firstLayout.startAnimation(slideUp)
        hideKeyboard()
    }

    override fun scanClick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            openScan = "Scan"
            checkPermission(
                this,
                *CommonUtils.READ_WRITE_EXTERNAL_STORAGE_AND_CAMERA
            )
        } else {
            val intent = Intent(this, ScanActivity::class.java)
            if (requestStatus) {
                intent.putExtra(AppConstants.TARGET_HOME, AppConstants.TARGET_HOME)
            }
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        }
    }

    override fun recentUserListResponse(recentUserListResponse: RecentUserListResponse) {
        try {
            if (recentUserListResponse.data!!.rows.isNotEmpty()) {
                viewDataBinding!!.txtNoRecentUser.visibility = View.GONE
                viewDataBinding!!.myRecentContactRecyclerView.visibility = View.VISIBLE
                viewDataBinding!!.recentText.setVisibility(View.VISIBLE)
                recentContactList!!.addAll(recentUserListResponse.data!!.rows)

                runOnUiThread {
                    recentContactAdapter!!.notifyDataSetChanged()
                }
            } else {
                recentStatus = true
                viewDataBinding!!.txtNoRecentUser.visibility = View.VISIBLE
                viewDataBinding!!.myRecentContactRecyclerView.visibility = View.GONE
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(this)) {
            initializeAdapter()
            viewDataBinding!!.recentText.visibility = View.VISIBLE
            viewDataBinding!!.txtNoRecentUser.visibility = View.VISIBLE
            viewDataBinding!!.svContacts.visibility = View.VISIBLE
            viewDataBinding!!.view1.visibility = View.VISIBLE
            viewDataBinding!!.tryAgain.visibility = View.GONE
            viewDataBinding!!.noInternet.visibility = View.GONE

            myContactViewModel.recentUserListAPi(AppPreference.getInstance(this), "", "0", "20")

            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.READ_CONTACTS
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                fetchContactsFromPhoneBook()
            } else {
                viewDataBinding!!.lvContacts.visibility = View.GONE
                viewDataBinding!!.contactText.visibility = View.GONE
                viewDataBinding!!.tvAllContact.visibility = View.GONE
                viewDataBinding!!.myContactRecyclerView.visibility = View.GONE
                viewDataBinding!!.noContactText.visibility = View.VISIBLE
                viewDataBinding!!.syncContact.visibility = View.VISIBLE
            }
        } else {
            viewDataBinding!!.recentText.visibility = View.GONE
            viewDataBinding!!.txtNoRecentUser.visibility = View.GONE
            viewDataBinding!!.svContacts.visibility = View.GONE
            viewDataBinding!!.view1.visibility = View.GONE
            viewDataBinding!!.tryAgain.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.visibility = View.VISIBLE
            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
        }
    }

    override fun syncContact() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            openScan = ""
            checkPermission(
                this,
                *CommonUtils.CONTACTS_READS_AND_WRITE_PERMISSION
            )
        } else {
            openScan = ""
            viewDataBinding!!.myContactRecyclerView.visibility = View.VISIBLE
            viewDataBinding!!.lvContacts.visibility = View.VISIBLE
            viewDataBinding!!.tvAllContact.visibility = View.VISIBLE
            viewDataBinding!!.noContactText.visibility = View.GONE
            viewDataBinding!!.syncContact.visibility = View.GONE
        }
    }

    override fun clickOnProceedButton() {
        val appPreferences = AppPreference.getInstance(this)
        if (checkIfInternetOn() && CommonUtils.isMobileValidate(searchString.trim().toString())) {
            if (requestStatus) {
                if (appPreferences.getSavedUser(appPreferences).phoneNumber.equals(
                        searchString,
                        true
                    )
                ) {
                    showValidationError(getStringResource(R.string.cant_request_money))
                } else {
                    myContactViewModel.callUserSearchAPI(
                        false,
                        AppPreference.getInstance(this),
                        "0",
                        "10",
                        "",
                        searchString
                    )
                }
            } else {
                if (appPreferences.getSavedUser(appPreferences).phoneNumber.equals(
                        searchString,
                        true
                    )
                ) {
                    showValidationError(getStringResource(R.string.cant_send_money))
                } else {
                    myContactViewModel.callUserSearchAPI(
                        false,
                        AppPreference.getInstance(this),
                        "0",
                        "10",
                        "",
                        searchString
                    )
                }
            }
        } else {
            viewDataBinding!!.tvText.visibility = View.VISIBLE
            viewDataBinding!!.tvText.text = getStringResource(R.string.enter_correct_mobile)
        }
    }

    override fun showPageLoader() {
    // This method is used for showing pagination loader
    }

    override fun showHideLoader() {
        // This method is used for hiding pagination loader
    }

    override fun getUserSearchResponse(userSearchResponse: UserSearchResponse) {
        if (requestStatus) {
            val intent =
                Intent(this, RequestMoneyActivity::class.java)
            intent.putExtra(
                AppConstants.CONTACT_USER_DATA,
                userSearchResponse.data!!.rows[0] as Serializable?
            )
            intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {

           var userType =  AppPreference.getInstance(this@UpdatedContactActivity!!).getValue(PreferenceKeys.USER_TYPE)

            if(userType!!.equals(AppConstants.SECONDARY_SIGNUP)){

                val intent = Intent(this, PayMoneyFromPrimaryActivity::class.java)
                intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                intent.putExtra(
                    AppConstants.CONTACT_USER_DATA,
                    userSearchResponse.data!!.rows[0] as Serializable?
                )
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)

            }else{

                val intent = Intent(this, PayMoneyActivity::class.java)
                intent.putExtra(AppConstants.CONTACT_LIST_TYPE, AppConstants.RECENT_CONTACT)
                intent.putExtra(
                    AppConstants.CONTACT_USER_DATA,
                    userSearchResponse.data!!.rows[0] as Serializable?
                )
                startActivity(intent)
                overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
            }

        }
    }

    override fun getAllContactSyncResponse(contactSyncResponse: AllContactSyncResponse) {
        try {
            if (contactSyncResponse.data!!.isNotEmpty()) {
                viewDataBinding!!.contactText.visibility = View.VISIBLE
                viewDataBinding!!.myContactRecyclerView.visibility = View.VISIBLE
                monayContactList.addAll(contactSyncResponse.data!!)

                runOnUiThread {
                    monayContactAdapter!!.notifyDataSetChanged()
                }


                Thread {
                    runOnUiThread {
                        var recentUserData: RecentUserData? = null
                        for (i in 0 until monayContactList.size) {
//                            Log.e(
//                                javaClass.name,
//                                "Monay user is >>>>>" + monayContactList.size + " position is >>>" + i
//                            )

                            val iterator = allContactsList.iterator()

                            while (iterator.hasNext()) {
                                val contact = iterator.next()
                                if (contact!!.phoneNumber!! == monayContactList[i].phoneNumber) {
                                    allContactsList.remove(contact)

                                    if (monayContactList[i].phoneNumber == AppPreference.getInstance(
                                            this
                                        ).getSavedUser(AppPreference.getInstance(this)).phoneNumber
                                    ) {
                                        recentUserData = monayContactList[i]
                                    }
                                    break
                                }
                            }
                        }

                        if (recentUserData != null) {
                            monayContactList.remove(recentUserData)
                            monayContactAdapter!!.notifyDataSetChanged()
                        }
                        adapterContacts!!.notifyDataSetChanged()
                    }
                }.start()
            } else {
                viewDataBinding!!.contactText.visibility = View.GONE
                viewDataBinding!!.myContactRecyclerView.visibility = View.GONE
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun rxPermissionGranted() {
        super.rxPermissionGranted()
        if (openScan.equals("Scan")) {
            val intent = Intent(this, ScanActivity::class.java)
            if (requestStatus) {
                intent.putExtra(AppConstants.TARGET_HOME, AppConstants.TARGET_HOME)
            }
            startActivity(intent)
            overridePendingTransition(R.anim.slide_for_in, R.anim.slide_for_out)
        } else {
            fetchContactsFromPhoneBook()

            viewDataBinding!!.lvContacts.visibility = View.VISIBLE
            viewDataBinding!!.tvAllContact.visibility = View.VISIBLE
            viewDataBinding!!.noContactText.visibility = View.GONE
            viewDataBinding!!.syncContact.visibility = View.GONE
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
        showProgressDialog(this, resources.getString(R.string.LOADING))
    }

    override fun showNetworkError(error: String?) {
        // This method is used to show network error alert
    }

    /**
     * This method is used to show update version alert
     */
    override fun onUpdateAppVersion(error: String?) {
        DialogUtils.dialogForceUpdate(
            this,
            resources.getString(R.string.oops),
            error!!,
            ItemEventListener()
        )
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
            } catch (anfe: ActivityNotFoundException) {
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
        DialogUtils.sessionExpireDialog(this)
    }

    override fun getStringResource(id: Int): String {
        return resources.getString(id)
    }

    override fun noContactFound(position: Int, text: String) {
        if (position == 0) {
            viewDataBinding!!.myContactRecyclerView.setVisibility(View.GONE)
            viewDataBinding!!.contactText.setVisibility(View.GONE)
            contactStatus = true

            if (recentStatus && allContactStatus) {
                viewDataBinding!!.rvAllContacts.setVisibility(View.GONE)
                viewDataBinding!!.tvAllContact.setVisibility(View.GONE)

                viewDataBinding!!.myRecentContactRecyclerView.setVisibility(View.GONE)
                viewDataBinding!!.recentText.setVisibility(View.GONE)
                viewDataBinding!!.txtNoRecentUser.setVisibility(View.GONE)
                viewDataBinding!!.view1.setVisibility(View.GONE)
                if (numberStatus) {
                    viewDataBinding!!.btnProceed.visibility = View.VISIBLE
                    viewDataBinding!!.tvText.visibility = View.GONE
                } else {
                    viewDataBinding!!.btnProceed.visibility = View.GONE
                    viewDataBinding!!.tvText.visibility = View.VISIBLE
                    viewDataBinding!!.tvText.text =
                        "We could not find ${text} in your contacts. Try entering their mobile number"
                }
            }
        } else {
            contactStatus = false
            viewDataBinding!!.tvText.visibility = View.GONE
            viewDataBinding!!.myContactRecyclerView.setVisibility(View.VISIBLE)
            viewDataBinding!!.contactText.setVisibility(View.VISIBLE)

            viewDataBinding!!.btnProceed.visibility = View.GONE
            viewDataBinding!!.tvText.visibility = View.GONE
        }
    }

    override fun noAllContactFound(position: Int, text: String) {
        if (position == 0) {
            viewDataBinding!!.rvAllContacts.setVisibility(View.GONE)
            viewDataBinding!!.tvAllContact.setVisibility(View.GONE)
            allContactStatus = true

            if (recentStatus && contactStatus) {
                viewDataBinding!!.myContactRecyclerView.setVisibility(View.GONE)
                viewDataBinding!!.contactText.setVisibility(View.GONE)

                viewDataBinding!!.myRecentContactRecyclerView.setVisibility(View.GONE)
                viewDataBinding!!.recentText.setVisibility(View.GONE)
                viewDataBinding!!.txtNoRecentUser.setVisibility(View.GONE)
                viewDataBinding!!.view1.setVisibility(View.GONE)
                if (numberStatus) {
                    viewDataBinding!!.btnProceed.visibility = View.VISIBLE
                    viewDataBinding!!.tvText.visibility = View.GONE
                } else {
                    viewDataBinding!!.btnProceed.visibility = View.GONE
                    viewDataBinding!!.tvText.visibility = View.VISIBLE
                    viewDataBinding!!.tvText.text =
                        "We could not find ${text} in your contacts. Try entering their mobile number"
                }
            }
        } else {
            allContactStatus = false
            viewDataBinding!!.tvText.visibility = View.GONE
            viewDataBinding!!.rvAllContacts.setVisibility(View.VISIBLE)
            viewDataBinding!!.tvAllContact.setVisibility(View.VISIBLE)

            viewDataBinding!!.btnProceed.visibility = View.GONE
            viewDataBinding!!.tvText.visibility = View.GONE
        }
    }

    override fun noRecentFound(position: Int, text: String) {
        if (position == 0) {
            viewDataBinding!!.myRecentContactRecyclerView.setVisibility(View.GONE)
            viewDataBinding!!.recentText.setVisibility(View.GONE)
            viewDataBinding!!.txtNoRecentUser.setVisibility(View.GONE)
            viewDataBinding!!.view1.setVisibility(View.GONE)
            recentStatus = true

            if (contactStatus && allContactStatus) {
                if (numberStatus) {
                    viewDataBinding!!.btnProceed.visibility = View.VISIBLE
                    viewDataBinding!!.tvText.visibility = View.GONE
                } else {
                    viewDataBinding!!.btnProceed.visibility = View.GONE
                    viewDataBinding!!.tvText.visibility = View.VISIBLE
                    viewDataBinding!!.tvText.text =
                        "We could not find ${text} in your contacts. Try entering their mobile number"
                }
            }
        } else {
            recentStatus = false
            viewDataBinding!!.myRecentContactRecyclerView.setVisibility(View.VISIBLE)
            viewDataBinding!!.recentText.setVisibility(View.VISIBLE)
            viewDataBinding!!.txtNoRecentUser.setVisibility(View.GONE)
            viewDataBinding!!.tvText.visibility = View.GONE
            viewDataBinding!!.view1.setVisibility(View.VISIBLE)

            viewDataBinding!!.btnProceed.visibility = View.GONE
            viewDataBinding!!.tvText.visibility = View.GONE
        }
    }
}