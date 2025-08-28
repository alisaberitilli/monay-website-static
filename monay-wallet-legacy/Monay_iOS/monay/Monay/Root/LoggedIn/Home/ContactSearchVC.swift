//
//  ContactSearchVC.swift
//  Monay
//
//  Created by WFH on 19/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ContactSearchVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var contactTableView: TableView!
    @IBOutlet weak var searchNameTextField: UITextField!
    @IBOutlet weak var proceedViewHeightConstraint: NSLayoutConstraint!
    @IBOutlet weak var proceedViewBottomConstraint: NSLayoutConstraint!
    @IBOutlet weak var errorMessageLabel: UILabel!

    // MARK: - Instance properties
    
    let contactSearchVM = ContactSearchVM()
    var keyboardHeight: CGFloat = 0.0

    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.addKeyBoardNotification()
    }
  
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        NotificationCenter.default.removeObserver(self) // swiftlint:disable:this notification_center_detachment
    }

    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupUI()
        configuretableView()
    }
    
    private func setupUI() {
      searchNameTextField.attributedPlaceholder = NSAttributedString(string: LocalizedKey.enterNameMobileNumber.value,
                                                                       attributes: [NSAttributedString.Key.foregroundColor: UIColor.white])
    }
    
    private func configuretableView() {
        contactTableView.placeholderDelegate = self
    }
    
    private func addKeyBoardNotification() {
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillChangeFrame(_:)), name: UIResponder.keyboardWillChangeFrameNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillHide(notification:)), name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    private func manageViewState(_ currentState: PlaceholderState) {
        switch currentState {
        case .loading:
            contactTableView.showLoading()
            
        case .defaultState:
            contactTableView.showDefault()
            
        case .noConnection:
            contactTableView.showNoConnection()
            
        case .error(let message, let actionType):
            contactTableView.showError(message: message, actionType: actionType)
            
        case .noResult(let message):
            contactTableView.showNoResults(title: message, message: PlaceholderStateData.noContact.message, image: "")
            
        default:
            break
        }
    }
    
    private func redirectToInvite(phoneConact: Contact) {
        
        guard phoneConact.firstName != nil else {
            return
        }
        
        let name = (phoneConact.firstName ?? "") + " " + (phoneConact.lastName ?? "")
        
        definesPresentationContext = true
        providesPresentationContextTransitionStyle = true
        
        overlayBlurredBackgroundView()
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: InviteVC.self)
        viewController.onComplete = { [weak self] in
            self?.removeBlurredBackgroundViewView()
        }
        
        viewController.inviteVM.userName = name
        viewController.modalPresentationStyle = .overFullScreen
        present(viewController)
    }
    
    private func redirectTo() {
        switch contactSearchVM.paymentType {
        case .send:
            redirectToPayMoney()
        case .request:
            redirectToRequestMoney()
        }
    }
    
    private func redirectToPayMoney() {
        guard let user = contactSearchVM.user else {
            return
        }
        
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: PayMoneyVC.self)
        viewController.payMoneyVM.user = user
        pushVC(viewController)
    }
    
    private func redirectToRequestMoney() {
        guard let user = contactSearchVM.user else {
            return
        }
        
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: RequestMoneyVC.self)
        viewController.requestMoneyVM.user = user
        pushVC(viewController)
    }
    
    // MARK: - Keyboard Notification Method
    
    @objc internal func keyboardWillChangeFrame(_ notification: NSNotification) {
        
        let keyboardSize = ((notification as NSNotification).userInfo![UIResponder.keyboardFrameEndUserInfoKey] as! NSValue).cgRectValue // swiftlint:disable:this force_cast
        
        // Chnage Table view Frame
        keyboardHeight = keyboardSize.size.height
        let contentInsets = UIEdgeInsets(top: 0.0, left: 0.0, bottom: 0.0, right: 0.0)
        contactTableView.contentInset = contentInsets
        
        proceedViewBottomConstraint.constant = UIScreen.main.bounds.height - keyboardSize.origin.y
        
        UIView.animate(withDuration: 0.3, animations: {
            self.view.layoutIfNeeded()
        })
    }
    
    @objc internal func keyboardWillHide(notification: NSNotification) {
        if ((notification.userInfo?[UIResponder.keyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue) != nil {
          if (self.contactSearchVM.searchPhoneContacts.count != 0) { // swiftlint:disable:this control_statement
                self.view.endEditing(true)
                keyboardHeight = 0.0
                let endFrame = ((notification as NSNotification).userInfo![UIResponder.keyboardFrameEndUserInfoKey] as! NSValue).cgRectValue // swiftlint:disable:this force_cast
                proceedViewBottomConstraint.constant = UIScreen.main.bounds.height - endFrame.origin.y
                UIView.animate(withDuration: 0.3, animations: {
                    self.view.layoutIfNeeded()
                })
            }
        }
    }

    // MARK: - IBAction methods
    
    @IBAction func searchNameEditingChange(_ sender: UITextField) {
        let searchText = sender.text ?? ""
        
        contactSearchVM.searchPhoneContacts = searchText.isEmpty ? contactSearchVM.phoneContacts : contactSearchVM.phoneContacts.filter { (appUser) -> Bool in
          let isUserExist = (appUser.firstName?.lowercased().contains(searchText.lowercased()) ?? false || appUser.mobileNumber?.contains(searchText) ?? false)
          return isUserExist
        }
        
        contactTableView.reloadData()
        if contactSearchVM.searchPhoneContacts.isEmpty {
            if searchText != "", Validator.isContainsOnlyNumbers(string: searchText) {
              self.proceedViewHeightConstraint.constant = 84
              self.errorMessageLabel.text = ""
            } else {
              self.proceedViewHeightConstraint.constant = 0
              self.errorMessageLabel.text = "\(LocalizedKey.notFound.value) '\(searchText)' \(LocalizedKey.tryEnteringMobileNumber.value)"
          }
        } else {
          self.proceedViewHeightConstraint.constant = 0
          self.errorMessageLabel.text = ""
      }
    }
  
    @IBAction func proceedButton_Action(_ sender: UIButton) {
        if searchNameTextField.text != "", Validator.isValidPhoneNumber(searchNameTextField.text) {
            self.errorMessageLabel.text = ""
            
            let searchName = searchNameTextField.text ?? ""
            let validationResponse = isExistingLoginUser(paymentType: contactSearchVM.paymentType, searchOrSelectedUser: searchName)
            
            view.endEditing(true)
            
            if validationResponse.0 {
                showAlertWith(message: validationResponse.1)
            } else {
                callUserSearchAPI(phoneNumber: searchNameTextField.text ?? "")
            }
            
        } else {
          self.errorMessageLabel.text = LocalizedKey.messageMobileNumberValidLength.value
        }
    }
}

// MARK: - Table view datasource methods

extension ContactSearchVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        contactSearchVM.searchPhoneContacts.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: ContactCell.identifier, for: indexPath) as? ContactCell else {
            return UITableViewCell()
        }
        
        cell.selectionStyle = .none
        cell.tag = indexPath.row
        cell.configure(contact: contactSearchVM.searchPhoneContacts[indexPath.row])
        cell.callbackInvite = { [weak self] itemCell in
            
          guard let `self` = self else {
              return
          }

          if let index = self.contactTableView.indexPath(for: itemCell) {
            self.callcheckPhoneAPI(phoneContact: self.contactSearchVM.searchPhoneContacts[index.row])
          }
        }

        return cell
    }
}

