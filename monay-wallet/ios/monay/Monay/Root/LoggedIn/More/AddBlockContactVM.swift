//
//  MyContactVM.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class AddBlockContactVM {
    
    // MARK: - Instance properties
    
    var phoneContacts: [Contact] = []
    var appUsers: [User] = []
    var filteredAppUsers: [User] = []
    
    // MARK: - Helper methods
    
    func contactSyncAPI(parameters: HTTPParameters, _ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        
        handler(.loading)
        
        APIComponent
            .home
            .contactSync(parameters: parameters, result: { (result) in
                
                 handler(.defaultState)
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? [HTTPParameters] {
                        self.appUsers = data.compactMap { User(JSON: $0) }
                        self.appUsers = self.appUsers.filter { !($0.isBlocked ?? false) }
                        self.filteredAppUsers = self.appUsers
                        
                        if self.filteredAppUsers.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noContact.title))
                        } else {
                            completion()
                        }
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
    
    func blockUserAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .More
            .blockUnblock(parameters: parameters, result: { (result) in
                
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
