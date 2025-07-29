import cv2
import numpy as np
from pyzbar import pyzbar
import xml.etree.ElementTree as ET
import base64
import re
import logging
from typing import Dict, Tuple, Optional

logger = logging.getLogger(__name__)

class AadhaarVerificationService:
    """Service for Aadhaar card QR code and barcode verification"""
    
    def __init__(self):
        self.required_fields = ['name', 'gender', 'dob', 'uid']
    
    def verify_aadhaar_image(self, image_path: str) -> Dict:
        """
        Verify Aadhaar card by scanning QR code or barcode
        
        Args:
            image_path: Path to the Aadhaar card image
            
        Returns:
            Dict with verification result and extracted data
        """
        try:
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                return {
                    'success': False,
                    'error': 'Could not read image file',
                    'verification_status': 'failed'
                }
            
            # Try to decode QR codes and barcodes
            qr_data = self._decode_qr_codes(image)
            if qr_data:
                return self._process_qr_data(qr_data)
            
            # If no QR code found, try barcode
            barcode_data = self._decode_barcodes(image)
            if barcode_data:
                return self._process_barcode_data(barcode_data)
            
            # If no codes found, try OCR as fallback
            ocr_data = self._extract_text_ocr(image)
            return self._process_ocr_data(ocr_data)
            
        except Exception as e:
            logger.error(f"Error verifying Aadhaar: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'verification_status': 'failed'
            }
    
    def _decode_qr_codes(self, image) -> Optional[str]:
        """Decode QR codes from image"""
        try:
            # Convert to grayscale for better detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect and decode QR codes
            qr_codes = pyzbar.decode(gray)
            
            for qr_code in qr_codes:
                # Aadhaar QR codes contain XML data
                qr_data = qr_code.data.decode('utf-8')
                if self._is_aadhaar_qr(qr_data):
                    return qr_data
            
            return None
            
        except Exception as e:
            logger.error(f"Error decoding QR codes: {str(e)}")
            return None
    
    def _decode_barcodes(self, image) -> Optional[str]:
        """Decode barcodes from image"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            barcodes = pyzbar.decode(gray)
            
            for barcode in barcodes:
                barcode_data = barcode.data.decode('utf-8')
                if self._is_aadhaar_barcode(barcode_data):
                    return barcode_data
            
            return None
            
        except Exception as e:
            logger.error(f"Error decoding barcodes: {str(e)}")
            return None
    
    def _is_aadhaar_qr(self, data: str) -> bool:
        """Check if QR data is from Aadhaar card"""
        # Aadhaar QR codes typically contain XML with specific structure
        try:
            root = ET.fromstring(data)
            # Check for Aadhaar-specific XML structure
            return 'uid' in root.attrib or any('uid' in child.attrib for child in root)
        except:
            return False
    
    def _is_aadhaar_barcode(self, data: str) -> bool:
        """Check if barcode data is from Aadhaar card"""
        # Aadhaar barcodes typically contain 12-digit UID
        return bool(re.match(r'^\d{12}$', data.strip()))
    
    def _process_qr_data(self, qr_data: str) -> Dict:
        """Process Aadhaar QR code data"""
        try:
            # Parse XML data from QR code
            root = ET.fromstring(qr_data)
            
            extracted_data = {}
            
            # Extract data from XML attributes
            if 'uid' in root.attrib:
                extracted_data['aadhaar_number'] = root.attrib['uid']
            if 'name' in root.attrib:
                extracted_data['name'] = root.attrib['name']
            if 'gender' in root.attrib:
                extracted_data['gender'] = root.attrib['gender'].lower()
            if 'dob' in root.attrib:
                extracted_data['date_of_birth'] = root.attrib['dob']
            if 'co' in root.attrib:
                extracted_data['address'] = root.attrib['co']
            
            # Validate extracted data
            validation_result = self._validate_aadhaar_data(extracted_data)
            
            return {
                'success': True,
                'verification_status': 'verified' if validation_result['valid'] else 'failed',
                'extracted_data': extracted_data,
                'validation_errors': validation_result.get('errors', []),
                'confidence': 0.95,  # High confidence for QR code
                'verification_method': 'qr_code'
            }
            
        except Exception as e:
            logger.error(f"Error processing QR data: {str(e)}")
            return {
                'success': False,
                'error': f'Invalid QR code format: {str(e)}',
                'verification_status': 'failed'
            }
    
    def _process_barcode_data(self, barcode_data: str) -> Dict:
        """Process Aadhaar barcode data"""
        try:
            # Barcode typically contains just the Aadhaar number
            aadhaar_number = barcode_data.strip()
            
            if not re.match(r'^\d{12}$', aadhaar_number):
                return {
                    'success': False,
                    'error': 'Invalid Aadhaar number format in barcode',
                    'verification_status': 'failed'
                }
            
            extracted_data = {
                'aadhaar_number': aadhaar_number
            }
            
            return {
                'success': True,
                'verification_status': 'partial',  # Only number verified
                'extracted_data': extracted_data,
                'confidence': 0.8,  # Medium confidence for barcode only
                'verification_method': 'barcode',
                'note': 'Only Aadhaar number verified. Please ensure other details match.'
            }
            
        except Exception as e:
            logger.error(f"Error processing barcode data: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'verification_status': 'failed'
            }
    
    def _extract_text_ocr(self, image) -> str:
        """Extract text using OCR as fallback"""
        try:
            import pytesseract
            
            # Preprocess image for better OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold to get better text recognition
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Extract text
            text = pytesseract.image_to_string(thresh, lang='eng+hin')
            return text
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {str(e)}")
            return ""
    
    def _process_ocr_data(self, text: str) -> Dict:
        """Process OCR extracted text"""
        try:
            # Look for Aadhaar number pattern
            aadhaar_pattern = r'\b\d{4}\s*\d{4}\s*\d{4}\b'
            aadhaar_matches = re.findall(aadhaar_pattern, text)
            
            extracted_data = {}
            
            if aadhaar_matches:
                # Clean up the Aadhaar number
                aadhaar_number = re.sub(r'\s+', '', aadhaar_matches[0])
                extracted_data['aadhaar_number'] = aadhaar_number
            
            # Look for name patterns (after "Name:" or similar)
            name_patterns = [
                r'Name[:\s]+([A-Za-z\s]+)',
                r'नाम[:\s]+([A-Za-z\s]+)',
            ]
            
            for pattern in name_patterns:
                name_match = re.search(pattern, text, re.IGNORECASE)
                if name_match:
                    extracted_data['name'] = name_match.group(1).strip()
                    break
            
            if not extracted_data:
                return {
                    'success': False,
                    'error': 'No Aadhaar data found in image',
                    'verification_status': 'failed'
                }
            
            return {
                'success': True,
                'verification_status': 'partial',
                'extracted_data': extracted_data,
                'confidence': 0.6,  # Lower confidence for OCR
                'verification_method': 'ocr',
                'note': 'Partial verification using OCR. Please verify details manually.'
            }
            
        except Exception as e:
            logger.error(f"Error processing OCR data: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'verification_status': 'failed'
            }
    
    def _validate_aadhaar_data(self, data: Dict) -> Dict:
        """Validate extracted Aadhaar data"""
        errors = []
        
        # Check Aadhaar number format
        if 'aadhaar_number' in data:
            aadhaar = data['aadhaar_number']
            if not re.match(r'^\d{12}$', aadhaar):
                errors.append('Invalid Aadhaar number format')
        else:
            errors.append('Aadhaar number not found')
        
        # Check name
        if 'name' in data:
            name = data['name'].strip()
            if len(name) < 2:
                errors.append('Name too short')
        
        # Check gender
        if 'gender' in data:
            gender = data['gender'].lower()
            if gender not in ['male', 'female', 'm', 'f']:
                errors.append('Invalid gender format')
        
        # Check date of birth format
        if 'date_of_birth' in data:
            dob = data['date_of_birth']
            if not re.match(r'\d{2}-\d{2}-\d{4}', dob) and not re.match(r'\d{4}-\d{2}-\d{2}', dob):
                errors.append('Invalid date of birth format')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def compare_with_user_data(self, extracted_data: Dict, user_data: Dict) -> Dict:
        """Compare extracted Aadhaar data with user-provided data"""
        matches = {}
        mismatches = []
        
        # Compare name
        if 'name' in extracted_data and 'name' in user_data:
            extracted_name = extracted_data['name'].lower().strip()
            user_name = user_data['name'].lower().strip()
            matches['name'] = extracted_name == user_name
            if not matches['name']:
                mismatches.append(f"Name mismatch: '{extracted_data['name']}' vs '{user_data['name']}'")
        
        # Compare gender
        if 'gender' in extracted_data and 'gender' in user_data:
            extracted_gender = extracted_data['gender'].lower()
            user_gender = user_data['gender'].lower()
            # Handle different gender formats
            gender_map = {'m': 'male', 'f': 'female'}
            extracted_gender = gender_map.get(extracted_gender, extracted_gender)
            matches['gender'] = extracted_gender == user_gender
            if not matches['gender']:
                mismatches.append(f"Gender mismatch: '{extracted_data['gender']}' vs '{user_data['gender']}'")
        
        # Compare Aadhaar number
        if 'aadhaar_number' in extracted_data and 'aadhaarNumber' in user_data:
            matches['aadhaar'] = extracted_data['aadhaar_number'] == user_data['aadhaarNumber']
            if not matches['aadhaar']:
                mismatches.append("Aadhaar number mismatch")
        
        overall_match = len(mismatches) == 0 and len(matches) > 0
        
        return {
            'overall_match': overall_match,
            'individual_matches': matches,
            'mismatches': mismatches,
            'match_percentage': (sum(matches.values()) / len(matches) * 100) if matches else 0
        }

# Global instance
aadhaar_verification_service = AadhaarVerificationService()
