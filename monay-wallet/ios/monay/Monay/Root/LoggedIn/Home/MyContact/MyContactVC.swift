//
//  MyContactVC.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import ContactsUI

class MyContactVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var contactTableView: TableView!
    @IBOutlet weak var searchNameTextField: UITextField!
    @IBOutlet weak var contactTableHeaderView: UIView!
    @IBOutlet weak var recentCollectionView: UICollectionView!
    @IBOutlet weak var headerViewHeightConstraint: NSLayoutConstraint!

    // MARK: - Instance properties
    
    let mycontactVM = MyContactVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }

    private func initialSetup() {
        setupUI()
        configuretableView()
        callRecentUserAPI()
        contactList()
    }
    
    private func setupUI() {
        searchNameTextField.attributedPlaceholder = NSAttributedString(
          string: LocalizedKey.enterNameOrMobileNumber.value,
            attributes: [NSAttributedString.Key.foregroundColor: UIColor.white])
    }
    
    private func configuretableView() {
        contactTableView.placeholderDelegate = self
        contactTableView.tableHeaderView = contactTableHeaderView
        contactTableView.shouldHideHeaderView = false
    }

    @objc private func contactList() {
        
        let taskContext = CoreDataManager.sharedInstance.managedObjectContext

        self.mycontactVM.phoneContacts = CoreDataManager.sharedInstance.getObjectsforEntity(strEntity: "Contact", taskContext: taskContext) as! [Contact] // swiftlint:disable:this force_cast
        
        if !mycontactVM.phoneContacts.isEmpty {
            self.callContactSyncAPI()
        }
    }

  private func fetchDBContact() {
    
    let taskContext = CoreDataManager.sharedInstance.managedObjectContext
    
    let contacts = CoreDataManager.sharedInstance.getObjectsforEntity(strEntity: LocalizedKey.contact.value, taskContext: taskContext) as! [Contact] // swiftlint:disable:this force_cast
    
    mycontactVM.phoneContacts = contacts.unique { $0.mobileNumber }
    
    mycontactVM.appUsers = mycontactVM.phoneContacts.filter { $0.isAppUser }
    mycontactVM.nonAppUsers = mycontactVM.phoneContacts.filter { !$0.isAppUser }
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

    // MARK: - Private helper methods
    
    private func redirectTo() {
        switch mycontactVM.paymentType {
        case .send:
            redirectToPayMoney()
        case .request:
            redirectToRequestMoney()
        }
    }
    
    private func redirectToPayMoney() {
        guard let user = mycontactVM.user else {
            return
        }
        
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: PayMoneyVC.self)
        viewController.payMoneyVM.user = user
        pushVC(viewController)
    }
    
    private func redirectToRequestMoney() {
        guard let user = mycontactVM.user else {
            return
        }
        
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: RequestMoneyVC.self)
        viewController.requestMoneyVM.user = user
        pushVC(viewController)
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
    
    @IBAction func scanButtonAction(_ sender: Any) {
        
        let scanVC = StoryboardScene.Scan.instantiateViewController(withClass: ScanVC.self)
        scanVC.scanVM.paymentType = mycontactVM.paymentType
        let scanNav = UINavigationController(rootViewController: scanVC)
        scanNav.setNavigationBarHidden(true, animated: false)
        scanNav.modalPresentationStyle = .fullScreen
        self.present(scanNav)
    }
    
    @IBAction func searchNameOrMobileNumberButton(_ sender: Any) {
        
        ContactUtility.sharedInstance.requestedForAccess { (granted) in
            
            if granted {
                
                DispatchQueue.main.async {
                    let viewController = StoryboardScene.Main.instantiateViewController(withClass: ContactSearchVC.self)
                    viewController.contactSearchVM.paymentType = self.mycontactVM.paymentType
                    viewController.contactSearchVM.phoneContacts = self.mycontactVM.phoneContacts
                    viewController.contactSearchVM.searchPhoneContacts = self.mycontactVM.phoneContacts
                    self.pushVC(viewController)
                }
                
            } else {
                let viewController = StoryboardScene.Main.instantiateViewController(withClass: ContactSearchVC.self)
                viewController.contactSearchVM.paymentType = self.mycontactVM.paymentType
                viewController.contactSearchVM.phoneContacts = []
                viewController.contactSearchVM.searchPhoneContacts = []
                self.pushVC(viewController)
            }
        }
    }
    
    @IBAction func searchNameTouchUpInsideTextField(_ sender: UITextField) { }
}

