//
//  Bank.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

class Bank: Mappable {
    var id: String? 
    var userId: String?
    var accountNumber: String?
    var bankName: String?
    var routingNumber: String?
    var createdAt: String?
    var last4Digit: String?
    
    required init?(map: Map) {}
    
    func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        userId <- (map["userId"], intToStringTransform)
        accountNumber <- map["accountNumber"]
        bankName <- map["bankName"]
        routingNumber <- map["routingNumber"]
        createdAt <- map["createdAt"]
        last4Digit <- map["last4Digit"]
    }
}
