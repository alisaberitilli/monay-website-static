package com.monayuser.ui.kyc.dynamic_kyc.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RadioButton
import androidx.appcompat.widget.AppCompatTextView
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.AddressBean
import kotlinx.android.synthetic.main.row_dynamic_kyc.view.*


class DynamicPictureKycAdapter(val context: Context, var items: ArrayList<AddressBean>) :
    RecyclerView.Adapter<PictureViewHolder>() {
    private var customClickListener: OnItemClickListener? = null
    var mPictureSelectedItem = -1

    interface OnItemClickListener {
        fun onItemClicked(addressBean: AddressBean, position: Int)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): PictureViewHolder {
        return PictureViewHolder(
            LayoutInflater.from(context).inflate(R.layout.row_dynamic_kyc, parent, false)
        )
    }

    override fun onBindViewHolder(holder: PictureViewHolder, position: Int) {
        holder.nameTv.text = items[position].requiredDocumentName
        holder.radioButton.isChecked = position == mPictureSelectedItem;

        holder.radioButton.setOnClickListener(View.OnClickListener {
            customClickListener?.onItemClicked(items[position], position)
        })
    }

    override fun getItemCount(): Int {
        return items.size
    }
}

class PictureViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val radioButton: RadioButton = view.radio_button
    val nameTv: AppCompatTextView = view.nameTv

}