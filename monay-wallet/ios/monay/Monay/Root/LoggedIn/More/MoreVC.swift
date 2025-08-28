//
//  MoreVC.swift
//  Monay
//
//  Created by Aayushi on 14/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class MoreVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var withdrawMoneyView: UIView!
    @IBOutlet weak var withdrawalRequestHistoryView: UIView!
    @IBOutlet weak var autoTopupView: UIView!
    @IBOutlet weak var myCadsView: UIView!
    @IBOutlet weak var secondaryAccountView: UIView!
    @IBOutlet weak var KYCView: UIView!
    @IBOutlet weak var shareInviteView: UIView!
    @IBOutlet weak var myBankAccountsView: UIView!
    @IBOutlet weak var primaryAccountView: UIView!

    // MARK: - Instance properties
    
    let moreVM = MoreVM()
    
    override func viewDidLoad() {
        super.viewDidLoad()
      initialSetup()
    }
    
    private func initialSetup() {
      let userType = Authorization.shared.userCredentials.userType
      switch userType {
      case .secondaryUser:
        [withdrawMoneyView, withdrawalRequestHistoryView, autoTopupView, myCadsView, secondaryAccountView, KYCView, shareInviteView, myBankAccountsView].forEach({ $0?.isHidden = true })
        
      case .merchant:
        [autoTopupView, secondaryAccountView, shareInviteView, primaryAccountView].forEach({ $0?.isHidden = true })

      case .user:
        [primaryAccountView].forEach({ $0?.isHidden = true })

      default:
        break
      }
    }
    
    // MARK: - Private helper methods
    
    private func signOutConfirmation(handler: @escaping () -> Void) {
      let alertController = UIAlertController(title: LocalizedKey.logout.value, message: LocalizedKey.messageSureLogout.value, preferredStyle: .alert)
        
        alertController.addAction(UIAlertAction(title: LocalizedKey.logout.value, style: .destructive) { _ in
            handler()
        })
        
        alertController.addAction(UIAlertAction(title: LocalizedKey.cancel.value, style: .cancel))
        self.present(alertController, animated: true)
    }
    
    private func signout() {
        moreVM.signout { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                UIApplication.shared.applicationIconBadgeNumber = 0
                // disable touch id or face id
                userDefualt.set(false, forKey: AppKey.User.isBiometricEnable.rawValue)
                
                Authorization.shared.clearSession()
                appDelegate.logout()
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func detailButton_Action(_ sender: UIButton) {
      
        self.hideCircleView()
        
        switch sender.tag {
        case MoreType.myWallet.rawValue:
            let viewController = StoryboardScene.Profile.instantiateViewController(withClass: MyWalletVC.self)
            pushVC(viewController)
            
        case MoreType.paymentRequest.rawValue:
            let viewController = StoryboardScene.Profile.instantiateViewController(withClass: PaymentRequestVC.self)
            let userType = Authorization.shared.userCredentials.userType
            UserDefaults.standard.set(userType == .secondaryUser ? LocalizedKey.received.value : LocalizedKey.myRequest.value, forKey: LocalizedKey.paymentRequestType.value)
            pushVC(viewController)
            
        case MoreType.withdrawMoney.rawValue:
            let viewController = StoryboardScene.More.instantiateViewController(withClass: RequestWithdrawalVC.self)
            self.pushVC(viewController)
            
        case MoreType.withdrawalRequest.rawValue:
            let viewController = StoryboardScene.Profile.instantiateViewController(withClass: WithdrawalRequestHistoryVC.self)
            pushVC(viewController)
            
        case MoreType.autoTopup.rawValue:
          let viewController = StoryboardScene.More.instantiateViewController(withClass: AutoTopupVC.self)
          pushVC(viewController)

        case MoreType.myCards.rawValue:
            let viewController = StoryboardScene.Profile.instantiateViewController(withClass: MyCardVC.self)
            pushVC(viewController)
            
        case MoreType.secondaryAccount.rawValue:
          let viewController = StoryboardScene.More.instantiateViewController(withClass: SecondaryAccountVC.self)
          pushVC(viewController)

        case MoreType.primaryAccount.rawValue:
          let viewController = StoryboardScene.More.instantiateViewController(withClass: PrimaryAccountVC.self)
          pushVC(viewController)

        case MoreType.bankAccount.rawValue:
            let viewController = StoryboardScene.Profile.instantiateViewController(withClass: MyBankAccounsVC.self)
            pushVC(viewController)
            
        case MoreType.shareInvite.rawValue:
          let viewController = StoryboardScene.More.instantiateViewController(withClass: ShareInviteVC.self)
          pushVC(viewController)

        case MoreType.settingSupport.rawValue:
            let viewController = StoryboardScene.More.instantiateViewController(withClass: SettingVC.self)
            self.pushVC(viewController)
            
        case MoreType.kyc.rawValue:
          if Authorization.shared.userCredentials.countryCode.value == "+91" {
            let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCDocumentUploadVC.self)
            self.pushVC(viewController)
          } else {
            let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCUSADocumentUploadVC.self)
            self.pushVC(viewController)
          }
            
        default:
            break
        }
    }
    
    @IBAction func logoutButton_Action(_ sender: UIButton) {
        signOutConfirmation(handler: {
            self.signout()
        })
    }
}
