
import re

class FuzzyMatcher:

    def __init__(self, threshold = 0.85):
        self.threshold = threshold

    @staticmethod
    def get_ngrams(text, n):
        """Extract n-grams dari text (consecutive words)"""
        text = re.sub(r'[^\w\s]', '', text)
        words = text.split()
        result = [' '.join(words[i:i+n]) for i in range(len(words)-n+1)]
        return result

    def levenshtein_distance(self, word1, word2):
        """Hitung edit distance antara 2 string"""
        row, col = len(word1), len(word2)
        cache = [[float("inf")] * (col + 1) for _ in range(row + 1)]

        # Init boundaries
        for j in range(col + 1):
            cache[row][j] = col - j
        for i in range(row + 1):
            cache[i][col] = row - i

        # DP: bottom-up
        for i in range(row - 1, -1, -1):
            for j in range(col - 1, -1, -1):
                if word1[i] == word2[j]:
                    cache[i][j] = cache[i+1][j+1]
                else:
                    cache[i][j] = 1 + min(
                        cache[i + 1][j],    # delete
                        cache[i][j+1],      # insert
                        cache[i+1][j+1]     # replace
                    )
        return cache[0][0]


    def calculate_similarity(self, word1, word2):
        """Convert distance -> similarity score (0-1)"""
        distance = self.levenshtein_distance(word1, word2)
        max_len = max(len(word1), len(word2))

        if max_len == 0:
            return 1.0

        similarity = 1 - (distance / max_len)
        return similarity


    def fuzzy_search(self, keyword, cv_text, threshold=None):
        """
        Cari keyword di text pake fuzzy matching
        Returns: (count, matches) - matches = list of (similarity, phrase)
        """
        if threshold is None:
            threshold = self.threshold

        n = max(1, len(keyword.split()))
        ngrams = self.get_ngrams(cv_text, n)
        matches = []

        # Match n-grams
        for phrase in ngrams:
            similarity = self.calculate_similarity(keyword, phrase)
            if similarity >= threshold:
                matches.append((similarity, phrase))

        # Multi-word keyword: coba match juga tanpa spasi
        if ' ' in keyword:
            clean_keyword = keyword.replace(' ', '')
            single_words = self.get_ngrams(cv_text, 1)

            for word in single_words:
                similarity = self.calculate_similarity(clean_keyword, word)
                if similarity >= threshold:
                    # Avoid duplicates
                    is_duplicate = any(word in existing_match[1] for existing_match in matches)
                    if not is_duplicate:
                        matches.append((similarity, word))

        # Sort by similarity + dedupe
        matches.sort(reverse=True, key=lambda x: x[0])
        unique_matches = []
        seen_phrases = set()
        for sim, phrase in matches:
            if phrase not in seen_phrases:
                unique_matches.append((sim, phrase))
                seen_phrases.add(phrase)

        return len(unique_matches), unique_matches


# =========================== TESTING ===========================

def main():
    fm = FuzzyMatcher()

    tc = [
        ("re act", "react"),
        ("react", "recat"),
        ("react", "re act"),
        ("react", "react,"),
        ("react", "React"),
        ("rea ct nat ive", "react natve"),
        ("state line", "st0te line"),
        ("python dev", "pythons dev"),
        ("data analyst", "data analysis"),
        ("full stack", "full-stack")
    ]

    for i, (word1, word2) in enumerate(tc, 1):
        similarity = fm.calculate_similarity(word1, word2)
        print(f"Test case {i}: {word1} vs {word2}")
        print(f"Similarity={similarity:.4f}")


if __name__ == "__main__":
    main()
