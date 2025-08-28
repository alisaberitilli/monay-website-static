//
//  HomeVC.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class HomeVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var userNameLabel: UILabel!
    @IBOutlet weak var paymentTransactionTableView: TableView!
    @IBOutlet weak var walletLabel: UILabel!
    @IBOutlet weak var transactionTableHeaderView: UIView!
    @IBOutlet weak var notificationUnreadCountLabel: UILabel!
    @IBOutlet weak var unreadConainerView: UIView!
    @IBOutlet weak var walletBalanceLabel: UILabel!
    @IBOutlet weak var addMoneyView: UIView!
    @IBOutlet weak var requestMoneyView: UIView!
    @IBOutlet weak var addMoneyButton: UIButton!
    @IBOutlet weak var requestMoneyButton: UIButton!

    // MARK: - Instance properties
    
    let homeVM = HomeVM()
    
     // MARK: - View controller lifecycle methods

    override func viewDidLoad() {
        super.viewDidLoad()
        contactList()
        addNotificationObserver()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        callBiometricAuthentication()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    @objc private func contactList() {
        let taskContext = CoreDataManager.sharedInstance.managedObjectContext
        
        homeVM.phoneContacts = CoreDataManager.sharedInstance.getObjectsforEntity(strEntity: LocalizedKey.contact.value, taskContext: taskContext) as! [Contact] // swiftlint:disable:this force_cast
        
        if !homeVM.phoneContacts.isEmpty {
            callContactSyncAPI()
        }
    }
    
    private func addNotificationObserver() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(contactList),
            name: NSNotification.Name(rawValue: kNotificationContactSync),
            object: nil)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(refereshNotificationReadUnreadCount),
            name: NSNotification.Name(rawValue: kNotificationReadUnreadCountRefresh),
            object: nil)
    }
    
    @objc private func refereshNotificationReadUnreadCount() {
    }
  
    private func callBiometricAuthentication() {
        if BiometricAuthenticator.shared.isTouchIdDevice() &&
            !BiometricAuthenticator.shared.touchIDAvailable() {
            
            userDefualt.set(false, forKey: AppKey.User.isBiometricEnable.rawValue)
        } else if BiometricAuthenticator.shared.isFaceIdDevice() &&
            !BiometricAuthenticator.shared.faceIDAvailable() {
            
            userDefualt.set(false, forKey: AppKey.User.isBiometricEnable.rawValue)
        }
        
        guard AppKey.User.isBiometricEnable.valueAsBool,
            !isBiometricAuthenticated else {
                return
        }
        
        BiometricBackgroundView.show { [weak self] (callbackType) in
            
            guard let `self` = self else {
                return
            }
            
            switch callbackType {
            case APIKey.success:
                isBiometricAuthenticated = true
                
            case APIKey.failure:
              let title = LocalizedKey.pleaseAuthenticate.value
              let message = LocalizedKey.appProtactsDataToAvoidUnauthorizeAccess.value
                let okTitle = LocalizedKey.ok.value
                
                self.showAlert(title: title, message: message, okTitle: okTitle) { (_) in
                    self.callBiometricAuthentication()
                }
            
            default: break
            }
        }
    }
    
    private func initialSetup() {
        configuretableView()
        addTapGesturOnUserImage()
        setupUI()
        callHomePI()
    }
    
    private func setNotificationUnreadCount() {
        notificationUnreadCountLabel.text = homeVM.unReadCount
        unreadConainerView.isHidden = homeVM.unReadCount.isEmpty || homeVM.unReadCount.isEqual(to: "0")
        UIApplication.shared.applicationIconBadgeNumber = Int(homeVM.unReadCount) ?? 0
    }
    
    private func configuretableView() {
        paymentTransactionTableView.placeholderDelegate = self
        paymentTransactionTableView.register(
          UINib(nibName: PaymentRequestHeaderCell.identifier, bundle: nil),
          forCellReuseIdentifier: PaymentRequestHeaderCell.identifier)
        paymentTransactionTableView.register(
            UINib(nibName: TransactionCell.reuseIdentifier, bundle: nil),
            forCellReuseIdentifier: TransactionCell.reuseIdentifier)
        paymentTransactionTableView.tableHeaderView = transactionTableHeaderView
        paymentTransactionTableView.shouldHideHeaderView = false
        if #available(iOS 15.0, *) { UITableView.appearance().sectionHeaderTopPadding = 0 }
    }
    
    private func addTapGesturOnUserImage() {
        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(userProfileImageTapped(_:)))
        userImageView.isUserInteractionEnabled = true
        userImageView.addGestureRecognizer(tapGestureRecognizer)
    }
    
    private func setupUI() {
        userNameLabel.text = "Hi, \(Authorization.shared.userCredentials.firstName.value) \(Authorization.shared.userCredentials.lastName.value)"
        let profileString = Authorization.shared.userCredentials.profileImage.value
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
      let isSecondaryUser = Authorization.shared.userCredentials.userType == .secondaryUser
      walletBalanceLabel.text = isSecondaryUser ? "Total Wallet Balance" : "Wallet Balance"
      addMoneyButton.backgroundColor = isSecondaryUser ? UIColor(red: 233/255, green: 233/255, blue: 233/255, alpha: 1.0) : .white
      requestMoneyButton.backgroundColor = isSecondaryUser ? UIColor(red: 233/255, green: 233/255, blue: 233/255, alpha: 1.0) : .white
      addMoneyButton.isUserInteractionEnabled = !isSecondaryUser
      requestMoneyButton.isUserInteractionEnabled = !isSecondaryUser
      addMoneyButton.setTitleColor(isSecondaryUser ? UIColor(red: 168/255, green: 168/255, blue: 168/255, alpha: 1.0) : Color.blue, for: .normal)
      requestMoneyButton.setTitleColor(isSecondaryUser ? UIColor(red: 168/255, green: 168/255, blue: 168/255, alpha: 1.0) : Color.blue, for: .normal)
    }
    
    @objc func userProfileImageTapped(_ sender: AnyObject) {
        tabBarController?.selectedIndex = 3
    }
    
    private func moveToPaymentRequest(segmentType: String) {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: PaymentRequestVC.self)
      UserDefaults.standard.set(segmentType, forKey: LocalizedKey.paymentRequestType.value)
        hideCircleView()
        pushVC(viewController)
    }
    
    private func moveToContact(type: PaymentType) {
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: MyContactVC.self)
        viewController.mycontactVM.paymentType = type
        hideCircleView()
        pushVC(viewController)
    }
    
    private func moveToTransaction() {
        appDelegate.setDashboardRoot()
        guard let tabbarController = appDelegate.window?.rootViewController as? TabBarController else {
            return
        }
        tabbarController.selectedIndex = 1
    }
    
    private func redirectToPayMoney(peymentRequest: PaymentRequest) {
        guard let user = peymentRequest.fromUser,
            let requestId = peymentRequest.id,
            let amount = peymentRequest.amount else {
                return
        }
        
        let viewController = StoryboardScene.Main.instantiateViewController(withClass: PayMoneyVC.self)
        viewController.payMoneyVM.user = user
        viewController.payMoneyVM.requestId = requestId
        viewController.payMoneyVM.amount = amount
        viewController.payMoneyVM.isUserRequestPayMoney = true
        hideCircleView()
        pushVC(viewController)
    }
    
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        paymentTransactionTableView.showLoading()
        
      case .defaultState:
        paymentTransactionTableView.showDefault()
        
      case .noConnection:
        paymentTransactionTableView.showNoConnection()
        
      case .error(let message, let actionType):
        paymentTransactionTableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        paymentTransactionTableView.showNoResults(title: message, message: PlaceholderStateData.noTransactionFound.message, image: "")
        
      default:
        break
      }
    }

    // MARK: - IBAction methods
    
    @IBAction func notificationButtonAction(_ sender: Any) {
        let viewController = StoryboardScene.More.instantiateViewController(withClass: NotificationVC.self)
        hideCircleView()
        pushVC(viewController)
    }
    
    @IBAction func sendMoneyButtonAction(_ sender: Any) {
        moveToContact(type: .send)
    }
    
    @IBAction func requestMoneyAction(_ sender: Any) {
        moveToContact(type: .request)
    }
    
    @IBAction func addMoneyButtonAction(_ sender: Any) {
      
      let viewController = StoryboardScene.Profile.instantiateViewController(withClass: AddMoneyVC.self)
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - Table view datasource methods

extension HomeVC: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch section {
        case 0:
            return homeVM.paymentRequests.count
        case 1:
            return homeVM.recentTransactions.count
        default:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        switch indexPath.section {
        case 0:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: DashboardPaymentRequestCell.identifier, for: indexPath) as? DashboardPaymentRequestCell else {
                return UITableViewCell()
            }
            
            cell.tag = indexPath.row
            cell.selectionStyle = .none
            
            cell.configure(paymentRequest: homeVM.paymentRequests[indexPath.row])
            
            cell.callbackDeclineButton = { [weak self] index in
                
                guard let `self` = self else {
                    return
                }
                
                self.definesPresentationContext = true
                self.providesPresentationContextTransitionStyle = true
                
                self.overlayBlurredBackgroundView()
                let viewController = StoryboardScene.Main.instantiateViewController(withClass: RequestDeclineVC.self)
                viewController.view.backgroundColor = .clear
                viewController.onCompleteRequestDecline = { reasonText in
                    self.removeBlurredBackgroundViewView()
                    self.callDeclinePaymentRequestAPI(paymentRequest: self.homeVM.paymentRequests[index], declineReason: reasonText)
                }
                
                viewController.onCrossClick = {
                    self.removeBlurredBackgroundViewView()
                }
                
                viewController.modalPresentationStyle = .overFullScreen
                self.present(viewController)
                
            }
            
            cell.callbackPayButton = { [weak self] index in
            
                guard let `self` = self else {
                    return
                }
                
                self.redirectToPayMoney(peymentRequest: self.homeVM.paymentRequests[index])
            }
            
            return cell
        case 1:
            guard let cell = tableView.dequeueReusableCell(withIdentifier: TransactionCell.reuseIdentifier, for: indexPath) as? TransactionCell else {
                return UITableViewCell()
            }
            
            cell.selectionStyle = .none
            cell.configure(transaction: homeVM.recentTransactions[indexPath.row])
            
            return cell
        default:
            return UITableViewCell()
        }
    }
}

