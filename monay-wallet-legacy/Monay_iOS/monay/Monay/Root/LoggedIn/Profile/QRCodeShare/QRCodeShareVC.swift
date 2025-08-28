//
//  QRCodeShareVC.swift
//  Monay
//
//  Created by WFH on 20/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class QRCodeShareVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var qrCodeImageView: UIImageView!
    @IBOutlet weak var profileImageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var emailLabel: UILabel!
    @IBOutlet weak var mobileNumberLabel: UILabel!
    
    // MARK: - Instance properties
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupData()
    }
    
    private func setupData() {
        if let userCredentials = Authorization.shared.userCredentials {
            
            let qrCode = userCredentials.qrCode.value
            if let qrCodeUrl = URL(string: qrCode) {
                qrCodeImageView.setImage(with: qrCodeUrl)
            }
            
            let profileString = userCredentials.profileImage.value
            if let profileUrl = URL(string: profileString) {
                profileImageView.setImage(with: profileUrl)
            }
            
            nameLabel.text = "\(userCredentials.firstName.value) \(userCredentials.lastName.value)"
            emailLabel.text = userCredentials.email.value
            mobileNumberLabel.text = "\(userCredentials.countryCode.value) \(userCredentials.phoneNumber.value)"
        }
    }
    
    @IBAction func openScannerButtonAction(_ sender: Any) {
        dismiss()
    }
}
