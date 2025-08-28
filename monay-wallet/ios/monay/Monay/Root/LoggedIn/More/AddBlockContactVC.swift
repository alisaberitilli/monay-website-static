//
//  MyContactVC.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddBlockContactVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var contactTableView: TableView!
    @IBOutlet weak var searchNameTextField: UITextField!
    
    // MARK: - Instance properties
    
    let addBlockContactVM = AddBlockContactVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupUI()
        configuretableView()
        updatedContacts()
        NotificationCenter.default.addObserver(self, selector: #selector(updatedContacts), name: NSNotification.Name(rawValue: kNotificationContactSync), object: nil)
    }
    
    private func setupUI() {
      searchNameTextField.attributedPlaceholder = NSAttributedString(string: LocalizedKey.enterNameMobileNumber.value,
                                                                       attributes: [NSAttributedString.Key.foregroundColor: UIColor.white])
    }
    
    private func configuretableView() {
        contactTableView.placeholderDelegate = self
        contactTableView.register(
            UINib(nibName: BlockContactCell.identifier, bundle: nil),
            forCellReuseIdentifier: BlockContactCell.identifier)
    }
    
    @objc func updatedContacts() {
      fetchDBContact()

      if self.addBlockContactVM.phoneContacts.count == 0 {
        DispatchQueue.main.async {
          ContactUtility.sharedInstance.requestedForAccess { (_) in
            self.manageViewState(.error(message: LocalizedKey.grandUseContactPermission.value, actionType: .setting))
          }
        }
      } else {
        self.callContactSyncAPI()
      }
    }

    private func fetchDBContact() {
        let taskContext = CoreDataManager.sharedInstance.managedObjectContext
       
      addBlockContactVM.phoneContacts = CoreDataManager.sharedInstance.getObjectsforEntity(strEntity: LocalizedKey.contact.value, taskContext: taskContext) as! [Contact] // swiftlint:disable:this force_cast
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
    
    @IBAction func searchNameEditingChange(_ sender: UITextField) {
        
        let searchText = sender.text ?? ""
        
        addBlockContactVM.filteredAppUsers = searchText.isEmpty ? addBlockContactVM.appUsers : addBlockContactVM.appUsers.filter { (appUser) -> Bool in
            let isUserExist = (appUser.firstName?.lowercased().contains(searchText.lowercased()) ?? false || appUser.phoneNumber?.contains(searchText) ?? false)
            return isUserExist
        }
        
        contactTableView.reloadData()
    }
}

// MARK: - Table view datasource methods

extension AddBlockContactVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
          return addBlockContactVM.filteredAppUsers.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
      guard let cell = tableView.dequeueReusableCell(withIdentifier: BlockContactCell.identifier, for: indexPath) as? BlockContactCell else {
            return UITableViewCell()
        }
        
        cell.tag = indexPath.row
      cell.blockUnblockButton.setTitle(LocalizedKey.block.value, for: .normal)
        cell.blockUnblockButton.setTitleColor(Color.blue, for: .normal)
        cell.underlineView.backgroundColor = Color.blue
        cell.constraintBlockUnblockViewWidth.constant = 40
        cell.configure(user: addBlockContactVM.filteredAppUsers[indexPath.row])
        
        cell.callbackBlockUnblock = { [weak self] _ in
            
            guard let `self` = self else {
                return
            }
            
            guard let userId = self.addBlockContactVM.filteredAppUsers[indexPath.row].id else {
                return
            }
            
            self.callBlockUserAPI(userId: userId)
        }
        
        return cell
    }
}

// MARK: - Table view delegate methods

extension AddBlockContactVC: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        return addBlockContactVM.filteredAppUsers.count > 0 ? 48.0 : 0
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let headerView = UIView(frame: CGRect(x: 0, y: 0, width: tableView.frame.width, height: 48))
        headerView.backgroundColor = .white
        
        let contactLabel = UILabel()
        contactLabel.frame = CGRect(x: 20, y: 15, width: headerView.frame.width - 40, height: headerView.frame.height - 15)
        contactLabel.font = UIFont.customFont(style: .bold, size: section == 0 ? UIFont.FontSize.mediumLarge : UIFont.FontSize.large)
        contactLabel.textColor = UIColor.black
        headerView.backgroundColor = #colorLiteral(red: 0.9999960065, green: 1, blue: 1, alpha: 1)
      contactLabel.text = LocalizedKey.contacts.value
        headerView.addSubview(contactLabel)
        return headerView
    }
}

// MARK: - API Call

extension AddBlockContactVC {
    
    private func callContactSyncAPI() {
        
      self.addBlockContactVM.filteredAppUsers.removeAll()
        
        var contactDict = [String: String]()
        var contacts: [Any] = []
        
        for phoneContact in addBlockContactVM.phoneContacts {
            contactDict["phoneNumberCountryCode"] = phoneContact.countryCode ?? ""
            contactDict["phoneNumber"] = phoneContact.mobileNumber ?? ""
            contacts.append(contactDict)
        }
        
        let parameters: HTTPParameters = [
            "contacts": contacts
        ]
        
      DispatchQueue.main.async {
        self.addBlockContactVM.contactSyncAPI(parameters: parameters, { [weak self] (currentState) in
            guard let `self` = self else {
                return
            }
            self.manageViewState(currentState)
        }) { [weak self] in // swiftlint:disable:this multiple_closures_with_trailing_closure
            guard let `self` = self else {
                return
            }
            self.contactTableView.showLoaderAtBottom(false)
            self.contactTableView.reloadDataInMain()
        }
      }
      
    }
    
    private func callBlockUserAPI(userId: String) {
        
        let parameters: HTTPParameters = [
            "blockUserId": userId
        ]
        
        addBlockContactVM.blockUserAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.addBlockContactVM.appUsers = []
                    self.addBlockContactVM.filteredAppUsers = []
                    self.callContactSyncAPI()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
}

// MARK: - PlaceholderDelegate

extension AddBlockContactVC: PlaceholderDelegate {
    
    func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
        switch placeholder.key {
        case .noConnectionKey:
            callContactSyncAPI()
            
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
          callContactSyncAPI()
        default:
          break
        }

    }
}
