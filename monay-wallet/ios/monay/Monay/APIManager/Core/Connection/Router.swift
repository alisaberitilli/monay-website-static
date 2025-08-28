//
//  Router.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

struct Router {
    
    var request: HTTPRequest
    
    var resultHandler: HTTPResult
    
    
    init(request: HTTPRequest, resultHandler: @escaping HTTPResult) {
        self.request = request
        self.resultHandler = resultHandler
    }
    
    func perfom() {
        
        switch request.encoding {
            
        case .formData:
            self.uploadTask(request: request.urlRequest)
            
        default:
            self.dataTask(request: request.urlRequest)
        }
    }
    
    private func dataTask(request: URLRequest) {
        
        let dataTask = NetworkManager.shared.session.dataTask(with: request) { self.handleResponse(data: $0, response: $1, error: $2) }
        
        dataTask.resume()
    }
    
    private func uploadTask(request: URLRequest) {
        var multipartRequest = request
        
        guard let data = multipartRequest.httpBody else { return }
        
        multipartRequest.httpBody = nil
        
        let uploadTask = NetworkManager.shared.session.uploadTask(with: multipartRequest, from: data) { self.handleResponse(data: $0, response: $1, error: $2) }
        
        uploadTask.resume()
    }
    
    private func handleResponse(data: Data?, response: URLResponse?, error: Error?) {
        
        if let error = error {
            resultHandler(.failure(error))
            return
        }
        
        var httpResponse = HTTPResponse(urlResponse: response, data: data)
//        var shouldProcess = true
//        
//        // Check for response filtering
//        if let responseFilter = NetworkManager.shared.responseFilter {
//            shouldProcess = responseFilter.filter(response: &httpResponse)
//        }
//        
//        if shouldProcess {
//            httpResponse.validate { (result) in
//                switch result {
//                case .success():
//                    self.resultHandler(.success(httpResponse))
//                    
//                case .failure(let error):
//                    self.resultHandler(.failure(error))
//                }
//            }
//        }
      
        ///
        /// Check for response filtering
        do {
            if let responseFilter = NetworkManager.shared.responseFilter {
                try responseFilter.filter(response: &httpResponse)
            }
            
            ///
            validateResponse(httpResponse)
            
        } catch {
            self.resultHandler(.failure(error))
        }

    }
    
    /// Performs validation on response.
    /// - Parameter response: Response object.
    private func validateResponse(_ response: HTTPResponse) {
      ///
      response.validate { (result) in
        ///
        switch result {
        case .success():
          self.resultHandler(.success(response))
          
        case .failure(let error):
          self.resultHandler(.failure(error))
        }
      }
    }

}
