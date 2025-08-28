//
//  NotificationVM.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class NotificationVM {
    
    // MARK: - Instance properties
    
    var notifications: [Notification] = []
    
    // Pagination
    var offset = 0
    var limit = 10
    var total = 0
    var isFetching = false
    var isInitialFetchCompleted = false
    
    var redirectFrom = RedirectFrom.home
    
    // MARK: - Helper methods
    
    func notificationAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
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
            .notification(parameters: parameters, result: { (result) in
                
                self.isFetching = false
                handler(.defaultState)
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        
                        if !self.isInitialFetchCompleted {
                            self.isInitialFetchCompleted = true
                        }
                        
                        let notifications = rows.compactMap { Notification(JSON: $0) }
                        self.notifications.append(contentsOf: notifications)
                        
                        if self.notifications.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noNotificationFound.title))
                        } else {
                            completion()
                        }
                        
                      if let total = data[APIKey.count] as? Int {
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
}

extension NotificationVM {
    enum RedirectFrom {
        case home
        case setting
        case notificationTap
    }
}
