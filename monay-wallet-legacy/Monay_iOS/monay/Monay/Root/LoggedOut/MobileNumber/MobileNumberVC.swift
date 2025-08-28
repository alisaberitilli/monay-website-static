//
//  MobileNumberVC.swift
//  Monay
//
//  Created by WFH on 19/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ActionSheetPicker_3_0

class MobileNumberVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var countryCodeLabel: UILabel!
    @IBOutlet weak var mobileNumberTextField: ACFloatingTextfield!
    @IBOutlet weak var backToLoginButton: UIButton!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var subTitleLabel: UILabel!
    @IBOutlet weak var sendButton: UIButton!
    
    // MARK: - Instance properties
    
    let mobileNumberVM = MobileNumberVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    private func initialSetup() {
      mobileNumberTextField.delegate = self
      mobileNumberTextField.attributedPlaceholder = NSAttributedString(string: LocalizedKey.mobileNumber.value,
                                                                         attributes: [NSAttributedString.Key.foregroundColor: UIColor.white])
        
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.customFont(style: .bold, size: .custom(16)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
        let attributeString = NSMutableAttributedString(string: LocalizedKey.backToLogin.value, attributes: attributes)
        backToLoginButton.setAttributedTitle(attributeString, for: .normal)
        
        if mobileNumberVM.redirectFrom == .signup {
            backToLoginButton.isHidden = false
        }
        
        countryCodeLabel.text = mobileNumberVM.countryPhoneCode
        
        switch mobileNumberVM.redirectFrom {
        case .editProfile:
          titleLabel.text = LocalizedKey.changeMobileNumber.value
            subTitleLabel.text =  LocalizedKey.enterNewMobileNumber.value
            sendButton.setTitle(LocalizedKey.sendCode.value, for: .normal)
        default:
            break
        }
    }
    
    // MARK: - Private helper methods
    
    private func redirectToVerificationScreen() {
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
        viewController.verificationVM.countryCode = countryCodeLabel.text!
        viewController.verificationVM.phoneNumber = mobileNumberTextField.text!
        viewController.verificationVM.userType = mobileNumberVM.usertype
        viewController.verificationVM.redirectFrom = mobileNumberVM.redirectFrom
        pushVC(viewController)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func countryCodeButtonAction(_ sender: Any) {
        if self.mobileNumberVM.countryList.count == 0 {
            callGetContactListAPI()
            return
        }
        
        let countryCode = self.mobileNumberVM.countryList.map { $0.countryCallingCode ?? "" }
        let countryname = self.mobileNumberVM.countryList.map { $0.name ?? "" }
        let result = zip(countryCode, countryname).map { "\($0) \($1)" }
        
        ActionSheetStringPicker.show(withTitle: LocalizedKey.selectCountry.value, rows: result, initialSelection: 0, doneBlock: { _, index, _ in
             self.countryCodeLabel.text = "\(self.mobileNumberVM.countryList[index].countryCallingCode!)"
          }, cancel: { _ in return }, origin: self.view)
      }
    
    @IBAction func sendButtonAction(_ sender: Any) {
        let data = [
            mobileNumberTextField.text ?? ""
        ]
        
        let validationResponse = mobileNumberVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        switch mobileNumberVM.redirectFrom {
        case .signup:
            callSendOtpAPI()
        case .editProfile:
            callUpdatePhoneNumberAPI()
        default:
            break
        }
    }
    
    @IBAction func backToLoginButtonAction(_ sender: Any) {
        pop()
    }
}

// MARK: - API Calling

extension MobileNumberVC {
    private func callSendOtpAPI() {
        
        let userType = mobileNumberVM.usertype.rawValue
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": countryCodeLabel.text ?? "",
            "phoneNumber": mobileNumberTextField.text ?? "",
            "userType": userType
        ]
        
        mobileNumberVM.sendOtpAPI(parameters: parameters) { [weak self] (success, message) in
            
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
    
    private func callUpdatePhoneNumberAPI() {
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": countryCodeLabel.text ?? "",
            "phoneNumber": mobileNumberTextField.text ?? ""
        ]
        
        mobileNumberVM.updatePhoneNumberAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
                    viewController.verificationVM.countryCode = self.countryCodeLabel.text!
                    viewController.verificationVM.phoneNumber = self.mobileNumberTextField.text!
                    viewController.verificationVM.userType = self.mobileNumberVM.usertype
                    viewController.verificationVM.redirectFrom = self.mobileNumberVM.redirectFrom
                    viewController.verificationVM.isVerifyOldMobileNumber = true  // this is for change mobile number from edit profile flow
                    viewController.verificationVM.changeMobileOrEmailType = self.mobileNumberVM.changeMobileOrEmailType
                    self.pushVC(viewController)
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callGetContactListAPI() {
        
        mobileNumberVM.countryList { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if !success {
                self.showAlertWith(message: message)
            }
        }
    }
    
}

extension MobileNumberVC: UITextFieldDelegate {
  
  func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
    
    switch textField {
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
