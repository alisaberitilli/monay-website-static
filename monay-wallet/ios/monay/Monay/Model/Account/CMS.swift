//
//  CMS.swift
//  Monay
//
//  Created by WFH on 14/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct CMS: Mappable {
    var id: String? 
    var pageName: String?
    var pageKey: String?
    var userType: UserType?
    var pageContent: String?
    
    init?(map: Map) {}
    
    mutating func mapping(map: Map) {
        id <- (map["id"], intToStringTransform)
        pageName <- map["pageName"]
        pageKey <- map["pageKey"]
        userType <- (map["userType"], EnumTransform<UserType>())
        pageContent <- map["pageContent"]
    }
}
