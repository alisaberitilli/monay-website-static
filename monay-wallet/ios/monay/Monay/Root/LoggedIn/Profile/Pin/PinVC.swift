//
//  PinVC.swift
//  Monay
//
//  Created by WFH on 22/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PinVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var code1: UITextField!
    @IBOutlet weak var code2: UITextField!
    @IBOutlet weak var code3: UITextField!
    @IBOutlet weak var code4: UITextField!
    @IBOutlet weak var forgotPinButton: UIButton!
    
    // MARK: - Instance properties
    
    let pinVM = PinVM()
    var callback: ((String) -> Void)?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.customFont(style: .regular, size: .custom(14)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
      let attributeString = NSMutableAttributedString(string: LocalizedKey.forgotPin.value, attributes: attributes)
        forgotPinButton.setAttributedTitle(attributeString, for: .normal)
    }
    
    private func resetPin() {
        DispatchQueue.main.async {
            self.code1.text = ""
            self.code2.text = ""
            self.code3.text = ""
            self.code4.text = ""
        }
    }
    
    private func redirectToSuccessfullVC() {
        
        guard let transaction = pinVM.transaction,
            let userDetail = pinVM.userDetail else {
                return
        }
        
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: SuccessfullVC.self)
        viewController.successfullVM.redirectFrom = pinVM.redirectFrom
        viewController.successfullVM.transaction = transaction
        viewController.successfullVM.user = pinVM.user
        viewController.successfullVM.amount = userDetail.amount
        self.pushVC(viewController)
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
        code4.resignFirstResponder()
        code4.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        code4.layer.borderWidth = 1.0
    }
    
    @IBAction func forgotPinAction(_ sender: Any) {
        let viewController = StoryboardScene.More.instantiateViewController(withClass: ForgetPinVC.self)
        viewController.forgetPinVM.redirectFrom = .pin
        pushVC(viewController)
    }
    
    @IBAction func proceedButtonAction(_ sender: Any) {
        
        let data = [
            code1.text ?? "",
            code2.text ?? "",
            code3.text ?? "",
            code4.text ?? ""
        ]
        
        let validationResponse = pinVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        let pin = code1.text! + code2.text! + code3.text! + code4.text!
        
        switch pinVM.redirectFrom {
        case .payMoney:
            if pinVM.userDetail?.isUserRequestPayMoney ?? false {
                callUserRequestPayMoneyAPI(mPin: pin)
            } else {
                callPayMoneyAPI(mPin: pin)
            }
        case .addMoney:
            callAddMoneyFromCardAPI(mPin: pin)
        case .withdrawalRequestMoney:
            callWithdrawalMoneyPI(mPin: pin)
        case .autoTopup:
            callAutoPopupFromCardAPI(mPin: pin)
        default:
            pop()
        }
    }
}

// MARK: - Text field delegate methods

extension PinVC: UITextFieldDelegate {
    
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

// MARK: - API Calling

extension PinVC {
    private func callAddMoneyFromCardAPI(mPin: String) {
        
        guard let userDetail = pinVM.userDetail else {
            return
        }
        
        let cardNumberFormatted = userDetail.cardNumber.replacingOccurrences(of: " ", with: "")
        
        let parameters: HTTPParameters = [
            "amount": userDetail.amount,
            "message": userDetail.message,
            "cardId": userDetail.cardId,
            "cardNumber": cardNumberFormatted,
            "month": userDetail.month,
            "year": userDetail.year,
            "cardType": "",
            "cvv": userDetail.cvv,
            "nameOnCard": userDetail.nameOnCard,
            "saveCard": userDetail.saveCard,
            "mpin": mPin
        ]
        
        pinVM.addMoneyFromCardAPI(parameters: parameters) { [weak self] (success, message, kycStatus) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
              if kycStatus == LocalizedKey.transactionLimitExhausted.value {
                    self.definesPresentationContext = true
                    self.providesPresentationContextTransitionStyle = true
                    
                    self.overlayBlurredBackgroundView()
                    let viewController = StoryboardScene.Main.instantiateViewController(withClass: CompleteKYCVC.self)
                    viewController.viewModel.message = message
                    viewController.onComplete = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                        if Authorization.shared.userCredentials.countryCode.value == "+91" {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCDocumentUploadVC.self)
                          self?.pushVC(viewController)
                        } else {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCUSADocumentUploadVC.self)
                          self?.pushVC(viewController)
                        }
                    }
                    
