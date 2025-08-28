package com.monayuser.ui.mycontact.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.RecentUserData
import com.monayuser.ui.mycontact.NoContactFoundListener
import com.monayuser.utils.CommonUtils
import kotlinx.android.synthetic.main.item_contact_list.view.*

class NewMonayContactAdapter (val context: Context, var items: ArrayList<RecentUserData>) :
    RecyclerView.Adapter<ViewHolderMonay>() {

    private var customClickListener: OnItemClickListener? = null
    var tempItem: ArrayList<RecentUserData>? = items
    private var noContactFoundListener: NoContactFoundListener? = null

    interface OnItemClickListener {
        fun onItemClicked(recentUserData: RecentUserData)
        fun onInviteClicked(position: Int, recentUserData: RecentUserData)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderMonay {
        return ViewHolderMonay(
            LayoutInflater.from(context).inflate(R.layout.item_contact_list, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolderMonay, position: Int) {
        try {
            holder.userContact.setText(
                items[position].phoneNumberCountryCode + "" + items[position].phoneNumber
            )
//            if (items[position].isMonayUser!!) {
                holder.inviteText.visibility = View.GONE
//            } else {
//                holder.inviteText.visibility = View.VISIBLE
//            }


            holder.userName.setText(items[position].firstName + " " + items[position].lastName)

            CommonUtils.showProfile(
                    context,
                    items[position].profilePictureUrl,
                    holder.userImage
                )


            holder.contactLayout.setOnClickListener(View.OnClickListener {
                customClickListener?.onItemClicked(items[position])
            })
            holder.inviteText.setOnClickListener(View.OnClickListener {
                customClickListener?.onInviteClicked(position, items[position])
            })
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun getItemViewType(position: Int): Int {
        return position
    }

    override fun getItemCount(): Int {
        return items.size
    }

    fun noContactView(noContactFoundListener1: NoContactFoundListener) {
        this.noContactFoundListener = noContactFoundListener1
    }

    fun filter(text: String) {
        var text = text
        text = text.toLowerCase()
        items = ArrayList<RecentUserData>()
        items.clear()
        if (text.length == 0) {
            tempItem?.let { items.addAll(it) }
            noContactFoundListener?.noContactFound(1, text)
        } else {
            val filterPattern = text.toLowerCase().trim { it <= ' ' }
            for (map in tempItem!!) {
                if ((map.firstName +" "+map.lastName).toLowerCase()
                        .contains(filterPattern) || map.phoneNumber!!.toString().toLowerCase()
                        .contains(filterPattern)
                ) {
                    items.add(map)
                }
            }
            if (items.size > 0) {
                noContactFoundListener?.noContactFound(1, text)
            } else {
                noContactFoundListener?.noContactFound(0, text)
            }
        }
        notifyDataSetChanged()
    }
}

class ViewHolderMonay(view: View) : RecyclerView.ViewHolder(view) {
    val userName = view.userName
    val userContact = view.userContact
    val userImage = view.userImage
    val contactLayout = view.contactLayout
    val inviteText = view.inviteText
    val headingText = view.heading
}