//
//  AutoTopupVC.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class AutoTopupVC: UIViewController {
  
  // MARK: - IBOutlet properties
  
  @IBOutlet weak var payMoneyTableView: UITableView!
  @IBOutlet weak var currencyLabel: UILabel!
  @IBOutlet weak var refillCurrencyLabel: UILabel!
  @IBOutlet weak var amountTextField: UITextField!
  @IBOutlet weak var refillAmountTextField: UITextField!
  @IBOutlet weak var statusButton: UIButton!
  
  // MARK: - Instance properties
  
  let autoTopupVM = AutoTopupVM()
  
  // MARK: - View controller lifecycle methods
  
  override func viewDidLoad() {
    super.viewDidLoad()
    intialSetup()
  }
  
  // MARK: - Private helper methods
  
  private func intialSetup() {
    callGetCardsAPI()
    let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
    currencyLabel.text = currencySymbol
    refillCurrencyLabel.text = currencySymbol
    statusButton.isSelected = Authorization.shared.userCredentials.autoToupStatus ?? false
    let minimumWalletAmount = (Authorization.shared.userCredentials.minimumWalletAmount ?? "0") == "0" ? "" : (Authorization.shared.userCredentials.minimumWalletAmount ?? "0")
    amountTextField.text = minimumWalletAmount
    let refillWalletAmount = (Authorization.shared.userCredentials.refillWalletAmount ?? "0") == "0" ? "" : (Authorization.shared.userCredentials.refillWalletAmount ?? "0")
    refillAmountTextField.text = refillWalletAmount
    registerTableCell()
  }
  
  private func registerTableCell() {
    payMoneyTableView.register(
      UINib(nibName: "NewCardCell", bundle: nil),
      forCellReuseIdentifier: "NewCardCell")
    payMoneyTableView.register(
      UINib(nibName: "NewCardHeaderCell", bundle: nil),
      forCellReuseIdentifier: "NewCardHeaderCell")
  }
  
  private func callGetCardsAPI() {
    autoTopupVM.getCardsAPI { [weak self] (success, message) in
      guard let `self` = self else {
        return
      }
      self.statusButton.isSelected = Authorization.shared.userCredentials.autoToupStatus ?? false
      self.payMoneyTableView.reloadDataInMain()
      if !success {
        self.showAlertWith(message: message)
      }
    }
  }
  
  private func amountTextFieldValidation() {
    let data = [
      self.amountTextField.text ?? "",
      self.refillAmountTextField.text ?? ""
    ]
    
    let validationResponse = self.autoTopupVM.isValidText(data)
    
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
      refillAmount: refillAmountTextField.text ?? "",
      message: "",
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
    viewController.pinVM.redirectFrom = RedirectFrom.autoTopup
    
    pushVC(viewController)
  }
  
  @IBAction func statusActionbutton(_ sender: UIButton) {
    guard !self.autoTopupVM.cards.isEmpty else {
      return self.showAlertWith(message: "Please add card and update the minimum and refill amount first.")
    }
    autoTopupVM.updateAutoTopupStatus(status: !statusButton.isSelected ? true : false) { (success, message) in
      if success {
        if message != "" {
          self.statusButton.isSelected = !self.statusButton.isSelected
          Authorization.shared.userCredentials.autoToupStatus = self.statusButton.isSelected
          Authorization.shared.synchronize()
          self.showAlert(message: message, okTitle: LocalizedKey.ok.value)
        }
      } else {
        self.showAlert(message: message, okTitle: LocalizedKey.ok.value)
      }
    }
  }
  
}

// MARK: - Table view datasource methods

extension AutoTopupVC: UITableViewDataSource {
  func numberOfSections(in tableView: UITableView) -> Int {
    return 2
  }
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    section == 0 ? autoTopupVM.cards.count : 1
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    switch indexPath.section {
    case 0:
      guard let cell = tableView.dequeueReusableCell(withIdentifier: AddedCardCell.identifier) as? AddedCardCell else {
        return UITableViewCell()
      }
      
      cell.tag = indexPath.row
      cell.configure(card: autoTopupVM.cards[indexPath.row])
      cell.checkUncheckButton.isSelected = autoTopupVM.selectedIndex == indexPath.row
      cell.payContainerView.isHidden = autoTopupVM.selectedIndex == indexPath.row ? false : true
      cell.heightConstraintPayView.constant = autoTopupVM.selectedIndex == indexPath.row ? 44 : 0
      cell.constraintTopPayView.constant = autoTopupVM.selectedIndex == indexPath.row ? 15 : 0
      
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
        
        let card = self.autoTopupVM.cards[index]
        
        if card.cardName == LocalizedKey.cardAmericanExpress.value && Validator.filter(string: cell.cvvTextField.text ?? "").count < 4 {
          return self.showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
        } else if card.cardName != LocalizedKey.cardAmericanExpress.value && Validator.filter(string: cell.cvvTextField.text ?? "").count > 3 {
          return self.showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
        }
        
        guard let cardIdString = card.id else {
          return
        }
        
        self.verifyPin(cardId: cardIdString, cardNumber: "", month: "", year: "", cvv: cell.cvvTextField.text ?? "", nameOnCard: "", saveCard: "no")
      }
      
      return cell
    case 1:
      guard let cell = tableView.dequeueReusableCell(withIdentifier: NewCardCell.identifier) as? NewCardCell else {
        return UITableViewCell()
      }
      
      cell.selectionStyle = .none
      cell.isAutoTopup = true
      
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

extension AutoTopupVC: UITableViewDelegate {
  
  func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
    section == 0 ? (self.autoTopupVM.cards.isEmpty ? 0 : 25) : 50
  }
  
  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
    switch section {
    case 0:
      let headerView = UIView()
      headerView.backgroundColor = .white
      let titleLabel = UILabel(frame: CGRect(x: 20, y: 0, width: tableView.frame.size.width, height: 25))
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
      
      cell.configure(payBy: autoTopupVM.payBy)
      cell.callBackCheckUncheck = { [weak self] in
        self?.autoTopupVM.selectedIndex = -1
        _ = self?.autoTopupVM.cards.map { $0.isSelected = false }
        self?.autoTopupVM.payBy = .newCard
        self?.payMoneyTableView.reloadDataInMain()
      }
      
      return cell
    default:
      return nil
    }
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    guard indexPath.section == 0 else { return }
    autoTopupVM.selectedIndex = indexPath.row
    autoTopupVM.payBy = .saveCard
    payMoneyTableView.reloadDataInMain()
  }
}

// MARK: - Text field delegate methods

extension AutoTopupVC: UITextFieldDelegate {
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

extension AutoTopupVC: UITextViewDelegate {
  
  func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
    let currentText = textView.text ?? ""
    
    guard let stringRange = Range(range, in: currentText) else { return false }
    let updatedText = currentText.replacingCharacters(in: stringRange, with: text)
    
    return updatedText.count <= max50Length
  }
}
