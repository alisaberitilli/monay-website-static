//
//  Custom+UIView.swift
//
//

import Foundation
import QuartzCore
import UIKit

extension UIView {
  @IBInspectable var cornerRadius: CGFloat {
    get {
      return layer.cornerRadius
    }
    set {
      layer.cornerRadius = newValue
      layer.masksToBounds = newValue > 0
    }
  }
  
  @IBInspectable var borderWidth: CGFloat {
    get {
      return layer.borderWidth
    }
    set {
      layer.borderWidth = newValue
    }
  }
  
  @IBInspectable var borderColor: UIColor? {
    get {
      return UIColor(cgColor: layer.borderColor!)
    }
    set {
      layer.borderColor = newValue?.cgColor ?? UIColor.white.cgColor
    }
  }
  
  @IBInspectable var shadowColor: UIColor? {
    get {
      if let color = layer.shadowColor {
        return UIColor(cgColor: color)
      } else {
        return nil
      }
    }
    set {
      layer.shadowColor = newValue!.cgColor
    }
    
  }
  
  /* The opacity of the shadow. Defaults to 0. Specifying a value outside the
   * [0,1] range will give undefined results. Animatable. */
  @IBInspectable var shadowOpacity: Float {
    get {
      return layer.shadowOpacity
    }
    set {
      layer.shadowOpacity = newValue
    }
  }
  
  /* The shadow offset. Defaults to (0, -3). Animatable. */
  @IBInspectable var shadowOffset: CGPoint {
    get {
      return CGPoint(x: layer.shadowOffset.width, y: layer.shadowOffset.height)
    }
    set {
      layer.shadowOffset = CGSize(width: newValue.x, height: newValue.y)
    }
  }
  
  /* The blur radius used to create the shadow. Defaults to 3. Animatable. */
  @IBInspectable var shadowRadius: CGFloat {
    get {
      return layer.shadowRadius
    }
    set {
      layer.shadowRadius = newValue
    }
  }
  
  func rotate(_ toValue: CGFloat, duration: CFTimeInterval = 0.2) {
    let animation = CABasicAnimation(keyPath: "transform.rotation")
    animation.toValue = toValue
    animation.duration = duration
    animation.isRemovedOnCompletion = false
    animation.fillMode = CAMediaTimingFillMode.forwards
    self.layer.add(animation, forKey: nil)
  }
  
  func applyShadow(color: UIColor = .black, cornerRadius: CGFloat = 0, opacity: Float = 0.5, offSet: CGSize = CGSize(width: 0, height: 0), radius: CGFloat = 1, shadowRect: CGRect? = nil) {
    layer.masksToBounds = false
    layer.cornerRadius  = cornerRadius
    layer.shadowColor   = color.cgColor
    layer.shadowOpacity = opacity
    layer.shadowOffset  = offSet
    layer.shadowRadius  = radius
    
    if let shadowRect = shadowRect {
      layer.shadowPath = UIBezierPath(rect: shadowRect).cgPath
    }
  }
}

extension UIView {
  func constraint(withIdentifier: String) -> NSLayoutConstraint? {
    return self.constraints.filter { $0.identifier == withIdentifier }.first
  }
}

extension UIView {
  func showPlaceholderLabelWith(message: String, verticalPadding: CGFloat = 0.0) {
    DispatchQueue.main.async {
      let lblMessage = UILabel()
      lblMessage.tag = 1001
      lblMessage.text = message
      lblMessage.textAlignment = .center
      lblMessage.font = UIFont.customFont(style: .medium, size: .custom(18))
      lblMessage.numberOfLines = 5
      let textHeightForSingleLine = lblMessage.intrinsicContentSize.height
      let padding: CGFloat = 10
      var labelHeight = (textHeightForSingleLine + padding * 2) * CGFloat(lblMessage.numberOfLines)
      if labelHeight > self.bounds.size.height {
        labelHeight = self.bounds.size.height - (padding * 2)
      }
      lblMessage.frame.size = CGSize(width: self.bounds.width - 40, height: labelHeight)
      let centerX = self.bounds.width / 2
      let centerY = self.bounds.height / 2 + verticalPadding
      lblMessage.center = CGPoint(x: centerX, y: centerY)
      self.addSubview(lblMessage)
    }
  }
  
