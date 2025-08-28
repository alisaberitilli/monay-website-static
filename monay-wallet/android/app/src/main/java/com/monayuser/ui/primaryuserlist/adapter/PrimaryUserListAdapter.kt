package com.monayuser.ui.primaryuserlist.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.PrimaryAccountUser
import com.monayuser.data.model.bean.SecondaryAccountUser
import com.monayuser.data.model.bean.SecondaryUser
import com.monayuser.utils.CommonUtils

class PrimaryUserListAdapter (val context: Context, val primaryUserList: ArrayList<PrimaryAccountUser>?) :
    RecyclerView.Adapter<ViewHolder>() {

    private var customClickListener: OnItemClickListener? = null
    var checkedPosition = -1
    interface OnItemClickListener {
        fun onInfoItemClicked(item: SecondaryAccountUser, position: Int)
    }

    fun setOntemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_primary_user, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {

        parent.tvUserName.text = primaryUserList!![position].parent!!.firstName+" "+primaryUserList!![position].parent!!.lastName
        parent.tvUserNumber.text = primaryUserList!![position].parent!!.phoneNumberCountryCode+" "+primaryUserList!![position].parent!!.phoneNumber

        parent.userInfoLayout.setOnClickListener(View.OnClickListener {
           // customClickListener?.onInfoItemClicked(secondaryUserList!![position].User, position)
        })
        CommonUtils.showProfile(
            context,
            primaryUserList!![position].parent.profilePictureUrl.toString(),
            parent.ivUserImage
        )

    }

    fun updatePosition(position: Int)
    {
        checkedPosition=position
        notifyItemChanged(position)
    }
    override fun getItemCount(): Int {
        return primaryUserList!!.size
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val ivUserImage: de.hdodenhof.circleimageview.CircleImageView = itemView.findViewById(R.id.imageUser)
    val tvUserName: android.widget.TextView = itemView.findViewById(R.id.tv_name)
    val tvUserNumber: android.widget.TextView = itemView.findViewById(R.id.tv_user_number)
    val userInfoLayout: android.widget.LinearLayout = itemView.findViewById(R.id.userInfoLayout)

}