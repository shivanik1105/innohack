# OCR Certificate Verification Setup Guide

## Overview
This system implements OCR-based certificate verification with name matching to ensure that uploaded certificates belong to the user uploading them.

## Features
- **OCR Text Extraction**: Uses Tesseract OCR to extract text from certificate images
- **Name Verification**: Compares extracted names with user profile names using fuzzy string matching
- **Multiple Similarity Algorithms**: Uses various string similarity methods for robust matching
- **Confidence Scoring**: Provides confidence scores for both OCR extraction and name matching
- **Real-time Verification**: Immediate feedback on certificate authenticity

## Installation

### 1. Install Python Dependencies

For the backend OCR service, install the required packages:

```bash
# Navigate to the OCR service directory
cd project/AIML/ocr-id-verification

# Install dependencies
pip install -r requirements.txt
```

Or install individually:
```bash
pip install pytesseract opencv-python Pillow numpy fuzzywuzzy python-Levenshtein
```

### 2. Install Tesseract OCR

#### Windows:
1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install and note the installation path (usually `C:\Program Files\Tesseract-OCR\tesseract.exe`)
3. Update the path in `ocr_service.py` if needed

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install tesseract-ocr
```

#### macOS:
```bash
brew install tesseract
```

### 3. Backend Setup

The OCR service is already integrated into the Django backend at:
- `project/backend/services/ocr_service.py`
- `project/backend/worker/views.py` (upload_certificate endpoint)

## How It Works

### 1. Certificate Upload Process
1. User uploads certificate image through frontend
2. Backend saves image temporarily
3. OCR service processes the image:
   - Preprocesses image (grayscale, noise reduction, scaling)
   - Extracts text using Tesseract
   - Parses certificate data (name, ID, dates, etc.)
4. Name verification compares extracted name with user's profile name
5. Returns verification result with confidence scores

### 2. Name Matching Algorithm
The system uses multiple similarity algorithms:
- **Exact Match**: Direct string comparison
- **Fuzzy Ratio**: Overall string similarity
- **Fuzzy Partial**: Substring matching
- **Fuzzy Token Sort**: Word order independent matching
- **Fuzzy Token Set**: Set-based matching
- **Sequence Matcher**: Python's difflib algorithm

### 3. Verification Statuses
- `verified`: High confidence, name matches (>80% similarity)
- `name_mismatch`: Name doesn't match user profile
- `needs_review`: Low confidence, requires manual review
- `failed`: OCR extraction failed

## Testing

### 1. Access the Test Page
Navigate to `/ocr-test` in your application to access the OCR testing interface.

### 2. Test Scenarios
Try these test cases:

#### Positive Cases (Should Pass):
- Upload certificate with exact name match
- Upload certificate with slight variations (e.g., "John Doe" vs "JOHN DOE")
- Upload certificate with nicknames (if configured)

#### Negative Cases (Should Fail):
- Upload certificate with completely different name
- Upload certificate with poor image quality
- Upload non-certificate images

### 3. API Testing
You can also test the API directly:

```bash
curl -X POST \
  http://localhost:8000/api/users/USER_ID/upload-certificate/ \
  -F "certificate_image=@certificate.jpg" \
  -F "title=Test Certificate" \
  -F "type=government"
```

## Configuration

### Similarity Threshold
The default similarity threshold is 80%. You can adjust this in `ocr_service.py`:

```python
match_threshold = 0.8  # 80% similarity required
```

### OCR Configuration
Tesseract settings can be modified in `ocr_service.py`:

```python
self.tesseract_config = '--oem 3 --psm 6'  # OCR Engine Mode 3, Page Segmentation Mode 6
```

## Troubleshooting

### Common Issues

1. **Tesseract not found**
   - Ensure Tesseract is installed and in PATH
   - Update `pytesseract.pytesseract.tesseract_cmd` if needed

2. **Poor OCR accuracy**
   - Ensure images are high quality
   - Check image preprocessing settings
   - Try different PSM (Page Segmentation Mode) values

3. **Name matching too strict/loose**
   - Adjust similarity threshold
   - Modify name normalization rules
   - Add custom name variations

### Debug Mode
Enable debug logging in `ocr_service.py`:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## API Response Format

```json
{
  "status": "success",
  "message": "Certificate uploaded and verified successfully",
  "certificate": {
    "id": "123",
    "title": "ITI Certificate",
    "isVerified": true
  },
  "verification_details": {
    "ocr_confidence": 0.95,
    "verification_status": "verified",
    "is_verified": true,
    "name_verification": {
      "match": true,
      "confidence": 0.92,
      "extracted_name": "John Doe",
      "user_name": "John Doe",
      "reason": "Names match",
      "similarity_scores": {
        "exact_match": 1.0,
        "fuzzy_ratio": 1.0,
        "fuzzy_partial": 1.0,
        "fuzzy_token_sort": 1.0,
        "fuzzy_token_set": 1.0,
        "sequence_matcher": 1.0
      }
    }
  }
}
```

## Security Considerations

1. **File Validation**: Only accept image files
2. **Size Limits**: Implement file size restrictions
3. **Rate Limiting**: Prevent abuse of OCR service
4. **Temporary Files**: Clean up uploaded files after processing
5. **Data Privacy**: Don't log sensitive extracted data

## Performance Optimization

1. **Image Preprocessing**: Optimize image size before OCR
2. **Caching**: Cache OCR results for identical images
3. **Async Processing**: Use background tasks for large files
4. **GPU Acceleration**: Consider GPU-based OCR for high volume

## Future Enhancements

1. **Multi-language Support**: Add support for regional languages
2. **Document Type Detection**: Automatically detect certificate types
3. **Blockchain Verification**: Integrate with certificate issuer APIs
4. **Machine Learning**: Train custom models for better accuracy
5. **Batch Processing**: Support multiple certificate uploads
