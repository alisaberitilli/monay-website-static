//
//  TransactionAccountVM.swift
//  Monay
//
//  Created by Codiant on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation
class TransactionAccountVM {
  
  // MARK: - Instance properties

  var transactions: [Transaction] = []
  
  // Pagination
  var offset = 0
  var limit = 10
  var total = 0
  var isFetching = false
  var isInitialFetchCompleted = false

  // MARK: - Helper methods
  
  func secondaryUserTransactionAPI(id: String, _ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
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
          "secondaryUserId": id
      ]
      
      isFetching = true
      
      if !isInitialFetchCompleted {
          handler(.loading)
      }
      
      APIComponent
          .transaction
          .userTransactionList(parameters: parameters, result: { [weak self] (result) in
              
              guard let `self` = self else {
                return
              }

              self.isFetching = false
              handler(.defaultState)
              
              switch result {
              case .success(let response):
                  if let data = response.serverResponse as? HTTPParameters,
                     let rows = data[APIKey.rows] as? [HTTPParameters] {
                      
                      if !self.isInitialFetchCompleted {
                          self.isInitialFetchCompleted = true
                      }
                    print("rows ==>>\(rows)")
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
