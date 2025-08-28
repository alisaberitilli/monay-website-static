package com.monayuser.ui.blockcontacts.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.utils.CommonUtils

class BlockAdapter(
    val context: Context,
    val items: ArrayList<RecentUserData>,
    val blockStatus: Boolean
) : RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_block_contacts, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
        if (blockStatus) {
            parent.tvUnblock.text = context.getString(R.string.block)
            parent.tvUnblock.setTextColor(context.resources.getColor(R.color.colorPrimary))
            parent.tvUnblock.backgroundTintList =
                (ContextCompat.getColorStateList(context, R.color.colorPrimary)!!)

            if (items[position].profilePictureUrl != null && !items[position].profilePictureUrl.equals(
                    ""
                )
            ) {
                CommonUtils.showProfile(
                    context,
                    items[position].profilePictureUrl,
                    parent.ivUser
                )
            }

            parent.fullName.text = "${items[position].firstName} ${items[position].lastName}"
            parent.tvContact.text =
                "${items[position].phoneNumberCountryCode}${items[position].phoneNumber}"
        } else {
            parent.tvUnblock.text = context.getString(R.string.unblock)
            parent.tvUnblock.setTextColor(context.resources.getColor(R.color.red))
            parent.tvUnblock.backgroundTintList =
                (ContextCompat.getColorStateList(context, R.color.red)!!)

            if (items[position].blockUser!!.profilePictureUrl != null && !items[position].blockUser!!.profilePictureUrl.equals(
                    ""
                )
            ) {
                CommonUtils.showProfile(
                    context,
                    items[position].blockUser!!.profilePictureUrl,
                    parent.ivUser
                )
            }

            parent.fullName.text =
                "${items[position].blockUser!!.firstName} ${items[position].blockUser!!.lastName}"
            parent.tvContact.text =
                "${items[position].blockUser!!.phoneNumberCountryCode}${items[position].blockUser!!.phoneNumber}"
        }

        parent.tvUnblock.setOnClickListener(View.OnClickListener {
            customClickListener?.onItemClicked(position)
        })
    }

    override fun getItemCount(): Int {
        return items.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val ivUser = view.iv_user
    val tvContact = view.tv_contact
    val tvUnblock = view.tv_unblock
    val fullName = view.tv_name
}