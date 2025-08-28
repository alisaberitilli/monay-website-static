//
//  AddNewBankVC.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddNewBankVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var accountHolderNameTextField: ACFloatingTextfield!
    @IBOutlet weak var bankNameTextField: ACFloatingTextfield!
    @IBOutlet weak var bankAccountNumberTextField: ACFloatingTextfield!
    @IBOutlet weak var routingABANumberTextField: ACFloatingTextfield!
    @IBOutlet weak var swiftCodeTextField: ACFloatingTextfield!
    @IBOutlet weak var iFSCCodeTextField: ACFloatingTextfield!

    // MARK: - Instance properties
    
    let addNewBankVM = AddNewBankVM()
    var onCompleteAddBank: (() -> Void)?
    var onCrossClick: (() -> Void)?
    
  // MARK: - View controller lifecycle methods
  
    override func viewDidLoad() {
        super.viewDidLoad()
        initalSetup()
    }
  
    // MARK: - Private helper methods
  
    private func initalSetup() {
      iFSCCodeTextField.isHidden = Authorization.shared.userCredentials.countryCode.value == "+1"
      routingABANumberTextField.isHidden = Authorization.shared.userCredentials.countryCode.value == "+91"
      swiftCodeTextField.isHidden = Authorization.shared.userCredentials.countryCode.value == "+91"
    }

    private func bankFieldValidation() {
        let data = [
            accountHolderNameTextField.text ?? "",
            bankNameTextField.text ?? "",
            bankAccountNumberTextField.text ?? "",
            routingABANumberTextField.text ?? "",
            swiftCodeTextField.text ?? "",
            iFSCCodeTextField.text ?? ""
        ]
        
        let validationResponse = addNewBankVM.isValidText(data)
        
        if !validationResponse.0 {
            self.showAlertWith(message: validationResponse.1)
            return
        }
        
        callAddBankAPI()
    }
    
    // MARK: - IBAction methods
    
    @IBAction func saveDetailsAction(_ sender: Any) {
        bankFieldValidation()
    }
    
    @IBAction func crossButtonAction(_ sender: Any) {
        dismiss()
        onCrossClick?()
    }
}

// MARK: - API Calling

extension AddNewBankVC {
    private func callAddBankAPI() {
        
        var parameters: HTTPParameters = [
            "accountHolderName": accountHolderNameTextField.text ?? "",
            "accountNumber": bankAccountNumberTextField.text ?? "",
            "bankName": bankNameTextField.text ?? ""
        ]
        
        if Authorization.shared.userCredentials.countryCode.value == "+91" {
          parameters["routingNumber"] = iFSCCodeTextField.text ?? ""
        } else {
          parameters["routingNumber"] = routingABANumberTextField.text ?? ""
          parameters["swiftCode"] = swiftCodeTextField.text ?? ""
        }

        addNewBankVM.addBankAPI(parameters: parameters, completion: { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.dismiss()
                    self.onCompleteAddBank?()
                }
            } else {
                self.showAlertWith(message: message)
            }
        })
    }
}

// MARK: - UITextFieldDelegate

extension AddNewBankVC: UITextFieldDelegate {
    
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool { 
        
        switch textField {
        case accountHolderNameTextField, bankNameTextField:
            var characterSet = CharacterSet.letters
            characterSet = characterSet.union(CharacterSet(charactersIn: " "))
            if string.rangeOfCharacter(from: characterSet.inverted) != nil {
                return false
            }
            
            if let text = textField.text, let textRange = Range(range, in: text) {
                let finalText = text.replacingCharacters(in: textRange, with: string)
                
                if max50Length > 0,
                   max50Length < finalText.utf8.count {
                    return false
                }
            }
            
        case bankAccountNumberTextField:
            if let text = textField.text, let textRange = Range(range, in: text) {
                let finalText = text.replacingCharacters(in: textRange, with: string)
                
                if maxLength > 0,
                   maxLength < finalText.utf8.count {
                    return false
                }
            }
            
        case routingABANumberTextField, swiftCodeTextField:
            let characterSet = CharacterSet.alphanumerics
            
            if string.rangeOfCharacter(from: characterSet.inverted) != nil {
                return false
            }
            
            if let text = textField.text, let textRange = Range(range, in: text) {
                let finalText = text.replacingCharacters(in: textRange, with: string)
                
                if maxLength > 0,
                   maxLength < finalText.utf8.count {
                    return false
                }
            }
            
        default: break
        }
        return true
    }
}
