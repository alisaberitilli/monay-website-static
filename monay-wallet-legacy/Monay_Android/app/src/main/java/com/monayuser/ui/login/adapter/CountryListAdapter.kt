package com.monayuser.ui.login.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Filter
import android.widget.Filter.FilterResults
import android.widget.Filterable

import androidx.recyclerview.widget.RecyclerView
import com.monayuser.R
import com.monayuser.data.model.bean.CountryCode
import com.monayuser.data.model.bean.CountryData
import kotlinx.android.synthetic.main.row_item_categories_list.view.*


class CountryListAdapter (private val context: Context,
                             private var items: ArrayList<CountryData>
) : RecyclerView.Adapter<ViewHolder>(), Filterable {
    private var tempList: ArrayList<CountryData>? = null
    private var customClickListener: OnItemClickListener? = null

    interface OnItemClickListener {
        fun onItemClicked(view: View, countryCode: CountryData)
    }

    fun setOnItemClickListener(mItemClick: OnItemClickListener) {
        this.customClickListener = mItemClick
    }

    override fun onCreateViewHolder(parent: ViewGroup, p1: Int): ViewHolder {
        return ViewHolder(
            LayoutInflater.from(context).inflate(R.layout.row_item_categories_list, parent, false)
        )
    }

    override fun onBindViewHolder(parent: ViewHolder, position: Int) {
        parent.categoryTV.setText(items.get(position).countryCallingCode + "  " + items.get(position).code)
        parent.categoryTV.setOnClickListener(View.OnClickListener { v ->
            if (customClickListener != null) {
                customClickListener?.onItemClicked(v, items.get(position))
            }
        })
    }

    override fun getItemCount(): Int {
        return items.size
    }

    fun updateList(countryModelArrayList: ArrayList<CountryData>) {
        items = countryModelArrayList
        notifyDataSetChanged()
    }

    override fun getFilter(): Filter {
        return object : Filter() {
            override fun performFiltering(charSequence: CharSequence): FilterResults {
                val charString = charSequence.toString()
                if (charString.isEmpty()) {
                    items = tempList!!
                } else {
                    val filteredList: java.util.ArrayList<CountryData> =
                        java.util.ArrayList<CountryData>()
                    for (countryModel in tempList!!) {
//                        if (countryModel.name!!.toLowerCase().contains(charString)) {
//                            filteredList.add(countryModel)
//                        }
//                        if (countryModel.phonecode!!.toLowerCase().contains(charString)) {
//                            filteredList.add(countryModel)
//                        }
                    }
                    items = filteredList
                }
                val filterResults = FilterResults()
                filterResults.values = items
                return filterResults
            }

            override fun publishResults(charSequence: CharSequence, filterResults: FilterResults) {
                items = filterResults.values as ArrayList<CountryData>
                notifyDataSetChanged()
            }
        }
    }
}

class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    val categoryTV = view.categoryTV
}
