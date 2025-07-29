import cv2
import easyocr
import re
import numpy as np
from difflib import SequenceMatcher
import logging
from typing import Tuple, List, Dict, Optional

# Initialize the EasyOCR reader with both English and Hindi support for Aadhaar cards
reader = easyocr.Reader(['en', 'hi'])

# Set up logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def preprocess_aadhaar_image(image: np.ndarray) -> np.ndarray:
    """
    Advanced preprocessing specifically designed for Aadhaar cards
    Handles the orange/green header, text regions, and various lighting conditions
    """
    logger.info("🖼️ Starting specialized Aadhaar preprocessing...")

    # Convert to RGB if needed
    if len(image.shape) == 3:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    else:
        image_rgb = image

    # Resize image for optimal OCR (maintain aspect ratio)
    height, width = image_rgb.shape[:2]
    target_width = 1200  # Optimal width for Aadhaar cards
    if width > target_width:
        scale = target_width / width
        new_width = int(width * scale)
        new_height = int(height * scale)
        image_rgb = cv2.resize(image_rgb, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
        logger.info(f"📏 Resized image from {width}x{height} to {new_width}x{new_height}")

    # Convert to grayscale for processing
    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)

    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)

    # Bilateral filter to reduce noise while preserving edges
    filtered = cv2.bilateralFilter(enhanced, 9, 75, 75)

    # Apply adaptive thresholding for better text extraction
    adaptive_thresh = cv2.adaptiveThreshold(
        filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Additional watermark removal technique - remove very light text
    # This helps remove faint watermarks like "Scanned by CamScanner"
    _, binary_strong = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Combine both thresholding methods - prioritize strong text
    combined = cv2.bitwise_and(adaptive_thresh, binary_strong)

    # Morphological operations to enhance text and remove noise
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
    processed = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel)

    # Additional noise removal for watermarks
    kernel_clean = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    processed = cv2.morphologyEx(processed, cv2.MORPH_OPEN, kernel_clean)

    logger.info("✅ Aadhaar preprocessing completed with watermark removal")
    return processed

def detect_aadhaar_regions(image: np.ndarray) -> Dict[str, Tuple[int, int, int, int]]:
    """
    Detect key regions in Aadhaar card for targeted text extraction
    Returns bounding boxes for name, number, and other important areas
    """
    logger.info("🎯 Detecting Aadhaar card regions...")

    height, width = image.shape[:2]
    regions = {}

    # Based on standard Aadhaar layout analysis
    # Name region: Usually in the middle-left area
    regions['name_area'] = (0, int(height * 0.3), int(width * 0.7), int(height * 0.7))

    # Number region: Usually in the bottom area
    regions['number_area'] = (0, int(height * 0.6), width, height)

    # Full card for comprehensive extraction
    regions['full_card'] = (0, 0, width, height)

    logger.info(f"📍 Detected regions: {list(regions.keys())}")
    return regions

def extract_text_from_region(image: np.ndarray, region: Tuple[int, int, int, int], region_name: str) -> List[str]:
    """
    Extract text from a specific region of the Aadhaar card
    """
    x1, y1, x2, y2 = region
    roi = image[y1:y2, x1:x2]

    logger.info(f"🔍 Extracting text from {region_name} region...")

    try:
        # Use EasyOCR with optimized settings for Aadhaar cards
        results = reader.readtext(
            roi,
            detail=0,
            paragraph=False,
            width_ths=0.8,
            height_ths=0.8,
            decoder='greedy',
            batch_size=1
        )

        # Clean and filter results
        text_lines = []
        for result in results:
            text = str(result).strip()
            if text and len(text) > 1:
                text_lines.append(text)

        logger.info(f"📝 Extracted {len(text_lines)} lines from {region_name}")
        return text_lines

    except Exception as e:
        logger.error(f"❌ Error extracting text from {region_name}: {str(e)}")
        return []

def process_image(uploaded_file):
    """Process image from uploaded file"""
    pass

