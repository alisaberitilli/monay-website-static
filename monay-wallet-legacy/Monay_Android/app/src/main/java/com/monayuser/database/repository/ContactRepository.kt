package com.monayuser.database.repository

import android.content.Context
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.room.Room
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.monayuser.data.model.bean.ContactBean
import com.monayuser.database.db.ContactDatabase
import java.util.*
import java.util.concurrent.Executors

class ContactRepository(context: Context?) {

    private val DB_NAME = "db_contact"
    private var contactDatabase: ContactDatabase? = null

    companion object {
        var MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL("ALTER TABLE 'ContactBean' ADD COLUMN 'demo' 'INTEGER'")
            }
        }
    }

    init {
        contactDatabase =
            Room.databaseBuilder(context!!, ContactDatabase::class.java, DB_NAME)
//                .addMigrations(MIGRATION_1_2)
                .build()
//        appPreferences = AppPreference.getInstance(context)
    }

    fun getMobileCount(mobile: Long): Int {
        return contactDatabase!!.daoAccess()!!.getMobileCount(mobile)
    }

    fun getNameCount(name: String): Int {
        return contactDatabase!!.daoAccess()!!.getNameCount(name)
    }

    fun insertContact(contactBean: ContactBean?) {
        val executor = Executors.newSingleThreadExecutor()
        executor.execute {
                contactDatabase!!.daoAccess()!!.insertContact(contactBean)
                Log.e(javaClass.name,
                    "Mobile Number not exits " + contactDatabase!!.daoAccess()!!
                        .getMobileCount(contactBean!!.phoneNumber!!)
                )
        }
    }

    fun updateContact(contactBean: ContactBean?) {
        val executor = Executors.newSingleThreadExecutor()
        executor.execute {
            contactDatabase!!.daoAccess()!!.updateContact(contactBean!!)
        }
    }

    fun deleteContact(id: Int) {
        val task: LiveData<ContactBean?>? = getContact(id)
        if (task != null) {
            val executor = Executors.newSingleThreadExecutor()
            executor.execute {
                contactDatabase!!.daoAccess()!!.deleteContact(task.value)
            }
        }
    }

    fun deleteContact(contactBean: ContactBean?) {
        val executor = Executors.newSingleThreadExecutor()
        executor.execute {
            contactDatabase!!.daoAccess()!!.deleteContact(contactBean)
        }
    }

    fun getContact(id: Int): LiveData<ContactBean?>? {
        return contactDatabase!!.daoAccess()!!.getContact(id)
    }

    fun getContactViaMobile(mobile: Long): ContactBean {
        return contactDatabase!!.daoAccess()!!.getContactViaMobile(mobile)
    }

    fun getContactViaRandomNumber(randomNumber: String): List<ContactBean?>? {
        return contactDatabase!!.daoAccess()!!.getContactViaRandomNumber(randomNumber)
    }

    fun getMonayUser(): List<ContactBean?>? {
        return contactDatabase!!.daoAccess()!!.getMonayUser()
    }

    fun getContacts(): List<ContactBean?> {
        return contactDatabase!!.daoAccess()!!.fetchAllContacts()!!
    }

    fun clearTable() {
        contactDatabase!!.daoAccess()!!.clearTable()
    }

    fun getRowCount(): Int {
        return contactDatabase!!.daoAccess()!!.getRowCount()
    }

    fun getCurrentDateTime(): Date? {
        return Calendar.getInstance().time
    }
}