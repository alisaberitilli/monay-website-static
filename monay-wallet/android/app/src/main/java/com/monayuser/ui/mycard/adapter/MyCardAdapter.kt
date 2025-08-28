package com.monayuser.ui.mycard.adapter


import android.content.Context
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.monayuser.R
import com.monayuser.data.model.bean.CardBean

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 28-Aug-19.
 * Description : This is Card Adapter
 */
class MyCardAdapter(val context: Context, val cardList: ArrayList<CardBean>?) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(view: View, position: Int)
    }

    fun setOntemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_my_card_list, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
        parent.tvExpiryDate.text =
            "${cardList!![position].month}/${cardList!![position].year!!.substring(2)}"
        parent.tvCardHolderName.text = cardList[position].nameOnCard!!
        parent.tvLastNumber.text = cardList[position].last4Digit!!

        try {
            if (cardList[position].cardIconUrl != null && !cardList[position].cardIconUrl.equals("")
            ) {
                Glide.with(context).load(cardList[position].cardIconUrl)
                    .thumbnail(0.5f)
                    .apply(RequestOptions().placeholder(R.mipmap.ic_default_card).dontAnimate())
                    .apply(RequestOptions().diskCacheStrategy(DiskCacheStrategy.ALL))
                    .into(parent.ivCardType)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        parent.ivDelete.setOnClickListener(View.OnClickListener {
            customClickListener?.onItemClicked(parent.itemView, position)

        })

        if (position % 2 == 1) {
            parent.clMain.setBackgroundColor(context.resources.getColor(R.color.light_blue_card))
        } else {
            parent.clMain.setBackgroundColor(context.resources.getColor(R.color.dark_blue))
        }
    }

    override fun getItemCount(): Int {
        return cardList!!.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val tvExpiryDate = view.tvExpiryDate
    val tvCardHolderName = view.tvCardHolderName
    val tvLastNumber = view.tvLastNumber
    val ivDelete = view.ivDelete
    val ivCardType = view.iv_card_type
    val cvMain = view.cv_main
    val clMain = view.cl_main
}