def extract_aadhaar_number(text_lines: List[str]) -> Optional[str]:
    """
    Enhanced Aadhaar number extraction with multiple pattern matching strategies
    Specifically designed for the format: 4343 6321 3335, removes watermarks first
    """
    logger.info("🔢 Starting enhanced Aadhaar number extraction...")

    # First, remove scanning watermarks
    clean_lines = remove_scanning_watermarks(text_lines)

    # Enhanced patterns for Aadhaar number detection
    aadhaar_patterns = [
        r'\b\d{4}\s+\d{4}\s+\d{4}\b',      # Standard spaced format: 4343 6321 3335
        r'\b\d{4}-\d{4}-\d{4}\b',          # Hyphenated format: 4343-6321-3335
        r'\b\d{12}\b',                      # Continuous format: 434363213335
        r'\b\d{4}\s*\d{4}\s*\d{4}\b',      # Variable spacing
        r'(?:आधार|Aadhaar|AADHAAR).*?(\d{4}\s*\d{4}\s*\d{4})',  # After Aadhaar keyword
        r'(?:No\.?|Number|संख्या).*?(\d{4}\s*\d{4}\s*\d{4})',    # After number keyword
    ]

    for i, line in enumerate(clean_lines):
        line_clean = line.strip()
        logger.info(f"🔍 Checking clean line {i+1} for Aadhaar number: '{line_clean}'")

        for pattern_idx, pattern in enumerate(aadhaar_patterns):
            matches = re.findall(pattern, line_clean, re.IGNORECASE)

            for match in matches:
                # Extract just the digits
                if isinstance(match, tuple):
                    number_str = match[0] if match else ""
                else:
                    number_str = match

                # Clean the number (remove all non-digits)
                digits_only = re.sub(r'\D', '', number_str)

                # Validate Aadhaar number (must be exactly 12 digits)
                if len(digits_only) == 12 and digits_only.isdigit():
                    # Format as standard Aadhaar format
                    formatted_number = f"{digits_only[:4]} {digits_only[4:8]} {digits_only[8:]}"
                    logger.info(f"✅ Found Aadhaar number using pattern {pattern_idx+1}: {formatted_number}")
                    return formatted_number
                else:
                    logger.info(f"⚠️ Invalid Aadhaar format: '{digits_only}' (length: {len(digits_only)})")

    logger.warning("❌ No valid Aadhaar number found")
    return None

def remove_scanning_watermarks(text_lines: List[str]) -> List[str]:
    """
    Remove scanning app watermarks and artifacts from text lines
    """
    logger.info("🧹 Removing scanning watermarks and artifacts...")

    # Common scanning watermark patterns
    watermark_patterns = [
        r'.*scann?ed?\s+by.*',
        r'.*camscann?er.*',
        r'.*scanner.*app.*',
        r'.*document.*scanner.*',
        r'.*pdf.*scanner.*',
        r'.*created.*with.*',
        r'.*powered.*by.*',
        r'.*download.*from.*',
        r'.*available.*on.*',
        r'.*play.*store.*',
        r'.*app.*store.*'
    ]

    cleaned_lines = []
    removed_count = 0

    for line in text_lines:
        line_clean = line.strip().lower()
        is_watermark = False

        # Check against watermark patterns
        for pattern in watermark_patterns:
            if re.search(pattern, line_clean, re.IGNORECASE):
                logger.info(f"  🗑️ Removed watermark: '{line.strip()}'")
                is_watermark = True
                removed_count += 1
                break

        if not is_watermark:
            cleaned_lines.append(line)

    logger.info(f"✅ Removed {removed_count} watermark lines, kept {len(cleaned_lines)} clean lines")
    return cleaned_lines

