//
//  HTTPResponseFilter.swift
//
//  Created by Codiant on 02/08/19.
//  Copyright © 2019 Codiant. All rights reserved.
//

import Foundation

/// A filter which can be called to modify a HTTPResponse.
public protocol HTTPResponseFilter {
    
    /// Filter to check response object.
    /// - Parameter response: Response object.
    func filter(response: inout HTTPResponse) throws

}
