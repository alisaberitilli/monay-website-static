//
//  AddedCardCell.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddedCardCell: UITableViewCell {
  
  static let identifier = "AddedCardCell"
  // MARK: - IBOutlet properties
  
  @IBOutlet weak var cardImageView: UIImageView!
  @IBOutlet weak var cardTitleLabel: UILabel!
  @IBOutlet weak var cardNumberLabel: UILabel!
  @IBOutlet weak var checkUncheckButton: UIButton!
  @IBOutlet weak var payContainerView: UIView!
  @IBOutlet weak var heightConstraintPayView: NSLayoutConstraint!
  @IBOutlet weak var constraintTopPayView: NSLayoutConstraint!
  @IBOutlet weak var cvvTextField: ACFloatingTextfield!
  @IBOutlet weak var payButton: UIButton!
  
  // MARK: - Instance properties
  
  let addedCardCellVM = AddedCardCellVM()
 // var callbackCheckUncheck: ((Int) -> Void)?
  var callbackAmountFieldValidation: (() -> Void)?
  var callbackAlertMessage: ((String) -> Void)?
  var callbackPay: ((Int) -> Void)?
  
  // MARK: - Helper methods
  
  func configure(card: Card) {
      selectionStyle = .none
      
      let cardIconString = card.cardIconUrl ?? ""
      if let cardIconUrl = URL(string: cardIconString) {
          cardImageView.setImage(with: cardIconUrl)
      }
      
      if let cardName = card.nameOnCard {
          cardTitleLabel.text = cardName
      }
      
      if let last4Digit = card.last4Digit {
        cardNumberLabel.text = "\(LocalizedKey.secureText.value) \(last4Digit)"
      }
      checkUncheckButton.isSelected = card.isSelected
      
      if card.isSelected {
          payContainerView.isHidden = false
          heightConstraintPayView.constant = 44
          constraintTopPayView.constant = 15
      } else {
          payContainerView.isHidden = true
          heightConstraintPayView.constant = 0.0
          constraintTopPayView.constant = 0.0
      }
  }
  
  // MARK: - IBAction methods
  
  @IBAction func checkUncheckButtonAction(_ sender: Any) {
     // callbackCheckUncheck?(tag)
  }
  
  @IBAction func payButtonAction(_ sender: Any) {
      endEditing(true)
      
      callbackAmountFieldValidation?()
      
      let data = [
          cvvTextField.text ?? ""
      ]
      
      let validationResponse = addedCardCellVM.isValidText(data)
      
      if !validationResponse.0 {
          callbackAlertMessage?(validationResponse.1)
          return
      }
      
      callbackPay?(tag)
  }
}

// MARK: - Text field delegate methods

extension AddedCardCell: UITextFieldDelegate {
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
        let text = textField.text ?? ""
        let textstring = (text as NSString).replacingCharacters(in: range, with: string)
        let length = textstring.count
        if length > 4 {
            return false
        }
        return true
    }
}

class AddedCardCellVM {
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterCVV.value)
        } else if Validator.filter(string: inputData[0]).count != 3 && Validator.filter(string: inputData[0]).count != 4 {
          return(false, LocalizedKey.messageEnterValidCVV.value)
        }
        
        return (true, "")
    }
}