                    viewController.onCross = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                    }
                    
                    viewController.modalPresentationStyle = .overFullScreen
                    self.present(viewController)
                } else {
                    self.redirectToSuccessfullVC()
                }
                
            } else {
                self.resetPin()
                self.showAlertWith(message: message)
            }
        }
    }
}

extension PinVC {
    private func callPayMoneyAPI(mPin: String) {
        
        guard let userDetail = pinVM.userDetail else {
            return
        }
        
        let cardNumberFormatted = userDetail.cardNumber.replacingOccurrences(of: " ", with: "")
        
        var parameters: HTTPParameters = [
            "toUserId": userDetail.toUserId,
            "amount": userDetail.amount,
            "message": userDetail.message,
            "paymentMethod": userDetail.paymentMethod,
            "cardId": userDetail.cardId,
            "cardType": userDetail.cardType,
            "cardNumber": cardNumberFormatted,
            "nameOnCard": userDetail.nameOnCard,
            "month": userDetail.month,
            "year": userDetail.year,
            "cvv": userDetail.cvv,
            "mpin": mPin,
            "saveCard": userDetail.saveCard
        ]
      
        if userDetail.parentId != "", Authorization.shared.userCredentials.userType == .secondaryUser {
          parameters["parentId"] = userDetail.parentId
        }
        
        pinVM.payMoneyAPI(parameters: parameters) { [weak self] (success, message, kycStatus) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                if kycStatus == LocalizedKey.transactionLimitExhausted.value {
                    self.definesPresentationContext = true
                    self.providesPresentationContextTransitionStyle = true
                    
                    self.overlayBlurredBackgroundView()
                    let viewController = StoryboardScene.Main.instantiateViewController(withClass: CompleteKYCVC.self)
                    viewController.viewModel.message = message
                    viewController.onComplete = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                        if Authorization.shared.userCredentials.countryCode.value == "+91" {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCDocumentUploadVC.self)
                          self?.pushVC(viewController)
                        } else {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCUSADocumentUploadVC.self)
                          self?.pushVC(viewController)
                        }
                    }
                    
                    viewController.onCross = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                    }
                    
                    viewController.modalPresentationStyle = .overFullScreen
                    self.present(viewController)
                } else {
                    self.redirectToSuccessfullVC()
                }
                
            } else {
                self.resetPin()
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callUserRequestPayMoneyAPI(mPin: String) {
        
        guard let userDetail = pinVM.userDetail,
            let requestIdInt = Int(userDetail.requestId) else {
                return
        }
        
        let cardNumberFormatted = userDetail.cardNumber.replacingOccurrences(of: " ", with: "")
        
        let parameters: HTTPParameters = [
            "requestId": requestIdInt,
            "toUserId": userDetail.toUserId,
            "amount": userDetail.amount,
            "message": userDetail.message,
            "paymentMethod": userDetail.paymentMethod,
            "cardId": userDetail.cardId,
            "cardType": userDetail.cardType,
            "cardNumber": cardNumberFormatted,
            "nameOnCard": userDetail.nameOnCard,
            "month": userDetail.month,
            "year": userDetail.year,
            "cvv": userDetail.cvv,
            "mpin": mPin,
            "saveCard": userDetail.saveCard,
            "parentId": userDetail.parentId
        ]
        
        pinVM.userRequestPayMoneyAPI(parameters: parameters) { [weak self] (success, message, kycStatus) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
               
                if kycStatus == LocalizedKey.transactionLimitExhausted.value {
                    self.definesPresentationContext = true
                    self.providesPresentationContextTransitionStyle = true
                    
                    self.overlayBlurredBackgroundView()
                    let viewController = StoryboardScene.Main.instantiateViewController(withClass: CompleteKYCVC.self)
                    viewController.viewModel.message = message
                    viewController.onComplete = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                        if Authorization.shared.userCredentials.countryCode.value == "+91" {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCDocumentUploadVC.self)
                          self?.pushVC(viewController)
                        } else {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCUSADocumentUploadVC.self)
                          self?.pushVC(viewController)
                        }
                    }
                    
                    viewController.onCross = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                    }
                    
                    viewController.modalPresentationStyle = .overFullScreen
                    self.present(viewController)
                } else {
                    self.redirectToSuccessfullVC()
                }
                
            } else {
                self.resetPin()
                self.showAlertWith(message: message)
            }
        }
    }
}

