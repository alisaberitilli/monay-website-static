//
//  PaymentPaidVC.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentPaidVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var sentTableView: TableView!
    
    // MARK: - Instance properties
    
    let paymentPaidVM = PaymentPaidVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callPaidPaymentRequestAPI()
    }
    
    private func configuretableView() {
        sentTableView.placeholderDelegate = self
        sentTableView.register(
          UINib(nibName: PaymentReceivedCell.identifier, bundle: nil),
          forCellReuseIdentifier: PaymentReceivedCell.identifier)
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !paymentPaidVM.isFetching && paymentPaidVM.paidRequests.count < paymentPaidVM.total {
                paymentPaidVM.isFetching = true
                paymentPaidVM.isInitialFetchCompleted = true
                paymentPaidVM.offset = paymentPaidVM.paidRequests.count
                sentTableView.showLoaderAtBottom(true)
                callPaidPaymentRequestAPI()
            }
        }
    }
  
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        sentTableView.showLoading()
        
      case .defaultState:
        sentTableView.showDefault()
        
      case .noConnection:
        sentTableView.showNoConnection()
        
      case .error(let message, let actionType):
        sentTableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        sentTableView.showNoResults(title: message, message: PlaceholderStateData.noRequest.message, image: "")
        
      default:
        break
      }
    }

}

// MARK: - Table view datasource methods

extension PaymentPaidVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return paymentPaidVM.paidRequests.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentReceivedCell.identifier, for: indexPath) as? PaymentReceivedCell else {
            return UITableViewCell()
        }
        
        cell.configure(paymentRequest: paymentPaidVM.paidRequests[indexPath.row], isHidePayDecline: true)
        return cell
    }
}

// MARK: - Table view delegate methods

extension PaymentPaidVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionDetailVC.self)
        let paidRequest = paymentPaidVM.paidRequests[indexPath.row]
        
        guard let transaction = paidRequest.transaction,
            let transactionIdString = transaction.id,
            let transactionIdInt = Int(transactionIdString) else {
                return
        }
        
        viewController.transactionDetailVM.transactionId = transactionIdInt
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - API Calling

extension PaymentPaidVC {
    private func callPaidPaymentRequestAPI() {
        
      paymentPaidVM.paidPaymentRequestAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.sentTableView.showLoaderAtBottom(false)
        self.sentTableView.reloadDataInMain()
      }
    }
}

// MARK: - PlaceholderDelegate

extension PaymentPaidVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callPaidPaymentRequestAPI()
      
    default:
      break
    }
  }
}
