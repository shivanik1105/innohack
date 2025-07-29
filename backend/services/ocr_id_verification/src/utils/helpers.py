import cv2
import numpy as np
import re

def preprocess_image_from_streamlit(uploaded_file):
    """Enhanced image preprocessing for better OCR accuracy"""
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image from uploaded file.")

    # Get original dimensions
    height, width = img.shape[:2]

    # Resize while maintaining aspect ratio (larger size for better OCR)
    max_dimension = 1200
    if max(height, width) > max_dimension:
        scale = max_dimension / max(height, width)
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)

    # Apply adaptive thresholding for better text extraction
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Apply morphological operations to clean up the image
    kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)

    # Apply dilation to make text thicker and more readable
    kernel_dilate = np.ones((1, 1), np.uint8)
    final_image = cv2.dilate(cleaned, kernel_dilate, iterations=1)

    return final_image

def load_image(image_path):
    """Load image from file path"""
    import cv2
    image = cv2.imread(image_path)
    return image

def preprocess_image(image):
    """Basic image preprocessing"""
    import cv2
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)
    _, thresh_image = cv2.threshold(blurred_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh_image
