//
//  MyWalletVC.swift
//  Monay
//
//  Created by WFH on 12/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class MyWalletVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var transactionTableView: TableView!
    @IBOutlet weak var totalWalletBalanceLabel: UILabel!
    @IBOutlet weak var sentWalletLabel: UILabel!
    @IBOutlet weak var receivedWalletLabel: UILabel!
    @IBOutlet weak var addMoneyButton: UIButton!

    // MARK: - Instance properties
    
    let myWalletVM = MyWalletVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        self.addMoneyButton.isHidden = Authorization.shared.userCredentials.userType == .secondaryUser
        configuretableView()
        callWalletAPI()
        callTransactionAPI()
    }
    
    private func configuretableView() {
        transactionTableView.placeholderDelegate = self
        transactionTableView.register(
          UINib(nibName: TransactionCell.reuseIdentifier, bundle: nil),
            forCellReuseIdentifier: TransactionCell.reuseIdentifier)
        transactionTableView.register(
          UINib(nibName: PaymentRequestHeaderCell.identifier, bundle: nil),
            forCellReuseIdentifier: PaymentRequestHeaderCell.identifier)
    }
    
    private func setupData(wallet: Wallet) {
        
        if let totalWalletAmount = wallet.totalWalletAmount,
            let debitWalletAmount = wallet.debitWalletAmount,
            let creditWalletAmount = wallet.creditWalletAmount {
            let currency = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            let secondaryUserLimit = wallet.secondaryUserLimit ?? ""
            totalWalletBalanceLabel.text = currency + " " + (Authorization.shared.userCredentials.userType == .secondaryUser ? secondaryUserLimit : totalWalletAmount)
            sentWalletLabel.text = currency + " "  + debitWalletAmount
            receivedWalletLabel.text = currency + " " + creditWalletAmount
        }
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !myWalletVM.isFetching && myWalletVM.transactions.count < myWalletVM.total {
                myWalletVM.isFetching = true
                myWalletVM.isInitialFetchCompleted = true
                myWalletVM.offset =  myWalletVM.transactions.count
                transactionTableView.showLoaderAtBottom(true)
                callTransactionAPI()
            }
        }
    }
    
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        transactionTableView.showLoading()
        
      case .defaultState:
        transactionTableView.showDefault()
        
      case .noConnection:
        transactionTableView.showNoConnection()
        
      case .error(let message, let actionType):
        transactionTableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        transactionTableView.showNoResults(title: message, message: PlaceholderStateData.noTransactionFound.message, image: "")
        
      default:
        break
      }
    }

    // MARK: - IBAction methods
    
    @IBAction func addMoneyButtonAction(_ sender: Any) {
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: AddMoneyVC.self)
        pushVC(viewController)
    }
}

// MARK: - Table view datasource methods

extension MyWalletVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return myWalletVM.transactions.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: TransactionCell.reuseIdentifier, for: indexPath) as? TransactionCell else {
            return UITableViewCell()
        }
        
        cell.selectionStyle = .none
        cell.configure(transaction: myWalletVM.transactions[indexPath.row])
        return cell
    }
}

// MARK: - Table view delegate methods

extension MyWalletVC: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentRequestHeaderCell.identifier) as? PaymentRequestHeaderCell else {
            return UITableViewCell()
        }
        
        cell.viewAllButton.isHidden = true
      cell.titleLabel.text = LocalizedKey.transactions.value
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionDetailVC.self)
        viewController.transactionDetailVM.transaction = myWalletVM.transactions[indexPath.row]
        
        guard let transactionIdString = myWalletVM.transactions[indexPath.row].id,
            let transactionIdInt = Int(transactionIdString) else {
                return
        }
        
        viewController.transactionDetailVM.transactionId = transactionIdInt
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - API Call

extension MyWalletVC {
    private func callWalletAPI() {
        
        myWalletVM.walletAPI { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                guard let wallet = self.myWalletVM.wallet else { return }
                
                self.setupData(wallet: wallet)
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
    
    private func callTransactionAPI() {
        
      myWalletVM.userTransactionAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.transactionTableView.showLoaderAtBottom(false)
        self.transactionTableView.reloadDataInMain()
      }
    }
}

// MARK: - PlaceholderDelegate

extension MyWalletVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callTransactionAPI()
        callWalletAPI()
        
    default:
      break
    }
  }
}
