//
//  ScannerVC.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit
import AVFoundation
import ActionSheetPicker_3_0

class ScannerVC: UIViewController {
  
  // MARK: - IBOutlet properties
  
  @IBOutlet weak var scannerView: QRScannerView!
  @IBOutlet weak var countryCodeLabel: UILabel!
  @IBOutlet weak var mobileNumberTextField: ACFloatingTextfield!
  
  var qrData: QRData? = nil {
    didSet {
      
      guard qrData != nil else { return }
      
      let json = self.qrData?.codeString?.getJsonDataDict()
      
      guard let userIdAny = json?[APIKey.userId],
            let userId = userIdAny as? String else {
        showAlertWith(message: LocalizedKey.invalidCode.value) {
          self.viewWillAppear(true)
        }
        return
      }
      self.userLinkAPI(userId)
    }
  }
  
  // MARK: - Instance properties
  
  let scannerVM = ScannerVM()
  
  // MARK: - View controller lifecycle methods
  
  override func viewDidLoad() {
    super.viewDidLoad()
    initialSetup()
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    
    if !scannerView.isRunning {
      scannerView.startScanning()
    }
    
    scannerView.startAnimation()
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    
    if !scannerView.isRunning {
      scannerView.stopScanning()
    }
  }
  
  // MARK: - Private helper methods
  
  private func initialSetup() {
    mobileNumberTextField.attributedPlaceholder = NSAttributedString(string: LocalizedKey.mobileNumber.value,
                                                                     attributes: [NSAttributedString.Key.foregroundColor: UIColor.white])
    
    getCountryListAPI()
    scannerView.delegate = self
    mobileNumberTextField.delegate = self
  }
  
  func toggleTorch(isOn: Bool) {
    guard let device = AVCaptureDevice.default(for: .video) else { return }
    
    if device.hasTorch {
      do {
        try device.lockForConfiguration()
        
        if isOn == true {
          device.torchMode = .on
        } else {
          device.torchMode = .off
        }
        
        device.unlockForConfiguration()
      } catch {
      }
    } else {
    }
  }
  
  private func redirectToVerificationScreen() {
    let viewController = StoryboardScene.Account.instantiateViewController(withClass: VerificationVC.self)
    viewController.verificationVM.countryCode = countryCodeLabel.text!
    viewController.verificationVM.phoneNumber = mobileNumberTextField.text!
    viewController.verificationVM.userType = UserType.secondaryUser
    viewController.verificationVM.redirectFrom = RedirectFrom.scanner
    pushVC(viewController)
  }
  
  @IBAction func crossButtonAction(_ sender: Any) {
    pop()
  }
  
  @IBAction func torchButtonAction(_ sender: UIButton) {
    toggleTorch(isOn: !sender.isSelected)
    sender.isSelected = !sender.isSelected
  }
  
  @IBAction func countryCodeButtonAction(_ sender: Any) {
    if self.scannerVM.countryList.count == 0 {
      getCountryListAPI()
      return
    }
    
    let countryCode = self.scannerVM.countryList.map { $0.countryCallingCode ?? "" }
    let countryname = self.scannerVM
      .countryList.map { $0.name ?? "" }
    let result = zip(countryCode, countryname).map { "\($0) \($1)" }
    
    ActionSheetStringPicker.show(withTitle: LocalizedKey.selectCountry.value, rows: result, initialSelection: 0, doneBlock: { _, index, _ in
      self.countryCodeLabel.text = "\(self.scannerVM.countryList[index].countryCallingCode!)"
    }, cancel: { _ in return }, origin: self.view)
  }
  
  @IBAction func nextButtonAction(_ sender: Any) {
    let data = [
      mobileNumberTextField.text ?? ""
    ]
    
    let validationResponse = scannerVM.isValidText(data)
    
    if !validationResponse.0 {
      return showAlertWith(message: validationResponse.1)
    }
    
    view.endEditing(true)
    callSendOtpAPI()
  }
}

// MARK: - QRScannerViewDelegate

extension ScannerVC: QRScannerViewDelegate {
  func qrScanningDidStop() {
  }
  
  func qrScanningDidFail() {
    showAlertWith(message: LocalizedKey.scanFailed.value)
  }
  
  func qrScanningSucceededWithCode(_ str: String?) {
    self.qrData = QRData(codeString: str)
  }
}

// MARK: - API Calling

extension ScannerVC {
  
  private func getCountryListAPI() {
    scannerVM.countryList { [weak self] (success, message) in
      guard let `self` = self else {
        return
      }
      if !success {
        self.showAlertWith(message: message)
      }
    }
  }
  
  private func userLinkAPI(_ userId: String) {    
    scannerVM.userLinkAPI(userId: userId) { [weak self] (success, message) in
      
      guard let `self` = self else {
        return
      }
      
      if success {
        appDelegate.isLoggedIn = true
        Authorization.shared.isUserLinked = true
        Authorization.shared.synchronize()
        appDelegate.setRootViewConroller()
      } else {
        self.showAlertWith(message: message)
        self.scannerView.startScanning()
        self.scannerView.startAnimation()
      }
    }
  }
  
  private func callSendOtpAPI() {
    
    let parameters: HTTPParameters = [
      "phoneNumberCountryCode": countryCodeLabel.text ?? "",
      "phoneNumber": mobileNumberTextField.text ?? "",
      "userType": "secondaryUser"
    ]
    
    scannerVM.sendOtpAPI(parameters: parameters) { [weak self] (success, message) in
      
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
  
}

extension ScannerVC: UITextFieldDelegate {
    
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
