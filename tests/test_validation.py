import unittest
from src.input_handler import validate_input, ValidationError

class TestValidation(unittest.TestCase):
    def test_valid_english_input(self):
        is_valid, text = validate_input("Hello, how are you?")
        self.assertTrue(is_valid)
        self.assertEqual(text, "Hello, how are you?")

    def test_empty_input_rejected(self):
        with self.assertRaises(ValidationError):
            validate_input("")
        with self.assertRaises(ValidationError):
            validate_input("    ")

    def test_non_latin_rejected(self):
        with self.assertRaises(ValidationError):
            validate_input("ನಮಸ್ಕಾರ")
        with self.assertRaises(ValidationError):
            validate_input("नमस्ते")

    def test_length_limit(self):
        long_text = "a" * 501
        with self.assertRaises(ValidationError):
            validate_input(long_text)

if __name__ == "__main__":
    unittest.main()
