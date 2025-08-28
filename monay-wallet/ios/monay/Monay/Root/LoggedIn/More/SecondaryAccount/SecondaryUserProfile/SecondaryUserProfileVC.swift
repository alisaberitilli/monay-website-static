//
//  SecondaryUserProfileVC.swift
//  Monay
//
//  Created by Aayushi Bhagat on 09/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class SecondaryUserProfileVC: UIViewController {
  
  // MARK: - @IBOutlet
  @IBOutlet weak var profileImage: UIImageView!
  @IBOutlet weak var userNameLabel: UILabel!
  @IBOutlet weak var phoneNumber: UILabel!
  @IBOutlet weak var enableAccountButton: UIButton!
  @IBOutlet weak var rantAmountTextField: ACFloatingTextfield!
  @IBOutlet weak var priceLabel: UILabel!

  var viewModel = SecondaryUserProfileVM()
  var delegate: DeleteUserRefreshDelegate?
  var getID = ""
  
  // MARK: - VIEWCONTROLER LIFE CYCLE

  override func viewDidLoad() {
      super.viewDidLoad()

    self.callSecondaryUserAPI()
  }
  
  private func callSecondaryUserAPI() {
    viewModel.secondaryUserProfileAPI(id: self.getID) { [weak self] (success, message) in
      
      guard let `self` = self else { return }
      
      if success {
        self.setData()
      } else {
        self.showAlertWith(message: message)
      }

    }
  }
  
  func setData() {
    let name = "\(self.viewModel.secondaryUsers?.user?.firstName ?? "") \(self.viewModel.secondaryUsers?.user?.lastName ?? "")"
    self.userNameLabel.text = name
    let number = self.viewModel.secondaryUsers?.user?.phoneNumber ?? ""
    self.phoneNumber.text =  "\(self.viewModel.secondaryUsers?.user?.phoneNumberCountryCode ?? "") \(number.customFormatted)"
    let profileString = self.viewModel.secondaryUsers?.user?.profilePictureUrl ?? ""
    let profileUrl = URL(string: profileString)
    profileImage.setImageWithPlaceholder(with: profileUrl, placeholderImage: #imageLiteral(resourceName: "ic_place_holder"))
    let getCurrency = Authorization.shared.userCredentials.country?.currencyCode ?? ""
    let getAmount = "\(self.viewModel.secondaryUsers?.remainAmount ?? "0")"
    self.priceLabel.text! = "\(getCurrency) \(getAmount)"
    if self.viewModel.secondaryUsers?.status == "active" {
      self.enableAccountButton.isSelected = true
    } else {
      self.enableAccountButton.isSelected = false
    }
  }
   
  // MARK: - @IBAction Method

  @IBAction func backOnButton(_ sender: UIButton) {
    self.navigationController?.popViewController(animated: true)
  }
  
  @IBAction func enableActionbutton(_ sender: Any) {
    var parameters = HTTPParameters()
      if enableAccountButton.isSelected {
        parameters["status"] = "inactive"
        self.viewModel.secondaryUserProfileUpdateStatusAPI(parameters: parameters, id: self.getID) { [weak self] (success, message) in
          guard let `self` = self else { return }
          if success {
            if message != "" {
              self.showAlertWith(message: message) {
                self.enableAccountButton.isSelected = false
              }
            }
          } else {
            self.showAlertWith(message: message)
          }
        }
        
      } else {
        parameters["status"] = "active"
        self.viewModel.secondaryUserProfileUpdateStatusAPI(parameters: parameters, id: self.getID) { [weak self] (success, message) in
          guard let `self` = self else { return }
          if success {
            if message != "" {
              self.showAlertWith(message: message) {
                self.enableAccountButton.isSelected = true
              }
            }
          } else {
            self.showAlertWith(message: message)
          }
        }
      }
  }
  
  @IBAction func saveActionButton(_ sender: Any) {
    
    let validationResponse = viewModel.isValidText(limit: self.rantAmountTextField.text!)
    
    if !validationResponse.0 {
      showAlertWith(message: validationResponse.1)
      return
    }
    let totalWalletAmount = Float(Authorization.shared.totalWalletAmount) ?? 0
    let limit = Float(self.rantAmountTextField.text ?? "0") ?? 0
    if totalWalletAmount < limit {
      AmountConfirmationPopUpView.show(onView: self.view) { [weak self] (callbackType) in
        
        guard let `self` = self else {
          return
        }
        
        switch callbackType {
        case APIKey.success:
          let viewController = StoryboardScene.Profile.instantiateViewController(withClass: AddMoneyVC.self)
          self.pushVC(viewController)

        default: break
        }
      }
      return
    }
    
    let parameters: HTTPParameters = ["limit": self.rantAmountTextField.text!]
    self.viewModel.secondaryUserProfileRangeAPI(parameters: parameters, id: self.getID) { [weak self] (success, message) in
      
      guard let `self` = self else { return }
      
      if success {
        if message != "" {
          self.showAlertWith(message: message) {
            self.rantAmountTextField.text = ""
            self.callSecondaryUserAPI()
          }
        }
      } else {
        self.showAlertWith(message: message)
      }
    }
  }
  
  @IBAction func removeActionButton(_ sender: Any) {
    
    self.showAlert(message: "Are you sure you want to delete this account?", okTitle: "Ok", cancelTitle: "Cancel") { actionType in
      
      switch actionType {
      case LocalizedKey.ok.value:
        self.viewModel.secondaryUserProfileDeleteAPI(id: self.getID) { [weak self] (success, message) in
          
          guard let `self` = self else { return }
          
          if success {
            self.delegate?.deleteUserDelegate(isDelete: true)
            self.pop()
          } else {
            self.showAlertWith(message: message)
          }
        }
        
      default: break
      }
    }
  }
  
}
