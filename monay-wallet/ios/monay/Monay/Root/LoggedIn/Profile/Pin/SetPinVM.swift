//
//  PinVM.swift
//  Monay
//
//  Created by WFH on 19/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class SetPinVM {
    
    // MARK: - Instance properties
    
    var redirectFrom: RedirectFrom?
    var countryCode = ""
    var phoneNumber = ""
    var otp = ""
    var email = ""
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String, Bool) { // swiftlint:disable:this large_tuple
        
        if redirectFrom == .pin {
            if Validator.emptyString(inputData[0]) &&
                Validator.emptyString(inputData[1]) &&
                Validator.emptyString(inputData[2]) &&
                Validator.emptyString(inputData[3]) {
              return (false, LocalizedKey.messageEnterNewPin.value, false)
            } else if Validator.emptyString(inputData[0]) ||
                Validator.emptyString(inputData[1]) ||
                Validator.emptyString(inputData[2]) ||
                Validator.emptyString(inputData[3]) {
              return (false, LocalizedKey.messageEnterValidNewPin.value, false)
            }
            
            if Validator.emptyString(inputData[4]) &&
                Validator.emptyString(inputData[5]) &&
                Validator.emptyString(inputData[6]) &&
                Validator.emptyString(inputData[7]) {
              return (false, LocalizedKey.messageEnterConfirmNewPin.value, false)
            } else if Validator.emptyString(inputData[4]) ||
                Validator.emptyString(inputData[5]) ||
                Validator.emptyString(inputData[6]) ||
                Validator.emptyString(inputData[7]) {
              return (false, LocalizedKey.messageEnterValidConfirmNewPin.value, false)
            }
            
            if inputData[8] != inputData[9] {
              return(false, LocalizedKey.messageNewPinConfirmPinSouldSame.value, true)
            }
        } else {
         
            if Validator.emptyString(inputData[0]) &&
                Validator.emptyString(inputData[1]) &&
                Validator.emptyString(inputData[2]) &&
                Validator.emptyString(inputData[3]) {
              return (false, LocalizedKey.messageEnterPin.value, false)
            } else if Validator.emptyString(inputData[0]) ||
                Validator.emptyString(inputData[1]) ||
                Validator.emptyString(inputData[2]) ||
                Validator.emptyString(inputData[3]) {
              return (false, LocalizedKey.messageEnterValidPin.value, false)
            }
            
            if Validator.emptyString(inputData[4]) &&
                Validator.emptyString(inputData[5]) &&
                Validator.emptyString(inputData[6]) &&
                Validator.emptyString(inputData[7]) {
              return (false, LocalizedKey.messageEnterConfirmPin.value, false)
            } else if Validator.emptyString(inputData[4]) ||
                Validator.emptyString(inputData[5]) ||
                Validator.emptyString(inputData[6]) ||
                Validator.emptyString(inputData[7]) {
              return (false, LocalizedKey.enterValidConfirmPin.value, false)
            }
            
            if inputData[8] != inputData[9] {
              return(false, LocalizedKey.messagePinConfirmPinShouldSame.value, true)
            }
        }
        
        return (true, "", false)
    }
    
    func setPinAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .setPin(parameters: parameters, result: { (result) in
                
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
    
    func resetPinAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .resetPinAPI(parameters: parameters, result: { (result) in
                
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
