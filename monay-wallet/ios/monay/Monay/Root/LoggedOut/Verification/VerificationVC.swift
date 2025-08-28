//
//  VerificationVC.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class VerificationVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var code1: UITextField!
    @IBOutlet weak var code2: UITextField!
    @IBOutlet weak var code3: UITextField!
    @IBOutlet weak var code4: UITextField!
    @IBOutlet weak var code5: UITextField!
    @IBOutlet weak var code6: UITextField!
    @IBOutlet weak var resendButton: UIButton!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var descriptionLabel: UILabel!
    @IBOutlet weak var mobileNumberLabel: UILabel!
    @IBOutlet weak var confirmButton: UIButton!
    
    // MARK: - Instance properties
    
    let verificationVM = VerificationVM()
    
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
        
      let attributeString = NSMutableAttributedString(string: LocalizedKey.resendCode.value, attributes: attributes)
        resendButton.setAttributedTitle(attributeString, for: .normal)
        
      let description = verificationVM.phoneNumber.isEmpty ? LocalizedKey.messgeEnterCodeSentOnEmail.value : LocalizedKey.messgeEnterCodeSentOnMobile.value
        descriptionLabel.text = description
        mobileNumberLabel.text = verificationVM.phoneNumber.isEmpty ? verificationVM.email : "\(verificationVM.countryCode) \(verificationVM.phoneNumber)"
        
        if verificationVM.redirectFrom == .editProfile {
            
            switch verificationVM.changeMobileOrEmailType {
            case .mobile:
                
              descriptionLabel.text = LocalizedKey.messgeEnterCodeSentOnMobileForVerification.value
                
                if verificationVM.phoneNumber.isEmpty {
                  confirmButton.setTitle(LocalizedKey.update.value, for: .normal)
                } else if !verificationVM.isVerifyOldMobileNumber {
                    confirmButton.setTitle(LocalizedKey.next.value, for: .normal)
                } else {
                  confirmButton.setTitle(LocalizedKey.confirm.value, for: .normal)
                }
                
            case .email:
                
              descriptionLabel.text = LocalizedKey.messageEnterCodeSentOnEmailForVerification.value
                      
                if verificationVM.email.isEmpty {
                    confirmButton.setTitle(LocalizedKey.update.value, for: .normal)
                } else if !verificationVM.isVerifyOldEmail {
                    confirmButton.setTitle(LocalizedKey.next.value, for: .normal)
                } else {
                    confirmButton.setTitle(LocalizedKey.confirm.value, for: .normal)
                }
                
            }
            
        } else {
            confirmButton.setTitle(LocalizedKey.confirm.value, for: .normal)
        }
    }
    
    func resetCode() {
        [code1, code2, code3, code4, code5, code6].forEach({ $0?.text = "" })
        [code1, code2, code3, code4, code5, code6].forEach({ $0?.borderColor = Color.border})
    }
    
    private func redirectTo() {
        
        switch verificationVM.redirectFrom {
        case .signup:
            let viewController = StoryboardScene.Account.instantiateViewController(withClass: SignupVC.self)
            viewController.signupVM.usertype = verificationVM.userType
            viewController.signupVM.countryCode = verificationVM.countryCode
            viewController.signupVM.phoneNumber = verificationVM.phoneNumber
            self.pushVC(viewController)
        case .forgotPassword:
            let viewController = StoryboardScene.Account.instantiateViewController(withClass: ResetPasswordVC.self)
            viewController.resetPasswordVM.countryCode = verificationVM.countryCode
            viewController.resetPasswordVM.phoneNumber = verificationVM.phoneNumber
            viewController.resetPasswordVM.email = verificationVM.email
            
            var otp = code1.text! + code2.text! + code3.text! + code4.text!
            otp.append(code5.text!)
            otp.append(code6.text!)
            viewController.resetPasswordVM.verificationCode = otp
            self.pushVC(viewController)
        case .editProfile:
            
            switch verificationVM.changeMobileOrEmailType {
            case .mobile:
                // swiftlint:disable line_length
                if !verificationVM.isVerifyOldMobileNumber && !verificationVM.phoneNumber.isEmpty {
                     
                    /// comes from edit profile screen and user want to change his mobile number first verify his old number with verification code and then redirect to enter new number and verify and than redirect to profile screen in below condition (next if condition).
                    let viewController = StoryboardScene.Account.instantiateViewController(withClass: MobileNumberVC.self)
                    viewController.mobileNumberVM.usertype = verificationVM.userType
                    viewController.mobileNumberVM.redirectFrom = verificationVM.redirectFrom
                    viewController.mobileNumberVM.changeMobileOrEmailType = verificationVM.changeMobileOrEmailType
                    viewController.mobileNumberVM.countryPhoneCode = verificationVM.countryCode
                    self.pushVC(viewController)
                    return
                }
                
            case .email:
              
              guard let userCredentials = Authorization.shared.userCredentials else {
                return
              }
              let isEmailVerified = userCredentials.isEmailVerified ?? false
                
                if !verificationVM.isVerifyOldEmail && !verificationVM.email.isEmpty && isEmailVerified {
                    let viewController = StoryboardScene.Profile.instantiateViewController(withClass: ChangeEmailVC.self)
                    viewController.changeEmailVM.usertype = verificationVM.userType
                    viewController.changeEmailVM.changeMobileOrEmailType = verificationVM.changeMobileOrEmailType
                    self.pushVC(viewController)
                    return
                }
            }
            
            if checkControllerInNavigationStack(ProfileVC.self) {
                popToSpecificController(ProfileVC.self)
            }
          
        case .scanner:
          appDelegate.setRootViewConroller()
            
        default:
            break
        }
    }
    
    private func redirectToResetPin() {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: SetPinVC.self)
        viewController.setPinVM.countryCode = verificationVM.countryCode
        viewController.setPinVM.phoneNumber = verificationVM.phoneNumber
        viewController.setPinVM.email = verificationVM.email
        viewController.setPinVM.redirectFrom = verificationVM.redirectFrom
        
        var otp = code1.text! + code2.text! + code3.text! + code4.text!
        otp.append(code5.text!)
        otp.append(code6.text!)
        
        viewController.setPinVM.otp = otp
        self.pushVC(viewController)
    }
    
    private func otpAutoFill(textField: UITextField) {
        
        if #available(iOS 12.0, *) {
            if textField.textContentType == UITextContentType.oneTimeCode {
                
                if let otpCode = textField.text, otpCode.count > 5 {
                    code1.text = String(otpCode[0])
                    code2.text = String(otpCode[1])
                    code3.text = String(otpCode[2])
                    code4.text = String(otpCode[3])
                    code5.text = String(otpCode[4])
                    code6.text = String(otpCode[5])
                    view.endEditing(true)
                }
            }
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func code1_EditingChanged(_ sender: UITextField) {
        /*
         code2.becomeFirstResponder()
         code1.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
         code1.layer.borderWidth = 1.0
         */
        
        otpAutoFill(textField: sender)
    }
    
    @IBAction func code2_EditingChanged(_ sender: UITextField) {
        /*
         code3.becomeFirstResponder()
         code2.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
         code2.layer.borderWidth = 1.0
         */
    }
    
    @IBAction func code3_EditingChanged(_ sender: UITextField) {
        /*
        code4.becomeFirstResponder()
        code3.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code3.layer.borderWidth = 1.0
        */
    }
    
    @IBAction func code4_EditingChanged(_ sender: UITextField) {
        /*
        code5.becomeFirstResponder()
        code4.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code4.layer.borderWidth = 1.0
        */
    }
    
    @IBAction func code5_EditingChanged(_ sender: UITextField) {
        /*
        code6.becomeFirstResponder()
        code5.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code5.layer.borderWidth = 1.0
        */
    }
    
    @IBAction func code6_EditingChanged(_ sender: UITextField) {
        /*
        code6.resignFirstResponder()
        code6.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code6.layer.borderWidth = 1.0
       */
    }
    
    @IBAction func confirmButton_Action(_ sender: UIButton) {
        let data = [
            code1.text ?? "",
            code2.text ?? "",
            code3.text ?? "",
            code4.text ?? "",
            code5.text ?? "",
            code6.text ?? ""
        ]
        
        let validationResponse = verificationVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        switch verificationVM.redirectFrom {
        case .signup:
            callVerifyOTPAPI()
        case .forgotPassword:
            callVerifyOTPOnlyAPI()
        case .pin:
            callVerifyPinOTPAPI()
        case .editProfile:

            switch verificationVM.changeMobileOrEmailType {
            case .mobile:
                
                if verificationVM.isVerifyOldMobileNumber {
                    callVerifyPhoneNumberAPI()
                    return
                }
                
            case .email:
                
                if verificationVM.isVerifyOldEmail {
                    callVerifyEmailAPI()
                    return
                }
            }
            
            callVerifyOTPAPI()
        case .scanner:
          callVerifyPrimaryOTPAPI()
          
        default:
            break
        }
    }
    
    @IBAction func resendButtonAction(_ sender: Any) {
        resetCode()
        
        switch verificationVM.redirectFrom {
        case .signup, .forgotPassword:
            callResendOTPAPI()
        case .editProfile:
            
            switch verificationVM.changeMobileOrEmailType {
            case .mobile:
                
                if verificationVM.isVerifyOldMobileNumber {
                    callUpdatePhoneNumberAPI()
                    return
                }
                
            case .email:
                
                if verificationVM.isVerifyOldEmail {
                    callUpdateEmailAPI()
                    return
                }
            }
            
            callResendOTPAPI()
        case .pin:
            callForgotPinAPI()
          
        case .scanner:
          callResendOTPAPI()

        default:
            break
        }
    }
}

