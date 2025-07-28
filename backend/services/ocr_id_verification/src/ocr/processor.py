from services.ocr_id_verification.src.utils.helpers import preprocess_image_from_streamlit
import easyocr
import re
class OcrService:
    def process_image(self, image_path):
        import cv2
        from utils.helpers import load_image, preprocess_image
        
        image = load_image(image_path)
        processed_image = preprocess_image(image)
        return processed_image

    def extract_text(self, image):
        import pytesseract
        
        text = pytesseract.image_to_string(image)
        return text.strip()


reader = easyocr.Reader(['en'])

def process_image(uploaded_file):
    return preprocess_image_from_streamlit(uploaded_file)

def extract_text_from_image(image):
    results = reader.readtext(image, detail=0)
    # Ensure all items are strings (in case of unexpected data)
    results = [str(item) for item in results if item is not None]
    full_text = " \n ".join(results)
    return full_text

def extract_id_fields(text):
    lines = text.split("\n")
    name = ""
    dob = ""
    id_number = ""

    for line in lines:
        # Try to find DOB
        if "DOB" in line or "D.O.B" in line or re.search(r'\d{2}/\d{2}/\d{4}', line):
            dob_match = re.search(r'\d{2}/\d{2}/\d{4}', line)
            if dob_match:
                dob = dob_match.group(0)

        # Try to find ID Number (e.g., 12-digit Aadhaar number)
        if re.fullmatch(r'\d{4} \d{4} \d{4}', line.strip()):
            id_number = line.strip()

        # Assume name is capital letters without numbers
        if not name and re.match(r'^[A-Z ]{3,}$', line.strip()) and not any(char.isdigit() for char in line):
            name = line.strip()

    return {
        "Name": name,
        "DOB": dob,
        "ID Number": id_number
    }

