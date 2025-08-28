//
//  ResetPasswordVC.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ResetPasswordVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var newPasswordTextField: ACFloatingTextfield!
    @IBOutlet weak var confirmPasswordTextField: ACFloatingTextfield!
    @IBOutlet weak var showNewPassword: UIButton!
    @IBOutlet weak var showConfirmPassword: UIButton!
    @IBOutlet weak var backToLoginButton: UIButton!
    
    // MARK: - Instance properties
    
    let resetPasswordVM = ResetPasswordVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupUI()
    }
    
    private func setupUI() {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.customFont(style: .bold, size: .custom(16)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
      let attributeString = NSMutableAttributedString(string: LocalizedKey.backToLogin.value, attributes: attributes)
        backToLoginButton.setAttributedTitle(attributeString, for: .normal)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func confirmButton_Action(_ sender: UIButton) {
        
        let data = [
            newPasswordTextField.text ?? "",
            confirmPasswordTextField.text ?? ""
        ]
        
        let validationResponse = resetPasswordVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callResetPasswordAPI()
    }
    
    @IBAction func showNewPasswordButtonAction(_ sender: Any) {
        showNewPassword.isSelected = !showNewPassword.isSelected
        newPasswordTextField.isSecureTextEntry = !newPasswordTextField.isSecureTextEntry
    }
    
    @IBAction func showConfirmPasswordButtonAction(_ sender: Any) {
        showConfirmPassword.isSelected = !showConfirmPassword.isSelected
        confirmPasswordTextField.isSecureTextEntry = !confirmPasswordTextField.isSecureTextEntry
    }
    
    @IBAction func backToLoginButtonAction(_ sender: Any) {
        popToSpecificController(LoginVC.self)
    }
}

// MARK: - API Calling

extension ResetPasswordVC {
    private func callResetPasswordAPI() {
        
        let username = resetPasswordVM.phoneNumber.isEmpty ? resetPasswordVM.email : resetPasswordVM.phoneNumber
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": resetPasswordVM.countryCode,
            "username": username,
            "otp": resetPasswordVM.verificationCode,
            "newPassword": newPasswordTextField.text ?? "",
            "confirmPassword": confirmPasswordTextField.text ?? ""
        ]
        
        resetPasswordVM.resetPasswordAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.popToSpecificController(LoginVC.self)
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}
