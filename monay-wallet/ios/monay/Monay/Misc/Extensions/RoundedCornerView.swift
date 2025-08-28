//
//  RoundedCornerView.swift
//  Monay
//
//  Created by Aayushi Bhagat on 14/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

@IBDesignable
class RoundedCornerView: UIView {
    
    override func layoutSubviews() {
        if tag == 999 {
            self.customCornerRadius = 20
            self.topLeft = true
            self.topRight = true
            self.bottomLeft = false
            self.bottomRight = false
        } else if tag == 888 {
            self.customCornerRadius = 20
            self.topLeft = false
            self.topRight = false
            self.bottomLeft = true
            self.bottomRight = true
        } else {
            self.customCornerRadius = 20
            self.topLeft = false
            self.topRight = false
            self.bottomLeft = true
            self.bottomRight = true
        }
    }
}

var cornerRadiusValue: CGFloat = 0
var corners: UIRectCorner = []
extension UIView {
    
    @IBInspectable public var customCornerRadius: CGFloat {
        get {
            return self.customCornerRadius
        }
        set {
            cornerRadiusValue = newValue
        }
    }
    
    @IBInspectable public var topLeft: Bool {
        get {
            return corners.contains(.topLeft)
        }
        set {
            setCorner(newValue: newValue, for: .topLeft)
        }
    }
    
    @IBInspectable public var topRight: Bool {
        get {
            return corners.contains(.topRight)
        }
        set {
            setCorner(newValue: newValue, for: .topRight)
        }
    }
    
    @IBInspectable public var bottomLeft: Bool {
        get {
            return corners.contains(.bottomLeft)
        }
        set {
            setCorner(newValue: newValue, for: .bottomLeft)
        }
    }
    
    @IBInspectable public var bottomRight: Bool {
        get {
            return corners.contains(.bottomRight)
        }
        set {
            setCorner(newValue: newValue, for: .bottomRight)
        }
    }
    
    func setCorner(newValue: Bool, for corner: UIRectCorner) {
        if newValue {
            addRectCorner(corner: corner)
        } else {
            removeRectCorner(corner: corner)
        }
    }
    
    func addRectCorner(corner: UIRectCorner) {
        corners.insert(corner)
        updateCorners()
    }
    
    func removeRectCorner(corner: UIRectCorner) {
        if corners.contains(corner) {
            corners.remove(corner)
            updateCorners()
        }
    }
    
    func updateCorners() {
        let path = UIBezierPath(roundedRect: self.bounds, byRoundingCorners: corners, cornerRadii: CGSize(width: cornerRadiusValue, height: cornerRadiusValue))
        let mask = CAShapeLayer()
        mask.path = path.cgPath
        self.layer.mask = mask
    }
}
