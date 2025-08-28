//
//  ProfileComponent.swift
//  Monay
//
//  Created by WFH on 12/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

struct ProfileComponent {
    
    // MARK: - accountMe
    
    static func accountMe(result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/account/me", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - uploadMedia
    
    static func uploadMedia(data: Data, 
                            ext: String,
                            documentType: String,
                            mediaFor: String,
                            result: @escaping HTTPResult) {
        
        var files: [HTTPMultipartFile] = []
        
        do {
            let file = try HTTPMultipartFile(data: data, name: documentType, ext: ext, parameterKey: "file")
            files.append(file)
        } catch (let error) {   // swiftlint:disable:this control_statement
            print(error.localizedDescription)
        }
        
        do {
            
            let uri = "/media/upload/\(mediaFor)/\(documentType)"
            let request = try HTTPRequest(uri: uri, method: .post, authorizationPolicy: .signedIn, dataTask: .requestFormData(parameters: [:], files: files), encoding: .formData)
            
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - update profile
    
    static func updateProfile(userType: UserType, parameters: HTTPParameters,
                              result: @escaping HTTPResult) {
        
      let uri = (userType == .user || userType == .secondaryUser) ? "/user/update-profile" : "/merchant/update-profile"
        
        do {
            let request = try HTTPRequest(uri: uri, method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - add Card
    
    static func addCard(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/card", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - get cards
    
    static func getCards(result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/cards", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - get specific card
    
    static func getSpecificCard(cardId: Int, result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/card/\(cardId)", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - delete card
    
    static func deleteCard(cardId: Int, result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/card/\(cardId)", method: .delete, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Payment request type
    
    static func paymentRequestType(type: String, parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/payment/request/\(type)", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - My request
    
    static func getMyRequest(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/my-request", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - decline payment request
    
    static func declinePaymentRequest(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/payment/request/decline", method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Add money from card
    
    static func addMoneyFromCard(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/add-money/card", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Get user wallet
    
    static func getUserWallet(result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/wallet", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - get Banks
    
    static func getBanks(result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/banks", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - add Bank
    
    static func addBank(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/bank", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - delete Bank
    
    static func deleteBank(bankId: Int, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/bank/\(bankId)", method: .delete, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - withdrawal Money
    
    static func withdrawalMoney(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/withdrawal-money", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - forgot Pin API for sending otp
    
    static func forgotPinAPI(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/forgot-pin", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Verify Pin otp
    
    static func verifyPinOtpAPI(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/verify-pin-otp", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - reset Pin Otp API
    
    static func resetPinAPI(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/reset-pin", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Change Pin Api
    
    static func changePinApi(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/change-pin", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Withdrawal request history
    
    static func withdrawalRequestHistory(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/withdrawal-history", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - send Email Verification Code
    
    static func sendEmailVerificationCode(result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/send/email-verification-code", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Update Phone Number
    
    static func updatePhoneNumber(parameters: HTTPParameters,
                                  result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/update/phone-number", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - Verify Phone Number
    
    static func verifyPhoneNumber(parameters: HTTPParameters,
                                  result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/verify/phone-number", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - Verify Email
    
    static func verifyEmail(parameters: HTTPParameters,
                            result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/verify/email", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - Update Email
    
    static func updateEmail(parameters: HTTPParameters,
                            result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/update/email", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
}
