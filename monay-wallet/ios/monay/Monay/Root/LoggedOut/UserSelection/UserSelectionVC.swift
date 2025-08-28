//
//  UserSelectionVC.swift
//  Monay
//
//  Created by WFH on 30/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class UserSelectionVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var merchantImage: UIImageView!
    @IBOutlet weak var secondUserImage: UIImageView!
    @IBOutlet weak var primaryUserImag: UIImageView!
    @IBOutlet weak var primaryUserButton: UIButton!
    @IBOutlet weak var secondUserButton: UIButton!

    @IBOutlet weak var merchantButton: UIButton!
    @IBOutlet weak var signupButton: UIButton!
    
    // MARK: - Instance properties
    
    var userType = UserType.user
    var onCompleteUserSelection: ((UserType) -> Void)?
    var onCrossClick: (() -> Void)?
    
    // MARK: - IBAction methods
    
    @IBAction func primaryUserButtonAction(_ sender: Any) {
        userType = .user
        
        primaryUserButton.borderColor = #colorLiteral(red: 0.1725490196, green: 0.6666666667, blue: 0.9843137255, alpha: 1)
        secondUserButton.borderColor = #colorLiteral(red: 0.9294117647, green: 0.9568627451, blue: 0.968627451, alpha: 1)
        merchantButton.borderColor = #colorLiteral(red: 0.9294117647, green: 0.9568627451, blue: 0.968627451, alpha: 1)
        
        primaryUserImag.image = #imageLiteral(resourceName: "ic_user")
         secondUserImage.image = #imageLiteral(resourceName: "ic_unselect_user")
         merchantImage.image = #imageLiteral(resourceName: "ic_unselect_merchant")
    }
    
    @IBAction func merchantButtonAction(_ sender: Any) {
        userType = .merchant
        
        merchantButton.borderColor = #colorLiteral(red: 0.1725490196, green: 0.6666666667, blue: 0.9843137255, alpha: 1)
        primaryUserButton.borderColor = #colorLiteral(red: 0.9294117647, green: 0.9568627451, blue: 0.968627451, alpha: 1)
        secondUserButton.borderColor = #colorLiteral(red: 0.9294117647, green: 0.9568627451, blue: 0.968627451, alpha: 1)

        primaryUserImag.image = #imageLiteral(resourceName: "ic_unselect_user")
        secondUserImage.image = #imageLiteral(resourceName: "ic_unselect_user")
        merchantImage.image = #imageLiteral(resourceName: "ic_merchant")
    }
    
    @IBAction func secondUserButtonAction(_ sender: Any) {
        userType = .secondaryUser
        
        merchantButton.borderColor = #colorLiteral(red: 0.9294117647, green: 0.9568627451, blue: 0.968627451, alpha: 1)
        primaryUserButton.borderColor = #colorLiteral(red: 0.9294117647, green: 0.9568627451, blue: 0.968627451, alpha: 1)
        secondUserButton.borderColor = #colorLiteral(red: 0.1725490196, green: 0.6666666667, blue: 0.9843137255, alpha: 1)

        primaryUserImag.image = #imageLiteral(resourceName: "ic_unselect_user")
        secondUserImage.image = #imageLiteral(resourceName: "ic_user")
        merchantImage.image = #imageLiteral(resourceName: "ic_unselect_merchant")
    }
    
    @IBAction func signupButtonAction(_ sender: Any) {
        dismiss()
        onCompleteUserSelection?(userType)
    }
    
    @IBAction func crossButtonAction(_ sender: Any) {
        dismiss(animated: false, completion: nil)
        onCrossClick?()
    }
}
