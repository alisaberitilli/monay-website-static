//
//  FilteredTransactionVC.swift
//  Monay
//
//  Created by WFH on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import TagListView

class FilteredTransactionVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var filterTagView: TagListView!
    @IBOutlet weak var clearFilterButton: UIButton!
    @IBOutlet weak var transactionTableView: TableView!
    @IBOutlet weak var constraintTopTable: NSLayoutConstraint!
    
    // MARK: - Instance properties
    
    let filteredTransactionVM = FilteredTransactionVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        clearFilterUnderline()
        configuretableView()
        
        manageFilterTageView()
        callTransactionAPI()
    }
    
    private func configuretableView() {
        transactionTableView.placeholderDelegate = self
        transactionTableView.register(
          UINib(nibName: TransactionCell.reuseIdentifier, bundle: nil),
          forCellReuseIdentifier: TransactionCell.reuseIdentifier)
    }
    
    private func clearFilterUnderline() {
        let underlineAttribute: [NSAttributedString.Key: Any] = [
            .foregroundColor: Color.blue,
            .underlineStyle: NSUnderlineStyle.single.rawValue
        ]
        
      let attributeString = NSMutableAttributedString(string: LocalizedKey.clearFilter.value,
                                                        attributes: underlineAttribute)
        clearFilterButton.setAttributedTitle(attributeString, for: .normal)
    }
    
    private func manageFilterTageView() {
        let transactionFilter = TransactionFilter.default
        
        if !transactionFilter.fromDate.isEmpty || !transactionFilter.toDate.isEmpty {
            let fromDate = transactionFilter.fromDate
            let toDate = transactionFilter.toDate
            let dateFilter = !toDate.isEmpty ? "\(fromDate) - \(toDate)" : fromDate

            filteredTransactionVM.filteredTags.append(dateFilter)
        }
        
        if !transactionFilter.name.isEmpty {
            filteredTransactionVM.filteredTags.append(transactionFilter.name)
        }
        
        if !transactionFilter.minPrice.isEmpty || !transactionFilter.maxPrice.isEmpty {
            let minPrice = transactionFilter.minPrice
            let maxPrice = transactionFilter.maxPrice
            let currency = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            
            let priceFilter = !minPrice.isEmpty && !maxPrice.isEmpty ? "\(currency) \(minPrice) - \(currency) \(maxPrice)" : !minPrice.isEmpty ? "\(currency) \(minPrice)" : "\(currency) \(maxPrice)"
            
            filteredTransactionVM.filteredTags.append(priceFilter)
        }
        
        if !transactionFilter.transactionType.isEmpty {
               filteredTransactionVM.filteredTags.append(transactionFilter.transactionType)
           }
        
        if filteredTransactionVM.filteredTags.isEmpty {
            constraintTopTable.priority = UILayoutPriority(999)
        } else {
            constraintTopTable.priority = UILayoutPriority(249)
        }
        
        configureTagViews()
    }
    
    private func configureTagViews() {
        filterTagView.delegate = self
        filterTagView.textFont = .customFont(style: .regular, size: .medium)
        filterTagView.addTags(filteredTransactionVM.filteredTags)
        filterTagView.enableRemoveButton = true
    }
    
    private func resetPagination() {
        filteredTransactionVM.isInitialFetchCompleted = false
        filteredTransactionVM.offset = 0
        filteredTransactionVM.total = 0
        filteredTransactionVM.transactions.removeAll()
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !filteredTransactionVM.isFetching && filteredTransactionVM.transactions.count < filteredTransactionVM.total {
                filteredTransactionVM.isFetching = true
                filteredTransactionVM.isInitialFetchCompleted = true
                filteredTransactionVM.offset =  filteredTransactionVM.transactions.count
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
            
            guard let `self` = self else {
                return
            }
            
            self.filterTagView.removeAllTags()
            self.filteredTransactionVM.filteredTags = []
            
            self.manageFilterTageView()
            self.resetPagination()
            self.callTransactionAPI()
        }
        
        viewController.modalPresentationStyle = .overFullScreen
        present(viewController)
    }
    
    @IBAction func clearFilterButtonAction(_ sender: Any) {
        filterTagView.removeAllTags()
        filteredTransactionVM.filteredTags = []
        
        let transactionFilter = TransactionFilter.default
        transactionFilter.fromDate = ""
        transactionFilter.toDate = ""
        transactionFilter.name = ""
        transactionFilter.minPrice = ""
        transactionFilter.maxPrice = ""
        transactionFilter.transactionType = ""
        
        if filteredTransactionVM.filteredTags.isEmpty {
            constraintTopTable.priority = UILayoutPriority(751)
        }
        
        resetPagination()
        callTransactionAPI()
    }
}

