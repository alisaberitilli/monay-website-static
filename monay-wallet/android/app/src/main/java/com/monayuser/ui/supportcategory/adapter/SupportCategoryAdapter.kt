package com.monayuser.ui.supportcategory.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.utils.AppConstants

class SupportCategoryAdapter(val context: Context, var items: ArrayList<HashMap<String, String>>) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(items: HashMap<String, String>, position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_support_category, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.tvSupportCategory.text = items[position][AppConstants.PN_NAME]

        holder.itemView.setOnClickListener {
            customClickListener!!.onItemClicked(items[position], position)
        }
    }

    override fun getItemCount(): Int {
        return items.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val tvSupportCategory: android.widget.TextView = itemView.findViewById(R.id.tv_support_category)
}