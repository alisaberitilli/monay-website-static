//
//  ChangePasswordVM.swift
//  Monay
//
//  Created by Aayushi on 14/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ChangePasswordVM {
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterCurrentPassword.value)
        } else if !Validator.validPassword(inputData[0]) {
          return (false, LocalizedKey.messageEnterValidCurrentPassword.value)
        } else if Validator.emptyString(inputData[1]) {
          return (false, LocalizedKey.messageEnterNewPassword.value)
        } else if !Validator.validPassword(inputData[1]) {
          return (false, LocalizedKey.messagePasswordValidation.value)
        } else if inputData[0] == inputData[1] {
          return(false, LocalizedKey.messageCurrentPasswordSouldSame.value)
        } else if Validator.emptyString(inputData[2]) {
          return (false, LocalizedKey.messageEnterConfirmPassword.value)
        } else if inputData[1] != inputData[2] {
          return(false, LocalizedKey.messagePasswordShouldSame.value)
        }
        
        return (true, "")
    }
    
    // MARK: - Api Calling Method
    
    func changePasswordAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .More
            .changePassword(parameters: parameters, result: { (result) in
                
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
