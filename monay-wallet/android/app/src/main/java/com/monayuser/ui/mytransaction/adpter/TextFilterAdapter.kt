package com.monayuser.ui.mytransaction.adpter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.utils.AppConstants

class TextFilterAdapter(
    val context: Context,
    val items: ArrayList<HashMap<String, String>>
) : RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.row_filter_item, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
        if (items[position].containsKey(AppConstants.PN_NAME))
            parent.tvFilter.text = items[position][AppConstants.PN_NAME]
        else if (items[position].containsKey(AppConstants.PN_DATE))
            parent.tvFilter.text = items[position][AppConstants.PN_DATE]
        else if (items[position].containsKey(AppConstants.PN_PRICE))
            parent.tvFilter.text = items[position][AppConstants.PN_PRICE]
        else
            parent.tvFilter.text = items[position][AppConstants.PN_TYPE]

        parent.icCross.setOnClickListener(View.OnClickListener {
            customClickListener?.onItemClicked(position)
        })
    }

    override fun getItemCount(): Int {
        return items.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val icCross = view.ic_cross
    val tvFilter = view.tv_filter
}