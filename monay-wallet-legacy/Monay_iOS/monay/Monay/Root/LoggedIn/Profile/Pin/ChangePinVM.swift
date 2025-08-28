//
//  ChangePinVM.swift
//  Monay
//
//  Created by WFH on 06/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ChangePinVM {
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String, Bool) { // swiftlint:disable:this large_tuple
        
        if Validator.emptyString(inputData[0]) &&
            Validator.emptyString(inputData[1]) &&
            Validator.emptyString(inputData[2]) &&
            Validator.emptyString(inputData[3]) {
          return (false, LocalizedKey.messageEnterOldPin.value, false)
        } else if Validator.emptyString(inputData[0]) ||
            Validator.emptyString(inputData[1]) ||
            Validator.emptyString(inputData[2]) ||
            Validator.emptyString(inputData[3]) {
          return (false, LocalizedKey.messageEnterValidOldPin.value, false)
        } else if Validator.emptyString(inputData[4]) &&
            Validator.emptyString(inputData[5]) &&
            Validator.emptyString(inputData[6]) &&
            Validator.emptyString(inputData[7]) {
          return (false, LocalizedKey.messageEnterNewPin.value, false)
        } else if Validator.emptyString(inputData[4]) ||
            Validator.emptyString(inputData[5]) ||
            Validator.emptyString(inputData[6]) ||
            Validator.emptyString(inputData[7]) {
          return (false, LocalizedKey.messageEnterValidNewPin.value, false)
        } else if Validator.emptyString(inputData[8]) &&
            Validator.emptyString(inputData[9]) &&
            Validator.emptyString(inputData[10]) &&
            Validator.emptyString(inputData[11]) {
          return (false, LocalizedKey.messageEnterConfirmNewPin.value, false)
        } else if Validator.emptyString(inputData[8]) ||
            Validator.emptyString(inputData[9]) ||
            Validator.emptyString(inputData[10]) ||
            Validator.emptyString(inputData[11]) {
          return (false, LocalizedKey.messageEnterValidConfirmNewPin.value, false)
        }
        
        if inputData[12] != inputData[13] {
          return(false, LocalizedKey.messageNewPinConfirmPinSouldSame.value, true)
        }
        
        return (true, "", false)
    }
    
    func changePinAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .changePinApi(parameters: parameters, result: { (result) in
                
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
