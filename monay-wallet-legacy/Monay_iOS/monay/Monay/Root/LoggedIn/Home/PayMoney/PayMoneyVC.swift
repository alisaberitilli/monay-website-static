//
//  PayMoneyVC.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ActionSheetPicker_3_0

class PayMoneyVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var payMoneyTableView: UITableView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var numberLabel: UILabel!
    @IBOutlet weak var amountTextField: UITextField!
    @IBOutlet weak var messageTextView: KMPlaceholderTextView!
    @IBOutlet weak var currencyLabel: UILabel!
    @IBOutlet weak var payButton: UIButton!
  
    // MARK: - Instance properties
    
    let payMoneyVM = PayMoneyVM()
    var selectedIndex = -1
  
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        intialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func intialSetup() {
        payButton.isHidden = Authorization.shared.userCredentials.userType != .secondaryUser
        registerTableCell()
      
      if payMoneyVM.isUserRequestPayMoney {
          amountTextField.text = payMoneyVM.amount
          amountTextField.isUserInteractionEnabled = false
      }

      setupUI()

      if Authorization.shared.userCredentials.userType == .secondaryUser {
        callPrimaryUserAPI()
      } else {
        callGetCardsAPI()
      }
    }
    
    private func registerTableCell() {
        payMoneyTableView.register(
            UINib(nibName: "NewCardCell", bundle: nil),
            forCellReuseIdentifier: "NewCardCell")
        payMoneyTableView.register(
            UINib(nibName: "NewCardHeaderCell", bundle: nil),
            forCellReuseIdentifier: "NewCardHeaderCell")
    }
    
    private func setupUI() {
        let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
        currencyLabel.text = currencySymbol
        
        guard let user = payMoneyVM.user else {
            return
        }
        
        let profileString = user.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        nameLabel.text = "\(user.firstName ?? "") \(user.lastName ?? "")"
        numberLabel.text = "\(user.phoneNumberCountryCode ?? "")\(user.phoneNumber ?? "")"
    }
    
  private func verifyPin(cardId: String, cardType: String, cardNumber: String, nameOnCard: String, month: String, year: String, cvv: String, saveCard: String, parentId: String) { // swiftlint:disable:this function_parameter_count
        
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: PinVC.self)
        let userDetail = UserDetail(
            requestId: self.payMoneyVM.requestId,
            toUserId: payMoneyVM.user?.id ?? "",
            amount: amountTextField.text ?? "",
            refillAmount: "",
            message: messageTextView.text ?? "",
            paymentMethod: parentId == "" ? payMoneyVM.paymentMethod.rawValue : PaymentMethod.wallet.rawValue,
            cardId: cardId,
            cardType: cardType,
            cardNumber: cardNumber,
            nameOnCard: nameOnCard,
            month: month,
            year: year,
            cvv: cvv,
            saveCard: saveCard,
            isUserRequestPayMoney: self.payMoneyVM.isUserRequestPayMoney,
            bankId: "",
            parentId: parentId)
        viewController.pinVM.userDetail = userDetail
        viewController.pinVM.redirectFrom = RedirectFrom.payMoney
        viewController.pinVM.user = payMoneyVM.user
        
        pushVC(viewController)
    }
    
    private func redirectToSuccessfullVC() {
        
        guard let transaction = payMoneyVM.transaction else {
            return
        }
        
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: SuccessfullVC.self)
        viewController.successfullVM.redirectFrom = .payMoney
        viewController.successfullVM.transaction = transaction
        viewController.successfullVM.user = payMoneyVM.user
        viewController.successfullVM.amount = amountTextField.text!
        self.pushVC(viewController)
    }
    
    private func amountTextFieldValidation() {
        
        let userId = self.payMoneyVM.user?.id ?? ""
        let validateResponse = isExistingLoginUserByID(paymentType: .send, userId: userId)
        if validateResponse.0 {
            return self.showAlertWith(message: validateResponse.1)
        }
        
        let data = [
            self.amountTextField.text ?? ""
        ]
        
        let validationResponse = self.payMoneyVM.isValidText(data)
        
        if !validationResponse.0 {
            return self.showAlertWith(message: validationResponse.1)
        }
    }
  
  // MARK: - IBAction methods
    
    @IBAction func payButtonAction(_ sender: UIButton) {
      let data = [
          self.amountTextField.text ?? ""
      ]
      
      let validationResponse = self.payMoneyVM.isValidText(data)
      
      if !validationResponse.0 {
          return self.showAlertWith(message: validationResponse.1)
      }

      if selectedIndex == -1 {
        return self.showAlertWith(message: "Please select primary account")
      }
      
      let totalWalletAmount = Float(Authorization.shared.totalSecondaryWalletAmount) ?? 0
      let limit = Float(self.amountTextField.text ?? "0") ?? 0
      let availableBalance = Float(payMoneyVM.primaryUsers[selectedIndex].limit ?? 0)
      
      if totalWalletAmount < limit {
        return self.showAlertWith(message: "Insufficient funds in your wallet.")
      }

      if availableBalance < limit {
        return self.showAlertWith(message: "Insufficient funds in your wallet.")
      }

      let parentId = payMoneyVM.primaryUsers[selectedIndex].parentId ?? ""
      self.verifyPin(cardId: "", cardType: "", cardNumber: "", nameOnCard: "", month: "", year: "", cvv: "", saveCard: "", parentId: parentId)
    }
}