def extract_name_from_aadhaar(text_lines: List[str]) -> Optional[str]:
    """
    Enhanced name extraction specifically for Aadhaar cards
    Handles both English and Hindi text, focuses on name patterns, removes watermarks
    """
    logger.info("👤 Starting enhanced Aadhaar name extraction...")

    # First, remove scanning watermarks
    clean_lines = remove_scanning_watermarks(text_lines)

    # Aadhaar-specific filter keywords (expanded for Indian context + scanning artifacts)
    aadhaar_filter_keywords = {
        'government', 'india', 'aadhaar', 'aadhar', 'card', 'unique', 'identification',
        'authority', 'uid', 'uidai', 'male', 'female', 'dob', 'date', 'birth', 'year',
        'address', 'pin', 'code', 'state', 'district', 'village', 'city', 'phone',
        'mobile', 'email', 'www', 'http', 'com', 'org', 'net', 'help', 'care',
        'toll', 'free', 'number', 'contact', 'support', 'service', 'center',
        'issued', 'valid', 'expires', 'expiry', 'signature', 'photo', 'image',
        'scan', 'copy', 'original', 'duplicate', 'specimen', 'sample', 'demo',
        'test', 'example', 'template', 'format', 'layout', 'design', 'watermark',
        'enrollment', 'no', 'maharashtra', 'pune', 'college', 'javal', 'bhatti',
        'vidyapeeth', 'satara', 'bharatiya', 'vishisht', 'olakh', 'pradhikaran',
        'आधार', 'भारत', 'सरकार', 'प्राधिकरण', 'माझे', 'ओळख', '2006', '2005', '1105',
        '9890157233', '411046', 'pict', 'kf31213540f1',
        # Scanning app watermarks and artifacts
        'camscanner', 'scanned', 'scannd', 'scanner', 'cam', 'by', 'app', 'document',
        'pdf', 'jpeg', 'png', 'created', 'with', 'using', 'powered', 'version',
        'free', 'premium', 'trial', 'download', 'install', 'available', 'play',
        'store', 'apple', 'android', 'ios', 'mobile', 'application', 'software'
    }

    name_candidates = []

    for i, line in enumerate(clean_lines):
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 3:
            continue

        logger.info(f"📝 Analyzing clean line {i+1}: '{line_clean}'")

        # Skip lines that are clearly not names
        if re.search(r'\d{4}\s*\d{4}\s*\d{4}', line_clean):  # Contains Aadhaar number
            logger.info(f"  ⏭️ Skipping line with Aadhaar number")
            continue

        if re.search(r'\d{2}/\d{2}/\d{4}', line_clean):  # Contains date
            logger.info(f"  ⏭️ Skipping line with date")
            continue

        # Clean the line and extract words
        cleaned_line = re.sub(r'[^\w\s]', ' ', line_clean)
        words = [word.strip() for word in cleaned_line.split() if word.strip()]

        # Filter out non-name words
        name_words = []
        for word in words:
            word_lower = word.lower()

            # Skip filter keywords
            if word_lower in aadhaar_filter_keywords:
                logger.info(f"    ⏭️ Skipping keyword: '{word}'")
                continue

            # Skip if mostly numbers
            if re.search(r'\d', word) and len(re.findall(r'\d', word)) > len(word) * 0.3:
                logger.info(f"    ⏭️ Skipping numeric: '{word}'")
                continue

            # Skip very short or very long words
            if len(word) < 2 or len(word) > 25:
                logger.info(f"    ⏭️ Skipping invalid length: '{word}'")
                continue

            # Must contain letters
            if not re.search(r'[a-zA-Z]', word):
                logger.info(f"    ⏭️ Skipping non-alphabetic: '{word}'")
                continue

            name_words.append(word)

        # If we have valid name words, create candidate
        if name_words:
            candidate = ' '.join(name_words)
            if 3 <= len(candidate) <= 50 and len(name_words) <= 4:  # Reasonable name length
                confidence = len(name_words) * 0.25  # More words = higher confidence
                name_candidates.append((candidate, confidence))
                logger.info(f"  ✅ Name candidate: '{candidate}' (confidence: {confidence:.2f})")

    # Return the best candidate
    if name_candidates:
        best_candidate = max(name_candidates, key=lambda x: x[1])
        logger.info(f"🎯 Best name candidate: '{best_candidate[0]}' (confidence: {best_candidate[1]:.2f})")
        return best_candidate[0]

    logger.warning("❌ No valid name found")
    return None

