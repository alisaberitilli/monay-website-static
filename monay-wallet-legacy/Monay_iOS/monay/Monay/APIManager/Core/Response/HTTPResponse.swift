//
//  HTTPResponse.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

public enum HTTPResponseError: LocalizedError {
    
    case InvalidResponse
    
    public var errorDescription: String? {
        
        switch self {
            
        case .InvalidResponse:
            return LocalizedKey.jsonEncodingFailError.value
        }
    }
    
}

public struct HTTPResponse {

    var urlResponse: URLResponse?
    
    var data: Data?
    
    var serverResponse: Any? {
        
        return self.getDataObject()
    }
    
    var fullServerResponse: Any? {
        
        return self.getFullDataObject()
    }
    
    
    init(urlResponse: URLResponse?, data: Data?) {
        self.urlResponse = urlResponse
        self.data = data
    }
    
    func validate(_ handler: @escaping (Result<Void, Error>) -> Void) {
        
        guard let response = urlResponse as? HTTPURLResponse else {
            
            handler(.failure(HTTPResponseError.InvalidResponse))
            
            return
        }
        
        //
        if let contentType = response.allHeaderFields["Content-Type"] as? String,
            
            contentType.contains("application/json"),
            
            let statusCode = HTTPStatusCode(rawValue: response.statusCode),
            
            (statusCode == .success1 || statusCode == .success || statusCode == .created),
            
            self.responseSuccess() {
            
            handler(.success(()))
            
            return
        }
        
        //
        handler(.failure(NSError.error(code: response.statusCode, localizedDescription: self.error())))
        
    }
    
    private func getDataObject() -> Any? {
        
        guard let json = serializeData() else {
            return nil
        }
        
        return json[APIKey.data]
    }
    
    private func getFullDataObject() -> Any? {
        
        guard let json = serializeData() else {
            return nil
        }
        
        return json
    }
    
    private func serializeData() -> HTTPParameters? {
        
        guard let data = data else { return nil }
        
        return try? JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? HTTPParameters
    }
    
    private func responseSuccess() -> Bool {
        
        guard let json = serializeData(),
            
              let success = json[APIKey.success] as? Bool else {
                
            return false
        }
        
        return success
    }
    
    private func error() -> String? {
        
        guard let json = serializeData() else { return nil }
        
        if let errors = json[APIKey.error] as? [HTTPParameters], errors.count > 1 {
            ///
            return errors[1][APIKey.message] as? String
        }
        
        ///
        if let errors = json[APIKey.error] as? [HTTPParameters],
            let error = errors.first {
            ///
            return error[APIKey.message] as? String
            
        } else if let error = json[APIKey.error] as? HTTPParameters,
            let message = error[APIKey.message] as? String {
            ///
            return message
            
        } else if let message = json[APIKey.status] as? String, !message.isEmpty {
            ///
            return message

        } else {
            return json[APIKey.message] as? String
        }
        
    }
    
}
