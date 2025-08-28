//
//  LoginVM.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class LoginVM {
    
    // MARK: - Instance properties
    
    var curentUserIDMode = UserIDMode.mobile
    var countryList: [CountryList] = []

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
      
        if Validator.emptyString(inputData[1]) {
          return (false, LocalizedKey.messageEnterPassword.value)
        }

        return (true, "")
    }

    func loginAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .login(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    
                    if let json = response.serverResponse as? HTTPParameters,
                       let token = json[APIKey.token] as? String {
                        
                        self.getGeneralSettings { (success, message, settingData) in
                            if success {
                                do {
                                    try Authorization.shared.authorize(jwt: token, json: json, settings: settingData)
                                    completion(true, "")
                                } catch is JWTTokenExpirationError {
                                    completion(false, LocalizedKey.messageInvalidTokenExpiration.value)
                                } catch {
                                    completion(false, error.localizedDescription)
                                }
                            } else {
                                completion(false, message)
                            }
                        }
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
    func getGeneralSettings(completion: @escaping ((Bool, String, HTTPParameters) -> Void)) {
        
        HudView.show()
        
        APIComponent.Setting.getGeneralAppSetting { (result) in
            
            HudView.kill()
            
            switch result {
            case .success(let response):
                
                if let json = response.serverResponse as? HTTPParameters {
                    completion(true, "", json)
                } else {
                    completion(false, "", [:])
                }
            case .failure(let error):
                completion(false, error.localizedDescription, [:])
            }
        }
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
