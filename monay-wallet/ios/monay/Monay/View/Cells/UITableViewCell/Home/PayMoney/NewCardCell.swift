//
//  NewCardCell.swift
//  Monay
//
//  Created by WFH on 03/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class NewCardCell: UITableViewCell {
    
    static let identifier = "NewCardCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var nameOnCardTextField: ACFloatingTextfield!
    @IBOutlet weak var cardNumberTextField: ACFloatingTextfield!
    @IBOutlet weak var expiryDateTextField: ACFloatingTextfield!
    @IBOutlet weak var cvvTextField: ACFloatingTextfield!
    @IBOutlet weak var saveCardButton: UIButton!
    @IBOutlet weak var saveThisCardButton: UIButton!
    @IBOutlet weak var payButton: UIButton!
    
    // MARK: - Instance properties
    
    let newCardCellVM = NewCardCellVM()
    var callbackAmountFieldValidation: (() -> Void)?
    var callbackAlertMessage: ((String) -> Void)?
    var callbackCardDetails: ((String, String, String, String, String, String) -> Void)?
    var isCardConfigure = false
    var isAutoTopup = false

    // MARK: - Helper methods
    
    func configure() {
        creditCardInput().groupSeparater = " "
        creditCardInput().initWithCardNumber(cardNumberTextField, expDateField: nil, cvvField: cvvTextField, cardLogo: nil)
        
        newCardCellVM.currentYear = getCurrentYear()
        newCardCellVM.currentMonth = getCurrentMonth()
        isCardConfigure = true
    }
    
    // MARK: - IBAction methods
    
    @IBAction func saveCardButtonAction(_ sender: UIButton) {
        guard !isAutoTopup else { return }
        saveCardButton.isSelected = !sender.isSelected
        saveThisCardButton.isSelected = !sender.isSelected
    }
    
    @IBAction func payButtonAction(_ sender: Any) {
        
        callbackAmountFieldValidation?()
        
        let cardNumber = cardNumberTextField.text ?? ""
        
        let data = [
            nameOnCardTextField.text ?? "",
            cardNumber
        ]
        
        let validationResponse = newCardCellVM.isValidText(data)
        
        if !validationResponse.0 {
            callbackAlertMessage?(validationResponse.1)
            return
        }
        
        let expiryDateTextField = self.expiryDateTextField.text ?? ""
        guard !expiryDateTextField.isEmpty else {
          callbackAlertMessage?(LocalizedKey.messageSelectExpiryDate.value)
            return
        }
        
        let expirationDate = expiryDateTextField.components(separatedBy: "/")
        
        guard expirationDate.count > 1, !expirationDate[1].isEmpty else {
          callbackAlertMessage?(LocalizedKey.messageEnterValidExpiryDate.value)
            return
        }
        
        let expMonth = expirationDate[0]
        let expYear = expirationDate[1]
        let cvv = cvvTextField.text ?? ""
        
        if newCardCellVM.currentYear > Int(expYear)! {
          callbackAlertMessage?(LocalizedKey.messageEnterValidExpiryYear.value)
            return
        } else if newCardCellVM.currentYear == Int(expYear)!, Int(expMonth)! < newCardCellVM.currentMonth {
          callbackAlertMessage?(LocalizedKey.messageEnterValidExpiryMonth.value)
            return
        } else if Validator.emptyString(cvv) {
          callbackAlertMessage?(LocalizedKey.messageEnterCVV.value)
            return
        } else if cvv.count != 3 && cvv.count != 4 {
          callbackAlertMessage?(LocalizedKey.messageEnterValidCVV.value)
            return
        }
        
        if creditCardInput().cardPatternInfo.cardType == CreditCardType.AmericanExpress.rawValue,
            Validator.filter(string: cvvTextField.text).count < 4 {
            callbackAlertMessage?(LocalizedKey.messageEnterValidCVV.value)
            return
        }
        
      let saveCard = saveCardButton.isSelected ? LocalizedKey.yes.value : LocalizedKey.no.value
        callbackCardDetails?(cardNumberTextField.text!, nameOnCardTextField.text!, expMonth, expYear, cvv, saveCard)
    }
    
    @IBAction func expiryMonthYearButton(_ sender: Any) {
      var months = [String]()
      for index in 1...12 {
        if index < 10 {
           let char = "0\(index)"
          months.append(char)
        } else {
          months.append("\(index)")
        }
      }
        newCardCellVM.currentMonth = getCurrentMonth()
        
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        var years: [String] = []
        
        dateFormatter.dateFormat = DateFormate.yyyy.rawValue
        var comps = DateComponents()
        let kMinYear = getCurrentYear()
        let kMaxYear = kMinYear + 50
        newCardCellVM.currentYear = kMinYear
        
        for year in kMinYear..<kMaxYear {
            comps.year = year
            let yearDate = Calendar.current.date(from: comps)
            let yearStr = dateFormatter.string(from: yearDate!)
            years.append(yearStr)
        }
        
        PickerView.showPicker(.textPicker, months: months, years: years) { (_, month, year) in
            self.expiryDateTextField.text = "\(month)/\(year)"
        }
    }
}

extension NewCardCell: UITextFieldDelegate {
  func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
    
    switch textField {
    case nameOnCardTextField:
      var characterSet = CharacterSet.letters
      characterSet = characterSet.union(CharacterSet(charactersIn: " "))
      
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

class NewCardCellVM {
    
    // MARK: - Instance properties
    
    var currentYear = 0
    var currentMonth = 0
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterName.value)
        } else if inputData[0].count < 3 {
          return(false, "Please enter valid name")
        } else if Validator.emptyString(inputData[1]) {
          return(false, LocalizedKey.messageEnterCardNumber.value)
        } else if !creditCardInput().isValid() {
          return(false, LocalizedKey.messageEnterValidCardNumber.value)
        }
        return (true, "")
    }
}
