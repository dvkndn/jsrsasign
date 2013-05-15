/*! asn1x509-1.0.3.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
/*
 * asn1x509.js - ASN.1 DER encoder classes for X.509 certificate
 *
 * Copyright (c) 2013 Kenji Urushima (kenji.urushima@gmail.com)
 *
 * This software is licensed under the terms of the MIT License.
 * http://kjur.github.com/jsrsasign/license
 *
 * The above copyright and license notice shall be 
 * included in all copies or substantial portions of the Software.
 */

/**
 * @fileOverview
 * @name asn1x509-1.0.js
 * @author Kenji Urushima kenji.urushima@gmail.com
 * @version 1.0.3 (2013-May-15)
 * @since 2.1
 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
 */

/** 
 * kjur's class library name space
 * // already documented in asn1-1.0.js
 * @name KJUR
 * @namespace kjur's class library name space
 */
if (typeof KJUR == "undefined" || !KJUR) KJUR = {};

/**
 * kjur's ASN.1 class library name space
 * // already documented in asn1-1.0.js
 * @name KJUR.asn1
 * @namespace
 */
if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) KJUR.asn1 = {};

/**
 * kjur's ASN.1 class for X.509 certificate library name space
 * <p>
 * <h4>FEATURES</h4>
 * <ul>
 * <li>easily issue any kind of certificate</li>
 * <li>APIs are very similar to BouncyCastle library ASN.1 classes. So easy to learn.</li>
 * </ul>
 * </p>
 * <h4>PROVIDED CLASSES</h4>
 * <ul>
 * <li>{@link KJUR.asn1.x509.Certificate}</li>
 * <li>{@link KJUR.asn1.x509.TBSCertificate}</li>
 * <li>{@link KJUR.asn1.x509.Extension}</li>
 * <li>{@link KJUR.asn1.x509.X500Name}</li>
 * <li>{@link KJUR.asn1.x509.RDN}</li>
 * <li>{@link KJUR.asn1.x509.AttributeTypeAndValue}</li>
 * <li>{@link KJUR.asn1.x509.SubjectPublicKeyInfo}</li>
 * <li>{@link KJUR.asn1.x509.AlgorithmIdentifier}</li>
 * <li>{@link KJUR.asn1.x509.GeneralName}</li>
 * <li>{@link KJUR.asn1.x509.GeneralNames}</li>
 * <li>{@link KJUR.asn1.x509.DistributionPointName}</li>
 * <li>{@link KJUR.asn1.x509.DistributionPoint}</li>
 * <li>{@link KJUR.asn1.x509.CRL}</li>
 * <li>{@link KJUR.asn1.x509.TBSCertList}</li>
 * <li>{@link KJUR.asn1.x509.CRLEntry}</li>
 * <li>{@link KJUR.asn1.x509.OID}</li>
 * </ul>
 * <h4>SUPPORTED EXTENSIONS</h4>
 * <ul>
 * <li>{@link KJUR.asn1.x509.BasicConstraints}</li>
 * <li>{@link KJUR.asn1.x509.KeyUsage}</li>
 * <li>{@link KJUR.asn1.x509.CRLDistributionPoints}</li>
 * <li>{@link KJUR.asn1.x509.ExtKeyUsage}</li>
 * </ul>
 * NOTE: Please ignore method summary and document of this namespace. This caused by a bug of jsdoc2.
 * @name KJUR.asn1.x509
 * @namespace
 */
if (typeof KJUR.asn1.x509 == "undefined" || !KJUR.asn1.x509) KJUR.asn1.x509 = {};

// === BEGIN Certificate ===================================================

/**
 * X.509 Certificate class to sign and generate hex encoded certificate
 * @name KJUR.asn1.x509.Certificate
 * @class X.509 Certificate class to sign and generate hex encoded certificate
 * @param {Array} params associative array of parameters (ex. {'tbscertobj': obj, 'rsaprvkey': key})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>tbscertobj - specify {@link KJUR.asn1.x509.TBSCertificate} object</li>
 * <li>rsaprvkey - specify {@link RSAKey} object CA private key</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 * <h4>EXAMPLE</h4>
 * @example
 * var prvKey = new RSAKey(); // CA's private key
 * prvKey.readPrivateKeyFromASN1HexString("3080...");
 * var cert = new KJUR.asn1x509.Certificate({'tbscertobj': tbs, 'rsaprvkey': prvKey});
 * cert.sign(); // issue certificate by CA's private key
 * var hCert = cert.getEncodedHex();
 *
 * // Certificate  ::=  SEQUENCE  {
 * //     tbsCertificate       TBSCertificate,
 * //     signatureAlgorithm   AlgorithmIdentifier,
 * //     signature            BIT STRING  }	    
 */
