//
//  Utility.swift
//  Monay
//
//  Created by WFH on 09/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper
import UIKit

// Value Transformers

let intToStringTransform = TransformOf<String, Int>(fromJSON: { (value: Int?) -> String? in
    guard let val = value else { return nil }
    return "\(val)"
}, toJSON: { (value: String?) -> Int? in
    if let value = value { return Int(value) }
    return nil
})

let doubleToStringTransform = TransformOf<String, Double>(fromJSON: { (value: Double?) -> String? in
    guard let val = value else { return nil }
    return "\(val)"
}, toJSON: { (value: String?) -> Double? in
    if let value = value { return Double(value) }
    return nil
})

let stringToBoolTransform = TransformOf<Bool, String>(fromJSON: { (value: String?) -> Bool? in
    guard let val = value else { return nil }
    return val.bool
}, toJSON: { (value: Bool?) -> String? in
    if let value = value { return "\(value)" }
    return nil
})

let stringToIntTransform = TransformOf<Int, String>(fromJSON: { (value: String?) -> Int? in
    if let value = value {
        return Int(value)
    }
    return 0
}, toJSON: { (value: Int?) -> String? in
    if let value = value {
        return String(value)
    }
    return "0"
})

func getCurrentYear() -> Int {
    let date = Date()
    let format = DateFormatter()
  format.dateFormat = DateFormate.yyyyMMddhhmmsss.rawValue
  _ = format.string(from: date)
    
    let calendar = Calendar.current
    return calendar.component(.year, from: date)
}

func getCurrentMonth() -> Int {
    let date = Date()
    let format = DateFormatter()
  format.dateFormat = DateFormate.yyyyMMddhhmmsss.rawValue
    
    let calendar = Calendar.current
    return calendar.component(.month, from: date)
}

struct Alert {
    var title: String?
    var message: String?
    var handler:(() -> Void)? = nil // swiftlint:disable:this redundant_optional_initialization
    
    init(title: String? = kProductName, message: String?) {
        self.title = title
        self.message = message
    }
    
    init(title: String? = kProductName, message: String?, handler:(() -> Void)? = nil) {
        self.title = title
        self.message = message
        self.handler = handler
    }
    
    static func network() -> Alert {
        return self.init(title: kProductName,
                         message: LocalizedKey.checkInternetConnetion.value)
    }
    
    static func showNetWorkAlert(handler:(() -> Void)? = nil) {
      showAlertWithMessage(LocalizedKey.checkInternetConnetion.value,
                             title: kProductName,
                             handler: handler)
    }
    
    static func showAlertWithMessage(_ message: String, title: String?, handler:(() -> Void)? = nil) {
        // If any Alert view is alrady presented then do not show another alert
        var viewController: UIViewController!
        if let vc  = UIApplication.topViewController() {
            if (vc.isKind(of: UIAlertController.self)) { // swiftlint:disable:this control_statement
                return
            } else {
                viewController = vc
            }
        } else {
            viewController = appDelegate.window?.rootViewController!
        }
        
        let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
      alert.addAction(UIAlertAction(title: NSLocalizedString(LocalizedKey.ok.value, comment: ""), style: UIAlertAction.Style.default, handler: { (_) in
            handler?()
        }))
        viewController!.present(alert, animated: true, completion: nil)
    }
    
    static func showAlertWithMessageCallback(title: String?, message: String?, actionArray: [String], style: UIAlertController.Style, handler: ((UIAlertAction) -> Void)? = nil) {
        
        // If any Alert view is alrady presented then do not show another alert
        var viewController: UIViewController!
        if let vc  = UIApplication.topViewController() { 
            if (vc.isKind(of: UIAlertController.self)) { // swiftlint:disable:this control_statement
                return
            } else {
                viewController = vc
            }
        } else {
            viewController = appDelegate.window?.rootViewController!
        }
        
        let alertController = UIAlertController(title: title, message: message, preferredStyle: style)
        
        for i in actionArray { // swiftlint:disable:this identifier_name
            
            alertController.addAction(UIAlertAction(title: i, style: i == "Cancel" ? .cancel : (i == "Yes" ? .destructive : .default), handler: { (action) in
                handler?(action)
            }))
            
        }
        
        viewController!.present(alertController, animated: true, completion: nil)
    }
    
}

func isExistingLoginUser(paymentType: PaymentType, searchOrSelectedUser: String) -> (Bool, String) {
    let loginUserPhoneNumber = Authorization.shared.userCredentials.phoneNumber.value
    if loginUserPhoneNumber == searchOrSelectedUser {
        
      let requestMoneyAlert = LocalizedKey.messageCanNotRequestMoneyYourself.value
      let sendMoneyAlert = LocalizedKey.messageCanNotSendMoneyYourself.value
        
        let alertMessage = paymentType == .request ? requestMoneyAlert : sendMoneyAlert
        return (true, alertMessage)
    }
    
    return (false, "")
}

func isExistingLoginUserByID(paymentType: PaymentType, userId: String) -> (Bool, String) {
    let loginUserId = Authorization.shared.userCredentials.id ?? ""
    if loginUserId == userId {
        
        let requestMoneyAlert = LocalizedKey.messageCanNotRequestMoneyYourself.value
        let sendMoneyAlert = LocalizedKey.messageCanNotSendMoneyYourself.value
        
        let alertMessage = paymentType == .request ? requestMoneyAlert : sendMoneyAlert
        return (true, alertMessage)
    }
    
    return (false, "")
}
