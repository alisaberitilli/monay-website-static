//
//  SignupVC.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import TTTAttributedLabel
import ActionSheetPicker_3_0

class SignupVC: UIViewController, TTTAttributedLabelDelegate {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var firstNameTextField: ACFloatingTextfield!
    @IBOutlet weak var lastNameTextField: ACFloatingTextfield!
    @IBOutlet weak var emailTextField: ACFloatingTextfield!
    @IBOutlet weak var passwordTextField: ACFloatingTextfield!
    @IBOutlet weak var confirmPasswordTextField: ACFloatingTextfield!
    @IBOutlet weak var attributedLabel: TTTAttributedLabel!
    @IBOutlet weak var companyNameTextfield: ACFloatingTextfield!
    @IBOutlet weak var cribNumberTextfield: ACFloatingTextfield!
    @IBOutlet weak var registrationNoTextfield: ACFloatingTextfield!
    @IBOutlet weak var referralCodeTextfield: ACFloatingTextfield!
    @IBOutlet weak var termsCheckButton: UIButton!
    @IBOutlet weak var showPasswordButton: UIButton!
    @IBOutlet weak var showConfirmPasswordButton: UIButton!
    @IBOutlet weak var companyView: UIView!
    @IBOutlet weak var cribView: UIView!
    @IBOutlet weak var registrationView: UIView!
    @IBOutlet weak var referralView: UIView!
    @IBOutlet weak var userTypeImageView: UIImageView!
    @IBOutlet weak var userTypeLabel: UILabel!
    @IBOutlet weak var emailLabel: UILabel!

    // MARK: - Instance properties
    
    let signupVM = SignupVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupAttributeLabel()
        setupUI()
    }
    
    private func setupAttributeLabel() {
        attributedLabel.numberOfLines = 0
        
        var attributedtext = NSAttributedString()
        var linkAttributes = [String: Any]()
        var rangeTC = NSRange()
        var rangePP = NSRange()
        (attributedtext, linkAttributes, rangeTC, rangePP) = String().attributedLabel()
        
        attributedLabel.textAlignment = .left
        attributedLabel.attributedText = attributedtext
        
        attributedLabel.activeLinkAttributes = linkAttributes
        attributedLabel.linkAttributes = linkAttributes
        
      let urlTC = URL(string: LocalizedKey.actionTC.value)!
        let urlPP = URL(string: LocalizedKey.actionPP.value)!
        attributedLabel.addLink(to: urlTC, with: rangeTC)
        attributedLabel.addLink(to: urlPP, with: rangePP)
        attributedLabel.delegate = self
    }
    
    func attributedLabel(_ label: TTTAttributedLabel!, didSelectLinkWith url: URL!) {
        
        if url.absoluteString == LocalizedKey.actionTC.value {
            let viewController = StoryboardScene.More.instantiateViewController(withClass: CMSVC.self)
            viewController.cmsVM.selectedCMS = .terms
            viewController.cmsVM.usertype = signupVM.usertype
            self.pushVC(viewController)
        } else if url.absoluteString == LocalizedKey.actionPP.value {
            let viewController = StoryboardScene.More.instantiateViewController(withClass: CMSVC.self)
            viewController.cmsVM.selectedCMS = .privacyPolicy
            viewController.cmsVM.usertype = signupVM.usertype
            self.pushVC(viewController)
        }
    }
    
    func setupUI() {
      
      switch signupVM.usertype {
      case .user:
        self.userTypeLabel.text = UserRole.user.rawValue
        self.userTypeImageView.image = #imageLiteral(resourceName: "ic_user")
        
      case .secondaryUser:
        self.userTypeLabel.text = UserRole.secondaryUser.rawValue
        self.userTypeImageView.image = #imageLiteral(resourceName: "ic_user")
        self.referralView.isHidden = true
        self.referralCodeTextfield.text = Authorization.shared.referralCode

      case .merchant:
        self.userTypeLabel.text = UserRole.merchant.rawValue
        self.userTypeImageView.image = #imageLiteral(resourceName: "ic_merchant")
      }
      
      [companyView, registrationView, cribView].forEach({ $0?.isHidden = self.signupVM.usertype == .user || self.signupVM.usertype == .secondaryUser})
    }
    
    private func redirectToLogin() {
        appDelegate.setLoginRoot()
    }
    
    // MARK: - IBAction methods
    
    @IBAction func acceptTermsButton_Action(_ sender: UIButton) {
        termsCheckButton.isSelected = !termsCheckButton.isSelected
    }
    
    @IBAction func proceedButton_Action(_ sender: UIButton) {
        var data = [
            firstNameTextField.text ?? "",
            lastNameTextField.text ?? "",
            emailTextField.text ?? "",
            passwordTextField.text ?? "",
            confirmPasswordTextField.text ?? "",
            termsCheckButton.isSelected ? FlagStatus.trueStatus.rawValue : ""
        ]
        
        if signupVM.usertype == .merchant {
            data.append(companyNameTextfield.text ?? "")
            data.append(cribNumberTextfield.text ?? "")
            data.append(registrationNoTextfield.text ?? "")
        }
        
        let validationResponse = signupVM.isValidText(data, userType: signupVM.usertype)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callSignupAPI()
    }
    
    @IBAction func showPasswordButtonAction(_ sender: Any) {
        showPasswordButton.isSelected = !showPasswordButton.isSelected
        passwordTextField.isSecureTextEntry = !passwordTextField.isSecureTextEntry
    }
    
    @IBAction func showConfirmPasswordButtonAction(_ sender: Any) {
        showConfirmPasswordButton.isSelected = !showConfirmPasswordButton.isSelected
        confirmPasswordTextField.isSecureTextEntry = !confirmPasswordTextField.isSecureTextEntry
    }
}

