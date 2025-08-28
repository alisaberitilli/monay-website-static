//
//  KYCDocumentUploadVM.swift
//  Monay
//
//  Created by Govind Prasad on 20/02/21.
//  Copyright © 2021 Codiant. All rights reserved.
//

import Foundation

class KYCDocumentUploadVM {
    
    // MARK: - Instance properties
    
    var accountMe: AccountMe?
    
    var identification = ""
    var addressProof = ""
    
    var identificationFrontDocument = ""
    var identificationBackDocument = ""
    var identificationFrontMediaType = ""
    var identificationBackMediaType = ""
    var identificationFrontExtension = ""
    var identificationBackExtension = ""
    var identificationFrontData: Data?
    var identificationBackData: Data?

    var addressProofFrontDocument = ""
    var addressProofBackDocument = ""
    var addressFrontMediaType = ""
    var addressBackMediaType = ""
    var addressProofFrontExtension = ""
    var addressProofBackExtension = ""
    var addressProofFrontData: Data?
    var addressProofBackData: Data?
  
    var identificationImageCount = 0
    var addressProofImageCount = 0

    var dataSource: [DataSource] = []

    // MARK: - Helper Methods
    
    func isValidText() -> (Bool, String) {
        
        if Validator.emptyString(identification) {
          return (false, LocalizedKey.messageSelectIdentificationType.value)
        } else if Validator.emptyString(identificationFrontDocument) {
          return(false, LocalizedKey.messageSelectIdentificationFrontDocument.value)
        } else if identificationImageCount == 2, identificationBackDocument == "" {
          return(false, LocalizedKey.messageSelectIdentificationBackDocument.value)
        } else if Validator.emptyString(addressProof) {
          return(false, LocalizedKey.messageSelectAddressProofType.value)
        } else if Validator.emptyString(addressProofFrontDocument) {
          return(false, LocalizedKey.messageSelectAddressProofFrontDocument.value)
        } else if addressProofImageCount == 2, addressProofBackDocument == "" {
          return(false, LocalizedKey.messageSelectAddressProofBackDocument.value)
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
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters {
                        self.accountMe = AccountMe(JSON: data)
                        
                      if self.accountMe?.kycStatus == LocalizedKey.uploaded.value ||
                          self.accountMe?.kycStatus == LocalizedKey.approved.value {   // else pending rejected
                            self.identification = self.accountMe?.idProofName ?? ""
                            self.addressProof = self.accountMe?.addressProofName ?? ""
                            self.identificationFrontDocument = self.accountMe?.idProofImageUrl ?? ""
                            self.identificationBackDocument = self.accountMe?.idProofBackImageUrl ?? ""
                            self.addressProofFrontDocument = self.accountMe?.addressProofImageUrl ?? ""
                            self.addressProofBackDocument = self.accountMe?.addressProofBackImageUrl ?? ""
                        }
                      completion(true, "")
                    }
                    
                case .failure(let error):
                    HudView.kill()
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
  
  func getDocumentAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
    
    APIComponent
      .More
      .getKYCDocument(parameters: parameters) { (result) in
        
        HudView.kill()
        
        switch result {
        case .success(let response):
          
          if let data = response.serverResponse as? HTTPParameters {

            let documentData = DocumentData(JSON: data)
            var pictureOptions = [Option]()
            for value in documentData?.picture ?? [] {
              pictureOptions.append(Option(name: value.requiredDocumentName ?? "", uploadImageCount: value.uploadImageCount, isSelected: value.requiredDocumentName == self.identification))
            }
            
            var addressOptions = [Option]()
            for value in documentData?.address ?? [] {
              addressOptions.append(Option(name: value.requiredDocumentName ?? "", uploadImageCount: value.uploadImageCount, isSelected: value.requiredDocumentName == self.addressProof))
            }
            
            self.dataSource = [
                  DataSource(
                    headerTitle: LocalizedKey.selectPictureIdentificationDoc.value,
                    options: pictureOptions,
                      type: .title,
                      idType: .idProof,
                      imageCount: pictureOptions.count > 2 ? 2 : pictureOptions.count),
                  DataSource(
                      headerTitle: "",
                      options: pictureOptions,
                      type: .image,
                      idType: .idProof,
                      imageCount: pictureOptions.count > 2 ? 2 : pictureOptions.count),
                  DataSource(
                    headerTitle: LocalizedKey.selectProofOfAddress.value,
                    options: addressOptions,
                      type: .title,
                      idType: .addressProof,
                      imageCount: addressOptions.count > 2 ? 2 : addressOptions.count),
                  DataSource(
                      headerTitle: "",
                      options: addressOptions,
                      type: .image,
                      idType: .addressProof,
                      imageCount: addressOptions.count > 2 ? 2 : addressOptions.count)
              ]

            completion(true, "")
          }

        case .failure(let error):
          completion(false, error.localizedDescription)
        }
      }
  }
}
