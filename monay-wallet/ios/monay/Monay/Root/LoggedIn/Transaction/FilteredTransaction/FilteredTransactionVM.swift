//
//  FilteredTransactionVM.swift
//  Monay
//
//  Created by WFH on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class FilteredTransactionVM {
    
    // MARK: - Instance properties
    
    var filteredTags: [String] = []
    var transactions: [Transaction] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    // MARK: - Helper methods
    
    func userTransactionAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) { 
        
        handler(.defaultState)

        let transactionFilter = TransactionFilter.default
        var fromDateString = transactionFilter.fromDate
        var toDateString = transactionFilter.toDate
        let name = transactionFilter.name
        let minPrice = transactionFilter.minPrice
        let maxPrice = transactionFilter.maxPrice
        var transactionType = transactionFilter.transactionType
        
      if transactionType == LocalizedKey.transfer.value {
        transactionType = LocalizedKey.transfer.value.lowercased()
        } else if transactionType == LocalizedKey.added.value {
          transactionType = LocalizedKey.deposite.value.lowercased()
        } else if transactionType == LocalizedKey.withdraw.value {
          transactionType = LocalizedKey.withdrawal.value.lowercased()
        } else if transactionType == LocalizedKey.failed.value.capitalized {
            transactionType = LocalizedKey.failed.value
        }
        
        if !fromDateString.isEmpty {
          let fromDate = Date(fromString: fromDateString, format: .custom(DateFormate.ddMMMyyyyDate.rawValue))
          fromDateString = fromDate?.toString(format: .custom(DateFormate.yyyyMMdd.rawValue)) ?? ""
        }
        
        if !toDateString.isEmpty {
            let toDate = Date(fromString: toDateString, format: .custom(DateFormate.ddMMMyyyyDate.rawValue))
            toDateString = toDate?.toString(format: .custom(DateFormate.yyyyMMdd.rawValue)) ?? ""
        }

        let parameters: HTTPParameters = [
            "name": name,
            "minAmount": minPrice,
            "maxAmount": maxPrice,
            "timezone": TimeZone.current.identifier,
            "fromDate": fromDateString,
            "toDate": toDateString,
            "limit": limit,
            "offset": offset,
            "actionType": transactionType
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
