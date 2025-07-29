# class OcrProcessor:
#     def process_image(self, image_path):
#         import cv2
#         from utils.helpers import load_image, preprocess_image
        
#         image = load_image(image_path)
#         processed_image = preprocess_image(image)
#         return processed_image

#     def extract_text(self, image):
#         import pytesseract
        
#         text = pytesseract.image_to_string(image)
#         return text.strip()
# from utils.helpers import preprocess_image_from_streamlit

# def process_image(uploaded_file):
#     return preprocess_image_from_streamlit(uploaded_file)

from utils.helpers import preprocess_image_from_streamlit
import easyocr
import re
from difflib import SequenceMatcher
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

# Initialize EasyOCR with robust error handling for Windows file locking issues
reader = None

def initialize_ocr_reader():
    """Initialize EasyOCR reader with error handling for file locking issues"""
    global reader
    if reader is not None:
        return reader

    try:
        import time
        import os
        import tempfile
        import shutil
        import gc

        print("🔄 Initializing EasyOCR with Windows file lock handling...")

        # Force garbage collection to release any file handles
        gc.collect()

        # Try to clear any existing temp files with multiple strategies
        try:
            easyocr_dir = os.path.expanduser("~/.EasyOCR")
            model_dir = os.path.join(easyocr_dir, "model")

            if os.path.exists(model_dir):
                temp_files = ["temp.zip", "temp.pth", "temp.txt"]
                for temp_file in temp_files:
                    temp_path = os.path.join(model_dir, temp_file)
                    if os.path.exists(temp_path):
                        for attempt in range(3):
                            try:
                                os.remove(temp_path)
                                print(f"🗑️ Cleared {temp_file}")
                                break
                            except PermissionError:
                                if attempt < 2:
                                    time.sleep(1)
                                    continue
                                else:
                                    print(f"⚠️ Could not remove {temp_file} (in use)")
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup warning: {cleanup_error}")

        # Try multiple initialization strategies
        initialization_strategies = [
            # Strategy 1: English only, no GPU, minimal verbose
            lambda: easyocr.Reader(['en'], gpu=False, verbose=False),
            # Strategy 2: English only with explicit download
            lambda: easyocr.Reader(['en'], gpu=False, verbose=False, download_enabled=True),
            # Strategy 3: With custom model directory
            lambda: easyocr.Reader(['en'], gpu=False, verbose=False,
                                 model_storage_directory=os.path.join(tempfile.gettempdir(), "easyocr_models")),
        ]

        for strategy_num, strategy in enumerate(initialization_strategies, 1):
            for attempt in range(2):
                try:
                    print(f"🔄 Strategy {strategy_num}, attempt {attempt + 1}...")
                    reader = strategy()
                    print("✅ EasyOCR initialized successfully!")
                    return reader
                except Exception as e:
                    print(f"⚠️ Strategy {strategy_num} attempt {attempt + 1} failed: {str(e)[:100]}...")
                    if "temp.zip" in str(e) and attempt == 0:
                        time.sleep(3)  # Wait longer for file lock to release
                        gc.collect()
                        continue
                    break

        # Final fallback: Try with Tesseract if available
        print("🔄 Trying Tesseract fallback...")
        try:
            import pytesseract
            print("✅ Tesseract available as fallback OCR")
            return "tesseract"  # Special marker for Tesseract fallback
        except ImportError:
            print("❌ Tesseract not available")

        print("❌ All OCR initialization strategies failed")
        return None

    except Exception as e:
        print(f"❌ Critical error initializing OCR: {e}")
        return None

def process_image(uploaded_file):
    return preprocess_image_from_streamlit(uploaded_file)

def extract_text_with_tesseract(image):
    """Fallback OCR using Tesseract when EasyOCR fails"""
    try:
        import pytesseract
        from PIL import Image as PILImage

        # Convert to PIL Image if needed
        if isinstance(image, np.ndarray):
            if len(image.shape) == 3:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil_image = PILImage.fromarray(image)
        else:
            pil_image = image

        # Use Tesseract with custom config for better Aadhaar recognition
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '

        # Extract text
        text = pytesseract.image_to_string(pil_image, config=custom_config)

        # Clean and format the text
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        print(f"🔍 Tesseract extracted {len(lines)} text lines:")
        for i, line in enumerate(lines[:10]):  # Show first 10 for debugging
            print(f"  Line {i+1}: '{line}'")

        return '\n'.join(lines)

    except Exception as e:
        print(f"❌ Tesseract fallback failed: {e}")
        # Return minimal text for basic processing
        return "OCR_EXTRACTION_FAILED"

