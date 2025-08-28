package com.monayuser.ui.mycontact.adapter

import android.content.Context
import android.database.Cursor
import android.provider.ContactsContract
import android.provider.ContactsContract.CommonDataKinds.Email
import android.provider.ContactsContract.CommonDataKinds.Phone
import android.telephony.TelephonyManager
import android.util.Log
import androidx.loader.content.CursorLoader
import com.monayuser.ui.mycontact.model.Contact
import com.google.i18n.phonenumbers.PhoneNumberUtil
import java.lang.Exception
import java.util.*

class ContactFetcher(private val context: Context) {
    var listContacts: ArrayList<Contact?> = ArrayList<Contact?>()
    var countryCode1 = ""
    var phoneUtil: PhoneNumberUtil? = null

    init {
        val telephoneManager =
            context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        countryCode1 = telephoneManager.networkCountryIso

        if (countryCode1.equals("") || countryCode1 == null) {
            countryCode1 =
                context.getResources().getConfiguration().locale.getCountry()
        }

        phoneUtil = PhoneNumberUtil.getInstance()
    }


    fun fetchAll(): ArrayList<Contact?> {
        val projectionFields = arrayOf(
            ContactsContract.Contacts._ID,
            ContactsContract.Contacts.DISPLAY_NAME
        )
        val cursorLoader = CursorLoader(
            context,
            ContactsContract.Contacts.CONTENT_URI,
            projectionFields,  // the columns to retrieve
            null,  // the selection criteria (none)
            null,  // the selection args (none)
            null // the sort order (default)
        )
        val c = cursorLoader.loadInBackground()
        val contactsMap: MutableMap<String, Contact> = HashMap<String, Contact>(
            c!!.count
        )
        if (c.moveToFirst()) {
            val idIndex = c.getColumnIndex(ContactsContract.Contacts._ID)
            val nameIndex = c.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME)
            do {
                val contactId = c.getString(idIndex)
                val contactDisplayName = c.getString(nameIndex)
                try {
//                if (contactDisplayName != null && contactDisplayName != "") {
                    val contact = Contact(contactId, contactDisplayName)
                    contactsMap[contactId] = contact
                    Log.e(javaClass.name, ">>>>>>>>>>>>>> $contactDisplayName")
                    listContacts.add(contact)
//                }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            } while (c.moveToNext())
        }
        c.close()
        matchContactNumbers(context, contactsMap)
        return listContacts!!
    }

    fun matchContactNumbers(context: Context, contactsMap: Map<String, Contact>) {
        // Get numbers
        val numberProjection = arrayOf(
            Phone.NUMBER,
            Phone.TYPE,
            Phone.CONTACT_ID
        )
        val phone = CursorLoader(
            context,
            Phone.CONTENT_URI,
            numberProjection,
            null,
            null,
            null
        ).loadInBackground()
        if (phone!!.moveToFirst()) {
            val contactNumberColumnIndex = phone.getColumnIndex(Phone.NUMBER)
            val contactTypeColumnIndex = phone.getColumnIndex(Phone.TYPE)
            val contactIdColumnIndex = phone.getColumnIndex(Phone.CONTACT_ID)
            phone.getColumnIndex(Phone.PHOTO_URI)
            while (!phone.isAfterLast) {
                val number = phone.getString(contactNumberColumnIndex)
                val contactId = phone.getString(contactIdColumnIndex)
                val contact: Contact? = contactsMap[contactId]
                if (contact != null) {
                    addContact(contact, contactTypeColumnIndex, number, phone)
                }
                phone.moveToNext()
            }
        }
        phone.close()
    }

    private fun addContact(contact: Contact, contactTypeColumnIndex: Int, number: String?, phone: Cursor) {
        Log.e(
            javaClass.name,
            ">>>>>>>>>>>>>> Name " + contact.name.toString() + " number " + number
        )
        if (number == null || number == "") {
            listContacts.remove(contact)
        } else {
            val type = phone.getInt(contactTypeColumnIndex)
            val customLabel = "Custom"
            val phoneType = Phone.getTypeLabel(context.resources, type, customLabel)

            try {
                val numberProto = phoneUtil!!.parse(number, countryCode1.toUpperCase())

                // phone must begin with '+'
                val countryCode = numberProto.countryCode
                val nationalNumber = numberProto.nationalNumber

//                            if (phoneUtil.isValidNumber(numberProto)) {
                contact.phoneNumber = nationalNumber.toString()
//                            contact.profilePictureUrl = contactPhoto.toString()
                contact.phoneNumberCountryCode = "+" + countryCode.toString()
//                            }
            } catch (e: Exception) {
                e.printStackTrace()
            }
//                        contact.phoneNumber = number.toString()
//                        contact.phoneNumberCountryCode = "+1"
            contact.addNumber(number, phoneType.toString())
        }
    }

    fun matchContactEmails(contactsMap: Map<String?, Contact?>) {
        // Get email
        val emailProjection = arrayOf(
            Email.DATA,
            Email.TYPE,
            Email.CONTACT_ID
        )
        val email = CursorLoader(
            context,
            Email.CONTENT_URI,
            emailProjection,
            null,
            null,
            null
        ).loadInBackground()
        if (email!!.moveToFirst()) {
            val contactEmailColumnIndex = email.getColumnIndex(Email.DATA)
            val contactTypeColumnIndex = email.getColumnIndex(Email.TYPE)
            val contactIdColumnsIndex = email.getColumnIndex(Email.CONTACT_ID)
            while (!email.isAfterLast) {
                val address = email.getString(contactEmailColumnIndex)
                val contactId = email.getString(contactIdColumnsIndex)
                val type = email.getInt(contactTypeColumnIndex)
                val customLabel = "Custom"
                val contact: Contact? = contactsMap[contactId]
                if (contact != null) {
                    Log.e(
                        javaClass.name,
                        ">>>>>>>>>>>>>> Name " + contact.name.toString() + " address " + address
                    )
                    val emailType = Email.getTypeLabel(context.resources, type, customLabel)
                    contact.addEmail(address, emailType.toString())
                    email.moveToNext()
                }
            }
        }
        email.close()
    }
}