// MARK: - Table view datasource methods

extension PayMoneyVC: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return Authorization.shared.userCredentials.userType == .secondaryUser ? 1 : 3
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0:
          return Authorization.shared.userCredentials.userType == .secondaryUser ? payMoneyVM.primaryUsers.count : 1
        case 1:
            return (payMoneyVM.paymentMethod == PaymentMethod.card) ? payMoneyVM.cards.count : 1 // ( 1 for payment by wallet)
        case 2:
            return ((payMoneyVM.paymentMethod == PaymentMethod.card) && (payMoneyVM.payBy == .newCard)) ? 1 : 0
        default:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell { // swiftlint:disable:this function_body_length
        switch indexPath.section {
        case 0:
          
          if Authorization.shared.userCredentials.userType == .secondaryUser {
            guard let cell = tableView.dequeueReusableCell(withIdentifier: PrimaryAccountCell.identifier) as? PrimaryAccountCell else {
              return UITableViewCell()
            }
            cell.configure(payMoneyVM.primaryUsers[indexPath.row])
            cell.checkUncheckImageView.image = UIImage(named: selectedIndex == indexPath.row ? "ic_check_active" : "ic_check")
            return cell
          }
          
          guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentMethodCell.identifier) as? PaymentMethodCell else {
                return UITableViewCell()
            }
            
            cell.configure(paymentMethod: payMoneyVM.paymentMethod)
            
            cell.callbackCardButton = { [weak self] in
                self?.payMoneyVM.paymentMethod = .card
                self?.payMoneyTableView.reloadDataInMain()
            }
            
            cell.callbackWalletButton = { [weak self] in
                self?.payMoneyVM.paymentMethod = .wallet
                self?.callWalletAPI()
            }
            
            return cell
        case 1:
            
            if payMoneyVM.paymentMethod == .card {
              guard let cell = tableView.dequeueReusableCell(withIdentifier: AddedCardCell.identifier) as? AddedCardCell else {
                    return UITableViewCell()
                }
                
                cell.tag = indexPath.row
                cell.configure(card: payMoneyVM.cards[indexPath.row])
                
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
                    
                    let card = self.payMoneyVM.cards[index]
                    
                    if card.cardName == LocalizedKey.cardAmericanExpress.value && Validator.filter(string: cell.cvvTextField.text ?? "").count < 4 {
                      return self.showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
                    } else if card.cardName != LocalizedKey.cardAmericanExpress.value && Validator.filter(string: cell.cvvTextField.text ?? "").count > 3 {
                      return self.showAlertWith(message: LocalizedKey.messageEnterValidCVV.value)
                    }
                    
                  self.verifyPin(cardId: card.id ?? "", cardType: "", cardNumber: "", nameOnCard: "", month: "", year: "", cvv: cell.cvvTextField.text ?? "", saveCard: "", parentId: "")
                }
                
                return cell
            } else {
              guard let cell = tableView.dequeueReusableCell(withIdentifier: WalletBalanceCell.identifier) as? WalletBalanceCell else {
                    return UITableViewCell()
                }
                
                cell.selectionStyle = .none
                
                if let wallet = payMoneyVM.wallet {
                    let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
                    cell.availableWalletLabel.text = "\(currencySymbol) \(wallet.totalWalletAmount ?? "-")"
                }
                
                cell.callbackAmountFieldValidation = { [weak self] in
                    
                    guard let `self` = self else {
                        return
                    }
                    
                    self.amountTextFieldValidation()
                }
                
                cell.callbackPay = { [weak self] in
                    
                    guard let `self` = self else {
                        return
                    }
                    
                    let totalWallet = Double(self.payMoneyVM.wallet?.totalWalletAmount ?? "0.0") ?? 0.0
                    let enteredAmount = Double(self.amountTextField.text ?? "0.0") ?? 0.0

                    let validationResponse = self.payMoneyVM.isValidEnteredAmount(enteredAmount: enteredAmount, totalWallet: totalWallet)
                    
                    if !validationResponse.0 {
                        return self.showAlertWith(message: validationResponse.1)
                    }
                    
                  self.verifyPin(cardId: "", cardType: "", cardNumber: "", nameOnCard: "", month: "", year: "", cvv: "", saveCard: "", parentId: "")
                }
                
                return cell
            }
        case 2:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: NewCardCell.identifier) as? NewCardCell else {
                return UITableViewCell()
            }
            
            cell.selectionStyle = .none
            
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
                
              self.verifyPin(cardId: "", cardType: "", cardNumber: cardNumber, nameOnCard: nameOnCard, month: month, year: year, cvv: cvv, saveCard: saveCard, parentId: "")
            }
            
            return cell
        default:
            return UITableViewCell()
        }
    }
}

