//
//  ParameterEncoder.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation
import UIKit.UIImage

public enum ParameterEncodingError: LocalizedError {
    
    case JSONSerializationFailed
    case MissingURL
    case InvalidType
    
    public var errorDescription: String? {
        switch self {
        case .JSONSerializationFailed:
            return LocalizedKey.jsonEncodingFailError.value
        
        case .MissingURL:
            return LocalizedKey.urlMissingError.value
            
        case .InvalidType:
            return LocalizedKey.invalidEncodingType.value
        }
    }
    
}

public enum ParameterEncoderBuilder {
    
    case urlEncoded(parameters: HTTPParameters)
    
    case json(parameters: HTTPParameters)
    
    case formData(parameters: HTTPParameters, files: [HTTPMultipartFile], boundary: String)
    
}

public class ParameterEncoder {
    
    static func encode(_ encoding: ParameterEncoderBuilder, request: inout URLRequest) throws {
        
        switch encoding {
            
        case .json(let parameters):
            guard let data = self.jsonEncode(parameters) else { throw ParameterEncodingError.JSONSerializationFailed }
            
            request.httpBody = data
            
        case .urlEncoded(let parameters):
            guard let url = request.url else { throw ParameterEncodingError.MissingURL }
            
            request.url = self.urlEncode(url, parameters: parameters)
            
        case .formData(let parameters, let files, let boundary):
        request.httpBody = self.formData(parameters: parameters, files: files, boundary: boundary)
        }
    }
    
}

// JSON Encoding
extension ParameterEncoder {
    
    private static func jsonEncode(_ parameters: HTTPParameters) -> Data? {
        
        return try? JSONSerialization.data(withJSONObject: parameters, options: .prettyPrinted)
        
    }
    
}

// URL Encoding
extension ParameterEncoder {
    
    private static func urlEncode(_ url: URL, parameters: HTTPParameters) -> URL {
        
        guard !parameters.isEmpty, var urlComponents = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return url
        }
        
        var queryItems: [URLQueryItem] = []
        
        for (key, value) in parameters {
            let queryItem = URLQueryItem(name: key, value: "\(value)")
            queryItems.append(queryItem)
        }
        
        urlComponents.queryItems = queryItems
        urlComponents.percentEncodedQuery = urlComponents.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B")
      
        return urlComponents.url!
    }
    
}

// Form Data
extension ParameterEncoder {
    
//    private static func formData(parameters: HTTPParameters, images: [String: UIImage], boundary: String) -> Data {
//
//        var formData = Data()
//
//        if parameters.count > 0 {
//            for (key, element) in parameters {
//                formData.append("--\(boundary)\r\n".data(using: .utf8)!)
//                formData.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
//                formData.append("\(element)\r\n".data(using: .utf8)!)
//            }
//        }
//
//        if images.count > 0 {
//            for (key, value) in images {
//
//                let imageData = value.jpegData(compressionQuality: 0.5)
//
//                formData.append("--\(boundary)\r\n".data(using: .utf8)!)
//                formData.append("Content-Disposition: form-data; name=\"\(key)\"; filename=\"\(key).jpeg\"\r\n".data(using: .utf8)!)
//                formData.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
//                formData.append(imageData!)
//                formData.append("\r\n".data(using: .utf8)!)
//            }
//        }
//
//        formData.append("--\(boundary)--\r\n".data(using: .utf8)!)
//
//        return formData
//    }
    
    private static func formData(parameters: HTTPParameters, files: [HTTPMultipartFile], boundary: String) -> Data {
           
           var formData = Data()
           
           ///
           if parameters.count > 0 {
               for (key, element) in parameters {
                   formData.append("--\(boundary)\r\n".data(using: .utf8)!)
                   formData.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
                   formData.append("\(element)\r\n".data(using: .utf8)!)
               }
           }
           
           ///
           for file in files {
               ///
               guard let data = file.data else { continue }
               
               let fileName = file.name + "." + file.ext
               let mimeType = file.mimeType!
               
               ///
               formData.append("--\(boundary)\r\n".data(using: .utf8)!)
               formData.append("Content-Disposition: form-data; name=\"\(file.parameterKey)\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
               formData.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
               formData.append(data)
               formData.append("\r\n".data(using: .utf8)!)
           }
           
           formData.append("--\(boundary)--\r\n".data(using: .utf8)!)
           
           return formData
       }
}


