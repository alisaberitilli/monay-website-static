//
//  NetworkManager.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

public class NetworkManager {
    
    var requestFilter: HTTPRequestFilter?
    var responseFilter: HTTPResponseFilter?
    
    private (set) var session: URLSession!
    
    static let shared: NetworkManager = {
        
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 60
        configuration.timeoutIntervalForResource = 60
        
        var instance = NetworkManager()
        instance.session = URLSession(configuration: configuration, delegate: nil, delegateQueue: OperationQueue.main)
        
        return instance
    }()
}
