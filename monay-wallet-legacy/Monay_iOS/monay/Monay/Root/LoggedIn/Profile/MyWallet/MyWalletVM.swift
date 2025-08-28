//
//  MyWalletVM.swift
//  Monay
//
//  Created by WFH on 12/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class MyWalletVM {
    
    // MARK: - Instance properties
    
    var wallet: Wallet?
    var transactions: [Transaction] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    // MARK: - Helper methods
    
    func walletAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        APIComponent
            .Profile
            .getUserWallet(result: { (result) in
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters {
                        self.wallet = Wallet(JSON: data)
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
    func userTransactionAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        handler(.defaultState)

        let parameters: HTTPParameters = [
            "name": "",
            "minAmount": "",
            "maxAmount": "",
            "timezone": TimeZone.current.identifier,
            "fromDate": "",
            "toDate": "",
            "limit": limit,
            "offset": offset,
            "paymentMethod": "wallet"
        ]
        
        isFetching = true
        
        if !isInitialFetchCompleted {
            handler(.loading)
        }
        
        APIComponent
            .transaction
            .userTransactionList(parameters: parameters, result: { (result) in
                
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
                            handler(.noResult(message: PlaceholderStateData.noTransactionFound.title))
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
