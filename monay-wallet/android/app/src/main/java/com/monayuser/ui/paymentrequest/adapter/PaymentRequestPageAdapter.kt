package com.monayuser.ui.paymentrequest.adapter

import android.content.Context
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentPagerAdapter
import com.monayuser.ui.myrequest.MyRequestFragment
import com.monayuser.ui.subpaymentrequest.SubPaymentRequestFragment
import com.monayuser.utils.AppConstants

class PaymentRequestPageAdapter(
    private val myContext: Context,
    fm: FragmentManager,
    internal var totalTabs: Int,userType:String
) : FragmentPagerAdapter(fm) {

    var userType = userType

    // this is for fragment tabs
    override fun getItem(position: Int): Fragment {

        if (userType.equals(AppConstants.SECONDARY_SIGNUP)) {

            when (position) {

                0-> {
                    return SubPaymentRequestFragment(0)
                }
                1 -> {
                    return SubPaymentRequestFragment(2)
                }
                2 -> {
                    return SubPaymentRequestFragment(3)
                }

                else -> return SubPaymentRequestFragment(0)
            }

        }else{

            when (position) {

                0 -> {

                    return MyRequestFragment()
                }
                1 -> {
                    return SubPaymentRequestFragment(0)
                }
                2 -> {
                    return SubPaymentRequestFragment(2)
                }
                3 -> {
                    return SubPaymentRequestFragment(3)
                }

                else -> return SubPaymentRequestFragment(0)
            }

        }

    }

    // this counts total number of tabs
    override fun getCount(): Int {
        return totalTabs
    }
}