//
//  EditProfileVC.swift
//  Monay
//
//  Created by WFH on 12/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ActionSheetPicker_3_0

class EditProfileVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userProfileImageView: UIImageView!
    @IBOutlet weak var firstnameTextField: ACFloatingTextfield!
    @IBOutlet weak var lastnameTextField: ACFloatingTextfield!
    @IBOutlet weak var emailTextField: ACFloatingTextfield!
    @IBOutlet weak var mobileNumberTextField: ACFloatingTextfield!
    @IBOutlet weak var countryCodeLabel: UILabel!
    @IBOutlet weak var companyNameTextfield: ACFloatingTextfield!
    @IBOutlet weak var cribNumberTextfield: ACFloatingTextfield!
    @IBOutlet weak var registrationNoTextfield: ACFloatingTextfield!
    @IBOutlet weak var companyView: UIView!
    @IBOutlet weak var cribView: UIView!
    @IBOutlet weak var registrationView: UIView!
    @IBOutlet weak var emailView: UIView!
    @IBOutlet weak var verifyEmailButton: UIButton!
    @IBOutlet weak var changeNumberButton: UIButton!
    
    // MARK: - Instance properties
    
    let editProfileVM = EditProfileVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    private func initialSetup() {
        setupUI()
        guard Authorization.shared.userCredentials != nil else { return }
        setupData()
    }
    
    private func setupUI() {
        let userType = Authorization.shared.userCredentials.userType ?? .user
      [companyView, registrationView, cribView].forEach({ $0?.isHidden = (userType == .user || userType == .secondaryUser)})
        
        /*
        if let country = CountryPicker.countryFor(region: Locale.current.regionCode) {
            countryCodeLabel.text = country.phoneCode
        } */
        
        countryCodeLabel.text = Authorization.shared.userCredentials.countryCode.value
        
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.customFont(style: .bold, size: .custom(12)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
      let verifyEmailAttributedString = NSMutableAttributedString(string: LocalizedKey.verifyEmail.value, attributes: attributes)
        verifyEmailButton.setAttributedTitle(verifyEmailAttributedString, for: .normal)
        
      let changeNumberAttributedString = NSMutableAttributedString(string: LocalizedKey.changeNumber.value, attributes: attributes)
        changeNumberButton.setAttributedTitle(changeNumberAttributedString, for: .normal)
    }
    
  private func setupData() {
        if let userCredentials = Authorization.shared.userCredentials {
            let profileString = userCredentials.profileImage.value
            let profileUrl = URL(string: profileString)
            userProfileImageView.setImageWithPlaceholder(with: profileUrl, placeholderImage: #imageLiteral(resourceName: "ic_place_holder"))
            
            firstnameTextField.text = "\(userCredentials.firstName.value)"
            lastnameTextField.text = "\(userCredentials.lastName.value)"

            emailTextField.text = userCredentials.email.value
            countryCodeLabel.text = userCredentials.countryCode.value
            mobileNumberTextField.text = userCredentials.phoneNumber.value
            
            let isEmailVerified = userCredentials.isEmailVerified ?? false
            emailTextField.isUserInteractionEnabled = !isEmailVerified
            emailView.backgroundColor = isEmailVerified ? #colorLiteral(red: 0.9761945605, green: 0.9763310552, blue: 0.9761514068, alpha: 1) : .white
            
            if isEmailVerified {
                
                let attributes: [NSAttributedString.Key: Any] = [
                    .font: UIFont.customFont(style: .bold, size: .custom(12)),
                    .foregroundColor: Color.blue,
                    .underlineStyle: NSUnderlineStyle.single.rawValue
                ]
                
              let verifyEmailAttributedString = NSMutableAttributedString(string: LocalizedKey.changeEmail.value, attributes: attributes)
                verifyEmailButton.setAttributedTitle(verifyEmailAttributedString, for: .normal)
            } else {
                
                let attributes: [NSAttributedString.Key: Any] = [
                    .font: UIFont.customFont(style: .bold, size: .custom(12)),
                    .foregroundColor: Color.blue,
                    .underlineStyle: NSUnderlineStyle.single.rawValue
                ]
                
                let verifyEmailAttributedString = NSMutableAttributedString(string: LocalizedKey.verifyEmail.value, attributes: attributes)
                verifyEmailButton.setAttributedTitle(verifyEmailAttributedString, for: .normal)
            }
            
            let userType = Authorization.shared.userCredentials.userType ?? .user
            if userType == .merchant {
                companyNameTextfield.text = userCredentials.companyName.value
                cribNumberTextfield.text = userCredentials.taxId.value
                registrationNoTextfield.text = userCredentials.registrationNumber.value
            }
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func countryCodeButtonAction(_ sender: Any) {
        // routeToCountryPicker()
    }
    
    @IBAction func cameraButtonAction(_ sender: Any) {
        addImagePickerOnController(true)
    }
    
    @IBAction func updateButtonAction(_ sender: Any) {
        
        view.endEditing(true)
        
        var data = [
            firstnameTextField.text ?? "",
            lastnameTextField.text ?? "",
            emailTextField.text ?? ""
        ]
        
        let userType = Authorization.shared.userCredentials.userType ?? .user
        if userType == .merchant {
            data.append(companyNameTextfield.text ?? "")
            data.append(cribNumberTextfield.text ?? "")
            data.append(registrationNoTextfield.text ?? "")
        }
        
        let validationResponse = editProfileVM.isValidText(data, userType: userType)
        
        if !validationResponse.0 {
            showAlertWith(message: validationResponse.1)
            return
        }
        
        callUploadMediaAPI()
    }
    
    @IBAction func verifyEmailButtonAction(_ sender: Any) {
        guard let userCredentials = Authorization.shared.userCredentials else {
            return
        }
      
        let savedEmail = userCredentials.email.value
        let newEmail = emailTextField.text ?? ""
        
        let isValidate = editProfileVM.isSimilar(savedEmail: savedEmail, newEmail: newEmail)
        guard isValidate.0 else {
            return showAlertWith(message: isValidate.1)
        }
        
        let isEmailVerified = userCredentials.isEmailVerified ?? false
        editProfileVM.changeMobileOrEmailType = .email
      
        if isEmailVerified {  // Change email
            callResendOTPAPI()
        } else { // Verify email
            callSendEmailVerificationCodeAPI()
        }
    }
    
    @IBAction func changeNumberButtonAction(_ sender: Any) {
        editProfileVM.changeMobileOrEmailType = .mobile
        callResendOTPAPI()
    }
}

// MARK: - UIImagePickerControllerDelegate

extension EditProfileVC: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
        if let pickedImage = info[UIImagePickerController.InfoKey.editedImage] as? UIImage {
            
            if let imageData = pickedImage.jpegData(compressionQuality: 1.0) {
                
                let imageSize = Double(imageData.count) / 1024.0 / 1024.0
                let validationResponse = self.editProfileVM.isValidFileSize(size: imageSize)
                
                if validationResponse.0 {
                    self.userProfileImageView.image = pickedImage
                } else {
                    showAlertWith(message: validationResponse.1)
                }
            }
        }
        
        picker.dismiss(animated: true, completion: nil)
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true, completion: nil)
    }
}

