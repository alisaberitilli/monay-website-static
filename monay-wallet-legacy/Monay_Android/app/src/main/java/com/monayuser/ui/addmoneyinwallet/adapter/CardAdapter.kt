package com.monayuser.ui.addmoneyinwallet.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.monayuser.R
import com.monayuser.ui.addmoneyinwallet.AddMoneyActivity
import com.monayuser.ui.paymoney.PayMoneyActivity
import kotlinx.android.synthetic.main.row_item_card.view.*

class CardAdapter(
    val context: Context,
    val items: ArrayList<com.monayuser.data.model.bean.CardBean>,
    val addMoneyStatus: Boolean
) :
    RecyclerView.Adapter<ViewHolder>() {
    var selectedPosition = -1
    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(view: View, position: Int)
        fun onItemChecked(view: View, cardBean: com.monayuser.data.model.bean.CardBean)
    }

    fun setOntemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.row_item_card, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, p1: Int) {
        if (selectedPosition == p1) {
            parent.bankCard.setChecked(true) //using selector drawable
            parent.llCvv.visibility = View.VISIBLE
        } else {
            parent.bankCard.setChecked(false)
            parent.llCvv.visibility = View.GONE
        }

        setCardImage(parent, p1)

        if (addMoneyStatus) {
            parent.btnPay.text = context.resources.getString(R.string.add)
        } else {
            parent.btnPay.text = context.resources.getString(R.string.pay)
        }
        parent.card_bank_name.text = items[p1].nameOnCard
        parent.tvLastDigit.text = "xxxx ${items.get(p1).last4Digit}"
        parent.itemView.setOnClickListener(View.OnClickListener {
            if (!items[p1].isExpired) {
                selectedPosition = p1
                customClickListener?.onItemChecked(parent.itemView, items.get(p1))
                notifyDataSetChanged()
            } else if (addMoneyStatus) {
                (context as AddMoneyActivity).showValidationError(context.resources.getString(R.string.your_card_is_expired))
            } else {
                (context as PayMoneyActivity).showValidationError(context.resources.getString(R.string.your_card_is_expired))
            }
        })

        parent.bankCard.setOnClickListener {
            if (!items[p1].isExpired) {
                selectedPosition = p1
                customClickListener?.onItemChecked(parent.itemView, items.get(p1))
                notifyDataSetChanged()
            } else if (addMoneyStatus) {
                (context as AddMoneyActivity).showValidationError(context.resources.getString(R.string.your_card_is_expired))
            } else {
                (context as PayMoneyActivity).showValidationError(context.resources.getString(R.string.your_card_is_expired))
                parent.bankCard.isChecked = false
            }
        }

        parent.btnPay.setOnClickListener({
            customClickListener!!.onItemClicked(parent.itemView, p1)
        })
    }

    private fun setCardImage(parent: ViewHolder, p1: Int) {
        try {
            if (items[p1].cardIconUrl != null && !items[p1].cardIconUrl.equals("")) {
                Glide.with(context).load(items[p1].cardIconUrl)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().placeholder(R.mipmap.ic_default_card).dontAnimate())
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .into(parent.cardIV)
            } else {
                parent.cardIV.setImageResource(R.mipmap.ic_default_card)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun getItemCount(): Int {
        return items.size
    }

    fun updateUi() {
        selectedPosition = -1
        notifyDataSetChanged()
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {

    val cardIV = view.cardIV
    val bankCard = view.radioBankCard
    val card_bank_name = view.card_bank_name
    val tvLastDigit = view.tvLastDigit
    val llCvv = view.ll_cvv
    val etCvv = view.etCvv
    val btnPay = view.btn_pay
}