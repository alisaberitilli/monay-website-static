//
//  SecondaryUser.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct SecondaryUser: Mappable {
  
  var id: String? 
  var userId: String?
  var parentId: String?
  var isParentVerified: Bool?
  var limit: Int?
  var remainAmount: String?
  var status: String?
  var user: User?

  init?(map: Map) {}
  
  mutating func mapping(map: Map) {
    id <- (map["id"], intToStringTransform)
    userId <- (map["userId"], intToStringTransform)
    parentId <- (map["parentId"], intToStringTransform)
    isParentVerified <- map["isParentVerified"]
    limit <- map["limit"]
    status <- map["status"]
    user <- map["User"]
    
    remainAmount <- map["remainAmount"]

    if remainAmount == nil {
      remainAmount <- (map["remainAmount"], intToStringTransform)
    }
    
    if remainAmount == nil {
      remainAmount <- (map["remainAmount"], doubleToStringTransform)
    }

    if let context = map.context as? UserContext {
      switch context {
      case .primary:
        user <- map["parent"]
      }
    }

  }

}

enum UserContext: MapContext {
  case primary
}
