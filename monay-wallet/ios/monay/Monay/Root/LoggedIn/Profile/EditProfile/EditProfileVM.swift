//
//  EditProfileVM.swift
//  Monay
//
//  Created by WFH on 12/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class EditProfileVM {
    
    // MARK: - Instance properties
    
    var accountMe: AccountMe?
    var changeMobileOrEmailType = ChangeMobileOrEmailType.mobile
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String], userType: UserType) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterFirstName.value)
        } else if Validator.emptyString(inputData[1]) {
          return(false, LocalizedKey.messageEnterLastName.value)
        } else if Validator.emptyString(inputData[2]) {
          return(false, LocalizedKey.messageEnterEmail.value)
        } else if !Validator.validEmail(inputData[2]) {
          return(false, LocalizedKey.messageEnterCorrectEmail.value)
        }
        
        if userType == .merchant {
            if Validator.emptyString(inputData[3]) {
              return (false, LocalizedKey.messageEnterCompanyName.value)
            } else if Validator.emptyString(inputData[4]) {
              return (false, LocalizedKey.messageEnterTaxID.value)
            } else if Validator.filter(string: inputData[4]).count > 25 {
              return (false, LocalizedKey.messageTaxIDLength.value)
            } else if Validator.emptyString(inputData[5]) {
              return(false, LocalizedKey.messageEnterChamberCommerce.value)
            } else if Validator.filter(string: inputData[5]).count > 25 {
              return (false, LocalizedKey.messageChamberCommerceValidLength.value)
            }
        }
        
        return (true, "")
    }
    
    func isValidFileSize(size: Double) -> (Bool, String) {
        
        if size >= 15 {
          return(false, LocalizedKey.messageFileSizeValidation.value)
        }
        
        return (true, "")
    }
    
    func isSimilar(savedEmail: String, newEmail: String) -> (Bool, String) {
        
        guard savedEmail.isEqual(to: newEmail) else {
          return (false, LocalizedKey.messageUpdateSaveNewEmail.value)
        }
        
        return (true, "")
    }
    
    func uploadMediaAPI(data: Data, completion: @escaping ((Bool, String, String) -> Void)) {
        
        HudView.show()
        
      APIComponent.Profile.uploadMedia(data: data, ext: LocalizedKey.pngImage.value, documentType: LocalizedKey.image.value, mediaFor: APIKey.user) { (result) in
            
            HudView.kill()
            
            switch result {
            case .success(let response):
                
                if let data = response.serverResponse as? HTTPParameters,
                   let basePath = data[APIKey.basePath] as? String {
                    
                    completion(true, "", basePath)
                }
                
            case .failure(let error):
                completion(false, error.localizedDescription, "")
            }
        }
    }
    
    func updateProfileAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String, String) -> Void)) {
        
        let userType = Authorization.shared.userCredentials.userType ?? .user
        
        HudView.show()
        
        APIComponent
            .Profile
            .updateProfile(userType: userType, parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters,
                        let json = response.serverResponse as? HTTPParameters,
                        let message = data[APIKey.message] as? String {
                        let profilePictureUrl = json[APIKey.profilePictureUrl] as? String ?? ""
                        completion(true, message, profilePictureUrl)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription, "")
                }
            })
    }
    
    func sendEmailVerificationCodeAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .sendEmailVerificationCode(result: { (result) in
                
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
    
    func resendOTPAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .resendOTP(parameters: parameters, result: { (result) in
                
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
