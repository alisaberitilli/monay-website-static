//
//  TransactionFilterVC.swift
//  Monay
//
//  Created by WFH on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ActionSheetPicker_3_0

class TransactionFilterVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var fromDateTextField: UITextField!
    @IBOutlet weak var toDateTextField: UITextField!
    @IBOutlet weak var nameTextField: ACFloatingTextfield!
    @IBOutlet weak var minPriceTextField: ACFloatingTextfield!
    @IBOutlet weak var maxPriceTextField: ACFloatingTextfield!
    @IBOutlet weak var resetFilterButton: UIButton!
    @IBOutlet weak var transactionTypeTextField: CustomTextField!
    
    // MARK: - Instance properties
    
    var onComplete: (() -> Void)?
    var callbackApply: (() -> Void)?
    let transactionFilterVM = TransactionFilterVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        resetFilterUnderline()
        setupData()
    }
    
    private func resetFilterUnderline() {
        let underlineAttribute: [NSAttributedString.Key: Any] = [
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
      let attributeString = NSMutableAttributedString(string: LocalizedKey.restFilter.value,
                                                        attributes: underlineAttribute)
        resetFilterButton.setAttributedTitle(attributeString, for: .normal)
    }
    
    private func setupData() {
        let transactionFilter = TransactionFilter.default
        fromDateTextField.text = transactionFilter.fromDate
        toDateTextField.text = transactionFilter.toDate
        nameTextField.text = transactionFilter.name
        minPriceTextField.text = transactionFilter.minPrice
        maxPriceTextField.text = transactionFilter.maxPrice
        transactionTypeTextField.text = transactionFilter.transactionType
    }
    
    private func selectFromDate(completion: @escaping ((String) -> Void)) {
        
        let currentDate = Date()
        
      let datePicker = ActionSheetDatePicker(title: LocalizedKey.fromDate.value, datePickerMode: .date, selectedDate: currentDate, doneBlock: { (_, value, _) in
            
            if let dob = value as? Date {
              let fromDateString = dob.toString(format: .custom(DateFormate.ddMMMyyyy.rawValue))
                completion(fromDateString)
            }
            return
        }, cancel: { _ in return }, origin: self.view)
        
        let toDateString = self.toDateTextField.text ?? ""
        if !toDateString.isEmpty {
            let toDate = Date(fromString: toDateString, format: .custom(DateFormate.ddMMMyyyy.rawValue))
            datePicker?.maximumDate = toDate
        } else {
             datePicker?.maximumDate = currentDate
        }
       
      if #available(iOS 13.4, *) {
        datePicker?.datePickerStyle = .automatic
      }
      
        datePicker?.show()
    }
    
    private func selectToDate(completion: @escaping ((String) -> Void)) {
        
        let fromDateString = self.fromDateTextField.text ?? ""
        
        let data = [
            fromDateString
        ]
        
        let validationResponse = transactionFilterVM.isValidText(data)
        
        if !validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        let currentDate = Date()
        
      let datePicker = ActionSheetDatePicker(title: LocalizedKey.toDate.value, datePickerMode: .date, selectedDate: currentDate, doneBlock: { (_, value, _) in
            
            if let dob = value as? Date {
                let toDateString = dob.toString(format: .custom(DateFormate.ddMMMyyyy.rawValue))
                completion(toDateString)
            }
            return
        }, cancel: { _ in return }, origin: self.view)
        
        let fromDate = Date(fromString: fromDateString, format: .custom(DateFormate.ddMMMyyyy.rawValue))
        datePicker?.minimumDate = fromDate
        datePicker?.maximumDate = currentDate
        datePicker?.show()
    }
    
    // MARK: - IBAction methods
    
    @IBAction func crossButtonAction(_ sender: Any) {
        dismiss()
        onComplete?()
    }
    
    @IBAction func fromDateButtonAction(_ sender: Any) {
        selectFromDate { [weak self] (fromDateString) in
            self?.fromDateTextField.text = fromDateString
        }
    }
    
    @IBAction func toDateButtonAction(_ sender: Any) {
        selectToDate { [weak self] (toDateString) in
            self?.toDateTextField.text = toDateString
        }
    }
    
    @IBAction func transactionTypeButtonAction(_ sender: Any) {
        
      let transactionTypes = [LocalizedKey.transfer.value, LocalizedKey.added.value, LocalizedKey.withdraw.value, LocalizedKey.failed.value.capitalized]
        
      ActionSheetStringPicker.show(withTitle: LocalizedKey.transactionType.value, rows: transactionTypes, initialSelection: 0, doneBlock: { _, _, value in
            
            let transactionType = value as? String ?? ""
            self.transactionTypeTextField.text = transactionType
        }, cancel: { _ in return }, origin: self.view)
    }
    
    @IBAction func applyFilterButtonAction(_ sender: Any) {
        let fromDate = fromDateTextField.text ?? ""
        let toDate = toDateTextField.text ?? ""
        let name = nameTextField.text ?? ""
        let minPrice = minPriceTextField.text ?? ""
        let maxPrice = maxPriceTextField.text ?? ""
        let transactionType = transactionTypeTextField.text ?? ""
        
        let transactionFilter = TransactionFilter.default
        transactionFilter.fromDate = fromDate
        transactionFilter.toDate = toDate
        transactionFilter.name = name
        transactionFilter.minPrice = minPrice
        transactionFilter.maxPrice = maxPrice
        transactionFilter.transactionType = transactionType
        
        dismiss()
        onComplete?()
        callbackApply?()
    }
    
    @IBAction func resetFilterButtonAction(_ sender: Any) {
        let fromDate = fromDateTextField.text ?? ""
        let toDate = toDateTextField.text ?? ""
        let name = nameTextField.text ?? ""
        let minPrice = minPriceTextField.text ?? ""
        let maxPrice = maxPriceTextField.text ?? ""
        let transactionType = transactionTypeTextField.text ?? ""
        
        if fromDate.isEmpty,
            toDate.isEmpty,
            name.isEmpty,
            minPrice.isEmpty,
            maxPrice.isEmpty,
            transactionType.isEmpty {
            dismiss()
            onComplete?()
            callbackApply?()
            return
        }
        
        fromDateTextField.text = ""
        toDateTextField.text = ""
        nameTextField.text = ""
        minPriceTextField.text = ""
        maxPriceTextField.text = ""
        transactionTypeTextField.text = ""
        
        let transactionFilter = TransactionFilter.default
        transactionFilter.fromDate = fromDateTextField.text!
        transactionFilter.toDate = toDateTextField.text!
        transactionFilter.name = nameTextField.text!
        transactionFilter.minPrice = minPriceTextField.text!
        transactionFilter.maxPrice = maxPriceTextField.text!
        transactionFilter.transactionType = transactionTypeTextField.text!
    }
}

extension TransactionFilterVC: UITextFieldDelegate {
  
  func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
    switch textField {
    case nameTextField:
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
