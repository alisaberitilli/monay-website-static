//
//  SupportRequest.swift
//  Monay
//
//  Created by WFH on 05/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct SupportRequest: Mappable {
    
    var id: String? 
    var userId: String?
    var message: String?
    var status: String?
    var createdAt: String?
    var updatedAt: String?
    
    var response: String?
    var closedDate: String?
    var collapsed: Bool = true
    
    init?(map: Map) {}
    
    mutating func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        userId <- (map["userId"], intToStringTransform)
        message <- map["message"]
        status <- map["status"]
        createdAt <- map["createdAt"]
        updatedAt <- map["updatedAt"]
        response <- map["UserRequestResponse.response"]
        closedDate <- map["UserRequestResponse.createdAt"]
    }
}
