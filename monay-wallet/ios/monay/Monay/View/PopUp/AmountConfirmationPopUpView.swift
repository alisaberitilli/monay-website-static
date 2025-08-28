//
//  AmountConfirmationPopUpView.swift
//  Monay
//
//  Created by Ankush on 13/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class AmountConfirmationPopUpView: UIView {

  static var identifire = "AmountConfirmationPopUpView"
  
  @IBOutlet weak var viewBottomConstraint: NSLayoutConstraint!
  @IBOutlet weak var mainView: UIView!

  var callback: ((String) -> Void)?

  static func instance() -> AmountConfirmationPopUpView? {
    let groupMemberListView = UINib(nibName: "AmountConfirmationPopUpView", bundle: nil).instantiate(withOwner: nil, options: nil).first as? AmountConfirmationPopUpView
    return groupMemberListView
  }
  
  static func show(onView view: UIView, completion: ((String) -> Void)?) {
  //  guard let amountView = self.instance() else {
  //    return
  //  }
    let amountView: AmountConfirmationPopUpView = .fromNib()
    amountView.callback = completion
    amountView.mainView.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]
    amountView.mainView.layer.cornerRadius = 10
    view.addSubview(amountView)
    amountView.present(on: view)
  }
  
  @IBAction func topUpOnButton(_ sender: UIButton) {
    self.callback?(APIKey.success)
    self.dismiss()
  }
  
  @IBAction func adjustLimitOnButton(_ sender: UIButton) {
    self.dismiss()
  }
  
  @IBAction func crossButton(_ sender: UIButton) {
    self.dismiss()
  }

  func present(on view: UIView) {
    var rect: CGRect = self.frame
    self.frame = CGRect.zero
    
    UIView.animate(withDuration: 0.3, delay: 0, usingSpringWithDamping: 0.0, initialSpringVelocity: 0.0, options: [], animations: {
      rect.size.width = Screen.width
      rect.size.height = Screen.height
      self.frame = rect
      self.viewBottomConstraint.constant = 0
    }, completion: nil)
  }
  
  func dismiss() {
    
    UIView.animate(withDuration: 0.3, animations: {
      self.alpha = 0
      self.transform = CGAffineTransform(scaleX: 1.3, y: 1.3)
    }, completion: { _ in
      self.removeFromSuperview()
    })
  }

}
// swiftlint:disable all
extension UIView {
    class func fromNib<T: UIView>() -> T {
        return Bundle(for: T.self).loadNibNamed(String(describing: T.self), owner: nil, options: nil)![0] as! T
    }
}
// swiftlint:enable all