def advanced_aadhaar_preprocessing(image):
    """Advanced preprocessing specifically for Aadhaar cards"""
    try:
        # Convert PIL to OpenCV format if needed
        if isinstance(image, Image.Image):
            image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()

        # 1. Noise reduction
        denoised = cv2.fastNlMeansDenoising(gray)

        # 2. Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)

        # 3. Morphological operations to clean up text
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
        cleaned = cv2.morphologyEx(enhanced, cv2.MORPH_CLOSE, kernel)

        # 4. Adaptive thresholding for better text extraction
        binary = cv2.adaptiveThreshold(cleaned, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY, 11, 2)

        # 5. Final sharpening
        kernel_sharp = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(binary, -1, kernel_sharp)

        return sharpened

    except Exception as e:
        print(f"⚠️ Advanced preprocessing failed: {e}, using basic preprocessing")
        return image

def extract_text_from_image(image):
    """Enhanced text extraction with advanced preprocessing for Aadhaar cards"""
    try:
        # Initialize OCR reader if not already done
        ocr_reader = initialize_ocr_reader()
        if ocr_reader is None:
            raise Exception("Failed to initialize any OCR reader")

        # Apply advanced preprocessing specifically for Aadhaar cards
        processed_image = advanced_aadhaar_preprocessing(image)

        # Check if we're using Tesseract fallback
        if ocr_reader == "tesseract":
            return extract_text_with_tesseract(processed_image)

        # Use EasyOCR with optimized parameters for Aadhaar cards
        results = ocr_reader.readtext(
            processed_image,
            detail=1,
            paragraph=False,
            width_ths=0.7,
            height_ths=0.7,
            text_threshold=0.6,  # Lower threshold for better detection
            low_text=0.3,
            link_threshold=0.3,
            canvas_size=2560,
            mag_ratio=1.5,  # Increase magnification for better text detection
            add_margin=0.1
        )

        # Sort by y-coordinate to maintain reading order
        results.sort(key=lambda x: x[0][0][1])

        # Extract text with confidence filtering - be more lenient for Aadhaar
        filtered_text = []
        debug_info = []

        for (bbox, text, confidence) in results:
            text_clean = text.strip()
            if confidence > 0.3 and len(text_clean) > 0:  # Lower threshold for Aadhaar
                filtered_text.append(text_clean)
                debug_info.append(f"'{text_clean}' (conf: {confidence:.2f})")

        print(f"🔍 OCR extracted {len(filtered_text)} text segments:")
        for info in debug_info[:10]:  # Show first 10 for debugging
            print(f"  {info}")

        full_text = "\n".join(filtered_text)
        return full_text

    except Exception as e:
        print(f"❌ Enhanced OCR failed: {e}, falling back to basic OCR")
        # Fallback to basic OCR
        ocr_reader = initialize_ocr_reader()
        if ocr_reader is None:
            raise Exception("OCR reader initialization failed completely")

        if ocr_reader == "tesseract":
            return extract_text_with_tesseract(image)

        results = ocr_reader.readtext(image, detail=1)
        results.sort(key=lambda x: x[0][0][1])

        filtered_text = []
        for (bbox, text, confidence) in results:
            if confidence > 0.5:
                filtered_text.append(text.strip())

        return "\n".join(filtered_text)

def clean_name(name_text):
    """Clean and normalize extracted name"""
    if not name_text:
        return ""

    # Remove common OCR artifacts and noise
    cleaned = re.sub(r'[^\w\s]', ' ', name_text)  # Remove special chars
    cleaned = re.sub(r'\s+', ' ', cleaned)  # Normalize spaces
    cleaned = cleaned.strip().title()  # Proper case

    return cleaned

