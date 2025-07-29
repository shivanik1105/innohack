import cv2
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def preprocess_image_from_streamlit(uploaded_file):
    """Enhanced image preprocessing for better OCR accuracy with advanced techniques"""
    logger.info("🖼️ Starting enhanced image preprocessing...")

    try:
        # Read file bytes
        file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image from uploaded file.")

        logger.info(f"📐 Original image dimensions: {img.shape[:2]}")

        # Get original dimensions
        height, width = img.shape[:2]

        # Enhanced resizing with better interpolation (increased max size for better OCR)
        max_dimension = 1500  # Increased from 1200 for better text clarity
        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
            logger.info(f"📏 Resized to: {new_height}x{new_width}")
        elif max(height, width) < 800:
            # Upscale small images for better OCR
            scale = 800 / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
            logger.info(f"📈 Upscaled to: {new_height}x{new_width}")

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) for better contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        logger.info("✨ Applied CLAHE contrast enhancement")

        # Apply bilateral filter to reduce noise while preserving edges
        filtered = cv2.bilateralFilter(enhanced, 9, 75, 75)
        logger.info("🔧 Applied bilateral filtering")

        # Apply Gaussian blur to reduce remaining noise
        blurred = cv2.GaussianBlur(filtered, (3, 3), 0)

        # Multiple thresholding approaches - try adaptive first
        thresh_adaptive = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Also try Otsu's thresholding as backup
        _, thresh_otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Combine both thresholding methods for better results
        thresh_combined = cv2.bitwise_and(thresh_adaptive, thresh_otsu)
        logger.info("🎯 Applied combined adaptive and Otsu thresholding")

        # Enhanced morphological operations
        # Use different kernel sizes for different operations
        kernel_close = np.ones((2, 2), np.uint8)  # For closing gaps
        kernel_open = np.ones((1, 1), np.uint8)   # For removing noise

        # Close small gaps in text
        closed = cv2.morphologyEx(thresh_combined, cv2.MORPH_CLOSE, kernel_close)

        # Remove small noise
        opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel_open)

        logger.info("🧹 Applied morphological operations")

        # Apply slight dilation to make text more readable
        kernel_dilate = np.ones((1, 1), np.uint8)
        final_image = cv2.dilate(opened, kernel_dilate, iterations=1)

        logger.info("✅ Image preprocessing completed successfully")
        return final_image

    except Exception as e:
        logger.error(f"❌ Error in image preprocessing: {str(e)}")
        raise

def load_image(image_path):
    """Load image from file path with error handling"""
    try:
        logger.info(f"📂 Loading image from: {image_path}")
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        logger.info(f"✅ Image loaded successfully: {image.shape}")
        return image
    except Exception as e:
        logger.error(f"❌ Error loading image: {str(e)}")
        raise

def preprocess_image(image):
    """Enhanced basic image preprocessing with multiple techniques"""
    logger.info("🔧 Starting basic image preprocessing...")

    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray_image = image.copy()

        # Apply CLAHE for better contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray_image)

        # Apply Gaussian blur
        blurred_image = cv2.GaussianBlur(enhanced, (5, 5), 0)

        # Apply Otsu's thresholding
        _, thresh_image = cv2.threshold(blurred_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        logger.info("✅ Basic preprocessing completed")
        return thresh_image

    except Exception as e:
        logger.error(f"❌ Error in basic preprocessing: {str(e)}")
        raise

def validate_image_quality(image):
    """Validate if image quality is sufficient for OCR"""
    logger.info("🔍 Validating image quality...")

    try:
        if image is None:
            return False, "Image is None"

        height, width = image.shape[:2]

        # Check minimum dimensions
        if height < 100 or width < 100:
            return False, f"Image too small: {width}x{height} (minimum 100x100)"

        # Check if image is too blurry using Laplacian variance
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        if laplacian_var < 100:  # Threshold for blur detection
            return False, f"Image appears blurry (variance: {laplacian_var:.2f})"

        logger.info(f"✅ Image quality validation passed (variance: {laplacian_var:.2f})")
        return True, "Image quality is acceptable"

    except Exception as e:
        logger.error(f"❌ Error validating image quality: {str(e)}")
        return False, f"Error validating image: {str(e)}"

def enhance_text_regions(image):
    """Enhance text regions in the image for better OCR"""
    logger.info("📝 Enhancing text regions...")

    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()

        # Apply morphological operations to enhance text
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))

        # Top-hat transform to enhance text
        tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)

        # Add the top-hat result to the original image
        enhanced = cv2.add(gray, tophat)

        # Apply sharpening filter
        kernel_sharpen = np.array([[-1,-1,-1],
                                  [-1, 9,-1],
                                  [-1,-1,-1]])
        sharpened = cv2.filter2D(enhanced, -1, kernel_sharpen)

        logger.info("✅ Text regions enhanced")
        return sharpened

    except Exception as e:
        logger.error(f"❌ Error enhancing text regions: {str(e)}")
        return image  # Return original image if enhancement fails
