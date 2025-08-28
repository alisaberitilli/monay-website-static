//
//  Transaction.swift
//  Monay
//
//  Created by WFH on 22/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ObjectMapper

class Transaction: Mappable {
    
    var id: String? 
    var fromUserId: String?
    var toUserId: String?
    var amount: String?
    var actionType: ActionType?
    var createdAt: String?
    var fromUser: User?
    var toUser: User?
    var status: String?
    var transactionId: String?
    var paymentStatus: PaymentStatus?
    var message: String?
    var cardType: String?
    var cardName: String?
    var last4Digit: String?
    var cardIconUrl: String?
    var bankName: String?
    var paymentMethod: String?
    
    required init?(map: Map) {}
    
    func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        fromUserId <- (map["fromUserId"], intToStringTransform)
        toUserId <- (map["toUserId"], intToStringTransform)
        amount <- (map["amount"], intToStringTransform)
        
        if amount == nil {
            amount <- (map["amount"], doubleToStringTransform)
        }
        
        actionType <- (map["actionType"], EnumTransform<ActionType>())
        createdAt <- map["createdAt"]
        fromUser <- map["fromUser"]
        toUser <- map["toUser"]
        status <- map["status"]
        transactionId <- map["transactionId"]
        paymentStatus <- (map["paymentStatus"], EnumTransform<PaymentStatus>())
        message <- map["message"]
        cardType <- map["cardType"]
        cardName <- map["cardName"]
        last4Digit <- map["last4Digit"]
        cardIconUrl <- map["cardIconUrl"]
        bankName <- map["bankName"]
        paymentMethod <- map["paymentMethod"]
    }
}
