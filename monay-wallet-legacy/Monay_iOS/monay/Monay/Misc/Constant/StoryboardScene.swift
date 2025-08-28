//
//  StoryboardScene.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

import UIKit

class StoryboardScene {
  
    static let More: UIStoryboard = {
        return UIStoryboard(name: "More", bundle: nil)
    }()
    
    static let Account: UIStoryboard = {
        return UIStoryboard(name: "Account", bundle: nil)
    }()
    
    static let Main: UIStoryboard = {
        return UIStoryboard(name: "Main", bundle: nil)
    }()
    
    static let Transaction: UIStoryboard = {
        return UIStoryboard(name: "Transaction", bundle: nil)
    }()
    
    static let Profile: UIStoryboard = {
        return UIStoryboard(name: "Profile", bundle: nil)
    }()
    
    static let Scan: UIStoryboard = {
        return UIStoryboard(name: "Scan", bundle: nil)
    }()
}

extension UIStoryboard {
  
  func controllerExists(withIdentifier: String) -> Bool {
    if let availableIdentifiers = self.value(forKey: "identifierToNibNameMap") as? [String: Any] {
      return availableIdentifiers[withIdentifier] != nil
    }
    
    return false
  }
  
  func instantiateViewController<VC: UIViewController>(withClass: VC.Type) -> VC {
    // swiftlint:disable force_cast
    let identifier = NSStringFromClass(withClass as AnyClass).components(separatedBy: ".")[1]
    guard controllerExists(withIdentifier: identifier) else {
      fatalError("Failed to instantiate viewController")
    }
    
    return instantiateViewController(withIdentifier: identifier) as! VC
    // swiftlint:enable force_cast
  }
  
}