// MARK: - API Calling

extension VerificationVC {
    private func callVerifyOTPAPI() {
        var otp = code1.text! + code2.text! + code3.text! + code4.text!
        otp.append(code5.text!)
        otp.append(code6.text!)
        
        let phoneNumber = verificationVM.phoneNumber
        let userName = phoneNumber.isEmpty ? verificationVM.email : phoneNumber
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": verificationVM.countryCode,
            "username": userName,
            "otp": otp
        ]
        
        verificationVM.verifyOTPAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                if self.verificationVM.redirectFrom == .editProfile {
                   // Authorization.shared.userCredentials.isEmailVerified = true
                    Authorization.shared.synchronize()
                }
                self.showAlertWith(message: message) {
                    self.redirectTo()
                }
            } else {
                self.showAlertWith(message: message) {
                    self.resetCode()
                    self.code1.becomeFirstResponder()
                }
            }
        }
    }
    
    private func callVerifyOTPOnlyAPI() {
        var otp = code1.text! + code2.text! + code3.text! + code4.text!
        otp.append(code5.text!)
        otp.append(code6.text!)
        
        let phoneNumber = verificationVM.phoneNumber
        let userName = phoneNumber.isEmpty ? verificationVM.email : phoneNumber
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": verificationVM.countryCode,
            "username": userName,
            "otp": otp
        ]
        
        verificationVM.verifyOTPOnlyAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                self.showAlertWith(message: message) {
                    self.redirectTo()
                }
            } else {
                self.showAlertWith(message: message) {
                    self.resetCode()
                    self.code1.becomeFirstResponder()
                }
            }
        }
    }
    
    private func callResendOTPAPI() {
        
        let phoneNumber = verificationVM.phoneNumber
        let userName = phoneNumber.isEmpty ? verificationVM.email : phoneNumber
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": verificationVM.countryCode,
            "username": userName
        ]
        
        verificationVM.resendOTPAPI(parameters: parameters) { [weak self] (_, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.showAlertWith(message: message)
        }
    }
    
    private func callForgotPinAPI() {
        
        let phoneNumber = verificationVM.phoneNumber
         let userName = phoneNumber.isEmpty ? verificationVM.email : phoneNumber
         
         let parameters: HTTPParameters = [
             "phoneNumberCountryCode": verificationVM.countryCode,
             "username": userName
         ]
        
        verificationVM.forgotPinAPI(parameters: parameters) { [weak self] (_, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.showAlertWith(message: message)
        }
    }
    
    private func callVerifyPinOTPAPI() {
        let phoneNumber = verificationVM.phoneNumber
        let userName = phoneNumber.isEmpty ? verificationVM.email : phoneNumber
        
        var otp = code1.text! + code2.text! + code3.text! + code4.text!
        otp.append(code5.text!)
        otp.append(code6.text!)
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": verificationVM.countryCode,
            "username": userName,
            "otp": otp
        ]
        
        verificationVM.verifyPinOTPAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                self.showAlertWith(message: message) {
                    self.redirectToResetPin()
                }
            } else {
                self.showAlertWith(message: message) {
                    self.resetCode()
                    self.code1.becomeFirstResponder()
                }
            }
        }
    }
    
    private func callVerifyPhoneNumberAPI() {
        var otp = code1.text! + code2.text! + code3.text! + code4.text!
        otp.append(code5.text!)
        otp.append(code6.text!)
        
        let phoneNumber = verificationVM.phoneNumber
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": verificationVM.countryCode,
            "phoneNumber": phoneNumber,
            "otp": otp
        ]
        
        verificationVM.verifyPhoneNumberAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.redirectTo()
                }
            } else {
                self.showAlertWith(message: message) {
                    self.resetCode()
                    self.code1.becomeFirstResponder()
                }
            }
        }
    }
    
    private func callVerifyEmailAPI() {
        var otp = code1.text! + code2.text! + code3.text! + code4.text!
        otp.append(code5.text!)
        otp.append(code6.text!)
        
        let email = verificationVM.email
        let parameters: HTTPParameters = [
            "email": email,
            "otp": otp
        ]
        
        verificationVM.verifyEmailAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.redirectTo()
                }
            } else {
                self.showAlertWith(message: message) {
                    self.resetCode()
                    self.code1.becomeFirstResponder()
                }
            }
        }
    }
    
    private func callUpdatePhoneNumberAPI() {
        
        let phoneNumber = verificationVM.phoneNumber
        let userName = phoneNumber.isEmpty ? verificationVM.email : phoneNumber
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": verificationVM.countryCode,
            "phoneNumber": userName
        ]
        
        verificationVM.updatePhoneNumberAPI(parameters: parameters) { [weak self] (_, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.showAlertWith(message: message)
        }
    }
    
    private func callUpdateEmailAPI() {
        
        let parameters: HTTPParameters = [
            "email": verificationVM.email
        ]
        
        verificationVM.updateEmailAPI(parameters: parameters) { [weak self] (_, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.showAlertWith(message: message)
        }
    }
  
  private func callVerifyPrimaryOTPAPI() {
      var otp = code1.text! + code2.text! + code3.text! + code4.text!
      otp.append(code5.text!)
      otp.append(code6.text!)
      
      let phoneNumber = verificationVM.phoneNumber
      let userName = phoneNumber.isEmpty ? verificationVM.email : phoneNumber
      
      let parameters: HTTPParameters = [
          "phoneNumberCountryCode": verificationVM.countryCode,
          "username": userName,
          "otp": otp
      ]
      
      verificationVM.verifyPrimaryOTPAPI(parameters: parameters) { [weak self] (success, message) in
          
          guard let `self` = self else {
              return
          }
          
          if success {
              Authorization.shared.isUserLinked = true
              Authorization.shared.synchronize()
              self.showAlertWith(message: message) {
                  self.redirectTo()
              }
          } else {
              self.showAlertWith(message: message) {
                  self.resetCode()
                  self.code1.becomeFirstResponder()
              }
          }
      }
  }

}

