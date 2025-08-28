package com.monayuser.ui.notification.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.NotificationRow
import com.monayuser.utils.CommonUtils

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 28-Aug-19.
 * Description : This is CommentAdapter
 */
class NotificationAdapter(val context: Context, var items: ArrayList<NotificationRow>) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(notificationRow: NotificationRow, position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.row_notification, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        if (items[position].message.contains("{name}"))
            holder.tvNotification.text = "${items[position].message.replace(
                "{name}",
                "${items[position].user.firstName} ${items[position].user.lastName}"
            )}"
        else
            holder.tvNotification.text = items[position].message

        holder.timeTV.text = CommonUtils.getDateInFormatUTC(
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd MMM YYYY, hh:mm a", items[position].createdAt
        )

        if (items[position].user.profilePictureUrl != null && !items[position].user.profilePictureUrl.equals(
                ""
            )
        ) {
            CommonUtils.showProfile(
                context,
                items[position].user!!.profilePictureUrl,
                holder.userIV
            )
        }
    }

    override fun getItemCount(): Int {
        return items.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val userIV: de.hdodenhof.circleimageview.CircleImageView = itemView.findViewById(R.id.userIV)
    val timeTV: android.widget.TextView = itemView.findViewById(R.id.timeTV)
    val tvNotification: android.widget.TextView = itemView.findViewById(R.id.tv_notification)
}