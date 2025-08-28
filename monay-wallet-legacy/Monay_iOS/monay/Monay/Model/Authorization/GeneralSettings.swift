//
//  GeneralSettings.swift
//
//  Created by WFH on 04/06/20.
//  Copyright © 2019 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

class GeneralSettings: Mappable {
    
    var iosAppVersion: String!
    var contactSyncduration: Int!
    var iosForceUpdate: Bool!
    var inviteMessage: String?
    var countryPhoneCode: String?
    var currencyAbbreviation: String?
    
    required init?(map: Map) {}
    
    func mapping(map: Map) {
        
        iosAppVersion <- map["ios_app_version"]
        contactSyncduration <- map["contact_sync_duration"]
        iosForceUpdate <- map["ios_force_update"]
        inviteMessage <- map["invite_message"]
        countryPhoneCode <- map["countryPhoneCode"]
        currencyAbbreviation <- map["currencyAbbr"]
    }
}
