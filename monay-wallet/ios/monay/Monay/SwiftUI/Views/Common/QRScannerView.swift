//
//  QRScannerView.swift
//  Monay
//
//  SwiftUI QR Scanner using CodeScanner
//

import SwiftUI
// import CodeScanner - Temporarily disabled

struct QRScannerView: View {
    let onCodeScanned: (String) -> Void
    @State private var isFlashOn = false
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            ZStack {
                // QR Scanner placeholder
                Color.black
                    .overlay(
                        Text("Camera View")
                            .foregroundColor(.white.opacity(0.3))
                            .font(.largeTitle)
                    )
                
                // Overlay UI
                VStack {
                    // Top overlay
                    HStack {
                        Button("Cancel") {
                            presentationMode.wrappedValue.dismiss()
                        }
                        .foregroundColor(.white)
                        .padding(.leading, 20)
                        
                        Spacer()
                        
                        Button(action: {
                            isFlashOn.toggle()
                        }) {
                            Image(systemName: isFlashOn ? "flashlight.on.fill" : "flashlight.off.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                        }
                        .padding(.trailing, 20)
                    }
                    .padding(.top, 20)
                    
                    Spacer()
                    
                    // Scanning frame
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white, lineWidth: 3)
                        .frame(width: 250, height: 250)
                        .overlay(
                            // Scanning corners
                            VStack {
                                HStack {
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(Color("blue"))
                                        .frame(width: 30, height: 4)
                                    Spacer()
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(Color("blue"))
                                        .frame(width: 30, height: 4)
                                }
                                Spacer()
                                HStack {
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(Color("blue"))
                                        .frame(width: 30, height: 4)
                                    Spacer()
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(Color("blue"))
                                        .frame(width: 30, height: 4)
                                }
                            }
                            .padding(15)
                        )
                    
                    Spacer()
                    
                    // Instructions
                    VStack(spacing: 8) {
                        Text("Scan QR Code")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        Text("Position the QR code within the frame to scan")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                    }
                    .padding(.bottom, 50)
                }
            }
            .navigationBarHidden(true)
            .ignoresSafeArea()
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    private func handleScan() {
        // Mock scan for testing
        onCodeScanned("MOCK_QR_CODE_DATA")
    }
}

// MARK: - Preview

struct QRScannerView_Previews: PreviewProvider {
    static var previews: some View {
        QRScannerView { result in
            print("Scanned: \(result)")
        }
    }
}