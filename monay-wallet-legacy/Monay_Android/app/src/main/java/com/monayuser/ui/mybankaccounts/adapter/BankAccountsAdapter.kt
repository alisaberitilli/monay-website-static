package com.monayuser.ui.mybankaccounts.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.CardBean
import kotlinx.android.synthetic.main.row_bank_account.view.*

class BankAccountsAdapter(val context: Context, val bankList: ArrayList<CardBean>?) :
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
            LayoutInflater.from(context).inflate(R.layout.row_bank_account, parent, false)
        )
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvName.text = bankList!![position].bankName
        holder.tvAccount.text = "xxxx ${bankList[position].last4Digit}"
        holder.ivDelete.setOnClickListener(View.OnClickListener {
            customClickListener?.onItemClicked(holder.itemView, position)
        })
    }

    override fun getItemCount(): Int {
        return bankList!!.size
    }
}

class MyViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val tvName = view.tv_name
    val tvAccount = view.tv_account
    val ivDelete = view.iv_delete
}