// MARK: - API Calling

extension SignupVC {
    private func callSignupAPI() {
        
        var parameters: HTTPParameters = [
            "firstName": firstNameTextField.text ?? "",
            "lastName": lastNameTextField.text ?? "",
            "phoneNumberCountryCode": signupVM.countryCode,
            "phoneNumber": signupVM.phoneNumber,
            "email": emailTextField.text ?? "",
            "password": passwordTextField.text ?? "",
            "confirmPassword": confirmPasswordTextField.text ?? "",
            "deviceType": kDeviceTypeIOS,
            "firebaseToken": appDelegate.deviceToken
        ]
        
        if signupVM.usertype == .merchant {
            parameters["companyName"] = companyNameTextfield.text ?? ""
            parameters["taxId"] = cribNumberTextfield.text ?? ""
            parameters["chamberOfCommerce"] = registrationNoTextfield.text ?? ""
        }
      
        if referralCodeTextfield.text != "", self.signupVM.usertype == .secondaryUser {
          parameters["referralCode"] = referralCodeTextfield.text ?? ""
        }
        
        signupVM.signupAPI(userType: signupVM.usertype, parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                Authorization.shared.referralCode = ""
              
                appDelegate.isLoggedIn = true
                appDelegate.setRootViewConroller()
                
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
  
  private func checkEmailAPI() {
    
    let parameters: HTTPParameters = [
        "email": emailTextField.text ?? ""
    ]
    
    signupVM.checkEmailAPI(parameters: parameters) { [weak self] (_, message) in
      
      guard let `self` = self else {
          return
      }
      
      self.emailLabel.text = message
    }
  }
}

extension SignupVC: UITextFieldDelegate {
  
  func textFieldDidEndEditing(_ textField: UITextField) {
    if Validator.validEmail(textField.text) {
      self.checkEmailAPI()
    }
  }
  
}

extension SignupVC {
    
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool { 
        switch textField {
        case firstNameTextField, lastNameTextField:
            let characterSet = CharacterSet.letters
            if string.rangeOfCharacter(from: characterSet.inverted) != nil {
                return false
            }
            
            if let text = textField.text, let textRange = Range(range, in: text) {
                let finalText = text.replacingCharacters(in: textRange, with: string)
                
                if max25Length > 0,
                   max25Length < finalText.utf8.count {
                    return false
                }
            }
            
        case emailTextField:
            if let text = textField.text, let textRange = Range(range, in: text) {
                let finalText = text.replacingCharacters(in: textRange, with: string)
                
                if max50Length > 0,
                   max50Length < finalText.utf8.count {
                    return false
                }
            }
            
        case companyNameTextfield, cribNumberTextfield, registrationNoTextfield:
            if let text = textField.text, let textRange = Range(range, in: text) {
                let finalText = text.replacingCharacters(in: textRange, with: string)
                
                if max25Length > 0,
                   max25Length < finalText.utf8.count {
                    return false
                }
            }
            
        default: break
        }
        return true
    }
}