// MARK: - API Calling

extension EditProfileVC {
    
    private func callUploadMediaAPI() {
        
        let image = userProfileImageView.image ?? #imageLiteral(resourceName: "ic_place_holder")
        let imageData = image.pngData() ?? Data()
        
        editProfileVM.uploadMediaAPI(data: imageData) { [weak self] (success, message, basePath) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.callUpdateProfileAPI(basePath: basePath)
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callUpdateProfileAPI(basePath: String) {
        
        var parameters: HTTPParameters = [
            "profilePicture": basePath,
            "firstName": firstnameTextField.text ?? "",
            "lastName": lastnameTextField.text ?? "",
            "phoneNumberCountryCode": countryCodeLabel.text ?? "",
            "phoneNumber": mobileNumberTextField.text ?? "",
            "email": emailTextField.text ?? ""
        ]
        
        let userType = Authorization.shared.userCredentials.userType ?? .user
        if userType == .merchant {
            parameters["companyName"] = companyNameTextfield.text ?? ""
            parameters["taxId"] = cribNumberTextfield.text ?? ""
            parameters["chamberOfCommerce"] = registrationNoTextfield.text ?? ""
        }
        
        editProfileVM.updateProfileAPI(parameters: parameters) { [weak self] (success, message, imageUrl) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    
                    if let profileUrl = URL(string: imageUrl) {
                        Authorization.shared.userCredentials.profileImage.value = "\(profileUrl)"
                        Authorization.shared.userCredentials.firstName.value = self.firstnameTextField.text ?? ""
                        Authorization.shared.userCredentials.lastName.value = self.lastnameTextField.text ?? ""
                        Authorization.shared.userCredentials.email.value = self.emailTextField.text ?? ""
                        Authorization.shared.userCredentials.phoneNumber.value = self.mobileNumberTextField.text ?? ""
                        Authorization.shared.userCredentials.companyName.value = self.companyNameTextfield.text ?? ""
                        Authorization.shared.userCredentials.taxId.value = self.cribNumberTextfield.text ?? ""
                        Authorization.shared.userCredentials.registrationNumber.value = self.registrationNoTextfield.text ?? ""
                        Authorization.shared.synchronize()
                    }
                    self.pop()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callSendEmailVerificationCodeAPI() {
        
      let userType = Authorization.shared.userCredentials.userType ?? .user
      
        editProfileVM.sendEmailVerificationCodeAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    
                    let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
                    viewController.verificationVM.countryCode = self.countryCodeLabel.text!
                    viewController.verificationVM.phoneNumber = ""
                    viewController.verificationVM.email = self.emailTextField.text!
                    viewController.verificationVM.redirectFrom = .editProfile
                    viewController.verificationVM.userType = userType
                    viewController.verificationVM.changeMobileOrEmailType = self.editProfileVM.changeMobileOrEmailType
                    self.pushVC(viewController)
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callResendOTPAPI() {
        
        let userType = Authorization.shared.userCredentials.userType ?? .user
        let email = emailTextField.text ?? ""
        let mobile = mobileNumberTextField.text ?? ""
        let userName = editProfileVM.changeMobileOrEmailType == .email ? email : mobile
        let countryCode = editProfileVM.changeMobileOrEmailType == .email ? "" : (countryCodeLabel.text ?? "")
        
        let parameters: HTTPParameters = [
            "phoneNumberCountryCode": countryCode,
            "username": userName
        ]
        
        editProfileVM.resendOTPAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
              
              self.showAlertWith(message: message) { [weak self] in
                
                guard let `self` = self else {
                    return
                }
               
                switch self.editProfileVM.changeMobileOrEmailType {
                case .mobile:
                    
                    let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
                    viewController.verificationVM.countryCode = self.countryCodeLabel.text ?? ""
                    viewController.verificationVM.phoneNumber = mobile
                    viewController.verificationVM.email = ""
                    viewController.verificationVM.redirectFrom = .editProfile
                    viewController.verificationVM.userType = userType
                    viewController.verificationVM.changeMobileOrEmailType = .mobile
                    self.pushVC(viewController)
                case .email:
                    let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
                    viewController.verificationVM.countryCode = self.countryCodeLabel.text ?? ""
                    viewController.verificationVM.phoneNumber = ""
                    viewController.verificationVM.email = email
                    viewController.verificationVM.redirectFrom = .editProfile
                    viewController.verificationVM.userType = userType
                    viewController.verificationVM.changeMobileOrEmailType = .email
                    self.pushVC(viewController)
                }
                
              }
  
            } else {
                self.showAlertWith(message: message)
            }
            
        }
    }
}

extension EditProfileVC: UITextFieldDelegate {
  
  func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool { 
    switch textField {
    case firstnameTextField, lastnameTextField:
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
