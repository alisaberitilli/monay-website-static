//
//  HTTPMultipartFile.swift
//
//  Created by Utkarsh Singh (utkarshs@codiant.com)
//
//  Copyright © 2020 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

/// Localized multipart operation error.
public enum HTTPMultipartError: LocalizedError {
    
    /// Data is missing or couldn't locate file at given local path url.
    case MissingData
    
    /// Filename is missing.
    case MissingFileName
    
    /// File extension is missing.
    case MissingExtension
    
    /// Parameter key is missing.
    case MissingParameterKey
    
    /// Localized error message.
    public var errorDescription: String? {
        ///
        switch self {
        case .MissingData:
            return "Data is missing or couldn't locate file at given local path url, you must provide either data or correct file url."
            
        case .MissingFileName:
            return "File name is either incorrect or empty."
            
        case .MissingExtension:
            return "File extension is either incorrect or empty."
            
        case .MissingParameterKey:
            return "Parameter key is either incorrect format or empty."
        }
    }
    
}

/// Create file, data and configuration for multipart upload request.
public struct HTTPMultipartFile {
    
    /// Data of the file.
    public var data: Data?
    
    /// Local url of the file. (return nil if not given during object initialization)
    public var url: URL?
    
    /// Name of the file.
    public var name: String
    
    /// Path extension of the file.
    public var ext: String
    
    /// Key to send file with in request.
    public var parameterKey: String
    
    /// Return mime type of the file.
    public var mimeType: String? {
        return ext.mimeType()
    }
    
    
    /// Initialize multipart file to upload.
    /// - Parameters:
    ///   - data: Data of file.
    ///   - name: Name of file.
    ///   - ext: Extension of file.
    public init(data: Data,
                name: String,
                ext: String,
                parameterKey: String) throws {
        ///
        self.data = data
        self.name = name
        self.ext = ext
        self.parameterKey = parameterKey
        
        ///
        do {
            try validateInput()
        } catch  {
            throw error
        }
    }
    
    /// Initialize multipart file to upload.
    /// - Parameters:
    ///   - url: URL of file.
    ///   - name: Name of file.
    ///   - ext: Extension of file.
    public init(url: URL,
                name: String,
                ext: String,
                parameterKey: String) throws {
        ///
        self.url = url
        self.name = name
        self.ext = ext
        self.parameterKey = parameterKey
        
        ///
        do {
            try validateInput()
        } catch  {
            throw error
        }
    }
    
    // MARK: - Private methods
    
    /// Validates that data or correct url is present or not.
    private mutating func validateInput() throws {
        ///
        if name.isEmpty {
            throw HTTPMultipartError.MissingFileName
            
        } else if ext.isEmpty || mimeType == nil {
            throw HTTPMultipartError.MissingExtension
            
        } else if url == nil && data == nil {
            throw HTTPMultipartError.MissingData
            
        }
        
        ///
        if data == nil {
            do {
                try extractDataFromUrl()
            } catch {
                throw error
            }
        }
    }
    
    /// Get the data from local file url. (If initialized with url)
    private mutating func extractDataFromUrl() throws {
        /// is file URL?
        guard let url = self.url,
            url.isFileURL else {
                ///
                throw HTTPMultipartError.MissingData
        }
        
        /// is file URL reachable?
        do {
            let isReachable = try url.checkPromisedItemIsReachable()
            if !isReachable {
                ///
                throw HTTPMultipartError.MissingData
            }
            
        } catch {
            throw error
        }
        
        ///
        do {
            try data = Data(contentsOf: url)
        } catch {
            throw HTTPMultipartError.MissingData
        }
    }
    
}
