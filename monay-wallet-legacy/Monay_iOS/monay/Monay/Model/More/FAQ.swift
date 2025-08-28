//
//  FAQ.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct FAQ: Mappable {
    
    var id: String! 
    var question: String!
    var answer: String!
    var collapsed: Bool = true
    
    init?(map: Map) {}
    
    mutating func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        question <- map["question"]
        answer <- map["answer"]
    }
}
