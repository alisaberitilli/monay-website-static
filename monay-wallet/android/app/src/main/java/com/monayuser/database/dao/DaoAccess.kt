package com.monayuser.database.dao

import androidx.lifecycle.LiveData
import androidx.room.*
import com.monayuser.data.model.bean.ContactBean

@Dao
interface DaoAccess {

    @Insert
    fun insertContact(contactBean: ContactBean): Long

    @Query("SELECT * FROM ContactBean WHERE is_login_user = 0 ORDER BY is_monay_user desc, name asc")
    fun fetchAllContacts(): List<ContactBean>?

    @Query("SELECT COUNT(mobile_number) FROM ContactBean WHERE mobile_number = :mobileNumber")
    fun getMobileCount(mobileNumber: Long) : Int

    @Query("SELECT COUNT(name) FROM ContactBean WHERE name = :name")
    fun getNameCount(name: String) : Int

    @Query("SELECT * FROM ContactBean WHERE id =:id")
    fun getContact(id: Int): LiveData<ContactBean?>?

    @Query("SELECT * FROM ContactBean WHERE mobile_number =:mobileNumber")
    fun getContactViaMobile(mobileNumber: Long): ContactBean

    @Query("SELECT * FROM ContactBean WHERE random_number !=:randomNumber")
    fun getContactViaRandomNumber(randomNumber: String): List<ContactBean?>?

    @Query("SELECT * FROM ContactBean WHERE is_monay_user = 1")
    fun getMonayUser(): List<ContactBean?>?

    @Update
    fun updateContact(contactBean: ContactBean)

    @Delete
    fun deleteContact(contactBean: ContactBean)

    @Query("DELETE FROM ContactBean")
    fun clearTable()

    @Query("SELECT COUNT(*) FROM ContactBean")
    fun getRowCount(): Int
}