def extract_name_candidates(lines):
    """Extract potential name candidates from text lines"""
    candidates = []

    # Common Aadhaar keywords to skip - be more specific to avoid filtering real names
    skip_keywords = {
        'government', 'india', 'aadhaar', 'unique', 'identification', 'authority',
        'dob', 'male', 'female', 'address', 'pin', 'code', 'www', 'uidai', 'gov',
        'help', 'resident', 'card', 'number', 'date', 'birth', 'gender', 'issue',
        'ort', 'ttt', 'mtazrut', 'fnuuliout', 'bnnrntrol', 'kian', 'jnz', 'ita',
        'ihot', 'localhost', 'says', 'react', 'fpp', 'scanned', 'scanner', 'camscanner',
        'scanncd', 'camscanncr', 'document', 'scan', 'photo', 'image'
    }

    # Don't skip these common words that might be part of names
    name_friendly_words = {'by', 'app', 'to', 'of', 'and', 'the'}

    print(f"🔍 Analyzing {len(lines)} lines for name candidates:")
    for i, line in enumerate(lines):
        print(f"  Line {i}: '{line.strip()}'")

    for i, line in enumerate(lines):
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 2:  # Reduced minimum length
            continue

        # Skip lines with numbers (likely not names) - but be more lenient
        if re.search(r'\d{2,}', line_clean):  # Only skip if 2+ consecutive digits
            continue

        # Skip lines with common keywords - but be more selective
        line_lower = line_clean.lower()
        should_skip = False
        for keyword in skip_keywords:
            if keyword in line_lower:
                # Don't skip if it's just a partial match and the line has other content
                if len(line_clean) > len(keyword) * 2:  # Line is much longer than keyword
                    continue
                should_skip = True
                break

        if should_skip:
            print(f"  ❌ Skipping line {i}: '{line_clean}' (contains skip keyword)")
            continue

        # Skip lines that are mostly special characters
        if len(re.sub(r'[A-Za-z\s]', '', line_clean)) > len(line_clean) * 0.5:
            continue

        # Look for name patterns - be more inclusive
        # Pattern 1: All caps words (common in Aadhaar)
        if re.match(r'^[A-Z\s]{2,}$', line_clean):
            candidates.append({
                'text': clean_name(line_clean),
                'confidence': 0.8,
                'position': i,
                'type': 'caps',
                'original': line_clean
            })
            print(f"  ✅ Caps candidate: '{line_clean}' -> '{clean_name(line_clean)}'")

        # Pattern 2: Title case names
        elif re.match(r'^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$', line_clean):
            candidates.append({
                'text': clean_name(line_clean),
                'confidence': 0.7,
                'position': i,
                'type': 'title',
                'original': line_clean
            })
            print(f"  ✅ Title candidate: '{line_clean}' -> '{clean_name(line_clean)}'")

        # Pattern 3: Mixed case but looks like a name
        elif re.match(r'^[A-Za-z\s]{2,}$', line_clean):
            # Check if it has reasonable word structure
            words = line_clean.split()
            if len(words) >= 1 and all(len(word) >= 2 for word in words):
                candidates.append({
                    'text': clean_name(line_clean),
                    'confidence': 0.6,
                    'position': i,
                    'type': 'mixed',
                    'original': line_clean
                })
                print(f"  ✅ Mixed candidate: '{line_clean}' -> '{clean_name(line_clean)}'")

        # Pattern 4: Single meaningful words that could be part of a name
        elif re.match(r'^[A-Za-z]{2,}$', line_clean) and line_clean.lower() not in skip_keywords:  # Reduced from 3 to 2 chars
            confidence = 0.4
            # Boost confidence for longer words
            if len(line_clean) >= 4:
                confidence = 0.5
            if len(line_clean) >= 6:
                confidence = 0.6

            candidates.append({
                'text': clean_name(line_clean),
                'confidence': confidence,
                'position': i,
                'type': 'single',
                'original': line_clean
            })
            print(f"  🔶 Single word candidate: '{line_clean}' -> '{clean_name(line_clean)}' (conf: {confidence})")

        # Pattern 5: Very short potential name fragments (like "Ri")
        elif re.match(r'^[A-Z][a-z]$', line_clean) and line_clean.lower() not in skip_keywords:
            candidates.append({
                'text': clean_name(line_clean),
                'confidence': 0.2,  # Low confidence for very short
                'position': i,
                'type': 'fragment',
                'original': line_clean
            })
            print(f"  🔸 Name fragment candidate: '{line_clean}' -> '{clean_name(line_clean)}'")

    # Try to combine adjacent single words into full names
    combined_candidates = []
    for i in range(len(candidates) - 1):
        curr = candidates[i]
        next_cand = candidates[i + 1]

        # If we have adjacent single words, try combining them
        if (curr['type'] in ['single', 'fragment'] and
            next_cand['type'] in ['single', 'fragment'] and
            abs(curr['position'] - next_cand['position']) <= 2):  # Within 2 lines of each other

            combined_text = f"{curr['text']} {next_cand['text']}"
            combined_confidence = (curr['confidence'] + next_cand['confidence']) / 2 + 0.2  # Bonus for combination

            combined_candidates.append({
                'text': combined_text,
                'confidence': min(0.9, combined_confidence),
                'position': min(curr['position'], next_cand['position']),
                'type': 'combined',
                'original': f"{curr['original']} + {next_cand['original']}"
            })
            print(f"  🔗 Combined candidate: '{combined_text}' (conf: {combined_confidence:.2f})")

    # Add combined candidates to the list
    candidates.extend(combined_candidates)

    # Sort by confidence and position (names usually appear early)
    candidates.sort(key=lambda x: (-x['confidence'], x['position']))

    print(f"📋 Found {len(candidates)} name candidates")
    for i, candidate in enumerate(candidates[:5]):  # Show top 5
        print(f"  {i+1}. '{candidate['text']}' (confidence: {candidate['confidence']}, type: {candidate['type']})")

    return candidates

