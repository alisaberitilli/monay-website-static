//
//  UIFont+Extension.swift
//
//

import Foundation
import UIKit

enum Family: String {
  case ceraPro = "CeraPro"
  case hankRnd = "HankRnd"
}

extension UIFont {
  
  enum StyleAttribute: String {
    case regular = "Regular"
    case black = "Black"
    case medium = "Medium"
    case lightItalic = "LightItalic"
    case thin = "Thin"
    case light = "Light"
    case mediumItalic = "MediumItalic"
    case thinItalic = "ThinItalic"
    case italic = "Italic"
    case blackItalic = "BlackItalic"
    case boldItalic = "BoldItalic"
    case bold = "Bold"
  }
  
  enum FontSize {
    case short
    case small
    case medium
    case large
    case mediumLarge
    case extraLarge
    case custom(CGFloat)
    
    func value() -> CGFloat {
      switch self {
      case .short:
        return 10
        
      case .small:
        return 12
        
      case .medium:
        return 14
        
      case .large:
        return 16
        
      case .mediumLarge:
        return 18
        
      case .extraLarge:
        return 34
        
      case .custom(let custom):
        return custom
      }
    }
  }
  
  static func customFont(family: Family = .ceraPro, style: StyleAttribute, size fontSize: FontSize) -> UIFont {
    if let font = UIFont(name: "\(family.rawValue)-\(style.rawValue.capitalized)", size: fontSize.value()) {
      return font
    } else {
      return UIFont.systemFont(ofSize: fontSize.value())
    }
  }
}

extension UIFont {
  
  /**
   Will return the best font conforming to the descriptor which will fit in the provided bounds.
   */
  static func bestFittingFontSize(for text: String,
                                  in bounds: CGRect,
                                  fontDescriptor: UIFontDescriptor,
                                  additionalAttributes: [NSAttributedString.Key: Any]? = nil) -> CGFloat {
    let constrainingDimension = min(bounds.width, bounds.height)
    let properBounds = CGRect(origin: .zero, size: bounds.size)
    var attributes = additionalAttributes ?? [:]
    
    let infiniteBounds = CGSize(width: CGFloat.infinity, height: CGFloat.infinity)
    var bestFontSize: CGFloat = constrainingDimension
    
    for fontSize in stride(from: bestFontSize, through: 0, by: -1) {
      let newFont = UIFont(descriptor: fontDescriptor, size: fontSize)
      attributes[.font] = newFont
      
      let currentFrame = text.boundingRect(with: infiniteBounds,
                                           options: [.usesLineFragmentOrigin, .usesFontLeading],
                                           attributes: attributes,
                                           context: nil)
      
      if properBounds.contains(currentFrame) {
        bestFontSize = fontSize
        break
      }
    }
    return bestFontSize
  }
  
  static func bestFittingFont(for text: String,
                              in bounds: CGRect,
                              fontDescriptor: UIFontDescriptor,
                              additionalAttributes: [NSAttributedString.Key: Any]? = nil) -> UIFont {
    let bestSize = bestFittingFontSize(for: text,
                                       in: bounds,
                                       fontDescriptor: fontDescriptor,
                                       additionalAttributes: additionalAttributes)
    return UIFont(descriptor: fontDescriptor, size: bestSize)
  }
}
