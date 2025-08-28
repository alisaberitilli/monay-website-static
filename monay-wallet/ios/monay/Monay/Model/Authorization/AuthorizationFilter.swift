//
//  AuthorizationFilter.swift
//
//  Created by WFH on 02/06/20.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation
import CocoaLumberjack

enum AuthorizationFilterError: LocalizedError {
    case tokenExpired
    
    var errorDescription: String? {
        switch self {
        case .tokenExpired:
            return LocalizedKey.messageJWTTokenExpired.value
        }
    }
    
}

class AuthorizationFilter: HTTPRequestFilter {
    
    func filter(request: inout HTTPRequest) throws {
        
        if request.authorizationPolicy == .signedIn {
            
            // Validate jwt expiration
            do {
                try Authorization.shared.verifyExpirationDate()
                
                request.setValue("\(APIKey.bearer) \(Authorization.shared.jwt!)", forHTTPHeaderField: APIKey.authorization)
            } catch {
                Authorization.shared.clearSession()
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    appDelegate.logout()
                }
                DDLogDebug("\(#function): jwt token is expired.")
                throw AuthorizationFilterError.tokenExpired
            }
        }
        
    }
    
}

extension AuthorizationFilter: HTTPResponseFilter {
  
  func filter(response: inout HTTPResponse) throws {
    
    do {
      guard let response = response.urlResponse as? HTTPURLResponse, let statusCode = HTTPStatusCode(rawValue: response.statusCode) else {
        return
      }
      
      switch statusCode {
      case .unauthorized:
        handleUnauthorization()
        
      case .forbidden:
        handleForceUpdate()
        
      default:
        break
      }
    }
  }

  private func handleUnauthorization() {
    ///
    let alert = UIAlertController(title: LocalizedKey.sessionExpired.value,
                                  message: LocalizedKey.lastSessionExpired.value ,
                                  preferredStyle: .alert)
    ///
    alert.addAction(UIAlertAction(title: LocalizedKey.login.value, style: .cancel, handler: { _ in
      Authorization.shared.clearSession()
      appDelegate.setLoginRoot()
    }))
    ///
    appDelegate.window?.rootViewController?.present(alert, animated: true, completion: nil)
  }
  
  private func handleForceUpdate() {
    Alert.showAlertWithMessage(LocalizedKey.msaageNewUpdateAvailable.value, title: LocalizedKey.versionUpdate.value) {
      
      let url = "\(iTunesURLBasePath)" + appStoreId
      
      if let appURL = URL(string: url), UIApplication.shared.canOpenURL(appURL) {
          UIApplication.shared.open(appURL, options: [:], completionHandler: { _ in
              
          })
      }
    }
  }

}