// MARK: - Table view datasource methods

extension MyContactVC: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0:
          return mycontactVM.appUsers.count
        case 1:
          return mycontactVM.nonAppUsers.count
        default:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        switch indexPath.section {
        case 0:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: ContactCell.identifier, for: indexPath) as? ContactCell else {
                return UITableViewCell()
            }
            
            cell.selectionStyle = .none
            cell.tag = indexPath.row
            cell.configure(contact: mycontactVM.appUsers[indexPath.row])

            return cell
        case 1:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: ContactCell.identifier, for: indexPath) as? ContactCell else {
                return UITableViewCell()
            }
            
            cell.selectionStyle = .none
            cell.tag = indexPath.row
            cell.configure(contact: mycontactVM.nonAppUsers[indexPath.row])
            
            cell.callbackInvite = { [weak self] itemCell in
                
              guard let `self` = self else {
                  return
              }

              if let index = self.contactTableView.indexPath(for: itemCell) {
                self.callcheckPhoneAPI(phoneContact: self.mycontactVM.nonAppUsers[index.row])
              }
            }

            return cell
        default:
            return UITableViewCell()
        }
    }
}

// MARK: - Table view delegate methods

extension MyContactVC: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        switch section {
        case 0:
          return mycontactVM.appUsers.count > 0 ? 48.0 : 0
        case 1:
          return mycontactVM.nonAppUsers.count > 0 ? 48.0 : 0
        default:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let headerView = UIView(frame: CGRect(x: 0, y: 0, width: tableView.frame.width, height: 48))
        headerView.backgroundColor = .white
        
        let contactLabel = UILabel()
        contactLabel.frame = CGRect(x: 20, y: 15, width: headerView.frame.width - 40, height: headerView.frame.height - 15)
        contactLabel.font = UIFont.customFont(style: .bold, size: UIFont.FontSize.large)
        contactLabel.textColor = UIColor.black
        headerView.backgroundColor = #colorLiteral(red: 1, green: 1, blue: 1, alpha: 1)

        headerView.addSubview(contactLabel)
        
        switch section {
        case 0:
          contactLabel.text = LocalizedKey.contactsOnMonay.value
            return headerView
        case 1:
          contactLabel.text = LocalizedKey.allContacts.value
            return headerView
        default:
            return nil
        }
    }
        
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        switch indexPath.section {
        case 0:
            let mobileNumber = mycontactVM.appUsers[indexPath.row].mobileNumber ?? ""
            let validationResponse = isExistingLoginUser(paymentType: mycontactVM.paymentType, searchOrSelectedUser: mobileNumber)
            
            if validationResponse.0 {
                return showAlertWith(message: validationResponse.1)
            }
            
            callcheckPhoneAPI(phoneContact: mycontactVM.appUsers[indexPath.row])
        case 1:
            
            let mobileNumber = mycontactVM.nonAppUsers[indexPath.row].mobileNumber ?? ""
            let validationResponse = isExistingLoginUser(paymentType: mycontactVM.paymentType, searchOrSelectedUser: mobileNumber)
            
            if validationResponse.0 {
                return showAlertWith(message: validationResponse.1)
            }
            
            callcheckPhoneAPI(phoneContact: mycontactVM.nonAppUsers[indexPath.row])
        default:
            break
        }
    }
}

// MARK: - Collection view datasource methods

extension MyContactVC: UICollectionViewDataSource {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
      return mycontactVM.recentUsers.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
      guard let cell = collectionView.dequeueReusableCell(withReuseIdentifier: ContactRecentCell.identifier, for: indexPath) as? ContactRecentCell else {
            return UICollectionViewCell()
        }
        
        cell.configure(recentUser: mycontactVM.recentUsers[indexPath.row])
        return cell
    }
}

// MARK: - Collection view delegate methods

extension MyContactVC: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        mycontactVM.user = mycontactVM.recentUsers[indexPath.row]
        switch self.mycontactVM.paymentType {
        case .send:
          self.redirectToPayMoney()
        case .request:
          self.redirectToRequestMoney()
        }
    }
}

// MARK: - API Call

