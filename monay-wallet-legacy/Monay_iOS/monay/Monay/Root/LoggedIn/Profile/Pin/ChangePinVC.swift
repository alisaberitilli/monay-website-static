//
//  ChangePinVC.swift
//  Monay
//
//  Created by WFH on 06/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ChangePinVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var oldPin1TextField: UITextField!
    @IBOutlet weak var oldPin2TextField: UITextField!
    @IBOutlet weak var oldPin3TextField: UITextField!
    @IBOutlet weak var oldPin4TextField: UITextField!
    
    @IBOutlet weak var newPin1TextField: UITextField!
    @IBOutlet weak var newPin2TextField: UITextField!
    @IBOutlet weak var newPin3TextField: UITextField!
    @IBOutlet weak var newPin4TextField: UITextField!
    
    @IBOutlet weak var confirmNewPin1TextField: UITextField!
    @IBOutlet weak var confirmNewPin2TextField: UITextField!
    @IBOutlet weak var confirmNewPin3TextField: UITextField!
    @IBOutlet weak var confirmNewPin4TextField: UITextField!
    
    // MARK: - Instance properties
    
    let changePinVM = ChangePinVM()
    
    // MARK: - Helper methods
    
    private func resetPin() {
        DispatchQueue.main.async {
            self.oldPin1TextField.text = ""
            self.oldPin2TextField.text = ""
            self.oldPin3TextField.text = ""
            self.oldPin4TextField.text = ""
            
            self.newPin1TextField.text = ""
            self.newPin2TextField.text = ""
            self.newPin3TextField.text = ""
            self.newPin4TextField.text = ""
            
            self.confirmNewPin1TextField.text = ""
            self.confirmNewPin2TextField.text = ""
            self.confirmNewPin3TextField.text = ""
            self.confirmNewPin4TextField.text = ""
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func oldPin1EditingChanged(_ sender: UITextField) {
        oldPin2TextField.becomeFirstResponder()
        oldPin1TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        oldPin1TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func oldPin2EditingChanged(_ sender: UITextField) {
        oldPin3TextField.becomeFirstResponder()
        oldPin2TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        oldPin2TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func oldPin3EditingChanged(_ sender: UITextField) {
        oldPin4TextField.becomeFirstResponder()
        oldPin3TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        oldPin3TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func oldPin4EditingChanged(_ sender: UITextField) {
        newPin1TextField.becomeFirstResponder()
        oldPin4TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        oldPin4TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func newPin1EditingChanged(_ sender: UITextField) {
        newPin2TextField.becomeFirstResponder()
        newPin1TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        newPin1TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func newPin2EditingChanged(_ sender: UITextField) {
        newPin3TextField.becomeFirstResponder()
        newPin2TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        newPin2TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func newPin3EditingChanged(_ sender: UITextField) {
        newPin4TextField.becomeFirstResponder()
        newPin3TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        newPin3TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func newPin4EditingChanged(_ sender: UITextField) {
        confirmNewPin1TextField.becomeFirstResponder()
        newPin4TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        newPin4TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmNewPin1EditingChanged(_ sender: UITextField) {
        confirmNewPin2TextField.becomeFirstResponder()
        confirmNewPin1TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmNewPin1TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmNewPin2EditingChanged(_ sender: UITextField) {
        confirmNewPin3TextField.becomeFirstResponder()
        confirmNewPin2TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmNewPin2TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmNewPin3EditingChanged(_ sender: UITextField) {
        confirmNewPin4TextField.becomeFirstResponder()
        confirmNewPin3TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmNewPin3TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func confirmNewPin4EditingChanged(_ sender: UITextField) {
        confirmNewPin4TextField.resignFirstResponder()
        confirmNewPin4TextField.layer.borderColor = #colorLiteral(red: 0.8705882353, green: 0.8705882353, blue: 0.8705882353, alpha: 1).cgColor
        confirmNewPin4TextField.layer.borderWidth = 1.0
    }
    
    @IBAction func saveButtonAction(_ sender: Any) {
        
        var data = [
            oldPin1TextField.text ?? "",
            oldPin2TextField.text ?? "",
            oldPin3TextField.text ?? "",
            oldPin4TextField.text ?? ""
        ]
        
        data.append(newPin1TextField.text ?? "")
        data.append(newPin2TextField.text ?? "")
        data.append(newPin3TextField.text ?? "")
        data.append(newPin4TextField.text ?? "")
        
        data.append(confirmNewPin1TextField.text ?? "")
        data.append(confirmNewPin2TextField.text ?? "")
        data.append(confirmNewPin3TextField.text ?? "")
        data.append(confirmNewPin4TextField.text ?? "")
        
        let newPin = newPin1TextField.text! + newPin2TextField.text! + newPin3TextField.text! + newPin4TextField.text!
        
        let confirmNewPin = confirmNewPin1TextField.text! + confirmNewPin2TextField.text! + confirmNewPin3TextField.text! + confirmNewPin4TextField.text!
        
        data.append(newPin)
        data.append(confirmNewPin)
        
        let validationResponse = changePinVM.isValidText(data)
        
        if validationResponse.2 {
            DispatchQueue.main.async {
                self.newPin1TextField.text = ""
                self.newPin2TextField.text = ""
                self.newPin3TextField.text = ""
                self.newPin4TextField.text = ""
                
                self.confirmNewPin1TextField.text = ""
                self.confirmNewPin2TextField.text = ""
                self.confirmNewPin3TextField.text = ""
                self.confirmNewPin4TextField.text = ""
            }
        }
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        callChangePinAPI()
    }
}

// MARK: - API Call

extension ChangePinVC {
    private func callChangePinAPI() {
        let oldPin = oldPin1TextField.text! + oldPin2TextField.text! + oldPin3TextField.text! + oldPin4TextField.text!
        
        let newPin = newPin1TextField.text! + newPin2TextField.text! + newPin3TextField.text! + newPin4TextField.text!
        
        let confirmNewPin = confirmNewPin1TextField.text! + confirmNewPin2TextField.text! + confirmNewPin3TextField.text! + confirmNewPin4TextField.text!
        
        let parameters = [
            "currentMpin": oldPin,
            "mpin": newPin,
            "confirmMpin": confirmNewPin
        ]
        
        changePinVM.changePinAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.pop()
                }
            } else {
                self.resetPin()
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - Text field delegate methods

extension ChangePinVC: UITextFieldDelegate {
    
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
