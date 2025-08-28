//
//  PaymentReceivedVM.swift
//  Monay
//
//  Created by WFH on 24/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class PaymentReceivedVM {
    
    // MARK: - Instance properties
    
    var receivedRequests: [PaymentRequest] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    // MARK: - Helper methods
    
    func receivedPaymentRequestAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        handler(.defaultState)

        let parameters: HTTPParameters = [
            "limit": limit,
            "offset": offset
        ]
        
        isFetching = true
        
        if !isInitialFetchCompleted {
            handler(.loading)
        }
        
        APIComponent
            .Profile
          .paymentRequestType(type: LocalizedKey.received.value.lowercased(), parameters: parameters, result: { (result) in
                
                self.isFetching = false
                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        
                        if !self.isInitialFetchCompleted {
                            self.isInitialFetchCompleted = true
                        }

                        let receivedRequests = rows.compactMap { PaymentRequest(JSON: $0) }
                        self.receivedRequests.append(contentsOf: receivedRequests)

                        if self.receivedRequests.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noRequest.title))
                        } else {
                            completion()
                        }
                        
                      if let total = data[APIKey.total] as? Int {
                          self.total = total
                        }

                    }
                    
                case .failure(let error):
                    if (error as NSError).code == SessionSystemCode.internetOffline.rawValue {
                      handler(.noConnection)
                    } else {
                      handler(.error(message: error.localizedDescription, actionType: .tryAgain))
                    }
                }
            })
    }
    
    func declinePaymentRequestAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .declinePaymentRequest(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters,
                        let message = data[APIKey.message] as? String {
                        completion(true, message)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
