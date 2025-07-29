import cv2
import easyocr
import re
import numpy as np

# Initialize the EasyOCR reader once
reader = easyocr.Reader(['en'])

def process_image(uploaded_file):
    """Process image from uploaded file"""
    pass

def extract_text_from_image(image):
    """Extract text from image using EasyOCR"""
    results = reader.readtext(image, detail=0, paragraph=False)
    return "\n".join(results)

def extract_id_fields(text):
    """Extract ID fields from text"""
    lines = text.split("\n")
    name = ""
    dob = ""
    id_number = ""

    # Extract Aadhaar number
    for line in lines:
        aadhaar_patterns = [
            r'\d{4}\s+\d{4}\s+\d{4}',
            r'\d{4}-\d{4}-\d{4}',
            r'\d{12}'
        ]

        for pattern in aadhaar_patterns:
            match = re.search(pattern, line)
            if match:
                number = re.sub(r'[^\d]', '', match.group())
                if len(number) == 12:
                    id_number = f"{number[:4]} {number[4:8]} {number[8:]}"
                    break

        if id_number:
            break

    return {
        "Name": name,
        "DOB": dob,
        "ID Number": id_number
    }