// MARK: - Table view delegate methods

extension HomeVC: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        switch indexPath.section {
        case 1:
            let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionDetailVC.self)
            viewController.transactionDetailVM.transaction = homeVM.recentTransactions[indexPath.row]
            
            guard let transactionIdString = homeVM.recentTransactions[indexPath.row].id,
                let transactionIdInt = Int(transactionIdString) else {
                    return
            }
            
            viewController.transactionDetailVM.transactionId = transactionIdInt
            hideCircleView()
            pushVC(viewController)
            
        default:
            break
        }
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return UITableView.automaticDimension
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        
        switch section {
        case 0:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentRequestHeaderCell.identifier) as? PaymentRequestHeaderCell else {
                return UITableViewCell()
            }
          cell.titleLabel.text = LocalizedKey.paymentRequest.value
            cell.bgView.clipsToBounds = true
            cell.bgView.layer.cornerRadius = 10.0
            cell.bgView.layer.maskedCorners = [
                .layerMinXMinYCorner,
                .layerMaxXMinYCorner
            ]
            
            let attributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.customFont(style: .medium, size: .custom(14)),
                .foregroundColor: Color.blue,
                .underlineStyle: NSUnderlineStyle.single.rawValue
            ]
            
          let attributeString = NSMutableAttributedString(string: LocalizedKey.viewAll.value, attributes: attributes)
            cell.viewAllButton.setAttributedTitle(attributeString, for: .normal)
            
            cell.callbackViewAll = { [weak self] in
                
                guard let `self` = self else {
                    return
                }
                
              self.moveToPaymentRequest(segmentType: LocalizedKey.received.value)
            }
            
            return cell
        case 1:
          guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentRequestHeaderCell.identifier) as? PaymentRequestHeaderCell else {
                return UITableViewCell()
            }
          cell.titleLabel.text = LocalizedKey.recentTransactions.value
            cell.viewAllButton.isHidden = true
            
            cell.callbackViewAll = { [weak self] in
                
                guard let `self` = self else {
                    return
                }
                
                self.moveToTransaction()
            }
            
            return cell
        default:
            return UITableViewCell()
        }
    }
    
    func tableView(_ tableView: UITableView, heightForFooterInSection section: Int) -> CGFloat {
        switch section {
        case 0:
            if homeVM.paymentRequests.count == 0 {
                return 50
            } else {
                return 0
            }
        case 1:
            if homeVM.recentTransactions.count == 0 {
                return 50
            } else {
                return 0
            }
        default:
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, viewForFooterInSection section: Int) -> UIView? {
        
        let footerView = UIView()
        footerView.backgroundColor = .white
        let titleLabel = UILabel(frame: CGRect(x: 10, y: 10, width: tableView.frame.size.width, height: 50))
        titleLabel.textAlignment = .center
        titleLabel.numberOfLines = 1
        titleLabel.backgroundColor = UIColor.clear
        titleLabel.textColor = #colorLiteral(red: 0.7019607843, green: 0.7215686275, blue: 0.7647058824, alpha: 1)
        titleLabel.font = UIFont.customFont(style: .bold, size: .custom(14))
        
        footerView.addSubview(titleLabel)
        
        switch section {
        case 0:
            titleLabel.text = PlaceholderStateData.noRequest.title
            if homeVM.paymentRequests.count == 0 {
                return footerView
            }
            
            return nil
        case 1:
            titleLabel.text = PlaceholderStateData.noTransactionFound.title
            if homeVM.recentTransactions.count == 0 {
                return footerView
            }
            
            return nil
        default:
            return nil
        }
    }
}

