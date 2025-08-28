//
//  AddMoneyVM.swift
//  Monay
//
//  Created by WFH on 20/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class AddMoneyVM {
    
    // MARK: - Instance properties
    
    var cards: [Card] = []
    var transaction: Transaction?
    var payBy = PayBy.newCard
    
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
}