// MARK: - Table view delegate methods

extension ContactSearchVC: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let mobileNumber = contactSearchVM.searchPhoneContacts[indexPath.row].mobileNumber ?? ""
        let validationResponse = isExistingLoginUser(paymentType: contactSearchVM.paymentType, searchOrSelectedUser: mobileNumber)
        
        if validationResponse.0 {
            return showAlertWith(message: validationResponse.1)
        }
        
        callcheckPhoneAPI(phoneContact: contactSearchVM.searchPhoneContacts[indexPath.row])
    }
}

// MARK: - API Call

extension ContactSearchVC {
    private func callcheckPhoneAPI(phoneContact: Contact) {
        
        guard let phoneNumber = phoneContact.mobileNumber else {
            return
        }
        
        let parameters = [
            "phoneNumberCountryCode": "",
            "phoneNumber": phoneNumber
        ]
        
        contactSearchVM.checkPhoneAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
              if message == LocalizedKey.phoneNotFound.value {
                    self.redirectToInvite(phoneConact: phoneContact)
                } else {
                    self.redirectTo()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callUserSearchAPI(phoneNumber: String) {
        
        contactSearchVM.user = nil
        
        let parameters: HTTPParameters = [
            "limit": 1,
            "offset": 0,
            "name": "",
            "phoneNumber": phoneNumber
        ]
        
        contactSearchVM.userSearchAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.redirectTo()
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - PlaceholderDelegate

extension ContactSearchVC: PlaceholderDelegate {
    
    func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
        switch placeholder.key {
        case .noConnectionKey:
            break
        default:
            break
        }
        
        switch placeholder.data?.action {
        case .setting:
            break
        case .tryAgain:
            break
        default:
            break
        }
    }
}
