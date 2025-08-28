package com.monayuser.ui.mycontact.model

import java.util.*

class Contact(var id: String, var name: String) {
    var emails: ArrayList<ContactEmail>
    var numbers: ArrayList<ContactPhone>
    var phoneNumber: String? = ""
    var phoneNumberCountryCode: String = "+1"

    override fun toString(): String {
        var result = name
        if (numbers.size > 0) {
            val number: ContactPhone = numbers[0]
            result += " (" + number.number.toString() + " - " + number.type.toString() + ")"
        }
        //		if (emails.size() > 0) {
//			ContactEmail email = emails.get(0);
//			result += " [" + email.address + " - " + email.type + "]";
//		}
        return result
    }

    fun addEmail(address: String?, type: String?) {
        emails.add(ContactEmail(address!!, type!!))
    }

    fun addNumber(number: String?, type: String?) {
//        phoneNumber = number!!
        numbers.add(ContactPhone(number!!, type!!))
    }

    init {
        emails = ArrayList<ContactEmail>()
        numbers = ArrayList<ContactPhone>()
    }
}

class ContactEmail(var address: String, var type: String)

class ContactPhone(var number: String, var type: String)