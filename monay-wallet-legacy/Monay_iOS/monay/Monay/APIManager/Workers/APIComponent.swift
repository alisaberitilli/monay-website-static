//
//  APIComponent.swift
//  DocLive
//
//  Created by WFH on 02/06/20.
//  Copyright © 2019 Codiant. All rights reserved.
//

import Foundation

struct APIComponent {
    
    static let Account: AccountComponent.Type = {
        return AccountComponent.self
    }()
    
    static let Profile: ProfileComponent.Type = {
        return ProfileComponent.self
    }()
    
    static let More: MoreComponent.Type = {
        return MoreComponent.self
    }()
    
    static let Setting: SettingComponent.Type = {
        return SettingComponent.self
    }()
    
    static let home: HomeComponent.Type = {
        return HomeComponent.self
    }()
    
    static let transaction: TransactionComponent.Type = {
        return TransactionComponent.self
    }()
}
