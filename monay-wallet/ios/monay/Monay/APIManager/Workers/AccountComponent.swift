//
//  AccountComponent.swift
//  DocLive
//
//  Created by WFH on 02/06/20.
//  Copyright © 2019 Codiant. All rights reserved.
//

import Foundation

struct AccountComponent {
    
    // MARK: - Login
    
    static func login(parameters: HTTPParameters,
                      result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/login", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - User Signup
    
    static func signup(userType: UserType,
                       parameters: HTTPParameters,
                       result: @escaping HTTPResult) {
        
        let uri = userType == .merchant ? "/merchant/signup" : "/user/signup"
        
        do {
            let request = try HTTPRequest(uri: uri, method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - verifyOtp
    
    static func verifyOTP(
        parameters: HTTPParameters,
        result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/verify-otp", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - verifyOtp only
    
    static func verifyOTPOnly(
        parameters: HTTPParameters,
        result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/verify-otp-only", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
  static func verifyPrimaryOTP(
      parameters: HTTPParameters,
      result: @escaping HTTPResult) {
      do {
          let request = try HTTPRequest(uri: "/verify-primary-otp", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
          let router = Router(request: request, resultHandler: result)
          
          router.perfom()
          
      } catch {
          result(.failure(error))
      }
      
  }

    // MARK: - resendOTP
    
    static func resendOTP(parameters: HTTPParameters,
                          result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/resend/otp", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - forgotPassword
    
    static func forgotPassword(parameters: HTTPParameters,
                               result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/forgot-password", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - logout
    
    static func logout(result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/account/logout", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - cms
    
    static func cms(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/cms", method: .get, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - resetPassword
    
    static func resetPassword(parameters: HTTPParameters,
                              result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/reset-password", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
    
    // MARK: - Country List
    
    static func countryList(result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/country", method: .get, authorizationPolicy: .anonymous, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Set Pin
    
    static func setPin(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/user/set-pin", method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - m Pin Login
    
    static func mPinLogin(parameters: HTTPParameters,
                          result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/mpin-login", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Send OTP
    
    static func sendOtp(parameters: HTTPParameters,
                        result: @escaping HTTPResult) {
        
        do {
            let request = try HTTPRequest(uri: "/send-otp", method: .post, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }
  
  static func sendPrimaryOtp(parameters: HTTPParameters,
                             result: @escaping HTTPResult) {
      
      do {
          let request = try HTTPRequest(uri: "/send-primary-otp", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
          let router = Router(request: request, resultHandler: result)
          
          router.perfom()
          
      } catch {
          result(.failure(error))
      }
      
  }

    // MARK: - Check Email
    
    static func checkEmail(
        parameters: HTTPParameters,
        result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/check/email", method: .get, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
        
    }

    // MARK: - update firebase token
    
    static func updateFirebaseToken(parameters: HTTPParameters,
                                    result: @escaping HTTPResult) {
        
        let uri = "/user/update-firebase-token"
        
        do {
            let request = try HTTPRequest(uri: uri, method: .put, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
  
  // MARK: - User Link
  
  static func userLink(userId: String,
                       result: @escaping HTTPResult) {
      
      let uri = "/user-scan/\(userId)"
      
      do {
        let request = try HTTPRequest(uri: uri, method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
          let router = Router(request: request, resultHandler: result)
          
          router.perfom()
          
      } catch {
          result(.failure(error))
      }
      
  }

}
