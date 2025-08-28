//
//  ProfileVC.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ProfileVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var profileImageView: UIImageView!
    @IBOutlet weak var qrCodeImageView: UIImageView!
    @IBOutlet weak var kycStatusImageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var emailLabel: UILabel!
    @IBOutlet weak var mobileLabel: UILabel!
    @IBOutlet weak var cribNumberLabel: UILabel!
    @IBOutlet weak var companyNameLabel: UILabel!
    @IBOutlet weak var registrationNoLabel: UILabel!
    @IBOutlet weak var kycStatusLabel: UILabel!
    @IBOutlet weak var merchantViewHeightConstraint: NSLayoutConstraint! // 220
    @IBOutlet weak var merchantView: UIView!
    @IBOutlet weak var qrcodeView: UIView!
    @IBOutlet weak var emailVerifyImageView: UIImageView!
    @IBOutlet weak var customerIdLabel: UILabel!
    @IBOutlet weak var qrCodeViewHeightConstraint: NSLayoutConstraint! // 387

    // MARK: - Instance properties
    
    let profileVM = ProfileVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
      super.viewDidLoad()
    }
  
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        initialSetup()
        callAccountMeAPI()
    }
    
    private func initialSetup() {
        setupUI()
        setupData()
    }
    
    private func setupUI() {
        let userType = Authorization.shared.userCredentials.userType ?? .user
        merchantViewHeightConstraint.constant = (userType == .user || userType == .secondaryUser) ? 0 : 220
        qrCodeViewHeightConstraint.constant = userType == .secondaryUser ? 0 : 387
        merchantView.isHidden = userType == .user || userType == .secondaryUser
        qrcodeView.isHidden = userType == .secondaryUser
    }

    private func setupData() {
        if let userCredentials = Authorization.shared.userCredentials {
            let qrCode = userCredentials.qrCode.value
            if let qrCodeUrl = URL(string: qrCode) {
                qrCodeImageView.setImage(with: qrCodeUrl)
            }

            emailVerifyImageView.isHidden = !(userCredentials.isEmailVerified ?? false)
            let profileString = userCredentials.profileImage.value
            if let profileUrl = URL(string: profileString) {
                profileImageView.setImage(with: profileUrl)
            }
            
            nameLabel.text = "\(userCredentials.firstName.value) \(userCredentials.lastName.value)"
            emailLabel.text = userCredentials.email.value
            mobileLabel.text = "\(userCredentials.countryCode.value) \(userCredentials.phoneNumber.value)"
          
            companyNameLabel.text = userCredentials.companyName.value
            cribNumberLabel.text = userCredentials.taxId.value
            registrationNoLabel.text = userCredentials.registrationNumber.value
      }
        
        let kycStatus = profileVM.accountMe?.kycStatusEnum ?? .pending
        switch kycStatus {
        case .pending, .uploaded:
          kycStatusLabel.text = LocalizedKey.kycPending.value
            kycStatusImageView.image = #imageLiteral(resourceName: "ic_KYC Pending")
        case .approved:
            kycStatusLabel.text = LocalizedKey.kycVerified.value
            kycStatusImageView.image = #imageLiteral(resourceName: "ic_kyc_complete")
        case .rejected:
            kycStatusLabel.text = LocalizedKey.kycRejected.value
            kycStatusImageView.image = #imageLiteral(resourceName: "ic_KYC Rejected")
        }
        
        if let accountNumber = profileVM.accountMe?.accountNumber {
          customerIdLabel.text = "\(LocalizedKey.custID.value) \(accountNumber)"
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func shareButtonAction(_ sender: Any) {
      let text = LocalizedKey.qrCode.value
        let image = qrCodeImageView.image!
        let shareAll: [Any] = [text, image]
        let activityViewController = UIActivityViewController(activityItems: shareAll, applicationActivities: nil)
        activityViewController.popoverPresentationController?.sourceView = self.view
        activityViewController.completionWithItemsHandler = { (_, success, _, _) in
            print(success ? APIKey.success : APIKey.failure)
        }
        
        present(activityViewController, animated: true, completion: nil)
    }

    @IBAction func editProfileAction(_ sender: Any) {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: EditProfileVC.self)
        hideCircleView()
        viewController.editProfileVM.accountMe = profileVM.accountMe
        pushVC(viewController)
    }
    
}

// MARK: - API Call

extension ProfileVC {
    private func callAccountMeAPI() {
        
        profileVM.accountMeAPI { [weak self] (success, message) in
            
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
