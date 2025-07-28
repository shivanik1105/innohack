import unittest
from src.verification.verifier import IdVerifier

class TestIdVerifier(unittest.TestCase):

    def setUp(self):
        self.verifier = IdVerifier()

    def test_verify_id_valid(self):
        extracted_text = "John Doe\n123456789\n01/01/1990"
        result = self.verifier.verify_id(extracted_text)
        self.assertTrue(result)

    def test_verify_id_invalid(self):
        extracted_text = "Jane Doe\n987654321\nInvalidDate"
        result = self.verifier.verify_id(extracted_text)
        self.assertFalse(result)

    def test_validate_format_valid(self):
        id_data = "John Doe\n123456789\n01/01/1990"
        result = self.verifier.validate_format(id_data)
        self.assertTrue(result)

    def test_validate_format_invalid(self):
        id_data = "InvalidData"
        result = self.verifier.validate_format(id_data)
        self.assertFalse(result)

if __name__ == '__main__':
    unittest.main()