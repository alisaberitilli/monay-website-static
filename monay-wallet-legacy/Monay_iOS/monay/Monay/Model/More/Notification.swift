//
//  Notification.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct Notification: Mappable {
    
    var id: String?
    var message: String?
    var createdAt: String?
    var profilePictureUrl: String?
    var user: User?
    
    init?(map: Map) {}
    
    mutating func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        message <- map["message"]
        createdAt <- map["createdAt"]
        profilePictureUrl <- map["User.profilePictureUrl"]
        user <- map["User"]
    }
}

struct NotificationParant: Mappable {
    var id: Int?
    var userId: Int?
    var parentId: Int?
    var verificationOtp: String?
    var isParentVerified: Bool?
    var limit: Int?
    var remainAmount: String?
    var status: String?
    var createdAt: String?
    var updatedAt: String?
    var parent: Parent?

    init?(map: Map) {

    }

    mutating func mapping(map: Map) {

        id <- map["id"]
        userId <- map["userId"]
        parentId <- map["parentId"]
        verificationOtp <- map["verificationOtp"]
        isParentVerified <- map["isParentVerified"]
        limit <- map["limit"]
        remainAmount <- map["remainAmount"]
        status <- map["status"]
        createdAt <- map["createdAt"]
        updatedAt <- map["updatedAt"]
        parent <- map["parent"]
    }
}

struct Parent: Mappable {
    var profilePictureUrl: String?
    var qrCodeUrl: String?
    var id: Int? 
    var firstName: String?
    var lastName: String?
    var email: String?
    var phoneNumberCountryCode: String?
    var phoneNumber: String?
    var companyName: String?
    var taxId: String?
    var chamberOfCommerce: String?
    var verificationOtp: String?
    var verificationCode: String?
    var referralCode: String?
    var isKycVerified: Bool?
    var kycStatus: String?
    var isVerified: Bool?
    var isMobileVerified: Bool?
    var isEmailVerified: Bool?
    var passwordResetToken: String?
    var mPin: String?
    var uniqueCode: String?
    var qrCode: String?
    var accountNumber: String?
    var otpSpentTime: String?
    var codeSpentTime: String?
    var profilePicture: String?
    var userType: String?
    var status: String?
    var roleId: String?
    var refileWalletAmount: Int?
    var minimumWalletAmount: Int?
    var createdAt: String?
    var updatedAt: String?

    init?(map: Map) {

    }

    mutating func mapping(map: Map) {

        profilePictureUrl <- map["profilePictureUrl"]
        qrCodeUrl <- map["qrCodeUrl"]
        id <- map["id"]
        firstName <- map["firstName"]
        lastName <- map["lastName"]
        email <- map["email"]
        phoneNumberCountryCode <- map["phoneNumberCountryCode"]
        phoneNumber <- map["phoneNumber"]
        companyName <- map["companyName"]
        taxId <- map["taxId"]
        chamberOfCommerce <- map["chamberOfCommerce"]
        verificationOtp <- map["verificationOtp"]
        verificationCode <- map["verificationCode"]
        referralCode <- map["referralCode"]
        isKycVerified <- map["isKycVerified"]
        kycStatus <- map["kycStatus"]
        isVerified <- map["isVerified"]
        isMobileVerified <- map["isMobileVerified"]
        isEmailVerified <- map["isEmailVerified"]
        passwordResetToken <- map["passwordResetToken"]
        mPin <- map["mPin"]
        uniqueCode <- map["uniqueCode"]
        qrCode <- map["qrCode"]
        accountNumber <- map["accountNumber"]
        otpSpentTime <- map["otpSpentTime"]
        codeSpentTime <- map["codeSpentTime"]
        profilePicture <- map["profilePicture"]
        userType <- map["userType"]
        status <- map["status"]
        roleId <- map["roleId"]
        refileWalletAmount <- map["refileWalletAmount"]
        minimumWalletAmount <- map["minimumWalletAmount"]
        createdAt <- map["createdAt"]
        updatedAt <- map["updatedAt"]
    }
}
