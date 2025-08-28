//
//  QRScannerView.swift
//  QRCodeReader

import Foundation
import UIKit
import AVFoundation

/// Delegate callback for the QRScannerView.
protocol QRScannerViewDelegate: AnyObject {
    func qrScanningDidFail()
    func qrScanningSucceededWithCode(_ str: String?)
    func qrScanningDidStop()
}

class QRScannerView: UIView {
    
    weak var delegate: QRScannerViewDelegate?
    
    /// capture settion which allows us to start and stop scanning.
    var captureSession: AVCaptureSession?
    let qrCodeAreaView = UIView()
    let scanLine = UIImageView()
    
    // Init methods..
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initialSetup()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        initialSetup()
    }
    
    // MARK: - overriding the layerClass to return `AVCaptureVideoPreviewLayer`.
    override class var layerClass: AnyClass {
        return AVCaptureVideoPreviewLayer.self
    }
    
    override var layer: AVCaptureVideoPreviewLayer {
        return super.layer as! AVCaptureVideoPreviewLayer // swiftlint:disable:this force_cast
    }
}

// MARK: - QRScannerView

extension QRScannerView {
    
    var isRunning: Bool {
        return captureSession?.isRunning ?? false
    }
    
    func startScanning() {
        captureSession?.startRunning()
    }
    
    func stopScanning() {
        captureSession?.stopRunning()
        delegate?.qrScanningDidStop()
    }
    
    /// Does the initial setup for captureSession
    private func initialSetup() {
        checkCamera()
    }
    
    func qrCodeSetup() {
        
        DispatchQueue.main.async {
            self.clipsToBounds = true
        }
        
        captureSession = AVCaptureSession()
        
        let width = 170
        let height = 170
        
        let xPosition = (CGFloat(self.frame.size.width) / CGFloat(2)) - (CGFloat(width) / CGFloat(2))
        let yPosition = (CGFloat(self.frame.size.height) / CGFloat(2)) - (CGFloat(height) / CGFloat(2))
        let qrCodeArea = CGRect(x: Int(xPosition), y: Int(yPosition), width: width, height: height)
        
        qrCodeAreaView.frame = qrCodeArea
        self.addSubview(qrCodeAreaView)
        qrCodeAreaView.layer.addSublayer(self.createFrame(qrCodeView: qrCodeAreaView))
        
        setUpScanLine()
        startAnimation()
        
        guard let videoCaptureDevice = AVCaptureDevice.default(for: .video) else { return }
        let videoInput: AVCaptureDeviceInput
        do {
            videoInput = try AVCaptureDeviceInput(device: videoCaptureDevice)
        } catch let error {
            print(error)
            return
        }
        
        if captureSession?.canAddInput(videoInput) ?? false {
            captureSession?.addInput(videoInput)
        } else {
            scanningDidFail()
            return
        }
        
        let metadataOutput = AVCaptureMetadataOutput()
        
        if captureSession?.canAddOutput(metadataOutput) ?? false {
            captureSession?.addOutput(metadataOutput)
            
            metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            metadataOutput.metadataObjectTypes = [.qr]
            
            let cameraView = AVCaptureVideoPreviewLayer(session: captureSession!)
            cameraView.backgroundColor = UIColor.clear.cgColor
            cameraView.videoGravity = AVLayerVideoGravity.resizeAspectFill
            cameraView.frame = self.layer.bounds
            
            captureSession?.startRunning()
            
            metadataOutput.rectOfInterest = cameraView.metadataOutputRectConverted(fromLayerRect: qrCodeArea)
            self.layer.addSublayer(cameraView)
            
            self.bringSubviewToFront(qrCodeAreaView)
            
        } else {
            scanningDidFail()
            return
        }
        
        //        self.layer.session = captureSession
        //        self.layer.videoGravity = .resizeAspectFill
        //        captureSession?.startRunning()
    }
    
    func scanningDidFail() {
        delegate?.qrScanningDidFail()
        captureSession = nil
    }
    
    func found(code: String) {
        delegate?.qrScanningSucceededWithCode(code)
    }
    
    func checkCamera() {
        
        AVCaptureDevice.requestAccess(for: .video, completionHandler: { (granted: Bool) in
            if granted {
                DispatchQueue.main.async {
                    self.qrCodeSetup()
                }
            } else {
                
                let authStatus = AVCaptureDevice.authorizationStatus(for: AVMediaType.video)
                
                switch authStatus {
                case .authorized:
                    DispatchQueue.main.async {
                        self.qrCodeSetup()
                    }
                case .denied:
                    self.alertToEncourageCameraAccessInitially()
                case .notDetermined:
                    self.alertPromptToAllowCameraAccessViaSetting()
                default:
                    self.alertToEncourageCameraAccessInitially()
                }
                
            }
        })
    }
    
