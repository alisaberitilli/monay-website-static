//
//  MoreComponent.swift
//  Monay
//
//  Created by WFH on 14/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

struct MoreComponent {
    
    // MARK: - changePassword
    
    static func changePassword(parameters: HTTPParameters,
                               result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/account/change-password", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - supportMessage
    
    static func supportMessage(userType: UserType, parameters: HTTPParameters,
                               result: @escaping HTTPResult) {
        
        let uri = "/user/support/request"
        
        do {
            let request = try HTTPRequest(uri: uri, method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - Support Request
    
    static func supportRequest(parameters: HTTPParameters,
                               result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/support/request", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - faqs
    
    static func faqs(parameters: HTTPParameters,
                     result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/faq", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - notification
    
    static func notification(parameters: HTTPParameters,
                             result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/notification", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - get User Block List
    
    static func getUserBlockList(parameters: HTTPParameters,
                                 result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/block", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - block unblock
     
     static func blockUnblock(parameters: HTTPParameters,
                              result: @escaping HTTPResult) {
         
         do {
             let request = try HTTPRequest(uri: "/user/block", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
             let router = Router(request: request, resultHandler: result)
             
             router.perfom()
             
         } catch {
             result(.failure(error))
         }
     }
  
    // MARK: - update kyc
    
    static func updateKYC(parameters: HTTPParameters,
                          result: @escaping HTTPResult) {
                
        do {
            let request = try HTTPRequest(uri: "/user/kyc", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }

  // MARK: - Secondary User

  static func secondaryUser(result: @escaping HTTPResult) {
      
      do {
        let request = try HTTPRequest(uri: "/secondary-user", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
          let router = Router(request: request, resultHandler: result)
          router.perfom()
          
      } catch {
          result(.failure(error))
      }
  }
  
  static func secondaryUserProfile(result: @escaping HTTPResult, id: String) {
      
      do {
        let request = try HTTPRequest(uri: "/secondary-user/\(id)", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
          let router = Router(request: request, resultHandler: result)
          router.perfom()
          
      } catch {
          result(.failure(error))
      }
  }
  
  static func secondaryUserProfileStatusUpdate(result: @escaping HTTPResult, id: String, parameters: HTTPParameters) {
      do {
        let request = try HTTPRequest(uri: "/secondary-user/status/\(id)", method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
          let router = Router(request: request, resultHandler: result)
          router.perfom()
      } catch {
          result(.failure(error))
      }
  }
  
  static func secondaryUserProfileSetRange(result: @escaping HTTPResult, id: String, parameters: HTTPParameters) {
      do {
        let request = try HTTPRequest(uri: "/secondary-user/limit/\(id)", method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
          let router = Router(request: request, resultHandler: result)
          router.perfom()
      } catch {
          result(.failure(error))
      }
  }
  
  static func secondaryUserProfileDelete(result: @escaping HTTPResult, id: String) {
      do {
        let request = try HTTPRequest(uri: "/secondary-user/\(id)", method: .delete, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
          let router = Router(request: request, resultHandler: result)
          router.perfom()
      } catch {
          result(.failure(error))
      }
  }

  // MARK: - Secondary User

  static func primaryUser(result: @escaping HTTPResult) {
      
      do {
        let request = try HTTPRequest(uri: "/parent-user", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
          let router = Router(request: request, resultHandler: result)
          
          router.perfom()
          
      } catch {
          result(.failure(error))
      }
  }

  // MARK: - update kyc
  
  static func getKYCDocument(parameters: HTTPParameters,
                             result: @escaping HTTPResult) {
              
      do {
          let request = try HTTPRequest(uri: "/user/kyc-document", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
          let router = Router(request: request, resultHandler: result)
          
          router.perfom()
          
      } catch {
          result(.failure(error))
      }
  }

  static func autoTopup(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/wallet-limit", method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
  
  static func autoTopupStatusUpdate(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
          let request = try HTTPRequest(uri: "/user/auto-toup", method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            router.perfom()
        } catch {
            result(.failure(error))
        }
    }
}