extension VerificationVC {
    
    @objc func textFieldDidBeginEditing(_ textField: UITextField) {
        textField.text = ""
    }
    
    @objc func keyboardInputShouldDelete(_ textField: UITextField) -> Bool {
        let shouldDelete: Bool = true
        
        if textField.text?.count == 0 && (textField.text == "") {
            let tagValue: Int = textField.tag - 1
            let txtField: UITextField? = (view.viewWithTag(tagValue) as? UITextField)
            txtField?.becomeFirstResponder()
        }
        return shouldDelete
    }
}

extension VerificationVC: UITextFieldDelegate {
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
      
        var paste = UIPasteboard.general.string ?? ""
        paste = paste.replacingOccurrences(of: "\n", with: " ")
        
        if string == paste && !paste.isEmpty {
            
            if CharacterSet.decimalDigits.isSuperset(of: CharacterSet(charactersIn: string)),
               string.count == 6 {
                
                code1.text = String(string[0])
                code2.text = String(string[1])
                code3.text = String(string[2])
                code4.text = String(string[3])
                code5.text = String(string[4])
                code6.text = String(string[5])
                view.endEditing(true)
            }
            
            return false
            
        } else {
            // return true // type
            
            if string.count == 1 {
                if textField == code1 {
                    code2.becomeFirstResponder()
                }
                if textField == code2 {
                    code3.becomeFirstResponder()
                }
                if textField == code3 {
                    code4.becomeFirstResponder()
                }
                if textField == code4 {
                    code5.becomeFirstResponder()
                }
                if textField == code5 {
                    code6.becomeFirstResponder()
                }
                if textField == code6 {
                    code6.resignFirstResponder()
                }
                
                textField.text = string
                
                return true
                
            } else {
                if textField == code1 {
                    code1.becomeFirstResponder()
                }
                if textField == code2 {
                    code2.becomeFirstResponder()
                }
                if textField == code3 {
                    code3.becomeFirstResponder()
                }
                if textField == code4 {
                    code4.becomeFirstResponder()
                }
                if textField == code5 {
                    code5.becomeFirstResponder()
                }
                if textField == code6 {
                    code6.becomeFirstResponder()
                }
                
                textField.text = string
                
                return true
                
            }
        }
    }
}
