//
//  HudView.swift
//  EasyFit
//
//  Created by WFH on 30/06/17.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class HudView: UIView {
  static let identifier = "HudView"
  static var hudView: HudView?
  
  @IBOutlet weak  var viewContainer: UIView!
  
  var imgViewGif: UIImageView?
  
  static func show() {
    
    remove()
    hudView = UINib(nibName: HudView.identifier, bundle: nil).instantiate(withOwner: nil, options: nil)[0] as? HudView
    UIApplication.shared.keyWindow?.addSubview(hudView!)
    hudView!.frame = UIScreen.main.bounds
    
    hudView!.imgViewGif = UIImageView(frame: hudView!.viewContainer.bounds)
    hudView!.imgViewGif!.image = UIImage.gif(name: LocalizedKey.gifName.value)
    hudView!.imgViewGif!.contentMode = .scaleAspectFit
    hudView!.viewContainer.addSubview(hudView!.imgViewGif!)
    
    transformHud()
  }
  
  static func transformHud() {
    
    hudView?.viewContainer.transform = CGAffineTransform(scaleX: 0, y: 0)
    
    UIView.animate(withDuration: 1,
                   delay: 0,
                   usingSpringWithDamping: 0.5,
                   initialSpringVelocity: 0.5,
                   options: [.curveEaseOut], animations: {
                    
                    hudView?.viewContainer.transform = CGAffineTransform(scaleX: 1, y: 1)
                    hudView?.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.3)
                    
    }, completion: nil)
  }
  
  ///Remove with animation
  static func kill() {
    
    if hudView != nil {
        UIView.animate(withDuration: 0.2, animations: {
        hudView!.viewContainer.transform = CGAffineTransform(scaleX: 0.1, y: 0.1)
        hudView!.backgroundColor = .clear
      }, completion: {(_) in
        self.remove()
      })
    }
  }
  
  static func remove() {
    hudView?.removeFromSuperview()
    hudView = nil
  }
  
  deinit {
    self.imgViewGif?.image = nil
  }
}
