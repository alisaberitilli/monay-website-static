package com.monayuser.ui.mycontact.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import com.monayuser.R
import com.monayuser.ui.mycontact.model.Contact
import java.util.*


class ContactsAdapter(context: Context?, contacts: ArrayList<Contact?>?) : ArrayAdapter<Contact?>(
    context!!, 0, contacts!!
) {
    var tempItem: ArrayList<Contact?>? = null
    var items: ArrayList<Contact?>? = null
    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onInviteClicked(position: Int, contact: Contact)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    init {
         tempItem = contacts
        items = contacts
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        // Get the data item
        val contact: Contact? = getItem(position)
        // Check if an existing view is being reused, otherwise inflate the view
        var view = convertView
        if (view == null) {
            val inflater = LayoutInflater.from(context)
            view = inflater.inflate(R.layout.item_all_contact_list, parent, false)
        }
        // Populate the data into the template view using the data object
        val tvName = view!!.findViewById<View>(R.id.userName) as TextView
        val tvInvite = view.findViewById<View>(R.id.inviteText) as TextView
        val tvPhone = view.findViewById<View>(R.id.userContact) as TextView
        tvName.setText(contact!!.name)
//        tvEmail.text = ""
        tvPhone.text = ""

        if (contact.numbers.size > 0 && contact.numbers.get(0) != null) {
            tvPhone.setText(contact.numbers.get(0).number)
        } else {
            tvPhone.setText(contact.phoneNumber)
        }

        tvInvite.setOnClickListener(View.OnClickListener {
            customClickListener?.onInviteClicked(position, contact)
        })

        return view
    }
}