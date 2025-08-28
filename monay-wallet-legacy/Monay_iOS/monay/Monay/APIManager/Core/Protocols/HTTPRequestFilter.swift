//
//  HTTPRequestFilter.swift
//  React
//
//  Created by Codiant on 5/1/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

/// A filter which can be called to modify a HTTPRequest.
public protocol HTTPRequestFilter {
    
    func filter(request: inout HTTPRequest) throws
    
}
