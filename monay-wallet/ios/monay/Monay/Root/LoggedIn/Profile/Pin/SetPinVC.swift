//
//  PinVC.swift
//  Monay
//
//  Created by WFH on 01/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SetPinVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var navigationTitleLabel: UILabel!
    @IBOutlet weak var backButton: UIButton!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var subTitleLabel: UILabel!
    @IBOutlet weak var pinLabel: UILabel!
    @IBOutlet weak var confirmPinLabel: UILabel!
    @IBOutlet weak var backToSecurityButton: UIButton!
    
    @IBOutlet weak var code1: UITextField!
    @IBOutlet weak var code2: UITextField!
    @IBOutlet weak var code3: UITextField!
    @IBOutlet weak var code4: UITextField!
    
    @IBOutlet weak var confirmCode1: UITextField!
    @IBOutlet weak var confirmCode2: UITextField!
    @IBOutlet weak var confirmCode3: UITextField!
    @IBOutlet weak var confirmCode4: UITextField!
    
    // MARK: - Instance properties
    
    let setPinVM = SetPinVM()
    
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
        
        let isMpinSet = Authorization.shared.userCredentials.isMpinSet ?? false
        
        if setPinVM.redirectFrom == .pin {
          navigationTitleLabel.text = LocalizedKey.resetPin.value
          titleLabel.text = LocalizedKey.resetMonayPin.value
          subTitleLabel.text = LocalizedKey.messageEnterFourDigitPin.value
            
            let attributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.customFont(style: .medium, size: .custom(14)),
                .foregroundColor: Color.blue,
                .underlineStyle: NSUnderlineStyle.single.rawValue
            ]
            
          let attributeString = NSMutableAttributedString(string: LocalizedKey.backToSecurity.value, attributes: attributes)
            backToSecurityButton.isHidden = false
            backToSecurityButton.setAttributedTitle(attributeString, for: .normal)
          pinLabel.text = LocalizedKey.enterNewPin.value
          confirmPinLabel.text = LocalizedKey.confirmNewPin.value
        }
        
        if !isMpinSet {
            navigationTitleLabel.isHidden = true
            backButton.isHidden = true
        }
    }
    
    private func popToSpecificVC() {
        
        if checkControllerInNavigationStack(PinVC.self) {
            self.popToSpecificController(PinVC.self)
        } else if checkControllerInNavigationStack(SecurityVC.self) {
            self.popToSpecificController(SecurityVC.self)
        } else {
            pop()
        }
    }
    
    private func showSuccessView() {
      
      self.definesPresentationContext = true
      self.providesPresentationContextTransitionStyle = true
      
      self.overlayBlurredBackgroundView()
      let viewController = StoryboardScene.Profile.instantiateViewController(withClass: PinSuccessfulVC.self)
      viewController.onProceed = {
          self.removeBlurredBackgroundViewView()
          Authorization.shared.userCredentials.isMpinSet = true
          Authorization.shared.synchronize()
          appDelegate.setRootViewConroller()
      }
      
      viewController.modalPresentationStyle = .overFullScreen
      self.present(viewController)
    }
    
    private func resetPin() {
        DispatchQueue.main.async {
            self.code1.text = ""
            self.code2.text = ""
            self.code3.text = ""
            self.code4.text = ""
            
            self.confirmCode1.text = ""
            self.confirmCode2.text = ""
            self.confirmCode3.text = ""
            self.confirmCode4.text = ""
        }
    }
  
    // MARK: - IBAction methods
    
    @IBAction func code1_EditingChanged(_ sender: UITextField) {
        code2.becomeFirstResponder()
        code1.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code1.layer.borderWidth = 1.0
    }
    
    @IBAction func code2_EditingChanged(_ sender: UITextField) {
        code3.becomeFirstResponder()
        code2.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code2.layer.borderWidth = 1.0
    }
    
    @IBAction func code3_EditingChanged(_ sender: UITextField) {
        code4.becomeFirstResponder()
        code3.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code3.layer.borderWidth = 1.0
    }
    
    @IBAction func code4_EditingChanged(_ sender: UITextField) {
        confirmCode1.becomeFirstResponder()
        code4.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code4.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmCode1_EditingChanged(_ sender: UITextField) {
        confirmCode2.becomeFirstResponder()
        confirmCode1.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmCode1.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmCode2_EditingChanged(_ sender: UITextField) {
        confirmCode3.becomeFirstResponder()
        confirmCode2.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmCode2.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmCode3_EditingChanged(_ sender: UITextField) {
        confirmCode4.becomeFirstResponder()
        confirmCode3.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmCode3.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmCode4_EditingChanged(_ sender: UITextField) {
        confirmCode4.resignFirstResponder()
        confirmCode4.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmCode4.layer.borderWidth = 1.0
    }
    
    @IBAction func saveButtonAction(_ sender: Any) {
        
        var data = [
            code1.text ?? "",
            code2.text ?? "",
            code3.text ?? "",
            code4.text ?? ""
        ]
        
        data.append(confirmCode1.text ?? "")
        data.append(confirmCode2.text ?? "")
        data.append(confirmCode3.text ?? "")
        data.append(confirmCode4.text ?? "")
        
        let pin = code1.text! + code2.text! + code3.text! + code4.text!
        
        let confirmPin = confirmCode1.text! + confirmCode2.text! + confirmCode3.text! + confirmCode4.text!
        
        data.append(pin)
        data.append(confirmPin)
        
        let validationResponse = setPinVM.isValidText(data)
        
        if validationResponse.2 {
            resetPin()
        }
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        if setPinVM.redirectFrom == .pin {
            callresetPinAPI()
        } else {  // set pin after login -> security -> set pin flow
            callSetPinAPI()
        }
    }
    
    @IBAction func backToSecurityButtonAction(_ sender: Any) {
        if checkControllerInNavigationStack(SecurityVC.self) {
            self.popToSpecificController(SecurityVC.self)
        }
    }
}

// MARK: - API Call

extension SetPinVC {
    private func callSetPinAPI() {
        let pin = code1.text! + code2.text! + code3.text! + code4.text!
        
        let parameters = [
            "mpin": pin
        ]
        
        setPinVM.setPinAPI(parameters: parameters, completion: { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showSuccessView()
            } else {
                self.showAlertWith(message: message)
            }
        })
    }
    
    private func callresetPinAPI() {
        let pin = code1.text! + code2.text! + code3.text! + code4.text!
        
        let confirmPin = confirmCode1.text! + confirmCode2.text! + confirmCode3.text! + confirmCode4.text!
        
        let phoneNumber = setPinVM.phoneNumber
           let userName = phoneNumber.isEmpty ? setPinVM.email : phoneNumber
           
           let parameters = [
               "phoneNumberCountryCode": setPinVM.countryCode,
               "username": userName,
               "otp": setPinVM.otp,
               "mpin": pin,
               "confirmMpin": confirmPin
           ]
        
        setPinVM.resetPinAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.popToSpecificVC()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - Text field delegate methods

extension SetPinVC: UITextFieldDelegate {
  
    @objc func textFieldDidBeginEditing(_ textField: UITextField) {
      textField.text = ""
    }
    
    @objc func keyboardInputShouldDelete(_ textField: UITextField) -> Bool {
      let shouldDelete: Bool = true
      
      if textField.text?.count == 0 && (textField.text == "") && textField.tag > 10 {
        let tagValue: Int = textField.tag - 1
        let txtField: UITextField? = (view.viewWithTag(tagValue) as? UITextField)
        txtField?.becomeFirstResponder()
      } else {
        let tagValue: Int = textField.tag - 1
        let txtField: UITextField? = (view.viewWithTag(tagValue) as? UITextField)
        txtField?.becomeFirstResponder()
      }
      return shouldDelete
    }

}
