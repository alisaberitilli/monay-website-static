package com.monayuser.ui.home.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.local.AppPreference
import com.monayuser.data.local.PreferenceKeys
import com.monayuser.data.model.bean.PaymentRequest
import com.monayuser.utils.AppConstants
import com.monayuser.utils.CommonUtils
import de.hdodenhof.circleimageview.CircleImageView
import kotlinx.android.synthetic.main.item_payment_request_home.view.*


/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 28-Aug-19.
 * Description : This is CommentAdapter
 */
class PaymentReqAdapter(val context: Context, val items: ArrayList<PaymentRequest>) :
    RecyclerView.Adapter<MyViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(view: View, position: Int)
        fun onDeclineButtonClicked(view: View, position: Int)
        fun onPayButtonClicked(img:CircleImageView,view: View, position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_payment_request_home, parent, false)
        )
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        if (items[position].fromUser.profilePictureUrl != null && !items[position].fromUser.profilePictureUrl.equals("")
        ) {
            CommonUtils.showProfile(
                context,
                items[position].fromUser.profilePictureUrl,
                holder.userIV
            )
        }

        holder.fullName.text = "${items[position].fromUser.firstName} ${items[position].fromUser.lastName}"
        holder.timeTV.text = CommonUtils.getDateInFormatUTC(
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd MMM YYYY, hh:mm a", items[position].createdAt)

        if (items[position].amount.contains(".")) {
            holder.priceTv.text =
                "${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%.2f", items[position].amount.toFloat())}"
        } else {
            holder.priceTv.text = "${AppPreference.getInstance(context).getSavedUser(AppPreference.getInstance(context)).Country!!.currencyCode} ${String.format("%,d", items[position].amount.toLong())}"
        }

        holder.btnDecline.setOnClickListener(View.OnClickListener {
            customClickListener?.onDeclineButtonClicked(holder.itemView, position)
        })

        holder.payText.setOnClickListener(View.OnClickListener {
            customClickListener?.onPayButtonClicked(holder.userIV,holder.itemView, position)
        })
    }

    override fun getItemCount(): Int {
        return items.size
    }
}


class MyViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val userIV = view.userIV
    val timeTV = view.timeTV
    val btnDecline = view.btnDecline
    val priceTv = view.price_tv
    val fullName = view.full_name
    val payText=view.payText
}