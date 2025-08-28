package com.monayuser.ui.withdrawal.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.RecentTransaction
import com.monayuser.utils.AppConstants
import android.widget.TextView
import com.monayuser.utils.CommonUtils

class WithdrawalAdapter(val context: Context, val items: ArrayList<RecentTransaction>) :
    RecyclerView.Adapter<MyViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(view: View, position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.row_withdrawal_history, parent, false)
        )
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvName.text = items[position].bankName
        holder.tvAccount.text = "xxxx ${items[position].last4Digit}"
        holder.tvTransactionId.text = items[position].transactionId
        holder.tvAmount.text = "${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%.2f", items[position].amount.toFloat())}"

        if (items[position].paymentStatus.equals("pending", true)) {
            holder.tvStatus.setTextColor(context.resources.getColor(R.color.yellowish))
            holder.tvStatus.text = "In Progress"
        } else if (items[position].paymentStatus.equals("completed", true)) {
            holder.tvStatus.text = items[position].paymentStatus.capitalize()
            holder.tvStatus.setTextColor(context.resources.getColor(R.color.success_text))
        } else if (items[position].paymentStatus.equals("cancelled", true)) {
            holder.tvStatus.setTextColor(context.resources.getColor(R.color.status_color))
            holder.tvStatus.text = "Rejected"
        } else {
            holder.tvStatus.setTextColor(context.resources.getColor(R.color.status_color))
            holder.tvStatus.text = items[position].paymentStatus.capitalize()
        }

        holder.tvTime.text = CommonUtils.getDateInFormatUTC(
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd MMM YYYY, hh:mm a", items[position].createdAt
        )

        holder.itemView.setOnClickListener(View.OnClickListener {
            customClickListener?.onItemClicked(holder.itemView, position)
        })
    }

    override fun getItemCount(): Int {
        return items.size
    }
}

class MyViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val tvName: TextView = view.findViewById(R.id.tv_name)
    val tvAccount: TextView = view.findViewById(R.id.tv_account)
    val tvTransactionId: TextView = view.findViewById(R.id.tv_transaction_id)
    val tvTime: TextView = view.findViewById(R.id.tv_time)
    val tvAmount: TextView = view.findViewById(R.id.tv_amount)
    val tvStatus: TextView = view.findViewById(R.id.tvStatus)
}