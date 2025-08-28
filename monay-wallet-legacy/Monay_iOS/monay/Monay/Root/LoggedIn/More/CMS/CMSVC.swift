//
//  CMSVC.swift
//  Monay
//
//  Created by Aayushi on 14/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import WebKit

class CMSVC: UIViewController {
    
    // MARK: - IBOutlets
    
    @IBOutlet weak var backButton: UIButton!
    @IBOutlet weak var webView: WKWebView!
    @IBOutlet weak var titleLabel: UILabel!
    
    // MARK: - Instance properties
    
    let cmsVM = CMSVM()
    var activityIndicator: UIActivityIndicatorView!
    
    // MARK: - Life Cycle Methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        configure()
    }
    
    // MARK: - Private
    
    private func configure() {
        initialSetup()
        setupWebView()
        callcmsAPI()
    }
    
    private func initialSetup() {
        switch cmsVM.selectedCMS {
        case .userPolicy:
          titleLabel.text = LocalizedKey.privacyPolicy.value
        case .terms:
            titleLabel.text = LocalizedKey.termsCondition.value
        case .howItWorks:
            titleLabel.text = LocalizedKey.howItWorks.value
        case .privacyPolicy:
            titleLabel.text = LocalizedKey.privacyPolicy.value
        }
    }
    
    private func setupWebView() {
        webView.navigationDelegate = self
        activityIndicator = UIActivityIndicatorView()
        activityIndicator.color = .gray
        activityIndicator.center = self.view.center
        activityIndicator.startAnimating()
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)
    }
    
    private func loadWebView() {
        
        guard let cms = cmsVM.cms else {
            return activityIndicator.stopAnimating()
        }
        
        let content = cms.pageContent ?? ""
        
        DispatchQueue.main.async {
            let htmlString = """
            <html>
            <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style> body { font-size: 100%; } </style>
            </head>
            <body>
            \(content)
            </body>
            </html>
            """
            self.webView.loadHTMLString(htmlString, baseURL: nil)
        }
    }
    
}

// MARK: - WKNavigationDelegate

extension CMSVC: WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        decisionHandler(.allow)
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityIndicator.stopAnimating()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
    }
}

// MARK: - API Calling

extension CMSVC {
    private func callcmsAPI() {
        
        let parameters: HTTPParameters = [
          "userType": cmsVM.usertype.rawValue
        ]
        
        cmsVM.cmsAPI(parameters: parameters) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.loadWebView()
            } else {
                self.activityIndicator.stopAnimating()
                self.showAlertWith(message: message)
            }
        }
    }
}