// MARK: - API Call

extension HomeVC {
    private func callHomePI() {
        
        homeVM.paymentRequests = []
        homeVM.recentTransactions = []
        self.manageViewState(.defaultState)

        homeVM.homeAPI({ (currentState) in
          self.manageViewState(currentState)
        }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
            
            UIView.transition(
                with: self.paymentTransactionTableView,
                duration: 0.1, options: .transitionCrossDissolve,
                animations: { self.paymentTransactionTableView.reloadDataInMain() },
                completion: nil)
          
          DispatchQueue.main.async {
            let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            self.walletLabel.text = "\(currencySymbol) \(Authorization.shared.userCredentials.userType == .secondaryUser ? self.homeVM.totalSecondaryUserAmount : self.homeVM.totalWalletAmount)"
            self.setNotificationUnreadCount()
          }
        }
    }
    
    private func callDeclinePaymentRequestAPI(paymentRequest: PaymentRequest, declineReason: String) {
        
        guard let requestIdString = paymentRequest.id,
            let requestId = Int(requestIdString) else {
                return
        }
        
        let parameters: HTTPParameters = [
            "requestId": requestId,
            "declineReason": declineReason
        ]
        
        homeVM.declinePaymentRequestAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.callHomePI()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callContactSyncAPI() {
        
        var contactDict = [String: String]()
        var contacts: [Any] = []
        
        let taskContext = CoreDataManager.sharedInstance.managedObjectContext
        
        let contactsSaveStatus = CoreDataManager.sharedInstance.getObjectsforEntity(strEntity: LocalizedKey.contactSaveStatus.value, taskContext: taskContext) as! [ContactSaveStatus] // swiftlint:disable:this force_cast
        
        if contactsSaveStatus.count > 0, contactsSaveStatus.first?.isAllContactSave ?? true {
            
            for phoneContact in appDelegate.updatedContacts {
                contactDict["phoneNumberCountryCode"] = phoneContact.countryCode ?? ""
                contactDict["phoneNumber"] = phoneContact.mobileNumber ?? ""
                contacts.append(contactDict)
            }
            
        } else {
            
            for phoneContact in homeVM.phoneContacts {
                contactDict["phoneNumberCountryCode"] = phoneContact.countryCode ?? ""
                contactDict["phoneNumber"] = phoneContact.mobileNumber ?? ""
                contacts.append(contactDict)
            }
        }
        
        let parameters: HTTPParameters = [
            "contacts": contacts
        ]
        
        homeVM.contactSyncAPI(parameters: parameters) { [weak self] (success, _) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                ContactUtility.sharedInstance.requestedForAccess { [weak self] (isAllow) in
                    
                    guard let `self` = self else {
                        return
                    }
                    
                    if isAllow {
                        ContactUtility.sharedInstance.saveApiAppUserStatusInDB(users: self.homeVM.appUsers) {
                            
                            let contactSaveStatus = CoreDataManager.sharedInstance.createObjectForEntity(
                                                entityName: LocalizedKey.contactSaveStatus.value,
                                                taskContext: sharedCoreDataManager.bGManagedObjectContext) as! ContactSaveStatus // swiftlint:disable:this force_cast
                            
                            contactSaveStatus.isAllContactSave = true
                            sharedCoreDataManager.saveContextInBG()
                      
                        }
                    }
                }
            }
        }
    }
}

// MARK: - PlaceholderDelegate

extension HomeVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callHomePI()
      
    default:
      break
    }
  }
}
