//
//  AddNewCardVM.swift
//  Monay
//
//  Created by WFH on 13/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class AddNewCardVM {
    
    // MARK: - Instance properties
    
    var cardType = CardTypeEnum.creditCard
    var currentYear = 0
    var currentMonth = 0
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterName.value)
        } else if Validator.emptyString(inputData[1]) {
          return(false, LocalizedKey.messageEnterCardNumber.value)
        } else if !creditCardInput().isValid() {
          return(false, LocalizedKey.messageEnterValidCardNumber.value)
        }
        return (true, "")
    }
    
    func isValidMonthYearCVV(_ inputData: [String]) -> (Bool, String) {
        
        if self.currentYear > Int(inputData[1])! {
          return(false, LocalizedKey.messageEnterValidExpiryYear.value)
        } else if self.currentYear == Int(inputData[1])!, Int(inputData[0])! < self.currentMonth {
          return(false, LocalizedKey.messageEnterValidExpiryMonth.value)
        } else if Validator.emptyString(inputData[2]) {
          return(false, LocalizedKey.messageEnterCVV.value)
        }
        
        return (true, "")
    }
    
    func addCardAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .addCard(parameters: parameters, result: { (result) in
                
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
}
