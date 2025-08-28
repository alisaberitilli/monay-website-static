//
//  MyContactVM.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class MyContactVM {
    
    // MARK: - Instance properties
    
    var recentUsers: [User] = []
    var paymentType: PaymentType = .send
    var user: User?
    var phoneContacts: [Contact] = []
    var contactUsers: [User] = []

    var appUsers: [Contact] = []
    var nonAppUsers: [Contact] = []
    
    // MARK: - Helper methods
    
    func recentUsersAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        
        let parameters: HTTPParameters = [
            "limit": 100,   // Showing 100 user
            "offset": 0,
            "name": ""
        ]
        
        handler(.loading)

        APIComponent
            .home
            .recentPaymentUser(parameters: parameters, result: { [weak self] (result) in
                
                guard let `self` = self else {
                    return
                }
                
                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        self.recentUsers = rows.compactMap { User(JSON: $0) }
                        completion()
                    }
                    
                case .failure(let error):
                    if (error as NSError).code == SessionSystemCode.internetOffline.rawValue {
                      handler(.noConnection)
                    } else {
                      handler(.error(message: error.localizedDescription, actionType: .tryAgain))
                    }
                }
            })
    }
    
    func checkPhoneAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .home
            .checkPhone(parameters: parameters, result: { [weak self] (result) in
                
                guard let `self` = self else {
                    return
                }
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters,
                        let message = data[APIKey.message] as? String {
                        
                        if message == LocalizedKey.phoneNotFound.value {
                            return completion(true, message)
                        }
                    }
                    
                    if let data = response.serverResponse as? HTTPParameters {
                        self.user = User(JSON: data)
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
  
    func contactSyncAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        APIComponent
            .home
            .contactSync(parameters: parameters, result: { [weak self] (result) in
                
                guard let `self` = self else {
                    return
                }
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? [HTTPParameters] {
                        self.contactUsers = data.compactMap { User(JSON: $0) }
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }

}