// MARK: - Table view datasource methods

extension FilteredTransactionVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return filteredTransactionVM.transactions.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
      guard let cell = tableView.dequeueReusableCell(withIdentifier: TransactionCell.reuseIdentifier, for: indexPath) as? TransactionCell else {
            return UITableViewCell()
        }
        
        cell.selectionStyle = .none
        
        guard filteredTransactionVM.transactions.indices.contains(indexPath.row) else {
            return UITableViewCell()
        }
        
        cell.configure(transaction: filteredTransactionVM.transactions[indexPath.row])
        return cell
    }
}

// MARK: - Table view delegate methods

extension FilteredTransactionVC: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let viewController = StoryboardScene.Transaction.instantiateViewController(withClass: TransactionDetailVC.self)
        viewController.transactionDetailVM.transaction = filteredTransactionVM.transactions[indexPath.row]
        
        guard let transactionIdString = filteredTransactionVM.transactions[indexPath.row].id,
            let transactionIdInt = Int(transactionIdString) else {
                return
        }
        
        viewController.transactionDetailVM.transactionId = transactionIdInt
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - TagListViewDelegate

extension FilteredTransactionVC: TagListViewDelegate {
    func tagRemoveButtonPressed(_ title: String, tagView: TagView, sender: TagListView) {
        
        for (index, tag) in filteredTransactionVM.filteredTags.enumerated() where tag == title {
            
            filteredTransactionVM.filteredTags.remove(at: index)
        }
        
        let transactionFilter = TransactionFilter.default
        let fromDate = transactionFilter.fromDate
        let toDate = transactionFilter.toDate
        let dateFilter = !toDate.isEmpty ? "\(fromDate) - \(toDate)" : fromDate
        
        let minPrice = transactionFilter.minPrice
        let maxPrice = transactionFilter.maxPrice
        let currency = Authorization.shared.userCredentials.country?.currencyCode ?? ""
        let priceFilter = !minPrice.isEmpty && !maxPrice.isEmpty ? "\(minPrice)\(currency) - \(maxPrice)\(currency)" : !minPrice.isEmpty ? "\(minPrice)\(currency)" : "\(maxPrice)\(currency)"
        
        if dateFilter == title {
            transactionFilter.fromDate = ""
            transactionFilter.toDate = ""
        } else if transactionFilter.name == title {
            transactionFilter.name = ""
        } else if priceFilter == title {
            transactionFilter.minPrice = ""
            transactionFilter.maxPrice = ""
        } else if transactionFilter.transactionType == title {
            transactionFilter.transactionType = ""
        }
        
        filterTagView.removeAllTags()
        filterTagView.addTags(filteredTransactionVM.filteredTags)
        
        if filteredTransactionVM.filteredTags.isEmpty {
            constraintTopTable.priority = UILayoutPriority(751)
        }
        
        resetPagination()
        callTransactionAPI()
    }
}

// MARK: - API Calling

extension FilteredTransactionVC {
    private func callTransactionAPI() {
      filteredTransactionVM.userTransactionAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.transactionTableView.showLoaderAtBottom(false)
        self.transactionTableView.reloadDataInMain()
      }
      
    }
}

// MARK: - PlaceholderDelegate

extension FilteredTransactionVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callTransactionAPI()
      
    default:
      break
    }
  }
}
