//
//  SignupVM.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class SignupVM {
    
    // MARK: - Inputs
    
    var usertype: UserType = .user
    var countryCode: String = ""
    var phoneNumber: String = ""
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String], userType: UserType) -> (Bool, String) { 
        
        if Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterFirstName.value)
        } else if Validator.emptyString(inputData[1]) {
            return (false, LocalizedKey.messageEnterLastName.value)
        } else if Validator.emptyString(inputData[2]) {
            return(false, LocalizedKey.messageEnterEmail.value)
        } else if !Validator.validEmail(inputData[2]) {
            return(false, LocalizedKey.messageEnterCorrectEmail.value)
        } else if Validator.emptyString(inputData[3]) {
            return (false, LocalizedKey.messageEnterPassword.value)
        } else if !Validator.validPassword(inputData[3]) {
            return (false, LocalizedKey.messageEnterValidPassword.value)
        } else if Validator.emptyString(inputData[4]) {
            return (false, LocalizedKey.messageEnterConfirmPassword.value)
        } else if inputData[3] != inputData[4] {
            return(false, LocalizedKey.messagePasswordsNotMatch.value)
        }
        
        if userType == .merchant {
            if Validator.emptyString(inputData[6]) {
              return (false, LocalizedKey.messageEnterCompanyName.value)
            } else if Validator.emptyString(inputData[7]) {
                return (false, LocalizedKey.messageEnterTaxID.value)
            } else if Validator.filter(string: inputData[7]).count > 25 {
                return (false, LocalizedKey.messageTaxIDLength.value)
            } else if Validator.emptyString(inputData[8]) {
                return(false, LocalizedKey.messageEnterChamberCommerce.value)
            } else if Validator.filter(string: inputData[8]).count > 25 {
                return (false, LocalizedKey.messageChamberCommerceValidLength.value)
            }
        }
        
        if Validator.emptyString(inputData[5]) {
            return(false, LocalizedKey.messageAgreeTNC.value)
        }
        
        return (true, "")
    }
    
    func signupAPI(userType: UserType, parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .signup(userType: userType, parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    
                    if let json = response.serverResponse as? HTTPParameters,
                       let token = json[APIKey.token] as? String {
                        
                        HudView.show()
                        
                        self.getGeneralSettings { (success, message, settingData) in
                            if success {
                                HudView.kill()
                                do {
                                    try Authorization.shared.authorize(jwt: token, json: json, settings: settingData)
                                    completion(true, "")
                                } catch is JWTTokenExpirationError {
                                    completion(false, LocalizedKey.messageInvalidTokenExpiration.value)
                                } catch {
                                    completion(false, error.localizedDescription)
                                }
                            } else {
                                HudView.kill()
                                completion(false, message)
                            }
                        }
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
  
    private func getGeneralSettings(completion: @escaping ((Bool, String, HTTPParameters) -> Void)) {
        APIComponent.Setting.getGeneralAppSetting { (result) in
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

    func checkEmailAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        APIComponent
            .Account
            .checkEmail(parameters: parameters, result: { (result) in
                
                switch result {
                case .success:
                  completion(true, LocalizedKey.messageEmailAlreadyExist.value)
                    
                case .failure(let error):
                    if (error as NSError).code == HTTPStatusCode.success.rawValue {
                      completion(false, "")
                    } else if (error as NSError).code == SessionSystemCode.internetOffline.rawValue {
                      Alert.showNetWorkAlert()
                    } else {
                      Alert.showAlertWithMessage(error.localizedDescription, title: kProductName)
                    }

                }
            })
    }

}
