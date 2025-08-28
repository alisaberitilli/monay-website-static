package com.monayuser.ui.mytransaction

import android.app.DatePickerDialog
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.DatePicker
import android.widget.TextView
import androidx.core.app.ActivityOptionsCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.monayuser.BR
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.data.model.response.TransactionListResponse
import com.monayuser.databinding.FragmentTransactionBinding
import com.monayuser.ui.base.BaseFragment
import com.monayuser.ui.home.adapter.TransactionListAdapter
import com.monayuser.ui.mytransaction.adpter.TextFilterAdapter
import com.monayuser.ui.transactiondetails.TransactionDetailsActivity
import com.monayuser.utils.AppConstants
import com.monayuser.utils.AppConstants.DATE_FORMAT_MONTH
import com.monayuser.utils.AppConstants.DATE_FORMAT_YEAR
import com.monayuser.utils.AppConstants.SIMPLE_DATE_FORMAT
import com.monayuser.utils.ClickListener
import com.monayuser.utils.CommonUtils
import com.monayuser.utils.DialogUtils
import de.hdodenhof.circleimageview.CircleImageView
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap


class TransactionFragment : BaseFragment<FragmentTransactionBinding, TransactionViewModel>(),
    TransactionNavigator {

    private var transactionList: ArrayList<RecentTransaction>? = null
    private var page = 1
    private var linearLayoutManager: LinearLayoutManager? = null
    private var linearLayoutManager1: LinearLayoutManager? = null
    private var isLoading = false
    private var transactListAdapter: TransactionListAdapter? = null
    private var textFilterAdapter: TextFilterAdapter? = null
    private var filterList = ArrayList<HashMap<String, String>>()
    private var fromDate = ""
    private var toDate = ""
    private var name = ""
    private var transactionType = ""
    private var minPrice = ""
    private var maxPrice = ""
    var toMonth = 0
    var toDay = 0
    var toYear = 0
    var searchFilter: Boolean = false
    var mTransactionViewModel: TransactionViewModel = TransactionViewModel()

    override val bindingVariable: Int
        get() = BR.transactionVM

    /**
     * This variable in which pass layout for showing.
     */
    override val layoutId: Int
        get() = R.layout.fragment_transaction

    override val viewModel: TransactionViewModel
        get() = mTransactionViewModel

    /**
     * This method is main method of class
     */
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mTransactionViewModel.navigator = this
        mTransactionViewModel.initView()
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
        if (!AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_NAME)
                .equals("")
        ) {
            name = AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_NAME)!!
            var hashMap = HashMap<String, String>()
            hashMap.put(AppConstants.PN_NAME, name)
            filterList.add(hashMap)
        }
        if (!AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_TYPE)
                .equals("")
        ) {
            transactionType =
                AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_TYPE)!!

            if (transactionType.equals("deposit", true)) {
                transactionType = "Added"
            } else if (transactionType.equals("withdrawal", true)) {
                transactionType = "Withdraw"
            }
            var hashMap = HashMap<String, String>()
            hashMap.put(AppConstants.PN_TYPE, transactionType)
            filterList.add(hashMap)
        }
        if (!AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_MIN_PRICE)
                .equals("")
        ) {
            minPrice =
                AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_MIN_PRICE)!!
            var hashMap = HashMap<String, String>()
            hashMap.put(
                AppConstants.PN_PRICE,
                AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_MIN_PRICE)!!
            )
            filterList.add(hashMap)
        }
        if (!AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_MAX_PRICE)
                .equals("")
        ) {
            maxPrice =
                AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_MAX_PRICE)!!
            var hashMap = HashMap<String, String>()
            hashMap.put(AppConstants.PN_PRICE, "${AppPreference.getInstance(requireActivity()).getSavedUser(AppPreference.getInstance(requireActivity())).Country!!.currencyCode} ${minPrice} - $${maxPrice}")
            filterList.add(hashMap)
        }
        if (!AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_FROM_DATE)
                .equals("") && !AppPreference.getInstance(requireContext())
                .getValue(PreferenceKeys.PN_TO_DATE)
                .equals("")
        ) {
            fromDate =
                AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_FROM_DATE)!!
            toDate =
                AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_TO_DATE)!!

            var hashMap = HashMap<String, String>()
            hashMap.put(
                AppConstants.PN_DATE, "${CommonUtils.getDateInFormat(
                    DATE_FORMAT_YEAR,
                    DATE_FORMAT_MONTH,
                    fromDate
                )} - ${CommonUtils.getDateInFormat(
                    DATE_FORMAT_YEAR,
                    DATE_FORMAT_MONTH,
                    toDate
                )}"
            )
            filterList.add(hashMap)
        } else if (!AppPreference.getInstance(requireContext())
                .getValue(PreferenceKeys.PN_FROM_DATE)
                .equals("")
        ) {
            fromDate =
                AppPreference.getInstance(requireContext()).getValue(PreferenceKeys.PN_FROM_DATE)!!

            var hashMap = HashMap<String, String>()
            hashMap.put(
                AppConstants.PN_DATE, CommonUtils.getDateInFormat(
                    DATE_FORMAT_YEAR,
                    DATE_FORMAT_MONTH,
                    fromDate
                )
            )
            filterList.add(hashMap)
        }

        initializeAdapter()

        viewDataBinding!!.tvClear.setOnClickListener {
            name = ""
            minPrice = ""
            maxPrice = ""
            fromDate = ""
            toDate = ""
            transactionType = ""

            page = 1
            filterList.clear()
            textFilterAdapter!!.notifyDataSetChanged()
            transactionList!!.clear()
            transactListAdapter!!.notifyDataSetChanged()

            viewDataBinding!!.viewOne.visibility = View.GONE
            viewDataBinding!!.tvClear.visibility = View.GONE

            AppPreference.getInstance(requireContext())
                .addValue(PreferenceKeys.PN_TYPE, transactionType)
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_NAME, name)
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_MAX_PRICE, "")
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_MIN_PRICE, "")
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_FROM_DATE, "")
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_TO_DATE, "")

            if (checkIfInternetOn()) {
                mTransactionViewModel.callTransactionList(
                    false,
                    AppPreference.getInstance(requireContext()),
                    name,
                    minPrice,
                    maxPrice,
                    fromDate,
                    toDate,
                    transactionType,
                    "0",
                    "10"
                )
            }
        }

        if (checkIfInternetOn()) {
            mTransactionViewModel.callTransactionList(
                false,
                AppPreference.getInstance(requireContext()),
                name,
                minPrice,
                maxPrice,
                fromDate,
                toDate,
                transactionType,
                "0",
                "10"
            )
        } else {
            tryAgain()
        }
    }

    override fun tryAgain() {
        if (CommonUtils.isInternetOn(requireContext())) {
            initializeAdapter()
            viewDataBinding!!.mainLayout.visibility = View.VISIBLE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

            mTransactionViewModel.callTransactionList(
                false,
                AppPreference.getInstance(requireContext()),
                name,
                minPrice,
                maxPrice,
                fromDate,
                toDate,
                transactionType,
                "0",
                "10"
            )
        } else {
            viewDataBinding!!.mainLayout.visibility = View.GONE
            viewDataBinding!!.noInternetConnectionLayout.visibility = View.VISIBLE

            viewDataBinding!!.noInternet.text = getString(R.string.no_internet)
            return
        }
    }

    /**
     * This method is used to show filter dialog
     */
    override fun showFilterDialog() {
        val dialog = BottomSheetDialog(activity!!)
        val bottomSheet = layoutInflater.inflate(R.layout.dialog_filter_transaction, null)

        bottomSheet.etName.setText(name)
        bottomSheet.etMinAmount.setText(minPrice)
        bottomSheet.etMaxAmount.setText(maxPrice)

        if (!fromDate.equals("")) {
            bottomSheet.tvFromDate.setText(
                CommonUtils.getDateInFormat(
                    DATE_FORMAT_YEAR,
                    SIMPLE_DATE_FORMAT,
                    fromDate
                )
            )

            toYear = CommonUtils.getDateInFormat(
                DATE_FORMAT_YEAR,
                "yyyy",
                fromDate
            ).toInt()
            toMonth = (CommonUtils.getDateInFormat(
                DATE_FORMAT_YEAR,
                "MM",
                fromDate
            ).toInt() - 1)
            toDay = CommonUtils.getDateInFormat(
                DATE_FORMAT_YEAR,
                "dd",
                fromDate
            ).toInt()

        } else {
            bottomSheet.tvFromDate.setText(fromDate)
        }

        if (!toDate.equals("")) {
            bottomSheet.tvToDate.setText(
                CommonUtils.getDateInFormat(
                    DATE_FORMAT_YEAR,
                    SIMPLE_DATE_FORMAT,
                    toDate
                )
            )
        } else {
            bottomSheet.tvToDate.setText(toDate)
        }

        bottomSheet.imageCloseDialog.setOnClickListener { dialog.dismiss() }

        conditionForSpinner(bottomSheet)

        bottomSheet.tvReset.setOnClickListener {
            name = ""
            minPrice = ""
            maxPrice = ""
            fromDate = ""
            toDate = ""
            transactionType = ""

            viewDataBinding!!.tvClear.visibility = View.GONE
            viewDataBinding!!.viewOne.visibility = View.GONE

            page = 1
            transactionList!!.clear()
            transactListAdapter!!.notifyDataSetChanged()

            AppPreference.getInstance(requireContext())
                .addValue(PreferenceKeys.PN_TYPE, transactionType)
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_NAME, name)
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_MAX_PRICE, "")
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_MIN_PRICE, "")
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_FROM_DATE, "")
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_TO_DATE, "")

            filterList!!.clear()
            textFilterAdapter!!.notifyDataSetChanged()

            bottomSheet.etName.setText(name)
            bottomSheet.etMinAmount.setText(minPrice)
            bottomSheet.etMaxAmount.setText(maxPrice)
            bottomSheet.tvFromDate.setText(fromDate)
            bottomSheet.tvToDate.setText(toDate)

            if (checkIfInternetOn()) {
                searchFilter = false
                mTransactionViewModel.callTransactionList(
                    false,
                    AppPreference.getInstance(requireContext()),
                    name,
                    minPrice,
                    maxPrice,
                    fromDate,
                    toDate,
                    transactionType,
                    "0",
                    "10"
                )
            }
            dialog.dismiss()
        }

        applyButtonCondition(bottomSheet, dialog)

        bottomSheet.tvFromDate.setOnClickListener {
            val mCurrentDate = Calendar.getInstance()
            val month = mCurrentDate[Calendar.MONTH]
            val day = mCurrentDate[Calendar.DAY_OF_MONTH]
            val year = mCurrentDate[Calendar.YEAR]
            val mDatePicker = DatePickerDialog(
                requireContext(),
                R.style.datepicker,
                DatePickerDialog.OnDateSetListener { datePicker: DatePicker, mYear: Int, mMonth: Int, dayOfMonth: Int ->
                    fromDate = "$mYear-${mMonth + 1}-$dayOfMonth"
                    bottomSheet.tvToDate.setText("")
                    toDate = ""
                    bottomSheet.tvFromDate.setText(
                        CommonUtils.getDateInFormat(
                            DATE_FORMAT_YEAR,
                            SIMPLE_DATE_FORMAT,
                            "$mYear-${mMonth + 1}-$dayOfMonth"
                        )
                    )

                    AppPreference.getInstance(requireContext())
                        .addValue(PreferenceKeys.PN_FROM_DATE, fromDate)

                    toYear = mYear
                    toMonth = mMonth
                    toDay = dayOfMonth
                },
                year,
                month,
                day
            )
            mDatePicker.datePicker.maxDate = System.currentTimeMillis() - 1000
            mDatePicker.show()
        }

        bottomSheet.tvToDate.setOnClickListener {
            if (!CommonUtils.isStringNullOrBlank(fromDate)) {
                val mCurrentDate = Calendar.getInstance()
                mCurrentDate.set(Calendar.YEAR, toYear)
                mCurrentDate.set(Calendar.MONTH, toMonth)
                mCurrentDate.set(Calendar.DAY_OF_MONTH, toDay)

                val mDatePicker = DatePickerDialog(
                    requireContext(),
                    R.style.datepicker,
                    DatePickerDialog.OnDateSetListener { datePicker: DatePicker, mYear: Int, mMonth: Int, dayOfMonth: Int ->
                        try {
                            toDate = "$mYear-${mMonth + 1}-$dayOfMonth"
                            bottomSheet.tvToDate.setText(
                                CommonUtils.getDateInFormat(
                                    DATE_FORMAT_YEAR,
                                    SIMPLE_DATE_FORMAT,
                                    "$mYear-${mMonth + 1}-$dayOfMonth"
                                )
                            )

                            AppPreference.getInstance(requireContext())
                                .addValue(PreferenceKeys.PN_TO_DATE, toDate)
                            AppPreference.getInstance(requireContext())
                                .addValue(PreferenceKeys.PN_FROM_DATE, fromDate)
                        } catch (e: java.lang.Exception) {
                            e.printStackTrace()
                        }
                    },
                    toYear,
                    toMonth,
                    toDay
                )
                mDatePicker.datePicker.minDate = mCurrentDate.timeInMillis
                mDatePicker.datePicker.maxDate = System.currentTimeMillis() - 1000
                mDatePicker.show()
            } else {
                showValidationError("Please select from date.")
            }
        }
        dialog.setContentView(bottomSheet)
        dialog.show()
        dialog.getWindow()!!
            .setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN);
    }

    private fun conditionForSpinner(bottomSheet: View) {
        val transactionTypeList = resources.getStringArray(R.array.TransactionType)
        if (bottomSheet.sp_transaction != null) {
            val adapter =
                ArrayAdapter(requireContext(), R.layout.spinner_transaction, transactionTypeList)
            bottomSheet.sp_transaction.adapter = adapter
        }

        setSpinnerItem(transactionTypeList, bottomSheet)

        bottomSheet.sp_transaction.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(
                    parent: AdapterView<*>,
                    view: View,
                    position: Int,
                    id: Long
                ) {
                    if (!transactionTypeList[position].equals("Transaction Type", true)) {
                        transactionType = transactionTypeList[position]
                        (view as TextView).setTextColor(Color.BLACK)

                        if (transactionType.equals("Added", true)) {
                            transactionType = "deposit"
                        } else if (transactionType.equals("Withdraw", true)) {
                            transactionType = "withdrawal"
                        }
                    } else {
                        transactionType = ""
                        (view as TextView).setTextColor(resources.getColor(R.color.gray_color))
                    }
                }

                override fun onNothingSelected(parent: AdapterView<*>) {
                    // This method is called when nothing selected
                }
            }
    }

    private fun setSpinnerItem(transactionTypeList: Array<String>, bottomSheet: View) {
        if (!transactionType.equals("")) {
            for (i in 0 until transactionTypeList.size) {
                if (transactionType.equals("deposit", true)) {
                    transactionType = "Added"
                } else if (transactionType.equals("withdrawal", true)) {
                    transactionType = "Withdraw"
                }

                if (transactionType.equals(transactionTypeList[i], true)) {
                    bottomSheet.sp_transaction.setSelection(i)
                }
            }
        }
    }

    private fun applyButtonCondition(bottomSheet: View, dialog: BottomSheetDialog) {
        bottomSheet.btnApply.setOnClickListener {
            page = 1
            transactionList!!.clear()
            transactListAdapter!!.notifyDataSetChanged()

            name = bottomSheet.etName.text.toString()
            minPrice = bottomSheet.etMinAmount.text.toString()
            maxPrice = bottomSheet.etMaxAmount.text.toString()

            filterList.clear()
            textFilterAdapter!!.notifyDataSetChanged()

            conditionForTransaction()

            if (!minPrice.equals("") && !maxPrice.equals("")) {
                AppPreference.getInstance(requireContext())
                    .addValue(PreferenceKeys.PN_MAX_PRICE, maxPrice)
                AppPreference.getInstance(requireContext())
                    .addValue(PreferenceKeys.PN_MIN_PRICE, minPrice)
                var hashMap = HashMap<String, String>()
                hashMap.put(AppConstants.PN_PRICE, "${AppPreference.getInstance(requireActivity()).getSavedUser(AppPreference.getInstance(requireActivity())).Country!!.currencyCode} ${minPrice} - ${AppPreference.getInstance(requireActivity()).getSavedUser(AppPreference.getInstance(requireActivity())).Country!!.currencyCode} ${maxPrice}")
                filterList.add(hashMap)
            } else if (!minPrice.equals("") && maxPrice.equals("")) {
                showValidationError("Please enter max price")
                return@setOnClickListener
            } else if (!maxPrice.equals("") && minPrice.equals("")) {
                showValidationError("Please enter min price")
                return@setOnClickListener
            }

            if (!toDate.equals("")) {
                var hashMap = HashMap<String, String>()
                hashMap.put(
                    AppConstants.PN_DATE, "${CommonUtils.getDateInFormat(
                        DATE_FORMAT_YEAR,
                        DATE_FORMAT_MONTH,
                        fromDate
                    )} - ${CommonUtils.getDateInFormat(
                        DATE_FORMAT_YEAR,
                        DATE_FORMAT_MONTH,
                        toDate
                    )}"
                )
                filterList.add(hashMap)
            } else if (!fromDate.equals("")) {
                var hashMap = HashMap<String, String>()
                hashMap.put(
                    AppConstants.PN_DATE, CommonUtils.getDateInFormat(
                        DATE_FORMAT_YEAR,
                        DATE_FORMAT_MONTH,
                        fromDate
                    )
                )
                filterList.add(hashMap)
            }

            if (filterList.size > 0) {
                textFilterAdapter!!.notifyDataSetChanged()
                viewDataBinding!!.tvClear.visibility = View.VISIBLE
                viewDataBinding!!.viewOne.visibility = View.VISIBLE
                viewDataBinding!!.rvFilter.visibility = View.VISIBLE
            }

            if (checkIfInternetOn()) {
                searchFilter = true
                mTransactionViewModel.callTransactionList(
                    false,
                    AppPreference.getInstance(requireContext()),
                    name,
                    minPrice,
                    maxPrice,
                    fromDate,
                    toDate,
                    transactionType,
                    "0",
                    "10"
                )
            }
            dialog.dismiss()
        }
    }

    private fun conditionForTransaction() {
        if (!name.equals("")) {
            AppPreference.getInstance(requireContext()).addValue(PreferenceKeys.PN_NAME, name)
            var hashMap = HashMap<String, String>()
            hashMap.put(AppConstants.PN_NAME, name)
            filterList.add(hashMap)
        }

        if (!transactionType.equals("")) {
            var hashMap = HashMap<String, String>()
            AppPreference.getInstance(requireContext())
                .addValue(PreferenceKeys.PN_TYPE, transactionType)
            hashMap.put(AppConstants.PN_TYPE, transactionType)

            if (transactionType.equals("deposit", true)) {
                hashMap.put(AppConstants.PN_TYPE, "Added")
            } else if (transactionType.equals("withdrawal", true)) {
                hashMap.put(AppConstants.PN_TYPE, "Withdraw")
            }
            filterList.add(hashMap)
        }
    }

    /**
     * This method is used to show network error alert
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

    /**
     * This method is used to initialize an adapter
     */
    private fun initializeAdapter() {
        transactionList = ArrayList()
        linearLayoutManager = LinearLayoutManager(activity!!)
        viewDataBinding!!.recyclerMyTransaction.layoutManager = linearLayoutManager
        transactListAdapter = TransactionListAdapter(
            activity!!,
            transactionList!!, false
        )
        viewDataBinding!!.recyclerMyTransaction.adapter = transactListAdapter

        viewDataBinding!!.recyclerMyTransaction.addItemDecoration(
            DividerItemDecoration(
                viewDataBinding!!.recyclerMyTransaction.getContext(),
                DividerItemDecoration.VERTICAL
            )
        )

        transactListAdapter!!.setOnItemClickListener(object :
            TransactionListAdapter.OnItemClickListener {
            override fun onItemClicked(img: CircleImageView, position: Int) {

                val intent =
                    Intent(requireContext(), TransactionDetailsActivity::class.java)
                intent.putExtra(
                    AppConstants.TRANSACTION_ID,
                    transactionList!![position].id.toString()
                )
                val p1: androidx.core.util.Pair<View?, String> =
                    androidx.core.util.Pair(img as View?, "imagePass")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                    val options =
                        ActivityOptionsCompat.makeSceneTransitionAnimation(
                            activity!!, p1
                        )
                    startActivity(intent, options.toBundle())
                } else {
                    startActivity(intent)
                }
            }
        })

        transactionScrollMethod()

        linearLayoutManager1 = LinearLayoutManager(activity!!)
        linearLayoutManager1!!.orientation = RecyclerView.HORIZONTAL
        viewDataBinding!!.rvFilter.layoutManager = linearLayoutManager1
        textFilterAdapter = TextFilterAdapter(
            activity!!,
            filterList
        )
        viewDataBinding!!.rvFilter.adapter = textFilterAdapter

        viewDataBinding!!.rvFilter.addItemDecoration(
            DividerItemDecoration(
                viewDataBinding!!.rvFilter.getContext(),
                DividerItemDecoration.VERTICAL
            )
        )

        textFilterAdapter!!.setOnItemClickListener(object :
            TextFilterAdapter.OnItemClickListener {
            override fun onItemClicked(position: Int) {
                if (filterList[position].containsKey(AppConstants.PN_DATE)) {
                    fromDate = ""
                    toDate = ""

                    AppPreference.getInstance(requireContext())
                        .addValue(PreferenceKeys.PN_TO_DATE, toDate)
                    AppPreference.getInstance(requireContext())
                        .addValue(PreferenceKeys.PN_FROM_DATE, fromDate)
                } else if (filterList[position].containsKey(AppConstants.PN_PRICE)) {
                    minPrice = ""
                    maxPrice = ""

                    AppPreference.getInstance(requireContext())
                        .addValue(PreferenceKeys.PN_MIN_PRICE, minPrice)
                    AppPreference.getInstance(requireContext())
                        .addValue(PreferenceKeys.PN_MAX_PRICE, maxPrice)
                } else if (filterList[position].containsKey(AppConstants.PN_NAME)) {
                    name = ""

                    AppPreference.getInstance(requireContext())
                        .addValue(PreferenceKeys.PN_NAME, name)
                } else if (filterList[position].containsKey(AppConstants.PN_TYPE)) {
                    transactionType = ""

                    AppPreference.getInstance(requireContext())
                        .addValue(PreferenceKeys.PN_TYPE, transactionType)
                }

                filterList.removeAt(position)
                textFilterAdapter!!.notifyDataSetChanged()

                if (filterList.size == 0) {
                    viewDataBinding!!.rvFilter.visibility = View.GONE
                    viewDataBinding!!.viewOne.visibility = View.GONE
                    viewDataBinding!!.tvClear.visibility = View.GONE
                }

                page = 1
                transactionList!!.clear()
                transactListAdapter!!.notifyDataSetChanged()

                if (checkIfInternetOn()) {
                    mTransactionViewModel.callTransactionList(
                        false,
                        AppPreference.getInstance(requireContext()),
                        name,
                        minPrice,
                        maxPrice,
                        fromDate,
                        toDate,
                        transactionType,
                        "0",
                        "10"
                    )
                }
            }
        })

        if (filterList.size != 0) {
            viewDataBinding!!.rvFilter.visibility = View.VISIBLE
            viewDataBinding!!.viewOne.visibility = View.VISIBLE
            viewDataBinding!!.tvClear.visibility = View.VISIBLE
        }
    }

    private fun transactionScrollMethod() {
        viewDataBinding!!.recyclerMyTransaction.addOnScrollListener(object :
            RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                val visibleItemCount = linearLayoutManager!!.childCount
                val totalItemCount = linearLayoutManager!!.itemCount
                val firstVisibleItemPosition = linearLayoutManager!!.findFirstVisibleItemPosition()

                if (!isLoading && (visibleItemCount + firstVisibleItemPosition >= totalItemCount) && firstVisibleItemPosition >= 0) {
                    loadMoreItems()
                }
            }
        })
    }

    fun loadMoreItems() {
        if (checkIfInternetOn()) {
            isLoading = true
            page += 1
            mTransactionViewModel.callTransactionList(
                true,
                AppPreference.getInstance(requireContext()),
                name,
                minPrice,
                maxPrice,
                fromDate,
                toDate,
                transactionType,
                transactionList!!.size.toString(),
                "10"
            )
        }
    }

    /**
     * This method is used to show bottom progress bar
     */
    override fun showPageLoader() {
        viewDataBinding!!.progress.visibility = View.VISIBLE
    }

    /**
     * This method is used to hide bottom progress bar
     */
    override fun showHideLoader() {
        viewDataBinding!!.progress.visibility = View.GONE
    }

    /**
     * This method is called when getting response after calling API.
     */
    override fun getTransactionListResponse(transactionListResponse: TransactionListResponse) {
        viewDataBinding!!.mainLayout.visibility = View.VISIBLE
        viewDataBinding!!.noInternetConnectionLayout.visibility = View.GONE

        if (transactionListResponse.data!!.rows.isNotEmpty()) {
            viewDataBinding!!.txtNoArticalFound.visibility = View.GONE
            viewDataBinding!!.recyclerMyTransaction.visibility = View.VISIBLE
            transactionList!!.addAll(transactionListResponse.data!!.rows)
            transactListAdapter!!.notifyDataSetChanged()
        } else {
            viewDataBinding!!.txtNoArticalFound.visibility = View.VISIBLE
            viewDataBinding!!.recyclerMyTransaction.visibility = View.GONE
            if (searchFilter == true) {
                viewDataBinding!!.txtNoArticalFound.text =
                    resources.getString(R.string.no_result_found)
            } else {
                viewDataBinding!!.txtNoArticalFound.text =
                    resources.getString(R.string.you_do_not_have_any_transaction)
            }

        }

        isLoading = false
        if (page.toDouble() == CommonUtils.calculatePageLimit(
                transactionListResponse.data!!.total,
                10
            )
        ) {
            isLoading = true
        }
    }
}