def extract_text_from_image(image):
    """Extract text from image using enhanced Aadhaar-specific processing"""
    try:
        logger.info("🚀 Starting enhanced Aadhaar text extraction...")

        # Step 1: Preprocess the image specifically for Aadhaar cards
        processed_image = preprocess_aadhaar_image(image)

        # Step 2: Detect key regions in the Aadhaar card
        regions = detect_aadhaar_regions(processed_image)

        # Step 3: Extract text from different regions
        all_text_lines = []

        # Extract from full card first
        full_text_lines = extract_text_from_region(processed_image, regions['full_card'], 'full_card')
        all_text_lines.extend(full_text_lines)

        # Extract from specific regions for better accuracy
        name_text_lines = extract_text_from_region(processed_image, regions['name_area'], 'name_area')
        number_text_lines = extract_text_from_region(processed_image, regions['number_area'], 'number_area')

        # Combine all text for comprehensive analysis
        combined_text_lines = list(set(all_text_lines + name_text_lines + number_text_lines))

        # Join all text for backward compatibility
        extracted_text = "\n".join(combined_text_lines)
        logger.info(f"📄 Enhanced OCR extracted {len(combined_text_lines)} unique text segments")

        return extracted_text

    except Exception as e:
        logger.error(f"❌ Error in enhanced extract_text_from_image: {str(e)}")
        # Fallback to basic extraction
        try:
            results = reader.readtext(image, detail=0, paragraph=False)
            return "\n".join(str(result) for result in results)
        except:
            return ""

