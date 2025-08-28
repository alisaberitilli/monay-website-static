//
//  RequestWithdrawalVM.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class RequestWithdrawalVM {
    
    // MARK: - Instance properties
    
    var wallet: Wallet?
    var banks: [Bank] = []
    var transaction: Transaction?
    var bankId = ""
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String], enteredAmount: Double, totalWallet: Double) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterAmount.value)
        } else if Validator.emptyString(inputData[1]) {
          return (false, LocalizedKey.messageSelectBank.value)
        } else if enteredAmount > totalWallet {
          return (false, LocalizedKey.messageInsufficientFunds.value)
        }
        
        return (true, "")
    }
    
    func walletAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .getUserWallet(result: { (result) in
                
                HudView.kill()
                
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
    
    func getBanksAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .getBanks(result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? [HTTPParameters] {
                        
                        if data.isEmpty {
                            completion(true, "")
                        } else {
                            let banks = data.compactMap { Bank(JSON: $0) }
                            self.banks.append(contentsOf: banks)
                            completion(true, "")
                        }
                        
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
