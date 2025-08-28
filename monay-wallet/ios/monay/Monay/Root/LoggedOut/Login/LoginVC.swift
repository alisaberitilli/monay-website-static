//
//  LoginVC.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import TTTAttributedLabel
import ActionSheetPicker_3_0
// import ZendeskSDK // Temporarily disabled
// import ZendeskCoreSDK // Temporarily disabled

class LoginVC: UIViewController, TTTAttributedLabelDelegate {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var fogotPasswordButton: UIButton!
    @IBOutlet weak var mobileTextField: ACFloatingTextfield!
    @IBOutlet weak var emailTextField: ACFloatingTextfield!
    @IBOutlet weak var passwordTextField: ACFloatingTextfield!
    @IBOutlet weak var showPasswordButton: UIButton!
    @IBOutlet weak var countryCodeLabel: UILabel!
    @IBOutlet weak var useEmailButton: UIButton!
    @IBOutlet weak var signupButton: UIButton!
    @IBOutlet weak var phoneCodeView: UIView!
    @IBOutlet weak var emailView: UIView!
    @IBOutlet weak var mobileView: UIView!

    // MARK: - Instance properties
    
    let loginVM = LoginVM()

    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.navigationController?.navigationBar.isHidden = true
        
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupUI()
        callGeneralSettingAPI()
        if self.loginVM.countryList.isEmpty {
          callGetCountryListAPI()
        }
    }
    
    private func setupUI() {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.customFont(style: .regular, size: .custom(14)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
        let attributeString = NSMutableAttributedString(string: LocalizedKey.forgotPassword.value, attributes: attributes)
        fogotPasswordButton.setAttributedTitle(attributeString, for: .normal)
        
        let useEmailAttributeString = NSMutableAttributedString(string: UserIDMode.email.rawValue, attributes: attributes)
        useEmailButton.setAttributedTitle(useEmailAttributeString, for: .normal)
        
        let signUpAttributeString = NSMutableAttributedString(string: LocalizedKey.signup.value, attributes: attributes)
        signupButton.setAttributedTitle(signUpAttributeString, for: .normal)
    }

    @IBAction func forgotPasswordButton_Action(_ sender: UIButton) {
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: ForgotPasswordVC.self)
        viewController.forgotPasswordVM.countryList = self.loginVM.countryList
        self.pushVC(viewController)
    }
    
    @IBAction func proceedButton_Action(_ sender: UIButton) {
        
        let emailMobile = loginVM.curentUserIDMode == .email ? emailTextField.text : mobileTextField.text
      
        let data = [
            emailMobile ?? "",
            passwordTextField.text ?? ""
        ]
        
        let validationResponse = loginVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        view.endEditing(true)
        
        callLoginAPI()
    }
    
    @IBAction func showPasswordButtonAction(_ sender: Any) {
        showPasswordButton.isSelected = !showPasswordButton.isSelected
        passwordTextField.isSecureTextEntry = !passwordTextField.isSecureTextEntry
    }
    
    @IBAction func countryCodeButtonAction(_ sender: Any) {
        if self.loginVM.countryList.count == 0 {
            callGetCountryListAPI()
            return
        }
        
        let countryCode = self.loginVM.countryList.map { $0.countryCallingCode ?? "" }
        let countryname = self.loginVM.countryList.map { $0.name ?? "" }
        let result = zip(countryCode, countryname).map { "\($0) \($1)" }
        
        ActionSheetStringPicker.show(withTitle: LocalizedKey.selectCountry.value, rows: result, initialSelection: 0, doneBlock: { _, index, _ in
             self.countryCodeLabel.text = "\(self.loginVM.countryList[index].countryCallingCode!)"
          }, cancel: { _ in return }, origin: self.view)
      }
    
    @IBAction func backButtonAction(_ sender: Any) {
        pop()
    }
    
    @IBAction func useEmailButtonAction(_ sender: Any) {
    }
    
    @IBAction func signUpButtonAction(_ sender: Any) {
        
        self.definesPresentationContext = true
        self.providesPresentationContextTransitionStyle = true
        
        self.overlayBlurredBackgroundView()
        let viewController = StoryboardScene.Account.instantiateViewController(withClass: UserSelectionVC.self)
        viewController.onCompleteUserSelection = { [weak self] userType in
            self?.removeBlurredBackgroundViewView()
            let viewController = StoryboardScene.Account.instantiateViewController(withClass: MobileNumberVC.self)
            viewController.mobileNumberVM.usertype = userType
            viewController.mobileNumberVM.countryList = self!.loginVM.countryList
            viewController.mobileNumberVM.redirectFrom = .signup
            viewController.mobileNumberVM.countryPhoneCode = self?.countryCodeLabel.text ?? ""
            self?.pushVC(viewController)
        }
        
        viewController.onCrossClick = {
            self.removeBlurredBackgroundViewView()
        }
        
        viewController.modalPresentationStyle = .overFullScreen
        self.present(viewController)
    }
  
    @IBAction func switchUserButton(_ sender: UIButton) {
      sender.pulsate()
      [mobileView, emailView].forEach({ $0?.isHidden = true})
      _ = mobileTextField.resignFirstResponder()
      _ = emailTextField.resignFirstResponder()

      guard let senderCurrentTitle = sender.titleLabel?.text else { return }
      loginVM.curentUserIDMode = UserIDMode(rawValue: senderCurrentTitle) ?? UserIDMode.email
      
      var senderTitle = ""
      
      switch loginVM.curentUserIDMode {
        
      case .mobile:
        senderTitle = UserIDMode.email.rawValue
        phoneCodeView.isHidden = false
        mobileView.isHidden = false

      case .email:
        senderTitle = UserIDMode.mobile.rawValue
        phoneCodeView.isHidden = true
        emailView.isHidden = false
      }
      
      let attributes: [NSAttributedString.Key: Any] = [
          .font: UIFont.customFont(style: .regular, size: .custom(14)),
          .foregroundColor: Color.blue,
          .underlineStyle: NSUnderlineStyle.single.rawValue
      ]
      
      let useEmailAttributeString = NSMutableAttributedString(string: senderTitle, attributes: attributes)
      useEmailButton.setAttributedTitle(useEmailAttributeString, for: .normal)

    }

}

