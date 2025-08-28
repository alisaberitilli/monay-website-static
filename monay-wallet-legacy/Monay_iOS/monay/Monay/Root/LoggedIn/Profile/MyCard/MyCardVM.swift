//
//  MyCardVM.swift
//  Monay
//
//  Created by WFH on 13/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class MyCardVM {
    
    // MARK: - Instance properties
    
    var cards: [Card] = []
    
    // MARK: - Helper methods
    
    func getCardsAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        
        handler(.loading)

        APIComponent
            .Profile
            .getCards(result: { (result) in
                
                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? [HTTPParameters] {
                        
                        if data.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noCard.title))
                        } else {
                            let cards = data.compactMap { Card(JSON: $0) }
                            self.cards.append(contentsOf: cards)
                            completion()
                        }
                        
                    }
                    
                case .failure(let error):
                    if (error as NSError).code == SessionSystemCode.internetOffline.rawValue {
                      handler(.noConnection)
                    } else {
                      handler(.error(message: error.localizedDescription, actionType: .tryAgain))
                    }
                }
            })
    }
    
    func deleteCardAPI(cardId: Int, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .deleteCard(cardId: cardId, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters,
                        let message = data[APIKey.message] as? String {
                        completion(true, message)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
