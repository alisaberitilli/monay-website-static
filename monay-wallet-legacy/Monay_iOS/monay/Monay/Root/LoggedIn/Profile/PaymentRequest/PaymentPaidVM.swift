//
//  PaymentPaidVM.swift
//  Monay
//
//  Created by WFH on 24/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class PaymentPaidVM {
    
    // MARK: - Instance properties
    
    var paidRequests: [PaymentRequest] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    // MARK: - Helper methods
    
    func paidPaymentRequestAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
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
          .paymentRequestType(type: LocalizedKey.paid.value.lowercased(), parameters: parameters, result: { (result) in
                
                self.isFetching = false
                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        
                        if !self.isInitialFetchCompleted {
                            self.isInitialFetchCompleted = true
                        }
                      
                        let paidRequests = rows.compactMap { PaymentRequest(JSON: $0) }
                        self.paidRequests.append(contentsOf: paidRequests)

                        if self.paidRequests.isEmpty {
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
}
