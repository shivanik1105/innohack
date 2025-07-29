# def load_image(image_path):
#     import cv2
#     image = cv2.imread(image_path)
#     return image

# def preprocess_image(image):
#     import cv2
#     gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)
#     _, thresholded_image = cv2.threshold(blurred_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
#     return 

# import cv2
# import numpy as np

# def preprocess_image_from_streamlit(uploaded_file):
#     # Convert file-like object to numpy array
#     file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
#     img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

#     if img is None:
#         raise ValueError("Could not decode image from uploaded file.")

#     img = cv2.resize(img, (800, 600))
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     _, thresh = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

#     return thresh

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

    # Apply noise reduction
    denoised = cv2.medianBlur(gray, 3)

    # Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(denoised)

    # Apply Gaussian blur to smooth the image
    blurred = cv2.GaussianBlur(enhanced, (1, 1), 0)

    # Apply adaptive thresholding for better text extraction
    # This works better than global thresholding for varying lighting conditions
    thresh = cv2.adaptiveThreshold(
        blurred,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        2
    )

    # Optional: Apply morphological operations to clean up the image
    kernel = np.ones((1,1), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    return cleaned

def enhance_image_for_ocr(image):
    """Additional enhancement specifically for Aadhaar cards"""
    # Sharpen the image
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    sharpened = cv2.filter2D(image, -1, kernel)

    # Dilate text to make it more readable
    kernel = np.ones((1,1), np.uint8)
    dilated = cv2.dilate(sharpened, kernel, iterations=1)

    return dilated

