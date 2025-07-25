import cv2
import easyocr
import re
import numpy as np

# Initialize the EasyOCR reader once. 
# This is efficient as it doesn't reload the model on every call.
reader = easyocr.Reader(['en'])

class OcrService:
    """
    A service class to handle all OCR-related tasks.
    It takes an image file path, processes it, extracts text,
    and parses it into structured fields.
    """

    def _load_and_preprocess_image(self, image_path: str):
        """
        Loads an image from a file path and preprocesses it for OCR.
        This replaces the need for a Streamlit-specific helper.
        """
        # Read the image using OpenCV
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Could not read image from path: {image_path}")
        
        # Convert to grayscale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Optional: Apply thresholding to get a binary image
        _, thresh_image = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh_image

    def _extract_text_from_image(self, image: np.ndarray) -> str:
        """
        Extracts text from a preprocessed image using EasyOCR.
        """
        # detail=0 returns text only, which is faster
        results = reader.readtext(image, detail=0, paragraph=False)
        full_text = "\n".join(results)
        return full_text

    def _parse_text_to_fields(self, text: str) -> dict:
        """
        Parses the raw extracted text to find specific ID fields using regex.
        """
        lines = text.split("\n")
        name = ""
        dob = ""
        id_number = ""

        for line in lines:
            line = line.strip()
            # Try to find DOB (Date of Birth)
            dob_match = re.search(r'\d{2}/\d{2}/\d{4}', line)
            if dob_match:
                dob = dob_match.group(0)
                continue # Move to next line once found

            # Try to find ID Number (e.g., 12-digit Aadhaar number)
            id_match = re.search(r'\d{4}\s\d{4}\s\d{4}', line)
            if id_match:
                id_number = id_match.group(0)
                continue

            # A simple assumption for a name (avoids lines with numbers or short labels)
            if re.match(r'^[A-Z\s]{5,}$', line) and not any(char.isdigit() for char in line):
                 if not name: # Only grab the first likely candidate for name
                    name = line

        return {
            "name": name,
            "date_of_birth": dob,
            "id_number": id_number
        }

    def process_id_from_path(self, image_path: str) -> dict:
        """
        Public method to run the full OCR pipeline on an image file.
        """
        preprocessed_image = self._load_and_preprocess_image(image_path)
        raw_text = self._extract_text_from_image(preprocessed_image)
        parsed_data = self._parse_text_to_fields(raw_text)
        
        # Also include the raw text for logging or debugging if needed
        parsed_data['raw_text'] = raw_text 
        
        return parsed_data

