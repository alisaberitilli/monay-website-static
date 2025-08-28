package com.monayuser.ui.mycontact

interface NoContactFoundListener {
    fun noContactFound(position: Int, text: String)
}

interface NoRecentFoundListener {
    fun noRecentFound(position: Int, text: String)
}

interface NoAllContactFoundListener {
    fun noAllContactFound(position: Int, text: String)
}