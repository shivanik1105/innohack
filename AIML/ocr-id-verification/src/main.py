# # # from ocr.processor import OcrProcessor
# # # from verification.verifier import IdVerifier
# # # from utils.helpers import load_image, preprocess_image

# # # def main():
# # #     image_path = input("Enter the path to the ID image: ")
    
# # #     # Load and preprocess the image
# # #     image = load_image(image_path)
# # #     processed_image = preprocess_image(image)
    
# # #     # Initialize OCR processor and extract text
# # #     ocr_processor = OcrProcessor()
# # #     extracted_text = ocr_processor.process_image(processed_image)
    
# # #     # Initialize ID verifier and verify extracted text
# # #     id_verifier = IdVerifier()
# # #     if id_verifier.verify_id(extracted_text):
# # #         print("ID verification successful.")
# # #     else:
# # #         print("ID verification failed.")

# # # if __name__ == "__main__":
# # #     main()

# # import streamlit as st
# # import numpy as np
# # import cv2
# # from ocr.processor import OcrProcessor
# # from verification.verifier import IdVerifier

# # st.title("ID Verification OCR")

# # uploaded_file = st.file_uploader("Upload your ID image", type=["jpg", "jpeg", "png"])
# # if uploaded_file is not None:
# #     file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
# #     image = cv2.imdecode(file_bytes, 1)
# #     st.image(image, caption="Uploaded Image", use_column_width=True)

# #     ocr_processor = OcrProcessor()
# #     processed_image = ocr_processor.process_image(uploaded_file.name)
# #     st.image(processed_image, caption="Processed Image", use_column_width=True, channels="GRAY")

# #     extracted_text = ocr_processor.extract_text(processed_image)
# #     st.text_area("Extracted Text", extracted_text, height=150)

# #     id_verifier = IdVerifier()
# #     if id_verifier.verify_id(extracted_text):
# #         st.success("Verification Result: Secure")
# #     else:
# #         st.error("Verification Result: Suspicious")

# import streamlit as st
# from ocr import processor as ocr_processor
# import cv2
# from PIL import Image

# st.title("OCR ID Verification")

# uploaded_file = st.file_uploader("Upload your ID image", type=['jpg', 'jpeg', 'png'])

# if uploaded_file is not None:
#     st.image(uploaded_file, caption="Uploaded Image", use_container_width=True)

#     try:
#         processed_image = ocr_processor.process_image(uploaded_file)
#         st.image(processed_image, caption="Preprocessed Image", channels="GRAY", use_container_width=True)

#         # You can run OCR here and show results if needed
#         # text = pytesseract.image_to_string(processed_image)
#         # st.text_area("Extracted Text", text)

#     except Exception as e:
#         st.error(f"Error: {str(e)}")

import streamlit as st
from ocr import processor as ocr_processor
import cv2
from PIL import Image

st.set_page_config(page_title="OCR ID Verification", layout="centered")
st.title("🧾 OCR-Based ID Verification for Blue Collar Workers")

uploaded_file = st.file_uploader("📤 Upload your ID image", type=['jpg', 'jpeg', 'png'])

if uploaded_file is not None:
    st.image(uploaded_file, caption="📎 Uploaded Image", use_container_width=True)

    try:
        processed_image = ocr_processor.process_image(uploaded_file)
        st.image(processed_image, caption="🧪 Preprocessed Image", channels="GRAY", use_container_width=True)

        # OCR and Display
        st.subheader("📄 Extracted Text")
        text = ocr_processor.extract_text_from_image(processed_image)
        st.text_area("Raw OCR Output", text, height=200)

        # Parse Fields
        st.subheader("🔍 Detected ID Fields")
        fields = ocr_processor.extract_id_fields(text)
        st.write(fields)

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")