extension MyContactVC {
    private func callRecentUserAPI() {
        
        self.manageViewState(.defaultState)

        mycontactVM.recentUsersAPI({ [weak self] (currentState) in
            
            guard let `self` = self else {
                return
            }
            
          self.manageViewState(currentState)
        }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
          
          ContactUtility.sharedInstance.requestedForAccess { [weak self] (success) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
              self.contactTableView.reloadDataInMain()
            } else {
              ContactUtility.sharedInstance.requestedForAccess { [weak self] (_) in
                
                guard let `self` = self else {
                    return
                }
                
                self.manageViewState(.error(message: LocalizedKey.grandUseContactPermission.value, actionType: .setting))
              }
            }
          }
          
          if self.mycontactVM.recentUsers.count == 0 {
            self.contactTableHeaderView.isHidden = true
            self.headerViewHeightConstraint.constant = 0
            self.contactTableView.layoutTableHeaderView()
          } else {
            self.contactTableHeaderView.isHidden = false
            self.headerViewHeightConstraint.constant = 148
            self.contactTableView.layoutTableHeaderView()
            self.recentCollectionView.reloadData()
          }
        }
    }
    
    private func callcheckPhoneAPI(phoneContact: Contact) {
        
        guard let phoneNumber = phoneContact.mobileNumber else {
            return
        }
        
        let parameters = [
            "phoneNumberCountryCode": "", // this field empty as per the conversation with backend team
            "phoneNumber": phoneNumber
        ]
        
        mycontactVM.checkPhoneAPI(parameters: parameters) { [weak self] (success, message) in
            
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
  
    private func callContactSyncAPI() {
        
        var contactDict = [String: String]()
        var contacts: [Any] = []
        
        for phoneContact in appDelegate.updatedContacts {
            contactDict["phoneNumberCountryCode"] = phoneContact.countryCode ?? ""
            contactDict["phoneNumber"] = phoneContact.mobileNumber ?? ""
            contacts.append(contactDict)
        }
        
        let parameters: HTTPParameters = [
            "contacts": contacts
        ]
        
        mycontactVM.contactSyncAPI(parameters: parameters) { [weak self] (success, _) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                
                ContactUtility.sharedInstance.requestedForAccess { [weak self] (isAllow) in
                    
                    guard let `self` = self else {
                        return
                    }
                    
                    if isAllow {
                        ContactUtility.sharedInstance.saveApiAppUserStatusInDB(users: self.mycontactVM.contactUsers) { [weak self] in
                            
                            guard let `self` = self else {
                                return
                            }
                            
                            self.fetchDBContact()
                            self.contactTableView.reloadDataInMain()
                        }
                    }
                }
            }
        }
    }

}

// MARK: - PlaceholderDelegate

extension MyContactVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .noConnectionKey:
        callRecentUserAPI()
    default:
      break
    }
    
    switch placeholder.data?.action {
    case .setting:
      if let settings = URL(string: UIApplication.openSettingsURLString),
          UIApplication.shared.canOpenURL(settings) {
          UIApplication.shared.open(settings)
      }
    case .tryAgain:
      callRecentUserAPI()
    default:
      break
    }
  }
}

extension UITableView {
  
  // Variable-height UITableView tableHeaderView with autolayout
  func layoutTableHeaderView() {
    
    guard let headerView = self.tableHeaderView else { return }
    headerView.translatesAutoresizingMaskIntoConstraints = false
    
    let headerWidth = headerView.bounds.size.width
    let temporaryWidthConstraints = NSLayoutConstraint.constraints(withVisualFormat: LocalizedKey.headerWidth.value, options: NSLayoutConstraint.FormatOptions(rawValue: UInt(0)), metrics: [LocalizedKey.width.value: headerWidth], views: [LocalizedKey.headerView.value: headerView]) // swiftlint:disable:this line_length
    
    headerView.addConstraints(temporaryWidthConstraints)
    
    headerView.setNeedsLayout()
    headerView.layoutIfNeeded()
    
    let headerSize = headerView.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
    let height = headerSize.height
    var frame = headerView.frame
    
    frame.size.height = height
    headerView.frame = frame
    
    self.tableHeaderView = headerView
    
    headerView.removeConstraints(temporaryWidthConstraints)
    headerView.translatesAutoresizingMaskIntoConstraints = true
    
  }
}
