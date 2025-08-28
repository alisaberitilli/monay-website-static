//
//  WithdrawalRequestHistoryVM.swift
//  Monay
//
//  Created by WFH on 27/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class WithdrawalRequestHistoryVM {
    
    // MARK: - Instance properties
    
    var transactions: [Transaction] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    // MARK: - Helper methods
    
    func withdrawalRequestHistoryAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
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
            .withdrawalRequestHistory(parameters: parameters, result: { (result) in
                
                self.isFetching = false
                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        
                        if !self.isInitialFetchCompleted {
                            self.isInitialFetchCompleted = true
                        }

                        let transactions = rows.compactMap { Transaction(JSON: $0) }
                        self.transactions.append(contentsOf: transactions)

                        if self.transactions.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noWithdrawHistory.title))
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
