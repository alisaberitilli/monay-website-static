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
    case staging
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
    Identifier(rawValue: value(forInfoDictionaryKey: .configurationIdentifier))!
  }()
  
  static let apiURL: String = {
    value(forInfoDictionaryKey: .apiURL)
  }()
}

extension Configuration.Key {
  
  static let configurationIdentifier = Configuration.Key(rawValue: "CONFIGURATION_IDENTIFIER")
  static let apiURL = Configuration.Key(rawValue: "API_URL")
}
