//
//  MyCardVC.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class MyCardVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var cardTableView: TableView!
    
    // MARK: - Instance properties
    
    let myCardVM = MyCardVM()
    
    // MARK: - View controller lifecycle methods

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        initialSetup()
    }
    
    private func initialSetup() {
        configuretableView()
        callGetCardsAPI()
    }
    
    private func configuretableView() {
        cardTableView.placeholderDelegate = self
    }

    private func manageViewState(_ currentState: PlaceholderState) {
      switch currentState {
      case .loading:
        cardTableView.showLoading()

      case .defaultState:
        cardTableView.showDefault()

      case .noConnection:
        cardTableView.showNoConnection()

      case .error(let message, let actionType):
        cardTableView.showError(message: message, actionType: actionType)

      case .noResult(let message):
        cardTableView.showNoResults(title: message, message: PlaceholderStateData.noCard.message, image: "")

      default:
        break
      }
    }

    // MARK: - IBAction methods
    
    @IBAction func addNewCardButtonAction(_ sender: Any) {
        definesPresentationContext = true
        providesPresentationContextTransitionStyle = true
        
        overlayBlurredBackgroundView()
        let viewController = StoryboardScene.Profile.instantiateViewController(withClass: AddNewCardVC.self)
        viewController.onCompleteAddCard = {
            self.removeBlurredBackgroundViewView()
            self.callGetCardsAPI()
        }
        
        viewController.onCrossClick = {
            self.removeBlurredBackgroundViewView()
        }
        
        viewController.modalPresentationStyle = .overFullScreen
        present(viewController)
    }
}

// MARK: - Table view datasource methods

extension MyCardVC: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return myCardVM.cards.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
      guard let cell = tableView.dequeueReusableCell(withIdentifier: MyCardCell.identifier, for: indexPath) as? MyCardCell else {
            return UITableViewCell()
        }
        
        cell.tag = indexPath.row
        cell.configure(card: myCardVM.cards[indexPath.row])
        
        cell.callbackDelete = { [weak self] itemCell in
            
          guard let `self` = self else {
              return
          }

          if let index = self.cardTableView.indexPath(for: itemCell) {
              let cardIdString = self.myCardVM.cards[index.row].id ?? "0"
              let cardId = Int(cardIdString)
              self.callDeleteCardAPI(cardId: cardId ?? 0)
          }
        }
        return cell
    }
}

// MARK: - API Calling

extension MyCardVC {
    private func callGetCardsAPI() {
        
        myCardVM.cards = []
        self.manageViewState(.defaultState)
      
        myCardVM.getCardsAPI({ (currentState) in
          self.manageViewState(currentState)
        }) { // swiftlint:disable:this multiple_closures_with_trailing_closure
          self.cardTableView.reloadDataInMain()
        }
    }
    
    private func callDeleteCardAPI(cardId: Int) {
        
        myCardVM.deleteCardAPI(cardId: cardId) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.callGetCardsAPI()
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}

// MARK: - PlaceholderDelegate

extension MyCardVC: PlaceholderDelegate {
  
  func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?) {
    switch placeholder.key {
    case .errorKey, .noConnectionKey:
        callGetCardsAPI()
      
    default:
      break
    }
  }
}
