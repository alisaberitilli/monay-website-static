package com.monayuser.utils

interface EvenListener {

    /*on filter apply*/
    fun onFilterApply(
        status: Boolean,
        tagStrArray: MutableList<String>,
        sortByPostLike: String,
        sortByPostComment: String
    )

    /*on media dialog listener */
    fun onPickImagefromcamera()
    fun onPickImagefromgallery()

    /*on dialogwithokEvent listener */
    fun onsuccessEvent()

    /*on logout dialog listener */
    fun onSignout()
    fun onReport(reason: String)
    fun ondeleteAccount()
    fun omManageQuestion()
    fun onSelectCurrency(currency: String)
    fun onResetStats()
    fun onShareCommunity()
    fun onExitApplication()
    fun onResetDate()
    fun onShareFB()
    fun onShareTwitter()
    fun onForceUpdate()
    fun onBlockUser()
    fun onUnBlockUser()
    fun onReportUser()
    fun onYes()
    fun onPodtype(podType: String)
    fun onGuestYesOrNo(guestUser: String)
    fun onCravingRegistance()
    fun onGuidedBreathingNext()
    fun onAccountabilityPostNext()
    fun onSavingGoalsNext()
    fun onMoveToSignIn()
}