// MARK: - Table view delegate methods

extension PayMoneyVC: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
      switch section {
      case 0:
        return Authorization.shared.userCredentials.userType == .secondaryUser ? 45 : 0
      case 1 where payMoneyVM.paymentMethod == PaymentMethod.card:
        return payMoneyVM.cards.count > 0 ? 45 : 0
      case 2 where payMoneyVM.paymentMethod == PaymentMethod.card:
        return UITableView.automaticDimension
      default:
        return 0
      }
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        switch section {
        case 0:
          if Authorization.shared.userCredentials.userType == .secondaryUser {
            let headerView = UIView()
            headerView.backgroundColor = .white
            headerView.frame = CGRect(x: 0, y: 0, width: tableView.frame.size.width, height: 45)
            headerView.backgroundColor = Color.lightBlue
            let titleLabel = UILabel(frame: CGRect(x: 10, y: 0, width: tableView.frame.size.width, height: 45))
            titleLabel.textAlignment = .left
            titleLabel.numberOfLines = 1
            titleLabel.backgroundColor = Color.lightBlue
            titleLabel.font = UIFont.customFont(style: .medium, size: .custom(16))
            titleLabel.textColor = Color.semiGray
            headerView.addSubview(titleLabel)
            titleLabel.text = "Primary accounts"
            return headerView
          }
          return nil
        case 1:
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
        case 2:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: NewCardHeaderCell.identifier) as? NewCardHeaderCell else {
                return UITableViewCell()
            }
            
            cell.configure(payBy: payMoneyVM.payBy)
            cell.callBackCheckUncheck = { [weak self] in
                _ = self?.payMoneyVM.cards.map { $0.isSelected = false }
                self?.payMoneyVM.payBy = .newCard
                self?.payMoneyTableView.reloadDataInMain()
            }
            
            return cell
        default:
            return nil
        }
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        if indexPath.section == 0 && Authorization.shared.userCredentials.userType == .secondaryUser {
          selectedIndex = indexPath.row
          payMoneyTableView.reloadDataInMain()
          return
        }
      
        if indexPath.section == 1 && payMoneyVM.paymentMethod == .card {
            let index = indexPath.row
            
            let isExpired = self.payMoneyVM.cards[index].isExpired ?? false
            let validationResponse = self.payMoneyVM.isCardExpired(isCardExpired: isExpired)
            
            if !validationResponse.0 {
                return self.showAlertWith(message: validationResponse.1)
            }
            
            _ = payMoneyVM.cards.map { $0.isSelected = false }
            payMoneyVM.payBy = .saveCard
            
            payMoneyVM.cards[index].isSelected = true
            payMoneyTableView.reloadDataInMain()
        }
    }
}

// MARK: - API Call

extension PayMoneyVC {
    
    private func callGetCardsAPI() {
        
        payMoneyVM.getCardsAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            self.payMoneyTableView.reloadDataInMain()
            
            if !success {
                self.showAlertWith(message: message)
            }
        }
    }

    private func callWalletAPI() {
        
        payMoneyVM.walletAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.payMoneyTableView.reloadDataInMain()
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
  
  private func callPrimaryUserAPI() {
      payMoneyVM.primaryUser({ (success, message) in
        if success {
          self.payMoneyTableView.reloadDataInMain()
        } else {
          self.showAlertWith(message: message)
        }
      })
    }
}

// MARK: - Text field delegate methods

extension PayMoneyVC: UITextFieldDelegate {
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

extension PayMoneyVC: UITextViewDelegate {
  
  func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
      let currentText = textView.text ?? ""

      guard let stringRange = Range(range, in: currentText) else { return false }
      let updatedText = currentText.replacingCharacters(in: stringRange, with: text)

      return updatedText.count <= max50Length
  }
}
