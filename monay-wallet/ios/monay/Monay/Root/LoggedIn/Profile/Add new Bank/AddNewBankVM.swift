//
//  AddNewBankVM.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class AddNewBankVM {
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
      if Authorization.shared.userCredentials.countryCode.value == "+91" {
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterAccountHolderName.value)
        } else if Validator.emptyString(inputData[1]) {
          return(false, LocalizedKey.messageEnterBankName.value)
        } else if Validator.emptyString(inputData[2]) {
          return(false, LocalizedKey.messageEnterBankAccountNumber.value)
        } else if Validator.emptyString(inputData[5]) {
          return(false, LocalizedKey.messageEnterIFSCCode.value)
        }
      } else {
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterAccountHolderName.value)
        } else if Validator.emptyString(inputData[1]) {
          return(false, LocalizedKey.messageEnterBankName.value)
        } else if Validator.emptyString(inputData[2]) {
          return(false, LocalizedKey.messageEnterBankAccountNumber.value)
        } else if Validator.emptyString(inputData[3]) {
          return(false, LocalizedKey.messageEnterRoutingNumber.value)
        } else if Validator.filter(string: inputData[3]).count < 9 {
          return(false, LocalizedKey.messageEnterValidRoutingNumber.value)
        }
      }
        
        return (true, "")
    }
    
    func addBankAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .addBank(parameters: parameters, result: { (result) in
                
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