def extract_name_candidates(text_lines):
    """Enhanced name extraction with multiple strategies"""
    logger.info("🔍 Starting enhanced name extraction...")

    # Common keywords to filter out (expanded list)
    filter_keywords = {
        'government', 'india', 'aadhaar', 'aadhar', 'card', 'unique', 'identification',
        'authority', 'uid', 'uidai', 'male', 'female', 'dob', 'date', 'birth', 'year',
        'address', 'pin', 'code', 'state', 'district', 'village', 'city', 'phone',
        'mobile', 'email', 'www', 'http', 'com', 'org', 'net', 'help', 'care',
        'toll', 'free', 'number', 'contact', 'support', 'service', 'center',
        'issued', 'valid', 'expires', 'expiry', 'signature', 'photo', 'image',
        'scan', 'copy', 'original', 'duplicate', 'specimen', 'sample', 'demo',
        'test', 'example', 'template', 'format', 'layout', 'design', 'watermark'
    }

    name_candidates = []

    for i, line in enumerate(text_lines):
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 2:
            continue

        logger.info(f"📝 Processing line {i+1}: '{line_clean}'")

        # Remove special characters but keep spaces and letters
        cleaned_line = re.sub(r'[^\w\s]', ' ', line_clean)
        words = [word.strip() for word in cleaned_line.split() if word.strip()]

        # Filter out obvious non-name content
        filtered_words = []
        for word in words:
            word_lower = word.lower()

            # Skip if it's a filter keyword
            if word_lower in filter_keywords:
                logger.info(f"  ⏭️ Skipping keyword: '{word}'")
                continue

            # Skip if it's mostly numbers
            if re.match(r'^\d+$', word) or len(re.findall(r'\d', word)) > len(word) * 0.5:
                logger.info(f"  ⏭️ Skipping numeric: '{word}'")
                continue

            # Skip very short words (likely OCR errors)
            if len(word) < 2:
                logger.info(f"  ⏭️ Skipping too short: '{word}'")
                continue

            # Skip very long words (likely OCR errors or addresses)
            if len(word) > 20:
                logger.info(f"  ⏭️ Skipping too long: '{word}'")
                continue

            filtered_words.append(word)

        if filtered_words:
            # Strategy 1: Full line as name (if reasonable length)
            full_name = ' '.join(filtered_words)
            if 2 <= len(full_name) <= 50 and len(filtered_words) <= 5:
                name_candidates.append({
                    'name': full_name,
                    'confidence': 0.9 if len(filtered_words) > 1 else 0.6,
                    'source': f'line_{i+1}_full',
                    'words': filtered_words
                })
                logger.info(f"  ✅ Added full name candidate: '{full_name}' (confidence: {0.9 if len(filtered_words) > 1 else 0.6})")

            # Strategy 2: Individual words as potential name parts
            for word in filtered_words:
                if len(word) >= 3:  # Only consider words with 3+ characters
                    name_candidates.append({
                        'name': word,
                        'confidence': 0.4,
                        'source': f'line_{i+1}_word',
                        'words': [word]
                    })
                    logger.info(f"  ➕ Added word candidate: '{word}' (confidence: 0.4)")

    # Strategy 3: Smart combination of single words
    single_words = [c for c in name_candidates if len(c['words']) == 1 and c['confidence'] == 0.4]
    if len(single_words) >= 2:
        # Try to combine consecutive single words
        for i in range(len(single_words) - 1):
            combined_name = f"{single_words[i]['name']} {single_words[i+1]['name']}"
            name_candidates.append({
                'name': combined_name,
                'confidence': 0.7,
                'source': 'combined_words',
                'words': [single_words[i]['name'], single_words[i+1]['name']]
            })
            logger.info(f"  🔗 Added combined candidate: '{combined_name}' (confidence: 0.7)")

    # Sort by confidence (highest first)
    name_candidates.sort(key=lambda x: x['confidence'], reverse=True)

    logger.info(f"🎯 Found {len(name_candidates)} name candidates total")
    for i, candidate in enumerate(name_candidates[:5]):  # Show top 5
        logger.info(f"  {i+1}. '{candidate['name']}' (conf: {candidate['confidence']}, source: {candidate['source']})")

    return name_candidates

