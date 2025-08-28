//
//  UIButton+Extension.swift
//  Monay
//
//  Created by Aayushi on 03/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import UIKit

extension UIButton {
  ///
  func pulsate() {
    let scaleTransform = CGAffineTransform(scaleX: 0.8, y: 0.8)
    transform = scaleTransform
    UIView.animate(withDuration: 0.4, delay: 0, usingSpringWithDamping: 0.6, initialSpringVelocity: 0.6, options: .curveEaseInOut, animations: {
      self.transform = .identity
    })
  }
}
