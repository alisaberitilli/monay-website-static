//
//  PaymentRequest.swift
//  Monay
//
//  Created by WFH on 10/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

class PaymentRequest: Mappable {
    
    var id: String? 
    var fromUserId: String?
    var toUserId: String?
    var transactionId: String?
    var amount: String?
    var message: String?
    var status: String?
    var createdAt: String?
    var fromUser: User?
    var toUser: User?
    var transaction: Transaction?
    var declineReason: String?
    
    required init?(map: Map) {}
    
    func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        fromUserId <- (map["fromUserId"], intToStringTransform)
        toUserId <- (map["toUserId"], intToStringTransform)
        transactionId <- map["transactionId"]
        amount <- (map["amount"], intToStringTransform)
        
        if amount == nil {
            amount <- (map["amount"], doubleToStringTransform)
        }
        
        message <- map["message"]
        status <- map["status"]
        createdAt <- map["createdAt"]
        fromUser <- map["fromUser"]
        toUser <- map["toUser"]
        transaction <- map["Transaction"]
        declineReason <- map["declineReason"]
    }
}
