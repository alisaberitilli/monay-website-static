//
//  PayMoneyVM.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class PayMoneyVM {
    
    // MARK: - Instance properties
    
    var user: User?
    var cards: [Card] = []
    var paymentMethod = PaymentMethod.card
    var payBy = PayBy.saveCard
    
    var transaction: Transaction?
    
    // for pay by wallet
    var wallet: Wallet?
    
    // pay by user request
    var requestId = ""
    var isUserRequestPayMoney = false
    var amount = ""
    var primaryUsers: [SecondaryUser] = []
  
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        let amount = Double(inputData[0]) ?? 0.0
        
        if Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterAmount.value)
        } else if amount < 1.0 {
          return (false, LocalizedKey.amountGreaterThanOne.value)
        }
        
        return (true, "")
    }
    
    func isValidEnteredAmount(enteredAmount: Double, totalWallet: Double) -> (Bool, String) {
        
        if enteredAmount > totalWallet {
          return (false, LocalizedKey.messageInsufficientFundInWallet.value)
        }
        
        return (true, "")
    }
    
    func isCardExpired(isCardExpired: Bool) -> (Bool, String) {
        if isCardExpired {
          return (false, LocalizedKey.messageCardExpired.value)
        }
        
        return (true, "")
    }
    
    func getCardsAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .getCards(result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? [HTTPParameters] {
                        
                        if data.isEmpty {
                            completion(true, "")
                        } else {
                            let cards = data.compactMap { Card(JSON: $0) }
                            self.cards.append(contentsOf: cards)
                            completion(true, "")
                        }
                        
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
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
  
  func primaryUser(_ completion: @escaping ((Bool, String) -> Void)) {
     
     HudView.show()
     
     APIComponent
       .More
       .primaryUser(result: { (result) in
         
         HudView.kill()
         
         switch result {
         case .success(let response):
           if let data = response.serverResponse as? HTTPParameters,
              let rows = data[APIKey.rows] as? [HTTPParameters] {
             
             let user = rows.compactMap { SecondaryUser(JSON: $0, context: UserContext.primary) }
             self.primaryUsers.append(contentsOf: user)
             completion(true, "")
           }
           
         case .failure(let error):
           completion(false, error.localizedDescription)
         }
       })
   }
}
