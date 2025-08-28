package com.monayuser.utils;

/**
 * Author : Codiant- A Yash Technologies Company.
 * Date   : 11-Jan-19
 * Description : This is the CommonNavigator class
 */
public interface CommonNavigator {

    /**
     * Init.
     */
    void init();

    /**
     * Show progress.
     */
    void showProgressBar();

    /**
     * Hide progress.
     */
    void hideProgressBar();

    /**
     * Show network error.
     *
     * @param error the error
     */
    void showNetworkError(String error);

    /**
     * Show session expire alert.
     *
     * @param //error the error
     */
    void showSessionExpireAlert();


    void onUpdateAppVersion(String error);

    /**
     * Get string resource.
     *
     * @param id the id
     * @return the string resource
     */
    String getStringResource(int id);

    /**
     * Show validation message.
     *
     * @param // error
     */
    void showValidationError(String message);
}
