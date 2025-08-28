//
//  BlockContactVC.swift
//  Monay
//
//  Created by WFH on 11/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class BlockedContactListVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var blockContactTableView: TableView!
    
    // MARK: - Instance properties
    
    let blockedContactListVM = BlockedContactListVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
         initialSetup()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        resetPagination()
        callUserBlockListAPI()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        configuretableView()
    }
    
    private func configuretableView() {
        blockContactTableView.placeholderDelegate = self
        blockContactTableView.register(
          UINib(nibName: BlockContactCell.identifier, bundle: nil),
          forCellReuseIdentifier: BlockContactCell.identifier)
    }
    
    private func resetPagination() {
        blockedContactListVM.total = 0
        blockedContactListVM.offset = 0
        blockedContactListVM.isInitialFetchCompleted = false
        blockedContactListVM.isFetching = false
        blockedContactListVM.users = []
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentOffsetY = scrollView.contentOffset.y
        let totalContentHeight = scrollView.contentSize.height
        let screenHeight = Screen.height
        
        let maxOffsetY = totalContentHeight - (screenHeight + 200)
        
        if currentOffsetY > maxOffsetY {
            if !blockedContactListVM.isFetching && blockedContactListVM.users.count < blockedContactListVM.total {
                blockedContactListVM.isFetching = true
                blockedContactListVM.isInitialFetchCompleted = true
                blockedContactListVM.offset =  blockedContactListVM.users.count
                blockContactTableView.showLoaderAtBottom(true)
                callUserBlockListAPI()
            }
        }
    }
    
    private func manageViewState(_ currentState: PlaceholderState) {
        switch currentState {
        case .loading:
            blockContactTableView.showLoading()
            
        case .defaultState:
            blockContactTableView.showDefault()
            
        case .noConnection:
            blockContactTableView.showNoConnection()
            
        case .error(let message, let actionType):
            blockContactTableView.showError(message: message, actionType: actionType)
            
        case .noResult(let message):
            blockContactTableView.showNoResults(title: message, message: PlaceholderStateData.noContact.message, image: "")
            
        default:
            break
        }
    }
    
    @IBAction func blockContactAction(_ sender: Any) {
        let viewController = StoryboardScene.More.instantiateViewController(withClass: AddBlockContactVC.self)
        hideCircleView()
        pushVC(viewController)
    }
}

// MARK: - Table view datasource methods

extension BlockedContactListVC: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return blockedContactListVM.users.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: BlockContactCell.identifier, for: indexPath) as? BlockContactCell else {
            return UITableViewCell()
        }
        
        cell.tag = indexPath.row
        cell.configure(user: blockedContactListVM.users[indexPath.row])
        
        cell.callbackBlockUnblock = { [weak self] index in
            
            guard let `self` = self else {
                return
            }
            
            let userId = self.blockedContactListVM.users[index].id ?? ""
            self.callUnblockUserAPI(userId: userId)
        }
        
        return cell
    }
}

// MARK: - Table view delegate methods

extension BlockedContactListVC: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        return blockedContactListVM.users.count > 0 ? 48.0 : 0
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let headerView = UIView(frame: CGRect(x: 0, y: 0, width: tableView.frame.width, height: 48))
        headerView.backgroundColor = .white
        
        let contactLabel = UILabel()
        contactLabel.frame = CGRect(x: 20, y: 15, width: headerView.frame.width - 40, height: headerView.frame.height - 15)
        contactLabel.font = UIFont.customFont(style: .bold, size: section == 0 ? UIFont.FontSize.mediumLarge : UIFont.FontSize.large)
        contactLabel.textColor = UIColor.black
        headerView.backgroundColor = #colorLiteral(red: 0.9999960065, green: 1, blue: 1, alpha: 1)
      contactLabel.text = LocalizedKey.blockContacts.value
        headerView.addSubview(contactLabel)
        return headerView
    }
}

// MARK: - PlaceholderDelegate

extension BlockedContactListVC: PlaceholderDelegate {
    
    func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
        switch placeholder.key {
        case .errorKey, .noConnectionKey:
            callUserBlockListAPI()
            
        default:
            break
        }
    }
}

extension BlockedContactListVC {
    private func callUserBlockListAPI() {
        
        blockedContactListVM.userBlockListAPI({ (currentState) in
            self.manageViewState(currentState)
        }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
            self.blockContactTableView.showLoaderAtBottom(false)
            self.blockContactTableView.reloadDataInMain()
        }
    }
    
    private func callUnblockUserAPI(userId: String) {
        
        let parameters: HTTPParameters = [
            "blockUserId": userId
        ]
        
        blockedContactListVM.unblockUserAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.showAlertWith(message: message) {
                    self.resetPagination()
                    self.callUserBlockListAPI()
                }
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}
