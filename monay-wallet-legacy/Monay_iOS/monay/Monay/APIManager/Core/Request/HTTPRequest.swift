//
//  HTTPRequest.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

public struct HTTPRequest: HTTPRequestConfiguration {
    
    var uri: String
    
    var method: HTTPMethod
    
    var encoding: HTTPParameterEncoding
    
    var authorizationPolicy: HTTPAuthorizationPolicy
    
    var dataTask: HTTPDataTask
    
    
    private (set) var urlRequest: URLRequest!
    
    private let boundary = UUID().uuidString
    
    
    init(uri: String, method: HTTPMethod, authorizationPolicy: HTTPAuthorizationPolicy, dataTask: HTTPDataTask, encoding: HTTPParameterEncoding) throws {
        self.uri = uri
        self.method = method
        self.authorizationPolicy = authorizationPolicy
        self.dataTask = dataTask
        self.encoding = encoding
        
        do {
            try self.buildRequest()
            
            // Check for request filtering
            if let requestFilter = NetworkManager.shared.requestFilter {
                try requestFilter.filter(request: &self)
            }
            
        } catch {
            throw error
        }
    }
    
    mutating func setValue(_ value: String, forHTTPHeaderField field: String) {
        guard self.urlRequest != nil else { return }
        
        self.urlRequest!.setValue(value, forHTTPHeaderField: field)
    }
    
    // MARK:- Private
    private mutating func buildRequest() throws {
        
        let url = host.appendingPathComponent(uri)
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        
        do {
            try self.encode(&request)
            
            self.appendHeaders(&request)
            self.urlRequest = request
            
        } catch {
            throw error
        }
    }
    
}

// MARK:- Parameter Encoding
extension HTTPRequest {
    
    private func encode(_ request: inout URLRequest) throws {
        
        do {
            
            switch dataTask {
                
            case .request(let parameters):
                
                switch encoding {
                case .json:
                    try ParameterEncoder.encode(.json(parameters: parameters), request: &request)
                    
                case .url:
                    try ParameterEncoder.encode(.urlEncoded(parameters: parameters), request: &request)
                    
                default:
                    throw ParameterEncodingError.InvalidType
                }
                
            case .requestFormData(let parameters, let files):
                switch encoding {
                case .formData:
                    try ParameterEncoder.encode(.formData(parameters: parameters, files: files, boundary: boundary), request: &request)
                    
                default:
                    throw ParameterEncodingError.InvalidType
                }
            }
            
        } catch {
            throw error
        }
    }
    
}

// MARK:- HTTP Headers and Authorization
extension HTTPRequest {
    
    private func appendHeaders(_ request: inout URLRequest) {
        
        let contentType = encoding == .formData ? "multipart/form-data; boundary=\(boundary)" : "application/json; charset=utf-8"
        
        request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("keep-alive", forHTTPHeaderField: "Connection")
        //request.setValue(Authorization.shared.jwt, forHTTPHeaderField: "access-token")
        request.setValue(TimeZone.current.identifier, forHTTPHeaderField: "timezone")
        
        request.setValue(appVersion, forHTTPHeaderField: "app-version")
        request.setValue(modelName, forHTTPHeaderField: "device-model")
        request.setValue(systemVersion, forHTTPHeaderField: "os-version")
        request.setValue(deviceID, forHTTPHeaderField: "device-id")
    }
}
