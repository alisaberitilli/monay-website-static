package com.monayuser.ui.mycontact.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.ui.mycontact.NoRecentFoundListener
import com.monayuser.utils.CommonUtils

class MyRecentContactAdapter(val context: Context, var items: ArrayList<RecentUserData>) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null
    var tempItem: ArrayList<RecentUserData>? = items
    private var noContactFoundListener: NoRecentFoundListener? = null

    interface OnItemClickListener {
        fun onItemClicked(items: RecentUserData)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun getItemCount(): Int {
        return items.size
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.userName.text = items[position].firstName + " " + items[position].lastName

        if (items[position].profilePictureUrl != null && !items[position].profilePictureUrl.equals("")
        ) {
            CommonUtils.showProfile(
                context,
                items[position].profilePictureUrl,
                holder.userImage
            )
        }
        holder.contactLayout.setOnClickListener(View.OnClickListener {
            customClickListener?.onItemClicked(items.get(position))

        })
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_recent_contact_list, parent, false)
        )
    }

    fun noContactView(noContactFoundListener1: NoRecentFoundListener) {
        this.noContactFoundListener = noContactFoundListener1
    }

    fun filter(text: String) {
        var text = text
        text = text.toLowerCase()
        items = ArrayList<RecentUserData>()
        items.clear()
        if (text.length == 0) {
            tempItem?.let { items.addAll(it) }
            noContactFoundListener?.noRecentFound(1, text)
        } else {
            val filterPattern = text.toLowerCase().trim { it <= ' ' }
            for (map: RecentUserData in tempItem!!) {
                if ("${map.firstName} ${map.lastName}".toString().toLowerCase()
                        .contains(filterPattern) || map.phoneNumber!!.toString().toLowerCase()
                        .contains(filterPattern)
                ) {
                    items.add(map)
                }
            }
            if (items.size > 0) {
                noContactFoundListener?.noRecentFound(1, text)
            } else {
                noContactFoundListener?.noRecentFound(0, text)
            }
        }
        notifyDataSetChanged()
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val userName = view.userName
    val userImage = view.userImage
    val contactLayout = view.recentContactLayout
}