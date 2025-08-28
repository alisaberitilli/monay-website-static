package com.monayuser.ui.wallet.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.local.PreferenceKeys.CURRENCY_ABBREVIATIONS
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.utils.CommonUtils
import android.widget.TextView
import de.hdodenhof.circleimageview.CircleImageView

class WalletTransactionAdapter(val context: Context, val items: ArrayList<RecentTransaction>) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(img:CircleImageView,position: Int)
    }

    fun setOntemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.row_wallet, parent, false)
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
            withdrawalCondition(parent, position)
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
            customClickListener?.onItemClicked(parent.userIV,position)
        })
    }

    private fun elseCondition(parent: ViewHolder, position: Int) {
        if (items[position]!!.toUser != null && (items[position].toUser!!.id != AppPreference.getInstance(context)
                .getSavedUser(AppPreference.getInstance(context)).id)
        ) {
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
        } else {
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

    private fun withdrawalCondition(parent: ViewHolder, position: Int) {
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
}


class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val userIV: CircleImageView = view.findViewById(R.id.imageUser)
    val timeTV: TextView = view.findViewById(R.id.tv_time)
    val textAmount: TextView = view.findViewById(R.id.textAmount)
    val fullName: TextView = view.findViewById(R.id.tv_name)
    val tvStatus: TextView = view.findViewById(R.id.tvStatus)
    val tvTransactionId: TextView = view.findViewById(R.id.tv_transaction_id)
}