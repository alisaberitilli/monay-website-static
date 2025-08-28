//
//  Card.swift
//  Monay
//
//  Created by WFH on 13/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

class Card: Mappable {
    var id: String? 
    var userId: String?
    var cardName: String?
    var cardType: String?
    var bankName: String?
    var cardNumber: String?
    var last4Digit: String?
    var nameOnCard: String?
    var month: String?
    var year: String?
    var cvv: String?
    var createdAt: String?
    var cardIconUrl: String?
    var isSelected = false
    var isExpired: Bool?
    var isDefault = false

    required init?(map: Map) {}
    
    func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        userId <- map["userId"]
        cardName <- map["cardName"]
        cardType <- map["cardType"]
        bankName <- map["bankName"]
        cardNumber <- map["cardNumber"]
        last4Digit <- map["last4Digit"]
        nameOnCard <- map["nameOnCard"]
        month <- map["month"]
        year <- (map["year"], intToStringTransform)
        cvv <- (map["cvv"], intToStringTransform)
        createdAt <- map["createdAt"]
        cardIconUrl <- map["cardIconUrl"]
        isExpired <- map["isExpired"]
        isDefault <- map["isDefault"]
    }
}
