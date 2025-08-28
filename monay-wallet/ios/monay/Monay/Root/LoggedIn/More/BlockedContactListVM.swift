//
//  BlockContactVM.swift
//  Monay
//
//  Created by WFH on 11/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class BlockedContactListVM {
    
    // MARK: - Instance properties
    
    var users: [User] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    // MARK: - Helper methods
    
    func userBlockListAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        handler(.defaultState)
        
        let parameters: HTTPParameters = [
            "limit": limit,
            "offset": offset
        ]
        
        isFetching = true
        
        if !isInitialFetchCompleted {
            handler(.loading)
        }
        
        APIComponent
            .More
            .getUserBlockList(parameters: parameters, result: { (result) in
                
                self.isFetching = false
                handler(.defaultState)
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        
                        if !self.isInitialFetchCompleted {
                            self.isInitialFetchCompleted = true
                        }
                        
                        let rowsData = rows.compactMap { $0[APIKey.blockUser] as? HTTPParameters }
                        let users = rowsData.compactMap { User(JSON: $0) }
                        self.users.append(contentsOf: users)
                        
                        if self.users.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noContact.title))
                        } else {
                            completion()
                        }
                        
                        if let total = data[APIKey.total] as? Int {
                            self.total = total
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
    
    func unblockUserAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
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
