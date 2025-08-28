//
//  Authorization.swift
//
//  Created by WFH on 02/06/20.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation
import JWTDecode
import KeychainAccess
import CocoaLumberjack

enum AuthorizationError: Error {
  case tokenNotExist
}

class Authorization {
  
  var jwt: String!
  var expiration: TimeInterval!
  var userCredentials: UserCredentials!
  var generalSetting: GeneralSettings!
  var totalWalletAmount = "0"
  var referralCode = ""
  var totalSecondaryWalletAmount = "0"

  private var keychain: Keychain!
  
  var isUserLinked: Bool {
    get {
      UserDefaults.standard.bool(forKey: "isUserLinked")
    }
    
    set {
      UserDefaults.standard.set(newValue, forKey: "isUserLinked")
    }
  }
  
  static let shared: Authorization = {
    var instance = Authorization()
    instance.keychain = Keychain(service: Bundle.main.bundleIdentifier!)
    return instance
  }()
  
  func authorize(jwt: String, json: [String: Any], settings: [String: Any]) throws {
    
    do {
      // Decode jwt token
      let decodedJwt = try decode(jwt: jwt)
      
      // Extract token expire time interval
      self.expiration = decodedJwt.claim(name: APIKey.exp).rawValue as? Double ?? 0
      
      // Validate expiration date
      try self.verifyExpirationDate()
      
      self.jwt = jwt
      
      // Store token credentials in keychain
      self.saveToken(jwt, exp: self.expiration)
      
      // Extract user information
      self.userCredentials = UserCredentials(JSON: json)
      // Extract general setting
      self.generalSetting = GeneralSettings(JSON: settings)
      
      // Store user information in keychain
      self.saveUser(self.userCredentials.toJSON())
      
      // Store setting information in keychain
      self.saveSetting(self.generalSetting.toJSON())
    } catch {
      throw error
    }
    
  }
  
  func restoreAuthorization() throws {
    
    self.retrieveToken()
    
    guard self.jwt != nil else {
      throw AuthorizationError.tokenNotExist
    }
    
    do {
      try self.verifyExpirationDate()
      
      self.retrieveUser()
      self.retrieveAppSetting()
    } catch {
      throw error
    }
  }
  
  func synchronize() {
    self.saveUser(self.userCredentials.toJSON())
    self.saveSetting(self.generalSetting.toJSON())
  }
  
}

// MARK: - Keychain access

extension Authorization {
  
  private func saveToken(_ token: String, exp: Double) {
    keychain[string: APIKey.jwt] = token
    keychain[string: APIKey.exp] = String(exp)
  }
  
  func saveUser(_ payload: [String: Any]) {
    
    do {
      let data = try JSONSerialization.data(withJSONObject: payload, options: .prettyPrinted)
      try keychain.set(data, key: APIKey.user)
    } catch {
      DDLogError("Error in saving user information in keychain")
    }
    
  }
  
  private func saveSetting(_ payload: [String: Any]) {
    
    do {
      let data = try JSONSerialization.data(withJSONObject: payload, options: .prettyPrinted)
      try keychain.set(data, key: APIKey.setting)
    } catch {
      DDLogError("Error in saving setting in keychain")
    }
    
  }
  
  private func retrieveToken() {
    self.jwt = keychain[string: APIKey.jwt]
    
    let exp = keychain[string: APIKey.exp] ?? ""
    self.expiration = Double(exp) ?? 0
  }
  
  private func retrieveUser() {
    guard let data = keychain[data: APIKey.user] else {
      DDLogError("User data doesn't exist in keychain")
      return
    }
    
    do {
      if let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? [String: Any] {
        self.userCredentials = UserCredentials(JSON: json)
      }
      
    } catch {
      DDLogError("Error in retrieving user information from keychain")
    }
  }
  
  private func retrieveAppSetting() {
    guard let data = keychain[data: APIKey.setting] else {
      DDLogError("Setting data doesn't exist in keychain")
      return
    }
    
    do {
      if let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? [String: Any] {
        self.generalSetting = GeneralSettings(JSON: json)
      }
      
    } catch {
      DDLogError("Error in retrieving user information from keychain")
    }
  }
  
  func clearSession() {
    do {
      try keychain.remove(APIKey.jwt)
      try keychain.remove(APIKey.exp)
      try keychain.remove(APIKey.user)
      try keychain.remove(APIKey.setting)
    } catch let error {
      print("error: \(error)")
    }
    
    // try? self.keychain.removeAll()
    appDelegate.isLoggedIn = false
    self.generalSetting = nil
    self.userCredentials = nil
    self.jwt = nil
    self.expiration = nil
    isUserLinked = false
    totalWalletAmount = "0"
    // NSSocketManager.shared.disconnect()
  }
}
