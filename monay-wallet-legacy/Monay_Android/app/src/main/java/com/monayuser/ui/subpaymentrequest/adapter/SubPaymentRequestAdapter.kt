package com.monayuser.ui.subpaymentrequest.adapter

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
import com.monayuser.utils.CommonUtils
import de.hdodenhof.circleimageview.CircleImageView
import kotlinx.android.synthetic.main.row_received_paid_decline_request.view.*
import java.lang.Exception

class SubPaymentRequestAdapter(
    val context: Context,
    val items: ArrayList<RecentTransaction>,
    val index: Int
) : RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClickedPay(img:CircleImageView,recentTransaction: RecentTransaction)
        fun onItemClickedDeclined(recentTransaction: RecentTransaction, position: Int)
        fun onItemClicked(img:CircleImageView,position: Int)
    }

    fun setOntemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(
                R.layout.row_received_paid_decline_request,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
        try {
            parent.timeTV.text = CommonUtils.getDateInFormatUTC(
                "yyyy-MM-dd'T'HH:mm:ss",
                "dd MMM YYYY, hh:mm a", items[position].createdAt
            )

            if (index == 0) {
                parent.bottom_view.visibility = View.VISIBLE
                parent.paymenntStatus.visibility = View.GONE
            } else if (index == 1) {
                parent.bottom_view.visibility = View.GONE
                parent.paymenntStatus.visibility = View.VISIBLE

                parent.paymenntStatus.text = items[position].status.capitalize()

                if (items[position].status.equals("pending")) {
                    parent.paymenntStatus.setTextColor(context.resources.getColor(R.color.yellowish))
                } else if (items[position].status.equals(
                        "failed",
                        true
                    ) || items[position].status.equals("declined", true)
                ) {
                    parent.paymenntStatus.setTextColor(context.resources.getColor(R.color.status_color))
                } else {
                    parent.paymenntStatus.text = "Paid"
                    parent.paymenntStatus.setTextColor(context.resources.getColor(R.color.success_text))
                }
            } else {
                parent.bottom_view.visibility = View.GONE
                parent.paymenntStatus.visibility = View.GONE

                parent.timeTV.text = CommonUtils.getDateInFormatUTC(
                    "yyyy-MM-dd'T'HH:mm:ss",
                    "dd MMM YYYY, hh:mm a", items[position].updatedAt
                )
            }

            parent.payText.setOnClickListener(View.OnClickListener {
                customClickListener?.onItemClickedPay(parent.userIV,items.get(position))
            })
            parent.declineText.setOnClickListener(View.OnClickListener {
                customClickListener?.onItemClickedDeclined(items.get(position), position)
            })

            parent.itemView.setOnClickListener(View.OnClickListener {
                customClickListener?.onItemClicked(parent.userIV,position)
            })

            setPaymentData(parent, position)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun setPaymentData(parent: ViewHolder, position: Int) {
        if (items[position].toUser != null && items[position].toUser!!.profilePictureUrl != null) {
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
        }


        if (items[position].amount.contains(".")) {
            parent.priceTv.text =
                "${AppPreference.getInstance(context!!).getSavedUser(AppPreference.getInstance(context!!)).Country!!.currencyCode} ${String.format("%.2f", items[position].amount.toFloat())}"
        } else {
            parent.priceTv.text = "${AppPreference.getInstance(context!!).getSavedUser(AppPreference.getInstance(context!!)).Country!!.currencyCode} ${String.format("%,d", items[position].amount.toLong())}"
        }

        if (items[position].message != null && !items[position].message.equals("")) {
            parent.tvMessage.text = items[position].message
            parent.tvMessage.visibility = View.VISIBLE
        } else {
            parent.tvMessage.visibility = View.GONE
        }
    }

    override fun getItemCount(): Int {
        return items.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val bottom_view = view.bottom_view
    val payText = view.payText
    val declineText = view.declineText
    val paymenntStatus = view.payment_status
    val timeTV = view.timeTV
    val fullName = view.full_name
    val priceTv = view.price_tv
    val userIV = view.userIV
    val tvMessage = view.tv_message
}