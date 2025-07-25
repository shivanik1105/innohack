# OCR ID Verification Project

This project implements an Optical Character Recognition (OCR) system for ID verification. It processes images of IDs, extracts text, and verifies the extracted information against predefined criteria.

## Project Structure

```
ocr-id-verification
├── src
│   ├── main.py               # Entry point of the application
│   ├── ocr
│   │   └── processor.py      # Contains OcrProcessor class for image processing
│   ├── verification
│   │   └── verifier.py       # Contains IdVerifier class for ID verification
│   └── utils
│       └── helpers.py        # Utility functions for image handling
├── requirements.txt          # Project dependencies
├── README.md                 # Project documentation
└── tests
    └── test_verification.py   # Unit tests for ID verification
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ocr-id-verification.git
   cd ocr-id-verification
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

To run the OCR ID verification process, execute the following command:

```
python src/main.py
```

To use the Streamlit web frontend, execute:
```
streamlit run src/main.py
```
This will open a browser window where you can upload an ID image and view the verification result.

...

## OCR and ID Verification Process

1. **Image Processing**: The `OcrProcessor` class in `src/ocr/processor.py` handles the loading and preprocessing of images. It uses methods like `process_image(image_path)` to process the input image and `extract_text(image)` to extract text from the processed image.

2. **ID Verification**: The `IdVerifier` class in `src/verification/verifier.py` verifies the extracted text. It includes methods such as `verify_id(extracted_text)` to check the validity of the ID and `validate_format(id_data)` to ensure the ID data follows the correct format.

3. **Utilities**: Helper functions in `src/utils/helpers.py` assist with image loading and preprocessing tasks.

## Testing

Unit tests for the ID verification functionality are located in `tests/test_verification.py`. To run the tests, use:

```
pytest tests/test_verification.py
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.