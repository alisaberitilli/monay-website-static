//
//  PaymentReceivedVC.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentReceivedVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var reeeivedTableView: TableView!
    
    // MARK: - Instance properties
    
    let paymentReceivedVM = PaymentReceivedVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callReceivedPaymentRequestAPI()
    }
    
    private func configuretableView() {
        reeeivedTableView.placeholderDelegate = self
        reeeivedTableView.register(
          UINib(nibName: PaymentReceivedCell.identifier, bundle: nil),
            forCellReuseIdentifier: PaymentReceivedCell.identifier)
    }
    
    private func resetPagination() {
        paymentReceivedVM.total = 0
        paymentReceivedVM.offset = 0
        paymentReceivedVM.isInitialFetchCompleted = false
        paymentReceivedVM.isFetching = false
        paymentReceivedVM.receivedRequests = []
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
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !paymentReceivedVM.isFetching && paymentReceivedVM.receivedRequests.count < paymentReceivedVM.total {
                paymentReceivedVM.isFetching = true
                paymentReceivedVM.isInitialFetchCompleted = true
                paymentReceivedVM.offset = paymentReceivedVM.receivedRequests.count
                reeeivedTableView.showLoaderAtBottom(true)
                callReceivedPaymentRequestAPI()
            }
        }
    }
  
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        reeeivedTableView.showLoading()
        
      case .defaultState:
        reeeivedTableView.showDefault()
        
      case .noConnection:
        reeeivedTableView.showNoConnection()
        
      case .error(let message, let actionType):
        reeeivedTableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        reeeivedTableView.showNoResults(title: message, message: PlaceholderStateData.noRequest.message, image: "")
        
      default:
        break
      }
    }

}

// MARK: - Table view datasource methods

extension PaymentReceivedVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return paymentReceivedVM.receivedRequests.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        guard let cell = tableView.dequeueReusableCell(withIdentifier: PaymentReceivedCell.identifier, for: indexPath) as? PaymentReceivedCell else {
            return UITableViewCell()
        }
        
        cell.tag = indexPath.row
        cell.configure(paymentRequest: paymentReceivedVM.receivedRequests[indexPath.row], isHidePayDecline: false)
        
        cell.callbackPayButton = { [weak self] (_) in
            
            guard let `self` = self else {
                return
            }
            
            self.redirectToPayMoney(peymentRequest: self.paymentReceivedVM.receivedRequests[indexPath.row])
        }
        
        cell.callbackDeclineButton = { [weak self] (index) in
            
            guard let `self` = self else {
                return
            }

          let viewController = StoryboardScene.Main.instantiateViewController(withClass: RequestDeclineVC.self)
          viewController.onCompleteRequestDecline = { reasonText in
            self.callDeclinePaymentRequestAPI(paymentRequest: self.paymentReceivedVM.receivedRequests[index], declineReason: reasonText)
          }
          
          viewController.onCrossClick = {
          }
          
          viewController.modalPresentationStyle = .overCurrentContext
          self.present(viewController)
            
        }
        
        return cell
    }
}

// MARK: - Table view delegate methods

extension PaymentReceivedVC: UITableViewDelegate { }

// MARK: - API Calling

extension PaymentReceivedVC {
    private func callReceivedPaymentRequestAPI() {
        
      paymentReceivedVM.receivedPaymentRequestAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.reeeivedTableView.showLoaderAtBottom(false)
        self.reeeivedTableView.reloadDataInMain()
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
        
        paymentReceivedVM.declinePaymentRequestAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.resetPagination()
                    self.callReceivedPaymentRequestAPI()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - PlaceholderDelegate

extension PaymentReceivedVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callReceivedPaymentRequestAPI()
      
    default:
      break
    }
  }
}
