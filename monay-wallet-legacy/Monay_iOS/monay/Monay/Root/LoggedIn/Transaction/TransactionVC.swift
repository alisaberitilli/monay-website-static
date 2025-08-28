//
//  TransactionVC.swift
//  Monay
//
//  Created by WFH on 18/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class TransactionVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var transactionTableView: TableView!
    
    // MARK: - Instance properties
    
    let transactionVM = TransactionVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        resetPagination()
        callTransactionAPI()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
    }
    
    private func configuretableView() {
        transactionTableView.placeholderDelegate = self
        transactionTableView.register(
          UINib(nibName: TransactionCell.reuseIdentifier, bundle: nil),
          forCellReuseIdentifier: TransactionCell.reuseIdentifier)
    }
    
    private func resetPagination() {
        transactionVM.isInitialFetchCompleted = false
        transactionVM.offset = 0
        transactionVM.total = 0
        transactionVM.transactions.removeAll()
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !transactionVM.isFetching && transactionVM.transactions.count < transactionVM.total {
                transactionVM.isFetching = true
                transactionVM.isInitialFetchCompleted = true
                transactionVM.offset =  transactionVM.transactions.count
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
    
    @IBAction func filterButtonAction(_ sender: Any) {
        definesPresentationContext = true
        providesPresentationContextTransitionStyle = true
        
        overlayBlurredBackgroundView()
        let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionFilterVC.self)
        viewController.onComplete = { [weak self] in
            self?.removeBlurredBackgroundViewView()
        }
        
        viewController.callbackApply = { [weak self] in
            let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: FilteredTransactionVC.self)
            self?.hideCircleView()
            self?.pushVC(viewController)
        }
        
        viewController.modalPresentationStyle = .overFullScreen
        present(viewController)
    }
}

// MARK: - Table view datasource methods

extension TransactionVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return transactionVM.transactions.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
      guard let cell = tableView.dequeueReusableCell(withIdentifier: TransactionCell.reuseIdentifier, for: indexPath) as? TransactionCell else {
            return UITableViewCell()
        }
        
        cell.selectionStyle = .none
        
        cell.configure(transaction: transactionVM.transactions[indexPath.row])
        return cell
    }
}

// MARK: - Table view delegate methods

extension TransactionVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionDetailVC.self)
        viewController.transactionDetailVM.transaction = transactionVM.transactions[indexPath.row]
        
        guard let transactionIdString = transactionVM.transactions[indexPath.row].id,
            let transactionIdInt = Int(transactionIdString) else {
                return
        }
        
        viewController.transactionDetailVM.transactionId = transactionIdInt
        
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - API Calling

extension TransactionVC {
    private func callTransactionAPI() {
      transactionVM.userTransactionAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.transactionTableView.showLoaderAtBottom(false)
        self.transactionTableView.reloadDataInMain()
      }
      
    }
}

// MARK: - PlaceholderDelegate

extension TransactionVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callTransactionAPI()
      
    default:
      break
    }
  }
}
