package com.monayuser.ui.secondaryusertransaction.adapter

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.local.AppPreference

import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.utils.CommonUtils
import de.hdodenhof.circleimageview.CircleImageView


class SecondaryUserTransactionAdapter (val context: Context,
val items: ArrayList<RecentTransaction>,
val homeStatus: Boolean
) : RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(img: CircleImageView, position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_transaction_list, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
        if (items[position].actionType.equals("deposit", true)) {
            depositCondition(parent, position)
        } else if (items[position].actionType.equals(
                "withdraw",
                true
            ) || items[position].actionType.equals("withdrawal", true)
        ) {
            withdrawCondition(parent, position)
        } else {
            elseCondition(parent, position)
        }

        if (items[position].status.equals("failed", true)) {
            parent.tvStatus.text = items[position].status.capitalize()
            parent.tvStatus.setTextColor(context.resources.getColor(R.color.red))
        }

        parent.timeTV.text = CommonUtils.getDateInFormatUTC(
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd MMM YYYY, hh:mm a", items[position].createdAt
        )

        parent.tvTransactionId.text = items[position].transactionId

        parent.itemView.setOnClickListener(View.OnClickListener {
            Log.e(javaClass.name, "Transaction Id >>>>>"+items!![position].id.toString())
            customClickListener?.onItemClicked(parent.userIV,position)
        })
    }

    private fun elseCondition(parent: ViewHolder, position: Int) {
        if (items[position].actionType==context.getString(R.string.transfer_action))
        {
            if (items[position].toUser!!.profilePictureUrl != null && !items[position].toUser!!.profilePictureUrl.equals(
                    ""
                )
            ) {
                CommonUtils.showProfile(
                    context,
                    items[position].toUser!!.profilePictureUrl,
                    parent.userIV
                )
            }
            parent.fullName.text =
                "${items[position].toUser!!.firstName} ${items[position].toUser!!.lastName}"


            parent.tvStatus.text = context.getString(R.string.transfer)
            parent.tvStatus.setTextColor(context.resources.getColor(R.color.red))
            if (items[position].amount.contains(".")) {
                parent.textAmount.text =
                    "- ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%.2f", items[position].amount.toFloat())}"
            } else {
                parent.textAmount.text =
                    "- ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%,d", items[position].amount.toLong())}"
            }
        }
        else {
            if (items[position].fromUser!!.profilePictureUrl != null && !items[position].fromUser!!.profilePictureUrl.equals(
                    ""
                )
            ) {
                CommonUtils.showProfile(
                    context,
                    items[position].fromUser!!.profilePictureUrl,
                    parent.userIV
                )
            }
            parent.fullName.text =
                "${items[position].fromUser!!.firstName} ${items[position].fromUser!!.lastName}"


            parent.tvStatus.text = context.getString(R.string.added)
            parent.tvStatus.setTextColor(context.resources.getColor(R.color.success_text))
            if (items[position].amount.contains(".")) {
                parent.textAmount.text =
                    "+ ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%.2f", items[position].amount.toFloat())}"
            } else {
                parent.textAmount.text =
                    "+ ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%,d", items[position].amount.toLong())}"
            }
        }
    }

    private fun withdrawCondition(parent: ViewHolder, position: Int) {
        if (items[position].fromUser!!.profilePictureUrl != null && !items[position].fromUser!!.profilePictureUrl.equals(
                ""
            )
        ) {
            CommonUtils.showProfile(
                context,
                items[position].fromUser!!.profilePictureUrl,
                parent.userIV
            )
        }
        parent.fullName.text =
            "${items[position].fromUser!!.firstName} ${items[position].fromUser!!.lastName}"

        parent.tvStatus.text = context.getString(R.string.withdrawal)
        parent.tvStatus.setTextColor(context.resources.getColor(R.color.red))
        if (items[position].amount.contains(".")) {
            parent.textAmount.text =
                "- ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%.2f", items[position].amount.toFloat())}"
        } else {
            parent.textAmount.text =
                "- ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%,d", items[position].amount.toLong())}"
        }
    }

    private fun depositCondition(parent: ViewHolder, position: Int) {
        if (items[position].toUser!!.profilePictureUrl != null && !items[position].toUser!!.profilePictureUrl.equals(
                ""
            )
        ) {
            CommonUtils.showProfile(
                context,
                items[position].toUser!!.profilePictureUrl,
                parent.userIV
            )
        }
        parent.fullName.text =
            "${items[position].toUser!!.firstName} ${items[position].toUser!!.lastName}"

        parent.tvStatus.text = context.getString(R.string.added)
        parent.tvStatus.setTextColor(context.resources.getColor(R.color.success_text))
        if (items[position].amount.contains(".")) {
            parent.textAmount.text =
                "+ ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%.2f", items[position].amount.toFloat())}"
        } else {
            parent.textAmount.text =
                "+ ${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%,d", items[position].amount.toLong())}"
        }
    }

    override fun getItemCount(): Int {
        return items.size
    }

    override fun getItemViewType(position: Int): Int {
        return position
    }
}


class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val userIV: de.hdodenhof.circleimageview.CircleImageView = itemView.findViewById(R.id.imageUser)
    val timeTV: android.widget.TextView = itemView.findViewById(R.id.tv_time)
    val fullName: android.widget.TextView = itemView.findViewById(R.id.tv_name)
    val textAmount: android.widget.TextView = itemView.findViewById(R.id.textAmount)
    val tvStatus: android.widget.TextView = itemView.findViewById(R.id.tvStatus)
    val tvTransactionId: android.widget.TextView = itemView.findViewById(R.id.tv_transaction_id)


}