def extract_id_fields(text):
    """Enhanced field extraction with better name detection"""
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    name = ""
    dob = ""
    id_number = ""

    # Extract Aadhaar number
    for line in lines:
        # Pattern for Aadhaar: XXXX XXXX XXXX or XXXX-XXXX-XXXX
        aadhaar_patterns = [
            r'\d{4}\s+\d{4}\s+\d{4}',
            r'\d{4}-\d{4}-\d{4}',
            r'\d{12}'
        ]

        for pattern in aadhaar_patterns:
            match = re.search(pattern, line)
            if match:
                # Format as XXXX XXXX XXXX
                number = re.sub(r'[^\d]', '', match.group())
                if len(number) == 12:
                    id_number = f"{number[:4]} {number[4:8]} {number[8:]}"
                    break

        if id_number:
            break

    # Extract DOB
    for line in lines:
        # Multiple DOB patterns
        dob_patterns = [
            r'\d{2}/\d{2}/\d{4}',
            r'\d{2}-\d{2}-\d{4}',
            r'\d{2}\.\d{2}\.\d{4}'
        ]

        for pattern in dob_patterns:
            if "DOB" in line.upper() or "D.O.B" in line.upper() or "BIRTH" in line.upper():
                match = re.search(pattern, line)
                if match:
                    dob = match.group()
                    break
            elif re.search(pattern, line):
                # Standalone date that looks like DOB
                match = re.search(pattern, line)
                if match:
                    dob = match.group()
                    break

        if dob:
            break

    # Extract name using enhanced logic
    print(f"🔍 Starting enhanced name extraction from {len(lines)} lines...")
    name_candidates = extract_name_candidates(lines)

    # Debug: Print all candidates
    print(f"📋 Found {len(name_candidates)} name candidates:")
    for i, candidate in enumerate(name_candidates[:5]):
        print(f"  {i+1}. '{candidate['text']}' (confidence: {candidate['confidence']:.2f}, type: {candidate['type']})")

    if name_candidates:
        # Take the best candidate
        best_candidate = name_candidates[0]
        name = best_candidate['text']

        # If we have multiple good candidates, try to combine or pick the best
        if len(name_candidates) > 1:
            # Strategy 1: Look for multi-word names first
            for candidate in name_candidates[:5]:  # Check top 5
                candidate_text = candidate['text']
                if len(candidate_text.split()) >= 2 and candidate['confidence'] >= 0.6:
                    name = candidate_text
                    print(f"🎯 Selected multi-word name: '{name}'")
                    break

            # Strategy 2: If no multi-word name, try to combine single words
            if len(name.split()) == 1:
                single_words = []
                for candidate in name_candidates[:5]:
                    if candidate['type'] in ['caps', 'title', 'single'] and len(candidate['text'].split()) == 1:
                        word = candidate['text']
                        if word not in single_words and len(word) >= 3:
                            single_words.append(word)

                if len(single_words) >= 2:
                    combined_name = ' '.join(single_words[:3])  # Take up to 3 words
                    print(f"🔗 Combined name from parts: '{combined_name}'")
                    name = combined_name

            # Strategy 3: If still single word, keep the best one
            if len(name.split()) == 1:
                print(f"🎯 Using single best candidate: '{name}'")

    return {
        "Name": name,
        "DOB": dob,
        "ID Number": id_number,
        "debug_candidates": [c['text'] for c in name_candidates[:3]]  # For debugging
    }

