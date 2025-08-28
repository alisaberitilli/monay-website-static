//
//  AddMoneyVC.swift
//  Monay
//
//  Created by WFH on 20/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddMoneyVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var amountTextField: UITextField!
    @IBOutlet weak var cardTableView: UITableView!
    @IBOutlet weak var messageTextView: KMPlaceholderTextView!
    @IBOutlet weak var currencyLabel: UILabel!
    
    // MARK: - Instance properties
    
    let addMoneyVM = AddMoneyVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        intialSetup()
    }
    
    private func intialSetup() {
        registerTableCell()
        callGetCardsAPI()
        
        let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
        currencyLabel.text = currencySymbol
    }
    
    private func registerTableCell() {
        cardTableView.register(
            UINib(nibName: AddedCardCell.identifier, bundle: nil),
            forCellReuseIdentifier: AddedCardCell.identifier)
        cardTableView.register(
            UINib(nibName: NewCardHeaderCell.identifier, bundle: nil),
            forCellReuseIdentifier: NewCardHeaderCell.identifier)
        cardTableView.register(
            UINib(nibName: NewCardCell.identifier, bundle: nil),
            forCellReuseIdentifier: NewCardCell.identifier)
    }
    
    private func amountTextFieldValidation() {
        let data = [
            self.amountTextField.text ?? ""
        ]
        
        let validationResponse = self.addMoneyVM.isValidText(data)
        
        if !validationResponse.0 {
            return self.showAlertWith(message: validationResponse.1)
        }
    }
    
    private func verifyPin(cardId: String, cardNumber: String, month: String, year: String, cvv: String, nameOnCard: String, saveCard: String) {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: PinVC.self)
        let cardNumberFormatted = cardNumber.replacingOccurrences(of: " ", with: "")
        let userDetail = UserDetail(
            requestId: "",
            toUserId: "",
            amount: amountTextField.text ?? "",
            refillAmount: "",
            message: messageTextView.text ?? "",
            paymentMethod: "",
            cardId: cardId,
            cardType: "",
            cardNumber: cardNumberFormatted,
            nameOnCard: nameOnCard,
            month: month,
            year: year,
            cvv: cvv,
            saveCard: saveCard,
            isUserRequestPayMoney: false,
            bankId: "",
            parentId: "")
        viewController.pinVM.userDetail = userDetail
        viewController.pinVM.redirectFrom = RedirectFrom.addMoney
        
        pushVC(viewController)
    }
}

// MARK: - Table view datasource methods

extension AddMoneyVC: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0:
            return addMoneyVM.cards.count
        case 1:
            return addMoneyVM.payBy == .newCard ? 1 : 0
        default:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        switch indexPath.section {
        case 0:
            
          guard let cell = tableView.dequeueReusableCell(withIdentifier: AddedCardCell.identifier) as? AddedCardCell else {
                return UITableViewCell()
            }
            
            cell.tag = indexPath.row
          cell.payButton.setTitle(LocalizedKey.add.value, for: .normal)
            cell.configure(card: addMoneyVM.cards[indexPath.row])
            
            cell.callbackAmountFieldValidation = { [weak self] in
                
                guard let `self` = self else {
                    return
                }
                
                self.amountTextFieldValidation()
            }
            
            cell.callbackAlertMessage = { [weak self] alertMessage in
                self?.showAlertWith(message: alertMessage)
            }
            
            cell.callbackPay = { [weak self] index in
                
                guard let `self` = self else {
                    return
                }
                
                let card = self.addMoneyVM.cards[index]
                
              if card.cardName == LocalizedKey.cardAmericanExpress.value && Validator.filter(string: cell.cvvTextField.text ?? "").count < 4 {
                    return self.showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
                } else if card.cardName != LocalizedKey.cardAmericanExpress.value && Validator.filter(string: cell.cvvTextField.text ?? "").count > 3 {
                    return self.showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
                }
                
                guard let cardIdString = card.id else {
                    return
                }
                
                self.verifyPin(cardId: cardIdString, cardNumber: "", month: "", year: "", cvv: cell.cvvTextField.text ?? "", nameOnCard: "", saveCard: "")
            }
            
            return cell
            
        case 1:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: NewCardCell.identifier) as? NewCardCell else {
                return UITableViewCell()
            }
            
            cell.selectionStyle = .none
          cell.payButton.setTitle(LocalizedKey.add.value, for: .normal)
            
            if !cell.isCardConfigure {
                cell.configure()
            }
            
            cell.callbackAmountFieldValidation = { [weak self] in
                
                guard let `self` = self else {
                    return
                }
                
                self.amountTextFieldValidation()
            }
            
            cell.callbackAlertMessage = { [weak self] alertMessage in
                self?.showAlertWith(message: alertMessage)
            }
            
            cell.callbackCardDetails = { [weak self] (cardNumber, nameOnCard, month, year, cvv, saveCard) in
                
                guard let `self` = self else {
                    return
                }
                
                self.verifyPin(cardId: "", cardNumber: cardNumber, month: month, year: year, cvv: cvv, nameOnCard: nameOnCard, saveCard: saveCard)
            }
            
            return cell
            
        default:
            return UITableViewCell()
        }
    }
}

