//
//  ChangeEmailVC.swift
//  Monay
//
//  Created by WFH on 29/12/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ChangeEmailVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var emailTextField: ACFloatingTextfield!
    
    // MARK: - Instance properties
    
    var changeEmailVM = ChangeEmailVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    // MARK: - IBAction methods
    
    @IBAction func sendCodeButton(_ sender: Any) {
        
        let data = [
            emailTextField.text ?? ""
        ]
        
        let validationResponse = changeEmailVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callUpdateEmailAPI()
    }
}

// MARK: - API Calling

extension ChangeEmailVC {
    private func callUpdateEmailAPI() {
        
        let parameters: HTTPParameters = [
            "email": emailTextField.text ?? ""
        ]
        
        changeEmailVM.updateEmailAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
                    viewController.verificationVM.countryCode = ""
                    viewController.verificationVM.phoneNumber = ""
                    viewController.verificationVM.email = self.emailTextField.text ?? ""
                    viewController.verificationVM.userType = self.changeEmailVM.usertype
                    viewController.verificationVM.redirectFrom = self.changeEmailVM.redirectFrom
                    viewController.verificationVM.isVerifyOldEmail = true
                    viewController.verificationVM.changeMobileOrEmailType = self.changeEmailVM.changeMobileOrEmailType
                    self.pushVC(viewController)
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}
