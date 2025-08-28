//
//  HTTPRequestConfiguration.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

protocol HTTPRequestConfiguration {
    
    var host: URL { get }
    
    var uri: String { get set }
    
    var method: HTTPMethod { get set }
    
    var encoding: HTTPParameterEncoding { get set }
    
    var authorizationPolicy: HTTPAuthorizationPolicy { get set }
    
    var dataTask: HTTPDataTask { get set }

}

extension HTTPRequestConfiguration {
    
    var host: URL {
      guard let host = RestClient.shared.host else {
        fatalError("Server host url is missing.")
      }
        return URL(string: host)!
    }
    
}
