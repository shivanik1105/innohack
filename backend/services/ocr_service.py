import cv2
import numpy as np
import pytesseract
from PIL import Image
import re
import logging
from typing import Dict, List, Tuple, Optional
import os
from difflib import SequenceMatcher

# Try to import fuzzywuzzy, fall back to basic matching if not available
try:
    from fuzzywuzzy import fuzz, process
    FUZZYWUZZY_AVAILABLE = True
except ImportError:
    FUZZYWUZZY_AVAILABLE = False
    print("Warning: fuzzywuzzy not available, using basic string matching")

logger = logging.getLogger(__name__)

class TesseractOCRService:
    """Real OCR service using Tesseract for certificate verification"""
    
    def __init__(self):
        # Configure Tesseract path (adjust based on your installation)
        # For Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        # For Linux/Mac: Usually in PATH
        self.tesseract_config = '--oem 3 --psm 6'  # OCR Engine Mode 3, Page Segmentation Mode 6
        
    def process_certificate_image(self, image_path: str, user_name: str = None) -> Dict:
        """
        Process certificate image and extract text using Tesseract OCR

        Args:
            image_path: Path to the certificate image
            user_name: Name of the user uploading the certificate for verification

        Returns:
            Dict containing extracted text and verification data
        """
        try:
            # Load and preprocess image
            processed_image = self._preprocess_image(image_path)
            
            # Extract text using Tesseract
            extracted_text = self._extract_text(processed_image)
            
            # Parse certificate data
            certificate_data = self._parse_certificate_data(extracted_text)
            
            # Calculate confidence score
            confidence = self._calculate_confidence(extracted_text, certificate_data)

            # Perform name verification if user_name is provided
            name_verification = self._verify_name_match(certificate_data, user_name) if user_name else None

            # Determine overall verification status
            verification_status = self._determine_verification_status(confidence, name_verification)

            result = {
                'success': True,
                'extracted_text': extracted_text,
                'certificate_data': certificate_data,
                'confidence': confidence,
                'verification_status': verification_status
            }

            # Add name verification details if performed
            if name_verification:
                result['name_verification'] = name_verification

            return result
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': '',
                'certificate_data': {},
                'confidence': 0.0,
                'verification_status': 'failed'
            }
    
    def _preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for better OCR results"""
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply threshold to get binary image
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Morphological operations to clean up the image
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        # Resize image if too small (OCR works better on larger images)
        height, width = cleaned.shape
        if height < 600 or width < 800:
            scale_factor = max(600/height, 800/width)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            cleaned = cv2.resize(cleaned, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        return cleaned
    
    def _extract_text(self, image: np.ndarray) -> str:
        """Extract text from preprocessed image using Tesseract"""
        try:
            # Convert numpy array to PIL Image
            pil_image = Image.fromarray(image)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(pil_image, config=self.tesseract_config)
            
            # Clean up extracted text
            cleaned_text = self._clean_text(text)
            
            return cleaned_text
            
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            return ""
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        # Remove extra whitespace and newlines
        cleaned = re.sub(r'\s+', ' ', text.strip())
        
        # Remove special characters that might interfere
        cleaned = re.sub(r'[^\w\s\-\.\,\:\(\)]', '', cleaned)
        
        return cleaned
    
    def _parse_certificate_data(self, text: str) -> Dict:
        """Parse certificate data from extracted text"""
        data = {}
        text_lower = text.lower()
        
        # Extract name patterns
        name_patterns = [
            r'name[:\s]+([a-zA-Z\s]+)',
            r'candidate[:\s]+([a-zA-Z\s]+)',
            r'student[:\s]+([a-zA-Z\s]+)',
            r'mr\.?\s+([a-zA-Z\s]+)',
            r'ms\.?\s+([a-zA-Z\s]+)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text_lower)
            if match:
                data['name'] = match.group(1).strip().title()
                break
        
        # Extract certificate number/ID
        id_patterns = [
            r'certificate\s+no[:\.\s]+([A-Z0-9\-\/]+)',
            r'cert\s+no[:\.\s]+([A-Z0-9\-\/]+)',
            r'registration\s+no[:\.\s]+([A-Z0-9\-\/]+)',
            r'id[:\.\s]+([A-Z0-9\-\/]+)',
        ]
        
        for pattern in id_patterns:
            match = re.search(pattern, text_lower)
            if match:
                data['certificate_number'] = match.group(1).strip().upper()
                break
        
        # Extract dates
        date_patterns = [
            r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
            r'(\d{1,2}\s+[a-zA-Z]+\s+\d{2,4})',
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            dates.extend(matches)
        
        if dates:
            data['issue_date'] = dates[0]
            if len(dates) > 1:
                data['expiry_date'] = dates[1]
        
        # Extract institution/issuer
        institution_patterns = [
            r'issued\s+by[:\s]+([a-zA-Z\s&\-\.]+)',
            r'institute[:\s]+([a-zA-Z\s&\-\.]+)',
            r'university[:\s]+([a-zA-Z\s&\-\.]+)',
            r'board[:\s]+([a-zA-Z\s&\-\.]+)',
        ]
        
        for pattern in institution_patterns:
            match = re.search(pattern, text_lower)
            if match:
                data['issuer'] = match.group(1).strip().title()
                break
        
        # Extract course/skill
        course_patterns = [
            r'course[:\s]+([a-zA-Z\s&\-\.]+)',
            r'trade[:\s]+([a-zA-Z\s&\-\.]+)',
            r'skill[:\s]+([a-zA-Z\s&\-\.]+)',
            r'qualification[:\s]+([a-zA-Z\s&\-\.]+)',
        ]
        
        for pattern in course_patterns:
            match = re.search(pattern, text_lower)
            if match:
                data['course'] = match.group(1).strip().title()
                break
        
        return data
    
    def _calculate_confidence(self, text: str, parsed_data: Dict) -> float:
        """Calculate confidence score based on extracted data quality"""
        if not text or len(text.strip()) < 10:
            return 0.0
        
        confidence_factors = []
        
        # Text length factor (longer text usually means better extraction)
        text_length_score = min(len(text) / 200, 1.0)
        confidence_factors.append(text_length_score * 0.2)
        
        # Parsed data completeness
        required_fields = ['name', 'certificate_number', 'issue_date', 'issuer']
        found_fields = sum(1 for field in required_fields if field in parsed_data)
        completeness_score = found_fields / len(required_fields)
        confidence_factors.append(completeness_score * 0.4)
        
        # Certificate keywords presence
        certificate_keywords = [
            'certificate', 'diploma', 'qualification', 'issued', 'completed',
            'training', 'course', 'skill', 'competency', 'authorized'
        ]
        text_lower = text.lower()
        keyword_score = sum(1 for keyword in certificate_keywords if keyword in text_lower)
        keyword_score = min(keyword_score / len(certificate_keywords), 1.0)
        confidence_factors.append(keyword_score * 0.3)
        
        # Date format validation
        date_score = 0.0
        if 'issue_date' in parsed_data:
            # Simple date format validation
            date_patterns = [r'\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}', r'\d{1,2}\s+[a-zA-Z]+\s+\d{2,4}']
            for pattern in date_patterns:
                if re.search(pattern, parsed_data['issue_date']):
                    date_score = 1.0
                    break
        confidence_factors.append(date_score * 0.1)
        
        return sum(confidence_factors)
    
    def verify_certificate_authenticity(self, certificate_data: Dict) -> Tuple[bool, List[str]]:
        """
        Verify certificate authenticity based on extracted data
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        
        # Check required fields
        required_fields = ['name', 'certificate_number']
        for field in required_fields:
            if field not in certificate_data or not certificate_data[field]:
                issues.append(f"Missing {field}")
        
        # Validate certificate number format
        if 'certificate_number' in certificate_data:
            cert_no = certificate_data['certificate_number']
            if len(cert_no) < 5:
                issues.append("Certificate number too short")
        
        # Validate name format
        if 'name' in certificate_data:
            name = certificate_data['name']
            if len(name.split()) < 2:
                issues.append("Name should contain at least first and last name")
        
        # Check for suspicious patterns
        suspicious_patterns = ['test', 'sample', 'dummy', 'fake', 'template']
        text_to_check = ' '.join(certificate_data.values()).lower()
        for pattern in suspicious_patterns:
            if pattern in text_to_check:
                issues.append(f"Contains suspicious text: {pattern}")
        
        is_valid = len(issues) == 0
        return is_valid, issues

    def _verify_name_match(self, certificate_data: Dict, user_name: str) -> Dict:
        """
        Verify if the name extracted from certificate matches the user's name

        Args:
            certificate_data: Parsed certificate data containing extracted name
            user_name: User's name from database

        Returns:
            Dict containing name verification results
        """
        if not user_name or 'name' not in certificate_data:
            return {
                'match': False,
                'confidence': 0.0,
                'reason': 'Missing name data',
                'extracted_name': certificate_data.get('name', ''),
                'user_name': user_name or ''
            }

        extracted_name = certificate_data['name'].strip()
        user_name = user_name.strip()

        # Normalize names for comparison
        normalized_extracted = self._normalize_name(extracted_name)
        normalized_user = self._normalize_name(user_name)

        # Calculate similarity scores using different methods
        similarity_scores = self._calculate_name_similarity(normalized_extracted, normalized_user)

        # Determine if names match based on similarity threshold
        max_similarity = max(similarity_scores.values())
        match_threshold = 0.8  # 80% similarity required

        is_match = max_similarity >= match_threshold

        return {
            'match': is_match,
            'confidence': max_similarity,
            'similarity_scores': similarity_scores,
            'extracted_name': extracted_name,
            'user_name': user_name,
            'normalized_extracted': normalized_extracted,
            'normalized_user': normalized_user,
            'threshold': match_threshold,
            'reason': 'Names match' if is_match else f'Similarity too low: {max_similarity:.2f} < {match_threshold}'
        }

    def _normalize_name(self, name: str) -> str:
        """
        Normalize name for better comparison

        Args:
            name: Raw name string

        Returns:
            Normalized name string
        """
        if not name:
            return ""

        # Convert to lowercase
        normalized = name.lower()

        # Remove common prefixes and suffixes
        prefixes = ['mr.', 'mrs.', 'ms.', 'dr.', 'prof.', 'shri', 'smt.', 'kumari']
        suffixes = ['jr.', 'sr.', 'ii', 'iii']

        words = normalized.split()

        # Remove prefixes
        if words and words[0] in prefixes:
            words = words[1:]

        # Remove suffixes
        if words and words[-1] in suffixes:
            words = words[:-1]

        # Remove extra spaces and special characters
        normalized = ' '.join(words)
        normalized = re.sub(r'[^\w\s]', '', normalized)
        normalized = re.sub(r'\s+', ' ', normalized).strip()

        return normalized

    def _calculate_name_similarity(self, name1: str, name2: str) -> Dict[str, float]:
        """
        Calculate similarity between two names using multiple algorithms

        Args:
            name1: First name (normalized)
            name2: Second name (normalized)

        Returns:
            Dict containing similarity scores from different algorithms
        """
        if not name1 or not name2:
            return {
                'exact_match': 0.0,
                'fuzzy_ratio': 0.0,
                'fuzzy_partial': 0.0,
                'fuzzy_token_sort': 0.0,
                'fuzzy_token_set': 0.0,
                'sequence_matcher': 0.0
            }

        # Exact match
        exact_match = 1.0 if name1 == name2 else 0.0

        # Fuzzy string matching using fuzzywuzzy (if available)
        if FUZZYWUZZY_AVAILABLE:
            fuzzy_ratio = fuzz.ratio(name1, name2) / 100.0
            fuzzy_partial = fuzz.partial_ratio(name1, name2) / 100.0
            fuzzy_token_sort = fuzz.token_sort_ratio(name1, name2) / 100.0
            fuzzy_token_set = fuzz.token_set_ratio(name1, name2) / 100.0
        else:
            # Fallback to basic similarity if fuzzywuzzy is not available
            fuzzy_ratio = sequence_matcher
            fuzzy_partial = sequence_matcher
            fuzzy_token_sort = sequence_matcher
            fuzzy_token_set = sequence_matcher

        # Sequence matcher from difflib
        sequence_matcher = SequenceMatcher(None, name1, name2).ratio()

        return {
            'exact_match': exact_match,
            'fuzzy_ratio': fuzzy_ratio,
            'fuzzy_partial': fuzzy_partial,
            'fuzzy_token_sort': fuzzy_token_sort,
            'fuzzy_token_set': fuzzy_token_set,
            'sequence_matcher': sequence_matcher
        }

    def _determine_verification_status(self, confidence: float, name_verification: Dict = None) -> str:
        """
        Determine overall verification status based on OCR confidence and name matching

        Args:
            confidence: OCR confidence score
            name_verification: Name verification results

        Returns:
            Verification status string
        """
        # If name verification was performed and failed, reject regardless of OCR confidence
        if name_verification and not name_verification['match']:
            return 'name_mismatch'

        # If name verification passed or wasn't performed, use OCR confidence
        if confidence >= 0.8:
            return 'verified'
        elif confidence >= 0.6:
            return 'needs_review'
        else:
            return 'failed'

# Global instance
ocr_service = TesseractOCRService()
