//
//  ForgetPinVC.swift
//  Monay
//
//  Created by WFH on 18/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ForgetPinVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var mobileTextField: ACFloatingTextfield!
    @IBOutlet weak var emailTextField: ACFloatingTextfield!
    @IBOutlet weak var countryCodeLabel: UILabel!
    @IBOutlet weak var useEmailButton: UIButton!
    @IBOutlet weak var phoneCodeView: UIView!
    @IBOutlet weak var emailView: UIView!
    @IBOutlet weak var mobileView: UIView!
    
    // MARK: - Instance properties
    
    let forgetPinVM = ForgetPinVM()
    
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
            .font: UIFont.customFont(style: .regular, size: .custom(14)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
        let useEmailAttributeString = NSMutableAttributedString(string: UserIDMode.email.rawValue, attributes: attributes)
        useEmailButton.setAttributedTitle(useEmailAttributeString, for: .normal)
        
        countryCodeLabel.text = Authorization.shared.userCredentials.countryCode.value
      mobileTextField.delegate = self
    }
    
    private func redirectToVerificationScreen() {
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
        viewController.verificationVM.countryCode = countryCodeLabel.text!
        
        if forgetPinVM.curentUserIDMode == .email {
            viewController.verificationVM.email = emailTextField.text!
            viewController.verificationVM.phoneNumber = ""
        } else {
            viewController.verificationVM.email = ""
            viewController.verificationVM.phoneNumber = mobileTextField.text!
        }
        viewController.verificationVM.userType = forgetPinVM.usertype
        viewController.verificationVM.redirectFrom = forgetPinVM.redirectFrom
        pushVC(viewController)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func countryCodeButtonAction(_ sender: Any) {
        // routeToCountryPicker()
    }
    
    @IBAction func switchUserButton(_ sender: UIButton) {
        sender.pulsate()
        [mobileView, emailView].forEach({ $0?.isHidden = true})
        _ = mobileTextField.resignFirstResponder()
        _ = emailTextField.resignFirstResponder()
        
        guard let senderCurrentTitle = sender.titleLabel?.text else { return }
        forgetPinVM.curentUserIDMode = UserIDMode(rawValue: senderCurrentTitle) ?? UserIDMode.email
        
        var senderTitle = ""
        
        switch forgetPinVM.curentUserIDMode {
            
        case .mobile:
          senderTitle = UserIDMode.email.rawValue
            phoneCodeView.isHidden = false
            mobileView.isHidden = false
            
        case .email:
          senderTitle = UserIDMode.mobile.rawValue
            phoneCodeView.isHidden = true
            emailView.isHidden = false
        }
        
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.customFont(style: .regular, size: .custom(14)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
        let useEmailAttributeString = NSMutableAttributedString(string: senderTitle, attributes: attributes)
        useEmailButton.setAttributedTitle(useEmailAttributeString, for: .normal)
        
    }
    
    @IBAction func sendCodeButtonAction(_ sender: Any) {
        let emailMobile = forgetPinVM.curentUserIDMode == .email ? emailTextField.text : mobileTextField.text
        
        let data = [
            emailMobile ?? ""
        ]
        
        let validationResponse = forgetPinVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callForgotPinAPI()
    }
}

// MARK: - API Calling

extension ForgetPinVC {
    private func callForgotPinAPI() {
        
        let username = forgetPinVM.curentUserIDMode == .email ? emailTextField.text : mobileTextField.text
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": countryCodeLabel.text ?? "",
            "username": username ?? ""
        ]
        
        forgetPinVM.forgotPinAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.redirectToVerificationScreen()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

extension ForgetPinVC: UITextFieldDelegate {
    
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
        switch textField {
        case mobileTextField:
          let set = NSCharacterSet(charactersIn: "0123456789")
          let inverted = set.inverted

          let filtered = string.components(separatedBy: inverted).joined(separator: "")
          if filtered != string {
            textField.text = (textField.text ?? "") + filtered
          }
          return filtered == string

        default: break
        }
        return true
    }
    
}
