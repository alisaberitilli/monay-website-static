//
//  ChangePasswordVC.swift
//  Monay
//
//  Created by Aayushi on 14/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ChangePasswordVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var oldPasswordTextField: ACFloatingTextfield!
    @IBOutlet weak var newPasswordTextField: ACFloatingTextfield!
    @IBOutlet weak var confirmPasswordTextField: ACFloatingTextfield!
    @IBOutlet weak var showCurrentPasswordButton: UIButton!
    @IBOutlet weak var showConfirmPasswordButton: UIButton!
    @IBOutlet weak var showNewPasswordButton: UIButton!

    // MARK: - Instance properties
    
    let changePasswordVM = ChangePasswordVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    // MARK: - IBAction methods
    
    @IBAction func updateButtonAction(_ sender: Any) {
        
        let data = [
            oldPasswordTextField.text ?? "",
            newPasswordTextField.text ?? "",
            confirmPasswordTextField.text ?? ""
        ]
        
        let validationResponse = changePasswordVM.isValidText(data)
        
        if !validationResponse.0 {
            return self.showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callChangePasswordAPI()
    }
  
    @IBAction func showCurrentPasswordButtonAction(_ sender: Any) {
        showCurrentPasswordButton.isSelected = !showCurrentPasswordButton.isSelected
        oldPasswordTextField.isSecureTextEntry = !oldPasswordTextField.isSecureTextEntry
    }
    
    @IBAction func showConfirmPasswordButtonAction(_ sender: Any) {
        showConfirmPasswordButton.isSelected = !showConfirmPasswordButton.isSelected
        confirmPasswordTextField.isSecureTextEntry = !confirmPasswordTextField.isSecureTextEntry
    }

    @IBAction func showNewPasswordButtonAction(_ sender: Any) {
        showNewPasswordButton.isSelected = !showNewPasswordButton.isSelected
        newPasswordTextField.isSecureTextEntry = !newPasswordTextField.isSecureTextEntry
    }

}

// MARK: - API Calling

extension ChangePasswordVC {
    private func callChangePasswordAPI() {
        
        let parameters: HTTPParameters = [
            "currentPassword": oldPasswordTextField.text ?? "",
            "newPassword": newPasswordTextField.text ?? "",
            "confirmNewPassword": confirmPasswordTextField.text ?? ""
        ]
        
        changePasswordVM.changePasswordAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.pop()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}
