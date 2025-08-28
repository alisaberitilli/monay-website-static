package com.monayuser.ui.secondaryaccount.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.request.RequestOptions
import com.monayuser.R
import com.monayuser.data.model.bean.CardBean
import com.monayuser.data.model.bean.SecondaryAccountUser
import com.monayuser.data.model.bean.SecondaryUser
import com.monayuser.utils.CommonUtils

class SecondaryUserListAdapter (val context: Context, val secondaryUserList: ArrayList<SecondaryUser>?) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null
     var checkedPosition = -1
    interface OnItemClickListener {
        fun onItemClicked(item: SecondaryAccountUser, position: Int)
        fun onInfoItemClicked(item: SecondaryUser, position: Int)
    }

    fun setOntemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_secondary_user, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
            if (checkedPosition == position) {
                parent.selectSecondaryUser.setBackgroundResource(R.drawable.rounded_border)
                parent.ivTransactionImage.setImageResource(R.mipmap.ic_transactions)
            }
        parent.tvUserName.text = secondaryUserList!![position].User!!.firstName+" "+secondaryUserList!![position].User!!.lastName
        parent.tvUserNumber.text = secondaryUserList!![position].User!!.phoneNumberCountryCode+" "+secondaryUserList!![position].User!!.phoneNumber

        parent.selectSecondaryUser.setOnClickListener(View.OnClickListener {
            parent.selectSecondaryUser.setBackgroundResource(R.drawable.blue_rounded_border)
            parent.ivTransactionImage.setImageResource(R.mipmap.ic_transactions_active)
            customClickListener?.onItemClicked(secondaryUserList!![position].User, position)

        })
        parent.userInfoLayout.setOnClickListener(View.OnClickListener {
            customClickListener?.onInfoItemClicked(secondaryUserList!![position], position)
        })
        CommonUtils.showProfile(
            context,
            secondaryUserList!![position].User.profilePictureUrl.toString(),
            parent.ivUserImage
        )

    }

    fun updatePosition(position: Int)
    {
        checkedPosition=position
        notifyItemChanged(position)
    }
    override fun getItemCount(): Int {
        return secondaryUserList!!.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val ivUserImage = view.imageUser
    val ivTransactionImage = view.transactionIcon
    val tvUserName = view.tv_name
    val tvUserNumber = view.tv_user_number
    val selectSecondaryUser = view.selectSecondaryUser
    val userInfoLayout = view.userInfoLayout

}
