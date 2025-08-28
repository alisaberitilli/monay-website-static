//
//  HTTPStatusCode.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

public enum HTTPStatusCode: Int {
    
    case success1 = 422
    
    case success = 200
    
    case created = 201
    
    case redirectionError = 301
    
    case badRequest = 400
    
    case unauthorized = 401
    
    case forbidden = 403
    
    case notFound = 404
    
    case toManyRequest = 429
    
    case internalServerError = 500
    
    case methodNotImplemented = 501
    
    case gatewayTimeOut = 503
    
}

public enum SessionSystemCode: Int {
    case requestTimeout  = -1001
    case internetOffline = -1009
    case unableToConnect = -1004
    case connectionLost  = -1005
}
