//
//  AutoTopupVM.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation

class AutoTopupVM {
  
  // MARK: - Instance properties
  
  var cards: [Card] = []
  var transaction: Transaction?
  var payBy = PayBy.newCard
  var selectedIndex = -1

  // MARK: - Helper methods
  
  func isValidText(_ inputData: [String]) -> (Bool, String) {
    
    let amount = Double(inputData[0]) ?? 0.0
    let refillAmount = Double(inputData[1]) ?? 0.0

    if Validator.emptyString(inputData[0]) {
      return (false, LocalizedKey.messageEnterAmount.value)
    } else if amount < 1.0 {
      return (false, LocalizedKey.amountGreaterThanOne.value)
    } else if Validator.emptyString(inputData[1]) {
      return (false, LocalizedKey.messageEnterRefillAmount.value)
    } else if refillAmount < 1.0 {
      return (false, LocalizedKey.amountGreaterThanOne.value)
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
              Authorization.shared.userCredentials.autoToupStatus = false
              Authorization.shared.synchronize()
              completion(true, "")
            } else {
              let cards = data.compactMap { Card(JSON: $0) }
              self.cards.append(contentsOf: cards)
              let index = cards.indices.filter({cards[$0].isDefault == true})
              if index.count > 0 {
                self.selectedIndex = index[0]
                self.payBy = .saveCard
              }
              completion(true, "")
            }
          }
          
        case .failure(let error):
          completion(false, error.localizedDescription)
        }
      })
  }
  
  func updateAutoTopupStatus(status: Bool, completion: @escaping ((Bool, String) -> Void)) {
      
      HudView.show()
      
     let parameters: HTTPParameters = ["autoToupStatus": status ? "true" : "false"]

      APIComponent
          .More
          .autoTopupStatusUpdate(parameters: parameters, result: { (result) in
              
              HudView.kill()
              
              switch result {
              case .success(let response):
                  
                  if let data = response.fullServerResponse as? HTTPParameters {
                    Authorization.shared.userCredentials.autoToupStatus = status
                    Authorization.shared.synchronize()
                      let message = data[APIKey.message] as? String ?? ""
                      return completion(true, message)
                  }
              case .failure(let error):
                  completion(false, error.localizedDescription)
              }
          })
  }

}