KJUR.asn1.x509.Certificate = function(params) {
    KJUR.asn1.x509.Certificate.superclass.constructor.call(this);
    var asn1TBSCert = null;
    var asn1SignatureAlg = null;
    var asn1Sig = null;
    var hexSig = null;
    var rsaPrvKey = null;

    
    /**
     * set PKCS#5 encrypted RSA PEM private key as CA key
     * @name setRsaPrvKeyByPEMandPass
     * @memberOf KJUR.asn1.x509.Certificate
     * @function
     * @param {String} rsaPEM string of PKCS#5 encrypted RSA PEM private key
     * @param {String} passPEM passcode string to decrypt private key
     * @since 1.0.1
     * @description
     * <br/>
     * <h4>EXAMPLES</h4>
     * @example
     * var cert = new KJUR.asn1.x509.Certificate({'tbscertobj': tbs});
     * cert.setRsaPrvKeyByPEMandPass("-----BEGIN RSA PRIVATE..(snip)", "password");
     */
    this.setRsaPrvKeyByPEMandPass = function(rsaPEM, passPEM) {
	var caKeyHex = PKCS5PKEY.getDecryptedKeyHex(rsaPEM, passPEM);
	var caKey = new RSAKey();
	caKey.readPrivateKeyFromASN1HexString(caKeyHex);  
	this.rsaPrvKey = caKey;
    };

    /**
     * sign TBSCertificate and set signature value internally
     * @name sign
     * @memberOf KJUR.asn1.x509.Certificate
     * @function
     * @description
     * @example
     * var cert = new KJUR.asn1.x509.Certificate({'tbscertobj': tbs, 'rsaprvkey': prvKey});
     * cert.sign();
     */
    this.sign = function() {
	this.asn1SignatureAlg = this.asn1TBSCert.asn1SignatureAlg;

	sig = new KJUR.crypto.Signature({'alg': 'SHA1withRSA', 'prov': 'cryptojs/jsrsa'});
	sig.initSign(this.rsaPrvKey);
	sig.updateHex(this.asn1TBSCert.getEncodedHex());
	this.hexSig = sig.sign();

	this.asn1Sig = new KJUR.asn1.DERBitString({'hex': '00' + this.hexSig});
	
	var seq = new KJUR.asn1.DERSequence({'array': [this.asn1TBSCert,
						       this.asn1SignatureAlg,
						       this.asn1Sig]});
	this.hTLV = seq.getEncodedHex();
	this.isModified = false;
    };

    this.getEncodedHex = function() {
	if (this.isModified == false && this.hTLV != null) return this.hTLV;
	throw "not signed yet";
    };

    /**
     * get PEM formatted certificate string after signed
     * @name getPEMString
     * @memberOf KJUR.asn1.x509.Certificate
     * @function
     * @return PEM formatted string of certificate
     * @description
     * @example
     * var cert = new KJUR.asn1.x509.Certificate({'tbscertobj': tbs, 'rsaprvkey': prvKey});
     * cert.sign();
     * var sPEM =  cert.getPEMString();
     */
    this.getPEMString = function() {
	var hCert = this.getEncodedHex();
	var wCert = CryptoJS.enc.Hex.parse(hCert);
	var b64Cert = CryptoJS.enc.Base64.stringify(wCert);
	var pemBody = b64Cert.replace(/(.{64})/g, "$1\r\n");
	return "-----BEGIN CERTIFICATE-----\r\n" + pemBody + "\r\n-----END CERTIFICATE-----\r\n";
    };

    if (typeof params != "undefined") {
	if (typeof params['tbscertobj'] != "undefined") {
	    this.asn1TBSCert = params['tbscertobj'];
	}
	if (typeof params['rsaprvkey'] != "undefined") {
	    this.rsaPrvKey = params['rsaprvkey'];
	}
	if ((typeof params['rsaprvpem'] != "undefined") &&
	    (typeof params['rsaprvpas'] != "undefined")) {
	    this.setRsaPrvKeyByPEMandPass(params['rsaprvpem'], params['rsaprvpas']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.Certificate, KJUR.asn1.ASN1Object);

/**
 * ASN.1 TBSCertificate structure class
 * @name KJUR.asn1.x509.TBSCertificate
 * @class ASN.1 TBSCertificate structure class
 * @param {Array} params associative array of parameters (ex. {})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * <br/>
 * <h4>EXAMPLE</h4>
 * @example
 *  var o = new KJUR.asn1.x509.TBSCertificate();
 *  o.setSerialNumberByParam({'int': 4});
 *  o.setSignatureAlgByParam({'name': 'SHA1withRSA'});
 *  o.setIssuerByParam({'str': '/C=US/O=a'});
 *  o.setNotBeforeByParam({'str': '130504235959Z'});
 *  o.setNotAfterByParam({'str': '140504235959Z'});
 *  o.setSubjectByParam({'str': '/C=US/CN=b'});
 *  o.setSubjectPublicKeyByParam({'rsakey': rsaKey});
 *  o.appendExtension(new KJUR.asn1.x509.BasicConstraints({'cA':true}));
 *  o.appendExtension(new KJUR.asn1.x509.KeyUsage({'bin':'11'}));
 */
KJUR.asn1.x509.TBSCertificate = function(params) {
    KJUR.asn1.x509.TBSCertificate.superclass.constructor.call(this);

    this._initialize = function() {
	this.asn1Array = new Array();

	this.asn1Version = 
	    new KJUR.asn1.DERTaggedObject({'obj': new KJUR.asn1.DERInteger({'int': 2})});
	this.asn1SerialNumber = null;
	this.asn1SignatureAlg = null;
	this.asn1Issuer = null;
	this.asn1NotBefore = null;
	this.asn1NotAfter = null;
	this.asn1Subject = null;
	this.asn1SubjPKey = null;
	this.extensionsArray = new Array();
    };

    /**
     * set serial number field by parameter
     * @name setSerialNumberByParam
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Array} intParam DERInteger param
     * @description
     * @example
     * tbsc.setSerialNumberByParam({'int': 3});
     */
    this.setSerialNumberByParam = function(intParam) {
	this.asn1SerialNumber = new KJUR.asn1.DERInteger(intParam);
    };

    /**
     * set signature algorithm field by parameter
     * @name setSignatureAlgByParam
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Array} algIdParam AlgorithmIdentifier parameter
     * @description
     * @example
     * tbsc.setSignatureAlgByParam({'name': 'SHA1withRSA'});
     */
    this.setSignatureAlgByParam = function(algIdParam) {
	this.asn1SignatureAlg = new KJUR.asn1.x509.AlgorithmIdentifier(algIdParam);
    };

    /**
     * set issuer name field by parameter
     * @name setIssuerByParam
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Array} x500NameParam X500Name parameter
     * @description
     * @example
     * tbsc.setIssuerParam({'str': '/C=US/CN=b'});
     * @see KJUR.asn1.x509.X500Name
     */
    this.setIssuerByParam = function(x500NameParam) {
	this.asn1Issuer = new KJUR.asn1.x509.X500Name(x500NameParam);
    };

    /**
     * set notBefore field by parameter
     * @name setNotBeforeByParam
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Array} timeParam Time parameter
     * @description
     * @example
     * tbsc.setNotBeforeByParam({'str': '130508235959Z'});
     * @see KJUR.asn1.x509.Time
     */
    this.setNotBeforeByParam = function(timeParam) {
	this.asn1NotBefore = new KJUR.asn1.x509.Time(timeParam);
    };
    
    /**
     * set notAfter field by parameter
     * @name setNotAfterByParam
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Array} timeParam Time parameter
     * @description
     * @example
     * tbsc.setNotAfterByParam({'str': '130508235959Z'});
     * @see KJUR.asn1.x509.Time
     */
    this.setNotAfterByParam = function(timeParam) {
	this.asn1NotAfter = new KJUR.asn1.x509.Time(timeParam);
    };

    /**
     * set subject name field by parameter
     * @name setSubjectByParam
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Array} x500NameParam X500Name parameter
     * @description
     * @example
     * tbsc.setSubjectParam({'str': '/C=US/CN=b'});
     * @see KJUR.asn1.x509.X500Name
     */
    this.setSubjectByParam = function(x500NameParam) {
	this.asn1Subject = new KJUR.asn1.x509.X500Name(x500NameParam);
    };

    /**
     * set subject public key info field by parameter
     * @name setSubjectPublicKeyByParam
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Array} subjPKeyParam SubjectPublicKeyInfo parameter
     * @description
     * @example
     * tbsc.setSubjectPublicKeyByParam({'rsakey': pubKey});
     * @see KJUR.asn1.x509.SubjectPublicKeyInfo
     */
    this.setSubjectPublicKeyByParam = function(subjPKeyParam) {
	this.asn1SubjPKey = new KJUR.asn1.x509.SubjectPublicKeyInfo(subjPKeyParam);
    };

    /**
     * append X.509v3 extension to this object
     * @name appendExtension
     * @memberOf KJUR.asn1.x509.TBSCertificate
     * @function
     * @param {Extension} extObj X.509v3 Extension object
     * @description
     * @example
     * tbsc.appendExtension(new KJUR.asn1.x509.BasicConstraints({'cA':true, 'critical': true}));
     * tbsc.appendExtension(new KJUR.asn1.x509.KeyUsage({'bin':'11'}));
     * @see KJUR.asn1.x509.Extension
     */
    this.appendExtension = function(extObj) {
	this.extensionsArray.push(extObj);
    };

    this.getEncodedHex = function() {
	if (this.asn1NotBefore == null || this.asn1NotAfter == null)
	    throw "notBefore and/or notAfter not set";
	var asn1Validity = 
	    new KJUR.asn1.DERSequence({'array':[this.asn1NotBefore, this.asn1NotAfter]});

	this.asn1Array = new Array();

	this.asn1Array.push(this.asn1Version);
	this.asn1Array.push(this.asn1SerialNumber);
	this.asn1Array.push(this.asn1SignatureAlg);
	this.asn1Array.push(this.asn1Issuer);
	this.asn1Array.push(asn1Validity);
	this.asn1Array.push(this.asn1Subject);
	this.asn1Array.push(this.asn1SubjPKey);

	if (this.extensionsArray.length > 0) {
	    var extSeq = new KJUR.asn1.DERSequence({"array": this.extensionsArray});
	    var extTagObj = new KJUR.asn1.DERTaggedObject({'explicit': true,
							   'tag': 'a3',
							   'obj': extSeq});
	    this.asn1Array.push(extTagObj);
	}

	var o = new KJUR.asn1.DERSequence({"array": this.asn1Array});
	this.hTLV = o.getEncodedHex();
	this.isModified = false;
	return this.hTLV;
    };

    this._initialize();
};
YAHOO.lang.extend(KJUR.asn1.x509.TBSCertificate, KJUR.asn1.ASN1Object);

// === END   TBSCertificate ===================================================

// === BEGIN X.509v3 Extensions Related =======================================

/**
 * base Extension ASN.1 structure class
 * @name KJUR.asn1.x509.Extension
 * @class base Extension ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'critical': true})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @example
 * // Extension  ::=  SEQUENCE  {
 * //     extnID      OBJECT IDENTIFIER,
 * //     critical    BOOLEAN DEFAULT FALSE,
 * //     extnValue   OCTET STRING  }
 */
KJUR.asn1.x509.Extension = function(params) {
    KJUR.asn1.x509.Extension.superclass.constructor.call(this);
    var asn1ExtnValue = null;

    this.getEncodedHex = function() {
	var asn1Oid = new KJUR.asn1.DERObjectIdentifier({'oid': this.oid});
	var asn1EncapExtnValue = 
	    new KJUR.asn1.DEROctetString({'hex': this.getExtnValueHex()});

	var asn1Array = new Array();
	asn1Array.push(asn1Oid);
	if (this.critical) asn1Array.push(new KJUR.asn1.DERBoolean());
	asn1Array.push(asn1EncapExtnValue);

	var asn1Seq = new KJUR.asn1.DERSequence({'array': asn1Array});
	return asn1Seq.getEncodedHex();
    };

    this.critical = false;
    if (typeof params != "undefined") {
	if (typeof params['critical'] != "undefined") {
	    this.critical = params['critical'];
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.Extension, KJUR.asn1.ASN1Object);

/**
 * KeyUsage ASN.1 structure class
 * @name KJUR.asn1.x509.KeyUsage
 * @class KeyUsage ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'bin': '11', 'critical': true})
 * @extends KJUR.asn1.x509.Extension
 * @description
 * @example
 */
KJUR.asn1.x509.KeyUsage = function(params) {
    KJUR.asn1.x509.KeyUsage.superclass.constructor.call(this, params);

    this.getExtnValueHex = function() {
	return this.asn1ExtnValue.getEncodedHex();
    };

    this.oid = "2.5.29.15";
    if (typeof params != "undefined") {
	if (typeof params['bin'] != "undefined") {
	    this.asn1ExtnValue = new KJUR.asn1.DERBitString(params);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.KeyUsage, KJUR.asn1.x509.Extension);

/**
 * BasicConstraints ASN.1 structure class
 * @name KJUR.asn1.x509.BasicConstraints
 * @class BasicConstraints ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'cA': true, 'critical': true})
 * @extends KJUR.asn1.x509.Extension
 * @description
 * @example
 */
KJUR.asn1.x509.BasicConstraints = function(params) {
    KJUR.asn1.x509.BasicConstraints.superclass.constructor.call(this, params);
    var cA = false;
    var pathLen = -1;

    this.getExtnValueHex = function() {
	var asn1Array = new Array();
	if (this.cA) asn1Array.push(new KJUR.asn1.DERBoolean());
	if (this.pathLen > -1) 
	    asn1Array.push(new KJUR.asn1.DERInteger({'int': this.pathLen}));
	var asn1Seq = new KJUR.asn1.DERSequence({'array': asn1Array});
	this.asn1ExtnValue = asn1Seq;
	return this.asn1ExtnValue.getEncodedHex();
    };

    this.oid = "2.5.29.19";
    this.cA = false;
    this.pathLen = -1;
    if (typeof params != "undefined") {
	if (typeof params['cA'] != "undefined") {
	    this.cA = params['cA'];
	}
	if (typeof params['pathLen'] != "undefined") {
	    this.pathLen = params['pathLen'];
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.BasicConstraints, KJUR.asn1.x509.Extension);

/**
 * CRLDistributionPoints ASN.1 structure class
 * @name KJUR.asn1.x509.CRLDistributionPoints
 * @class CRLDistributionPoints ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'uri': 'http://a.com/', 'critical': true})
 * @extends KJUR.asn1.x509.Extension
 * @description
 * @example
 */
KJUR.asn1.x509.CRLDistributionPoints = function(params) {
    KJUR.asn1.x509.CRLDistributionPoints.superclass.constructor.call(this, params);

    this.getExtnValueHex = function() {
	return this.asn1ExtnValue.getEncodedHex();
    };

    this.setByDPArray = function(dpArray) {
	this.asn1ExtnValue = new KJUR.asn1.DERSequence({'array': dpArray});
    };

    this.setByOneURI = function(uri) {
	var gn1 = new KJUR.asn1.x509.GeneralNames([{'uri': uri}]);
	var dpn1 = new KJUR.asn1.x509.DistributionPointName(gn1);
	var dp1 = new KJUR.asn1.x509.DistributionPoint({'dpobj': dpn1});
	this.setByDPArray([dp1]);
    };

    this.oid = "2.5.29.31";
    if (typeof params != "undefined") {
	if (typeof params['array'] != "undefined") {
	    this.setByDPArray(params['array']);
	} else if (typeof params['uri'] != "undefined") {
	    this.setByOneURI(params['uri']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.CRLDistributionPoints, KJUR.asn1.x509.Extension);

/**
 * KeyUsage ASN.1 structure class
 * @name KJUR.asn1.x509.ExtKeyUsage
 * @class ExtKeyUsage ASN.1 structure class
 * @param {Array} params associative array of parameters
 * @extends KJUR.asn1.x509.Extension
 * @description
 * @example
 * var e1 = 
 *     new KJUR.asn1.x509.ExtKeyUsage({'critical': true,
 *                                     'array':
 *                                     [{'oid': '2.5.29.37.0',  // anyExtendedKeyUsage
 *                                       'name': 'clientAuth'}]});
 *
 * // id-ce-extKeyUsage OBJECT IDENTIFIER ::= { id-ce 37 }
 * // ExtKeyUsageSyntax ::= SEQUENCE SIZE (1..MAX) OF KeyPurposeId
 * // KeyPurposeId ::= OBJECT IDENTIFIER
 */
KJUR.asn1.x509.ExtKeyUsage = function(params) {
    KJUR.asn1.x509.ExtKeyUsage.superclass.constructor.call(this, params);

    this.setPurposeArray = function(purposeArray) {
	this.asn1ExtnValue = new KJUR.asn1.DERSequence();
	for (var i = 0; i < purposeArray.length; i++) {
	    var o = new KJUR.asn1.DERObjectIdentifier(purposeArray[i]);
	    this.asn1ExtnValue.appendASN1Object(o);
	}
    };

    this.getExtnValueHex = function() {
	return this.asn1ExtnValue.getEncodedHex();
    };

    this.oid = "2.5.29.37";
    if (typeof params != "undefined") {
	if (typeof params['array'] != "undefined") {
            this.setPurposeArray(params['array']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.ExtKeyUsage, KJUR.asn1.x509.Extension);


// === END   X.509v3 Extensions Related =======================================

// === BEGIN CRL Related ===================================================
/**
 * X.509 CRL class to sign and generate hex encoded CRL
 * @name KJUR.asn1.x509.CRL
 * @class X.509 CRL class to sign and generate hex encoded certificate
 * @param {Array} params associative array of parameters (ex. {'tbsobj': obj, 'rsaprvkey': key})
 * @extends KJUR.asn1.ASN1Object
 * @since 1.0.3
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>tbsobj - specify {@link KJUR.asn1.x509.TBSCertList} object to be signed</li>
 * <li>rsaprvkey - specify {@link RSAKey} object CA private key</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 * <h4>EXAMPLE</h4>
 * @example
 * var prvKey = new RSAKey(); // CA's private key
 * prvKey.readPrivateKeyFromASN1HexString("3080...");
 * var crl = new KJUR.asn1x509.CRL({'tbsobj': tbs, 'rsaprvkey': prvKey});
 * crl.sign(); // issue CRL by CA's private key
 * var hCRL = crl.getEncodedHex();
 *
 * // CertificateList  ::=  SEQUENCE  {
 * //     tbsCertList          TBSCertList,
 * //     signatureAlgorithm   AlgorithmIdentifier,
 * //     signatureValue       BIT STRING  }
 */
KJUR.asn1.x509.CRL = function(params) {
    KJUR.asn1.x509.CRL.superclass.constructor.call(this);

    var asn1TBSCertList = null;
    var asn1SignatureAlg = null;
    var asn1Sig = null;
    var hexSig = null;
    var rsaPrvKey = null;
    
    /**
     * set PKCS#5 encrypted RSA PEM private key as CA key
     * @name setRsaPrvKeyByPEMandPass
     * @memberOf KJUR.asn1.x509.CRL
     * @function
     * @param {String} rsaPEM string of PKCS#5 encrypted RSA PEM private key
     * @param {String} passPEM passcode string to decrypt private key
     * @description
     * <br/>
     * <h4>EXAMPLES</h4>
     * @example
     */
    this.setRsaPrvKeyByPEMandPass = function(rsaPEM, passPEM) {
	var caKeyHex = PKCS5PKEY.getDecryptedKeyHex(rsaPEM, passPEM);
	var caKey = new RSAKey();
	caKey.readPrivateKeyFromASN1HexString(caKeyHex);  
	this.rsaPrvKey = caKey;
    };

    /**
     * sign TBSCertList and set signature value internally
     * @name sign
     * @memberOf KJUR.asn1.x509.CRL
     * @function
     * @description
     * @example
     * var cert = new KJUR.asn1.x509.CRL({'tbsobj': tbs, 'rsaprvkey': prvKey});
     * cert.sign();
     */
    this.sign = function() {
	this.asn1SignatureAlg = this.asn1TBSCertList.asn1SignatureAlg;

	sig = new KJUR.crypto.Signature({'alg': 'SHA1withRSA', 'prov': 'cryptojs/jsrsa'});
	sig.initSign(this.rsaPrvKey);
	sig.updateHex(this.asn1TBSCertList.getEncodedHex());
	this.hexSig = sig.sign();

	this.asn1Sig = new KJUR.asn1.DERBitString({'hex': '00' + this.hexSig});
	
	var seq = new KJUR.asn1.DERSequence({'array': [this.asn1TBSCertList,
						       this.asn1SignatureAlg,
						       this.asn1Sig]});
	this.hTLV = seq.getEncodedHex();
	this.isModified = false;
    };

    this.getEncodedHex = function() {
	if (this.isModified == false && this.hTLV != null) return this.hTLV;
	throw "not signed yet";
    };

    /**
     * get PEM formatted CRL string after signed
     * @name getPEMString
     * @memberOf KJUR.asn1.x509.CRL
     * @function
     * @return PEM formatted string of certificate
     * @description
     * @example
     * var cert = new KJUR.asn1.x509.CRL({'tbsobj': tbs, 'rsaprvkey': prvKey});
     * cert.sign();
     * var sPEM =  cert.getPEMString();
     */
    this.getPEMString = function() {
	var hCert = this.getEncodedHex();
	var wCert = CryptoJS.enc.Hex.parse(hCert);
	var b64Cert = CryptoJS.enc.Base64.stringify(wCert);
	var pemBody = b64Cert.replace(/(.{64})/g, "$1\r\n");
	return "-----BEGIN X509 CRL-----\r\n" + pemBody + "\r\n-----END X509 CRL-----\r\n";
    };

    if (typeof params != "undefined") {
	if (typeof params['tbsobj'] != "undefined") {
	    this.asn1TBSCertList = params['tbsobj'];
	}
	if (typeof params['rsaprvkey'] != "undefined") {
	    this.rsaPrvKey = params['rsaprvkey'];
	}
	if ((typeof params['rsaprvpem'] != "undefined") &&
	    (typeof params['rsaprvpas'] != "undefined")) {
	    this.setRsaPrvKeyByPEMandPass(params['rsaprvpem'], params['rsaprvpas']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.CRL, KJUR.asn1.ASN1Object);

/**
 * ASN.1 TBSCertList structure class for CRL
 * @name KJUR.asn1.x509.TBSCertList
 * @class ASN.1 TBSCertList structure class for CRL
 * @param {Array} params associative array of parameters (ex. {})
 * @extends KJUR.asn1.ASN1Object
 * @since 1.0.3
 * @description
 * <br/>
 * <h4>EXAMPLE</h4>
 * @example
 *  var o = new KJUR.asn1.x509.TBSCertList();
 *  o.setSignatureAlgByParam({'name': 'SHA1withRSA'});
 *  o.setIssuerByParam({'str': '/C=US/O=a'});
 *  o.setNotThisUpdateByParam({'str': '130504235959Z'});
 *  o.setNotNextUpdateByParam({'str': '140504235959Z'});
 *  o.addRevokedCert({'int': 4}, {'str':'130514235959Z'}));
 *  o.addRevokedCert({'hex': '0f34dd'}, {'str':'130514235959Z'}));
 * 
 * // TBSCertList  ::=  SEQUENCE  {
 * //        version                 Version OPTIONAL,
 * //                                     -- if present, MUST be v2
 * //        signature               AlgorithmIdentifier,
 * //        issuer                  Name,
 * //        thisUpdate              Time,
 * //        nextUpdate              Time OPTIONAL,
 * //        revokedCertificates     SEQUENCE OF SEQUENCE  {
 * //             userCertificate         CertificateSerialNumber,
 * //             revocationDate          Time,
 * //             crlEntryExtensions      Extensions OPTIONAL
 * //                                      -- if present, version MUST be v2
 * //                                  }  OPTIONAL,
 * //        crlExtensions           [0]  EXPLICIT Extensions OPTIONAL
 */
KJUR.asn1.x509.TBSCertList = function(params) {
    KJUR.asn1.x509.TBSCertList.superclass.constructor.call(this);
    var aRevokedCert = null;

    /**
     * set signature algorithm field by parameter
     * @name setSignatureAlgByParam
     * @memberOf KJUR.asn1.x509.TBSCertList
     * @function
     * @param {Array} algIdParam AlgorithmIdentifier parameter
     * @description
     * @example
     * tbsc.setSignatureAlgByParam({'name': 'SHA1withRSA'});
     */
    this.setSignatureAlgByParam = function(algIdParam) {
	this.asn1SignatureAlg = new KJUR.asn1.x509.AlgorithmIdentifier(algIdParam);
    };

    /**
     * set issuer name field by parameter
     * @name setIssuerByParam
     * @memberOf KJUR.asn1.x509.TBSCertList
     * @function
     * @param {Array} x500NameParam X500Name parameter
     * @description
     * @example
     * tbsc.setIssuerParam({'str': '/C=US/CN=b'});
     * @see KJUR.asn1.x509.X500Name
     */
    this.setIssuerByParam = function(x500NameParam) {
	this.asn1Issuer = new KJUR.asn1.x509.X500Name(x500NameParam);
    };

    /**
     * set thisUpdate field by parameter
     * @name setThisUpdateByParam
     * @memberOf KJUR.asn1.x509.TBSCertList
     * @function
     * @param {Array} timeParam Time parameter
     * @description
     * @example
     * tbsc.setThisUpdateByParam({'str': '130508235959Z'});
     * @see KJUR.asn1.x509.Time
     */
    this.setThisUpdateByParam = function(timeParam) {
	this.asn1ThisUpdate = new KJUR.asn1.x509.Time(timeParam);
    };

    /**
     * set nextUpdate field by parameter
     * @name setNextUpdateByParam
     * @memberOf KJUR.asn1.x509.TBSCertList
     * @function
     * @param {Array} timeParam Time parameter
     * @description
     * @example
     * tbsc.setNextUpdateByParam({'str': '130508235959Z'});
     * @see KJUR.asn1.x509.Time
     */
    this.setNextUpdateByParam = function(timeParam) {
	this.asn1NextUpdate = new KJUR.asn1.x509.Time(timeParam);
    };

    /**
     * add revoked certficate by parameter
     * @name addRevokedCert
     * @memberOf KJUR.asn1.x509.TBSCertList
     * @function
     * @param {Array} snParam DERInteger parameter for certificate serial number
     * @param {Array} timeParam Time parameter for revocation date
     * @description
     * @example
     * tbsc.addRevokedCert({'int': 3}, {'str': '130508235959Z'});
     * @see KJUR.asn1.x509.Time
     */
    this.addRevokedCert = function(snParam, timeParam) {
	var param = {};
	if (snParam != undefined && snParam != null) param['sn'] = snParam;
	if (timeParam != undefined && timeParam != null) param['time'] = timeParam;
	var o = new KJUR.asn1.x509.CRLEntry(param);
	this.aRevokedCert.push(o);
    };

    this.getEncodedHex = function() {
	this.asn1Array = new Array();

	if (this.asn1Version != null) this.asn1Array.push(this.asn1Version);
	this.asn1Array.push(this.asn1SignatureAlg);
	this.asn1Array.push(this.asn1Issuer);
	this.asn1Array.push(this.asn1ThisUpdate);
	if (this.asn1NextUpdate != null) this.asn1Array.push(this.asn1NextUpdate);

	if (this.aRevokedCert.length > 0) {
	    var seq = new KJUR.asn1.DERSequence({'array': this.aRevokedCert});
	    this.asn1Array.push(seq);
	}

	var o = new KJUR.asn1.DERSequence({"array": this.asn1Array});
	this.hTLV = o.getEncodedHex();
	this.isModified = false;
	return this.hTLV;
    };

    this._initialize = function() {
	this.asn1Version = null;
	this.asn1SignatureAlg = null;
	this.asn1Issuer = null;
	this.asn1ThisUpdate = null;
	this.asn1NextUpdate = null;
	this.aRevokedCert = new Array();
    };

    this._initialize();
};
YAHOO.lang.extend(KJUR.asn1.x509.TBSCertList, KJUR.asn1.ASN1Object);

/**
 * ASN.1 CRLEntry structure class for CRL
 * @name KJUR.asn1.x509.CRLEntry
 * @class ASN.1 CRLEntry structure class for CRL
 * @param {Array} params associative array of parameters (ex. {})
 * @extends KJUR.asn1.ASN1Object
 * @since 1.0.3
 * @description
 * @example
 * var e = new KJUR.asn1.x509.CRLEntry({'time': {'str': '130514235959Z'}, 'sn': {'int': 234}});
 * 
 * // revokedCertificates     SEQUENCE OF SEQUENCE  {
 * //     userCertificate         CertificateSerialNumber,
 * //     revocationDate          Time,
 * //     crlEntryExtensions      Extensions OPTIONAL
 * //                             -- if present, version MUST be v2 }
 */
KJUR.asn1.x509.CRLEntry = function(params) {
    KJUR.asn1.x509.CRLEntry.superclass.constructor.call(this);
    var sn = null;
    var time = null;

    /**
     * set DERInteger parameter for serial number of revoked certificate 
     * @name setCertSerial
     * @memberOf KJUR.asn1.x509.CRLEntry
     * @function
     * @param {Array} intParam DERInteger parameter for certificate serial number
     * @description
     * @example
     * entry.setCertSerial({'int': 3});
     */
    this.setCertSerial = function(intParam) {
	this.sn = new KJUR.asn1.DERInteger(intParam);
    };

    /**
     * set Time parameter for revocation date
     * @name setRevocationDate
     * @memberOf KJUR.asn1.x509.CRLEntry
     * @function
     * @param {Array} timeParam Time parameter for revocation date
     * @description
     * @example
     * entry.setRevocationDate({'str': '130508235959Z'});
     */
    this.setRevocationDate = function(timeParam) {
	this.time = new KJUR.asn1.x509.Time(timeParam);
    };

    this.getEncodedHex = function() {
	var o = new KJUR.asn1.DERSequence({"array": [this.sn, this.time]});
	this.TLV = o.getEncodedHex();
	return this.TLV;
    };
    
    if (typeof params != "undefined") {
	if (typeof params['time'] != "undefined") {
	    this.setRevocationDate(params['time']);
	}
	if (typeof params['sn'] != "undefined") {
	    this.setCertSerial(params['sn']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.CRLEntry, KJUR.asn1.ASN1Object);

// === END   CRL Related ===================================================

// === BEGIN X500Name Related =================================================
/**
 * X500Name ASN.1 structure class
 * @name KJUR.asn1.x509.X500Name
 * @class X500Name ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'str': '/C=US/O=a'})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @example
 */
KJUR.asn1.x509.X500Name = function(params) {
    KJUR.asn1.x509.X500Name.superclass.constructor.call(this);
    this.asn1Array = new Array();

    this.setByString = function(dnStr) {
	var a = dnStr.split('/');
	a.shift();
	for (var i = 0; i < a.length; i++) {
	    this.asn1Array.push(new KJUR.asn1.x509.RDN({'str':a[i]}));
	}
    };

    this.getEncodedHex = function() {
	var o = new KJUR.asn1.DERSequence({"array": this.asn1Array});
	this.TLV = o.getEncodedHex();
	return this.TLV;
    };

    if (typeof params != "undefined") {
	if (typeof params['str'] != "undefined") {
	    this.setByString(params['str']);
	}
    }

};
YAHOO.lang.extend(KJUR.asn1.x509.X500Name, KJUR.asn1.ASN1Object);

/**
 * RDN (Relative Distinguish Name) ASN.1 structure class
 * @name KJUR.asn1.x509.RDN
 * @class RDN (Relative Distinguish Name) ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'str': 'C=US'})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @example
 */
KJUR.asn1.x509.RDN = function(params) {
    KJUR.asn1.x509.RDN.superclass.constructor.call(this);
    this.asn1Array = new Array();

    this.addByString = function(rdnStr) {
	this.asn1Array.push(new KJUR.asn1.x509.AttributeTypeAndValue({'str':rdnStr}));
    };

    this.getEncodedHex = function() {
	var o = new KJUR.asn1.DERSet({"array": this.asn1Array});
	this.TLV = o.getEncodedHex();
	return this.TLV;
    };

    if (typeof params != "undefined") {
	if (typeof params['str'] != "undefined") {
	    this.addByString(params['str']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.RDN, KJUR.asn1.ASN1Object);

/**
 * AttributeTypeAndValue ASN.1 structure class
 * @name KJUR.asn1.x509.AttributeTypeAndValue
 * @class AttributeTypeAndValue ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'str': 'C=US'})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @example
 */
KJUR.asn1.x509.AttributeTypeAndValue = function(params) {
    KJUR.asn1.x509.AttributeTypeAndValue.superclass.constructor.call(this);
    var typeObj = null;
    var valueObj = null;
    var defaultDSType = "utf8";

    this.setByString = function(attrTypeAndValueStr) {
	if (attrTypeAndValueStr.match(/^([^=]+)=(.+)$/)) {
	    this.setByAttrTypeAndValueStr(RegExp.$1, RegExp.$2);
	} else {
	    throw "malformed attrTypeAndValueStr: " + attrTypeAndValueStr;
	}
    };

    this.setByAttrTypeAndValueStr = function(shortAttrType, valueStr) {
	this.typeObj = KJUR.asn1.x509.OID.atype2obj(shortAttrType);
	var dsType = defaultDSType;
	if (shortAttrType == "C") dsType = "prn";
	this.valueObj = this.getValueObj(dsType, valueStr);
    };

    this.getValueObj = function(dsType, valueStr) {
	if (dsType == "utf8")	return new KJUR.asn1.DERUTF8String({"str": valueStr});
	if (dsType == "prn")	return new KJUR.asn1.DERPrintableString({"str": valueStr});
	if (dsType == "tel")	return new KJUR.asn1.DERTeletexString({"str": valueStr});
	if (dsType == "ia5")	return new KJUR.asn1.DERIA5String({"str": valueStr});
	throw "unsupported directory string type: type=" + dsType + " value=" + valueStr;
    };

    this.getEncodedHex = function() {
	var o = new KJUR.asn1.DERSequence({"array": [this.typeObj, this.valueObj]});
	this.TLV = o.getEncodedHex();
	return this.TLV;
    };

    if (typeof params != "undefined") {
	if (typeof params['str'] != "undefined") {
	    this.setByString(params['str']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.AttributeTypeAndValue, KJUR.asn1.ASN1Object);

// === END   X500Name Related =================================================

// === BEGIN Other ASN1 structure class  ======================================

/**
 * SubjectPublicKeyInfo ASN.1 structure class
 * @name KJUR.asn1.x509.SubjectPublicKeyInfo
 * @class SubjectPublicKeyInfo ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'rsakey': key})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>rsakey - specify {@link RSAKey} object of subject public key</li>
 * <li>rsapem - specify a string of PEM public key of RSA key</li>
 * </ul>
 * NOTE: 'params' can be omitted.
 * <h4>EXAMPLE</h4>
 * @example
 */
KJUR.asn1.x509.SubjectPublicKeyInfo = function(params) {
    KJUR.asn1.x509.SubjectPublicKeyInfo.superclass.constructor.call(this);
    var asn1AlgId = null;
    var asn1SubjPKey = null;
    var rsaKey = null;

    /**
     * set RSAKey object as subject public key
     * @name setRSAKey
     * @memberOf KJUR.asn1.x509.SubjectPublicKeyInfo
     * @function
     * @param {RSAKey} rsaKey {@link RSAKey} object for RSA public key
     * @description
     * @example
     * spki.setRSAKey(rsaKey);
     */
    this.setRSAKey = function(rsaKey) {
	if (! RSAKey.prototype.isPrototypeOf(rsaKey))
	    throw "argument is not RSAKey instance";
        this.rsaKey = rsaKey;
	var asn1RsaN = new KJUR.asn1.DERInteger({'bigint': rsaKey.n});
	var asn1RsaE = new KJUR.asn1.DERInteger({'int': rsaKey.e});
	var asn1RsaPub = new KJUR.asn1.DERSequence({'array': [asn1RsaN, asn1RsaE]});
	var rsaKeyHex = asn1RsaPub.getEncodedHex();
	this.asn1AlgId = new KJUR.asn1.x509.AlgorithmIdentifier({'name':'rsaEncryption'});
	this.asn1SubjPKey = new KJUR.asn1.DERBitString({'hex':'00'+rsaKeyHex});
    };

    /**
     * set a PEM formatted RSA public key string as RSA public key
     * @name setRSAPEM
     * @memberOf KJUR.asn1.x509.SubjectPublicKeyInfo
     * @function
     * @param {String} rsaPubPEM PEM formatted RSA public key string
     * @description
     * @example
     * spki.setRSAPEM(rsaPubPEM);
     */
    this.setRSAPEM = function(rsaPubPEM) {
	if (rsaPubPEM.match(/-----BEGIN PUBLIC KEY-----/)) {
	    var s = rsaPubPEM;
	    s = s.replace(/^-----[^-]+-----/, '');
	    s = s.replace(/-----[^-]+-----\s*$/, '');
	    var rsaB64 = s.replace(/\s+/g, '');
	    var rsaWA = CryptoJS.enc.Base64.parse(rsaB64);
	    var rsaP8Hex = CryptoJS.enc.Hex.stringify(rsaWA);
	    var a = _rsapem_getHexValueArrayOfChildrenFromHex(rsaP8Hex);
	    var hBitStrVal = a[1];
	    var rsaHex = hBitStrVal.substr(2);
	    var a3 = _rsapem_getHexValueArrayOfChildrenFromHex(rsaHex);
	    var rsaKey = new RSAKey();
	    rsaKey.setPublic(a3[0], a3[1]);
	    this.setRSAKey(rsaKey);
	} else {
	    throw "key not supported";
	}
    };

    this.getEncodedHex = function() {
	if (this.asn1AlgId == null || this.asn1SubjPKey == null)
	    throw "algId and/or subjPubKey not set";
	var o = new KJUR.asn1.DERSequence({'array':
					   [this.asn1AlgId, this.asn1SubjPKey]});
	this.hTLV = o.getEncodedHex();
	return this.hTLV;
    }

    if (typeof params != "undefined") {
	if (typeof params['rsakey'] != "undefined") {
	    this.setRSAKey(params['rsakey']);
	}
	if (typeof params['rsapem'] != "undefined") {
	    this.setRSAPEM(params['rsapem']);
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.SubjectPublicKeyInfo, KJUR.asn1.ASN1Object);

/**
 * Time ASN.1 structure class
 * @name KJUR.asn1.x509.Time
 * @class Time ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'str': '130508235959Z'})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * <br/>
 * <h4>EXAMPLES</h4>
 * @example
 * var t1 = new KJUR.asn1.x509.Time{'str': '130508235959Z'} // UTCTime by default
 * var t2 = new KJUR.asn1.x509.Time{'type': 'gen',  'str': '20130508235959Z'} // GeneralizedTime
 */
KJUR.asn1.x509.Time = function(params) {
    KJUR.asn1.x509.Time.superclass.constructor.call(this);
    var type = null;
    var timeParams = null;

    this.setTimeParams = function(timeParams) {
	this.timeParams = timeParams;
    }

    this.getEncodedHex = function() {
	if (this.timeParams == null) {
	    throw "timeParams shall be specified. ({'str':'130403235959Z'}}";
	}
	var o = null;
	if (this.type == "utc") {
	    o = new KJUR.asn1.DERUTCTime(this.timeParams);
	} else {
	    o = new KJUR.asn1.DERGeneralizedTime(this.timeParams);
	}
	this.TLV = o.getEncodedHex();
	return this.TLV;
    };
 
    this.type = "utc";
    if (typeof params != "undefined") {
	if (typeof params['type'] != "undefined") {
	    this.type = params['type'];
	}
	this.timeParams = params;
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.Time, KJUR.asn1.ASN1Object);

/**
 * AlgorithmIdentifier ASN.1 structure class
 * @name KJUR.asn1.x509.AlgorithmIdentifier
 * @class AlgorithmIdentifier ASN.1 structure class
 * @param {Array} params associative array of parameters (ex. {'name': 'SHA1withRSA'})
 * @extends KJUR.asn1.ASN1Object
 * @description
 * @example
 */
KJUR.asn1.x509.AlgorithmIdentifier = function(params) {
    KJUR.asn1.x509.AlgorithmIdentifier.superclass.constructor.call(this);
    var nameAlg = null;
    var asn1Alg = null;
    var asn1Params = null;

    this.getEncodedHex = function() {
	if (this.nameAlg == null && this.asn1Alg == null) {
	    throw "algorithm not specified";
	}
	if (this.nameAlg != null && this.asn1Alg == null) {
	    this.asn1Alg = KJUR.asn1.x509.OID.name2obj(this.nameAlg);
	}
	var o = new KJUR.asn1.DERSequence({'array':[this.asn1Alg,
						    this.asn1Params]});
	this.hTLV = o.getEncodedHex();
	return this.hTLV;
    };

    if (typeof params != "undefined") {
	if (typeof params['name'] != "undefined") {
	    this.nameAlg = params['name'];
	}
	if (typeof params['asn1params'] != "undefined") {
	    this.asn1Params = params['asn1params'];
	}
    }
    if (this.asn1Params == null) {
	this.asn1Params = new KJUR.asn1.DERNull();
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.AlgorithmIdentifier, KJUR.asn1.ASN1Object);

/**
 * GeneralName ASN.1 structure class
 * @name KJUR.asn1.x509.GeneralName
 * @class GeneralName ASN.1 structure class
 * @description
 * <br/>
 * As for argument 'params' for constructor, you can specify one of
 * following properties:
 * <ul>
 * <li>rfc822 - rfc822Name[1] (ex. user1@foo.com)</li>
 * <li>dns - dNSName[2] (ex. foo.com)</li>
 * <li>uri - uniformResourceIdentifier[6] (ex. http://foo.com/)</li>
 * </ul>
 * NOTE: Currently this only supports 'uniformResourceIdentifier'.
 * <h4>EXAMPLE AND ASN.1 SYNTAX</h4>
 * @example
 * var gn = new KJUR.asn1.x509.GeneralName({'uri': 'http://aaa.com/'});
 *
 * GeneralName ::= CHOICE {
 *         otherName                       [0]     OtherName,
 *         rfc822Name                      [1]     IA5String,
 *         dNSName                         [2]     IA5String,
 *         x400Address                     [3]     ORAddress,
 *         directoryName                   [4]     Name,
 *         ediPartyName                    [5]     EDIPartyName,
 *         uniformResourceIdentifier       [6]     IA5String,
 *         iPAddress                       [7]     OCTET STRING,
 *         registeredID                    [8]     OBJECT IDENTIFIER } 
 */
KJUR.asn1.x509.GeneralName = function(params) {
    KJUR.asn1.x509.GeneralName.superclass.constructor.call(this);
    var asn1Obj = null;
    var type = null;
    var pTag = {'rfc822': '81', 'dns': '82', 'uri': '86'};

    this.setByParam = function(params) {
	var str = null;
	var v = null;

	if (typeof params['rfc822'] != "undefined") {
	    this.type = 'rfc822';
	    v = new KJUR.asn1.DERIA5String({'str': params[this.type]});
	}
	if (typeof params['dns'] != "undefined") {
	    this.type = 'dns';
	    v = new KJUR.asn1.DERIA5String({'str': params[this.type]});
	}
	if (typeof params['uri'] != "undefined") {
	    this.type = 'uri';
	    v = new KJUR.asn1.DERIA5String({'str': params[this.type]});
	}

	if (this.type == null)
	    throw "unsupported type in params=" + params;
        this.asn1Obj = new KJUR.asn1.DERTaggedObject({'explicit': false,
						      'tag': pTag[this.type],
						      'obj': v});
    };

    this.getEncodedHex = function() {
	return this.asn1Obj.getEncodedHex();
    }

    if (typeof params != "undefined") {
	this.setByParam(params);
    }

};
YAHOO.lang.extend(KJUR.asn1.x509.GeneralName, KJUR.asn1.ASN1Object);

/**
 * GeneralNames ASN.1 structure class
 * @name KJUR.asn1.x509.GeneralNames
 * @class GeneralNames ASN.1 structure class
 * @description
 * <br/>
 * <h4>EXAMPLE AND ASN.1 SYNTAX</h4>
 * @example
 * var gns = new KJUR.asn1.x509.GeneralNames([{'uri': 'http://aaa.com/'}, {'uri': 'http://bbb.com/'}]); 
 *
 * GeneralNames ::= SEQUENCE SIZE (1..MAX) OF GeneralName
 */
KJUR.asn1.x509.GeneralNames = function(paramsArray) {
    KJUR.asn1.x509.GeneralNames.superclass.constructor.call(this);
    var asn1Array = null;

    /**
     * set a array of {@link KJUR.asn1.x509.GeneralName} parameters
     * @name setByParamArray
     * @memberOf KJUR.asn1.x509.GeneralNames
     * @function
     * @param {Array} paramsArray Array of {@link KJUR.asn1.x509.GeneralNames}
     * @description
     * <br/>
     * <h4>EXAMPLES</h4>
     * @example
     * var gns = new KJUR.asn1.x509.GeneralNames();
     * gns.setByParamArray([{'uri': 'http://aaa.com/'}, {'uri': 'http://bbb.com/'}]);
     */
    this.setByParamArray = function(paramsArray) {
	for (var i = 0; i < paramsArray.length; i++) {
	    var o = new KJUR.asn1.x509.GeneralName(paramsArray[i]);
	    this.asn1Array.push(o);
	}
    };

    this.getEncodedHex = function() {
	var o = new KJUR.asn1.DERSequence({'array': this.asn1Array});
	return o.getEncodedHex();
    };

    this.asn1Array = new Array();
    if (typeof paramsArray != "undefined") {
	this.setByParamArray(paramsArray);
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.GeneralNames, KJUR.asn1.ASN1Object);

/**
 * DistributionPointName ASN.1 structure class
 * @name KJUR.asn1.x509.DistributionPointName
 * @class DistributionPointName ASN.1 structure class
 * @description
 * @example
 */
KJUR.asn1.x509.DistributionPointName = function(gnOrRdn) {
    KJUR.asn1.x509.DistributionPointName.superclass.constructor.call(this);
    var asn1Obj = null;
    var type = null;
    var tag = null;
    var asn1V = null;

    this.getEncodedHex = function() {
	if (this.type != "full")
	    throw "currently type shall be 'full': " + this.type;
	this.asn1Obj = new KJUR.asn1.DERTaggedObject({'explicit': false,
						      'tag': this.tag,
						      'obj': this.asn1V});
	this.hTLV = this.asn1Obj.getEncodedHex();
	return this.hTLV;
    };

    if (typeof gnOrRdn != "undefined") {
	if (KJUR.asn1.x509.GeneralNames.prototype.isPrototypeOf(gnOrRdn)) {
	    this.type = "full";
	    this.tag = "a0";
	    this.asn1V = gnOrRdn;
	} else {
	    throw "This class supports GeneralNames only as argument";
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.DistributionPointName, KJUR.asn1.ASN1Object);

/**
 * DistributionPoint ASN.1 structure class
 * @name KJUR.asn1.x509.DistributionPoint
 * @class DistributionPoint ASN.1 structure class
 * @description
 * @example
 */
KJUR.asn1.x509.DistributionPoint = function(params) {
    KJUR.asn1.x509.DistributionPoint.superclass.constructor.call(this);
    var asn1DP = null;

    this.getEncodedHex = function() {
	var seq = new KJUR.asn1.DERSequence();
	if (this.asn1DP != null) {
	    var o1 = new KJUR.asn1.DERTaggedObject({'explicit': true,
						    'tag': 'a0',
						    'obj': this.asn1DP});
	    seq.appendASN1Object(o1);
	}
	this.hTLV = seq.getEncodedHex();
	return this.hTLV;
    };

    if (typeof params != "undefined") {
	if (typeof params['dpobj'] != "undefined") {
	    this.asn1DP = params['dpobj'];
	}
    }
};
YAHOO.lang.extend(KJUR.asn1.x509.DistributionPoint, KJUR.asn1.ASN1Object);

/**
 * static object for OID
 * @name KJUR.asn1.x509.OID
 * @class static object for OID
 * @property {Assoc Array} atype2oidList for short attribyte type name and oid (i.e. 'C' and '2.5.4.6')
 * @property {Assoc Array} name2oidList for oid name and oid (i.e. 'keyUsage' and '2.5.29.15')
 * @property {Assoc Array} objCache for caching name and DERObjectIdentifier object 
 * @description
 * <dl>
 * <dt><b>atype2oidList</b>
 * <dd>currently supports 'C', 'O', 'OU', 'ST', 'L' and 'CN' only.
 * <dt><b>name2oidList</b>
 * <dd>currently supports 'SHA1withRSA', 'rsaEncryption' and some extension OIDs
 * </dl>
 * @example
 */
KJUR.asn1.x509.OID = new function(params) {
    this.atype2oidList = {
	'C':	'2.5.4.6',
	'O':	'2.5.4.10',
	'OU':	'2.5.4.11',
	'ST':	'2.5.4.8',
	'L':	'2.5.4.7',
	'CN':	'2.5.4.3',
    };
    this.name2oidList = {
	'sha384':			'2.16.840.1.101.3.4.2.2',
	'sha224':			'2.16.840.1.101.3.4.2.4',
	'SHA1withRSA':			'1.2.840.113549.1.1.5',
        'rsaEncryption':		'1.2.840.113549.1.1.1',
	'subjectKeyIdentifier':		'2.5.29.14',

	'keyUsage':			'2.5.29.15',
	'basicConstraints':		'2.5.29.19',
	'cRLDistributionPoints':	'2.5.29.31',
	'certificatePolicies':		'2.5.29.32',
	'authorityKeyIdentifier':	'2.5.29.35',
	'extKeyUsage':			'2.5.29.37',

	'anyExtendedKeyUsage':		'2.5.29.37.0',
	'serverAuth':			'1.3.6.1.5.5.7.3.1',
	'clientAuth':			'1.3.6.1.5.5.7.3.2',
	'codeSigning':			'1.3.6.1.5.5.7.3.3',
	'emailProtection':		'1.3.6.1.5.5.7.3.4',
	'timeStamping':			'1.3.6.1.5.5.7.3.8',
	'ocspSigning':			'1.3.6.1.5.5.7.3.9',
    };

    this.objCache = {};

    /**
     * get DERObjectIdentifier by registered OID name
     * @name name2obj
     * @memberOf KJUR.asn1.x509.OID
     * @function
     * @param {String} name OID
     * @description
     * @example
     * var asn1ObjOID = OID.name2obj('SHA1withRSA');
     */
    this.name2obj = function(name) {
	if (typeof this.objCache[name] != "undefined")
	    return this.objCache[name];
	if (typeof this.name2oidList[name] == "undefined")
	    throw "Name of ObjectIdentifier not defined: " + name;
	var oid = this.name2oidList[name];
	var obj = new KJUR.asn1.DERObjectIdentifier({'oid': oid});
	this.objCache[name] = obj;
	return obj;
    };

    /**
     * get DERObjectIdentifier by registered attribyte type name such like 'C' or 'CN'
     * @name atype2obj
     * @memberOf KJUR.asn1.x509.OID
     * @function
     * @param {String} atype short attribute type name such like 'C' or 'CN'
     * @description
     * @example
     * var asn1ObjOID = OID.atype2obj('CN');
     */
    this.atype2obj = function(atype) {
	if (typeof this.objCache[atype] != "undefined")
	    return this.objCache[atype];
	if (typeof this.atype2oidList[atype] == "undefined")
	    throw "AttributeType name undefined: " + atype;
	var oid = this.atype2oidList[atype];
	var obj = new KJUR.asn1.DERObjectIdentifier({'oid': oid});
	this.objCache[atype] = obj;
	return obj;
    };
};

/*
org.bouncycastle.asn1.x500
AttributeTypeAndValue
DirectoryString
RDN
X500Name
X500NameBuilder

org.bouncycastleasn1.x509
TBSCertificate
 */