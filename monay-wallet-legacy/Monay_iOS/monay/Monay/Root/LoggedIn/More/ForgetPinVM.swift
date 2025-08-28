//
//  ForgetPinVM.swift
//  Monay
//
//  Created by WFH on 18/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ForgetPinVM {
    
    // MARK: - Instance properties
    
    var curentUserIDMode = UserIDMode.mobile
    var usertype: UserType = .user
    var redirectFrom = RedirectFrom.pin
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if curentUserIDMode == UserIDMode.email && Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterEmail.value)
            
        } else if curentUserIDMode == UserIDMode.email && !Validator.validEmail(inputData[0]) {
          return(false, LocalizedKey.messageEnterCorrectEmail.value)
            
        } else if curentUserIDMode == UserIDMode.mobile && Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterMobileNumber.value)
            
        } else if curentUserIDMode == UserIDMode.mobile && !Validator.emptyString(inputData[0]) {
            
            if !Validator.isValidPhoneNumber(inputData[0]) {
              return(false, LocalizedKey.messageMobileNumberValidLength.value)
            }
        }
        
        return (true, "")
    }
    
    func forgotPinAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .forgotPinAPI(parameters: parameters, result: { (result) in
                
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
