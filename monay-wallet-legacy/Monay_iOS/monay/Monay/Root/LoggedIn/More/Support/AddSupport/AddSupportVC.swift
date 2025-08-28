//
//  AddSupportVC.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddSupportVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var emailTextField: CustomTextField!
    @IBOutlet weak var messageTextView: KMPlaceholderTextView!
    
    // MARK: - Instance properties
    
    let addSupportVM = AddSupportVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
     // MARK: - Private helper methods
    
    private func initialSetup() {
        let email = Authorization.shared.userCredentials.email.value
        emailTextField.text = email
    }
    
    // MARK: - IBAction methods
    
    @IBAction func sendButtonAction(_ sender: Any) {
        
        let data = [
            messageTextView.text ?? ""
        ]
        
        let validationResponse = addSupportVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callSupportAPI()
    }
}

// MARK: - API Calling

extension AddSupportVC {
    private func callSupportAPI() {
        
        let userType = Authorization.shared.userCredentials.userType ?? .user
        
        let parameters: HTTPParameters = [
            APIKey.message: messageTextView.text ?? ""
        ]
        
        addSupportVM.supportAPI(userType: userType, parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.pop()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}
