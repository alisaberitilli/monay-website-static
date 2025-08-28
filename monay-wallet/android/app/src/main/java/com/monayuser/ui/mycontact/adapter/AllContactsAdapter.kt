package com.monayuser.ui.mycontact.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.ui.mycontact.NoAllContactFoundListener
import com.monayuser.ui.mycontact.model.Contact

class AllContactsAdapter(val context: Context, var items: ArrayList<Contact?>) :
    RecyclerView.Adapter<ViewHolderAll>() {

    private var customClickListener: OnItemClickListener? = null
    var tempItem: ArrayList<Contact?>? = items
    private var noContactFoundListener: NoAllContactFoundListener? = null

    interface OnItemClickListener {
        fun onInviteClicked(position: Int, contact: Contact)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderAll {
        return ViewHolderAll(
            LayoutInflater.from(context).inflate(R.layout.item_contact_list, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolderAll, position: Int) {
        if (items[position]!!.numbers.size > 0 && items[position]!!.numbers[0] != null) {
            holder.userContact.text = items[position]!!.numbers[0].number.toString()
        } else {
            holder.userContact.text = items[position]!!.phoneNumber
        }

        holder.userName.setText(items[position]!!.name)

        holder.inviteText.setOnClickListener(View.OnClickListener {
                customClickListener?.onInviteClicked(position, items[position]!!)
            })
    }

    override fun getItemViewType(position: Int): Int {
        return position
    }

    override fun getItemCount(): Int {
        return items.size
    }

    fun noContactView(noContactFoundListener1: NoAllContactFoundListener) {
        this.noContactFoundListener = noContactFoundListener1
    }

    fun filter(text: String) {
        var text = text
        text = text.toLowerCase()
        items = ArrayList<Contact?>()
        items.clear()
        if (text.length == 0) {
            tempItem?.let { items.addAll(it) }
            noContactFoundListener?.noAllContactFound(1, text)
        } else {
            filterCondition(text)
        }
        notifyDataSetChanged()
    }

    private fun filterCondition(text: String) {
        val filterPattern = text.toLowerCase().trim { it <= ' ' }
        for (map in tempItem!!) {
            if (map!!.numbers.size > 0 && map!!.numbers[0] != null) {
                if (map!!.name!!.toLowerCase()
                        .contains(filterPattern) || map!!.numbers[0].toString()
                        .contains(filterPattern)
                ) {
                    items.add(map)
                }
            } else {
                if (map!!.name!!.toLowerCase()
                        .contains(filterPattern) || map!!.phoneNumber.toString()
                        .contains(filterPattern)
                ) {
                    items.add(map)
                }
            }
        }

        if (items.size > 0) {
            noContactFoundListener?.noAllContactFound(1, text)
        } else {
            noContactFoundListener?.noAllContactFound(0, text)
        }
    }
}

class ViewHolderAll(view: View) : RecyclerView.ViewHolder(view) {
    val userName = view.userName
    val userContact = view.userContact
    val userImage = view.userImage
    val contactLayout = view.contactLayout
    val inviteText = view.inviteText
    val headingText = view.heading
}
