//
//  SetupVC.swift
//  Monay
//
//  Created by WFH on 14/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SecurityVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var touchIDOrFaceIdSwitch: UISwitch!
    @IBOutlet weak var touchIdOrFaceIdContainerView: UIView!
    @IBOutlet weak var changePinButton: UIButton!
    @IBOutlet weak var forgotPinButton: UIButton!
    @IBOutlet weak var touchIdFaceIdTitleLabel: UILabel!
    
    // MARK: - Instance properties
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupUI()
        biometricSetup()
    }
    
    private func setupUI() {
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.customFont(style: .medium, size: .custom(14)),
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
      let attributeString = NSMutableAttributedString(string: LocalizedKey.changePin.value, attributes: attributes)
        changePinButton.setAttributedTitle(attributeString, for: .normal)
        
      let forgotPinAttributeString = NSMutableAttributedString(string: LocalizedKey.forgotPin.value, attributes: attributes)
        forgotPinButton.setAttributedTitle(forgotPinAttributeString, for: .normal)
    }
    
    private func biometricSetup() {
        
        if BiometricAuthenticator.shared.isTouchIdDevice() {
          touchIdFaceIdTitleLabel.text = LocalizedKey.messageSecureAccessMonay.value
          // "Secure access to Monay wallet by using the Touch ID to unlock your phone."
            
            if BiometricAuthenticator.shared.touchIDAvailable() {
                
                let isBiometricEnable = AppKey.User.isBiometricEnable.valueAsBool
                touchIDOrFaceIdSwitch.isOn = isBiometricEnable
            } else {
                touchIDOrFaceIdSwitch.isOn = false
            }
            
        } else if BiometricAuthenticator.shared.isFaceIdDevice() {
            touchIdFaceIdTitleLabel.text =  LocalizedKey.messageSecureAccessMonay.value
            // "Secure access to Monay wallet by using the Face ID to unlock your phone."
            
            if BiometricAuthenticator.shared.faceIDAvailable() {
                
                let isBiometricEnable = AppKey.User.isBiometricEnable.valueAsBool
                touchIDOrFaceIdSwitch.isOn = isBiometricEnable
            } else {
                touchIDOrFaceIdSwitch.isOn = false
            }
            
        } else {
            touchIdOrFaceIdContainerView.isHidden = true
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func changePinButtonAction(_ sender: Any) {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: ChangePinVC.self)
        pushVC(viewController)
    }
    
    @IBAction func forgotPinButtonAction(_ sender: Any) {
        let viewController = StoryboardScene.More.instantiateViewController(withClass: ForgetPinVC.self)
         viewController.forgetPinVM.redirectFrom = .pin
         pushVC(viewController)
    }
    
    @IBAction func touchIdOrFaceIdSwitchAction(_ sender: UISwitch) {
        
        if BiometricAuthenticator.shared.touchIDAvailable() {
            let isOn = sender.isOn
            
            BiometricAuthenticator.authenticateWithBioMetrics(reason: "") { (result) in
                
                switch result {
                case .success:
                    userDefualt.set(isOn, forKey: AppKey.User.isBiometricEnable.rawValue)
                    
                    let isBiometricEnable = AppKey.User.isBiometricEnable.valueAsBool
                    self.touchIDOrFaceIdSwitch.isOn = isBiometricEnable
                    
                case .failure:
                    self.touchIDOrFaceIdSwitch.isOn = !isOn
                }
            }
            
        } else if BiometricAuthenticator.shared.faceIDAvailable() {
            
            let isOn = sender.isOn
            
            BiometricAuthenticator.authenticateWithBioMetrics(reason: "") { (result) in
                
                switch result {
                case .success:
                    userDefualt.set(isOn, forKey: AppKey.User.isBiometricEnable.rawValue)
                    
                    let isBiometricEnable = AppKey.User.isBiometricEnable.valueAsBool
                    self.touchIDOrFaceIdSwitch.isOn = isBiometricEnable
                    
                case .failure:
                    self.touchIDOrFaceIdSwitch.isOn = !isOn
                }
            }
            
        } else {
          showAlertWith(message: LocalizedKey.messageEnableTouchAndFaceId.value)
            touchIDOrFaceIdSwitch.isOn = false
        }
    }
}
