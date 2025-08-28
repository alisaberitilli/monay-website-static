package com.monayuser.ui.scan.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.ui.mycontact.NoContactFoundListener

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 28-Aug-19.
 * Description : This is CommentAdapter
 */
class RecentContactAdapter(
    val context: Context,
    var items: ArrayList<HashMap<String, String>>
) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null
    var tempItem: ArrayList<HashMap<String, String>>? = items
    private var noContactFoundListener: NoContactFoundListener? = null

    interface OnItemClickListener {
        fun onItemClicked(position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_recent_contact_scan, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.contactLayout.setOnClickListener {
            customClickListener?.onItemClicked(position)
        }
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
        items = ArrayList<HashMap<String, String>>()
        items.clear()
        if (text.length == 0) {
            tempItem?.let { items.addAll(it) }
            noContactFoundListener?.noContactFound(1, text)
        } else {
            val filterPattern = text.toLowerCase().trim { it <= ' ' }
            for (map in tempItem!!) {
                if (map["name"]!!.toLowerCase().contains(filterPattern)) {
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

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val userName: android.widget.TextView = itemView.findViewById(R.id.userName)
    val userImage: de.hdodenhof.circleimageview.CircleImageView = itemView.findViewById(R.id.userImage)
    val contactLayout: android.widget.RelativeLayout = itemView.findViewById(R.id.recentContactLayout)
}