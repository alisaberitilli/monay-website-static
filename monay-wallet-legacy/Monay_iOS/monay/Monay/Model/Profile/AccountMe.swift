//
//  Profile.swift
//  Monay
//
//  Created by WFH on 12/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct AccountMe: Mappable {
    var id: String? 
    var firstName: String?
    var lastName: String?
    var userType: String?
    var email: String?
    var phoneNumberCountryCode: String?
    var phoneNumber: String?
    var profilePictureUrl: String?
    var companyName: String?
    var taxId: String?
    var registrationNumber: String?
    var qrCodeUrl: String?
    var isEmailVerified: Bool?
    var idProofImageUrl: String?
    var idProofBackImageUrl: String?
    var addressProofImageUrl: String?
    var addressProofBackImageUrl: String?
    var idProofName: String?
    var addressProofName: String?
    var isKYCVerified: Bool?
    var kycStatus: String?
    var kycStatusEnum: KYCStatus?
    var accountNumber: String?
    var referralCode: String?

    init?(map: Map) {}
    
    mutating func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        firstName <- map["firstName"]
        lastName <- map["lastName"]
        userType <- map["userType"]
        email <- map["email"]
        phoneNumberCountryCode <- map["phoneNumberCountryCode"]
        phoneNumber <- map["phoneNumber"]
        profilePictureUrl <- map["profilePictureUrl"]
        companyName <- map["companyName"]
        taxId <- map["taxId"]
        registrationNumber <- map["chamberOfCommerce"]
        qrCodeUrl <- map["qrCodeUrl"]
        isEmailVerified <- map["isEmailVerified"]
        isKYCVerified <- map["isKycVerified"]
        kycStatus <- map["kycStatus"]
        kycStatusEnum <- (map["kycStatus"], EnumTransform<KYCStatus>())
        referralCode <- map["referralCode"]

      if let userKycs = map.JSON["UserKycs"] as? [HTTPParameters], !userKycs.isEmpty, userKycs.count > 0 {
        let userKyc = userKycs[0]
        idProofImageUrl = userKyc["idProofImageUrl"] as? String
        addressProofImageUrl = userKyc["addressProofImageUrl"] as? String
        idProofBackImageUrl = userKyc["idProofBackImageUrl"] as? String
        addressProofBackImageUrl = userKyc["addressProofBackImageUrl"] as? String
        idProofName = userKyc["idProofName"] as? String
        addressProofName = userKyc["addressProofName"] as? String
      }
        
        accountNumber <- map["accountNumber"]
    }
}