// MARK: - Table view delegate methods

extension AddMoneyVC {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if indexPath.section == 0 {
            let index = indexPath.row
            
            let isExpired = self.addMoneyVM.cards[index].isExpired ?? false
            let validationResponse = self.addMoneyVM.isCardExpired(isCardExpired: isExpired)
            
            if !validationResponse.0 {
                return self.showAlertWith(message: validationResponse.1)
            }
            
            _ = addMoneyVM.cards.map { $0.isSelected = false }
            addMoneyVM.payBy = .saveCard
            
            addMoneyVM.cards[index].isSelected = true
            cardTableView.reloadDataInMain()
        }
    }
}

// MARK: - Table view delegate methods

extension AddMoneyVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        switch section {
        case 0:
            return addMoneyVM.cards.count > 0 ? 45 : 0
        case 1:
            return UITableView.automaticDimension
        default:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        switch section {
        case 0:
            let headerView = UIView()
            headerView.backgroundColor = .white
            let titleLabel = UILabel(frame: CGRect(x: 20, y: 10, width: tableView.frame.size.width, height: 45))
            titleLabel.textAlignment = .left
            titleLabel.numberOfLines = 1
            titleLabel.backgroundColor = UIColor.clear
            titleLabel.font = UIFont.customFont(style: .medium, size: .custom(16))
            headerView.addSubview(titleLabel)
          titleLabel.text = LocalizedKey.savedCards.value
            return headerView
        case 1:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: NewCardHeaderCell.identifier) as? NewCardHeaderCell else {
                return UITableViewCell()
            }
            
            cell.configure(payBy: addMoneyVM.payBy)
            cell.callBackCheckUncheck = { [weak self] in
                _ = self?.addMoneyVM.cards.map { $0.isSelected = false }
                self?.addMoneyVM.payBy = .newCard
                self?.cardTableView.reloadDataInMain()
            }
            
            return cell
        default:
            return nil
        }
    }
}

// MARK: - API Call

extension AddMoneyVC {
    
    private func callGetCardsAPI() {
        
        addMoneyVM.getCardsAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.cardTableView.reloadDataInMain()
            
            if !success {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - Text field delegate methods

extension AddMoneyVC: UITextFieldDelegate {
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
        guard let oldText = textField.text, let rangeInOldText = Range(range, in: oldText) else {
            return true
        }
        
        let newText = oldText.replacingCharacters(in: rangeInOldText, with: string)
        let isNumeric = newText.isEmpty || (Double(newText) != nil)
        let numberOfDots = newText.components(separatedBy: ".").count - 1
        
        let numberOfDecimalDigits: Int
        if let dotIndex = newText.firstIndex(of: ".") {
            numberOfDecimalDigits = newText.distance(from: dotIndex, to: newText.endIndex) - 1
        } else {
            numberOfDecimalDigits = 0
        }
        
        var numberOfIntDigits = newText.count
        if let dotIndex2 = newText.lastIndex(of: ".") {
            numberOfIntDigits = newText.distance(from: newText.startIndex, to: dotIndex2)
        }
        
        return isNumeric && numberOfDots <= 1 && numberOfDecimalDigits <= 2 && numberOfIntDigits <= 6
    }
}

extension AddMoneyVC: UITextViewDelegate {
  
  func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
      let currentText = textView.text ?? ""

      guard let stringRange = Range(range, in: currentText) else { return false }
      let updatedText = currentText.replacingCharacters(in: stringRange, with: text)

      return updatedText.count <= max50Length
  }
}
