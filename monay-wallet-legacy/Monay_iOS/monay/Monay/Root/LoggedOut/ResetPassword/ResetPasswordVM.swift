//
//  ResetPasswordVM.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ResetPasswordVM {
    
    var countryCode = ""
    var phoneNumber = ""
    var email = ""
    var verificationCode = ""
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        if Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterNewPassword.value)
        } else if !Validator.validPassword(inputData[0]) {
          return (false, LocalizedKey.messagePasswordValidation.value)
        } else if Validator.emptyString(inputData[1]) {
          return (false, LocalizedKey.messageEnterConfirmNewPassword.value)
        } else if inputData[0] != inputData[1] {
          return(false, LocalizedKey.messagePasswordShouldSame.value)
        }
        
        return (true, "")
    }
    
    func resetPasswordAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .resetPassword(parameters: parameters, result: { (result) in
                
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
