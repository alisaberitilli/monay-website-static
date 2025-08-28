//
//  CountryList.swift
//  Monay
//
//  Created by WFO on 16/09/22.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct CountryList: Mappable {
	var id: Int?
	var code: String?
	var name: String?
	var countryCallingCode: String?
	var currencyCode: String?
	var status: String?
	var createdAt: String?
	var updatedAt: String?

	init?(map: Map) {

	}

	mutating func mapping(map: Map) {

		id <- map["id"]
		code <- map["code"]
		name <- map["name"]
		countryCallingCode <- map["countryCallingCode"]
		currencyCode <- map["currencyCode"]
		status <- map["status"]
		createdAt <- map["createdAt"]
		updatedAt <- map["updatedAt"]
	}

}
