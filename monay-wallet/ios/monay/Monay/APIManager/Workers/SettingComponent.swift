//
//  SettingComponent.swift
//  Monay
//
//  Created by WFH on 05/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

struct SettingComponent {
    
    // Get application general setting
    static func getGeneralAppSetting(result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/setting", method: .get, authorizationPolicy: .anonymous, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
}
