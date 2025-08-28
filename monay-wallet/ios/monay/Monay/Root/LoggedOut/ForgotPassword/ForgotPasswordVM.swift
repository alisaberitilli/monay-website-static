//
//  ForgotPasswordVM.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ForgotPasswordVM {
    
    // MARK: - Instance properties
    
    var usertype: UserType = .user
    var curentUserIDMode = UserIDMode.mobile
    var countryList: [CountryList] = []

    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if curentUserIDMode == UserIDMode.email && Validator.emptyString(inputData[0]) {
          return(false, "\(LocalizedKey.messgeEnterRegisteredMobileNumber.value) \n \(LocalizedKey.or.value) \n \(LocalizedKey.messgeEnterRegisteredEmail.value)")
            
        } else if curentUserIDMode == UserIDMode.email && !Validator.validEmail(inputData[0]) {
          return(false, LocalizedKey.messageEnterCorrectEmail.value)
            
        } else if curentUserIDMode == UserIDMode.mobile && Validator.emptyString(inputData[0]) {
            return (false, "\(LocalizedKey.messgeEnterRegisteredMobileNumber.value) \n \(LocalizedKey.or.value) \n \(LocalizedKey.messgeEnterRegisteredEmail.value)")
            
        } else if curentUserIDMode == UserIDMode.mobile && !Validator.emptyString(inputData[0]) {
            
            if !Validator.isValidPhoneNumber(inputData[0]) {
              return(false, LocalizedKey.messageMobileNumberValidLength.value)
            }
        }
        
        return (true, "")
    }
    
    func forgotPasswordAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .forgotPassword(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    
                    if let data = response.fullServerResponse as? HTTPParameters {
                        let message = data[APIKey.message] as? String ?? ""
                        completion(true, message)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
    // MARK: - CountryList API
func countryList(completion: @escaping ((Bool, String) -> Void)) {
    
    HudView.show()
     
    APIComponent
        .Account
        .countryList(result: { (result) in
            
            HudView.kill()
            
            switch result {
            case .success(let response):
                if let data = response.serverResponse as? [HTTPParameters] {
                    
                    if data.isEmpty {
                        completion(true, "")
                    } else {
                        let cards = data.compactMap { CountryList(JSON: $0) }
                        self.countryList.append(contentsOf: cards)
                        
                        completion(true, "")
                    }
                }
            case .failure(let error):
                completion(false, error.localizedDescription)
            }
        })
}
}
