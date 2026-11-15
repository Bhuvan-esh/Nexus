import unittest
from src.tokenizer import tokenize, compute_sha256
from src.transliteration import transliterate

class TestSpans(unittest.TestCase):
    def test_url_preserved_byte_exact(self):
        url = "https://example.com/test?id=123"
        tokens = tokenize(f"Visit {url} now")
        url_tok = [t for t in tokens if t.is_protected and t.kind == "url"]
        self.assertEqual(len(url_tok), 1)
        self.assertEqual(url_tok[0].text, url)
        self.assertEqual(url_tok[0].sha256, compute_sha256(url))

        result = transliterate(f"Visit {url} now")
        self.assertIn(url, result["output"])
        self.assertGreaterEqual(result["summary"]["protected"], 1)
        self.assertEqual(result["summary"]["altered"], 0)

    def test_email_preserved_byte_exact(self):
        email = "contact@nexus.org"
        tokens = tokenize(f"Write to {email}")
        email_tok = [t for t in tokens if t.is_protected and t.kind == "email"]
        self.assertEqual(len(email_tok), 1)
        self.assertEqual(email_tok[0].text, email)
        self.assertEqual(email_tok[0].sha256, compute_sha256(email))

if __name__ == "__main__":
    unittest.main()
