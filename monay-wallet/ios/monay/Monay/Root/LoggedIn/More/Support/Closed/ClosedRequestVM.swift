//
//  ClosedRequestVM.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ClosedRequestVM {
    
    // MARK: - Instance properties
    
    var closedRequests: [SupportRequest] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    // MARK: - Helper methods
    
    func supportRequestAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        let parameters: HTTPParameters = [
            "limit": limit,
            "offset": offset,
            "status": "closed"
        ]
        
        isFetching = true
        
        if !isInitialFetchCompleted {
            HudView.show()
        }
        
        APIComponent
            .More
            .supportRequest(parameters: parameters, result: { (result) in
                
                self.isFetching = false
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        
                        if rows.isEmpty {
                            completion(false, LocalizedKey.messageNoDataAvailable.value)
                        } else {
                            
                            if !self.isInitialFetchCompleted {
                                self.isInitialFetchCompleted = true
                            }
                            
                          self.total = data[APIKey.total] as? Int ?? 0
                            let closedRequests = rows.compactMap { SupportRequest(JSON: $0) }
                            self.closedRequests.append(contentsOf: closedRequests)
                            completion(true, "")
                        }
                        
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
}
