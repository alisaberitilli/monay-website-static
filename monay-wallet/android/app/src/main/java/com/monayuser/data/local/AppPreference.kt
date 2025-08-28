package com.monayuser.data.local

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences
import android.preference.PreferenceManager
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.monayuser.data.model.bean.LoginBean
import com.monayuser.data.model.bean.SettingBean


class AppPreference {

    companion object {
        val keyGenParameterSpec = MasterKeys.AES256_GCM_SPEC
        val masterKeyAlias = MasterKeys.getOrCreate(keyGenParameterSpec)
        private val prefName = "monay_user"
        private var sharedPreferences: SharedPreferences? = null
        private var instance: AppPreference? = null


        fun getInstance(context: Context): AppPreference {
            if (instance == null) {
                sharedPreferences = EncryptedSharedPreferences.create(
                    prefName,
                    masterKeyAlias,
                    context,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                );
                instance = AppPreference()
                return instance as AppPreference
            }
            return instance as AppPreference
        }
    }

    /**
     * Get instance of context
     *
     * @param context
     */
    fun getInstance(context: Context) {
        sharedPreferences = context.getSharedPreferences(prefName, Context.MODE_PRIVATE)
    }

    /**
     * Add value in preferences
     *
     * @param preferencesKey
     * @param value
     */
    fun addValue(preferencesKey: PreferenceKeys, value: String) {
        val editor = sharedPreferences!!.edit()
        editor.putString(preferencesKey.toString(), value)
        editor.apply()
    }

    fun getSavedUser(appPreference: AppPreference): LoginBean {
        return Gson().fromJson(
            appPreference.getValue(PreferenceKeys.USER_DATA),
            LoginBean::class.java
        )
    }

    fun getSettingData(appPreference: AppPreference): SettingBean {
        return Gson().fromJson(
            appPreference.getValue(PreferenceKeys.SETTING_DATA),
            SettingBean::class.java
        )
    }

    /**
     * Add Boolean Value in Preferences
     *
     * @param preferencesKey
     * @param value
     */
    fun addBoolean(preferencesKey: PreferenceKeys, value: Boolean) {
        val editor = sharedPreferences!!.edit()
        editor.putBoolean(preferencesKey.toString(), value)
        editor.apply()
    }

    /**
     * Add Integer value in Preferences
     *
     * @param preferencesKey
     * @param value
     */
    fun addInt(preferencesKey: PreferenceKeys, value: Int) {
        val editor = sharedPreferences!!.edit()
        editor.putInt(preferencesKey.toString(), value)
        editor.apply()
    }

    /**
     * Get value from preferences
     *
     * @param key
     * @return
     */
    fun getValue(key: PreferenceKeys): String? {
        return sharedPreferences!!.getString(key.toString(), "")
    }


    /**
     * Get Integer value in Preferences
     *
     * @param key
     * @return
     */
    fun getInt(key: PreferenceKeys): Int {
        return sharedPreferences!!.getInt(key.toString(), 0)
    }

    /**
     * Get Boolean value in Prefrences
     *
     * @param key
     * @return
     */
    fun getBoolean(key: PreferenceKeys): Boolean {
        return sharedPreferences!!.getBoolean(key.toString(), true)
    }

    fun clearSharedPreference() {
        val editor = sharedPreferences!!.edit()
        editor.clear()
        editor.apply()
    }

    /**
     * Saves object into the Preferences.
     *
     * @param `object` Object of model class (of type [T]) to save
     * @param key Key with which Shared preferences to
     **/
    fun <T> put(`object`: T, key: PreferenceKeys, activity: Activity?) {
        //Convert object to JSON String.
        val jsonString = GsonBuilder().create().toJson(`object`)
        val prefs =
            PreferenceManager.getDefaultSharedPreferences(activity)

        //Save that String in SharedPreferences
        prefs.edit().putString(key.toString(), jsonString).apply()
    }

    /**
     * Used to retrieve object from the Preferences.
     *
     * @param key Shared Preference key with which object was saved.
     **/
    inline fun <reified T> get(key: PreferenceKeys, activity: Activity?): T? {
        //We read JSON String which was saved.
        val prefs =
            PreferenceManager.getDefaultSharedPreferences(activity)

        val value = prefs.getString(key.toString(), null)
        //JSON String was found which means object can be read.
        //We convert this JSON String to model object. Parameter "c" (of
        //type Class < T >" is used to cast.
        return GsonBuilder().create().fromJson(value, T::class.java)
    }

}
