//
//  ForgotPasswordVC.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ActionSheetPicker_3_0

class ForgotPasswordVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var countryCodeLabel: UILabel!
    @IBOutlet weak var mobileNumberTextField: ACFloatingTextfield!
    @IBOutlet weak var emailTextField: ACFloatingTextfield!
    
    // MARK: - Instance properties
    
    let forgotPasswordVM = ForgotPasswordVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    private func initialSetup() {
      mobileNumberTextField.attributedPlaceholder = NSAttributedString(string: LocalizedKey.mobileNumber.value,
                                                                         attributes: [NSAttributedString.Key.foregroundColor: UIColor.white])
    }
    
    // MARK: - Private helper methods
    
    private func redirectToVerificationScreen() {
        
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
        viewController.verificationVM.countryCode = self.countryCodeLabel.text!
        viewController.verificationVM.phoneNumber = self.mobileNumberTextField.text!
        viewController.verificationVM.email = self.emailTextField.text!
        viewController.verificationVM.userType = forgotPasswordVM.usertype
        viewController.verificationVM.redirectFrom = .forgotPassword
        self.pushVC(viewController)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func proceedButton_Action(_ sender: UIButton) {
        let email = emailTextField.text!
        let mobileNumber = mobileNumberTextField.text!
        
        let emailMobile = forgotPasswordVM.curentUserIDMode == .email ? email : mobileNumber
        
        let data = [
            emailMobile
        ]
        
        let validationResponse = forgotPasswordVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callForgotPasswordAPI()
    }
    
    @IBAction func countryCodeButtonAction(_ sender: Any) {
        if self.forgotPasswordVM.countryList.count == 0 {
            callGetContactListAPI()
            return
        }
        
        let countryCode = self.forgotPasswordVM.countryList.map { $0.countryCallingCode ?? "" }
        let countryname = self.forgotPasswordVM.countryList.map { $0.name ?? "" }
        let result = zip(countryCode, countryname).map { "\($0) \($1)" }
        
        ActionSheetStringPicker.show(withTitle: LocalizedKey.selectCountry.value, rows: result, initialSelection: 0, doneBlock: { _, index, _ in
             self.countryCodeLabel.text = "\(self.forgotPasswordVM.countryList[index].countryCallingCode!)"
          }, cancel: { _ in return }, origin: self.view)
      }
}

// MARK: - API Calling

extension ForgotPasswordVC {
    private func callForgotPasswordAPI() {
        
        let phoneNumber = mobileNumberTextField.text ?? ""
        let userName = phoneNumber.isEmpty ? emailTextField.text! : phoneNumber
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": countryCodeLabel.text!,
            "username": userName
        ]
        
        forgotPasswordVM.forgotPasswordAPI(parameters: parameters) { [weak self] (success, message) in
            
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
    
    private func callGetContactListAPI() {
        
        forgotPasswordVM.countryList { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
           // self.payMoneyTableView.reloadDataInMain()
            
            if !success {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - UITextFieldDelegate

extension ForgotPasswordVC: UITextFieldDelegate {
    func textFieldDidBeginEditing(_ textField: UITextField) {
        
        if textField != emailTextField {
            emailTextField.text = ""
            forgotPasswordVM.curentUserIDMode = .mobile
        } else if textField != mobileNumberTextField {
            mobileNumberTextField.text = ""
            forgotPasswordVM.curentUserIDMode = .email
        }
    }
}

extension ForgotPasswordVC {
  
  func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
    switch textField {
    case emailTextField:
      if let text = textField.text, let textRange = Range(range, in: text) {
        let finalText = text.replacingCharacters(in: textRange, with: string)
        
        if max50Length > 0,
           max50Length < finalText.utf8.count {
          return false
        }
      }
      
    case mobileNumberTextField:
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