// MARK: - API Calling

extension LoginVC {
    private func callLoginAPI() {
        
        let username = loginVM.curentUserIDMode == .email ? emailTextField.text : mobileTextField.text

        let parameters: HTTPParameters = [
          "phoneCountryCode": countryCodeLabel.text!,
            "username": username ?? "",
            "password": passwordTextField.text ?? "",
            "deviceType": kDeviceTypeIOS,
            "firebaseToken": appDelegate.deviceToken
        ]
        
        loginVM.loginAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                appDelegate.isLoggedIn = true
                appDelegate.setRootViewConroller()
                
            } else {
                
              if message == LocalizedKey.accountInactive.value {
                    
                    ContactSupport.showWith { [weak self] in
                        
                        guard let `self` = self else {
                            return
                        }
                        
                        // Zendesk RequestUi temporarily disabled
                        // let config = RequestUiConfiguration()
                        // config.tags = [LocalizedKey.blockedUser.value]
                        // let viewController = RequestUi.buildRequestList(with: [config])
                        
                        // Zendesk temporarily disabled
                        // let identity = Identity.createAnonymous(name: username, email: username)
                        // Zendesk.instance?.setIdentity(identity)
                        
                        self.navigationController?.navigationBar.barTintColor = #colorLiteral(red: 0.03137254902, green: 0.6666666667, blue: 1, alpha: 1)
                        self.navigationController?.navigationBar.tintColor = .white
                        if #available(iOS 13.0, *) {
                            self.navigationController?.navigationBar.standardAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
                        } else {
                            self.navigationController?.navigationBar.titleTextAttributes = [.foregroundColor: UIColor.white]
                        }
                        
                        self.navigationController?.navigationBar.isHidden = false
                        self.pushVC(viewController)
                        
                    }
                    
                } else {
                    self.showAlertWith(message: message)
                }
            }
        }
    }
    
    // for dynamic country code
    
    private func callGeneralSettingAPI() {
        loginVM
            .getGeneralSettings { [weak self] (success, message, settingData) in
                
                if success {
                    Authorization.shared.generalSetting = GeneralSettings(JSON: settingData)
                } else {
                    self?.showAlertWith(message: message) { [weak self] in
                        self?.callGeneralSettingAPI()
                    }
                }
            }
    }
     
        private func callGetCountryListAPI() {
            
            loginVM.countryList { [weak self] (success, message) in
                
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

extension LoginVC: UITextFieldDelegate {
    
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
            
        case mobileTextField:
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
