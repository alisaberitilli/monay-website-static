//
//  ShareInviteVM.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation

class ShareInviteVM {
    
    // MARK: - Instance properties
    
    var accountMe: AccountMe?
    
    // MARK: - Helper methods
    
    func accountMeAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        APIComponent
            .Profile
            .accountMe(result: { (result) in
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters {
                        self.accountMe = AccountMe(JSON: data)
                        Authorization.shared.userCredentials.companyName.value = self.accountMe?.companyName ?? ""
                        Authorization.shared.userCredentials.taxId.value = self.accountMe?.taxId ?? ""
                        Authorization.shared.userCredentials.registrationNumber.value = self.accountMe?.registrationNumber ?? ""
                        Authorization.shared.userCredentials.isKYCVerified = self.accountMe?.isKYCVerified
                        Authorization.shared.userCredentials.qrCode.value = self.accountMe?.qrCodeUrl ?? ""
                        Authorization.shared.userCredentials.phoneNumber.value =  self.accountMe?.phoneNumber ?? ""
                        Authorization.shared.userCredentials.countryCode.value = self.accountMe?.phoneNumberCountryCode ?? ""
                        Authorization.shared.userCredentials.email.value = self.accountMe?.email ?? ""
                        Authorization.shared.userCredentials.isEmailVerified =  self.accountMe?.isEmailVerified ?? false
                        Authorization.shared.synchronize()
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
}