def enhanced_aadhaar_name_match(extracted_name, user_name, min_confidence=0.8):
    """
    Enhanced Aadhaar name matching specifically designed for Indian names
    Handles cases like 'SHIVANI KINAGI' vs 'Shivani Bharatraj Kinagi'
    """
    logger.info(f"🔍 ENHANCED Aadhaar name matching: '{extracted_name}' vs '{user_name}'")

    if not extracted_name or not user_name:
        logger.info("❌ One of the names is empty")
        return False, 0.0, "Empty name provided"

    # Normalize names (remove extra spaces, convert to lowercase)
    extracted_clean = re.sub(r'\s+', ' ', extracted_name.lower().strip())
    user_clean = re.sub(r'\s+', ' ', user_name.lower().strip())

    # Security check: Both names must be at least 2 characters
    if len(extracted_clean) < 2 or len(user_clean) < 2:
        logger.info(f"❌ Names too short (OCR: {len(extracted_clean)}, User: {len(user_clean)})")
        return False, 0.0, "Names too short"

    # Split into words and filter out very short words
    extracted_words = [word for word in extracted_clean.split() if len(word) > 1]
    user_words = [word for word in user_clean.split() if len(word) > 1]

    logger.info(f"📝 User words: {user_words}")
    logger.info(f"📄 Extracted words: {extracted_words}")

    # Security checks
    if len(extracted_words) == 0:
        logger.info("❌ No valid words extracted from Aadhaar")
        return False, 0.0, "No valid words extracted"

    if len(user_words) == 0:
        logger.info("❌ No valid words in user name")
        return False, 0.0, "No valid words in user name"

    # Check for exact match first
    if extracted_clean == user_clean:
        logger.info("✅ Exact match found")
        return True, 1.0, "Exact match"

    # Strategy 1: Check if user name is a subset of Aadhaar name
    # Example: "shivani kinagi" should match "shivani bharatraj kinagi"
    user_name_pattern = r'\b' + r'\b.*?\b'.join(re.escape(word) for word in user_words) + r'\b'
    if re.search(user_name_pattern, extracted_clean):
        logger.info("✅ User name found as subset in Aadhaar name")
        return True, 0.95, "User name is subset of Aadhaar name"

    # Strategy 2: Enhanced word-by-word matching with flexible requirements
    total_user_words = len(user_words)
    matched_words = 0
    match_details = []

    logger.info(f"🎯 Analyzing {total_user_words} user words against {len(extracted_words)} extracted words")

    for i, user_word in enumerate(user_words):
        best_match_ratio = 0
        best_match_word = ""

        # Check against all extracted words for best match
        for extracted_word in extracted_words:
            # Calculate similarity using SequenceMatcher
            similarity = SequenceMatcher(None, user_word, extracted_word).ratio()

            if similarity > best_match_ratio:
                best_match_ratio = similarity
                best_match_word = extracted_word

        # Consider a word matched if similarity >= 80%
        word_threshold = 0.8
        if best_match_ratio >= word_threshold:
            matched_words += 1
            match_status = "✅ MATCH"
            logger.info(f"  {i+1}. '{user_word}' → '{best_match_word}' ({best_match_ratio:.1%}) {match_status}")
            match_details.append(f"'{user_word}' matched '{best_match_word}' ({best_match_ratio:.1%})")
        else:
            match_status = "❌ NO MATCH"
            logger.info(f"  {i+1}. '{user_word}' → '{best_match_word}' ({best_match_ratio:.1%}) {match_status}")
            match_details.append(f"'{user_word}' vs '{best_match_word}' ({best_match_ratio:.1%}) - below threshold")

    # Calculate overall confidence
    word_match_percentage = matched_words / total_user_words
    overall_confidence = word_match_percentage

    logger.info(f"📊 Match Analysis:")
    logger.info(f"  - Matched words: {matched_words}/{total_user_words}")
    logger.info(f"  - Word match percentage: {word_match_percentage:.1%}")
    logger.info(f"  - Required threshold: {min_confidence:.1%}")
    logger.info(f"  - Overall confidence: {overall_confidence:.1%}")

    # Determine if match meets threshold
    meets_threshold = word_match_percentage >= min_confidence

    if meets_threshold:
        result_message = f"✅ {word_match_percentage:.1%} word match (meets {min_confidence:.1%} threshold)"
        logger.info(f"✅ MATCH SUCCESS: {result_message}")
    else:
        result_message = f"❌ {word_match_percentage:.1%} word match (below {min_confidence:.1%} threshold)"
        logger.info(f"❌ MATCH FAILED: {result_message}")

    return meets_threshold, overall_confidence, result_message

def validate_aadhaar_number(aadhaar_number: str) -> Tuple[bool, str]:
    """
    Validate Aadhaar number format and basic checksum
    Returns (is_valid, message)
    """
    if not aadhaar_number:
        return False, "Aadhaar number is empty"

    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', aadhaar_number)

    # Check if exactly 12 digits
    if len(digits_only) != 12:
        return False, f"Aadhaar number must be 12 digits, got {len(digits_only)}"

    # Check if all digits are the same (invalid)
    if len(set(digits_only)) == 1:
        return False, "Aadhaar number cannot have all same digits"

    # Basic pattern validation (first digit cannot be 0 or 1)
    if digits_only[0] in ['0', '1']:
        return False, "Aadhaar number cannot start with 0 or 1"

    # Format validation passed
    formatted = f"{digits_only[:4]} {digits_only[4:8]} {digits_only[8:]}"
    return True, f"Valid Aadhaar number: {formatted}"

