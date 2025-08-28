//
//  AddNewCardVC.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ActionSheetPicker_3_0

class AddNewCardVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var cardNumberTextField: ACFloatingTextfield!
    @IBOutlet weak var nameOnCardTextField: ACFloatingTextfield!
    @IBOutlet weak var expiryDateTextField: ACFloatingTextfield!
    @IBOutlet weak var monthButton: UIButton!
    @IBOutlet weak var yearButton: UIButton!
    @IBOutlet weak var cvvTextField: ACFloatingTextfield!
    
    // MARK: - Instance properties
    
    let addNewCardVM = AddNewCardVM()
    var onCompleteAddCard: (() -> Void)?
    var onCrossClick: (() -> Void)?
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupData()
        configure()
    }
    
    private func setupData() {
        self.addNewCardVM.currentYear = getCurrentYear()
        self.addNewCardVM.currentMonth = getCurrentMonth()
    }
    
    private  func configure() {
        creditCardInput().groupSeparater = " "
        creditCardInput().initWithCardNumber(cardNumberTextField, expDateField: nil, cvvField: cvvTextField, cardLogo: nil)
    }
    
    private func cardManagement() {
        let cardNumber = cardNumberTextField.text ?? ""
        
        let data = [
            nameOnCardTextField.text ?? "",
            cardNumber
        ]
        
        let validationResponse = addNewCardVM.isValidText(data)
        
        if !validationResponse.0 {
            self.showAlertWith(message: validationResponse.1)
            return
        }
        
        let expiryDateTextField = self.expiryDateTextField.text ?? ""
        guard !expiryDateTextField.isEmpty else {
          return showAlertWith(message: LocalizedKey.messageSelectExpiryDate.value)
        }
        
        let expirationDate = expiryDateTextField.components(separatedBy: "/")
        
        guard expirationDate.count > 1, !expirationDate[1].isEmpty else {
          return showAlertWith(message: LocalizedKey.messageEnterValidExpiryDate.value)
        }
        
        let expMonth = expirationDate[0]
        let expYear = expirationDate[1]
        
        if addNewCardVM.currentYear > Int(expYear)! {
            return showAlertWith(message: LocalizedKey.messageEnterValidExpiryYear.value)
        } else if addNewCardVM.currentYear == Int(expYear)!, Int(expMonth)! < addNewCardVM.currentMonth {
            return showAlertWith(message: LocalizedKey.messageEnterValidExpiryMonth.value)
        } else if Validator.emptyString(cvvTextField.text ?? "") {
          return showAlertWith(message: LocalizedKey.messageEnterCVV.value)
        }
        
        if Validator.filter(string: cvvTextField.text).count < 3 {
          return showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
        } else if creditCardInput().cardPatternInfo.cardType == CreditCardType.AmericanExpress.rawValue,
            Validator.filter(string: cvvTextField.text).count < 4 {
            return showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
        }
        
        callAddCardAPI(epiryMonth: expMonth, expiryYear: expYear, cvv: cvvTextField.text ?? "")
    }
    
    // MARK: - IBAction methods
    @IBAction func crossButtonAction(_ sender: Any) {
        dismiss()
        self.onCrossClick?()
    }
    
    @IBAction func infoButtonAction(_ sender: Any) {
      showAlertWith(message: LocalizedKey.messageCVVInfo.value)
    }
    
    @IBAction func addCardButtonAction(_ sender: Any) {
        cardManagement()
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
        addNewCardVM.currentMonth = getCurrentMonth()
        
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        var years: [String] = []
        
        dateFormatter.dateFormat = DateFormate.yyyy.rawValue
        var comps = DateComponents()
        let kMinYear = getCurrentYear()
        let kMaxYear = kMinYear + 50
        addNewCardVM.currentYear = kMinYear
        
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

// MARK: - API Calling

extension AddNewCardVC {
    private func callAddCardAPI(epiryMonth: String, expiryYear: String, cvv: String) {
        
        var cardNumber = cardNumberTextField.text ?? ""
        cardNumber = cardNumber.replacingOccurrences(of: " ", with: "")
        
        let parameters: HTTPParameters = [
            "cardNumber": cardNumber,
            "nameOnCard": nameOnCardTextField.text ?? "",
            "month": epiryMonth,
            "year": expiryYear,
            "cvv": cvv
        ]
        
        addNewCardVM.addCardAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.dismiss()
                    self.onCompleteAddCard?()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

extension AddNewCardVC: UITextFieldDelegate {
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
