//
//  ShareInviteVC.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class ShareInviteVC: UIViewController {

  // MARK: - IBOutlet properties

  @IBOutlet weak var qrCodeImageView: UIImageView!

  // MARK: - Instance properties
  
  let shareInviteVM = ShareInviteVM()

    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
  override func viewWillAppear(_ animated: Bool) {
      super.viewWillAppear(animated)
      initialSetup()
      callAccountMeAPI()
  }

  private func initialSetup() {
      setupData()
  }

  private func setupData() {
      if let userCredentials = Authorization.shared.userCredentials {
          let qrCode = userCredentials.qrCode.value
          if let qrCodeUrl = URL(string: qrCode) {
              qrCodeImageView.setImage(with: qrCodeUrl)
          }
      }
  }

  @IBAction func shareButton_Action(_ sender: UIButton) {
    let description = "Hey! congratulations \n Your parent has send you link to become his/her secondary user"
    let firebaseDeepLinkObject = FirebaseDeepLinkObject(title: "", contentDescription: description, params: ["referal_code": self.shareInviteVM.accountMe?.referralCode ?? "", "user_name": "\(self.shareInviteVM.accountMe?.firstName ?? "") \(self.shareInviteVM.accountMe?.lastName ?? "")"]) // swiftlint:disable:this line_length
    FirebaseDeepLink.getShortUrl(with: firebaseDeepLinkObject) { (_, url, error) in
      
      guard let shortUrl = url,
            error == nil else {
        return
      }
      
      let shareAll: [Any] = [description, shortUrl]
      let activityViewController = UIActivityViewController(activityItems: shareAll, applicationActivities: nil)
      activityViewController.popoverPresentationController?.sourceView = self.view
      self.present(activityViewController, animated: true, completion: nil)
    }
  }
}

// MARK: - API Call

extension ShareInviteVC {
    private func callAccountMeAPI() {
        
        shareInviteVM.accountMeAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.setupData()
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}
