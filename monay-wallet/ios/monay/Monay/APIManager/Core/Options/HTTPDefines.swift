//
//  HTTPDefines.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

public typealias HTTPParameters = [String: Any]

typealias HTTPResult = (Result<HTTPResponse, Error>) -> Void


extension NSError {
    
    static func error(code: Int, localizedDescription: String?) -> NSError {
        
        return NSError(domain: Bundle.main.bundleIdentifier!, code: code, userInfo: [NSLocalizedDescriptionKey: localizedDescription ?? ""])
    }
    
}
