//
//  Wallet.swift
//  Monay
//
//  Created by WFH on 19/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct Wallet: Mappable {
    var creditWalletAmount: String?
    var debitWalletAmount: String?
    var totalWalletAmount: String?
    var secondaryUserLimit: String?
    
    init?(map: Map) {}
    
    mutating func mapping(map: Map) {
        
        creditWalletAmount <- map["creditWalletAmount"]
        
        if creditWalletAmount == nil {
            creditWalletAmount <- (map["creditWalletAmount"], intToStringTransform)
        }
        
        if creditWalletAmount == nil {
            creditWalletAmount <- (map["creditWalletAmount"], doubleToStringTransform)
        }
        
        debitWalletAmount <- map["debitWalletAmount"]
        
        if debitWalletAmount == nil {
            debitWalletAmount <- (map["debitWalletAmount"], intToStringTransform)
        }
        
        if debitWalletAmount == nil {
            debitWalletAmount <- (map["debitWalletAmount"], doubleToStringTransform)
        }
        
        totalWalletAmount <- map["totalWalletAmount"]
        
        if totalWalletAmount == nil {
            totalWalletAmount <- (map["totalWalletAmount"], intToStringTransform)
        }
        
        if totalWalletAmount == nil {
            totalWalletAmount <- (map["totalWalletAmount"], doubleToStringTransform)
        }
      
        secondaryUserLimit <- map["secondaryUserLimit"]
        
        if secondaryUserLimit == nil {
          secondaryUserLimit <- (map["secondaryUserLimit"], intToStringTransform)
        }
        
        if secondaryUserLimit == nil {
          secondaryUserLimit <- (map["secondaryUserLimit"], doubleToStringTransform)
        }

    }
}