  func removePlaceholderLabel() {
    DispatchQueue.main.async {
      self.subviews.forEach { (view) in
        if view.tag == 1001, view.isKind(of: UILabel.self) {
          view.removeFromSuperview()
        }
      }
    }
  }
  
  func addDashedBorder() {
    
    self.layer.sublayers?.filter({$0.name == "dashedLayer"}).first?.removeFromSuperlayer()
    let color = UIColor(red: 234/255, green: 234/255, blue: 234/255, alpha: 1.0).cgColor
    
    let shapeLayer: CAShapeLayer = CAShapeLayer()
    let shapeRect = CGRect(x: 0, y: 0, width: Screen.width - 40, height: 150)
    
    shapeLayer.bounds = shapeRect
    shapeLayer.cornerRadius = self.cornerRadius
    shapeLayer.position = CGPoint(x: (Screen.width - 40)/2, y: 150/2)
    shapeLayer.fillColor = UIColor.clear.cgColor
    shapeLayer.strokeColor = color
    shapeLayer.lineWidth = 2
    shapeLayer.lineJoin = CAShapeLayerLineJoin.round
    shapeLayer.lineDashPattern = [6, 3]
    shapeLayer.path = UIBezierPath(roundedRect: shapeRect, cornerRadius: 5).cgPath
    self.cornerRadius = 5
    shapeLayer.name = "dashedLayer"
    self.layer.addSublayer(shapeLayer)
  }
    
    func addDashedBorder2() {
          let color = UIColor(red: 234/255, green: 234/255, blue: 234/255, alpha: 1.0).cgColor
          
          let shapeLayer: CAShapeLayer = CAShapeLayer()
          let frameSize = self.frame.size
          let shapeRect = CGRect(x: 0, y: 0, width: Screen.width - 40, height: frameSize.height)
          
          shapeLayer.bounds = shapeRect
          shapeLayer.position = CGPoint(x: (Screen.width - 40)/2, y: frameSize.height/2)
          shapeLayer.fillColor = UIColor.clear.cgColor
          shapeLayer.strokeColor = color
          shapeLayer.lineWidth = 2
          shapeLayer.lineJoin = CAShapeLayerLineJoin.round
          shapeLayer.lineDashPattern = [6, 3]
          shapeLayer.path = UIBezierPath(roundedRect: shapeRect, cornerRadius: 4).cgPath
          
          self.layer.addSublayer(shapeLayer)
      }
  
}

extension UIView {
  func screenshot() -> UIImage? {
    
    if self is UIScrollView {
      guard let scrollView = self as? UIScrollView else {
        return nil
      }
      
      let savedContentOffset = scrollView.contentOffset
      let savedFrame = scrollView.frame
      
      UIGraphicsBeginImageContext(scrollView.contentSize)
      scrollView.contentOffset = .zero
      self.frame = CGRect(x: 0, y: 0, width: scrollView.contentSize.width, height: scrollView.contentSize.height)
      self.layer.render(in: UIGraphicsGetCurrentContext()!)
      
      guard let image = UIGraphicsGetImageFromCurrentImageContext() else {
        return nil
      }
      
      UIGraphicsEndImageContext()
      scrollView.contentOffset = savedContentOffset
      scrollView.frame = savedFrame
      
      return image
    }
    
    UIGraphicsBeginImageContext(self.bounds.size)
    self.layer.render(in: UIGraphicsGetCurrentContext()!)
    
    guard let image = UIGraphicsGetImageFromCurrentImageContext() else {
      return nil
    }
    
    UIGraphicsEndImageContext()
    return image
  }
}
