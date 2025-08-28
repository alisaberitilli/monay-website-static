//
//  RequestMoneyVC.swift
//  Monay
//
//  Created by WFH on 18/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class RequestMoneyVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var mobileNumberLabel: UILabel!
    @IBOutlet weak var amountTextField: UITextField!
    @IBOutlet weak var messageTextView: KMPlaceholderTextView!
    @IBOutlet weak var requestButton: UIButton!
    @IBOutlet weak var currencyLabel: UILabel!
    
    let requestMoneyVM = RequestMoneyVM()
    
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
        let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
        currencyLabel.text = currencySymbol
        
        guard let user = requestMoneyVM.user else {
            return
        }
        
        let profileString = user.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        nameLabel.text = "\(user.firstName ?? "") \(user.lastName ?? "")"
        mobileNumberLabel.text = "\(user.phoneNumberCountryCode ?? "")\(user.phoneNumber ?? "")"
    }
    
    private func redirectToSuccessFullVC() {
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: SuccessfullVC.self)
        viewController.successfullVM.redirectFrom = .requestMoney
        viewController.successfullVM.user = requestMoneyVM.user
        viewController.successfullVM.amount = amountTextField.text!
        pushVC(viewController)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func requestButtonAction(_ sender: Any) {
        
        let userId = requestMoneyVM.user?.id ?? ""
        let validateResponse = isExistingLoginUserByID(paymentType: .request, userId: userId)
        if validateResponse.0 {
            return showAlertWith(message: validateResponse.1)
        }
        
        let data = [
            amountTextField.text ?? ""
        ]
        
        let validationResponse = requestMoneyVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        self.callpaymentRequestMoneyAPI()
    }
}

// MARK: - API Call

extension RequestMoneyVC {
    private func callpaymentRequestMoneyAPI() {
        
        guard let user = requestMoneyVM.user,
            let userId = user.id,
            let amount = amountTextField.text else {
                return
        }
        
        let parameters: HTTPParameters = [
            "toUserId": userId,
            "amount": amount,
            "message": messageTextView.text ?? ""
        ]
        
        requestMoneyVM.paymentRequestMoneyAPI(parameters: parameters) { [weak self] (success, message, kycStatus) in
            
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
                    self.showAlertWith(message: message) {
                        self.redirectToSuccessFullVC()
                    }
                }
                
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - Text field delegate methods

extension RequestMoneyVC: UITextFieldDelegate {
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
        guard let oldText = textField.text, let rangeInOldText = Range(range, in: oldText) else {
            return true
        }
        
        let newText = oldText.replacingCharacters(in: rangeInOldText, with: string)
        let isNumeric = newText.isEmpty || (Double(newText) != nil)
        let numberOfDots = newText.components(separatedBy: ".").count - 1
        
        let numberOfDecimalDigits: Int
        if let dotIndex = newText.firstIndex(of: ".") {
            numberOfDecimalDigits = newText.distance(from: dotIndex, to: newText.endIndex) - 1
        } else {
            numberOfDecimalDigits = 0
        }
        
        var numberOfIntDigits = newText.count
        if let dotIndex2 = newText.lastIndex(of: ".") {
            numberOfIntDigits = newText.distance(from: newText.startIndex, to: dotIndex2)
        }
        
        return isNumeric && numberOfDots <= 1 && numberOfDecimalDigits <= 2 && numberOfIntDigits <= 6
    }
}

extension RequestMoneyVC: UITextViewDelegate {
  
  func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
      let currentText = textView.text ?? ""

      guard let stringRange = Range(range, in: currentText) else { return false }
      let updatedText = currentText.replacingCharacters(in: stringRange, with: text)

      return updatedText.count <= max50Length
  }
}
