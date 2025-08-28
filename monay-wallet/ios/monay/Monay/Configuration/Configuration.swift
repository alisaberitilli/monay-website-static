//
//  Configuration.swift
//  Monay
//
//  Created by Manish Rathore on 03/09/21.
//  Copyright © 2021 Codiant. All rights reserved.
//

import Foundation

enum Configuration {
  struct Key: RawRepresentable {
    var rawValue: String
  }
  
  enum Identifier: String {
    case development
    case staging
    case production
  }
  
  /// Returns value for the passed info dictionary key
  /// - Parameter key: Key whose value to be fetched from info.plist
  private static func value<T>(forInfoDictionaryKey key: Key) -> T {
    
    guard let object = Bundle.main.object(forInfoDictionaryKey: key.rawValue) else {
      fatalError("\(key.rawValue) Key not set in info.plist for this Xcode configuration")
    }
    
    guard let value = object as? T else {
      fatalError("Unable to cast value of \(key.rawValue) from info.plist to \(T.self).")
    }
    
    return value
  }
}

extension Configuration {
  
  static let identifier: Identifier = {
    #if DEBUG
    // For local development, use development identifier
    return .development
    #else
    return Identifier(rawValue: value(forInfoDictionaryKey: .configurationIdentifier)) ?? .production
    #endif
  }()
  
  static let apiURL: String = {
    #if DEBUG
    // Use local PostgreSQL backend for development
    return "http://localhost:3001/api/v1"
    #else
    return value(forInfoDictionaryKey: .apiURL)
    #endif
  }()
  
  // Database Configuration (for reference only - actual connection is via API)
  static let databaseConfig: [String: Any] = {
    switch identifier {
    case .development:
      return [
        "host": "localhost",
        "port": 5432,
        "database": "monay_wallet",
        "username": "alisaberi",
        "ssl": false,
        "apiEndpoint": "http://localhost:3001"
      ]
    case .staging:
      return [
        "apiEndpoint": "https://staging-api.monay.com"
      ]
    case .production:
      return [
        "apiEndpoint": "https://api.monay.com"
      ]
    }
  }()
  
  // WebSocket URL for real-time updates
  static let websocketURL: String = {
    switch identifier {
    case .development:
      return "ws://localhost:3001"
    case .staging:
      return "wss://staging-api.monay.com"
    case .production:
      return "wss://api.monay.com"
    }
  }()
}

extension Configuration.Key {
  
  static let configurationIdentifier = Configuration.Key(rawValue: "CONFIGURATION_IDENTIFIER")
  static let apiURL = Configuration.Key(rawValue: "API_URL")
}
