//
//  KYCUSADocumentUploadVM.swift
//  Monay
//
//  Created by Aayushi Bhagat on 13/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation

class KYCUSADocumentUploadVM {
    
    // MARK: - Instance properties
    
    var accountMe: AccountMe?
    
    var identification = ""
    var addressProof = ""
    
    var identificationDocument = ""
    var addressProofDocument = ""

    var addressMediaType = ""
    var identificationMediaType = ""
    var identificationExtension = ""
    var addressProofExtension = ""
    var identificationData: Data?
    var addressProofData: Data?

    // MARK: - Helper Methods
    
    func isValidText() -> (Bool, String) {

        if Validator.emptyString(identification) {
          return (false, LocalizedKey.messageSelectIdentificationType.value)
        } else if Validator.emptyString(identificationDocument) {
          return(false, LocalizedKey.messageSelectIdentificationDocument.value)
        } else if Validator.emptyString(addressProof) {
          return(false, LocalizedKey.messageSelectAddressProofType.value)
        } else if Validator.emptyString(addressProofDocument) {
          return(false, LocalizedKey.messageSelectAddressProofDocument.value)
        }

        return (true, "")
    }
  
    func isValidFileSize(size: Double) -> (Bool, String) {
        
        if size >= 15 {
          return(false, LocalizedKey.messageFileSizeValidation.value)
        }
        
        return (true, "")
    }
    
    func accountMeAPI(completion: @escaping ((Bool, String) -> Void)) {
        HudView.show()
        
        APIComponent
            .Profile
            .accountMe(result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters {
                        self.accountMe = AccountMe(JSON: data)
                        
                      if self.accountMe?.kycStatus == LocalizedKey.uploaded.value ||
                          self.accountMe?.kycStatus == LocalizedKey.approved.value {   // else pending rejected
                            self.identification = self.accountMe?.idProofName ?? ""
                            self.addressProof = self.accountMe?.addressProofName ?? ""
                            self.identificationDocument = self.accountMe?.idProofImageUrl ?? ""
                            self.addressProofDocument = self.accountMe?.addressProofImageUrl ?? ""
                            completion(true, "")
                        } else {
                          completion(false, "")
                        }
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
    func uploadMediaAPI(data: Data, parameters: HTTPParameters, ext: String, documentType: String, completion: @escaping ((Bool, String, String) -> Void)) { 
        
        APIComponent.Profile.uploadMedia(data: data, ext: ext, documentType: documentType, mediaFor: "user-kyc") { (result) in
            
            switch result {
            case .success(let response):
                
                if let data = response.serverResponse as? HTTPParameters,
                   let basePath = data[APIKey.basePath] as? String {
                    
                    completion(true, "", basePath)
                }
                
            case .failure(let error):
                HudView.kill()
                completion(false, error.localizedDescription, "")
            }
        }
    }
    
    func updateKYCAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {

        APIComponent
            .More
            .updateKYC(parameters: parameters) { (result) in
                
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
        }
    }
}
