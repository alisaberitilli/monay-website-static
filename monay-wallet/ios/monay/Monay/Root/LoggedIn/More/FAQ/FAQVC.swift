//
//  FAQVC.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class FAQVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var tableView: TableView!
    @IBOutlet weak var backButton: UIButton!
    
    // MARK: - Instance properties
    
    let faqVM = FAQVM()
    
    // MARK: - Life Cycle Methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
        callFAQAPI()
    }
    
    private func configuretableView() {
        tableView.placeholderDelegate = self
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !faqVM.isFetching && faqVM.faqs.count < faqVM.total {
                faqVM.isFetching = true
                faqVM.isInitialFetchCompleted = true
                faqVM.offset = faqVM.faqs.count
                tableView.showLoaderAtBottom(true)
                callFAQAPI()
            }
        }
    }
  
    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        tableView.showLoading()
        
      case .defaultState:
        tableView.showDefault()
        
      case .noConnection:
        tableView.showNoConnection()
        
      case .error(let message, let actionType):
        tableView.showError(message: message, actionType: actionType)
        
      case .noResult(let message):
        tableView.showNoResults(title: message, message: PlaceholderStateData.noFAQ.message, image: "")
        
      default:
        break
      }
    }

}

// MARK: - Table view datasource methods

extension FAQVC: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return faqVM.faqs.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: FAQCell.reuseIdentifier, for: indexPath) as? FAQCell else { return UITableViewCell() }
        
        cell.configure(self.faqVM.faqs[indexPath.row])
        cell.callback = ({ [weak self] (itemCell) in
            
            guard let `self` = self else {
                return
            }
            
            if let index = self.tableView.indexPath(for: itemCell) {
                var faq = self.faqVM.faqs[index.row]
                faq.collapsed = !faq.collapsed
                self.faqVM.faqs[index.row] = faq
                let indexPath = IndexPath(item: index.row, section: 0)
                tableView.reloadRows(at: [indexPath], with: .none)
            }
        })
        cell.separatorView.isHidden = indexPath.row == (self.faqVM.faqs.count - 1)
        
        return cell
    }
}

extension FAQVC: UITableViewDelegate { }

// MARK: - API Calling

extension FAQVC {
    private func callFAQAPI() {
      faqVM.faqAPI({ (currentState) in
        self.manageViewState(currentState)
      }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
        self.tableView.showLoaderAtBottom(false)
        self.tableView.reloadDataInMain()
      }
      
    }
}

// MARK: - PlaceholderDelegate

extension FAQVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callFAQAPI()
      
    default:
      break
    }
  }
}
