//
//  User.swift
//  Monay
//
//  Created by WFH on 08/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

class User: Mappable {
    
  var id: String? 
  var firstName: String?
  var lastName: String?
  var profilePictureUrl: String?
  var email: String?
  var phoneNumber: String?
  var phoneNumberCountryCode: String?
  var isBlocked: Bool?
  var qrCodeUrl: String?
  var countryCode: String?
  var status: String?
  var minimumWalletAmount: String?
  
    required init?(map: Map) {}
    
    func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        status <- map["status"]
        firstName <- map["firstName"]
        lastName <- map["lastName"]
        profilePictureUrl <- map["profilePictureUrl"]
        email <- map["email"]
        phoneNumber <- map["phoneNumber"]
        phoneNumberCountryCode <- map["phoneNumberCountryCode"]
        isBlocked <- map["isBlocked"]
        minimumWalletAmount <- map["minimumWalletAmount"]
    }
}
