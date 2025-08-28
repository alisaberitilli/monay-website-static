package com.monayuser.ui.faq.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseExpandableListAdapter
import android.widget.ImageView
import android.widget.TextView
import com.monayuser.R
import com.monayuser.data.model.bean.Row

class FAQExpandableAdapter(
    var context: Context,
    private val menuArrayList: ArrayList<Row>
) : BaseExpandableListAdapter() {


    override fun getGroupCount(): Int {
        return menuArrayList.size
    }

    override fun getChildrenCount(parent: Int): Int {
        return 1
    }

    override fun getGroup(parent: Int): Any {
        return menuArrayList[parent]
    }

    override fun getChild(parent: Int, child: Int): Any {
        return menuArrayList[parent].answer
    }

    override fun getGroupId(parent: Int): Long {
        return parent.toLong()
    }

    override fun getChildId(parent: Int, child: Int): Long {
        return child.toLong()
    }

    override fun hasStableIds(): Boolean {
        return false
    }

    override fun getGroupView(
        parent: Int,
        isExpanded: Boolean,
        convertView: View?,
        parentview: ViewGroup
    ): View {
        var convertView = convertView
        if (convertView == null) {
            val inflater =
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
            convertView = inflater.inflate(R.layout.row_item_faq, parentview, false)
        }
        val ivRightArrow = convertView!!.findViewById(R.id.ic_right_arrow) as ImageView

        if (isExpanded) {
            ivRightArrow.setImageResource(R.mipmap.ic_left_arrow)
            ivRightArrow.rotation = 90f
        } else {
            ivRightArrow.setImageResource(R.mipmap.ic_left_arrow)
            ivRightArrow.rotation = 0f
        }

        val tvTitle = convertView.findViewById(R.id.tv_title) as TextView
        tvTitle.text = menuArrayList[parent].question
        return convertView
    }

    override fun getChildView(
        parent: Int,
        child: Int,
        isLastChild: Boolean,
        convertView: View?,
        parentview: ViewGroup
    ): View {
        var convertView = convertView
        if (convertView == null) {
            val inflater =
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
            convertView = inflater.inflate(R.layout.row_item_sub_faq, parentview, false)
        }

        val tvFaqAnswer = convertView!!.findViewById(R.id.tv_faq_answer) as TextView
        tvFaqAnswer.text = menuArrayList[parent].answer
        return convertView
    }

    override fun isChildSelectable(groupPosition: Int, childPosition: Int): Boolean {
        return true   // true means we can show the divider between childs
    }
}