    func alertToEncourageCameraAccessInitially() {
        let alert = UIAlertController(
            title: kProductName,
          message: LocalizedKey.messageCameraAccessRequired.value,
            preferredStyle: UIAlertController.Style.alert
        )
        alert.addAction(UIAlertAction(title: LocalizedKey.cancel.value, style: .default, handler: nil))
      alert.addAction(UIAlertAction(title: LocalizedKey.allowCamera.value, style: .cancel, handler: { (_) -> Void in
            UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!, options: [:], completionHandler: nil)
        }))
        
        let topController = UIApplication.topViewController()
        topController?.present(alert, animated: true)
    }
    
    func alertPromptToAllowCameraAccessViaSetting() {
        
        let alert = UIAlertController(
            title: kProductName,
          message: LocalizedKey.meaasgeAllowCameraAccess.value,
            preferredStyle: UIAlertController.Style.alert
        )
      alert.addAction(UIAlertAction(title: LocalizedKey.dismiss.value, style: .cancel) { _ in
            AVCaptureDevice.requestAccess(for: AVMediaType.video) { _ in
                DispatchQueue.main.async {
                    self.checkCamera()
                }
            }
            }
        )
        let topController = UIApplication.topViewController()
        topController?.present(alert, animated: true)
    }
    
    func setUpScanLine() {
        qrCodeAreaView.addSubview(scanLine)
        
        scanLine.frame.origin.x = 9
        scanLine.frame.origin.y = 9
        scanLine.frame.size.width = qrCodeAreaView.frame.size.width - 18
        scanLine.frame.size.height = 2
        scanLine.backgroundColor = .white
    }
    
    func startAnimation() {
        let startPoint = CGPoint(x: scanLine.center.x, y: 9)
        let endPoint = CGPoint(x: scanLine.center.x, y: qrCodeAreaView.bounds.size.height - 9)
        
      let translation = CABasicAnimation(keyPath: LocalizedKey.position.value)
        translation.timingFunction = CAMediaTimingFunction(name: CAMediaTimingFunctionName.easeInEaseOut)
        translation.fromValue = NSValue(cgPoint: startPoint)
        translation.toValue = NSValue(cgPoint: endPoint)
        translation.duration = 1
        translation.repeatCount = MAXFLOAT
        translation.autoreverses = true
      scanLine.layer.add(translation, forKey: LocalizedKey.scan.value)
    }
    
    func stopAnimation() {
        scanLine.layer.removeAllAnimations()
    }
    
    func createFrame(qrCodeView: UIView) -> CAShapeLayer {
        let height: CGFloat = qrCodeView.frame.size.height
        let width: CGFloat = qrCodeView.frame.size.width
        let path = UIBezierPath()
        path.move(to: CGPoint(x: 5, y: 50))
        path.addLine(to: CGPoint(x: 5, y: 5))
        path.addLine(to: CGPoint(x: 50, y: 5))
        path.move(to: CGPoint(x: height - 55, y: 5))
        path.addLine(to: CGPoint(x: height - 5, y: 5))
        path.addLine(to: CGPoint(x: height - 5, y: 55))
        path.move(to: CGPoint(x: 5, y: width - 55))
        path.addLine(to: CGPoint(x: 5, y: width - 5))
        path.addLine(to: CGPoint(x: 55, y: width - 5))
        path.move(to: CGPoint(x: width - 55, y: height - 5))
        path.addLine(to: CGPoint(x: width - 5, y: height - 5))
        path.addLine(to: CGPoint(x: width - 5, y: height - 55))
        let shape = CAShapeLayer()
        shape.path = path.cgPath
        shape.strokeColor = UIColor.yellow.cgColor
        shape.lineWidth = 5
        shape.fillColor = UIColor.clear.cgColor
        return shape
    }
}

// MARK: - AVCaptureMetadataOutputObjectsDelegate

extension QRScannerView: AVCaptureMetadataOutputObjectsDelegate {
    func metadataOutput(_ output: AVCaptureMetadataOutput,
                        didOutput metadataObjects: [AVMetadataObject],
                        from connection: AVCaptureConnection) {
        stopScanning()
        stopAnimation()
        
        if let metadataObject = metadataObjects.first {
            guard let readableObject = metadataObject as? AVMetadataMachineReadableCodeObject else { return }
            guard let stringValue = readableObject.stringValue else { return }
            AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
            found(code: stringValue)
        }
    }
}
