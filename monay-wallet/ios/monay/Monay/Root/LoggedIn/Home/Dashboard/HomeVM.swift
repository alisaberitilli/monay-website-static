//
//  HomeVM.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class HomeVM {
    
    // MARK: - Instance properties
    
    var paymentRequests: [PaymentRequest] = []
    var recentTransactions: [Transaction] = []
    var totalWalletAmount = ""
    var phoneContacts: [Contact] = []
    var appUsers: [User] = []
    var unReadCount: String = ""
    var totalSecondaryUserAmount = ""
  
    // MARK: - Helper methods
    
    func homeAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        
        handler(.loading)

        APIComponent
            .home
            .home { (result) in
                
                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                        let paymentRequest = data["paymentRequest"] as? [HTTPParameters],
                        let recentTransaction = data["recentTransaction"] as? [HTTPParameters] {
                        self.paymentRequests = paymentRequest.compactMap { PaymentRequest(JSON: $0) }
                        self.recentTransactions = recentTransaction.compactMap { Transaction(JSON: $0) }
                    
                        let totalWalletAmountString = data["totalWalletAmount"] as? String
                        let totalWalletAmountInt = data["totalWalletAmount"] as? Int
                        let totalWalletAmountDouble = data["totalWalletAmount"] as? Double
                        
                        self.totalWalletAmount = totalWalletAmountString ?? ""
                        
                        if totalWalletAmountString == nil {
                            self.totalWalletAmount = String(totalWalletAmountInt ?? 0)
                        }
                        
                        if totalWalletAmountString == nil && totalWalletAmountInt == nil {
                            self.totalWalletAmount = String(totalWalletAmountDouble ?? 0.0)
                        }
                        
                        Authorization.shared.totalWalletAmount = self.totalWalletAmount

                      let totalSecondaryAmountString = data["secondaryUserLimit"] as? String
                      let totalSecondaryAmountInt = data["secondaryUserLimit"] as? Int
                      let totalSecondaryAmountDouble = data["secondaryUserLimit"] as? Double

                      self.totalWalletAmount = Authorization.shared.userCredentials.userType == .secondaryUser ? totalSecondaryAmountString ?? "" : totalWalletAmountString ?? ""
                      
                      if totalSecondaryAmountString == nil {
                        self.totalSecondaryUserAmount = String(totalSecondaryAmountInt ?? 0)
                      }
                      
                      if totalSecondaryAmountString == nil && totalSecondaryAmountInt == nil {
                        self.totalSecondaryUserAmount = String(totalSecondaryAmountDouble ?? 0.0)
                      }
                      
                      Authorization.shared.totalSecondaryWalletAmount = self.totalSecondaryUserAmount
                      Authorization.shared.synchronize()
                      
                        if let unreadCount = data["unReadCount"] as? Int {
                            self.unReadCount = unreadCount.description
                        }
                        
                        completion()
                    }
                    
                case .failure(let error):
                    if (error as NSError).code == SessionSystemCode.internetOffline.rawValue {
                      handler(.noConnection)
                    } else {
                      handler(.error(message: error.localizedDescription, actionType: .tryAgain))
                    }
                }
        }
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
    
    func contactSyncAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        APIComponent
            .home
            .contactSync(parameters: parameters, result: { (result) in
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? [HTTPParameters] {
                        self.appUsers = data.compactMap { User(JSON: $0) }
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
