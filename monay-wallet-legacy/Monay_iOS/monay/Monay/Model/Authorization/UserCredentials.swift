//
//  UserCredentials.swift
//  DocLive
//
//  Created by WFH on 02/06/20.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation
import ObjectMapper
import RxSwift

class UserCredentials: Mappable {
    
    var id: String! 
    var userType: UserType!
    
    // streams
    var firstName = Variable<String>("")
    var lastName = Variable<String>("")
    var profileImage = Variable<String>("")
    var email = Variable<String>("")
    var phoneNumber = Variable<String>("")
    var countryCode = Variable<String>("")
    var qrCode = Variable<String>("")
    var isMpinSet: Bool?
    var companyName = Variable<String>("")
    var taxId = Variable<String>("")
    var registrationNumber = Variable<String>("")
    var isEmailVerified: Bool?
    var isKYCVerified: Bool?
    var isMobileVerified: Bool?
    var isVerified: Bool?
    var parent: [PrimaryUser]?
    var country: CountryList?
    var autoToupStatus: Bool?
    var refillWalletAmount: String?
    var minimumWalletAmount: String?
  
    required init?(map: Map) {}
    
    func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        userType <- (map["userType"], EnumTransform<UserType>())
        firstName.value <- map["firstName"]
        lastName.value <- map["lastName"]
        profileImage.value <- map["profilePictureUrl"]
        email.value <- map["email"]
        phoneNumber.value <- map["phoneNumber"]
        countryCode.value <- map["phoneNumberCountryCode"]
        qrCode.value <- map["qrCodeUrl"]
        isMpinSet <- map["isMpinSet"]
        companyName <- map["companyName"]
        taxId <- map["taxId"]
        registrationNumber <- map["chamberOfCommerce"]
        isEmailVerified <- map["isEmailVerified"]
        isKYCVerified <- map["isKycVerified"]
        isMobileVerified <- map["isMobileVerified"]
        isVerified <- map["isVerified"]
        parent <- map["parent"]
        country <- map["Country"]
        autoToupStatus <- map["autoToupStatus"]
      
        refillWalletAmount <- map["refillWalletAmount"]

        if refillWalletAmount == nil {
          refillWalletAmount <- (map["refillWalletAmount"], intToStringTransform)
        }
        
        if refillWalletAmount == nil {
          refillWalletAmount <- (map["refillWalletAmount"], doubleToStringTransform)
        }

        minimumWalletAmount <- map["minimumWalletAmount"]

        if minimumWalletAmount == nil {
          minimumWalletAmount <- (map["minimumWalletAmount"], intToStringTransform)
        }
        
        if minimumWalletAmount == nil {
          minimumWalletAmount <- (map["minimumWalletAmount"], doubleToStringTransform)
        }
    }
}

class PrimaryUser: Mappable {
  
  var id: String! 
  var userId: String?
  var parentId: String?
  var isParentVerified: Bool?
  var limit: Int?
  var remainAmount: Int?
  var status: String?
  
  required init?(map: Map) {}
  
  func mapping(map: Map) {
      id <- (map["id"], intToStringTransform)
    userId <- (map["userId"], intToStringTransform)
    parentId <- (map["parentId"], intToStringTransform)
    isParentVerified <- map["isParentVerified"]
    limit <- map["limit"]
    remainAmount <- map["remainAmount"]
    status <- map["status"]
  }

}
