//
//  PaymentRequestVC.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentRequestVC: UIViewController {
  
  // MARK: - IBOutlet properties
  
  @IBOutlet weak var myRequestButton: UIButton!
  @IBOutlet weak var btnReceived: UIButton!
  @IBOutlet weak var buttonPaid: UIButton!
  @IBOutlet weak var btnDecline: UIButton!
  @IBOutlet weak var containerView: UIView!
  @IBOutlet weak var cnstraintHighlightedLineLead: NSLayoutConstraint!

  // MARK: - View controller lifecycle methods
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
  }
  
  // MARK: - Private helper methods
  
  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    updateLayout()
  }

  private func updateLayout() {
    myRequestButton.isHidden = Authorization.shared.userCredentials.userType == .secondaryUser
    let paymentRequestType = (UserDefaults.standard.value(forKey: LocalizedKey.paymentRequestType.value) as? String) ?? LocalizedKey.myRequest.value
    
    if paymentRequestType == LocalizedKey.myRequest.value {
      changeSegmentButtonAction(myRequestButton)
    } else if paymentRequestType == LocalizedKey.received.value {
      changeSegmentButtonAction(btnReceived)
    } else if paymentRequestType == LocalizedKey.paid.value {
      changeSegmentButtonAction(buttonPaid)
    } else if paymentRequestType == LocalizedKey.decline.value {
      changeSegmentButtonAction(btnDecline)
    }
  }
  
  func changeChild(index: Int) {
    let paymentMyRequestVC = StoryboardScene.Profile.instantiateViewController(withClass: PaymentMyRequestVC.self)
    let paymentReceivedVC = StoryboardScene.Profile.instantiateViewController(withClass: PaymentReceivedVC.self)
    let paymentPaidVC = StoryboardScene.Profile.instantiateViewController(withClass: PaymentPaidVC.self)
    let paymentDeclineVC = StoryboardScene.Profile.instantiateViewController(withClass: PaymentDeclineVC.self)
    
    let arrchildVC = [paymentMyRequestVC, paymentReceivedVC, paymentPaidVC, paymentDeclineVC]
    
    if self.children.count > 0 {
      let viewControllers: [UIViewController] = self.children
      for viewContoller in viewControllers {
        viewContoller.willMove(toParent: nil)
        viewContoller.view.removeFromSuperview()
        viewContoller.removeFromParent()
      }
    }
    
    addChild(arrchildVC[index])
    view.addSubview(arrchildVC[index].view)
    setAutoLayoutConstraint(vcView: arrchildVC[index].view, containerView: self.containerView)
    arrchildVC[index].didMove(toParent: self)
  }
  
  private func setAutoLayoutConstraint(vcView: UIView, containerView: UIView) {
    vcView.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint(item: vcView, attribute: .top, relatedBy: .equal, toItem: containerView, attribute: .top, multiplier: 1, constant: 0).isActive = true
    NSLayoutConstraint(item: vcView, attribute: .leading, relatedBy: .equal, toItem: containerView, attribute: .leading, multiplier: 1, constant: 0).isActive = true
    NSLayoutConstraint(item: vcView, attribute: .trailing, relatedBy: .equal, toItem: containerView, attribute: .trailing, multiplier: 1, constant: 0).isActive = true
    NSLayoutConstraint(item: vcView, attribute: .bottom, relatedBy: .equal, toItem: containerView, attribute: .bottom, multiplier: 1, constant: 0).isActive = true
  }
  
  func updateUIOnCompletion(index: Int) {
    
    switch index {
    case 0:
      myRequestButton.isSelected = true
      btnReceived.isSelected = false
      buttonPaid.isSelected = false
      btnDecline.isSelected = false
      cnstraintHighlightedLineLead.constant = 0
      UserDefaults.standard.set(LocalizedKey.myRequest.value, forKey: LocalizedKey.paymentRequestType.value)
    case 1:
      myRequestButton.isSelected = false
      btnReceived.isSelected = true
      buttonPaid.isSelected = false
      btnDecline.isSelected = false
      cnstraintHighlightedLineLead.constant = Authorization.shared.userCredentials.userType == .secondaryUser ? btnReceived.frame.size.width + 1 : myRequestButton.frame.size.width + 1
      UserDefaults.standard.set(LocalizedKey.received.value, forKey: LocalizedKey.paymentRequestType.value)
    case 2:
      myRequestButton.isSelected = false
      btnReceived.isSelected = false
      buttonPaid.isSelected = true
      btnDecline.isSelected = false
      cnstraintHighlightedLineLead.constant = Authorization.shared.userCredentials.userType == .secondaryUser ?
      btnReceived.frame.size.width * 2 + 1 :
      myRequestButton.frame.size.width * 2 + 1
      UserDefaults.standard.set(LocalizedKey.paid.value, forKey: LocalizedKey.paymentRequestType.value)
    case 3:
      myRequestButton.isSelected = false
      btnReceived.isSelected = false
      buttonPaid.isSelected = false
      btnDecline.isSelected = true
      cnstraintHighlightedLineLead.constant = Authorization.shared.userCredentials.userType == .secondaryUser ?
      btnReceived.frame.size.width * 3 + 1 :
      myRequestButton.frame.size.width * 3 + 1
      UserDefaults.standard.set(LocalizedKey.decline.value, forKey: LocalizedKey.paymentRequestType.value)
    default:
      break
    }
  }
  
  // MARK: - IBAction
  
  @IBAction func changeSegmentButtonAction(_ sender: UIButton) {
    changeChild(index: sender.tag)
    updateUIOnCompletion(index: sender.tag)
  }
}
