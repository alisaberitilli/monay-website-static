package com.monayuser.ui.paymoneyfromprimarywallet.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.model.bean.PrimaryAccountUser
import kotlinx.android.synthetic.main.item_pay_from_primary_user.view.*
import com.monayuser.data.model.bean.PrimaryUserData


class PrimaryUserAdapter (val context: Context, val primaryUserList: ArrayList<PrimaryAccountUser>?) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null
    var checkedPosition = -1
    interface OnItemClickListener {
        fun onItemClicked(item: PrimaryAccountUser, position: Int)
    }

    fun setOntemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_pay_from_primary_user, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
        if (checkedPosition==position)
        {
            parent.radioButton.isChecked=true
        }
        else
        {
            parent.radioButton.isChecked=false
        }
        parent.tvUserName.text = primaryUserList!![position].parent!!.firstName+" "+primaryUserList!![position].parent!!.lastName
        parent.tvUserNumber.text = primaryUserList!![position].parent!!.phoneNumberCountryCode+" "+primaryUserList!![position].parent!!.phoneNumber


        var currencyStr=  AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode

        parent.tvUserAmount.text = currencyStr+" "+primaryUserList!![position].remainAmount.toString()
        parent.radioButton.setOnCheckedChangeListener { compoundButton, b ->
            if (b) {
                parent.radioButton.isChecked=true
                checkedPosition=position
                notifyDataSetChanged()
                customClickListener?.onItemClicked(primaryUserList!![position], position)
            }
        }

    }


    override fun getItemCount(): Int {
        return primaryUserList!!.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val tvUserName = view.tvName
    val tvUserNumber = view.tvNumber
    val tvUserAmount = view.tvAmount
    val radioButton=view.radioUserSelect

}