extension PinVC {
    private func callWithdrawalMoneyPI(mPin: String) {
        
        guard let userDetail = pinVM.userDetail,
            let bankId = Int(userDetail.bankId) else {
                return
        }
        
        let parameters: HTTPParameters = [
            "bankId": bankId,
            "amount": userDetail.amount,
            "mpin": mPin
        ]
        
        pinVM.withdrawalMoneyAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.redirectToSuccessfullVC()
            } else {
                self.resetPin()
                self.showAlertWith(message: message)
            }
        }
    }
}

extension PinVC {
  private func callAutoPopupFromCardAPI(mPin: String) {
        
        guard let userDetail = pinVM.userDetail else {
            return
        }
        
        let cardNumberFormatted = userDetail.cardNumber.replacingOccurrences(of: " ", with: "")
        
        let parameters: HTTPParameters = [
            "minimumWalletAmount": userDetail.amount,
            "refillWalletAmount": userDetail.refillAmount,
            "paymentMethod": "card",
            "cardId": userDetail.cardId,
            "cardNumber": cardNumberFormatted,
            "month": userDetail.month,
            "year": userDetail.year,
            "cardType": "",
            "cvv": userDetail.cvv,
            "nameOnCard": userDetail.nameOnCard,
            "saveCard": userDetail.saveCard,
            "mpin": mPin
        ]
        
        pinVM.autoTopupAPI(parameters: parameters) { [weak self] (success, message, kycStatus) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
              if kycStatus == LocalizedKey.transactionLimitExhausted.value {
                    self.definesPresentationContext = true
                    self.providesPresentationContextTransitionStyle = true
                    
                    self.overlayBlurredBackgroundView()
                    let viewController = StoryboardScene.Main.instantiateViewController(withClass: CompleteKYCVC.self)
                    viewController.viewModel.message = message
                    viewController.onComplete = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                        if Authorization.shared.userCredentials.countryCode.value == "+91" {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCDocumentUploadVC.self)
                          self?.pushVC(viewController)
                        } else {
                          let viewController = StoryboardScene.More.instantiateViewController(withClass: KYCUSADocumentUploadVC.self)
                          self?.pushVC(viewController)
                        }
                    }
                    
                    viewController.onCross = { [weak self] in
                        self?.removeBlurredBackgroundViewView()
                    }
                    
                    viewController.modalPresentationStyle = .overFullScreen
                    self.present(viewController)
                } else {
                  if self.pinVM.redirectFrom == .autoTopup {
                    self.showAlert(title: "", message: message, okTitle: LocalizedKey.ok.value) { (_) in
                      appDelegate.setDashboardRoot()
                    }
                  } else {
                    self.redirectToSuccessfullVC()
                  }
                }
                
            } else {
                self.resetPin()
                self.showAlertWith(message: message)
            }
        }
    }
}
