package com.monayuser.database.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.monayuser.data.model.bean.ContactBean
import com.monayuser.database.dao.DaoAccess

@Database(entities = [ContactBean::class], version = 1, exportSchema = false)
abstract class ContactDatabase: RoomDatabase() {

    abstract fun daoAccess(): DaoAccess?
}