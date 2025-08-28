//
//  Validators.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import UIKit

struct Validator {
  
  static func emptyString(_ string: String?) -> Bool {
    if string == nil || string!.isKind(of: NSNull.self) || string == "null" || string == "<null>" || string == "(null)" {
      return true
    }
    
    return string!.trimmingCharacters(in: CharacterSet.whitespaces).isEmpty
  }
  
  static func validEmail(_ email: String?) -> Bool {
    if self.emptyString(email) {
      return false
    }
    
    let emailRegEx = "[A-Z0-9a-z._%+]+@[A-Za-z0-9.]+\\.[A-Za-z]{2,4}"
    let emailValidator = NSPredicate(format: "SELF MATCHES %@", emailRegEx)
    return emailValidator.evaluate(with: email)
  }
  
  static func validPassword(_ pass: String?) -> Bool {
    guard let stringPass = pass, !emptyString(stringPass) else { return false }
    
//    let size: (min: Int, max: Int) = (6, 15)
//
//    return (size.min...size.max).contains(stringPass.count)
    
//    let passwordTest = NSPredicate(format: "SELF MATCHES %@", "(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])(?=.*[$@$#!%*?&]).{6,15}")
      let passwordTest = NSPredicate(format: "SELF MATCHES %@", "(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])(?=.*[!\"#$%&'()*+,-./:;<=>?@\\[\\\\\\]^_`{|}~]).{6,15}")
    
    return passwordTest.evaluate(with: pass)
  }
  
  static func filter(string: String?) -> String {
    if string == nil || string!.isKind(of: NSNull.self) || string == "null" || string == "<null>" || string == "(null)" {
      return ""
    }
    
    return string!.trimmingCharacters(in: CharacterSet.whitespaces)
  }
    
    static func isValidPhoneNumber(_ phoneNumber: String?) -> Bool {
        guard let stringPhoneNumber = phoneNumber, !emptyString(stringPhoneNumber) else { return false }
        
        let size: (min: Int, max: Int) = (6, 15)
        
        return (size.min...size.max).contains(stringPhoneNumber.count)
    }

  static func isContainsOnlyNumbers(string: String) -> Bool {
      return string.rangeOfCharacter(from: CharacterSet.decimalDigits.inverted) == nil
  }

}

extension String {
  
  func attributedLabel() -> (NSAttributedString, [String: Any], NSRange, NSRange) { // swiftlint:disable:this large_tuple
    
    let strTC = "Terms & Conditions"
    let strPP = "Privacy Policy."
    
    let string = "Agree with our \(strTC) and \(strPP)"
    
    let nsString = string as NSString
    
    let paragraphStyle = NSMutableParagraphStyle()
    paragraphStyle.lineHeightMultiple = 1.2
    
    let fullAttributedString = NSAttributedString(string: string, attributes: [
      NSAttributedString.Key.paragraphStyle: paragraphStyle,
      NSAttributedString.Key.foregroundColor: #colorLiteral(red: 0, green: 0, blue: 0, alpha: 1),
      NSAttributedString.Key.font: UIFont.customFont(style: .regular, size: .custom(14.0))
    ])
    
    let rangeTC = nsString.range(of: strTC)
    let rangePP = nsString.range(of: strPP)
    
    let linkAttributes: [String: Any] = [
      NSAttributedString.Key.foregroundColor.rawValue: Color.blue.cgColor,
      NSAttributedString.Key.underlineStyle.rawValue: false
    ]
    
    return (fullAttributedString, linkAttributes, rangeTC, rangePP)
  }
  
    func attributedString(_ title: String, titleColor: UIColor, subTitle: String, subTitleColor: UIColor, titleFontSize: CGFloat, subtitleFontSize: CGFloat, titleStyle: UIFont.StyleAttribute, subtitleStyle: UIFont.StyleAttribute, fontFamily: Family, textAlignment: NSTextAlignment, spacing: CGFloat = 0) -> NSMutableAttributedString {
    let paragraphStyle = NSMutableParagraphStyle()
    
    paragraphStyle.lineSpacing = spacing
    paragraphStyle.alignment = textAlignment
    
    let titleAttributes: [NSAttributedString.Key: Any] = [.foregroundColor: titleColor, .font: UIFont.customFont(family: fontFamily, style: titleStyle, size: .custom(titleFontSize)),
                                                          .paragraphStyle: paragraphStyle]
    let subtitleAttributes: [NSAttributedString.Key: Any] = [.foregroundColor: subTitleColor, .font: UIFont.customFont(family: fontFamily, style: subtitleStyle, size: .custom(subtitleFontSize)), .paragraphStyle: paragraphStyle] 
    
    let partOne = NSMutableAttributedString(string: title, attributes: titleAttributes)
    let partTwo = NSMutableAttributedString(string: subTitle, attributes: subtitleAttributes)
    
    partOne.append(partTwo)
    
    return partOne
  }

}