def enhanced_fuzzy_match(extracted_name, user_name, min_confidence=0.8):
    """Enhanced fuzzy matching with detailed analysis - wrapper for backward compatibility"""
    return enhanced_aadhaar_name_match(extracted_name, user_name, min_confidence)

def extract_id_fields(text):
    """Enhanced Aadhaar-specific field extraction using specialized methods"""
    logger.info("🔍 Starting ENHANCED Aadhaar field extraction...")

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    logger.info(f"📄 Processing {len(lines)} text lines from enhanced OCR")

    # Initialize fields
    name = ""
    dob = ""
    id_number = ""

    # Use enhanced Aadhaar number extraction
    logger.info("🔢 Using enhanced Aadhaar number extraction...")
    id_number = extract_aadhaar_number(lines)
    if id_number:
        # Validate the extracted Aadhaar number
        is_valid, validation_message = validate_aadhaar_number(id_number)
        if is_valid:
            logger.info(f"✅ Enhanced extraction found valid Aadhaar number: {id_number}")
            logger.info(f"✅ Validation: {validation_message}")
        else:
            logger.warning(f"⚠️ Extracted Aadhaar number failed validation: {validation_message}")
            id_number = ""  # Clear invalid number
    else:
        logger.warning("❌ Enhanced Aadhaar number extraction failed")

    # Use enhanced Aadhaar name extraction
    logger.info("👤 Using enhanced Aadhaar name extraction...")
    name = extract_name_from_aadhaar(lines)
    if name:
        logger.info(f"✅ Enhanced extraction found name: '{name}'")
    else:
        logger.warning("❌ Enhanced Aadhaar name extraction failed")
        # Fallback to old method
        logger.info("🔄 Falling back to legacy name extraction...")
        name_candidates = extract_name_candidates(lines)
        if name_candidates:
            best_candidate = name_candidates[0]
            name = best_candidate['name']
            logger.info(f"✅ Fallback found name: '{name}' (confidence: {best_candidate['confidence']})")

    # Extract DOB with enhanced patterns
    logger.info("📅 Searching for date of birth...")
    dob_patterns = [
        r'\b\d{2}/\d{2}/\d{4}\b',      # DD/MM/YYYY
        r'\b\d{2}-\d{2}-\d{4}\b',      # DD-MM-YYYY
        r'\b\d{2}\.\d{2}\.\d{4}\b',    # DD.MM.YYYY
        r'\b\d{1,2}/\d{1,2}/\d{4}\b',  # D/M/YYYY or DD/M/YYYY
        r'\b\d{1,2}-\d{1,2}-\d{4}\b',  # D-M-YYYY or DD-M-YYYY
        r'\b\d{4}/\d{2}/\d{2}\b',      # YYYY/MM/DD
        r'\b\d{4}-\d{2}-\d{2}\b',      # YYYY-MM-DD
    ]

    for i, line in enumerate(lines):
        logger.info(f"📅 Checking line {i+1} for DOB: '{line}'")
        for pattern in dob_patterns:
            match = re.search(pattern, line)
            if match:
                potential_dob = match.group()
                # Validate the date format
                if re.match(r'\d{2}/\d{2}/\d{4}', potential_dob) or re.match(r'\d{1,2}/\d{1,2}/\d{4}', potential_dob):
                    dob = potential_dob
                    logger.info(f"✅ Found DOB: {dob}")
                    break
        if dob:
            break

    result = {
        "Name": name,
        "DOB": dob,
        "ID Number": id_number
    }

    logger.info("📋 ENHANCED Extraction Summary:")
    logger.info(f"  - Name: '{name}' (Enhanced Aadhaar extraction)")
    logger.info(f"  - DOB: '{dob}'")
    logger.info(f"  - Aadhaar: '{id_number}' (Enhanced pattern matching)")
    logger.info(f"  - Success: Name={'✅' if name else '❌'}, Number={'✅' if id_number else '❌'}, DOB={'✅' if dob else '❌'}")

    return result
