package com.monayuser.data.model.bean

import android.os.Parcel
import android.os.Parcelable

data class CardBeanAutoTopUp(
    var bankName: String = "",
    var cardNumber: String = "",
    var cardType: String? = "",
    var createdAt: String = "",
    var cvv: String = "",
    var id: String = "",
    var last4Digit: String = "",
    var month: String = "",
    var nameOnCard: String = "",
    var updatedAt: String = "",
    var userId: Int = 0,
    var year: String = "",
    var accountNumber: String = "",
    var routingNumber: String = "",
    var screenFrom: String = "",
    var paymentMethod: String = "",
    var minimumWalletAmount: String = "",
    var refileWalletAmount:String = "",
    var message: String = "",
    var bankId: String = "",
    var cardIconUrl: String? = "",
    var saveCard: String? = "",
    var cardName: String? = "",
    var isDefault: Boolean = false,
    var isExpired: Boolean = false

) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readInt(),
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!
//        parcel.readBoolean()
    ) {
    }

    override fun writeToParcel(parcel: Parcel?, p1: Int) {
        parcel!!.writeString(bankName)
        parcel!!.writeString(cardNumber)
        parcel!!.writeString(cardType)
        parcel!!.writeString(createdAt)
        parcel!!.writeString(cvv)
        parcel!!.writeString(id)
        parcel!!.writeString(last4Digit)
        parcel!!.writeString(month)
        parcel!!.writeString(nameOnCard)
        parcel!!.writeString(updatedAt)
        parcel!!.writeInt(userId)
        parcel!!.writeString(year)
        parcel!!.writeString(accountNumber)
        parcel!!.writeString(routingNumber)
        parcel!!.writeString(screenFrom)
        parcel!!.writeString(paymentMethod)
        parcel!!.writeString(minimumWalletAmount)
        parcel!!.writeString(refileWalletAmount)
        parcel!!.writeString(message)
        parcel!!.writeString(bankId)
        parcel!!.writeString(cardIconUrl)
        parcel!!.writeString(saveCard)
        parcel!!.writeString(cardName)
    }

    override fun toString(): String {
        if (bankName == "Select Bank")
            return bankName
        else {
            if (bankName.length > 30) {
                return bankName.substring(0, 30) + "...\nA/C No. xxxx ${last4Digit}"
            } else {
                return bankName + "\nA/C No. xxxx ${last4Digit}"
            }
        }
    }

    override fun describeContents(): Int {
        return 0
    }

    companion object CREATOR : Parcelable.Creator<CardBeanAutoTopUp> {
        override fun createFromParcel(parcel: Parcel): CardBeanAutoTopUp {
            return CardBeanAutoTopUp(parcel)
        }

        override fun newArray(size: Int): Array<CardBeanAutoTopUp?> {
            return arrayOfNulls(size)
        }
    }
}