//
//  TransactionAccountVC.swift
//  Monay
//
//  Created by Codiant on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class TransactionAccountVC: UIViewController {

    @IBOutlet weak var transactionTableView: TableView!

    var getID = ""
    var viewModal = TransactionAccountVM()
  
    override func viewDidLoad() {
      super.viewDidLoad()
      configuretableView()
      resetPagination()
      self.callTransictionApi()
    }
  
  func scrollViewDidScroll(_ scrollView: UIScrollView) {
      let currentOffsetY = scrollView.contentOffset.y
      let totalContentHeight = scrollView.contentSize.height
      let screenHeight = Screen.height
      
      let maxOffsetY = totalContentHeight - (screenHeight + 200)
      
    if currentOffsetY > maxOffsetY {
      if !viewModal.isFetching && viewModal.transactions.count < viewModal.total {
        viewModal.isFetching = true
        viewModal.isInitialFetchCompleted = true
        viewModal.offset =  viewModal.transactions.count
        transactionTableView.showLoaderAtBottom(true)
        callTransictionApi()
      }
    }
  }

  private func resetPagination() {
    viewModal.isInitialFetchCompleted = false
    viewModal.offset = 0
    viewModal.total = 0
    viewModal.transactions.removeAll()
  }
  
    private func configuretableView() {
      transactionTableView.placeholderDelegate = self
        transactionTableView.register(
          UINib(nibName: AccountTransactionCell.identifier, bundle: nil),
          forCellReuseIdentifier: AccountTransactionCell.identifier)
      transactionTableView.estimatedRowHeight = 100
      transactionTableView.rowHeight = UITableView.automaticDimension
      transactionTableView.contentInset = UIEdgeInsets(top: 5, left: 0, bottom: 0, right: 0)
    }
  
  func callTransictionApi() {
    self.viewModal.secondaryUserTransactionAPI(id: self.getID) { state in
      self.manageViewState(state)
    } completion: {
      self.transactionTableView.showLoaderAtBottom(false)
      self.transactionTableView.reloadDataInMain()
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
  
}

extension TransactionAccountVC: UITableViewDataSource {

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
      return self.viewModal.transactions.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
      guard let cell = tableView.dequeueReusableCell(withIdentifier: AccountTransactionCell.identifier, for: indexPath) as? AccountTransactionCell else {
            return UITableViewCell()
        }
      cell.configure(transaction: viewModal.transactions[indexPath.row])
        return cell
    }
}

// MARK: - Table view delegate methods

extension TransactionAccountVC: UITableViewDelegate {
    
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    
    let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionDetailVC.self)
    viewController.transactionDetailVM.transaction = viewModal.transactions[indexPath.row]
    
    guard let transactionIdString = viewModal.transactions[indexPath.row].id,
          let transactionIdInt = Int(transactionIdString) else {
      return
    }
    
    viewController.transactionDetailVM.transactionId = transactionIdInt
    pushVC(viewController)
  }
}

extension TransactionAccountVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
      self.callTransictionApi()
    default:
      break
    }
  }
}
